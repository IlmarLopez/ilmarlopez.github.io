/** A calendar month as `YYYY-MM`. */
export type YearMonth = `${number}-${number}`

export type RoleState = 'active' | 'ended' | 'education'

interface RoleBase {
  id: string
  name: string
  /**
   * Short label for the depth ruler and the timeline rows.
   * The prototype's timeline said "California"; one label for both keeps the data single-sourced (T-79 checks it fits).
   */
  short: string
  /** Monogram on the card. */
  mark: string
  role: string
  summary?: string
  /** Only the current employer links out. */
  url?: string
}

/** A job: it has a period, which feeds the Period and Duration readout and the timeline. */
interface DatedRole extends RoleBase {
  state: 'active' | 'ended'
  from: YearMonth
  /** `'now'` for the current role. Months are counted inclusively (Oct 2021 to Oct 2021 is 1 month). */
  to: YearMonth | 'now'
}

/** Education has no dates, so it gets no readout and no timeline row. */
interface UndatedRole extends RoleBase {
  state: 'education'
  from?: never
  to?: never
}

export type Role = DatedRole | UndatedRole

/** Newest first. This is also the order of the planes in the flight, front to back. */
export const experience: readonly Role[] = [
  {
    id: 'stori',
    name: 'Stori Card',
    short: 'Stori',
    mark: 'St',
    role: 'Senior Software Engineer',
    summary: 'Serverless APIs with Clean Architecture, testing and monitoring. Now on the architecture team.',
    state: 'active',
    from: '2021-10',
    to: 'now',
    url: 'https://www.storicard.com/',
  },
  {
    id: 'home-media',
    name: 'Home & Media Products',
    short: 'Home & Media',
    mark: 'HM',
    role: 'Full Stack Developer and Technical Lead',
    summary: 'Architecture, code quality, reviews and database design for educational platforms.',
    state: 'ended',
    from: '2017-09',
    to: '2021-10',
  },
  {
    id: 'california-web',
    name: 'California Web Design',
    short: 'California Web',
    mark: 'CW',
    role: 'Frontend Developer',
    state: 'ended',
    from: '2017-04',
    to: '2017-07',
  },
  {
    id: 'utt',
    name: 'Universidad Tecnológica de Tijuana',
    short: 'UTT',
    mark: 'UTT',
    role: 'Information Technology Engineering',
    state: 'education',
  },
]
