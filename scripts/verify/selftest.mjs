// Tests the harness itself: a wrong assertion must fail, and the message must say what was expected and
// what was received. If this passes, a green `npm run verify` can be trusted to mean something.
import http from 'node:http'
import { SetupError, VIEWPORTS, withSite } from './lib/browser.mjs'
import { assertEqual, assertOk, runSuite, soft } from './lib/check.mjs'

/** GET with a raw path. `fetch` would normalize `/../` away before it reaches the server. */
function rawGet(base, rawPath) {
  const { hostname, port } = new URL(base)
  return new Promise((resolve, reject) => {
    http.get({ hostname, port, path: rawPath }, (res) => {
      res.resume()
      res.on('end', () => resolve(res.statusCode))
    }).on('error', reject)
  })
}

let sample = ''

try {
  const outcome = await withSite(async ({ base, open }) => {
    // 1. A deliberately wrong assertion against the real page, as a suite would run it.
    const wrong = await runSuite(
      'selftest-wrong',
      async (t) => {
        await t.check('this page has 99 h1 elements (wrong on purpose)', async () => {
          const site = await open({ viewport: VIEWPORTS.desktop })
          try {
            await site.goto('/')
            assertEqual(await site.page.locator('h1').count(), 99, 'number of h1 elements on /')
          } finally {
            await site.close()
          }
        })
        await t.check('soft assertions report every mismatch, not only the first', () => {
          const s = soft()
          s.equal(1, 2, 'first value')
          s.equal('a', 'b', 'second value')
          s.done()
        })
        await t.check('a thrown Playwright-style error is reported, not swallowed', () => {
          throw new Error('Timeout 30000ms exceeded.\nCall log:\n  - waiting for selector\n  - more\n  - lines\n  - here')
        })
        await t.check('a passing check stays passing', () => assertOk(true, 'never shown'))
      },
      { quiet: true },
    )
    sample = wrong.results.find((r) => !r.ok)?.message ?? ''

    const server = await runSuite(
      'selftest-server',
      async (t) => {
        await t.check('GET / answers 200', async () => assertEqual((await fetch(base)).status, 200, 'status of /'))
        await t.check('an unknown path answers 404 with the 404 page', async () => {
          const response = await fetch(new URL('nope', base))
          assertEqual(response.status, 404, 'status of /nope')
          assertOk((await response.text()).includes('<html'), 'the body of /nope should be the prerendered 404.html')
        })
        await t.check('a path that climbs out of dist/ is refused', async () => {
          // The local server answers 404; Netlify's edge answers 400. Both refuse; what must never happen is a 200.
          for (const rawPath of ['/../package.json', '/%2e%2e/package.json']) {
            const status = await rawGet(base, rawPath)
            assertOk(status === 400 || status === 404, `status of ${rawPath}: expected 400 or 404, received ${status}`)
          }
        })
      },
      { quiet: true },
    )
    return { wrong, server }
  })

  const { wrong, server } = outcome
  const [h1, soft2, thrown, passing] = wrong.results
  const expectations = await runSuite('selftest', async (t) => {
    await t.check('a wrong assertion fails with expected and received in the message', () => {
      assertOk(h1 && !h1.ok, 'the wrong h1 assertion must be reported as a failure')
      assertOk(/expected: 99/.test(h1.message ?? '') && /received: \d+/.test(h1.message ?? ''), `message should show expected and received, got: ${h1?.message}`)
    })
    await t.check('soft assertions list both mismatches', () => {
      assertOk(soft2 && !soft2.ok && /first value/.test(soft2.message ?? '') && /second value/.test(soft2.message ?? ''), `both should be listed, got: ${soft2?.message}`)
    })
    await t.check('an unexpected error is reported and its call log is shortened', () => {
      assertOk(thrown && !thrown.ok && /unexpected error: Timeout/.test(thrown.message ?? ''), `got: ${thrown?.message}`)
      assertOk(!(thrown?.message ?? '').includes('here'), 'the call log must be cut to the first lines')
    })
    await t.check('one failing check does not stop the next', () => {
      assertEqual([wrong.passed, wrong.failed], [1, 3], 'passed and failed counts of the deliberately wrong suite')
      assertOk(passing?.ok, 'the last check must still run and pass')
    })
    await t.check('the static server behaves like Netlify (200, 404 page, no path escape)', () => {
      assertEqual([server.passed, server.failed], [3, 0], `server checks: ${server.results.filter((r) => !r.ok).map((r) => `${r.label}: ${r.message}`).join(' | ')}`)
    })
  })
  if (sample) console.log(`\nWhat a failure looks like (from the deliberately wrong check):\n${sample.replace(/^/gm, '    ')}`)
  process.exitCode = expectations.failed ? 1 : 0
} catch (error) {
  console.error(`\nverify:selftest could not run: ${error instanceof Error ? error.message : error}`)
  process.exitCode = error instanceof SetupError ? 2 : 1
}
