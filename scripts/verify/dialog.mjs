// The "Say hi" dialog (RF-10, AC-07, M-12; T-36 to T-38 and T-82): it stays out of the first load, opens as a modal,
// validates, sends through Web3Forms, says so when it could not, and gives the mailto: link back when its code does
// not arrive.
//
// Nothing here can send a real message. Web3Forms is simulated in the browser, and the access key of the page is
// rewritten in the HTML that the server hands over: the one of the build (there may be none, or a real one) is
// never used, and a fake one stands in for it.
import AxeBuilder from '@axe-core/playwright'
import { eventually, main, VIEWPORTS } from './lib/browser.mjs'
import { assertEqual, assertOk, soft } from './lib/check.mjs'

const ENDPOINT = 'https://api.web3forms.com/submit'
const KEY = 'test-key-not-a-real-one'
const TRIGGER = '[data-action="say-hi"]'
const DIALOG = 'dialog#say-hi'
const SUBMIT = `${DIALOG} button[type="submit"]`
const NARROW = { name: 'narrow', width: 320, height: 568 }
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
/** The runtime config as the generated HTML carries it: `web3formsKey:""` when the build had no key. */
const KEY_IN_HTML = /web3formsKey:"[^"]*"/

const PERSON = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'I would like to talk about your serverless work.' }
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Gives the page `key` in place of the one its build has. Returns whether the page's HTML had one to replace. */
async function setKey(page, base, key) {
  const origin = new URL(base).origin
  const state = { replaced: false }
  await page.route(
    (url) => url.origin === origin,
    async (route) => {
      if (route.request().resourceType() !== 'document') return route.continue()
      const response = await route.fetch()
      const html = await response.text()
      state.replaced ||= KEY_IN_HTML.test(html)
      return route.fulfill({ response, body: html.replace(KEY_IN_HTML, `web3formsKey:"${key}"`) })
    },
  )
  return state
}

/**
 * Answers for Web3Forms. `mock.reply` is what the next calls get; `mock.calls` is what the page sent.
 * @returns {Promise<{ calls: { method: string, headers: Record<string, string>, body: any }[], reply: { status: number, body: unknown, raw?: string, delay: number, abort?: boolean } }>}
 */
async function mockWeb3forms(page) {
  const mock = { calls: [], reply: { status: 200, body: { success: true, body: { message: 'ok' } }, delay: 50 } }
  await page.route('https://api.web3forms.com/**', async (route) => {
    try {
      const request = route.request()
      if (request.method() === 'OPTIONS') return await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } })
      mock.calls.push({ method: request.method(), headers: request.headers(), body: request.postDataJSON() })
      await sleep(mock.reply.delay)
      if (mock.reply.abort) return await route.abort('failed')
      return await route.fulfill({ status: mock.reply.status, contentType: 'application/json', body: mock.reply.raw ?? JSON.stringify(mock.reply.body) })
    } catch {
      // The page closed or gave up (the dialog was closed while sending) before the answer was ready.
    }
  })
  return mock
}

/** Logs every click that reaches the window and whether something had already cancelled it. */
const CLICK_LOG = {
  fn: () => {
    window.__clicks = []
    window.addEventListener('click', (event) => window.__clicks.push({ trusted: event.isTrusted, prevented: event.defaultPrevented }))
  },
}

/** A visualViewport that a test can shrink, as the on-screen keyboard does. Headless Chromium has no keyboard. */
const FAKE_VISUAL_VIEWPORT = {
  fn: () => {
    const events = new EventTarget()
    let height = null
    const fake = {
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
      get height() {
        return height ?? window.innerHeight
      },
      get width() {
        return window.innerWidth
      },
      offsetTop: 0,
      offsetLeft: 0,
      pageTop: 0,
      pageLeft: 0,
      scale: 1,
    }
    Object.defineProperty(window, 'visualViewport', { value: fake, configurable: true })
    window.__keyboard = (shown) => {
      height = shown
      events.dispatchEvent(new Event('resize'))
    }
  },
}

