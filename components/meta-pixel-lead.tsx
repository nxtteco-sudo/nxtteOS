'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    fbq?: (command: string, event: string) => void
  }
}

// Fires the Meta conversion event when /thanks mounts. No-op until the Meta Pixel
// base script is added to the app (blocked on the pixel ID, which has not been
// supplied). Verify in Meta Events Manager before launch (AGENTS.md §11).
export function MetaPixelLead() {
  useEffect(() => {
    window.fbq?.('track', 'Lead')
  }, [])
  return null
}
