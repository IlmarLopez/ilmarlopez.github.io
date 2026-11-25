// The home after the journey (T-26 to T-32): About with the photo, Work, Tools, Contact and the footer.
// AC-02 (plain list without JS), AC-14 (the photo), RF-05, RF-07, RF-08, RF-09 and RF-11.
import fs from 'node:fs'
import { main, VIEWPORTS } from './lib/browser.mjs'
import { assertEqual, soft } from './lib/check.mjs'

const PROJECTS = [
  { name: 'Self-hosted analytics on AWS', stack: 'Go, AWS CDK', layers: ['AWS', 'CDK stack in Go', 'Umami Analytics'], repos: ['https://github.com/IlmarLopez/umami-cloud-go'] },
  { name: 'Serverless transaction notifications', stack: 'Python, CloudFormation', layers: ['AWS', 'CloudFormation', 'Python functions', 'CI/CD'], repos: ['https://github.com/IlmarLopez/serverless-transaction-notifications'] },
  {
    name: 'Building access control',
    stack: 'Vue, Go',
    layers: ['RESTful API in Go', 'Vue web client'],
    repos: ['https://github.com/IlmarLopez/utt-access-control-client', 'https://github.com/IlmarLopez/utt-access-control-server'],
  },
  { name: 'This portfolio', stack: 'Nuxt, Tailwind, CSS motion', layers: ['Nuxt, prerendered', 'Tailwind CSS', 'CSS motion'], repos: ['https://github.com/IlmarLopez/ilmarlopez.github.io'] },
]

const TOOLS = [
  ['Languages', ['Go', 'Python', 'TypeScript']],
  ['Frontend', ['Vue', 'Nuxt', 'Tailwind CSS']],
  ['Cloud', ['AWS Lambda', 'API Gateway', 'EventBridge']],
  ['Practice', ['Clean Architecture', 'REST APIs', 'Unit tests', 'Observability and metrics', 'Database design']],
]

const SOCIALS = ['https://github.com/IlmarLopez', 'https://www.linkedin.com/in/ilmarlopez', 'https://dev.to/ilmarlopez', 'https://codepen.io/ilmarlopez']

/** What the spec fixes about each project; the sentence under it is checked on its own. */
const core = (list) => list.map(({ name, layers, links }) => ({ name, layers, links }))
const EXPECTED_PROJECTS = PROJECTS.map(({ name, layers, repos }) => ({ name, layers, links: repos }))

/** The widths of AC-28: the phones that cut the labels (B9), the two-column threshold and the wide screens. */
const STACK_WIDTHS = [320, 344, 390, 414, 600, 768, 961, 1000, 1100, 1280, 1440, 1920]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Which tab is selected, which panels the visitor can see, and where the focus is. */
const readInspector = (page) =>
  page.evaluate(() => {
    const tabs = [...document.querySelectorAll('[role="tab"]')]
    const shown = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
    return {
      selected: tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true'),
      tabindex: tabs.map((tab) => tab.tabIndex),
      shownPanels: [...document.querySelectorAll('[role="tabpanel"]')].map((panel, i) => (shown(panel) ? i : -1)).filter((i) => i >= 0),
      focused: document.activeElement?.id || null,
    }
  })

/** The four project panels as the page shows them, whether or not the tab list exists. */
const readProjects = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('[role="tabpanel"]')].map((panel) => ({
      name: panel.querySelector('h3')?.textContent?.trim(),
      layers: [...panel.querySelectorAll('.tag')].map((tag) => tag.textContent?.trim()),
      links: [...panel.querySelectorAll('.links a')].map((a) => a.getAttribute('href')),
      sentence: panel.querySelector('.links')?.textContent?.replace(/\s+/g, ' ').trim(),
    })),
  )

