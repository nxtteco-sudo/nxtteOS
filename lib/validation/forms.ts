import { z } from 'zod'

// Shared across /audit and /contact — both forms collect the same core identity
// fields (AGENTS.md §5), so the field-level rules live in one place.
const nameField = z.string().trim().min(1, 'Enter your name').max(100, 'Keep it under 100 characters')
const businessField = z
  .string()
  .trim()
  .min(1, 'Enter your business name')
  .max(100, 'Keep it under 100 characters')
const instagramField = z
  .string()
  .trim()
  .regex(/^@?[A-Za-z0-9._]{1,30}$/, 'Enter your Instagram handle, for example @yourbrand')
const whatsappField = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{8,20}$/, 'Enter a valid WhatsApp number, for example +60 12 345 6789')

// Field lists per AGENTS.md §5: /audit is capped at 4 fields, /contact at 5.
export const auditSchema = z.object({
  name: nameField,
  business: businessField,
  instagram: instagramField,
  whatsapp: whatsappField,
})

// Matches the 2026 packages and menu (see supabase/migrations/0005).
export const SERVICE_INTERESTS = [
  'A monthly package',
  'Ads management',
  'Something from the menu',
  'The RM 199 audit',
  'Not sure yet',
] as const

export const contactSchema = z.object({
  name: nameField,
  business: businessField,
  instagram: instagramField,
  whatsapp: whatsappField,
  service_interest: z.enum(SERVICE_INTERESTS, {
    message: 'Choose what you need help with',
  }),
})

export const formSchemas = { audit: auditSchema, contact: contactSchema } as const
export type FormKey = keyof typeof formSchemas

export type FieldErrors = Record<string, string>

export type ActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: FieldErrors }

export function validateField(form: FormKey, name: string, value: string): string | null {
  const shape = formSchemas[form].shape as Record<string, z.ZodType>
  const fieldSchema = shape[name]
  if (!fieldSchema) return null
  const result = fieldSchema.safeParse(value)
  return result.success ? null : result.error.issues[0]?.message ?? 'Invalid value'
}
