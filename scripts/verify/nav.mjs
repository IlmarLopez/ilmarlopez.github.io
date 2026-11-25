// T-22: the sticky nav and the theme switch. Covers RF-02 (nav), RF-12 (theme) and M-07 (crossfade).
// The marked link and the anchors' gliding are in anchors.mjs.
import { eventually, main, paintedColor, VIEWPORTS } from './lib/browser.mjs'
import { assertEqual, assertOk, soft } from './lib/check.mjs'

const PAPER = { light: [0xf4, 0xf7, 0xfb], dark: [0x09, 0x0d, 0x14] }
const COLOR = { light: '#f4f7fb', dark: '#090d14' }
const BOTH_COLORS = [COLOR.light, COLOR.dark]
const SECTION_LINKS = [
  ['Experience', '/#experience'],
  ['Work', '/#work'],
  ['Tools', '/#tools'],
  ['Contact', '/#contact'],
]

const near = (a, b) => a.every((value, i) => Math.abs(value - b[i]) <= 2)

/** Counts calls to `document.startViewTransition` and forwards them, or removes the API to test the fallback. */
function watchViewTransitions({ remove }) {
  window.__viewTransitions = 0
  const original = document.startViewTransition?.bind(document)
  if (remove || !original) {
    Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true })
    return
  }
  document.startViewTransition = (callback) => {
    window.__viewTransitions += 1
    return original(callback)
  }
}

const state = (page) =>
  page.evaluate(() => ({
    theme: document.documentElement.getAttribute('data-theme'),
    saved: localStorage.getItem('theme'),
    label: document.querySelector('.theme-switch')?.innerText.replace(/^Switch to\s*/, '').trim(),
  }))

const themeColors = (page) => page.evaluate(() => [...document.querySelectorAll('meta[name="theme-color"]')].map((meta) => meta.content))

/** theme-color after hydration: poll until it settles, then confirm it stays (Unhead must not revert it). */
async function settledThemeColors(page, expected) {
  const first = await eventually(() => themeColors(page), expected)
  await page.waitForTimeout(400)
  const again = await themeColors(page)
  return JSON.stringify(first) === JSON.stringify(again) ? again : { first, again }
}

const paper = (page) => paintedColor(page, 'body', 'background-color')

