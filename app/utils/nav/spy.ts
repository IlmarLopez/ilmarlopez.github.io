/**
 * The nav's "you are here": `aria-current="location"` on the link of the section being read, and a coral line
 * under it that slides from link to link (M-17). Plain DOM code, like the journey: SiteNav hydrates, but it has no
 * state of its own for this, and a scroll listener that sets two attributes needs no reactivity.
 *
 * Which section is being read is decided by a reading line at 45 % of the viewport: the last section whose top
 * is above it. Two cases need more than that, and both were found on a screen tall enough to show the whole bottom
 * of the page at once, where the links seemed dead:
 * - The page cannot scroll far enough to bring the last sections to the line, so a click on "Tools" left "Work"
 *   lit. The click is remembered as an intent and shown until the visitor scrolls on their own.
 * - At the very end of the page the last link is lit, because there is nothing further to read.
 */

export type NavKey = 'experience' | 'work' | 'tools' | 'contact'

interface Section {
  /** The nav link this section lights. About has none, so while it is on screen nothing is lit. */
  key: NavKey | null
  id: string
}

/** The sections of the home, in page order. */
const SECTIONS: readonly Section[] = [
  { key: 'experience', id: 'journey' },
  { key: null, id: 'about' },
  { key: 'work', id: 'work' },
  { key: 'tools', id: 'tools' },
  { key: 'contact', id: 'contact' },
]

const NAV_KEYS: ReadonlySet<string> = new Set<NavKey>(['experience', 'work', 'tools', 'contact'])

const isNavKey = (value: string): value is NavKey => NAV_KEYS.has(value)

/** A section counts as being read once its top is above this share of the viewport height. */
const READING_LINE = 0.45
/** In the flight, "Experience" lights once the camera has left the hero for the first role. */
const FLIGHT_OPENS_AT = 0.12
/** Scrolling that stops for this long has settled. A glide that stalls for longer than this (a busy frame) would be read as the visitor's. */
const SETTLE_MS = 250
/** Once settled, a page that moves further than this was moved by the visitor (smaller shifts are layout drift). */
const MOVED_PX = 12
/** How long the arrival mark stays on a heading (M-20): it draws, holds and fades. The stylesheet's animation lasts as long. */
const ARRIVAL_MS = 1900
const SCROLL_KEYS: ReadonlySet<string> = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

export interface NavSpy {
  /** Read the page again, for when a navigation swapped the sections. */
  refresh: () => void
  destroy: () => void
}

/**
 * @param nav The `<nav>` that holds the links and the `.nav-ind` line. It must be the offset parent of the links.
 * @param startHash `location.hash` as it was when the app started: the router drops it while hydrating.
 */
