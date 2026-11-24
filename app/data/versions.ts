export interface VersionScreenshot {
  src: string
  width: number
  height: number
  alt: string
}

export interface Version {
  id: string
  label: string
  status: 'current' | 'archived'
  /** ISO date of publication, or `null` until Ilmar provides it. */
  date: string | null
  /** Only technologies that are in that edition's package.json (AC-24). */
  stack: readonly string[]
  url: string
  /** Playwright capture at 1440×900, light theme. The v1 file comes from T-48 and the v2 file from T-75. */
  screenshot: VersionScreenshot
}

/** Newest first. */
export const versions: readonly Version[] = [
  {
    id: 'v2',
    label: 'Version 2',
    status: 'current',
    // TODO(ilmar): publication date of v2 (Q9). T-75 sets it.
    date: null,
    stack: ['Nuxt 4', 'Tailwind CSS 4', 'TypeScript'],
    url: 'https://ilmarlopez.com',
    screenshot: {
      src: '/img/versions/v2.png',
      width: 1440,
      height: 900,
      alt: 'Home page of version 2 of this portfolio, light theme.',
    },
  },
  {
    id: 'v1',
    label: 'Version 1',
    status: 'archived',
    // TODO(ilmar): publication date of v1 (Q9). Only the tag date is known (v1.0.0, 2026-04-12), not when it went live.
    date: null,
    stack: ['Nuxt 3', 'Tailwind CSS 3'],
    url: 'https://v1.ilmarlopez.com',
    screenshot: {
      src: '/img/versions/v1.png',
      width: 1440,
      height: 900,
      alt: 'Home page of version 1 of this portfolio, light theme.',
    },
  },
]
