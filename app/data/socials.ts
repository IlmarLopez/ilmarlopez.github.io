export interface Social {
  id: 'github' | 'linkedin' | 'dev' | 'codepen'
  label: string
  href: string
}

/** The email lives in `profile.email`. The CV link comes first in Contact and is built from `cv.ts`. */
export const socials: readonly Social[] = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/IlmarLopez' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/ilmarlopez' },
  { id: 'dev', label: 'DEV', href: 'https://dev.to/ilmarlopez' },
  { id: 'codepen', label: 'CodePen', href: 'https://codepen.io/ilmarlopez' },
]
