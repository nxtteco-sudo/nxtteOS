// nxtte business WhatsApp (+60 11-7472 1429), E.164 without the leading "+".
const WHATSAPP_NUMBER = '601174721429'

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi nxtte, I'd like to know more about your packages."

// Open a chat with a customer's own number (used by the admin "Reply on
// WhatsApp" buttons). Malaysian numbers typed as 012... become 6012...
export function buildWhatsAppLinkTo(number: string, message: string): string {
  const digits = number.replace(/\D/g, '')
  const intl = digits.startsWith('0') ? `6${digits}` : digits
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`
}
