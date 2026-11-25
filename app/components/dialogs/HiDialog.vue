<script setup lang="ts">
import { profile } from '~/data/profile'
import { deliverMessage } from '~/utils/hi/deliver'
import { HI_FIELDS, HI_HELP, problemMessage, problemOf, type HiField } from '~/utils/hi/validate'

// The "Say hi" dialog (RF-10, M-12). A native <dialog>: showModal() makes the page behind it inert and Esc closes it.
// It is mounted by the layout on the first request and never before, so none of this is in the first load.

type Status = 'idle' | 'sending' | 'sent'

const hi = useHiDialog()
const accessKey = useRuntimeConfig().public.web3formsKey.trim()
// Without a key (local development, or a deploy that forgot the variable) nothing could be sent: the button is off
// and the address is offered instead.
const canSend = accessKey.length > 0
const mailto = `mailto:${profile.email}`

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const stage = useTemplateRef<HTMLElement>('stage')
const confirmation = useTemplateRef<HTMLElement>('confirmation')
const honeypot = useTemplateRef<HTMLInputElement>('honeypot')

const values = reactive<Record<HiField, string>>({ name: '', email: '', message: '' })
// A field is checked once it has been left with something in it, and on every keystroke after that. Until then
// it is not marked, so the form does not shout at someone who has not typed yet.
const touched = reactive<Record<HiField, boolean>>({ name: false, email: false, message: false })
const status = ref<Status>('idle')
const failed = ref(false)
// The dialog has been sent and is leaving: the form goes back into depth (the `is-sent` class), then the confirmation takes its place.
const receding = ref(false)
const confirmed = ref(false)
const confirmationIn = ref(false)
const confirmedFor = reactive({ name: '', email: '' })

const problemFor = (field: HiField) => (touched[field] ? problemOf(field, values[field]) : null)
const helpFor = (field: HiField) => {
  const problem = problemFor(field)
  return problem ? problemMessage(field, problem) : HI_HELP[field]
}

function leave(field: HiField) {
  if (values[field] || touched[field]) touched[field] = true
}

const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function focusField(field: HiField) {
  dialog.value?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus()
}

function restore() {
  for (const field of HI_FIELDS) {
    values[field] = ''
    touched[field] = false
  }
  if (honeypot.value) honeypot.value.checked = false
  failed.value = false
  confirmed.value = false
  confirmationIn.value = false
  receding.value = false
  if (stage.value) stage.value.style.minHeight = ''
  status.value = 'idle'
}

function open() {
  const element = dialog.value
  if (!element || element.open) return
  // A dialog that was left on its confirmation starts again as a blank form.
  if (status.value === 'sent') restore()
  element.showModal()
  fit()
  // With a mouse the first field is ready to type in. On a phone it would raise the keyboard before they have read anything.
  if (matchMedia('(pointer: fine)').matches) focusField('name')
}

onMounted(open)
watch(() => hi.state.value.opens, open, { flush: 'post' })

let request: AbortController | null = null

async function send() {
  if (status.value !== 'idle' || !canSend) return
  for (const field of HI_FIELDS) touched[field] = true
  const firstProblem = HI_FIELDS.find((field) => problemOf(field, values[field]) !== null)
  if (firstProblem) {
    focusField(firstProblem)
    return
  }
  failed.value = false
  status.value = 'sending'
  request = new AbortController()
  try {
    await deliverMessage(values, { accessKey, botcheck: honeypot.value?.checked ?? false, signal: request.signal })
  } catch (error) {
    // Closing the dialog aborts the request: that is the visitor's choice and not a failure to report.
    if (error instanceof DOMException && error.name === 'AbortError') return
    status.value = 'idle'
    failed.value = true
    return
  }
  await confirm()
}

async function confirm() {
  confirmedFor.name = values.name.trim()
  confirmedFor.email = values.email.trim()
  // The form is about to leave and the confirmation to arrive in its place: hold the height so the card does not jump.
  if (stage.value) stage.value.style.minHeight = `${stage.value.offsetHeight}px`
  receding.value = true
  status.value = 'sent'
  await wait(prefersReducedMotion() ? 0 : 320)
  confirmed.value = true
  await nextTick()
  // Commit the confirmation's starting state so that arriving from behind is a transition and not a pop.
  confirmation.value?.getBoundingClientRect()
  confirmationIn.value = true
  confirmation.value?.focus({ preventScroll: true })
}

