// T-24: the hero copy. Covers RF-03 (hero), RF-11 (CV link) and RNF-07 (works without JS).
import { main, VIEWPORTS } from './lib/browser.mjs'
import { assertEqual, soft } from './lib/check.mjs'

const HEADLINE = 'Hi, I’m Ilmar Lopez.'
const LEAD = 'Senior engineer at Stori, building serverless APIs in Go and Python.'
const CV_HREF = '/files/Ilmar-Lopez-CV.pdf'

/** The geometry and attributes of the hero, read in one round trip. */
const readHero = (page) =>
  page.evaluate(() => {
    const box = (element) => {
      const { top, bottom, left, width } = element.getBoundingClientRect()
      return { top: Math.round(top), bottom: Math.round(bottom), left: Math.round(left), width: Math.round(width) }
    }
    const h1 = document.querySelector('main h1')
    const lead = document.querySelector('main h1 + p')
    const sayHi = document.querySelector('main a[href^="mailto:"]')
    const cv = document.querySelector(`main a[href$=".pdf"]`)
    return {
      h1: { text: h1?.textContent.replace(/\s+/g, ' ').trim(), box: h1 && box(h1), count: document.querySelectorAll('h1').length },
      lead: { text: lead?.textContent.trim(), box: lead && box(lead) },
      sayHi: { text: sayHi?.textContent.trim(), href: sayHi?.getAttribute('href'), box: sayHi && box(sayHi), filled: sayHi && getComputedStyle(sayHi).backgroundColor !== 'rgba(0, 0, 0, 0)' },
      cv: {
        text: cv?.textContent.trim(),
        href: cv?.getAttribute('href'),
        target: cv?.getAttribute('target'),
        rel: cv?.getAttribute('rel'),
        download: cv?.hasAttribute('download'),
        box: cv && box(cv),
        filled: cv && getComputedStyle(cv).backgroundColor !== 'rgba(0, 0, 0, 0)',
      },
      navBottom: Math.round(document.querySelector('header').getBoundingClientRect().bottom),
    }
  })

await main('hero', async (t, { open }) => {
  await t.check('at 1280×800 the headline, the lead and the primary action fit in the viewport, below the nav', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.goto('/')
      const hero = await readHero(site.page)
      const s = soft()
      s.equal([hero.h1.text, hero.h1.count], [HEADLINE, 1], 'the page has one h1 with the headline')
      s.equal(hero.lead.text, LEAD, 'lead sentence')
      s.ok(hero.h1.box.top >= hero.navBottom, `the headline starts below the nav: top ${hero.h1.box.top}, nav bottom ${hero.navBottom}`)
      for (const [name, box] of [['headline', hero.h1.box], ['lead', hero.lead.box], ['Say hi', hero.sayHi.box], ['View CV', hero.cv.box]]) {
        s.ok(box.bottom <= VIEWPORTS.desktop.height, `${name} ends inside the 800 px viewport: bottom ${box.bottom}`)
      }
      s.equal(site.problems, [], 'console problems')
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('Say hi is a mailto link and the primary action; View CV is the outlined one', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.goto('/')
      const { sayHi, cv } = await readHero(site.page)
      const s = soft()
      s.equal([sayHi.text, sayHi.href], ['Say hi', 'mailto:me@ilmarlopez.com'], 'Say hi [text, href]')
      s.equal([sayHi.filled, cv.filled], [true, false], 'filled background [Say hi, View CV]')
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('View CV opens the PDF in a new tab: noopener, no download attribute', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop })
    try {
      await site.goto('/')
      const { cv } = await readHero(site.page)
      const s = soft()
      s.equal([cv.text, cv.href, cv.target, cv.download], ['View CV', CV_HREF, '_blank', false], 'View CV [text, href, target, download]')
      s.ok(cv.rel?.split(/\s+/).includes('noopener'), `rel includes noopener: received ${JSON.stringify(cv.rel)}`)
      s.done()
    } finally {
      await site.close()
    }
  })

  await t.check('without JS the hero is all there and Say hi still opens the mail client', async () => {
    const site = await open({ viewport: VIEWPORTS.desktop, javaScriptEnabled: false })
    try {
      await site.goto('/')
      const hero = await readHero(site.page)
      assertEqual(
        [hero.h1.text, hero.lead.text, hero.sayHi.href, hero.cv.href, hero.sayHi.box.width > 0],
        [HEADLINE, LEAD, 'mailto:me@ilmarlopez.com', CV_HREF, true],
        'with JavaScript off: [headline, lead, Say hi href, View CV href, Say hi visible]',
      )
    } finally {
      await site.close()
    }
  })

  await t.check('on a phone the actions fill the width, except on a short screen where they stay side by side', async () => {
    const tall = await open({ viewport: { name: 'phone-tall', width: 375, height: 900 } })
    const short = await open({ viewport: { name: 'phone-short', width: 375, height: 640 } })
    try {
      await tall.goto('/')
      await short.goto('/')
      const full = await readHero(tall.page)
      const side = await readHero(short.page)
      const s = soft()
      // 375 px minus the 16 px gutter on each side.
      s.equal([full.sayHi.box.width, full.cv.box.width], [343, 343], 'tall phone: width of [Say hi, View CV]')
      s.ok(full.cv.box.top > full.sayHi.box.top, 'tall phone: View CV sits below Say hi')
      s.ok(side.sayHi.box.width < 343 && side.cv.box.width < 343, `short phone: both actions shrink to their content, received ${side.sayHi.box.width} and ${side.cv.box.width}`)
      s.equal(side.cv.box.top, side.sayHi.box.top, 'short phone: the two actions share a row')
      s.done()
    } finally {
      await tall.close()
      await short.close()
    }
  })
})
