'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { trackEvent, type TrackedEvent } from '@/lib/analytics'
import { formSchemas, validateField, type ActionResult, type FormKey } from '@/lib/validation/forms'

export type FormField = {
  name: string
  label: string
  type?: 'text' | 'tel' | 'select'
  placeholder?: string
  autoComplete?: string
  options?: { value: string; label: string }[]
}

type Props = {
  formKey: FormKey
  fields: FormField[]
  action: (formData: FormData) => Promise<ActionResult>
  submitLabel: string
  trackingEvent: TrackedEvent
  redirectTo: string
}

// Shared by /audit and /contact (AGENTS.md §8: field set passed as a prop).
// Inputs are controlled and submit goes through onSubmit, not a form action, so a
// failed submit never resets what the visitor typed.
export function Form({ formKey, fields, action, submitLabel, trackingEvent, redirectTo }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, ''])),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  function handleBlur(name: string) {
    const message = validateField(formKey, name, values[name] ?? '')
    setErrors((prev) => {
      const next = { ...prev }
      if (message) next[name] = message
      else delete next[name]
      return next
    })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const result = formSchemas[formKey].safeParse(values)
    if (!result.success) {
      const next: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? '')
        if (key && !next[key]) next[key] = issue.message
      }
      setErrors(next)
      return
    }

    trackEvent(trackingEvent)

    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) formData.set(key, value)

    startTransition(async () => {
      const response = await action(formData)
      if (response.success) {
        router.push(redirectTo)
        return
      }
      if (response.fieldErrors) setErrors(response.fieldErrors)
      setFormError(response.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {fields.map((field) => {
        const error = errors[field.name]
        const errorId = `${field.name}-error`
        const fieldClassName = `mt-1 block min-h-[44px] w-full rounded-button border bg-bg px-4 text-base text-ink ${
          error ? 'border-2 border-pink' : 'border-border'
        }`
        return (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-semibold text-ink">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={values[field.name] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                onBlur={() => handleBlur(field.name)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className={fieldClassName}
              >
                <option value="" disabled>
                  {field.placeholder ?? 'Choose one'}
                </option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type ?? 'text'}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                value={values[field.name] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                onBlur={() => handleBlur(field.name)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className={`${fieldClassName} placeholder:text-muted`}
              />
            )}
            {error && (
              <p id={errorId} role="alert" className="mt-1 text-sm text-ink">
                {error}
              </p>
            )}
          </div>
        )
      })}

      {formError && (
        <p role="alert" className="rounded-button border border-pink bg-pink-tint p-3 text-sm text-ink">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Sending…' : submitLabel}
      </Button>
    </form>
  )
}
