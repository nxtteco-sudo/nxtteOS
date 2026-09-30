// nxtte business WhatsApp (+60 11-7472 1429), E.164 without the leading "+".
const WHATSAPP_NUMBER = '601174721429'

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi nxtte, I'd like to know more about your packages."
