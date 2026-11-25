/**
 * One delegated listener for every `data-action` on the page (the hero's and Contact's "Say hi" today, the command
 * palette later). The sections around those buttons never hydrate, so nothing could be listening on the buttons
 * themselves; the document is.
 *
 * Without JS the same buttons are plain `mailto:` links. With JS they open the dialog, whose code is fetched
 * on the first pointer or focus over a button (so it is usually there by the time of the click) and never at load.
 */

const ACTIONS = ['say-hi'] as const
type ActionName = (typeof ACTIONS)[number]

const isAction = (value: string | undefined): value is ActionName => ACTIONS.some((action) => action === value)

/** A click the handler already dealt with and gave back to the browser, so it is not intercepted twice. */
const handedBack = new WeakSet<Event>()

export default defineNuxtPlugin(() => {
  const dialog = useHiDialog()

  // The dynamic import is the point: it is what keeps the dialog out of the first load (spec 8.4). The layout's
  // `<LazyHiDialog>` imports the same module, so both share one chunk and this only warms it.
  let loading: Promise<unknown> | null = null
  function loadDialog() {
    loading ??= import('~/components/dialogs/HiDialog.vue').catch((error: unknown) => {
      loading = null
      throw error
    })
    return loading
  }

  const actionElement = (event: Event) => (event.target instanceof Element ? event.target.closest<HTMLElement>('[data-action]') : null)

  function warm(event: Event) {
    const element = actionElement(event)
    if (!element) return
    const action = element.dataset.action
    if (!isAction(action)) return
    switch (action) {
      case 'say-hi':
        // A failed warm-up is not an error yet: the click will try again and has a fallback.
        loadDialog().catch(() => {})
        return
      default: {
        const unhandled: never = action
        return unhandled
      }
    }
  }

  async function run(event: MouseEvent) {
    // Let the browser have the clicks it means something else by: a new tab, a download, a middle click.
    if (handedBack.has(event) || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const element = actionElement(event)
    const action = element?.dataset.action
    if (!element || !isAction(action)) return
    switch (action) {
      case 'say-hi':
        event.preventDefault()
        try {
          await loadDialog()
        } catch {
          // The code did not arrive (offline, a stale deploy). The button is a mailto: link, so give it back.
          const again = new MouseEvent('click', { bubbles: true, cancelable: true })
          handedBack.add(again)
          element.dispatchEvent(again)
          return
        }
        dialog.open(element)
        return
      default: {
        const unhandled: never = action
        return unhandled
      }
    }
  }

  document.addEventListener('pointerover', warm, { passive: true })
  document.addEventListener('focusin', warm)
  document.addEventListener('click', (event) => void run(event))
})
