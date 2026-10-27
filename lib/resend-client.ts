import { Resend } from 'resend'

/** Create the Resend client only while handling work that sends an email.
 * Preview/build environments must not need the live sending credential.
 * A missing key fails closed at the call site; no default/demo key is used.
 */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  return apiKey ? new Resend(apiKey) : null
}
