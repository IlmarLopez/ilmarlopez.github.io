// AC-08 and AC-10: the old CV URL still works and unknown URLs answer 404.
// Netlify applies `_redirects` before `netlify.toml`, and Nitro's `_redirects` ends in a catch-all
// `/* /404.html 404`, so a redirect declared only in netlify.toml never fires. This suite caught that in
// the first branch deploy; it runs against dist/ and, with VERIFY_BASE, against a deploy.
import { main } from './lib/browser.mjs'
import { assertEqual, assertOk } from './lib/check.mjs'

const OLD_CV = '/files/cv-en.pdf'
const NEW_CV = '/files/Ilmar-Lopez-CV.pdf'

await main('redirects', async (t, { base }) => {
  const get = (route, options = {}) => fetch(new URL(`.${route}`, base), { redirect: 'manual', ...options })

  await t.check(`${OLD_CV} answers 301 to ${NEW_CV}`, async () => {
    const response = await get(OLD_CV)
    assertEqual(response.status, 301, `status of ${OLD_CV}`)
    const location = new URL(response.headers.get('location') ?? '', base).pathname
    assertEqual(location, NEW_CV, `Location of ${OLD_CV}`)
  })

  await t.check(`${NEW_CV} answers 200 application/pdf`, async () => {
    const response = await get(NEW_CV)
    assertEqual(response.status, 200, `status of ${NEW_CV}`)
    assertEqual(response.headers.get('content-type')?.split(';')[0], 'application/pdf', `content-type of ${NEW_CV}`)
  })

  await t.check('an unknown URL answers 404 with an HTML page', async () => {
    const response = await get('/this-page-does-not-exist')
    assertEqual(response.status, 404, 'status of an unknown URL')
    assertOk((await response.text()).includes('<html'), 'the body of a 404 should be the prerendered 404.html')
  })
})
