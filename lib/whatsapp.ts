// TODO: replace with the real nxtte business WhatsApp number in E.164 format
// without the leading "+" (e.g. "60123456789"). Not in the spec's own "content
// gaps" list, but the site cannot go live without it — flagging here rather than
// inventing a number. See CLAUDE.md "Content gaps".
const WHATSAPP_NUMBER = 'TODO_WHATSAPP_NUMBER'

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi nxtte, I'd like to know more about your packages."
