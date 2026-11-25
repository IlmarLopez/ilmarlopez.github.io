// The nav's anchors and its "you are here" (M-16, M-17): the links glide, the link of the section on screen is
// marked with aria-current and a coral line, and a click is reflected even where the page cannot scroll far enough
// to bring the section to the top. That last case is the one Ilmar hit: a tall window where the links seemed dead.
import { eventually, main, VIEWPORTS } from './lib/browser.mjs'
import { assertEqual, soft } from './lib/check.mjs'
import { flyTo } from './lib/journey.mjs'

/** A window much taller than the sections after the journey, so the page cannot scroll Work or Tools to the top. */
const TALL = { name: 'tall', width: 1280, height: 3000 }
/** One where Tools and Contact are both on screen at the end of the page: the bottom of the page says "Contact"
 * while the visitor asked for "Tools". This one caught the intent being dropped when the glide passed through Tools. */
const MEDIUM_TALL = { name: 'medium-tall', width: 1280, height: 2000 }
/** `html { scroll-padding-top }`: where an anchor puts its target below the top edge. */
const ANCHOR_OFFSET = 96

const LINK = (label) => `nav[aria-label="Primary"] a:text-is("${label}")`
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** The labels of the links marked as current. At most one is expected. */
const marked = (page) =>
  page.evaluate(() => [...document.querySelectorAll('nav[aria-label="Primary"] a[aria-current]')].map((a) => a.textContent?.trim()))

/** Waits for the marked link to settle on `labels` and returns what it found. */
const markedBecomes = (page, labels, timeout = 3000) => eventually(() => marked(page), labels, { timeout })

/** Whether the coral line sits under the marked link, as wide as the link, once its slide has finished. */
const lineIsUnder = (page) =>
  page.evaluate(() => {
    const line = document.querySelector('.nav-ind')
    const link = document.querySelector('nav[aria-label="Primary"] a[aria-current]')
    if (!line || !link) return false
    const l = line.getBoundingClientRect()
    const a = link.getBoundingClientRect()
    return (
      line.hasAttribute('data-on') &&
      getComputedStyle(line).opacity === '1' &&
      Math.abs(l.left - a.left) <= 1.5 &&
      Math.abs(l.width - a.width) <= 1.5 &&
      Math.abs(l.top - (a.bottom - 2)) <= 1.5
    )
  })

/** Waits until the page has stopped scrolling (two reads 250 ms apart agree) and returns where it stopped. A glide
 * to the end of the page takes over a second, and what the nav shows on its last frame is what counts. */
async function scrollSettles(page) {
  let previous = -1
  for (let i = 0; i < 80; i += 1) {
    const y = await page.evaluate(() => Math.round(scrollY))
    if (y === previous) return y
    previous = y
    await sleep(250)
  }
  throw new Error('the page never stopped scrolling')
}

const top = (page, id) => page.evaluate((target) => Math.round(document.getElementById(target).getBoundingClientRect().top), id)

/** Puts a section at the anchor offset without gliding, as a visitor who scrolled there would. */
const scrollToSection = (page, id) =>
  page.evaluate(
    ({ target, offset }) => window.scrollTo({ top: document.getElementById(target).getBoundingClientRect().top + scrollY - offset, behavior: 'instant' }),
    { target: id, offset: ANCHOR_OFFSET },
  )

