// Registers the document fonts once per process. The .woff files live in
// assets/fonts and are shipped with the PDF routes (next.config.ts
// outputFileTracingIncludes), so PDFs render the same locally and on Vercel.
import path from 'node:path'
import { Font } from '@react-pdf/renderer'

let done = false
const f = (file: string) => path.join(process.cwd(), 'assets', 'fonts', file)

export const LOGO_PATH = path.join(process.cwd(), 'public', 'brand', 'nxtte-logo.png')

export function registerFonts() {
  if (done) return
  done = true
  Font.register({
    family: 'DMSans',
    fonts: [
      { src: f('DMSans-Regular.woff'), fontWeight: 400 },
      { src: f('DMSans-Medium.woff'), fontWeight: 500 },
      { src: f('DMSans-Bold.woff'), fontWeight: 700 },
    ],
  })
  Font.register({ family: 'SpaceGrotesk', fonts: [{ src: f('SpaceGrotesk-Bold.woff'), fontWeight: 700 }] })
  // No hyphenation: words are never split across lines.
  Font.registerHyphenationCallback((word) => [word])
}
