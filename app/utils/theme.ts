/** localStorage key for the saved theme. The value is 'light' or 'dark'; no key means "follow the system". */
export const THEME_STORAGE_KEY = 'theme'

/**
 * `<meta name="theme-color">` per scheme. Hex because the meta tag cannot read CSS variables.
 * Derived from `--color-paper`: light oklch(97.5% 0.006 250), dark oklch(16% 0.015 260).
 * Unhead owns these tags and rewrites them on hydration, so a script cannot keep them in sync with a
 * saved theme; the theme state added in T-22 does that with a reactive useHead.
 */
export const THEME_COLOR = { light: '#f4f7fb', dark: '#090d14' } as const

/**
 * Inline script for `<head>`. It runs before the first paint so the saved theme and the `js` class are
 * in place with no flash. Plain ES5 inside try/catch: storage can throw (private mode, blocked cookies),
 * and in that case the system preference decides, as the CSS expects.
 */
export function buildThemeBootScript(): string {
  const key = JSON.stringify(THEME_STORAGE_KEY)
  return `(function(){var d=document.documentElement;d.classList.add("js");try{var t=localStorage.getItem(${key});if(t==="light"||t==="dark")d.setAttribute("data-theme",t)}catch(e){}})()`
}
