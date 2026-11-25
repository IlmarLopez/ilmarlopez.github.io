// AC-06 and defect B1: the saved theme and the `js` class are in place before the first paint,
// and with nothing saved the page follows the system. The ThemeSwitch itself is covered by verify:nav (T-22).
import { eventually, main, paintedColor } from './lib/browser.mjs'
import { soft } from './lib/check.mjs'

// --color-paper per scheme (same values as THEME_COLOR in app/utils/theme.ts).
const PAPER = { light: [0xf4, 0xf7, 0xfb], dark: [0x09, 0x0d, 0x14] }
// theme-color per theme (same values as THEME_COLOR in app/utils/theme.ts). Unhead owns these tags and reverts outside
// changes (tasks.md, T-09), so useThemeHead sets them. There is always one per scheme: with nothing saved each carries
// its own color, and once hydrated with a saved theme both carry that theme's color (T-22).
const THEME_COLOR = { light: '#f4f7fb', dark: '#090d14' }
const BOTH_COLORS = `${THEME_COLOR.light},${THEME_COLOR.dark}`
const SAVED_COLORS = (theme) => `${THEME_COLOR[theme]},${THEME_COLOR[theme]}`

const near = (a, b) => a.every((value, i) => Math.abs(value - b[i]) <= 2)

/** Records <html> at the instant the parser inserts the stylesheet link: that is "before the first paint". */
function recordStateAtStylesheet() {
  window.__atStylesheet = null
  new MutationObserver((records, observer) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeName === 'LINK' && node.rel === 'stylesheet' && !window.__atStylesheet) {
          const html = document.documentElement
          window.__atStylesheet = { theme: html.getAttribute('data-theme'), js: html.classList.contains('js') }
          observer.disconnect()
        }
      }
    }
  }).observe(document, { childList: true, subtree: true })
}

function seedStorage({ saved }) {
  if (saved === 'THROW') {
    Storage.prototype.getItem = () => {
      throw new Error('blocked')
    }
  } else if (saved) {
    localStorage.setItem('theme', saved)
  }
}

const SCENARIOS = [
  { name: 'saved dark, system light', system: 'light', saved: 'dark', theme: 'dark' },
  { name: 'saved light, system dark', system: 'dark', saved: 'light', theme: 'light' },
  { name: 'nothing saved, system dark (B1)', system: 'dark', saved: null, theme: null },
  { name: 'nothing saved, system light', system: 'light', saved: null, theme: null },
  { name: 'an invalid saved value is ignored', system: 'light', saved: 'blue', theme: null },
  { name: 'localStorage throws and the page still works', system: 'dark', saved: 'THROW', theme: null },
]

await main('theme', async (t, { open }) => {
  for (const scenario of SCENARIOS) {
    await t.check(scenario.name, async () => {
      const site = await open({
        colorScheme: scenario.system,
        initScripts: [{ fn: recordStateAtStylesheet }, { fn: seedStorage, arg: { saved: scenario.saved } }],
      })
      try {
        await site.goto('/')
        const readColors = () => site.page.evaluate(() => [...document.querySelectorAll('meta[name="theme-color"]')].map((meta) => meta.content).join())
        const expectedColors = scenario.theme ? SAVED_COLORS(scenario.theme) : BOTH_COLORS
        // Settles after hydration, so wait for it and keep what was read.
        const themeColors = await eventually(readColors, expectedColors)
        const found = await site.page.evaluate(() => ({
          atStylesheet: window.__atStylesheet,
          theme: document.documentElement.getAttribute('data-theme'),
          lang: document.documentElement.lang,
          main: Boolean(document.querySelector('main#main')),
          icon: document.querySelector('link[rel=icon]')?.getAttribute('href'),
          colorScheme: document.querySelector('meta[name=color-scheme]')?.content,
        }))
        const painted = await paintedColor(site.page, 'body', 'background-color')
        const expectedPaper = PAPER[scenario.theme ?? scenario.system]

        const s = soft()
        s.ok(found.atStylesheet, 'the stylesheet insertion was not observed, so the boot script position cannot be checked')
        s.equal(found.atStylesheet?.theme, scenario.theme, 'data-theme when the stylesheet is inserted')
        s.equal(found.atStylesheet?.js, true, 'the js class when the stylesheet is inserted')
        s.equal(found.theme, scenario.theme, 'data-theme after load')
        s.ok(painted && near(painted, expectedPaper), `body background: expected rgb(${expectedPaper}), received rgb(${painted})`)
        s.equal(themeColors, expectedColors, 'theme-color metas once hydrated')
        s.equal([found.lang, found.main, found.icon, found.colorScheme], ['en', true, '/favicon.ico', 'light dark'], 'shell: lang, main#main, icon, color-scheme meta')
        s.equal(site.problems, [], 'console problems')
        s.done()
      } finally {
        await site.close()
      }
    })
  }
})
