// AC-03, first slice: at 360, 768, 1280 and 1920 px the page loads cleanly and does not scroll sideways.
// T-63 adds the hero fitting inside 1280×800 and the 1440 px container at 1920.
import { main, VIEWPORTS } from './lib/browser.mjs'
import { soft } from './lib/check.mjs'

await main('layout', async (t, { open }) => {
  for (const viewport of Object.values(VIEWPORTS)) {
    await t.check(`${viewport.width}×${viewport.height} (${viewport.name})`, async () => {
      const site = await open({ viewport })
      try {
        const response = await site.goto('/')
        const widths = await site.page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }))
        const s = soft()
        s.equal(response.status(), 200, 'HTTP status of /')
        s.equal(widths.scroll, widths.client, 'document scrollWidth equals clientWidth (no horizontal scroll)')
        s.equal(site.problems, [], 'console problems')
        s.equal(site.crossOrigin, [], 'requests to other origins')
        s.done()
      } finally {
        await site.close()
      }
    })
  }
})