await main('anchors', async (t, { open }) => {
  await t.check('with motion allowed the anchors glide to the section; with reduced motion they jump', async () => {
    for (const { reducedMotion, behavior } of [
      { reducedMotion: 'no-preference', behavior: 'smooth' },
      { reducedMotion: 'reduce', behavior: 'auto' },
    ]) {
      const site = await open({ viewport: VIEWPORTS.desktop, reducedMotion })
      try {
        await site.goto('/')
        const css = await site.page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)
        await site.page.click(LINK('Work'))
        const right = await top(site.page, 'work')
        await sleep(1200)
        const arrived = await top(site.page, 'work')
        const s = soft()
        s.equal(css, behavior, `${reducedMotion}: scroll-behavior`)
        if (behavior === 'smooth') s.ok(right > 150, `${reducedMotion}: right after the click Work is still ${right}px from the top: the page glides`)
        else s.ok(Math.abs(right - ANCHOR_OFFSET) <= 2, `${reducedMotion}: right after the click Work is at ${right}px: the page jumped`)
        s.ok(Math.abs(arrived - ANCHOR_OFFSET) <= 2, `${reducedMotion}: Work ends ${arrived}px from the top (expected ${ANCHOR_OFFSET})`)
        s.equal(site.problems, [], `${reducedMotion}: console problems`)
        s.done()
      } finally {
        await site.close()
      }
    }
  })

  await t.check('each click marks its link (aria-current="location") and slides the coral line under it', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.goto('/')
      const s = soft()
      s.equal(await marked(site.page), [], 'at the top of the page, over the hero, nothing is marked')
      s.equal(await site.page.evaluate(() => document.querySelector('.nav-ind')?.hasAttribute('data-on')), false, 'and the line is not shown')
      for (const label of ['Work', 'Tools', 'Contact', 'Experience', 'Work']) {
        await site.page.click(LINK(label))
        s.equal(await markedBecomes(site.page, [label]), [label], `after clicking ${label}`)
        s.equal(await eventually(() => lineIsUnder(site.page), true), true, `after clicking ${label}: the line is under it, as wide as the link`)
      }
      s.equal(await site.page.evaluate(() => document.querySelector('nav[aria-label="Primary"] a[aria-current]')?.getAttribute('aria-current')), 'location', 'the value is "location"')
      s.equal(site.problems, [], 'console problems')
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('a link that has focus and gets Enter behaves like a click', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.goto('/')
      await site.page.focus(LINK('Tools'))
      await site.page.keyboard.press('Enter')
      assertEqual(await markedBecomes(site.page, ['Tools']), ['Tools'], 'marked after Enter on Tools')
    } finally {
      await site.close()
    }
  })

  for (const viewport of [TALL, MEDIUM_TALL]) {
    await t.check(`in a ${viewport.height}px-tall window, where the page cannot scroll the section to the top, a click is still reflected`, async () => {
      const site = await open({ viewport })
      try {
        await site.goto('/')
        const s = soft()
        for (const label of ['Tools', 'Contact', 'Work', 'Tools']) {
          await site.page.click(LINK(label))
          s.equal(await markedBecomes(site.page, [label]), [label], `after clicking ${label}`)
          await scrollSettles(site.page)
          await sleep(100)
          s.equal(await marked(site.page), [label], `${label} is still the one marked once the page has stopped scrolling`)
        }
        s.equal(site.problems, [], 'console problems')
        s.done()
      } finally {
        await site.close()
      }
    })
  }

  await t.check('in the tallest window Tools is out of reach of the top and of the reading line, and a wheel turn hands over to the page', async () => {
    const site = await open({ viewport: TALL })
    try {
      await site.goto('/')
      await site.page.click(LINK('Tools'))
      await markedBecomes(site.page, ['Tools'])
      await scrollSettles(site.page)
      await sleep(100)
      // The window really is the awkward case: Tools could not reach the top, and the reading line is above it.
      const geometry = await site.page.evaluate(() => ({
        toolsTop: Math.round(document.getElementById('tools').getBoundingClientRect().top),
        line: Math.round(innerHeight * 0.45),
      }))
      const s = soft()
      s.ok(geometry.toolsTop > 200, `Tools could not be brought to the top (it is ${geometry.toolsTop}px below it), so this window exercises the click intent`)
      s.ok(geometry.toolsTop > geometry.line, `and Tools is below the reading line (${geometry.line}px), so the page alone would not mark it`)
      s.equal(await marked(site.page), ['Tools'], 'yet Tools is the one marked')
      await site.page.mouse.move(640, 1500)
      await site.page.mouse.wheel(0, -60)
      s.equal(await markedBecomes(site.page, ['Work']), ['Work'], 'a wheel turn drops the intent and the page decides: Work')
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('while flying, Experience is marked from the first role on and stays until the flight ends', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.goto('/')
      const s = soft()
      for (const [progress, expected] of [
        [0, []],
        [0.08, []],
        [0.25, ['Experience']],
        [0.5, ['Experience']],
        [1, ['Experience']],
        [0.05, []],
      ]) {
        await flyTo(site.page, progress)
        s.equal(await markedBecomes(site.page, expected, 2000), expected, `flight at ${progress}`)
      }
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('reading down the page marks Work, Tools and Contact; About, which has no link, marks nothing', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.goto('/')
      const s = soft()
      for (const [id, expected] of [
        ['about', []],
        ['work', ['Work']],
        ['tools', ['Tools']],
        ['contact', ['Contact']],
        ['about', []],
      ]) {
        await scrollToSection(site.page, id)
        s.equal(await markedBecomes(site.page, expected, 2000), expected, `with #${id} at the anchor offset`)
      }
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('at the very end of the page the last link is marked', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.goto('/')
      await site.page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
      assertEqual(await markedBecomes(site.page, ['Contact']), ['Contact'], 'marked at the bottom')
    } finally {
      await site.close()
    }
  })

  await t.check('opening the page at a hash marks that link, even where the page cannot scroll to it', async () => {
    for (const [viewport, hash, label] of [
      [VIEWPORTS.desktop, '#work', 'Work'],
      [TALL, '#tools', 'Tools'],
    ]) {
      const site = await open({ viewport })
      try {
        await site.goto(`/${hash}`)
        assertEqual(await markedBecomes(site.page, [label]), [label], `${viewport.name}: opened at ${hash}`)
      } finally {
        await site.close()
      }
    }
  })

  await t.check('at 768 px and below, where the links are hidden, so is the line', async () => {
    const site = await open({ viewport: VIEWPORTS.tablet })
    try {
      await site.goto('/')
      await scrollToSection(site.page, 'work')
      await sleep(300)
      const shown = await site.page.evaluate(() => Boolean(document.querySelector('.nav-ind')?.offsetParent))
      assertEqual(shown, false, 'the line is not rendered')
    } finally {
      await site.close()
    }
  })

  await t.check('without JS nothing is marked and the line is not shown; the links still work as plain anchors', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop, javaScriptEnabled: false })
    try {
      await site.goto('/')
      await site.page.click(LINK('Tools'))
      // The anchor glides too (it is CSS), and the journey above Tools is thousands of pixels tall.
      await sleep(1500)
      const found = await site.page.evaluate(() => ({
        marked: document.querySelectorAll('nav[aria-label="Primary"] [aria-current]').length,
        lineOn: document.querySelector('.nav-ind')?.hasAttribute('data-on'),
        toolsTop: Math.round(document.getElementById('tools').getBoundingClientRect().top),
      }))
      const s = soft()
      s.equal(found.marked, 0, 'links marked')
      s.equal(found.lineOn, false, 'line shown')
      s.ok(Math.abs(found.toolsTop - ANCHOR_OFFSET) <= 2, `the anchor still lands: Tools is ${found.toolsTop}px from the top`)
      s.done()
    } finally {
      await site.close()
    }
  })
})
