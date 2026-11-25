// T-27, T-79, T-25 and T-52: the role cards, the tenure chart, the static list and the camera flight.
// Covers RF-04, RNF-07 (no JS), AC-17 (first view) and the flight rules of spec §8.
import { main, VIEWPORTS, eventually } from './lib/browser.mjs'
import { assertEqual, assertOk, soft } from './lib/check.mjs'
import { STOPS, flyTo } from './lib/journey.mjs'

/** The date every duration is counted against, so the expected figures do not change with the calendar. */
const TODAY = '2027-03-10T12:00:00'

const ROLES = [
  {
    name: 'Stori Card',
    role: 'Senior Software Engineer',
    state: 'Active',
    about: 'Serverless APIs with Clean Architecture, testing and monitoring. Now on the architecture team.',
    mark: 'St',
    period: 'Oct 2021 to now',
    spoken: '5 years 6 months',
    figure: '5yrs6mos',
    label: 'Stori',
    bar: { a: '46.34%', w: '53.66%' },
    links: [{ text: 'Stori Card', href: 'https://www.storicard.com/', target: '_blank', rel: 'noopener' }],
  },
  {
    name: 'Home & Media Products',
    role: 'Full Stack Developer and Technical Lead',
    state: 'Ended',
    about: 'Architecture, code quality, reviews and database design for educational platforms.',
    mark: 'HM',
    period: 'Sep 2017 to Oct 2021',
    spoken: '4 years 2 months',
    figure: '4yrs2mos',
    label: 'Home & Media',
    bar: { a: '6.50%', w: '40.65%' },
    links: [],
  },
  {
    name: 'California Web Design',
    role: 'Frontend Developer',
    state: 'Ended',
    about: null,
    mark: 'CW',
    period: 'Apr 2017 to Jul 2017',
    spoken: '4 months',
    figure: '4mos',
    label: 'California Web',
    links: [],
  },
  {
    name: 'Universidad Tecnológica de Tijuana',
    role: 'Information Technology Engineering',
    state: 'Education',
    about: null,
    mark: 'UTT',
    period: null,
    spoken: null,
    figure: null,
    links: [],
  },
]

/** What each card says, how it links and what its chart holds, read in one round trip. */
const readCards = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('.card')].map((card) => {
      const text = (selector) => card.querySelector(selector)?.textContent.replace(/\s+/g, ' ').trim() ?? null
      return {
        name: text('h3'),
        role: text('.role'),
        state: text('.state'),
        about: text('.about'),
        mark: text('.mark'),
        markFilled: card.querySelector('.mark')?.hasAttribute('data-now') ?? false,
        live: card.querySelector('.state')?.hasAttribute('data-live') ?? false,
        links: [...card.querySelectorAll('a')].map((a) => ({ text: a.textContent.trim(), href: a.getAttribute('href'), target: a.target, rel: a.rel })),
        period: text('.when'),
        spoken: text('[data-spoken]'),
        figure: card.querySelector('[data-figure]')?.textContent ?? null,
        rows: [...card.querySelectorAll('.tenure .row')].map((row) => {
          const bar = row.querySelector('.bar')
          return { name: row.querySelector('.name')?.textContent, self: row.hasAttribute('data-self'), a: bar?.style.getPropertyValue('--a'), w: bar?.style.getPropertyValue('--w') }
        }),
        years: [...card.querySelectorAll('.tenure .year')].filter((el) => getComputedStyle(el).display !== 'none').map((el) => el.textContent),
      }
    }),
  )

/** Which plane the camera has in front, what can be pressed or tabbed to, and what the ruler says. */
const readCamera = (page) =>
  page.evaluate(() => {
    const planes = [...document.querySelectorAll('.plane')]
    const labels = [...document.querySelectorAll('.depth li')]
    return {
      p: Number(document.getElementById('journey').style.getPropertyValue('--p')),
      pressable: planes.flatMap((plane, i) => (plane.style.pointerEvents === 'none' ? [] : [i])),
      tabbable: planes.flatMap((plane, i) => ([...plane.querySelectorAll('a[href], button')].some((el) => el.tabIndex === 0) ? [i] : [])),
      reached: planes.flatMap((plane, i) => (plane.hasAttribute('data-reached') ? [i] : [])),
      heroPassed: planes[0]?.hasAttribute('data-passed') ?? false,
      on: labels.filter((li) => li.hasAttribute('data-on')).map((li) => li.textContent),
      past: labels.filter((li) => li.hasAttribute('data-past')).length,
    }
  })

const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

/** Sums the layout shifts the page has made so far (the ones without a recent input). */
const SHIFT_PROBE = {
  fn: () => {
    window.__shift = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__shift += entry.value
    }).observe({ type: 'layout-shift', buffered: true })
  },
}

