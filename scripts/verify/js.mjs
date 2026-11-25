// AC-13 / O-3 / RNF-03: the JavaScript that `/` requests before any scroll or interaction weighs at most
// 120 KB gzip. Prints every script with its size and writes the raw numbers to .tmp/js-weight.json.
// Usage: npm run verify:js            (budget 120 KB)
//        node scripts/verify/js.mjs --budget=100
// T-33 uses this as the budget gate and T-68 repeats it on the Deploy Preview with VERIFY_BASE.
// T-68 also checks that the Work, dialog and palette chunks are not requested before their trigger.
import fs from 'node:fs'
import { gzipSync } from 'node:zlib'
import { main, VIEWPORTS } from './lib/browser.mjs'
import { assertOk } from './lib/check.mjs'

const DEFAULT_BUDGET_KB = 120
const KB = 1000

const budgetArg = process.argv.find((arg) => arg.startsWith('--budget='))
const budgetKb = budgetArg ? Number(budgetArg.slice('--budget='.length)) : DEFAULT_BUDGET_KB
if (!Number.isFinite(budgetKb) || budgetKb <= 0) {
  console.error(`--budget must be a positive number of KB, got "${budgetArg}"`)
  process.exit(2)
}

const kb = (bytes) => (bytes / KB).toFixed(1)

await main('js', async (t, { open, base }) => {
  const site = await open({ viewport: VIEWPORTS.desktop })
  /** @type {{ url: string, bytes: number, gzip: number }[]} */
  const files = []
  const pending = []
  site.page.on('response', (response) => {
    const url = new URL(response.url())
    const type = response.headers()['content-type'] ?? ''
    if (!/\.m?js$/.test(url.pathname) && !/javascript/.test(type)) return
    pending.push(
      response.body().then((body) => {
        // gzip level 9 is the best case for any host. Netlify serves Brotli, which is smaller: this is the stricter measure.
        files.push({ url: url.pathname, bytes: body.length, gzip: gzipSync(body, { level: 9 }).length })
      }),
    )
  })
  let inline = []
  try {
    await site.goto('/')
    await Promise.all(pending)
    // Inline scripts have no request. Executable ones are reported apart; JSON data blocks are not code.
    inline = await site.page.evaluate(() =>
      [...document.scripts]
        .filter((script) => !script.src && !/json/.test(script.type))
        .map((script) => new TextEncoder().encode(script.textContent ?? '').length),
    )
  } finally {
    await site.close()
  }

  files.sort((a, b) => b.gzip - a.gzip)
  const totalGzip = files.reduce((sum, file) => sum + file.gzip, 0)
  const totalRaw = files.reduce((sum, file) => sum + file.bytes, 0)
  const inlineBytes = inline.reduce((sum, bytes) => sum + bytes, 0)

  console.log(`  ${'gzip KB'.padStart(8)} ${'raw KB'.padStart(8)}  script`)
  for (const file of files) console.log(`  ${kb(file.gzip).padStart(8)} ${kb(file.bytes).padStart(8)}  ${file.url}`)
  console.log(`  ${kb(totalGzip).padStart(8)} ${kb(totalRaw).padStart(8)}  total of ${files.length} requested script(s); inline code: ${inlineBytes} bytes in ${inline.length} script(s)`)

  fs.mkdirSync('.tmp', { recursive: true })
  const raw = { measuredAt: new Date().toISOString(), base, route: '/', budgetKb, totalGzipBytes: totalGzip, totalRawBytes: totalRaw, inlineBytes, files }
  fs.writeFileSync('.tmp/js-weight.json', `${JSON.stringify(raw, null, 2)}\n`)

  await t.check(`JS requested by / on load is at most ${budgetKb} KB gzip`, () => {
    assertOk(totalGzip <= budgetKb * KB, `${kb(totalGzip)} KB gzip is over the ${budgetKb} KB budget by ${kb(totalGzip - budgetKb * KB)} KB. Largest: ${files.slice(0, 3).map((f) => `${f.url} ${kb(f.gzip)} KB`).join(', ')}`)
  })
})
