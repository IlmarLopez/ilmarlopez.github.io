// AC-05, first slice: with prefers-reduced-motion nothing is running and the flight is off.
// T-64 adds the static role list with final figures, the drawn chart bars, the open stack and the missing reveal.
import { main } from './lib/browser.mjs'
import { soft } from './lib/check.mjs'

await main('reduced', async (t, { open }) => {
  await t.check('prefers-reduced-motion: reduce on /', async () => {
    const site = await open({ reducedMotion: 'reduce' })
    try {
      await site.goto('/')
      // Give a late animation time to start: a rAF or a delayed class would show up here.
      await site.page.waitForTimeout(600)
      const found = await site.page.evaluate(() => ({
        emulated: matchMedia('(prefers-reduced-motion: reduce)').matches,
        running: document.getAnimations().map((animation) => animation.id || animation.constructor.name),
        flight: Boolean(document.querySelector('.flight')),
        js: document.documentElement.classList.contains('js'),
      }))
      const s = soft()
      s.equal(found.emulated, true, 'the browser reports prefers-reduced-motion: reduce (is the emulation working?)')
      s.equal(found.running, [], 'document.getAnimations()')
      s.equal(found.flight, false, 'the .flight class must not exist')
      s.equal(found.js, true, 'the boot script still ran (js class)')
      s.equal(site.problems, [], 'console problems')
      s.done()
    } finally {
      await site.close()
    }
  })
})
