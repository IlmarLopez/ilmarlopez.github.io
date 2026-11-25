// AC-02, first slice: with JavaScript off the page is the static HTML and follows the system theme.
// T-64 adds the hero, the four roles and the four projects as readable text.
import { main, paintedColor } from './lib/browser.mjs'
import { soft } from './lib/check.mjs'

const PAPER = { light: [0xf4, 0xf7, 0xfb], dark: [0x09, 0x0d, 0x14] }
const near = (a, b) => a.every((value, i) => Math.abs(value - b[i]) <= 2)

await main('nojs', async (t, { open }) => {
  for (const system of ['light', 'dark']) {
    await t.check(`JavaScript off, system ${system}`, async () => {
      const site = await open({ javaScriptEnabled: false, colorScheme: system })
      try {
        const response = await site.goto('/')
        const found = await site.page.evaluate(() => ({
          lang: document.documentElement.lang,
          js: document.documentElement.classList.contains('js'),
          theme: document.documentElement.getAttribute('data-theme'),
          main: Boolean(document.querySelector('main#main')),
        }))
        const painted = await paintedColor(site.page, 'body', 'background-color')
        const s = soft()
        s.equal(response.status(), 200, 'HTTP status of /')
        s.equal([found.lang, found.main], ['en', true], 'html lang and main#main in the served HTML')
        s.equal([found.js, found.theme], [false, null], 'no script ran: the js class and data-theme must be absent')
        s.ok(painted && near(painted, PAPER[system]), `body follows the system theme: expected rgb(${PAPER[system]}), received rgb(${painted})`)
        s.done()
      } finally {
        await site.close()
      }
    })
  }
})
