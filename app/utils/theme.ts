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
 * Inline script for `<head>`. It runs before the first paint so the saved theme, the `js` class and the
 * `flight` class are in place with no flash or layout jump. Plain ES5 inside try/catch: storage can throw
 * (private mode, blocked cookies), and in that case the system preference decides, as the CSS expects.
 *
 * `flight` means "the page is a camera flight through the roles". It is only set when the visitor has not
 * asked for reduced motion; without it the roles are an ordinary list, which is also what no-JS visitors get.
 * The camera lives in the app bundle, so if the bundle has not started after FLIGHT_BOOT_TIMEOUT_MS (a dead
 * connection, a blocked script) `flight` is taken off again and the visitor gets the list instead of an empty
 * hero. The bundle marks itself with `app-ready` (plugins/journey.client.ts).
 */
export const FLIGHT_BOOT_TIMEOUT_MS = 8000

export function buildBootScript(): string {
  const key = JSON.stringify(THEME_STORAGE_KEY)
  const flight = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("flight");setTimeout(function(){if(!d.classList.contains("app-ready"))d.classList.remove("flight")},${FLIGHT_BOOT_TIMEOUT_MS})}}catch(e){}`
  return `(function(){var d=document.documentElement;d.classList.add("js");${flight}try{var t=localStorage.getItem(${key});if(t==="light"||t==="dark")d.setAttribute("data-theme",t)}catch(e){}})()`
}