function onClose() {
  request?.abort()
  if (status.value === 'sending') status.value = 'idle'
  // The browser already gave the focus back to whatever had it when the dialog opened, as the dialog closed. That
  // is not always something: Safari does not focus a button that was clicked, so the opener gets it here. This
  // event comes a task after the close, so it never takes the focus from somewhere it has since gone.
  const active = document.activeElement
  if (!active || active === document.body || dialog.value?.contains(active)) hi.state.value.trigger?.focus({ preventScroll: true })
}

// Light dismiss, but not when a text selection started inside the card and ended on the backdrop.
let pressedOn: EventTarget | null = null
const onPointerdown = (event: PointerEvent) => {
  pressedOn = event.target
}
function onClick(event: MouseEvent) {
  if (event.target === dialog.value && pressedOn === dialog.value) dialog.value?.close()
}

// The browser leaves the dialog when Tab runs past its last control (to the address bar, or to nothing). Wrap
// instead, so the focus is trapped for good.
const FOCUSABLE = 'a[href], button, input, textarea, select, [tabindex]'
function focusables(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (element) => element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[inert], [hidden]') && element.getClientRects().length > 0,
  )
}
function onKeydown(event: KeyboardEvent) {
  const root = dialog.value
  if (event.key !== 'Tab' || !root) return
  const controls = focusables(root)
  const first = controls.at(0)
  const last = controls.at(-1)
  if (!first || !last) return
  const active = document.activeElement
  if (event.shiftKey && (active === first || active === root)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

// On a phone the dialog is a sheet that rides above the on-screen keyboard. visualViewport is what is left of the
// window when the keyboard is up; --kb is the keyboard's height and --vvh what remains for the sheet.
function fit() {
  const element = dialog.value
  const viewport = window.visualViewport
  if (!element || !viewport || !element.open) return
  element.style.setProperty('--vvh', `${viewport.height}px`)
  element.style.setProperty('--kb', `${Math.max(0, innerHeight - viewport.height - viewport.offsetTop)}px`)
}
onMounted(() => {
  window.visualViewport?.addEventListener('resize', fit)
  window.visualViewport?.addEventListener('scroll', fit)
})
onBeforeUnmount(() => {
  window.visualViewport?.removeEventListener('resize', fit)
  window.visualViewport?.removeEventListener('scroll', fit)
  request?.abort()
})
</script>

<template>
  <dialog
    id="say-hi"
    ref="dialog"
    class="hi"
    :class="{ 'is-sent': receding }"
    aria-labelledby="hi-h"
    :data-state="status"
    @close="onClose"
    @pointerdown="onPointerdown"
    @click="onClick"
    @keydown="onKeydown"
  >
    <div class="progress" aria-hidden="true"><i></i></div>
    <div class="body">
      <div class="head">
        <h2 id="hi-h">Say hi</h2>
        <button class="close" type="button" @click="dialog?.close()">Close</button>
      </div>
      <div ref="stage" class="stage">
        <div class="intro" :hidden="confirmed" data-fly style="--i: 0">
          <p v-if="canSend">A few words are enough. It goes straight to my inbox.</p>
          <p v-else>
            This version of the site has no key to send with. Write to <a :href="mailto">{{ profile.email }}</a> instead.
          </p>
          <p class="note">All fields are required.</p>
        </div>
        <!-- `inert` once sent: the form is receding and must not take focus or clicks. -->
        <form novalidate :hidden="confirmed" :inert="status === 'sent'" @submit.prevent="send">
          <!-- The honeypot: a checkbox no person can reach or see. A bot that fills every input ticks it, and Web3Forms drops the message. -->
          <input ref="honeypot" class="hp" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true" />
          <div class="row" data-fly style="--i: 1">
            <HiField
              id="hi-name"
              v-model="values.name"
              name="name"
              label="Name"
              autocomplete="name"
              autocapitalize="words"
              :readonly="status === 'sending'"
              :invalid="problemFor('name') !== null"
              :help="helpFor('name')"
              @blur="leave('name')"
            />
            <HiField
              id="hi-email"
              v-model="values.email"
              name="email"
              label="Email"
              type="email"
              autocomplete="email"
              inputmode="email"
              autocapitalize="off"
              :spellcheck="false"
              :readonly="status === 'sending'"
              :invalid="problemFor('email') !== null"
              :help="helpFor('email')"
              @blur="leave('email')"
            />
          </div>
          <div data-fly style="--i: 2">
            <HiField
              id="hi-message"
              v-model="values.message"
              name="message"
              label="Message"
              multiline
              rows="4"
              autocomplete="off"
              :readonly="status === 'sending'"
              :invalid="problemFor('message') !== null"
              :help="helpFor('message')"
              @blur="leave('message')"
            />
          </div>
          <!-- Always in the page, so the screen reader has a live region before the text arrives. -->
          <p class="status" role="alert" :data-shown="failed || undefined" data-fly style="--i: 3">
            <template v-if="failed">
              That did not go through. Your message is still here. Try again, or write to <a :href="mailto">{{ profile.email }}</a>.
            </template>
          </p>
          <div class="actions" data-fly style="--i: 3">
            <BaseButton type="submit" class="action send" :disabled="!canSend" :aria-busy="status === 'sending'">
              <span class="spin" aria-hidden="true"></span>
              <span>{{ status === 'sending' ? 'Sending' : 'Send' }}</span>
            </BaseButton>
            <p class="alt">
              Or write to <a :href="mailto">{{ profile.email }}</a>
            </p>
          </div>
        </form>
        <div ref="confirmation" class="sent" :class="{ 'is-in': confirmationIn }" :hidden="!confirmed" tabindex="-1" role="status">
          <p class="sent-title">Sent.</p>
          <p>
            Thanks, <strong>{{ confirmedFor.name }}</strong
            >. I’ll write back to <strong>{{ confirmedFor.email }}</strong
            >.
          </p>
          <BaseButton class="action" @click="dialog?.close()">Close</BaseButton>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
/* The dialog arrives from slightly behind. Once sent, the form recedes into depth toward the hero's vanishing
   point and the confirmation comes forward (M-12). Only transform and opacity move. */
.hi {
  --hi-error: var(--color-error-text);
  position: fixed;
  inset: 0;
  box-sizing: border-box;
  width: min(35rem, calc(100% - var(--space-lg)));
  max-width: none;
  height: fit-content;
  max-height: min(92dvh, 46rem);
  margin: auto;
  padding: 0;
  overflow: auto;
  overscroll-behavior: contain;
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-card);
  background: var(--color-paper);
  color: var(--color-ink);
}

/* Open and close. Entering is slower than leaving; sending successfully makes the exit a recede. */
.hi {
  opacity: 0;
  transform: perspective(1100px) translate3d(0, 0, -60px);
  transition:
    opacity var(--dur-micro) var(--ease-out),
    transform var(--dur-micro) var(--ease-out),
    overlay var(--dur-micro) allow-discrete,
    display var(--dur-micro) allow-discrete;
}

.hi[open] {
  opacity: 1;
  transform: none;
  transition-duration: var(--dur-short);
}

@starting-style {
  .hi[open] {
    opacity: 0;
    transform: perspective(1100px) translate3d(0, 0, -60px);
  }
}

.hi.is-sent:not([open]) {
  transform: perspective(1100px) translate3d(0, 0, -240px);
  transition-duration: var(--dur-short);
}

.hi::backdrop {
  background: color-mix(in oklab, var(--color-field) 70%, transparent);
  opacity: 0;
  transition:
    opacity var(--dur-micro) var(--ease-out),
    overlay var(--dur-micro) allow-discrete,
    display var(--dur-micro) allow-discrete;
}

.hi[open]::backdrop {
  opacity: 1;
  transition-duration: var(--dur-short);
}

@starting-style {
  .hi[open]::backdrop {
    opacity: 0;
  }
}

.hi.is-sent:not([open])::backdrop {
  transition-duration: var(--dur-short);
}

/* Progress: the same coral line as the depth ruler, along the top edge while the request is in flight. */
.progress {
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  overflow: hidden;
}

.progress i {
  display: block;
  height: 100%;
  background: var(--color-accent);
  transform-origin: 0 50%;
  transform: scaleX(0);
  transition: transform var(--dur-short) var(--ease-out);
}

.hi[data-state='sending'] .progress i {
  transform: scaleX(0.82);
  transition-duration: 1600ms;
}

.hi[data-state='sent'] .progress i {
  transform: scaleX(1);
}

.body {
  padding: var(--space-xl) var(--space-xl) 0;
  perspective: 900px;
  perspective-origin: 76% 34%;
}

.stage {
  display: grid;
}

.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
}

