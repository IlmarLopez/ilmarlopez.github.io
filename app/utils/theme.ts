/** localStorage key for the saved theme. The value is 'light' or 'dark'; no key means "follow the system". */
export const THEME_STORAGE_KEY = 'theme'

export type ThemeName = 'light' | 'dark'

/**
 * `<meta name="theme-color">` per scheme. Hex because the meta tag cannot read CSS variables.
 * Derived from `--color-paper`: light oklch(97.5% 0.006 250), dark oklch(16% 0.015 260).
 * Unhead owns these tags and rewrites them on hydration, so a script cannot keep them in sync with a
 * saved theme; `useThemeHead` does that with a reactive useHead, through `themeColorMetas`.
 */
export const THEME_COLOR: Record<ThemeName, string> = { light: '#f4f7fb', dark: '#090d14' }

/**
 * The theme-color metas for the current choice: always one per scheme, and the browser picks by `media`.
 * With nothing saved each carries its own scheme's color. With a saved theme both carry that theme's color,
 * so the browser chrome matches it whatever the system says.
 *
 * The set of tags never changes, only `content`. Going from two tags to one made Unhead's reconciliation,
 * which adopts the server's tags on hydration, leave both in place or duplicate them. No `key` either: an
 * explicit key makes the client create new tags next to the server's (four metas after hydration).
 */
export function themeColorMetas(saved: ThemeName | null) {
  return (['light', 'dark'] as const).map((scheme) => ({
    name: 'theme-color',
    media: `(prefers-color-scheme: ${scheme})`,
    content: THEME_COLOR[saved ?? scheme],
  }))
}

/**
 * Inline script for `<head>`. It runs before the first paint so the saved theme and the `js` class are
 * in place with no flash. Plain ES5 inside try/catch: storage can throw (private mode, blocked cookies),
 * and in that case the system preference decides, as the CSS expects.
 */
export function buildThemeBootScript(): string {
  const key = JSON.stringify(THEME_STORAGE_KEY)
  return `(function(){var d=document.documentElement;d.classList.add("js");try{var t=localStorage.getItem(${key});if(t==="light"||t==="dark")d.setAttribute("data-theme",t)}catch(e){}})()`
}
