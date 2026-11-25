import type { YearMonth } from '~/data/experience'
import { SCALE_START, monthIndex, monthsBetween, spokenDuration, splitMonths, unit } from '~/utils/tenure'

/** The duration figure of one card: its final value, the node that shows it and the running animation. */
interface Figure {
  years: number
  months: number
  out: HTMLElement
  done: boolean
  frame: number
}

interface Strip {
  el: HTMLElement
  from: YearMonth
  to: YearMonth | 'now'
  label: string
}

export interface Chart {
  /** Shows every figure as zero, ready to be counted up when the camera reaches its card. */
  zeroFigures(): void
  /** Counts the figure of a card up from zero. It happens once per card. */
  countUp(card: Element): void
  destroy(): void
}

const COUNT_MS = 700
const COUNT_DELAY_MS = 160
/** A year label further right than this (percent of the axis) would touch "Now". */
const YEAR_LABEL_LIMIT = 84

function make<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  node.className = className
  if (text) node.textContent = text
  return node
}

function readStrips(root: HTMLElement): Strip[] {
  return [...root.querySelectorAll<HTMLElement>('.tenure')].flatMap((el) => {
    const { from, to, label } = el.dataset
    // These attributes are written by RoleTimeline from typed data, so the casts only restate what is there.
    return from && to ? [{ el, from: from as YearMonth, to: to as YearMonth | 'now', label: label ?? '' }] : []
  })
}

function showFigure(fig: Figure, years: number, months: number): void {
  const parts: string[] = []
  if (fig.years) parts.push(`<b>${years}</b><small>${unit(years, 'yr', 'yrs')}</small>`)
  if (fig.months) parts.push(`<b>${months}</b><small>${unit(months, 'mo', 'mos')}</small>`)
  fig.out.innerHTML = parts.join('')
}

/**
 * Draws the career as a small chart inside every `.tenure` strip: a row per role on one shared scale, newest
 * first, with the role of that card in ink. Also recounts every card's duration from `now`, which matters for
 * the role that is still running. `now` is a parameter so a test can fix the date.
 */
export function buildChart(root: HTMLElement, now: Date = new Date()): Chart {
  const strips = readStrips(root)
  const scaleFrom = monthIndex(SCALE_START, now)
  const scaleSpan = monthIndex('now', now) + 1 - scaleFrom
  // One hairline per January along the axis.
  root.style.setProperty('--yr', `${(1200 / scaleSpan).toFixed(3)}%`)

  // A role spans from the start of its first month to the end of its last.
  const spanOf = (strip: Strip) => {
    const start = (monthIndex(strip.from, now) - scaleFrom) / scaleSpan
    const end = (monthIndex(strip.to, now) + 1 - scaleFrom) / scaleSpan
    return { start: `${(start * 100).toFixed(2)}%`, length: `${((end - start) * 100).toFixed(2)}%` }
  }

  // Years are labelled every second year (every third on a phone, through CSS).
  const firstYear = Number(SCALE_START.slice(0, 4))
  const years: { year: number; x: number }[] = []
  for (let year = firstYear; ; year += 1) {
    const x = (((year - firstYear) * 12) / scaleSpan) * 100
    if (x > YEAR_LABEL_LIMIT) break
    years.push({ year, x })
  }

  for (const card of strips) {
    // A strip that already has its chart (a second mount on the same DOM) is left as it is.
    if (card.el.childElementCount) continue
    card.el.append(make('i', 'grid'))
    strips.forEach((role, k) => {
      const { start, length } = spanOf(role)
      const row = make('div', 'row')
      const track = make('span', 'track')
      const bar = make('i', 'bar')
      bar.style.setProperty('--a', start)
      bar.style.setProperty('--w', length)
      track.append(bar)
      row.append(make('span', 'name', role.label), track)
      // Roles behind draw first and the one this card is about draws last.
      row.style.setProperty('--k', String(role === card ? strips.length : k))
      if (role === card) row.dataset.self = ''
      card.el.append(row)
    })
    const axis = make('div', 'axis')
    for (const { year, x } of years) {
      const offset = year - firstYear
      const tick = make('span', `year${offset % 2 === 0 ? ' y2' : ''}${offset % 3 === 0 ? ' y3' : ''}`, String(year))
      tick.style.setProperty('--x', `${x.toFixed(2)}%`)
      axis.append(tick)
    }
    axis.append(make('span', 'now', 'Now'))
    card.el.append(axis)
  }

  // Screen readers get the final value only; the visible figure is aria-hidden because it counts up.
  const figures = new Map<Element, Figure>()
  for (const card of root.querySelectorAll('.card')) {
    const strip = strips.find((candidate) => card.contains(candidate.el))
    const out = card.querySelector<HTMLElement>('[data-figure]')
    const spoken = card.querySelector<HTMLElement>('[data-spoken]')
    if (!strip || !out || !spoken) continue
    const parts = splitMonths(monthsBetween(strip.from, strip.to, now))
    spoken.textContent = spokenDuration(parts)
    const fig: Figure = { ...parts, out, done: false, frame: 0 }
    showFigure(fig, parts.years, parts.months)
    figures.set(card, fig)
  }

  return {
    zeroFigures() {
      figures.forEach((fig) => showFigure(fig, 0, 0))
    },
    countUp(card) {
      const fig = figures.get(card)
      if (!fig || fig.done) return
      fig.done = true
      const begin = performance.now() + COUNT_DELAY_MS
      const tick = (time: number) => {
        const t = Math.min(1, Math.max(0, (time - begin) / COUNT_MS))
        const eased = 1 - Math.pow(1 - t, 4)
        showFigure(fig, Math.round(fig.years * eased), Math.round(fig.months * eased))
        fig.frame = t < 1 ? requestAnimationFrame(tick) : 0
      }
      showFigure(fig, 0, 0)
      fig.frame = requestAnimationFrame(tick)
    },
    destroy() {
      figures.forEach((fig) => cancelAnimationFrame(fig.frame))
    },
  }
}