.head h2 {
  font-size: var(--text-2xl);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

/* There is no Cancel button: this one and Esc close it. The pseudo-element makes the target larger than the word. */
.close {
  position: relative;
  padding: var(--space-xs) 0;
  font: inherit;
  font-size: var(--text-sm);
  color: var(--color-muted);
  background: none;
  border: 0;
  cursor: pointer;
  transition: color var(--dur-micro) var(--ease-out);
}

.close::before {
  content: '';
  position: absolute;
  inset: -8px -12px;
}

@media (hover: hover) {
  .close:hover {
    color: var(--color-ink);
  }
}

.intro {
  margin-top: var(--space-sm);
  color: var(--color-ink-2);
}

.intro p {
  margin: 0;
  max-width: 46ch;
}

.intro a,
.alt a {
  color: var(--color-ink);
}

.intro .note {
  margin-top: var(--space-2xs);
  font-size: var(--text-sm);
  color: var(--color-muted);
}

form {
  display: grid;
  gap: var(--space-xs);
  margin-top: var(--space-lg);
}

.row {
  display: grid;
  gap: var(--space-xs) var(--space-md);
}

@media (min-width: 40rem) {
  .row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Out of sight and out of reach, but still in the page for a bot that reads the markup. */
.hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.status {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-ink-2);
}

.status[data-shown] {
  padding: var(--space-sm) var(--space-md);
  border: var(--rule-hair) solid var(--hi-error);
  border-radius: var(--radius-card);
}

.status a {
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Sticky: on a short screen the button stays in reach while the fields scroll under it. */
.actions {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-md) var(--space-lg);
  padding: var(--space-sm) 0 var(--space-xl);
  background: var(--color-paper);
}

/* Every button in the dialog (Send, and Close on the confirmation) has the same size. */
.action {
  min-height: 52px;
  min-width: 9rem;
  padding-inline: var(--space-lg);
}

.spin {
  display: none;
  width: 1em;
  height: 1em;
  margin-right: var(--space-xs);
  border: 2px solid currentcolor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

[aria-busy='true'] .spin {
  display: inline-block;
}

.alt {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.hi[data-state='sending'] :deep(.field) {
  opacity: 0.7;
  transition: opacity var(--dur-short) var(--ease-out);
}

/* Sent: each plane of the form leaves toward the back with a small stagger, and the confirmation comes forward. */
[data-fly] {
  transition:
    opacity var(--dur-short) var(--ease-out),
    transform var(--dur-short) var(--ease-out);
  transition-delay: calc(var(--i, 0) * 40ms);
}

/* Hidden states hang from `.js`, as everywhere in the site: the dialog only exists with JS, but a rule that hides
   something should never be able to leave it hidden. */
.js .hi[data-state='sent'] [data-fly] {
  opacity: 0;
  transform: translate3d(0, -6px, -220px);
}

.sent {
  display: grid;
  align-content: center;
  justify-items: start;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.js .sent {
  opacity: 0;
  transform: translate3d(0, 0, -140px);
  transition:
    opacity var(--dur-long) var(--ease-out),
    transform var(--dur-long) var(--ease-out);
}

.js .sent.is-in {
  opacity: 1;
  transform: none;
}

.sent:focus {
  outline: 0;
}

.sent p {
  margin: 0;
  max-width: 34ch;
  color: var(--color-ink-2);
}

.sent .sent-title {
  font-family: var(--font-display);
  font-size: var(--text-display-s);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--color-ink);
}

.sent strong {
  font-weight: 600;
  color: var(--color-ink);
  overflow-wrap: anywhere;
}

.sent :deep(a),
.sent :deep(button) {
  margin-top: var(--space-sm);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Reduced motion: the dialog fades and nothing travels. (The global rule already makes every duration instant.) */
@media (prefers-reduced-motion: reduce) {
  .hi,
  .hi.is-sent:not([open]),
  .js .hi[data-state='sent'] [data-fly],
  .js .sent {
    transform: none;
  }
}

/* Phones: a sheet from the bottom edge that rides above the keyboard (--kb and --vvh come from visualViewport). */
@media (max-width: 40rem) {
  .hi {
    inset: auto 0 var(--kb, 0px);
    width: 100%;
    height: auto;
    max-height: calc(var(--vvh, 100dvh) - var(--space-lg));
    margin: 0;
    border-bottom: 0;
    border-radius: var(--radius-card) var(--radius-card) 0 0;
    opacity: 1;
    transform: translateY(100%);
    transition:
      transform var(--dur-short) var(--ease-out),
      overlay var(--dur-short) allow-discrete,
      display var(--dur-short) allow-discrete;
  }

  .hi[open] {
    transform: none;
  }

  @starting-style {
    .hi[open] {
      transform: translateY(100%);
    }
  }

  .hi.is-sent:not([open]) {
    transform: translateY(100%);
  }

  .body {
    padding: var(--space-lg) var(--space-md) 0;
  }

  .actions {
    padding-bottom: max(var(--space-lg), env(safe-area-inset-bottom));
  }

  .actions .send {
    width: 100%;
  }
}
</style>