export function mountNavSpy(nav: HTMLElement, startHash: string): NavSpy {
  const root = document.documentElement
  const indicator = nav.querySelector<HTMLElement>('.nav-ind')
  const links = new Map<NavKey, HTMLAnchorElement>()
  for (const link of nav.querySelectorAll<HTMLAnchorElement>('a[href*="#"]')) {
    const key = link.hash.slice(1)
    if (isNavKey(key)) links.set(key, link)
  }

  let lit: NavKey | null = null
  const opened = startHash.slice(1)
  // The link the visitor chose (or the page was opened at), held until they scroll on their own.
  let intent: NavKey | null = isNavKey(opened) ? opened : null

  function experienceIsOpen(line: number): boolean {
    const journey = document.getElementById('journey')
    if (!journey) return false
    // With the camera running its own progress decides; as a list the heading is the marker.
    if (root.classList.contains('flight-ready')) return Number.parseFloat(journey.style.getPropertyValue('--p')) > FLIGHT_OPENS_AT
    const heading = document.getElementById('experience')
    return heading !== null && heading.getBoundingClientRect().top <= line
  }

  function atEndOfPage(): boolean {
    return scrollY > 1 && innerHeight + scrollY >= root.scrollHeight - 2
  }

  /** The link the page itself points at, from where it is scrolled. */
  function locate(): NavKey | null {
    const line = innerHeight * READING_LINE
    let key: NavKey | null = null
    for (const section of SECTIONS) {
      const element = document.getElementById(section.id)
      if (element && element.getBoundingClientRect().top <= line) key = section.key
    }
    if (key === 'experience' && !experienceIsOpen(line)) key = null
    const last = SECTIONS.at(-1)
    if (last && document.getElementById(last.id) && atEndOfPage()) key = last.key
    return key
  }

  // The visitor's choice wins until they scroll on their own. It is not dropped when the page happens to agree
  // for a moment: in a window where Tools and Contact are both on screen at the end of the page, the glide passes
  // through "Tools" and then the end of the page says "Contact", and the click would be undone on the last frame.
  function wanted(): NavKey | null {
    return intent ?? locate()
  }

  function place() {
    if (!indicator) return
    const link = lit ? links.get(lit) : undefined
    // At 60rem and below the links are hidden and so is the line.
    if (!link || !link.offsetParent) {
      indicator.removeAttribute('data-on')
      return
    }
    const shown = indicator.hasAttribute('data-on')
    // The first placement must not slide in from the corner, so the transition is off until it has happened.
    if (!shown) indicator.removeAttribute('data-ready')
    indicator.style.setProperty('--nx', `${link.offsetLeft}px`)
    indicator.style.setProperty('--ny', `${link.offsetTop + link.offsetHeight - 2}px`)
    indicator.style.setProperty('--nw', String(link.offsetWidth))
    if (!shown) {
      void indicator.offsetWidth
      indicator.setAttribute('data-on', '')
      requestAnimationFrame(() => indicator.setAttribute('data-ready', ''))
    }
  }

  function light(key: NavKey | null) {
    if (key === lit) return
    lit = key
    for (const [linkKey, link] of links) {
      if (linkKey === key) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    }
    place()
  }

  let queued = 0
  function watch() {
    if (queued) return
    queued = requestAnimationFrame(() => {
      queued = 0
      light(wanted())
    })
  }

  // The camera eases toward the scroll and publishes its progress (--p, an inline style on the journey) after the
  // scroll event has fired, so a flight that only listened to scroll would read the progress of a moment ago.
  let flightWatcher: MutationObserver | null = null
  let watchedJourney: Element | null = null
  function followFlight() {
    const journey = document.getElementById('journey')
    if (journey === watchedJourney) return
    flightWatcher?.disconnect()
    flightWatcher = null
    watchedJourney = journey
    if (!journey) return
    flightWatcher = new MutationObserver(watch)
    flightWatcher.observe(journey, { attributes: true, attributeFilter: ['style'] })
  }

  // M-20. The nav says where you are; this says that you have arrived. Once the glide to a section has stopped,
  // its heading gets a coral underline (drawn by PageSection's stylesheet from `data-arrived`) that fades by itself.
  // It plays also when the section was already on screen, so a click that moves nothing still answers.
  let marked: HTMLElement | null = null
  let markTimer = 0
  function clearMark() {
    window.clearTimeout(markTimer)
    marked?.removeAttribute('data-arrived')
    marked = null
  }
  function arrive(key: NavKey) {
    // Experience has no heading to mark: the camera flying is its answer.
    if (key === 'experience') return
    const heading = document.getElementById(key)?.querySelector<HTMLElement>('h2')
    if (!heading) return
    clearMark()
    // Taking the attribute off and putting it back only restarts the animation if the page notices the gap.
    void heading.offsetWidth
    heading.setAttribute('data-arrived', '')
    marked = heading
    markTimer = window.setTimeout(clearMark, ARRIVAL_MS)
  }

  // After a click the page scrolls by itself; scrolling that happens once it has stopped is the visitor's.
  let settling = false
  let settleTimer = 0
  let settledAt = scrollY
  function holdWhileSettling() {
    settling = true
    window.clearTimeout(settleTimer)
    settleTimer = window.setTimeout(() => {
      settling = false
      settledAt = scrollY
      // The intent is still there only if the visitor did not take over the scroll on the way.
      if (intent !== null) arrive(intent)
    }, SETTLE_MS)
  }

  function onScroll() {
    if (settling) holdWhileSettling()
    else if (intent !== null && Math.abs(scrollY - settledAt) > MOVED_PX) intent = null
    watch()
  }

  function release() {
    intent = null
    watch()
  }

  function onKeydown(event: KeyboardEvent) {
    if (SCROLL_KEYS.has(event.key)) release()
  }

  function onClick(event: MouseEvent) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = event.target instanceof Element ? event.target.closest('a') : null
    if (!link || link.pathname !== location.pathname) return
    const key = link.hash.slice(1)
    if (!isNavKey(key)) return
    intent = key
    holdWhileSettling()
    watch()
  }

  function onResize() {
    place()
    watch()
  }

  if (intent !== null) holdWhileSettling()
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', onResize)
  addEventListener('wheel', release, { passive: true })
  addEventListener('touchstart', release, { passive: true })
  addEventListener('keydown', onKeydown)
  nav.addEventListener('click', onClick)
  // Web fonts change the width of the links, and the line is measured from them.
  void document.fonts.ready.then(place)
  followFlight()
  light(wanted())

  return {
    refresh() {
      followFlight()
      watch()
    },
    destroy() {
      flightWatcher?.disconnect()
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onResize)
      removeEventListener('wheel', release)
      removeEventListener('touchstart', release)
      removeEventListener('keydown', onKeydown)
      nav.removeEventListener('click', onClick)
      window.clearTimeout(settleTimer)
      clearMark()
      cancelAnimationFrame(queued)
      light(null)
    },
  }
}
