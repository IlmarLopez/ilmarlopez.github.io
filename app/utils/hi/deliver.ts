/**
 * Sends the "Say hi" message through Web3Forms (RF-10). The page is static, so there is no server of ours to post
 * to: Web3Forms mails the message to the address the access key belongs to.
 *
 * What the API takes (docs.web3forms.com, checked 2026-11-24): a JSON POST with `Content-Type: application/json`
 * (a form-encoded body gets a redirect, which a browser reports as a CORS error), `access_key`, and the fields to
 * mail. `email` becomes the reply-to, `subject` the subject line, and `botcheck`, a hidden checkbox, marks spam when
 * true. It answers 200 with `{ success: true }`; a refusal is `{ success: false }` with 400, 429 (too many sends) or 500.
 */

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

export const HI_SUBJECT = 'New message from ilmarlopez.com'

export interface HiMessage {
  name: string
  email: string
  message: string
}

export interface DeliveryOptions {
  /** The public Web3Forms key (`runtimeConfig.public.web3formsKey`). It identifies the inbox; it is not a secret. */
  accessKey: string
  /** The honeypot: a checkbox no person sees, so a true here is a bot. */
  botcheck: boolean
  /** Aborts the request when the dialog is closed while it is in flight. */
  signal: AbortSignal
}

/** Web3Forms refused the message, or answered with something that is not its JSON. */
export class DeliveryError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Web3Forms answered ${status} and did not confirm the message.`)
    this.name = 'DeliveryError'
    this.status = status
  }
}

const isConfirmation = (body: unknown): boolean => typeof body === 'object' && body !== null && 'success' in body && body.success === true

/**
 * Resolves when Web3Forms has accepted the message. Rejects with a `DeliveryError` when it refused it, with a
 * `TypeError` when the network failed, and with an `AbortError` when `signal` aborted.
 */
export async function deliverMessage(message: HiMessage, { accessKey, botcheck, signal }: DeliveryOptions): Promise<void> {
  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: accessKey,
      subject: HI_SUBJECT,
      name: message.name.trim(),
      email: message.email.trim(),
      message: message.message.trim(),
      botcheck,
    }),
    signal,
  })
  // A 429 or a 500 can come without JSON; either way it is a refusal and the status says which.
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok || !isConfirmation(body)) throw new DeliveryError(response.status)
}
