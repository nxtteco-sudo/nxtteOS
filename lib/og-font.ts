import 'server-only'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Space Grotesk Bold (SIL Open Font License) for generated icons and link
// previews, so they match the site's display face.
export async function ogFonts() {
  const data = await readFile(join(process.cwd(), 'assets/fonts/SpaceGrotesk-Bold.woff'))
  return [{ name: 'Space Grotesk', data, weight: 700 as const, style: 'normal' as const }]
}
