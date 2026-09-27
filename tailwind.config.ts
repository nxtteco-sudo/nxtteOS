import type { Config } from 'tailwindcss'

// Color tokens per nxtte_website_spec.pdf v1.1, Section 07 (Colour System — Light Mode).
// See AGENTS.md §6 for full rationale. Do not add a "cream" token or a raw dark
// background token here — the only dark surface in this system is `ink-section`,
// reserved for the two full-bleed black blocks (Packages, Final CTA).
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FFFFFF',
        surface: '#F7F6F4',
        border: '#E6E4E1',
        pink: {
          DEFAULT: '#C9507B', // text-safe pink — 4.6:1 on white. Buttons, links, prices.
          soft: '#F2779F', // decorative fills ONLY. Never text under 24px, and never on a light bg at all (fails 3:1 even at heading size).
          tint: '#FDF2F6',
        },
        ink: '#0A0A0A',
        muted: '#6B6B72',
        'ink-section': '#0A0A0A', // full-bleed dark sections: Packages, Final CTA
      },
      fontFamily: {
        sans: ['var(--font-primary)', 'Inter', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        button: '12px',
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
}

export default config
