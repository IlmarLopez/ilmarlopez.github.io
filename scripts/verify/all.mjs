// Runs every suite in order against the same build and prints a summary.
// Exit code: 0 all green, 1 a check failed, 2 a suite could not run (no dist/, no Chromium).
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const SUITES = ['selftest', 'theme', 'layout', 'nojs', 'reduced', 'a11y', 'js']

const outcomes = SUITES.map((name) => {
  const file = fileURLToPath(new URL(`./${name}.mjs`, import.meta.url))
  const { status } = spawnSync(process.execPath, [file], { stdio: 'inherit' })
  return { name, status: status ?? 2 }
})

console.log('\nSummary')
for (const { name, status } of outcomes) {
  console.log(`  ${status === 0 ? 'OK     ' : status === 1 ? 'FAILED ' : 'NO RUN '} verify:${name}`)
}
process.exitCode = Math.max(...outcomes.map((outcome) => outcome.status))