await main('journey', async (t, { open }) => {
  await t.check('the four roles read as cards with the texts of the reference, and only Stori links out', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop, reducedMotion: 'reduce' })
    try {
      await site.page.clock.setFixedTime(TODAY)
      await site.goto('/')
      const cards = await readCards(site.page)
      const s = soft()
      s.equal(cards.length, ROLES.length, 'number of cards')
      ROLES.forEach((role, i) => {
        const card = cards[i]
        if (!card) return
        s.equal(
          { name: card.name, role: card.role, state: card.state, about: card.about, mark: card.mark, links: card.links },
          { name: role.name, role: role.role, state: role.state, about: role.about, mark: role.mark, links: role.links },
          `card ${i + 1} (${role.name})`,
        )
        s.equal([card.markFilled, card.live], [i === 0, i === 0], `card ${i + 1}: only the running role has the filled monogram and the live dot`)
      })
      s.equal(site.problems, [], 'console problems')
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('periods and durations count both months, from the date of the day', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop, reducedMotion: 'reduce' })
    try {
      await site.page.clock.setFixedTime(TODAY)
      await site.goto('/')
      const cards = await readCards(site.page)
      const s = soft()
      ROLES.forEach((role, i) => {
        const card = cards[i]
        if (!card) return
        s.equal({ period: card.period, spoken: card.spoken, figure: card.figure }, { period: role.period, spoken: role.spoken, figure: role.figure }, `${role.name}: period and duration`)
      })
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('the chart has a row per dated role on one scale, with the card’s own role in ink', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop, reducedMotion: 'reduce' })
    try {
      await site.page.clock.setFixedTime(TODAY)
      await site.goto('/')
      const cards = await readCards(site.page)
      const labels = ROLES.filter((role) => role.period).map((role) => role.label)
      const s = soft()
      ROLES.forEach((role, i) => {
        const card = cards[i]
        if (!card) return
        if (!role.period) {
          s.equal(card.rows, [], `${role.name}: education has no chart`)
          return
        }
        s.equal(
          card.rows.map((row) => row.name),
          labels,
          `${role.name}: rows, newest first`,
        )
        s.equal(card.rows.filter((row) => row.self).map((row) => row.name), [role.label], `${role.name}: the row in ink`)
        if (role.bar) {
          const row = card.rows.find((candidate) => candidate.name === role.label)
          s.equal({ a: row?.a, w: row?.w }, role.bar, `${role.name}: where its bar starts and how long it is`)
        }
      })
      s.equal(cards[0]?.years, ['2017', '2019', '2021', '2023', '2025'], 'year labels on a desktop: every second year, none that would touch "Now"')
      const scale = await site.page.evaluate(() => document.getElementById('journey').style.getPropertyValue('--yr'))
      s.equal(scale, '9.756%', 'one hairline per January')
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('on a phone the years are labelled every third year and the row names are not cut', async () => {
    const site = await open({ viewport: VIEWPORTS.phone, reducedMotion: 'reduce' })
    try {
      await site.page.clock.setFixedTime(TODAY)
      await site.goto('/')
      const cards = await readCards(site.page)
      const clipped = await site.page.evaluate(() => [...document.querySelectorAll('.tenure .name')].filter((el) => el.scrollWidth > el.clientWidth).map((el) => el.textContent))
      const s = soft()
      s.equal(cards[0]?.years, ['2017', '2020', '2023'], 'year labels')
      s.equal(clipped, [], 'row names wider than their column')
      s.equal(await overflow(site.page), 0, 'horizontal overflow at 360 px')
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('without JS the roles are a plain list: no flight, no chart, the dates and durations still read', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop, javaScriptEnabled: false })
    try {
      await site.goto('/')
      const found = await site.page.evaluate(() => {
        const cards = [...document.querySelectorAll('.card')]
        const box = (el) => el.getBoundingClientRect()
        return {
          flight: document.documentElement.classList.contains('flight'),
          cards: cards.length,
          stacked: cards.every((card, i) => i === 0 || box(card).top >= box(cards[i - 1]).bottom),
          strips: [...document.querySelectorAll('.tenure')].map((el) => getComputedStyle(el).display),
          rows: document.querySelectorAll('.tenure .row').length,
          ruler: getComputedStyle(document.querySelector('.depth')).display,
          heading: document.querySelector('h2')?.textContent,
          headingShown: box(document.querySelector('h2')).width > 1,
          durations: cards.map((card) => card.querySelector('.dur')?.textContent.replace(/\s+/g, ' ').trim() ?? null),
        }
      })
      const s = soft()
      s.equal(found.flight, false, 'the flight class')
      s.equal([found.cards, found.stacked], [4, true], 'four cards stacked in the flow, none over another')
      s.equal(found.strips, ['none', 'none', 'none'], 'chart strips are hidden')
      s.equal(found.rows, 0, 'chart rows built')
      s.equal(found.ruler, 'none', 'the depth ruler is hidden')
      s.equal([found.heading, found.headingShown], ['Experience.', true], 'the Experience heading is visible')
      s.ok(found.durations.slice(0, 3).every((text) => /\d/.test(text ?? '')), `each dated role shows a duration: ${JSON.stringify(found.durations)}`)
      s.equal(found.durations[3], null, 'education has no duration')
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('with reduced motion the page is the list, the chart is drawn and the figures are final', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop, reducedMotion: 'reduce', initScripts: [SHIFT_PROBE] })
    try {
      await site.page.clock.setFixedTime(TODAY)
      await site.goto('/')
      await site.page.waitForTimeout(500)
      const found = await site.page.evaluate(() => ({
        classes: [...document.documentElement.classList].filter((name) => name.startsWith('flight')),
        height: document.getElementById('journey').offsetHeight,
        viewport: innerHeight,
        figure: document.querySelector('.card [data-figure]')?.textContent,
        barsDrawn: [...document.querySelectorAll('.tenure .bar')].every((bar) => getComputedStyle(bar).transform === 'none'),
        shift: window.__shift,
      }))
      const s = soft()
      s.equal(found.classes, [], 'flight classes')
      s.ok(found.height > found.viewport * 2 && found.height < found.viewport * 8, `the journey is as tall as its content, not a flight: ${found.height}px`)
      s.equal(found.figure, '5yrs6mos', 'the first figure is final, not counting')
      s.equal(found.barsDrawn, true, 'all bars are drawn at once')
      s.ok(found.shift < 0.02, `the chart appears without moving the page: layout shift ${found.shift.toFixed(4)}`)
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('the camera has one plane in front at each stop, and only that plane can be pressed or tabbed to', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.goto('/')
      const s = soft()
      for (const [i, p] of STOPS.entries()) {
        await flyTo(site.page, p)
        const camera = await readCamera(site.page)
        const where = `at ${p}`
        s.equal(camera.pressable, [i], `${where}: planes that take the pointer`)
        // Hero (Say hi, View CV) and Stori (its link) have something to press; the others have nothing.
        s.equal(camera.tabbable, i < 2 ? [i] : [], `${where}: planes with something in the tab order`)
        s.equal(camera.on.length, 1, `${where}: one ruler label is on`)
        s.equal(camera.on, [['Now', 'Stori', 'Home & Media', 'California Web', 'UTT'][i]], `${where}: the ruler label`)
        s.equal(camera.past, i, `${where}: ruler labels already flown past`)
        s.equal(camera.heroPassed, i > 0, `${where}: the hero is marked as passed`)
        s.equal(camera.reached, [...Array(i + 1).keys()], `${where}: planes reached`)
      }
      s.equal(site.problems, [], 'console problems')
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('the figure counts up from zero when the camera reaches its card, and the camera rests when nothing moves', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop, initScripts: [{ fn: () => {
      window.__frames = 0
      const request = window.requestAnimationFrame.bind(window)
      window.requestAnimationFrame = (callback) => {
        window.__frames += 1
        return request(callback)
      }
    } }] })
    try {
      await site.page.clock.setFixedTime(TODAY)
      await site.goto('/')
      const figure = () => site.page.evaluate(() => document.querySelector('.card [data-figure]')?.textContent)
      assertEqual(await figure(), '0yrs0mos', 'before the camera reaches Stori the figure shows zero')
      await flyTo(site.page, 0.25)
      assertEqual((await eventually(figure, '5yrs6mos', { timeout: 3000 })), '5yrs6mos', 'once reached, the figure ends on its value')
      await site.page.waitForTimeout(300)
      await site.page.evaluate(() => { window.__frames = 0 })
      await site.page.waitForTimeout(500)
      const frames = await site.page.evaluate(() => window.__frames)
      assertEqual(frames, 0, 'animation frames requested in 500 ms of rest')
    } finally {
      await site.close()
    }
  })

  await t.check('the Experience link flies to the first role, also when the page opens at /#experience', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.goto('/')
      await site.page.click('header a[href="/#experience"]')
      await site.page.waitForFunction(() => Math.abs(Number(document.getElementById('journey').style.getPropertyValue('--p')) - 0.25) < 0.01, null, { timeout: 4000 })
      const hash = await site.page.evaluate(() => location.hash)
      assertEqual(hash, '#experience', 'the address after the click')
    } finally {
      await site.close()
    }
    const direct = await open({ viewport: VIEWPORTS.desktop })
    try {
      await direct.goto('/#experience')
      await direct.page.waitForTimeout(600)
      const camera = await readCamera(direct.page)
      assertOk(Math.abs(camera.p - 0.25) < 0.01, `opening /#experience puts the camera on the first role: p = ${camera.p}`)
    } finally {
      await direct.close()
    }
  })

  await t.check('in the list, /#experience lands on the Experience heading with the nav clear of it', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop, reducedMotion: 'reduce' })
    try {
      await site.goto('/#experience')
      await site.page.waitForTimeout(400)
      const found = await site.page.evaluate(() => ({
        heading: Math.round(document.getElementById('experience').getBoundingClientRect().top),
        nav: Math.round(document.querySelector('header').getBoundingClientRect().bottom),
      }))
      assertOk(found.heading >= found.nav && found.heading <= 100, `the heading sits just under the nav: top ${found.heading}, nav bottom ${found.nav}`)
    } finally {
      await site.close()
    }
  })

  await t.check('on a phone the role in front fits the screen at every stop', async () => {
    const site = await open({ viewport: VIEWPORTS.phone })
    try {
      await site.goto('/')
      const s = soft()
      for (const p of STOPS.slice(1)) {
        await flyTo(site.page, p)
        const found = await site.page.evaluate(() => {
          const front = [...document.querySelectorAll('.plane')].find((plane) => plane.style.pointerEvents !== 'none')
          const box = front.getBoundingClientRect()
          const nav = document.querySelector('header').getBoundingClientRect()
          return { left: Math.round(box.left), right: Math.round(box.right), top: Math.round(box.top), bottom: Math.round(box.bottom), navBottom: Math.round(nav.bottom), width: innerWidth, height: innerHeight }
        })
        s.ok(found.left >= 0 && found.right <= found.width, `at ${p}: the card is inside the screen: ${found.left} to ${found.right} of ${found.width}`)
        s.ok(found.top >= found.navBottom && found.bottom <= found.height, `at ${p}: the card is between the nav and the bottom: ${found.top} to ${found.bottom}`)
      }
      s.equal(await overflow(site.page), 0, 'horizontal overflow at 360 px')
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('on phones the roles behind the hero never cover its text or buttons', async () => {
    const s = soft()
    for (const [width, height] of [[375, 812], [360, 800], [390, 844], [375, 700]]) {
      const site = await open({ viewport: { width, height } })
      try {
        await site.goto('/')
        const found = await site.page.evaluate(() => {
          const box = (el) => {
            const { left, top, right, bottom } = el.getBoundingClientRect()
            return { left, top, right, bottom }
          }
          const hero = document.querySelector('.plane--hero')
          const texts = ['h1', 'h1 + p', '.actions'].map((selector) => [selector, box(hero.querySelector(selector))])
          const planes = [...document.querySelectorAll('.plane:not(.plane--hero)')].map((plane, i) => [i + 1, box(plane)])
          const overlaps = planes.flatMap(([i, a]) => texts.filter(([, b]) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top).map(([selector]) => `plane ${i} over ${selector}`))
          return overlaps
        })
        s.equal(found, [], `${width}×${height}: planes over the hero text`)
      } finally {
        await site.close()
      }
    }
    s.done()
  })

  await t.check('if the app bundle never starts, the flight comes off and the roles stay readable', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      // The styles are inlined in the page, so only the scripts are lost. Failed requests are the point here.
      await site.page.route('**/_nuxt/**/*.js', (route) => route.abort())
      await site.page.route('**/_nuxt/*.js', (route) => route.abort())
      await site.goto('/')
      const flight = () => site.page.evaluate(() => document.documentElement.classList.contains('flight'))
      assertEqual(await flight(), true, 'the boot script sets the flight class before anything else loads')
      assertEqual(await eventually(flight, false, { timeout: 11000, step: 250 }), false, 'the flight class after the bundle failed to start')
      const found = await site.page.evaluate(() => {
        const cards = [...document.querySelectorAll('.card')]
        const box = (el) => el.getBoundingClientRect()
        return {
          count: cards.length,
          visible: cards.every((card) => getComputedStyle(card).visibility !== 'hidden' && box(card).height > 0),
          stacked: cards.every((card, i) => i === 0 || box(card).top >= box(cards[i - 1]).bottom),
          ruler: getComputedStyle(document.querySelector('.depth')).display,
        }
      })
      assertEqual(found, { count: 4, visible: true, stacked: true, ruler: 'none' }, 'the roles as a list')
    } finally {
      await site.close()
    }
  })
})
