// Helpers for the suites that drive the home page's camera flight.

/** The depth of the journey at each plane, with the hero as plane 0: Now, Stori, Home & Media, California Web, UTT. */
export const STOPS = [0, 0.25, 0.5, 0.75, 1]

/** Whether the page has a journey at all. Other routes (/versions, the 404 page) do not. */
export const hasJourney = (page) => page.evaluate(() => Boolean(document.getElementById('journey')))

/**
 * Scrolls so the camera should be at progress `p` (0 to 1) and waits until it has got there. The camera eases
 * toward the scroll, so a screenshot or a read taken right after scrolling would catch it mid-flight.
 * @param {import('playwright').Page} page
 * @param {number} p
 */
export async function flyTo(page, p) {
  await page.evaluate((progress) => {
    const journey = document.getElementById('journey')
    const pin = journey.querySelector('.viewport')
    const run = journey.offsetHeight - pin.offsetHeight
    const stick = parseFloat(getComputedStyle(pin).top) || 0
    window.scrollTo({ top: journey.getBoundingClientRect().top + window.scrollY - stick + progress * run, behavior: 'instant' })
  }, p)
  await page.waitForFunction(
    (progress) => Math.abs(parseFloat(document.getElementById('journey').style.getPropertyValue('--p')) - progress) < 0.002,
    p,
    { timeout: 4000 },
  )
}
