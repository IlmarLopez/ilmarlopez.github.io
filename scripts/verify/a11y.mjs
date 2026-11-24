// AC-15: axe finds no serious or critical violations, in light and dark.
// This is the automated half. The manual review (contrast of the error text in dark, 24×24 targets,
// focus not hidden by the sticky nav, heading order) is T-65 and goes in evidence/summary.md.
import AxeBuilder from '@axe-core/playwright'
import { main } from './lib/browser.mjs'
import { assertOk } from './lib/check.mjs'
import { ROUTES } from './lib/routes.mjs'

const BLOCKING = new Set(['serious', 'critical'])
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

await main('a11y', async (t, { open }) => {
  for (const route of ROUTES) {
    for (const scheme of ['light', 'dark']) {
      await t.check(`${route} (${scheme})`, async () => {
        const site = await open({ colorScheme: scheme })
        try {
          await site.goto(route)
          const { violations } = await new AxeBuilder({ page: site.page }).withTags(TAGS).analyze()
          const blocking = violations.filter((violation) => BLOCKING.has(violation.impact ?? ''))
          const lines = blocking.map((violation) => {
            const first = violation.nodes[0]?.target.join(' ') ?? '(no node)'
            return `- ${violation.id} [${violation.impact}]: ${violation.help} (${violation.nodes.length} node(s), first: ${first})`
          })
          assertOk(blocking.length === 0, `${blocking.length} serious or critical violation(s)\n${lines.join('\n')}`)
        } finally {
          await site.close()
        }
      })
    }
  }
})
