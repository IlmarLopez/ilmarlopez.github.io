import { THEME_STORAGE_KEY, themeColorMetas, type ThemeName } from '~/utils/theme'

/** The saved choice, or null while the page follows the system. Shared by `useThemeHead` and `useTheme`. */
function useSavedTheme() {
  return useState<ThemeName | null>('theme-saved', () => null)
}

/**
 * Keeps the theme-color metas in step with the saved theme. Call it once, in app.vue.
 * Unhead owns those tags and reverts any change made from outside, so the state drives a reactive useHead.
 */
export function useThemeHead() {
  const saved = useSavedTheme()
  useHead(() => ({ meta: themeColorMetas(saved.value) }))

  // The boot script already validated the stored value and put it on <html>, so read it from there.
  // It happens after hydration: until then the state must equal the server's, which is null.
  onMounted(() => {
    const attribute = document.documentElement.getAttribute('data-theme')
    saved.value = attribute === 'light' || attribute === 'dark' ? attribute : null
  })
}

/** The theme switch: flips light and dark, remembers the choice and crossfades when the browser can. */
export function useTheme() {
  const saved = useSavedTheme()

  /** What the page shows right now: the saved theme, or else the system preference. */
  function resolved(): ThemeName {
    if (saved.value) return saved.value
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function apply(next: ThemeName) {
    saved.value = next
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage can be blocked (private mode). The theme still changes for this visit.
    }
  }

  function toggle() {
    const next: ThemeName = resolved() === 'dark' ? 'light' : 'dark'
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    // The view transition snapshots the page and crossfades to the new one (M-07).
    // Without support, or with reduced motion, the change is instant.
    if (document.startViewTransition && !reduced) document.startViewTransition(() => apply(next))
    else apply(next)
  }

  return { toggle }
}
