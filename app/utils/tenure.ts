import type { YearMonth } from '~/data/experience'

/** Month names for the Period readout. A fixed table and not Intl, so the text is the same on every machine. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

/** Every role sits on one shared scale, from this month to the current one, so the strips compare at a glance. */
export const SCALE_START: YearMonth = '2017-01'

export interface DurationParts {
  years: number
  months: number
}

function parse(value: YearMonth): { year: number; month: number } {
  const [year = 0, month = 1] = value.split('-').map(Number)
  return { year, month }
}

/** Index of the month a `YYYY-MM` (or `'now'`) falls in, counted from year 0. */
export function monthIndex(value: YearMonth | 'now', now: Date = new Date()): number {
  if (value === 'now') return now.getFullYear() * 12 + now.getMonth()
  const { year, month } = parse(value)
  return year * 12 + month - 1
}

/** How many months a role covers. The first and the last month both count, the way a CV does. */
export function monthsBetween(from: YearMonth, to: YearMonth | 'now', now: Date = new Date()): number {
  return monthIndex(to, now) + 1 - monthIndex(from, now)
}

export function splitMonths(total: number): DurationParts {
  return { years: Math.floor(total / 12), months: total % 12 }
}

/** `unit(2, 'yr', 'yrs')` is `'yrs'`. */
export function unit(count: number, one: string, many: string): string {
  return count === 1 ? one : many
}

/** The duration as a screen reader should hear it: "5 years 2 months". */
export function spokenDuration({ years, months }: DurationParts): string {
  return [years && `${years} ${unit(years, 'year', 'years')}`, months && `${months} ${unit(months, 'month', 'months')}`].filter(Boolean).join(' ')
}

function monthLabel(value: YearMonth): string {
  const { year, month } = parse(value)
  return `${MONTHS[month - 1] ?? ''} ${year}`
}

/** The Period readout: "Oct 2021 to now". */
export function formatPeriod(from: YearMonth, to: YearMonth | 'now'): string {
  return `${monthLabel(from)} to ${to === 'now' ? 'now' : monthLabel(to)}`
}
