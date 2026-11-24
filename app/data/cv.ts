export interface CvEntry {
  lang: string
  label: string
  href: string
  /** Small print next to the Contact link. Per entry, because a Spanish CV may not have the same length. */
  detail: string
}

/**
 * One entry means direct links; more than one opens a menu. Adding a language is a new entry here.
 * The PDF opens in a new tab with no `download` attribute, so "View CV" describes what happens (Q2).
 */
export const cvEntries: readonly [CvEntry, ...CvEntry[]] = [
  { lang: 'en', label: 'English', href: '/files/Ilmar-Lopez-CV.pdf', detail: 'PDF, 1 page' },
]
