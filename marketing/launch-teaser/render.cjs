// Usage: python3 soundtrack.py && node render.cjs [out.mp4] [--stills]
// Needs `playwright` resolvable (e.g. via NODE_PATH) and ffmpeg on PATH.
const path = require('path')
const { spawn } = require('child_process')
const { chromium } = require('playwright')

const FPS = 30
const STILL_TIMES = [0.5, 1.8, 3.7, 5.7, 6.0, 7.0, 9.4, 11.8, 13.7, 14.2, 14.7, 16.8]
const args = process.argv.slice(2)
const stills = args.includes('--stills')
const out = path.resolve(args.find((a) => !a.startsWith('--')) ?? path.join(__dirname, 'nxtte-teaser.mp4'))

async function main() {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] })
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } })
  await page.goto('file://' + path.join(__dirname, 'teaser.html'))
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map((img) => img.decode()))
  })
  const duration = await page.evaluate(() => window.DURATION)

  if (stills) {
    for (const t of STILL_TIMES) {
      await page.evaluate((x) => window.render(x), t)
      await page.screenshot({ path: path.join(path.dirname(out), `still-${t}.png`) })
    }
    await browser.close()
    return
  }

  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-i', path.join(__dirname, 'soundtrack.wav'),
    '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'ignore', 'inherit'] })

  const frames = Math.round(duration * FPS)
  for (let i = 0; i < frames; i++) {
    await page.evaluate((x) => window.render(x), i / FPS)
    const buf = await page.screenshot({ type: 'png' })
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r))
  }
  ff.stdin.end()
  await new Promise((r) => ff.on('close', r))
  await browser.close()
  console.log('wrote', out, frames, 'frames')
}

main().catch((err) => { console.error(err); process.exit(1) })
