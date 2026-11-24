import { isDeepStrictEqual } from 'node:util'

/** A failed assertion. The message is meant to be read by a person, not parsed. */
export class CheckError extends Error {
  name = 'CheckError'
}

const show = (value) => (value === undefined ? 'undefined' : JSON.stringify(value))

function describe(what, expected, received) {
  return `${what}\n  expected: ${show(expected)}\n  received: ${show(received)}`
}

/** Throws at the first mismatch. Use it when one failure makes the rest of the check meaningless. */
export function assertEqual(received, expected, what) {
  if (!isDeepStrictEqual(received, expected)) throw new CheckError(describe(what, expected, received))
}

export function assertOk(condition, what) {
  if (!condition) throw new CheckError(what)
}

/**
 * Collects every mismatch and throws them together in `done()`, so one run shows all that is wrong
 * instead of only the first.
 */
export function soft() {
  const failures = []
  return {
    equal(received, expected, what) {
      if (!isDeepStrictEqual(received, expected)) failures.push(describe(what, expected, received))
    },
    ok(condition, what) {
      if (!condition) failures.push(what)
    },
    done() {
      if (failures.length) throw new CheckError(failures.join('\n'))
    },
  }
}

const indent = (text, pad) =>
  text
    .split('\n')
    .map((line) => pad + line)
    .join('\n')

/** Playwright errors carry a long call log; the first lines say what went wrong. */
function messageOf(error) {
  if (error instanceof CheckError) return error.message
  const text = error instanceof Error ? error.message : String(error)
  return `unexpected error: ${text.split('\n').slice(0, 4).join('\n')}`
}

/**
 * Runs `body`, which declares checks with `t.check(label, fn)`. Checks run in order and one failing
 * does not stop the next.
 * @param {string} name
 * @param {(t: { check: (label: string, fn: () => unknown) => Promise<void> }) => Promise<void>} body
 * @param {{ quiet?: boolean }} [options]
 * @returns {Promise<{ name: string, results: { label: string, ok: boolean, message?: string }[], passed: number, failed: number }>}
 */
export async function runSuite(name, body, { quiet = false } = {}) {
  const results = []
  const log = (line) => {
    if (!quiet) console.log(line)
  }
  log(`\nverify:${name}`)
  const t = {
    async check(label, fn) {
      try {
        await fn()
        results.push({ label, ok: true })
        log(`  OK    ${label}`)
      } catch (error) {
        const message = messageOf(error)
        results.push({ label, ok: false, message })
        log(`  FAIL  ${label}\n${indent(message, '        ')}`)
      }
    },
  }
  await body(t)
  const failed = results.filter((r) => !r.ok).length
  const passed = results.length - failed
  log(`  ${results.length} checks: ${passed} passed, ${failed} failed`)
  return { name, results, passed, failed }
}