await main('nav', async (t, { open }) => {
  await t.check('the nav is sticky: it stays at the top of the viewport while the page scrolls', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.goto('/')
      await site.page.evaluate(() => {
        const filler = document.createElement('div')
        filler.style.height = '3000px'
        document.querySelector('main').append(filler)
      })
      // `behavior: 'instant'`: the page glides to anchors (M-16), and this reads the position right away.
      await site.page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }))
      const found = await site.page.evaluate(() => {
        const nav = document.querySelector('header')
        return { position: getComputedStyle(nav).position, top: Math.round(nav.getBoundingClientRect().top), scrolled: Math.round(window.scrollY) }
      })
      const s = soft()
      s.equal(found.scrolled, 1500, 'the page scrolled')
      s.equal(found.position, 'sticky', 'nav position')
      s.equal(found.top, 0, 'nav top edge while scrolled')
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('at 1280 px the nav has the wordmark, four section links in order and the switch', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.goto('/')
      const found = await site.page.evaluate(() => ({
        wordmark: document.querySelector('header a[href="/"]')?.textContent,
        links: [...document.querySelectorAll('nav[aria-label="Primary"] a')].map((a) => [a.textContent, a.getAttribute('href')]),
        switchShown: Boolean(document.querySelector('.theme-switch')?.offsetParent),
      }))
      const s = soft()
      s.equal(found.wordmark, 'Ilmar Lopez', 'wordmark')
      s.equal(found.links, SECTION_LINKS, 'section links [label, href]')
      s.equal(found.switchShown, true, 'the switch is visible')
      s.done()
    } finally {
      await site.close()
    }
  })

  for (const viewport of [VIEWPORTS.tablet, VIEWPORTS.phone]) {
    await t.check(`at ${viewport.width} px only the wordmark and the switch remain, with no horizontal scroll`, async () => {
      const site = await open({ viewport })
      try {
        await site.goto('/')
        const found = await site.page.evaluate(() => ({
          shownLinks: [...document.querySelectorAll('nav[aria-label="Primary"] a')].filter((a) => a.offsetParent).map((a) => a.textContent),
          wordmarkShown: Boolean(document.querySelector('header a[href="/"]')?.offsetParent),
          switchShown: Boolean(document.querySelector('.theme-switch')?.offsetParent),
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          gutter: Math.round(document.querySelector('header .site-container').getBoundingClientRect().left + parseFloat(getComputedStyle(document.querySelector('header .site-container')).paddingLeft)),
        }))
        const s = soft()
        s.equal(found.shownLinks, [], 'visible section links')
        s.equal([found.wordmarkShown, found.switchShown], [true, true], 'wordmark and switch visible')
        s.equal(found.overflow, 0, 'horizontal overflow in px')
        // The content starts at the gutter of its breakpoint: 24 px up to 60rem, 16 px up to 40rem.
        s.equal(found.gutter, viewport.width <= 640 ? 16 : 24, 'left edge of the nav content (the --gutter of this width)')
        s.done()
      } finally {
        await site.close()
      }
    })
  }

  for (const { system, flipsTo } of [
    { system: 'light', flipsTo: 'dark' },
    { system: 'dark', flipsTo: 'light' },
  ]) {
    await t.check(`system ${system}, nothing saved: the switch offers ${flipsTo}, saves it, and it survives a reload and a second click`, async () => {
      const site = await open({ colorScheme: system })
      try {
        await site.goto('/')
        const before = await state(site.page)
        const s = soft()
        s.equal(before, { theme: null, saved: null, label: flipsTo === 'dark' ? 'Dark' : 'Light' }, `before clicking (label names the theme it switches to)`)
        s.done()

        await site.page.click('.theme-switch')
        await eventually(() => state(site.page).then((value) => value.theme), flipsTo)
        const after = await state(site.page)
        assertEqual([after.theme, after.saved], [flipsTo, flipsTo], 'data-theme and localStorage after the first click')
        assertOk(near(await paper(site.page), PAPER[flipsTo]), `body background after the click: expected rgb(${PAPER[flipsTo]}), received rgb(${await paper(site.page)})`)

        await site.page.reload({ waitUntil: 'networkidle' })
        const reloaded = await state(site.page)
        assertEqual([reloaded.theme, reloaded.saved], [flipsTo, flipsTo], 'data-theme and localStorage after a reload')
        assertOk(near(await paper(site.page), PAPER[flipsTo]), 'body background after a reload')

        await site.page.click('.theme-switch')
        await eventually(() => state(site.page).then((value) => value.theme), system)
        const back = await state(site.page)
        assertEqual([back.theme, back.saved], [system, system], 'data-theme and localStorage after the second click')
        assertEqual(site.problems, [], 'console problems')
      } finally {
        await site.close()
      }
    })
  }

  await t.check('the page crossfades through a view transition, and the toggle still works when the browser has none', async () => {
    for (const { remove, expectedCalls } of [
      { remove: false, expectedCalls: 1 },
      { remove: true, expectedCalls: 0 },
    ]) {
      const site = await open({ initScripts: [{ fn: watchViewTransitions, arg: { remove } }] })
      try {
        await site.goto('/')
        await site.page.click('.theme-switch')
        await eventually(() => state(site.page).then((value) => value.theme), 'dark')
        const found = { ...(await state(site.page)), transitions: await site.page.evaluate(() => window.__viewTransitions) }
        const mode = remove ? 'without startViewTransition' : 'with startViewTransition'
        assertEqual([found.theme, found.transitions], ['dark', expectedCalls], `${mode}: data-theme and view transitions started`)
      } finally {
        await site.close()
      }
    }
  })

  await t.check('with reduced motion the theme changes at once and no view transition starts', async () => {
    const site = await open({ reducedMotion: 'reduce', initScripts: [{ fn: watchViewTransitions, arg: { remove: false } }] })
    try {
      await site.goto('/')
      // No waiting: the change must already be there when the click returns.
      const found = await site.page.evaluate(() => {
        document.querySelector('.theme-switch').click()
        return { theme: document.documentElement.getAttribute('data-theme'), transitions: window.__viewTransitions }
      })
      assertEqual(found, { theme: 'dark', transitions: 0 }, 'right after the click: data-theme and view transitions started')
    } finally {
      await site.close()
    }
  })

  await t.check('theme-color matches the saved theme after hydration, and again after a click and a reload', async () => {
    const site = await open({ colorScheme: 'light' })
    try {
      await site.goto('/')
      assertEqual(await settledThemeColors(site.page, BOTH_COLORS), BOTH_COLORS, 'nothing saved: each meta carries its own scheme')

      await site.page.click('.theme-switch')
      assertEqual(await settledThemeColors(site.page, [COLOR.dark, COLOR.dark]), [COLOR.dark, COLOR.dark], 'after clicking to dark: both metas carry the dark color')

      await site.page.reload({ waitUntil: 'networkidle' })
      assertEqual(await settledThemeColors(site.page, [COLOR.dark, COLOR.dark]), [COLOR.dark, COLOR.dark], 'after reloading with dark saved, once hydrated')

      await site.page.click('.theme-switch')
      assertEqual(await settledThemeColors(site.page, [COLOR.light, COLOR.light]), [COLOR.light, COLOR.light], 'after clicking back to light: both metas carry the light color')
      assertEqual(site.problems, [], 'console problems')
    } finally {
      await site.close()
    }
  })

  await t.check('without JS the page keeps the wordmark and links but does not offer a switch that would do nothing', async () => {
    const site = await open({ javaScriptEnabled: false })
    try {
      await site.goto('/')
      const found = await site.page.evaluate(() => ({
        wordmark: Boolean(document.querySelector('header a[href="/"]')?.offsetParent),
        links: [...document.querySelectorAll('nav[aria-label="Primary"] a')].filter((a) => a.offsetParent).length,
        switchShown: Boolean(document.querySelector('.theme-switch')?.offsetParent),
        pageShown: document.body.getBoundingClientRect().height > 0,
      }))
      assertEqual(found, { wordmark: true, links: 4, switchShown: false, pageShown: true }, 'with JavaScript off')
    } finally {
      await site.close()
    }
  })
})