/** Runs `body` with a page and closes it after. */
async function session(open, options, body) {
  const site = await open(options)
  try {
    return await body(site)
  } finally {
    await site.close()
  }
}

/** A page that was built with a key (a fake one) and whose Web3Forms is simulated, loaded at `/`. */
function keyed(base, open, options, body) {
  return session(open, options, async (site) => {
    const key = await setKey(site.page, base, KEY)
    const mock = await mockWeb3forms(site.page)
    await site.goto('/')
    assertOk(key.replaced, 'the HTML has no web3formsKey to replace, so the test cannot give the page a key. Did runtimeConfig change?')
    return body({ ...site, mock })
  })
}

async function openDialog(page, trigger = page.locator(TRIGGER).first()) {
  await trigger.click()
  await page.waitForSelector(`${DIALOG}[open]`)
}

const fillForm = async (page, person = PERSON) => {
  await page.fill('#hi-name', person.name)
  await page.fill('#hi-email', person.email)
  await page.fill('#hi-message', person.message)
}

/** Where the focus is, named by what a person would call it. */
const activeLabel = (page) =>
  page.evaluate(() => {
    const element = document.activeElement
    const dialog = document.querySelector('dialog#say-hi')
    return { inside: Boolean(dialog?.contains(element)), label: element?.getAttribute('name') ?? element?.textContent?.trim() ?? '' }
  })

const isOpen = (page) => page.evaluate(() => Boolean(document.querySelector('dialog#say-hi')?.open))

/** The state of one field: marked invalid or not, and the text its aria-describedby points at. */
const fieldState = (page, name) =>
  page.evaluate((fieldName) => {
    const control = document.querySelector(`#say-hi [name="${fieldName}"]`)
    return { invalid: control.getAttribute('aria-invalid'), help: document.getElementById(control.getAttribute('aria-describedby'))?.textContent?.trim() }
  }, name)

/** Which Say hi has the focus (its position among them), or what else has it. */
const focusedTrigger = (page) =>
  page.evaluate(() => {
    const index = [...document.querySelectorAll('[data-action="say-hi"]')].indexOf(document.activeElement)
    return index >= 0 ? index : `something else: ${document.activeElement?.tagName}.${document.activeElement?.className}`
  })

