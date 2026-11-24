import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { runSuite } from './check.mjs'
import { DIST, startServer } from './serve.mjs'

/** The four widths of AC-03. Heights are typical for each class of device. */
export const VIEWPORTS = {
  phone: { name: 'phone', width: 360, height: 800 },
  tablet: { name: 'tablet', width: 768, height: 1024 },
  desktop: { name: 'desktop', width: 1280, height: 800 },
  wide: { name: 'wide', width: 1920, height: 1080 },
}

/** Setup problems (missing build, missing browser) are not check failures: they exit with code 2. */
export class SetupError extends Error {
  name = 'SetupError'
}

async function launchBrowser() {
  try {
    return await chromium.launch()
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error)
    throw new SetupError(`Could not start Chromium (${reason}).\nInstall it once with: npx playwright install chromium`)
  }
}

/**
 * Opens a page in its own browser context.
 * @param {import('playwright').Browser} browser
 * @param {string} base
 * @param {object} [options]
 * @param {{ width: number, height: number }} [options.viewport]
 * @param {'light' | 'dark'} [options.colorScheme] The system preference.
 * @param {'reduce' | 'no-preference'} [options.reducedMotion]
 * @param {boolean} [options.javaScriptEnabled]
 * @param {{ fn: (arg: any) => void, arg?: unknown }[]} [options.initScripts] Run before any page script.
 */
export async function openPage(browser, base, options = {}) {
  const { viewport = VIEWPORTS.desktop, colorScheme = 'light', reducedMotion = 'no-preference', javaScriptEnabled = true, initScripts = [] } = options
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    colorScheme,
    reducedMotion,
    javaScriptEnabled,
  })
  for (const { fn, arg } of initScripts) await context.addInitScript(fn, arg)
  const page = await context.newPage()

  /** Console warnings and errors, uncaught exceptions and failed requests. A clean page has none. */
  const problems = []
  /** Requests that left the site's own origin. The portfolio makes none. */
  const crossOrigin = []
  const origin = new URL(base).origin
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') problems.push(`console ${message.type()}: ${message.text().slice(0, 200)}`)
  })
  page.on('pageerror', (error) => problems.push(`uncaught: ${error.message.slice(0, 200)}`))
  page.on('requestfailed', (request) => problems.push(`request failed: ${request.url()}`))
  page.on('request', (request) => {
    const { protocol, origin: requestOrigin } = new URL(request.url())
    if ((protocol === 'http:' || protocol === 'https:') && requestOrigin !== origin) crossOrigin.push(request.url())
  })

  return {
    page,
    problems,
    crossOrigin,
    /** Loads a path of the site and waits for the network to settle. Returns the response. */
    async goto(route = '/') {
      const response = await page.goto(new URL(`.${route}`, base).href, { waitUntil: 'networkidle' })
      if (!response) throw new SetupError(`No response for ${route}`)
      return response
    },
    close: () => context.close(),
  }
}

/** Runs `fn` with a static server over `dist/` (or `VERIFY_BASE`, to test a dev server or a Deploy Preview) and a browser. */
export async function withSite(fn) {
  const external = process.env.VERIFY_BASE
  if (!external && !fs.existsSync(path.join(DIST, 'index.html'))) {
    throw new SetupError('dist/index.html not found. Build the site first with: npm run generate')
  }
  const server = external ? null : await startServer()
  const base = external ?? server.base
  let browser
  try {
    browser = await launchBrowser()
    return await fn({ base, open: (options) => openPage(browser, base, options) })
  } finally {
    await browser?.close()
    await server?.close()
  }
}

/** Entry point of a suite script. Exit code: 0 all passed, 1 a check failed, 2 the suite could not run. */
export async function main(name, body) {
  try {
    const result = await withSite((site) => runSuite(name, (t) => body(t, site)))
    process.exitCode = result.failed ? 1 : 0
  } catch (error) {
    console.error(`\nverify:${name} could not run: ${error instanceof Error ? error.message : error}`)
    process.exitCode = 2
  }
}

/** The RGB of a CSS color as the browser paints it (a canvas converts `oklch()` and friends). */
export function paintedColor(page, selector, property) {
  return page.evaluate(
    ({ selector, property }) => {
      const element = document.querySelector(selector)
      if (!element) return null
      const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
      context.fillStyle = getComputedStyle(element).getPropertyValue(property)
      context.fillRect(0, 0, 1, 1)
      return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3)
    },
    { selector, property },
  )
}
