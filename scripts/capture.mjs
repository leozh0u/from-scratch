/**
 * The timelapse, recorded rather than screen-captured.
 *
 * WHY THIS RATHER THAN A SCREEN RECORDING
 *
 * Leo wants a very fast run through the whole game in the demo video, and the
 * obvious way to get it is to record a real session and speed the footage up
 * in the edit. That is hours of clicking for thirty seconds of video, and what
 * it produces is a timelapse of somebody using a mouse — a cursor jumping, the
 * scroll position lurching, the recorder's own chrome in frame.
 *
 * This drives the real production build in a real browser and records the page
 * itself. No cursor, no desktop, no window furniture, a fixed viewport, and it
 * is repeatable — which matters when the take has to be redone because a
 * number on screen changed.
 *
 * It is not an animation of the game. It is the game: every tile that appears
 * went through `game.combine` exactly as a click does.
 *
 *   npm run capture                      the default cut
 *   npm run capture -- --ms=25 --batch=8 slower, denser bursts
 *   npm run capture -- --width=1920      for a 1080p timeline
 *
 * Output lands in `capture/` as webm and mp4. The mp4 is the one to import.
 */
import { chromium } from 'playwright'
import { mkdirSync, rmSync, readdirSync, renameSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.split('=')[1] : fallback
}

const WIDTH = Number(arg('width', 1920))
const HEIGHT = Number(arg('height', 1080))
/*
 * Paced for the edit, not for speed. Headless has no compositor, so the same
 * settings that take twenty-eight seconds in a real browser finish in seven —
 * which is a blur rather than a timelapse. 920 elements at four a tick and 90ms
 * a tick is 230 ticks and about twenty seconds, which is long enough to watch
 * the counter climb and short enough for a demo that has a minute in total.
 */
const MS = Number(arg('ms', 90))
const BATCH = Number(arg('batch', 4))
const OUT = 'capture'

/*
 * Serving `dist/` here rather than leaning on `vite preview` keeps the capture
 * a single command with nothing to leave running afterwards, and it means the
 * video is of the PRODUCTION build — the same bytes the deployment serves,
 * rather than a dev server with its HMR client attached.
 */
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon',
}

function serveDist() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost')
      let file = join('dist', normalize(url.pathname).replace(/^(\.\.[/\\])+/, ''))
      if (!existsSync(file) || statSync(file).isDirectory()) file = 'dist/index.html'
      res.setHeader('content-type', TYPES[extname(file)] ?? 'application/octet-stream')
      res.end(readFileSync(file))
    })
    server.listen(0, () => resolve({ server, port: server.address().port }))
  })
}

async function main() {
  if (!existsSync('dist/index.html')) {
    console.error('\nNo build to record. Run `npm run build` first.\n')
    process.exit(1)
  }

  rmSync(OUT, { recursive: true, force: true })
  mkdirSync(OUT, { recursive: true })

  const { server, port } = await serveDist()
  const base = `http://127.0.0.1:${port}`
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    /*
     * Two pixels per CSS pixel. The art is drawn at integer scales and
     * `image-rendering: pixelated`, so a 1x capture puts a sprite pixel on one
     * screen pixel and h264's chroma subsampling smears the edges. At 2x each
     * sprite pixel survives as a 2x2 block.
     */
    deviceScaleFactor: 2,
    recordVideo: { dir: OUT, size: { width: WIDTH, height: HEIGHT } },
  })
  const page = await context.newPage()

  console.log(`\nRecording ${WIDTH}x${HEIGHT} at ms=${MS} batch=${BATCH}\n`)

  // Survival, from nothing, at a speed a viewer can follow.
  await page.goto(`${base}/?demo=1&ms=260`)
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('button', { name: /survival/i }).first().click()
  await page.waitForFunction(() => /15\/15/.test(document.body.innerText), null, { timeout: 60_000 })
  console.log('  survival complete')
  await page.waitForTimeout(1200)

  // Then Everything, flat out.
  await page.goto(`${base}/?demo=1&ms=${MS}&batch=${BATCH}`)
  await page.getByRole('button', { name: /everything/i }).first().click()
  await page.waitForFunction(
    () => {
      const m = document.body.innerText.match(/(\d+)\/(\d+)\s*MADE/i)
      return m !== null && m[1] === m[2]
    },
    null,
    { timeout: 300_000 },
  )
  console.log('  everything complete')
  // A beat on the finished board, so the last frame is not mid-burst.
  await page.waitForTimeout(1500)

  /*
   * THE PAYOFF SHOT.
   *
   * The counter climbing is the timelapse; this is what it was for. A slow
   * pass down the finished inventory is the only way to show what 920 hand-
   * sourced elements actually look like, and it is the frame to freeze on when
   * somebody says "how many are there".
   *
   * Stepped by whole pixels at 25fps rather than a CSS smooth scroll, because
   * a sub-pixel scroll offset resamples every sprite on the page and undoes
   * the one thing the art is for.
   */
  const scrollable = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  )
  const SCROLL_SECONDS = 9
  const steps = SCROLL_SECONDS * 25
  const perStep = Math.max(1, Math.round(scrollable / steps))
  for (let y = 0; y <= scrollable; y += perStep) {
    await page.evaluate((top) => window.scrollTo(0, top), y)
    await page.waitForTimeout(40)
  }
  await page.waitForTimeout(2000)
  console.log(`  scrolled ${scrollable}px of inventory`)

  await context.close()
  await browser.close()
  server.close()

  const webm = readdirSync(OUT).find((f) => f.endsWith('.webm'))
  if (!webm) throw new Error('playwright wrote no video')
  renameSync(join(OUT, webm), join(OUT, 'timelapse.webm'))

  /*
   * yuv420p and an even frame size, because anything else is a file QuickTime
   * and most editors will open to a black rectangle. `-crf 16` is close to
   * lossless: flat colour and hard pixel edges are exactly what a low bitrate
   * destroys, and the file is seconds long so the size does not matter.
   */
  execFileSync('ffmpeg', [
    '-y', '-i', join(OUT, 'timelapse.webm'),
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=neighbor',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    join(OUT, 'timelapse.mp4'),
  ], { stdio: 'inherit' })

  const size = statSync(join(OUT, 'timelapse.mp4')).size
  console.log(`\ncapture/timelapse.mp4 — ${(size / 1e6).toFixed(1)} MB\n`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
