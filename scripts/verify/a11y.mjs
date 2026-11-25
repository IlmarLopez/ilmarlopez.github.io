// AC-15: axe finds no serious or critical violations, in light and dark.
// This is the automated half. The manual review (contrast of the error text in dark, 24×24 targets,
// focus not hidden by the sticky nav, heading order) is T-65 and goes in evidence/summary.md.
//
// The home page is audited twice:
//   - still: with prefers-reduced-motion, where the roles are an ordinary list. Every text on the page is
//     checked at the contrast the design tokens give it, with nothing excluded.
//   - flight: with the camera, with the camera at rest on each plane. The planes still ahead of the camera
//     fade by depth on purpose (--o 0.7, 0.4, 0.1), so their text cannot pass a contrast check while they
//     are in that state. They are the only thing left out, and they are measured in `still`. The plane in
//     front, the hero and the nav are checked in full.
import AxeBuilder from '@axe-core/playwright'
import { main } from './lib/browser.mjs'
import { assertOk } from './lib/check.mjs'
import { STOPS, flyTo, hasJourney } from './lib/journey.mjs'
import { ROUTES } from './lib/routes.mjs'

const BLOCKING = new Set(['serious', 'critical'])
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const AHEAD_ATTRIBUTE = 'data-axe-ahead'

/** Marks the planes that are still ahead of the camera, which are the ones faded by depth. */
const markAhead = (page) =>
  page.evaluate((attribute) => {
    for (const plane of document.querySelectorAll('.plane')) {
      plane.toggleAttribute(attribute, plane.style.getPropertyValue('--o') !== '1.000')
    }
  }, AHEAD_ATTRIBUTE)

/** The serious and critical violations on the page now, one line each. */
async function scan(page, { excludeAhead = false } = {}) {
  const builder = new AxeBuilder({ page }).withTags(TAGS)
  if (excludeAhead) builder.exclude(`[${AHEAD_ATTRIBUTE}]`)
  const { violations } = await builder.analyze()
  return violations
    .filter((violation) => BLOCKING.has(violation.impact ?? ''))
    .map((violation) => {
      const first = violation.nodes[0]?.target.join(' ') ?? '(no node)'
      return `- ${violation.id} [${violation.impact}]: ${violation.help} (${violation.nodes.length} node(s), first: ${first})`
    })
}

await main('a11y', async (t, { open }) => {
  for (const route of ROUTES) {
    for (const scheme of ['light', 'dark']) {
      await t.check(`${route} (${scheme}, still)`, async () => {
        const site = await open({ colorScheme: scheme, reducedMotion: 'reduce' })
        try {
          await site.goto(route)
          const lines = await scan(site.page)
          assertOk(lines.length === 0, `${lines.length} serious or critical violation(s)\n${lines.join('\n')}`)
        } finally {
          await site.close()
        }
      })

      const probe = await open({ colorScheme: scheme })
      const journey = await probe.goto(route).then(() => hasJourney(probe.page))
      await probe.close()
      if (!journey) continue

      await t.check(`${route} (${scheme}, flight: camera at rest on each plane)`, async () => {
        const site = await open({ colorScheme: scheme })
        try {
          await site.goto(route)
          const lines = []
          for (const p of STOPS) {
            await flyTo(site.page, p)
            await markAhead(site.page)
            const found = await scan(site.page, { excludeAhead: true })
            lines.push(...found.map((line) => `at ${p}: ${line}`))
          }
          assertOk(lines.length === 0, `${lines.length} serious or critical violation(s)\n${lines.join('\n')}`)
        } finally {
          await site.close()
        }
      })
    }
  }
})
