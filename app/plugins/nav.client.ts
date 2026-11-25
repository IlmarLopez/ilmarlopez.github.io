import { mountNavSpy } from '~/utils/nav/spy'

/**
 * Lights the nav link of the section being read. The nav lives in the layout and survives navigations, so it is
 * mounted once; after each navigation the spy only reads the page again, because the sections are what changed.
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Read now: while the app hydrates the router drops the hash from the address for a moment. Only the page the
  // visitor opened can have been opened at a hash, so it is used once.
  let openedAt = location.hash

  let spy: ReturnType<typeof mountNavSpy> | null = null
  let mountedOn: Element | null = null

  function sync() {
    const nav = document.querySelector<HTMLElement>('nav[aria-label="Primary"]')
    if (nav === mountedOn) {
      spy?.refresh()
      return
    }
    spy?.destroy()
    spy = null
    mountedOn = nav
    if (!nav) return
    spy = mountNavSpy(nav, openedAt)
    openedAt = ''
  }

  onNuxtReady(sync)
  nuxtApp.hook('page:finish', sync)
})