await main('sections', async (t, { open, base }) => {
  await t.check('the sections come after the journey, in order, and the nav anchors land on them', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.goto('/')
      const found = await site.page.evaluate(() => ({
        order: [...document.querySelectorAll('main > section')].map((s) => s.id),
        headings: [...document.querySelectorAll('main > section:not(#journey) > div > h2')].map((h) => [h.id, h.textContent?.trim()]),
        h1: document.querySelectorAll('h1').length,
        navTargets: [...document.querySelectorAll('header nav a[href^="/#"]')].map((a) => [a.getAttribute('href'), Boolean(document.getElementById(a.getAttribute('href').slice(2)))]),
        footerAfterMain: document.querySelector('main')?.nextElementSibling?.tagName,
      }))
      const s = soft()
      s.equal(found.order, ['journey', 'about', 'work', 'tools', 'contact'], 'sections of <main>, in order')
      s.equal(found.headings, [['about-h', 'About.'], ['work-h', 'Selected work.'], ['tools-h', 'Tools.'], ['contact-h', 'Contact.']], 'one h2 per section, with its id')
      s.equal(found.h1, 1, 'h1 count')
      s.equal(found.navTargets, [['/#experience', true], ['/#work', true], ['/#tools', true], ['/#contact', true]], 'every nav anchor has a target')
      s.equal(found.footerAfterMain, 'FOOTER', 'the footer follows <main>')
      s.equal(site.problems, [], 'console problems')
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('About: the photo is lazy, resized, never the 5 MB original, and does not shift the page', async () => {
    const site = await open({
      viewport: VIEWPORTS.desktop,
      initScripts: [
        {
          fn: () => {
            window.__cls = 0
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value
            }).observe({ type: 'layout-shift', buffered: true })
          },
        },
      ],
    })
    const photos = []
    site.page.on('response', async (response) => {
      if (response.url().includes('/hero/me')) photos.push({ url: new URL(response.url()).pathname, bytes: (await response.body().catch(() => Buffer.alloc(0))).length })
    })
    try {
      await site.goto('/')
      const atLoad = photos.length
      await site.page.evaluate(() => {
        window.__cls = 0
      })
      const img = site.page.locator('#about img')
      await img.scrollIntoViewIfNeeded()
      await img.evaluate((el) => (el.complete && el.naturalWidth ? true : new Promise((resolve) => el.addEventListener('load', () => resolve(true), { once: true }))))
      await sleep(300)
      const found = await img.evaluate((el) => ({
        alt: el.alt,
        loading: el.loading,
        width: el.getAttribute('width'),
        height: el.getAttribute('height'),
        natural: [el.naturalWidth, el.naturalHeight],
        shown: [Math.round(el.getBoundingClientRect().width), Math.round(el.getBoundingClientRect().height)],
        current: new URL(el.currentSrc).pathname,
        cls: window.__cls,
      }))
      const total = photos.reduce((sum, p) => sum + p.bytes, 0)
      const s = soft()
      s.equal(atLoad, 0, 'photo requests before About is near the viewport (loading="lazy")')
      s.ok(photos.length > 0 && photos.every((p) => p.url.startsWith('/_ipx/')), `every photo request is a resized variant: ${photos.map((p) => p.url).join(', ')}`)
      s.ok(!photos.some((p) => p.url === '/img/hero/me.jpg' || p.url === '/img/hero/me_v1.jpg'), 'the original files are never requested')
      s.ok(total > 0 && total < 100_000, `photo bytes on the wire: ${total} (limit 100000)`)
      s.ok(/f_(avif|webp)/.test(found.current), `the browser picked a modern format: ${found.current}`)
      s.equal([found.loading, found.width, found.height], ['lazy', '360', '480'], 'loading, width and height attributes')
      s.ok(found.alt.length >= 20, `descriptive alt text: "${found.alt}"`)
      s.equal(found.natural, [360, 480], 'natural size at 1x')
      s.equal(found.shown, [360, 480], 'rendered size')
      s.ok(found.cls < 0.001, `layout shift while the photo arrives: ${found.cls}`)
      s.equal(site.problems, [], 'console problems')
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('Work, with JS: ARIA tabs, one panel at a time, arrows, Home and End', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.goto('/')
      await site.page.locator('#work').scrollIntoViewIfNeeded()
      // Work hydrates when it nears the viewport; give it a moment before the first click.
      await sleep(600)
      const s = soft()

      const tablist = await site.page.evaluate(() => {
        const list = document.querySelector('[role="tablist"]')
        const tabs = [...document.querySelectorAll('[role="tab"]')]
        return {
          label: list?.getAttribute('aria-label'),
          orientation: list?.getAttribute('aria-orientation'),
          texts: tabs.map((tab) => [...tab.querySelectorAll('span')].map((span) => span.textContent?.trim())),
          wiring: tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls'))?.getAttribute('aria-labelledby') === tab.id),
        }
      })
      s.equal(tablist.label, 'Projects', 'tablist name')
      s.equal(tablist.orientation, 'vertical', 'tablist orientation')
      s.equal(tablist.texts, PROJECTS.map((p, i) => [`0${i + 1}`, p.name, p.stack]), 'tabs: number, name and stack')
      s.equal(tablist.wiring, [true, true, true, true], 'each tab controls the panel that is labelled by it')

      s.equal(await readInspector(site.page), { selected: 0, tabindex: [0, -1, -1, -1], shownPanels: [0], focused: null }, 'initial state')

      await site.page.locator('#wk-t2').click()
      s.equal(await readInspector(site.page), { selected: 2, tabindex: [-1, -1, 0, -1], shownPanels: [2], focused: 'wk-t2' }, 'after clicking the third tab')

      const projects = await readProjects(site.page)
      s.equal(core(projects), EXPECTED_PROJECTS, 'every panel has its name, layers and repository links')
      s.equal(projects[2]?.sentence, 'Client and API on GitHub', 'two repositories read as one sentence')
      s.equal(projects[0]?.sentence, 'Source on GitHub', 'one repository')

      const press = async (key, expected, label) => {
        await site.page.keyboard.press(key)
        s.equal(await readInspector(site.page), expected, label)
      }
      await press('ArrowDown', { selected: 3, tabindex: [-1, -1, -1, 0], shownPanels: [3], focused: 'wk-t3' }, 'ArrowDown moves to the next tab and focuses it')
      await press('ArrowDown', { selected: 0, tabindex: [0, -1, -1, -1], shownPanels: [0], focused: 'wk-t0' }, 'ArrowDown wraps from the last tab to the first')
      await press('ArrowUp', { selected: 3, tabindex: [-1, -1, -1, 0], shownPanels: [3], focused: 'wk-t3' }, 'ArrowUp wraps from the first tab to the last')
      await press('ArrowLeft', { selected: 2, tabindex: [-1, -1, 0, -1], shownPanels: [2], focused: 'wk-t2' }, 'ArrowLeft goes back one')
      await press('ArrowRight', { selected: 3, tabindex: [-1, -1, -1, 0], shownPanels: [3], focused: 'wk-t3' }, 'ArrowRight goes forward one')
      await press('Home', { selected: 0, tabindex: [0, -1, -1, -1], shownPanels: [0], focused: 'wk-t0' }, 'Home goes to the first tab')
      await press('End', { selected: 3, tabindex: [-1, -1, -1, 0], shownPanels: [3], focused: 'wk-t3' }, 'End goes to the last tab')
      await press('a', { selected: 3, tabindex: [-1, -1, -1, 0], shownPanels: [3], focused: 'wk-t3' }, 'other keys do nothing')

      await site.page.keyboard.press('Tab')
      const afterTab = await site.page.evaluate(() => ({ onTab: document.activeElement?.getAttribute('role') === 'tab', in: document.activeElement?.closest('[role="tabpanel"]')?.id ?? null }))
      s.equal(afterTab, { onTab: false, in: 'wk-p3' }, 'Tab leaves the tab list and lands in the panel (roving tabindex)')
      s.equal(site.problems, [], 'console problems')
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check("Work's JS is requested when the section nears the viewport, not before", async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    const scripts = []
    site.page.on('request', (request) => {
      if (new URL(request.url()).pathname.endsWith('.js')) scripts.push(new URL(request.url()).pathname)
    })
    try {
      await site.goto('/')
      const atLoad = scripts.length
      // A jump straight to Contact never puts Work in or near the viewport.
      await site.page.locator('#contact').scrollIntoViewIfNeeded()
      await sleep(800)
      const afterContact = scripts.length
      await site.page.locator('#work').scrollIntoViewIfNeeded()
      await sleep(800)
      const s = soft()
      s.ok(atLoad > 0, 'the page requested its entry scripts')
      s.equal(afterContact, atLoad, 'scripts requested while only About, Tools and Contact were reached')
      s.ok(scripts.length > afterContact, `scripts requested once Work was near the viewport: ${scripts.slice(afterContact).join(', ') || 'none'}`)
      s.done()
    } finally {
      await site.close()
    }
  })

  // B7: each label hangs from the right corner of its plate. B9 / AC-28: at 12 widths, in all four projects,
  // neither the labels nor the diamond leave the stage or the viewport.
  for (const width of STACK_WIDTHS) {
    const viewport = { width, height: 800 }
    await t.check(`Work stack at ${width}px: every label sits at its plate's right vertex and inside the stage and the viewport`, async () => {
      const site = await open({ viewport })
      try {
        await site.goto('/')
        await site.page.locator('#work').scrollIntoViewIfNeeded()
        await sleep(600)
        const problems = []
        for (const [index, project] of PROJECTS.entries()) {
          await site.page.locator(`#wk-t${index}`).click()
          const found = await site.page.evaluate((panelIndex) => {
            const panel = document.getElementById(`wk-p${panelIndex}`)
            const stage = panel.querySelector('.wk-stage').getBoundingClientRect()
            return [...panel.querySelectorAll('.plate')].map((plate) => {
              // Probes at the four corners of the plate land where the 3D transform puts them on screen.
              const corners = [[0, 0], [100, 0], [0, 100], [100, 100]].map(([x, y]) => {
                const probe = document.createElement('b')
                probe.style.cssText = `position:absolute;left:${x}%;top:${y}%;width:0;height:0`
                plate.append(probe)
                const rect = probe.getBoundingClientRect()
                probe.remove()
                return { id: `${x},${y}`, x: rect.left, y: rect.top }
              })
              const right = corners.reduce((best, corner) => (corner.x > best.x ? corner : best))
              const tag = plate.querySelector('.tag').getBoundingClientRect()
              return {
                label: plate.querySelector('.tag').textContent,
                rightCorner: right.id,
                offCenter: Math.round(Math.abs((tag.top + tag.bottom) / 2 - right.y) * 10) / 10,
                overflowRight: Math.round((tag.right - stage.right) * 10) / 10,
                overflowLeft: Math.round((stage.left - Math.min(...corners.map((c) => c.x), tag.left)) * 10) / 10,
                overflowViewport: Math.round((Math.max(tag.right, ...corners.map((c) => c.x)) - document.documentElement.clientWidth) * 10) / 10,
              }
            })
          }, index)
          for (const plate of found) {
            if (plate.rightCorner !== '100,100') problems.push(`${project.name} / ${plate.label}: the right vertex is the ${plate.rightCorner} corner, not 100,100`)
            if (plate.offCenter > 1) problems.push(`${project.name} / ${plate.label}: ${plate.offCenter}px above or below the vertex`)
            if (plate.overflowRight > 0.5) problems.push(`${project.name} / ${plate.label}: ${plate.overflowRight}px past the right edge of the stage`)
            if (plate.overflowLeft > 0.5) problems.push(`${project.name} / ${plate.label}: ${plate.overflowLeft}px past the left edge of the stage`)
            if (plate.overflowViewport > 0.5) problems.push(`${project.name} / ${plate.label}: ${plate.overflowViewport}px past the right edge of the viewport`)
          }
          if (found.length !== project.layers.length) problems.push(`${project.name}: ${found.length} plates, expected ${project.layers.length}`)
        }
        assertEqual(problems, [], 'label placement')
      } finally {
        await site.close()
      }
    })
  }

  await t.check('Without JS the whole home is in the served HTML', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop, javaScriptEnabled: false })
    try {
      await site.goto('/')
      const found = await site.page.evaluate(() => ({
        text: document.body.innerText.replace(/\s+/g, ' '),
        picture: document.querySelectorAll('#about picture source[srcset]').length,
        footer: document.querySelector('footer')?.getClientRects().length > 0,
      }))
      const s = soft()
      for (const text of ['I’m a Senior Software Engineer at Stori', 'Before Stori I was a full stack developer', 'Selected work.', 'Observability and metrics', 'Have something to build?', 'Version 2, 2026']) {
        s.ok(found.text.includes(text), `the text "${text}" is on the page`)
      }
      s.equal(found.picture, 2, 'the photo ships its AVIF and WebP sources in the HTML')
      s.equal(found.footer, true, 'the footer is shown')
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('Work, without JS: the four projects as a plain list, the stacks open and the tab list hidden', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop, javaScriptEnabled: false })
    try {
      await site.goto('/')
      const projects = await readProjects(site.page)
      const found = await site.page.evaluate(() => {
        const visible = (el) => el.getClientRects().length > 0
        const gaps = [...document.querySelectorAll('.wk-stack')].map((stack) => {
          const tops = [...stack.querySelectorAll('.tag')].map((tag) => tag.getBoundingClientRect()).sort((a, b) => a.top - b.top)
          return Math.min(...tops.slice(1).map((rect, i) => Math.round(rect.top - tops[i].bottom)))
        })
        return {
          tablistShown: visible(document.querySelector('[role="tablist"]')),
          panelsShown: [...document.querySelectorAll('[role="tabpanel"]')].map(visible),
          gaps,
        }
      })
      const s = soft()
      s.equal(found.tablistShown, false, 'the tab list is hidden: its buttons would do nothing')
      s.equal(found.panelsShown, [true, true, true, true], 'all four panels are visible')
      s.equal(core(projects), EXPECTED_PROJECTS, 'names, layers and repository links')
      s.ok(found.gaps.every((gap) => gap >= 0), `the labels of an open stack do not overlap (B2): gaps ${found.gaps.join(', ')} px`)
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('Work, when the bundle is late: the plain list shows at 8 s and the tabs come back when it arrives', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.page.route(/\/_nuxt\/.*\.js$/, async (route) => {
        await sleep(8600)
        await route.continue()
      })
      await site.page.goto(new URL('./', base).href, { waitUntil: 'commit' })
      await site.page.waitForFunction(() => !document.documentElement.classList.contains('js'), undefined, { timeout: 9000 })
      const during = await site.page.evaluate(() => ({
        appReady: document.documentElement.classList.contains('app-ready'),
        flight: document.documentElement.classList.contains('flight'),
        tablist: document.querySelector('[role="tablist"]')?.getClientRects().length ?? 0,
        panels: [...document.querySelectorAll('[role="tabpanel"]')].filter((panel) => panel.getClientRects().length > 0).length,
      }))
      await site.page.waitForFunction(() => document.documentElement.classList.contains('app-ready'), undefined, { timeout: 10000 })
      const after = await site.page.evaluate(() => ({ js: document.documentElement.classList.contains('js') }))
      const s = soft()
      s.equal(during, { appReady: false, flight: false, tablist: 0, panels: 4 }, 'while the bundle has not started: no js, no flight, every project open')
      s.equal(after.js, true, 'the bundle puts the js class back when it does arrive')
      s.done()
    } finally {
      await site.close()
    }
  })

  for (const [viewport, columns] of [[VIEWPORTS.desktop, 4], [VIEWPORTS.tablet, 2], [VIEWPORTS.phone, 1]]) {
    await t.check(`Tools: ${columns} column${columns === 1 ? '' : 's'} at ${viewport.width}px`, async () => {
      const site = await open({ viewport })
      try {
        await site.goto('/')
        const found = await site.page.evaluate(() => {
          const groups = [...document.querySelectorAll('#tools h3')].map((h3) => h3.parentElement)
          return {
            groups: groups.map((group) => [group.querySelector('h3').textContent, [...group.querySelectorAll('li')].map((li) => li.textContent)]),
            lefts: new Set(groups.map((group) => Math.round(group.getBoundingClientRect().left))).size,
            languages: document.querySelector('#tools .lang')?.textContent,
          }
        })
        const s = soft()
        s.equal(found.groups, TOOLS, 'the four groups and their items')
        s.equal(found.lefts, columns, 'distinct columns')
        s.equal(found.languages, 'Spanish, native. English, technical.', 'spoken languages line')
        s.done()
      } finally {
        await site.close()
      }
    })
  }

  await t.check('Contact and footer: the links go where the spec says', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.goto('/')
      const found = await site.page.evaluate(() => {
        const link = (a) => ({ text: a.textContent?.replace(/\s+/g, ' ').trim(), href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel') })
        return {
          big: document.querySelector('#contact .big')?.textContent,
          mail: link(document.querySelector('#contact .mail')),
          sayHi: { ...link(document.querySelector('#contact .actions a')), action: document.querySelector('#contact .actions a')?.getAttribute('data-action') },
          socials: [...document.querySelectorAll('#contact .socials a')].map(link),
          footer: [...document.querySelectorAll('footer a')].map(link),
          footerText: document.querySelector('footer small')?.textContent,
        }
      })
      const s = soft()
      s.equal(found.big, 'Have something to build?', 'prompt')
      s.equal([found.mail.text, found.mail.href], ['me@ilmarlopez.com', 'mailto:me@ilmarlopez.com'], 'email link')
      s.equal([found.sayHi.text, found.sayHi.href, found.sayHi.action], ['Say hi', 'mailto:me@ilmarlopez.com', 'say-hi'], 'Say hi is a mailto: link the dialog (T-36) will take over')
      s.equal(
        found.socials.map((l) => [l.text, l.href]),
        [['CV PDF, 1 page', '/files/Ilmar-Lopez-CV.pdf'], ['GitHub', SOCIALS[0]], ['LinkedIn', SOCIALS[1]], ['DEV', SOCIALS[2]], ['CodePen', SOCIALS[3]]],
        'CV and social links, in order',
      )
      s.equal([found.socials[0].target, found.socials[0].rel], ['_blank', 'noopener'], 'the CV opens in a new tab without opener')
      s.equal(found.footer.map((l) => [l.text, l.href]), [['Ilmar Lopez', '#top'], ['Version 1, archived', 'https://v1.ilmarlopez.com']], 'footer links')
      s.equal(found.footerText, 'Version 2, 2026', 'edition note')
      const cv = await site.page.request.get(new URL('./files/Ilmar-Lopez-CV.pdf', base).href)
      s.equal([cv.status(), cv.headers()['content-type']], [200, 'application/pdf'], 'the CV link resolves to a PDF')
      // "PDF, 1 page" has to be true. Counts the page objects of the PDF itself.
      const pdf = fs.readFileSync('public/files/Ilmar-Lopez-CV.pdf').toString('latin1')
      s.equal((pdf.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length, 1, 'the CV PDF has one page, as the link says')
      const allLinks = await site.page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')))
      const banned = allLinks.filter((href) => /whatsapp|wa\.me|facebook|twitch|twitter|x\.com/i.test(href))
      s.equal(banned, [], 'no WhatsApp, Facebook, Twitch or Twitter links anywhere on the page')
      s.done()
    } finally {
      await site.close()
    }
  })
})
