interface HiDialogState {
  /** True from the first "Say hi" on: the layout mounts the dialog then, and not before (the chunk is not in the first load). */
  requested: boolean
  /** Counts the requests. The dialog opens itself each time this changes, including the one it was mounted for. */
  opens: number
  /** The button that asked, so the focus can go back to it when the dialog closes. */
  trigger: HTMLElement | null
}

/** The "Say hi" dialog's request state, shared by the click handler (plugins/actions.client.ts), the layout and the dialog. */
export function useHiDialog() {
  const state = useState<HiDialogState>('hi-dialog', () => ({ requested: false, opens: 0, trigger: null }))

  function open(trigger: HTMLElement | null) {
    state.value = { requested: true, opens: state.value.opens + 1, trigger }
  }

  return { state, open }
}
