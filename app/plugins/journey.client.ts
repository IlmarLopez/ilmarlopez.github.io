import { buildChart } from '~/utils/journey/chart'
import { mountFlight } from '~/utils/journey/flight'

/**
 * Brings the journey to life. The journey is static markup that never hydrates, so this is plain DOM code
 * that runs once Nuxt is ready and again after every navigation that lands on a page with a journey.
 *
 * The chart is always drawn. The camera only runs when `flight` is on <html>, which the boot script sets
 * before the first paint and never with reduced motion. If the camera cannot be set up, `flight` comes off
 * and the roles stay a readable list.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const root = document.documentElement
  // Tells the boot script's timeout that the bundle did start. `js` goes back on in case that timeout already
  // took it off because the bundle was only late.
  root.classList.add('js', 'app-ready')

  // Read now: while the app hydrates the router rewrites the address without its hash for a moment, so the
  // hash is already gone by the time the camera is set up. Only the first mount is a page opened at the hash.
  let openedAtExperience = location.hash === '#experience'
  let mountedOn: Element | null = null
  let teardown: (() => void) | null = null

  function mount(journey: HTMLElement) {
    const chart = buildChart(journey)
    const stopFlight = root.classList.contains('flight') ? mountFlight(journey, chart, { landOnExperience: openedAtExperience }) : null
    openedAtExperience = false
    teardown = () => {
      stopFlight?.()
      chart.destroy()
    }
  }

  function sync() {
    const journey = document.getElementById('journey')
    if (journey === mountedOn) return
    teardown?.()
    teardown = null
    mountedOn = journey
    if (!journey) return
    try {
      mount(journey)
    } catch (error) {
      console.error('The journey could not start; showing the plain list.', error)
      root.classList.remove('flight', 'flight-ready')
    }
  }

  onNuxtReady(sync)
  nuxtApp.hook('page:finish', sync)
})
