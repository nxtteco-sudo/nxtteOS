'use client'

import { track } from '@vercel/analytics'

// The 4 events CLAUDE.md / AGENTS.md §9 require. Meta Pixel firing (esp.
// `audit_submit` on /thanks) is wired when that page is built — the pixel
// script itself isn't added yet (no pixel ID supplied). See content gaps.
export type TrackedEvent = 'whatsapp_click' | 'package_view' | 'audit_submit' | 'contact_submit'

export function trackEvent(event: TrackedEvent, props?: Record<string, string>) {
  track(event, props)
}