await main('dialog', async (t, { base, open }) => {
  await t.check('its code is not in the first load: it arrives on the first sign of intent, and there is no dialog until one is asked for', async () => {
    await session(open, {}, async (site) => {
      const scripts = []
      site.page.on('response', async (response) => {
        if (!new URL(response.url()).pathname.endsWith('.js')) return
        try {
          scripts.push({ url: new URL(response.url()).pathname, hasDialog: (await response.text()).includes('api.web3forms.com') })
        } catch {
          // A response that went away with the page is not one the visitor got.
        }
      })
      await site.goto('/')
      const s = soft()
      s.ok(scripts.length > 0, 'the page loaded no scripts, so there is nothing to look in')
      s.equal(scripts.filter((script) => script.hasDialog).map((script) => script.url), [], 'scripts on load that carry the dialog')
      s.equal(await site.page.locator('dialog').count(), 0, '<dialog> elements before the first request')
      s.done()

      await site.page.hover(TRIGGER)
      const warmed = await eventually(() => Promise.resolve(scripts.some((script) => script.hasDialog)), true)
      assertEqual(warmed, true, 'the dialog code is requested when the pointer reaches the button')
      assertEqual(await site.page.locator('dialog').count(), 0, 'warming the code does not open anything')
    })
  })

  await t.check('Say hi opens a modal dialog on its first field and does not follow the mailto link; the page behind does not scroll', async () => {
    await session(open, { initScripts: [CLICK_LOG] }, async (site) => {
      const { page } = site
      await site.goto('/')
      const before = await page.evaluate(() => ({ scroll: scrollY, gutter: getComputedStyle(document.documentElement).scrollbarGutter }))
      await openDialog(page)
      const found = await page.evaluate(() => {
        const dialog = document.querySelector('dialog#say-hi')
        return {
          modal: dialog.matches(':modal'),
          title: document.getElementById(dialog.getAttribute('aria-labelledby'))?.textContent,
          focus: document.activeElement?.getAttribute('name'),
          locked: getComputedStyle(document.documentElement).overflowY,
          scroll: scrollY,
          clicks: window.__clicks,
        }
      })
      const s = soft()
      s.equal(found.modal, true, 'the dialog is modal (the page behind is inert)')
      s.equal(found.title, 'Say hi', 'its accessible name')
      s.equal(found.focus, 'name', 'the focused control')
      s.equal(found.locked, 'hidden', 'the page behind does not scroll while it is open')
      s.equal(found.scroll, before.scroll, 'scroll position')
      s.equal(found.clicks, [{ trusted: true, prevented: true }], 'the click was cancelled, so the mail client is not opened')
      s.equal(before.gutter, 'stable', 'the scrollbar keeps its place when the page stops scrolling')
      s.done()
      await page.keyboard.press('Escape')
      assertEqual(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY), 'visible', 'the page scrolls again once it is closed')
    })
  })

  await t.check('Esc, Close and a click on the backdrop close it, and the focus goes back to the button that opened it', async () => {
    await session(open, {}, async (site) => {
      const { page } = site
      await site.goto('/')
      const ways = [
        ['Esc', () => page.keyboard.press('Escape')],
        ['Close', () => page.click(`${DIALOG} .head button`)],
        ['the backdrop', () => page.mouse.click(5, 5)],
      ]
      for (const [way, close] of ways) {
        await openDialog(page)
        await close()
        await eventually(() => isOpen(page), false)
        const s = soft()
        s.equal(await isOpen(page), false, `${way}: open`)
        s.equal(await focusedTrigger(page), 0, `${way}: the Say hi that has the focus (0 is the hero's)`)
        s.done()
      }

      // The other button, reached and pressed with the keyboard alone.
      const count = await page.locator(TRIGGER).count()
      assertOk(count >= 2, `expected a Say hi in the hero and another in Contact, found ${count}`)
      await page.locator(TRIGGER).last().focus()
      await page.keyboard.press('Enter')
      await page.waitForSelector(`${DIALOG}[open]`)
      await page.keyboard.press('Escape')
      await eventually(() => isOpen(page), false)
      assertEqual(await focusedTrigger(page), count - 1, "the Say hi that has the focus after Esc (the last is Contact's)")
    })
  })

  await t.check('a click inside the card, or a drag that starts inside and ends on the backdrop, does not close it', async () => {
    await session(open, {}, async (site) => {
      const { page } = site
      await site.goto('/')
      await openDialog(page)
      await page.click(`${DIALOG} .head h2`)
      const box = await page.locator('#hi-message').boundingBox()
      await page.mouse.move(box.x + 20, box.y + 20)
      await page.mouse.down()
      await page.mouse.move(5, 5)
      await page.mouse.up()
      await sleep(200)
      assertEqual(await isOpen(page), true, 'still open')
    })
  })

  await t.check('closing it does not take the focus from where it has gone since: its close event comes a task after the close', async () => {
    await session(open, {}, async (site) => {
      const { page } = site
      await site.goto('/')
      await openDialog(page)
      // Found by running the focus check under load: the close event came after the visitor's next move and sent the
      // focus back to the old opener. Here the move is made in the same task as the close, so it always happens.
      const kept = await page.evaluate(
        () =>
          new Promise((resolve) => {
            const dialog = document.querySelector('dialog#say-hi')
            const contact = [...document.querySelectorAll('[data-action="say-hi"]')].at(-1)
            dialog.close()
            contact.focus()
            setTimeout(() => resolve(document.activeElement === contact), 100)
          }),
      )
      assertEqual(kept, true, "the focus is still on Contact's Say hi, where it was moved after the close")
    })
  })

  await t.check('Tab and Shift+Tab never leave the dialog: they go around its six controls', async () => {
    await keyed(base, open, {}, async ({ page }) => {
      await openDialog(page)
      const forward = []
      for (let i = 0; i < 8; i += 1) {
        await page.keyboard.press('Tab')
        forward.push(await activeLabel(page))
      }
      const s = soft()
      s.equal(forward.map((where) => where.label), ['email', 'message', 'Send', 'me@ilmarlopez.com', 'Close', 'name', 'email', 'message'], 'Tab order, from the first field')
      s.ok(forward.every((where) => where.inside), 'every stop is inside the dialog')
      await page.focus(`${DIALOG} .head button`)
      const backward = []
      for (let i = 0; i < 3; i += 1) {
        await page.keyboard.press('Shift+Tab')
        backward.push(await activeLabel(page))
      }
      s.equal(backward.map((where) => where.label), ['me@ilmarlopez.com', 'Send', 'message'], 'Shift+Tab from Close wraps to the end')
      s.ok(backward.every((where) => where.inside), 'every stop going back is inside the dialog')
      s.done()
    })
  })

  await t.check('empty or wrong fields are marked and explained, nothing is sent, and the focus goes to the first one that needs it', async () => {
    await keyed(base, open, {}, async ({ page, mock }) => {
      await openDialog(page)
      const s = soft()
      const pristine = await Promise.all(['name', 'email', 'message'].map((field) => fieldState(page, field)))
      s.equal(pristine.map((field) => field.invalid), [null, null, null], 'a form nobody has touched is not marked')

      await page.click(SUBMIT)
      s.equal(await Promise.all(['name', 'email', 'message'].map((field) => fieldState(page, field))), [
        { invalid: 'true', help: 'Add your name so I can reply.' },
        { invalid: 'true', help: 'Add your email so I can reply.' },
        { invalid: 'true', help: 'Write a few words so I know what this is about.' },
      ], 'submitting empty: [name, email, message]')
      s.equal((await activeLabel(page)).label, 'name', 'focus after submitting empty')

      await page.fill('#hi-name', '   ')
      await page.press('#hi-name', 'Tab')
      s.equal((await fieldState(page, 'name')).help, 'Add your name so I can reply.', 'a name of spaces counts as empty')

      await page.fill('#hi-name', PERSON.name)
      s.equal((await fieldState(page, 'name')).invalid, null, 'typing a name clears its mark at once')
      await page.click(SUBMIT)
      s.equal((await activeLabel(page)).label, 'email', 'focus after the name is fixed')

      await page.fill('#hi-email', 'ada@')
      s.equal(await fieldState(page, 'email'), { invalid: 'true', help: 'Write it as name@example.com.' }, 'an address that is not one')
      await page.fill('#hi-email', PERSON.email)
      s.equal((await fieldState(page, 'email')).invalid, null, 'a valid address clears the mark')
      s.equal(mock.calls.length, 0, 'requests made while the form was invalid')
      s.done()
    })
  })

  await t.check('a valid form is sent once as Web3Forms asks, shows it is sending, and ends on a confirmation that takes the focus', async () => {
    await keyed(base, open, {}, async ({ page, mock, problems, crossOrigin }) => {
      mock.reply.delay = 700
      await openDialog(page)
      await fillForm(page, { ...PERSON, message: `  ${PERSON.message}  ` })
      await page.click(SUBMIT)

      const sending = await eventually(
        () =>
          page.evaluate(() => {
            const button = document.querySelector('#say-hi button[type="submit"]')
            const controls = ['#hi-name', '#hi-email', '#hi-message'].map((selector) => document.querySelector(selector))
            return { busy: button.getAttribute('aria-busy'), text: button.textContent.trim(), readonly: controls.every((control) => control.readOnly) }
          }),
        { busy: 'true', text: 'Sending', readonly: true },
      )
      assertEqual(sending, { busy: 'true', text: 'Sending', readonly: true }, 'while the request is in flight')
      await page.click(SUBMIT)
      await page.waitForSelector(`${DIALOG} .sent:not([hidden])`)

      const arrived = await eventually(() => page.evaluate(() => ({ in: document.querySelector('#say-hi .sent').classList.contains('is-in'), focused: document.activeElement?.classList.contains('sent') })), { in: true, focused: true })
      const confirmation = await page.evaluate(() => ({
        title: document.querySelector('#say-hi .sent-title')?.textContent,
        strong: [...document.querySelectorAll('#say-hi .sent strong')].map((element) => element.textContent),
        formHidden: document.querySelector('#say-hi form').hidden,
        role: document.querySelector('#say-hi .sent').getAttribute('role'),
      }))
      const [call] = mock.calls
      const s = soft()
      s.equal(mock.calls.length, 1, 'requests sent (pressing Send again while sending must not send twice)')
      s.equal(call?.method, 'POST', 'method')
      s.ok(call?.headers['content-type']?.includes('application/json'), `Content-Type is ${call?.headers['content-type']}: a form-encoded body gets a redirect that the browser reports as a CORS error`)
      s.ok(call?.headers.accept?.includes('application/json'), `Accept is ${call?.headers.accept}`)
      s.equal(call?.body, { access_key: KEY, subject: 'New message from ilmarlopez.com', name: PERSON.name, email: PERSON.email, message: PERSON.message, botcheck: false }, 'the body Web3Forms receives')
      s.equal(arrived, { in: true, focused: true }, 'the confirmation has arrived and has the focus')
      s.equal(confirmation, { title: 'Sent.', strong: [PERSON.name, PERSON.email], formHidden: true, role: 'status' }, 'the confirmation')
      s.equal(crossOrigin, [ENDPOINT], 'requests that left the site')
      s.equal(problems, [], 'console errors and failed requests')
      s.done()

      await page.click(`${DIALOG} .sent button`)
      await eventually(() => isOpen(page), false)
      await openDialog(page)
      const again = await page.evaluate(() => ({
        values: ['#hi-name', '#hi-email', '#hi-message'].map((selector) => document.querySelector(selector).value),
        formHidden: document.querySelector('#say-hi form').hidden,
        sentHidden: document.querySelector('#say-hi .sent').hidden,
      }))
      assertEqual(again, { values: ['', '', ''], formHidden: false, sentHidden: true }, 'opened again after a send, it is a blank form')
    })
  })

  await t.check('when Web3Forms refuses or cannot be reached, it says so, keeps what was typed, and a retry goes through', async () => {
    await keyed(base, open, {}, async ({ page, mock }) => {
      await openDialog(page)
      await fillForm(page)
      const cases = [
        ['500 and success false', { status: 500, body: { success: false } }],
        ['429, too many sends', { status: 429, body: { success: false, message: 'Rate limit' } }],
        ['200 that does not say success', { status: 200, body: { success: false } }],
        ['200 that is not JSON', { status: 200, raw: '<html>maintenance</html>' }],
        ['no connection', { abort: true }],
      ]
      const s = soft()
      for (const [index, [label, reply]] of cases.entries()) {
        mock.reply = { delay: 50, status: 200, body: {}, ...reply }
        await page.click(SUBMIT)
        await eventually(() => Promise.resolve(mock.calls.length), index + 1)
        const settled = await eventually(
          () => page.evaluate(() => ({ busy: document.querySelector('#say-hi button[type="submit"]').getAttribute('aria-busy'), shown: document.querySelector('#say-hi .status').hasAttribute('data-shown') })),
          { busy: 'false', shown: true },
          { timeout: 4000 },
        )
        const found = await page.evaluate(() => ({
          alert: document.querySelector('#say-hi .status').textContent.replace(/\s+/g, ' ').trim(),
          role: document.querySelector('#say-hi .status').getAttribute('role'),
          values: ['#hi-name', '#hi-email', '#hi-message'].map((selector) => document.querySelector(selector).value),
          sentShown: !document.querySelector('#say-hi .sent').hidden,
          label: document.querySelector('#say-hi button[type="submit"]').textContent.trim(),
        }))
        s.equal(settled, { busy: 'false', shown: true }, `${label}: the dialog is back to idle with the notice shown`)
        s.equal(found.alert, 'That did not go through. Your message is still here. Try again, or write to me@ilmarlopez.com.', `${label}: notice`)
        s.equal(found.role, 'alert', `${label}: the notice is announced`)
        s.equal(found.values, [PERSON.name, PERSON.email, PERSON.message], `${label}: what was typed`)
        s.equal([found.sentShown, found.label], [false, 'Send'], `${label}: [confirmation shown, button label]`)
      }
      mock.reply = { status: 200, body: { success: true }, delay: 50 }
      await page.click(SUBMIT)
      await page.waitForSelector(`${DIALOG} .sent:not([hidden])`)
      s.equal(mock.calls.length, cases.length + 1, 'requests: one per attempt')
      s.done()
    })
  })

  await t.check('the honeypot is out of sight and out of the Tab order, and a ticked one is sent as botcheck true', async () => {
    await keyed(base, open, {}, async ({ page, mock }) => {
      await openDialog(page)
      const trap = await page.evaluate(() => {
        const input = document.querySelector('#say-hi [name="botcheck"]')
        const box = input.getBoundingClientRect()
        return { hidden: input.getAttribute('aria-hidden'), tabindex: input.getAttribute('tabindex'), offscreen: box.right < 0, opacity: getComputedStyle(input).opacity }
      })
      assertEqual(trap, { hidden: 'true', tabindex: '-1', offscreen: true, opacity: '0' }, 'the honeypot')
      await fillForm(page)
      await page.evaluate(() => {
        document.querySelector('#say-hi [name="botcheck"]').checked = true
      })
      await page.click(SUBMIT)
      await eventually(() => Promise.resolve(mock.calls.length), 1)
      assertEqual(mock.calls[0]?.body.botcheck, true, 'botcheck in the body')
    })
  })

  await t.check('closing it while it sends cancels the request quietly: no error, what was typed is kept, no confirmation arrives later', async () => {
    await keyed(base, open, {}, async ({ page, mock }) => {
      mock.reply.delay = 1500
      await openDialog(page)
      await fillForm(page)
      await page.click(SUBMIT)
      await eventually(() => Promise.resolve(mock.calls.length), 1)
      await page.keyboard.press('Escape')
      await sleep(1800)
      await openDialog(page)
      const found = await page.evaluate(() => ({
        shown: document.querySelector('#say-hi .status').hasAttribute('data-shown'),
        busy: document.querySelector('#say-hi button[type="submit"]').getAttribute('aria-busy'),
        name: document.querySelector('#hi-name').value,
        sentShown: !document.querySelector('#say-hi .sent').hidden,
      }))
      assertEqual(found, { shown: false, busy: 'false', name: PERSON.name, sentShown: false }, 'after closing during the send and opening again')
    })
  })

  await t.check('without a key (a local build, or a deploy that forgot the variable) Send is off, nothing is ever sent, and the address is offered', async () => {
    await session(open, {}, async (site) => {
      const { page } = site
      const key = await setKey(page, base, '')
      const mock = await mockWeb3forms(page)
      await site.goto('/')
      assertOk(key.replaced, 'the HTML has no web3formsKey to replace')
      await openDialog(page)
      await fillForm(page)
      // Enter in a field submits a form whose button is on; with the button off it must do nothing.
      await page.press('#hi-name', 'Enter')
      await sleep(300)
      const found = await page.evaluate(() => ({
        disabled: document.querySelector('#say-hi button[type="submit"]').disabled,
        intro: document.querySelector('#say-hi .intro p').textContent.replace(/\s+/g, ' ').trim(),
        link: document.querySelector('#say-hi .intro a')?.getAttribute('href'),
      }))
      const s = soft()
      s.equal(found, { disabled: true, intro: 'This version of the site has no key to send with. Write to me@ilmarlopez.com instead.', link: 'mailto:me@ilmarlopez.com' }, 'the dialog without a key')
      s.equal(mock.calls.length, 0, 'requests sent')
      s.done()
    })
  })

  await t.check('if its code does not arrive, the click is given back to the browser, so Say hi still opens the mail client', async () => {
    await session(open, { initScripts: [CLICK_LOG] }, async (site) => {
      const { page } = site
      await site.goto('/')
      await page.route((url) => url.pathname.startsWith('/_nuxt/') && url.pathname.endsWith('.js'), (route) => route.abort('failed'))
      await page.locator(TRIGGER).first().click()
      const clicks = await eventually(() => page.evaluate(() => window.__clicks), [
        { trusted: true, prevented: true },
        { trusted: false, prevented: false },
      ])
      const s = soft()
      s.equal(clicks, [{ trusted: true, prevented: true }, { trusted: false, prevented: false }], 'clicks seen by the window: the real one cancelled, then the one given back (not cancelled)')
      s.equal(await page.locator('dialog').count(), 0, 'dialog elements')
      s.done()
    })
  })

  await t.check('with reduced motion the confirmation arrives at once; without it, after the form has receded', async () => {
    const gaps = {}
    for (const [name, reducedMotion] of [['reduced', 'reduce'], ['motion', 'no-preference']]) {
      await keyed(base, open, { reducedMotion }, async ({ page }) => {
        await openDialog(page)
        await fillForm(page)
        // The time between the form starting to leave and the confirmation being there.
        await page.evaluate(() => {
          const dialog = document.querySelector('#say-hi')
          const confirmation = dialog.querySelector('.sent')
          window.__gap = new Promise((resolve) => {
            let start = 0
            new MutationObserver(() => {
              if (!start && dialog.dataset.state === 'sent') start = performance.now()
              if (start && !confirmation.hidden) resolve(performance.now() - start)
            }).observe(dialog, { attributes: true, subtree: true, attributeFilter: ['data-state', 'hidden'] })
          })
        })
        await page.click(SUBMIT)
        gaps[name] = Math.round(await page.evaluate(() => window.__gap))
      })
    }
    const s = soft()
    s.ok(gaps.reduced < 100, `reduced motion: the confirmation took ${gaps.reduced} ms after the send, expected under 100`)
    s.ok(gaps.motion >= 300, `motion on: the confirmation took ${gaps.motion} ms, expected at least the 320 ms the form takes to leave`)
    s.done()
  })

  await t.check('on a phone it is a sheet on the bottom edge that rises above the keyboard and keeps Send in view', async () => {
    await keyed(base, open, { viewport: VIEWPORTS.phone, reducedMotion: 'reduce', initScripts: [FAKE_VISUAL_VIEWPORT] }, async ({ page }) => {
      await openDialog(page)
      const geometry = () =>
        page.evaluate(() => {
          const sheet = document.querySelector('#say-hi').getBoundingClientRect()
          const send = document.querySelector('#say-hi button[type="submit"]').getBoundingClientRect()
          return { left: Math.round(sheet.left), right: Math.round(sheet.right), top: Math.round(sheet.top), bottom: Math.round(sheet.bottom), sendBottom: Math.round(send.bottom), sendTop: Math.round(send.top), inner: innerHeight }
        })
      const s = soft()
      const resting = await eventually(async () => (await geometry()).bottom, VIEWPORTS.phone.height)
      const idle = await geometry()
      s.equal([idle.left, idle.right, resting], [0, VIEWPORTS.phone.width, VIEWPORTS.phone.height], 'sheet [left, right, bottom] without the keyboard')

      await page.evaluate(() => window.__keyboard(480))
      const raised = await eventually(async () => (await geometry()).bottom, 480)
      const up = await geometry()
      s.equal(raised, 480, 'the bottom of the sheet sits on the top of the keyboard')
      s.ok(up.top >= 0, `the sheet stays inside the screen: top is ${up.top}`)
      s.ok(up.sendBottom <= 480 && up.sendTop >= up.top, `Send is in view above the keyboard: ${up.sendTop} to ${up.sendBottom}`)

      await page.evaluate(() => window.__keyboard(null))
      s.equal(await eventually(async () => (await geometry()).bottom, VIEWPORTS.phone.height), VIEWPORTS.phone.height, 'the sheet comes back down with the keyboard')
      s.done()
    })
  })

  await t.check('at 320 px nothing overflows, not even with a long name and a long address on the confirmation', async () => {
    await keyed(base, open, { viewport: NARROW }, async ({ page }) => {
      await openDialog(page)
      const overflow = () =>
        page.evaluate(() => {
          const dialog = document.querySelector('#say-hi')
          const longest = [...dialog.querySelectorAll('.sent strong, input, textarea, button')].filter((element) => element.getClientRects().length > 0).map((element) => element.getBoundingClientRect().right)
          return { page: document.documentElement.scrollWidth - document.documentElement.clientWidth, dialog: dialog.scrollWidth - dialog.clientWidth, rightmost: Math.round(Math.max(...longest)), width: innerWidth }
        })
      const form = await overflow()
      await fillForm(page, { name: 'Maximiliano-Bartholomew-Wolfeschlegelsteinhausenbergerdorff', email: 'a-very-long-address-with-many-parts-for-testing-overflow@some-extremely-long-domain-name-example.com', message: PERSON.message })
      await page.click(SUBMIT)
      await page.waitForSelector(`${DIALOG} .sent:not([hidden])`)
      await eventually(() => page.evaluate(() => document.querySelector('#say-hi .sent').classList.contains('is-in')), true)
      const sent = await overflow()
      const s = soft()
      s.equal([form.page, form.dialog], [0, 0], 'form: horizontal overflow [page, dialog]')
      s.equal([sent.page, sent.dialog], [0, 0], 'confirmation: horizontal overflow [page, dialog]')
      s.ok(sent.rightmost <= sent.width, `confirmation: the rightmost edge is at ${sent.rightmost} px of ${sent.width}`)
      s.done()
    })
  })

  await t.check('without JS there is no dialog and Say hi stays a mailto: link', async () => {
    await session(open, { javaScriptEnabled: false }, async (site) => {
      const response = await site.goto('/')
      const html = await response.text()
      const s = soft()
      s.equal(await site.page.locator('dialog').count(), 0, 'dialog elements')
      s.ok(!html.includes('api.web3forms.com'), 'the page carries the Web3Forms address')
      s.equal(await site.page.locator(TRIGGER).first().getAttribute('href'), 'mailto:me@ilmarlopez.com', 'href of Say hi')
      s.done()
    })
  })

  const BLOCKING = new Set(['serious', 'critical'])
  for (const scheme of ['light', 'dark']) {
    await t.check(`axe finds no serious or critical violation in it (${scheme}): idle, with errors, and on the confirmation`, async () => {
      await keyed(base, open, { colorScheme: scheme, reducedMotion: 'reduce' }, async ({ page }) => {
        const scan = async () => {
          const { violations } = await new AxeBuilder({ page }).include(DIALOG).withTags(TAGS).analyze()
          return violations
            .filter((violation) => BLOCKING.has(violation.impact ?? ''))
            .map((violation) => `- ${violation.id} [${violation.impact}]: ${violation.help} (${violation.nodes.length} node(s), first: ${violation.nodes[0]?.target.join(' ') ?? '(none)'})`)
        }
        const lines = []
        await openDialog(page)
        lines.push(...(await scan()).map((line) => `idle: ${line}`))
        await page.click(SUBMIT)
        lines.push(...(await scan()).map((line) => `with errors: ${line}`))
        await fillForm(page)
        await page.click(SUBMIT)
        await page.waitForSelector(`${DIALOG} .sent:not([hidden])`)
        lines.push(...(await scan()).map((line) => `confirmation: ${line}`))
        assertOk(lines.length === 0, `${lines.length} serious or critical violation(s)\n${lines.join('\n')}`)
      })
    })
  }
})
