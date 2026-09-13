/**
 * Every one of the 920 discoveries, one frame each.
 *
 * WHY THIS IS NOT A RECORDING
 *
 * Leo: *"give me a 30 second or less video of 'finishing' all 920
 * combinations... i want 920 diffferent new discovery pages, and some wrongs,
 * some hints, scattered across. making it seem like a 1 hour video of
 * completing the everything is time lapsed to 30 seconds."*
 *
 * Thirty seconds is nine hundred frames. That is roughly one frame per
 * discovery, and no amount of playing faster gets there: a browser cannot
 * mount and unmount 920 full-screen panels in half a minute, and speeding
 * footage up afterwards drops exactly the frames the cards are on — the more
 * you compress, the more of them vanish.
 *
 * Which is how timelapse has always worked. Nobody films a flower opening for
 * six hours and speeds it up; they take one exposure every thirty seconds and
 * assemble them. This does the same thing: advance the game by one beat,
 * photograph it, repeat. Every beat is the real code path — `game.combine`
 * grants the element, `explainFailure` writes the refusal — so all 920 cards
 * on screen are 920 real discoveries. Only the shutter is artificial.
 *
 *   npm run film                       the default cut, 30s at 1280x720
 *   npm run film -- --seconds=45       longer, so more of it can be filmed
 *   npm run film -- --every=10         film one interaction in ten, not fifteen
 *   npm run film -- --scroll=5         smoother scrolling, more frames per move
 */
import { chromium } from 'playwright'
import { mkdirSync, rmSync, statSync, existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.split('=')[1] : fallback
}

const WIDTH = Number(arg('width', 1280))
const HEIGHT = Number(arg('height', 720))
/*
 * How many discoveries pass between filmed ones, and how many frames a scroll
 * is spread over. A full interaction is about fifteen frames, so at thirty
 * seconds roughly sixty of them fit — one in fifteen of 920. The rest still
 * happen; they are just not photographed, which is what a timelapse is.
 */
const SECONDS = Number(arg('seconds', 30))
const SCROLL = Number(arg('scroll', 4))
/*
 * 30fps, fixed. Deriving the frame rate from the frame count landed the first
 * cut at 46fps, which is a number no editor wants to see in a timeline — and
 * the fix is to change how much gets FILMED rather than how fast it plays.
 */
const FPS = 30
/*
 * Frames a full interaction costs: three scrolls, two picks, the combine, the
 * card held three, and the dismiss. Kept in step with the driver, because this
 * is what decides how much gets filmed for a given length.
 */
const CARD_FRAMES = 3
const PER_INTERACTION = SCROLL * 3 + 3 + CARD_FRAMES + 1
/*
 * How many discoveries pass between filmed ones. Derived from the length you
 * asked for rather than picked: thirty seconds at 30fps is 900 frames, which
 * is fifty interactions, which is one in twenty of a thousand.
 */
const EVERY = Number(
  arg('every', Math.max(1, Math.round(1004 / ((SECONDS * FPS) / PER_INTERACTION)))),
)
const BASE = arg('base', null)
const OUT = 'capture'
const FRAMES = join(OUT, 'frames')

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
  if (!BASE && !existsSync('dist/index.html')) {
    console.error('\nNo build to film. Run `npm run build` first.\n')
    process.exit(1)
  }

  rmSync(FRAMES, { recursive: true, force: true })
  mkdirSync(FRAMES, { recursive: true })

  const { server, port } = BASE ? { server: null, port: 0 } : await serveDist()
  const base = BASE ?? `http://127.0.0.1:${port}`

  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } })
  const page = await context.newPage()

  /*
   * Straight into Everything with the gate already open. Leo: "i only want
   * everything." Skipping the tutorial is a real control the game already has,
   * not a back door made for this.
   */
  const filmUrl = `${base}/?demo=film&stop=${EVERY}&batch=${SCROLL}`
  await page.goto(filmUrl)
  await page.evaluate(() => {
    localStorage.clear()
    localStorage.setItem('from-scratch:skipped', '1')
  })
  await page.goto(filmUrl)
  await page.getByRole('button', { name: /everything/i }).first().click()
  await page.waitForFunction(() => '__film' in window, null, { timeout: 30_000 })

  const counts = {}
  let frame = 0
  const started = Date.now()

  for (;;) {
    const kind = await page.evaluate(() => window.__film.next())
    if (kind === 'done') break
    counts[kind] = (counts[kind] ?? 0) + 1
    if (kind === 'skip' || kind === 'plan') continue

    /*
     * Two animation frames before the shutter. One is not enough: React
     * commits on the first and the browser paints on the second, so a
     * single-frame wait photographs the card that was there before this one.
     */
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    )

    const shot = await page.screenshot({ type: 'png' })
    const { writeFileSync } = await import('node:fs')
    writeFileSync(join(FRAMES, `f${String(++frame).padStart(5, '0')}.png`), shot)

    if (frame % 100 === 0) {
      const rate = frame / ((Date.now() - started) / 1000)
      process.stdout.write(`  ${frame} frames  (${rate.toFixed(1)}/s)\r`)
    }
  }

  await browser.close()
  server?.close()

  /*
   * The frame rate is derived from the length rather than picked, which is
   * what makes "thirty seconds" true rather than approximately true: however
   * many beats the run produced, they are spread across exactly that long.
   */
  const fps = FPS
  const seconds = frame / FPS
  const made = await page.evaluate(() => window.__film?.made?.() ?? 0).catch(() => 0)
  console.log(
    `\n  ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ')}` +
      `\n  one interaction filmed in every ${EVERY}` +
      `\n  ${frame} frames at ${FPS}fps = ${seconds.toFixed(1)}s\n`,
  )
  void made

  execFileSync('ffmpeg', [
    '-y', '-framerate', String(fps), '-i', join(FRAMES, 'f%05d.png'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    // Whole pixels on the way out, so the art survives the encode.
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=neighbor',
    join(OUT, 'film.mp4'),
  ], { stdio: 'inherit' })

  rmSync(FRAMES, { recursive: true, force: true })
  const size = statSync(join(OUT, 'film.mp4')).size
  console.log(`\ncapture/film.mp4 — ${(size / 1e6).toFixed(1)} MB\n`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
