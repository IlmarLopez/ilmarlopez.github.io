import type { Chart } from '~/utils/journey/chart'

/** Depth between two planes, in px. */
const STEP = 820
/** Below this width the roles sit in a band between the nav and the hero text. */
const NARROW = 640
/** Time constant of the camera easing, in ms: the camera covers 63% of the way to the scroll in this long. */
const EASE_MS = 90
const FOCUSABLE = 'a[href], button'

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))

/**
 * Turns the journey into a camera flight: every plane sits at its own depth and scrolling moves the camera
 * through them, hero first and the oldest role last. Returns a function that undoes it.
 *
 * Needs the `flight` class on <html> (set before the first paint, never with reduced motion) so the CSS in
 * JourneyFlight, RoleCard and RoleTimeline is already in place. This only writes custom properties, data
 * attributes and the tab order; it never touches layout.
 *
 * `landOnExperience` is for a page that was opened at /#experience: the camera starts on the first role.
 * The caller reads the hash, because by the time this runs the router has already rewritten the address.
 */
export function mountFlight(journey: HTMLElement, chart: Chart, { landOnExperience = false } = {}): () => void {
  const pin = journey.querySelector<HTMLElement>('.viewport')
  const planes = [...journey.querySelectorAll<HTMLElement>('.plane')]
  const hero = planes[0]
  const firstRole = planes[1]
  if (!pin || !hero || !firstRole) return () => {}

  const root = document.documentElement
  const nav = document.querySelector('header')
  const labels = [...journey.querySelectorAll<HTMLElement>('.depth li')]
  const lastIndex = planes.length - 1
  // What can be pressed on each plane. Links of the planes behind stay in the page for screen readers.
  const reach = planes.map((plane) => [...plane.querySelectorAll<HTMLElement>(FOCUSABLE)])

  chart.zeroFigures()

  const metrics = () => ({
    run: journey.offsetHeight - pin.offsetHeight,
    stick: parseFloat(getComputedStyle(pin).top) || 0,
    docTop: journey.getBoundingClientRect().top + scrollY,
  })

  /** How far through the journey the scroll is, 0 to 1. */
  const target = () => {
    const { run, stick } = metrics()
    return run > 0 ? clamp((stick - journey.getBoundingClientRect().top) / run, 0, 1) : 0
  }

  // On a phone the roles behind the hero sit in the band between the nav and the hero text, whatever the height
  // of the screen. The offset is solved from the perspective: where the first card has to be on the plane so that
  // its projection fits the band.
  let narrowSy = 0
  const seat = () => {
    if (innerWidth >= NARROW) return
    const { stick } = metrics()
    const style = getComputedStyle(pin)
    const viewportHeight = pin.offsetHeight
    const perspective = parseFloat(style.perspective) || 900
    const scale = perspective / (perspective + STEP)
    const originY = stick + (parseFloat(style.perspectiveOrigin.split(' ')[1] ?? '') || viewportHeight * 0.36)
    const centerY = stick + viewportHeight / 2
    const low = (nav?.getBoundingClientRect().bottom ?? 0) + 8
    const high = centerY - hero.offsetHeight / 2 + innerHeight * 0.05 - 14
    const visible = firstRole.offsetHeight * scale
    const aim = visible <= high - low ? (low + high) / 2 : high - visible / 2
    const offset = -((aim - originY) / scale - (centerY - originY))
    narrowSy = Number.isFinite(offset) ? offset : innerHeight * 0.4
  }

  const render = (p: number) => {
    const narrow = innerWidth < NARROW
    const lift = narrow ? innerHeight * 0.05 : 0
    const sx = innerWidth * (narrow ? 0.1 : 0.21)
    const sy = narrow ? narrowSy : innerHeight * 0.1
    // Each plane dwells near the camera for a moment before the next one comes forward.
    const scaled = p * lastIndex
    const whole = Math.floor(scaled)
    const eased = clamp((scaled - whole - 0.22) / 0.56, 0, 1)
    const flown = whole + eased * eased * (3 - 2 * eased)
    journey.style.setProperty('--p', p.toFixed(4))
    // A role counts as reached once it is more than halfway to the camera; its strip draws and its figure counts then.
    const near = Math.round(flown)
    planes.forEach((el, i) => {
      const d = i - flown
      el.toggleAttribute('data-reached', i <= near)
      if (i <= near) chart.countUp(el)
      // Planes still ahead stay opaque so nearer ones hide them; only their ink fades. Passed planes fade as a whole.
      const ink = d >= 0 ? clamp(1 - d * 0.3, 0, 1) : 1
      const opacity = d >= 0 ? 1 : clamp(1 + d * 2.8, 0, 1)
      el.style.setProperty('--x', `${(d * sx).toFixed(1)}px`)
      el.style.setProperty('--y', `${(-d * sy + (i === 0 ? lift : 0)).toFixed(1)}px`)
      el.style.setProperty('--z', `${(-d * STEP).toFixed(1)}px`)
      el.style.setProperty('--o', ink.toFixed(3))
      el.style.setProperty('--po', opacity.toFixed(3))
      // Only what is in front can be pressed or tabbed to.
      const front = i === near && opacity > 0.6
      el.style.pointerEvents = front ? '' : 'none'
      reach[i]?.forEach((control) => {
        if ((control.tabIndex === 0) !== front) control.tabIndex = front ? 0 : -1
      })
    })
    hero.toggleAttribute('data-passed', flown > 0.4)
    labels.forEach((label, i) => {
      label.toggleAttribute('data-on', i === near)
      label.toggleAttribute('data-past', i < near)
    })
  }

  // The camera eases toward where the scroll is instead of copying it, so a wheel notch glides rather than steps.
  let current = 0
  let goal = 0
  let frame = 0
  let previous = 0
  const step = (now: number) => {
    const dt = previous ? clamp(now - previous, 0, 50) : 16
    previous = now
    current += (goal - current) * (1 - Math.exp(-dt / EASE_MS))
    if (Math.abs(goal - current) < 0.0004) {
      current = goal
      frame = previous = 0
    } else {
      frame = requestAnimationFrame(step)
    }
    render(current)
  }
  const follow = () => {
    goal = target()
    if (!frame) frame = requestAnimationFrame(step)
  }
  /** Jumps to where the scroll is, with no easing. For the first frame, resizes and font swaps. */
  const snap = () => {
    cancelAnimationFrame(frame)
    frame = previous = 0
    seat()
    goal = current = target()
    render(current)
  }

  // The Experience link goes to the moment the first role is in front of the camera.
  const goToExperience = (behavior: ScrollBehavior) => {
    const { run, stick, docTop } = metrics()
    scrollTo({ top: docTop - stick + (1 / lastIndex) * run, behavior })
  }
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null
    if (!(link instanceof HTMLAnchorElement)) return
    const url = new URL(link.href, location.href)
    if (url.pathname !== location.pathname || url.hash !== '#experience') return
    event.preventDefault()
    goToExperience('smooth')
    // Keep the router's own entry in history.state, or going back later would not know where it was.
    history.replaceState(history.state, '', '#experience')
  }

  let alive = true
  addEventListener('scroll', follow, { passive: true })
  addEventListener('resize', snap)
  document.addEventListener('click', onClick)
  snap()
  // Fonts change the height of the planes, and the phone layout is solved from those heights.
  void document.fonts.ready.then(() => {
    if (alive) snap()
  })
  if (landOnExperience) goToExperience('instant')
  root.classList.add('flight-ready')

  return () => {
    alive = false
    cancelAnimationFrame(frame)
    removeEventListener('scroll', follow)
    removeEventListener('resize', snap)
    document.removeEventListener('click', onClick)
    root.classList.remove('flight-ready')
  }
}
