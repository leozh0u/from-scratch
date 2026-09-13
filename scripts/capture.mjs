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
 *
 * THE CUT, AND WHY IT IS IN THIS ORDER
 *
 *   1. somebody plays Survival by hand, slowly enough to follow      ~10s
 *   2. the rest of the tutorial, quickly                              ~4s
 *   3. Everything fills to 600, so the grid has depth                 ~6s
 *   4. the frenzy: real play at twelve times life, over a 16,000px
 *      grid it has to scroll to reach                                ~26s
 *   5. flat out to 920/920                                            ~4s
 *   6. a slow pass down the finished inventory                        ~7s
 *
 * Act three is before act four rather than after it, which looks backwards
 * and is not: a fresh Everything is fifteen tiles on one screen, so there is
 * nothing to scroll through and the frenzy has no motion in it. Filling the
 * grid first is what gives act four somewhere to go.
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

/*
 * 1280x720 rather than 1080p. The game's column is `max-w-3xl` — 768px — so at
 * 1920 it occupies 40% of the frame and the type is small on anything watched
 * on a phone. At 1280 it is 60%, with the forest and the city filling the rest,
 * which is pixel art rather than dead space.
 */
const WIDTH = Number(arg('width', 1280))
const HEIGHT = Number(arg('height', 720))
/*
 * Paced for the edit, not for speed. Headless has no compositor, so the same
 * settings that take twenty-eight seconds in a real browser finish in seven —
 * which is a blur rather than a timelapse. 920 elements at four a tick and 90ms
 * a tick is 230 ticks and about twenty seconds, which is long enough to watch
 * the counter climb and short enough for a demo that has a minute in total.
 */
const MS = Number(arg('ms', 70))
const BATCH = Number(arg('batch', 8))
/*
 * The acted section. 220ms a click is about four times life — fast enough to
 * read as a timelapse, slow enough that a viewer can see WHICH two tiles went
 * in. One attempt in three lands, which is not the real rate (that is under
 * 3%) but is the truthful impression: somebody exploring and getting
 * somewhere. The seed is fixed so a re-take is the take before it.
 */
/*
 * WHERE TO RECORD FROM.
 *
 * Local by default, which is right for iterating and wrong for one shot in the
 * cut: `vite preview` does not run Vercel's functions, so the "why not?" panel
 * shows its offline fallback instead of a real answer from the model. Pointing
 * this at the deployment fixes that — and it has to be run from a machine the
 * deployment is not challenging, which this one currently is:
 *
 *   npm run capture -- --base=https://from-scratch-three.vercel.app
 */
const BASE = arg('base', null)

const HUMAN_MS = Number(arg('humanms', 220))
const HUMAN_SECONDS = Number(arg('humansecs', 10))
const HIT = Number(arg('hit', 0.34))
const SEED = Number(arg('seed', 11))
/*
 * The wound-up version of the same driver. 70ms a click is about twelve times
 * life; nothing is legible and it is not meant to be. A higher hit rate here
 * than in the acted opening, because this act is about things appearing.
 */
const FRENZY_MS = Number(arg('frenzyms', 55))
const FRENZY_SECONDS = Number(arg('frenzysecs', 26))
/** How full the grid is before the frenzy, so the scrolling has distance. */
const FILL_TO = Number(arg('fill', 600))
const FRENZY_HIT = Number(arg('frenzyhit', 0.55))
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
  if (!BASE && !existsSync('dist/index.html')) {
    console.error('\nNo build to record. Run `npm run build` first.\n')
    process.exit(1)
  }

  rmSync(OUT, { recursive: true, force: true })
  mkdirSync(OUT, { recursive: true })

  const { server, port } = BASE ? { server: null, port: 0 } : await serveDist()
  const base = BASE ?? `http://127.0.0.1:${port}`
  if (BASE) console.log(`  recording against ${BASE} — the model will really answer`)
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

  /*
   * ACT ONE: SOMEBODY PLAYING.
   *
   * Leo: "i want you to mimic real speed time lampse like getting things wrong
   * and right and the aniamtions etc etc." This section drives the UI rather
   * than the state — tiles go into slots, combine is pressed, most attempts
   * fail and print a real reason, the model gets asked why, a hint gets spent
   * and a discovery card gets dismissed. Every animation runs because the
   * handler behind it ran.
   */
  await page.goto(`${base}/?demo=human&ms=${HUMAN_MS}&hit=${HIT}&seed=${SEED}`)
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('button', { name: /survival/i }).first().click()
  await page.waitForTimeout(HUMAN_SECONDS * 1000)
  const played = await page.evaluate(() => {
    const m = document.body.innerText.match(/(\d+)\s*TRIES/i)
    return m ? m[1] : '?'
  })
  console.log(`  played ${played} attempts by hand`)

  /*
   * ACT TWO: the rest of the tutorial, quickly, so the cut does not spend a
   * minute watching somebody finish a chapter the viewer already understands.
   */
  await page.goto(`${base}/?demo=fast&ms=70&batch=2`)
  await page.getByRole('button', { name: /survival/i }).first().click()
  await page.waitForFunction(() => /15\/15/.test(document.body.innerText), null, { timeout: 60_000 })
  console.log('  survival complete')
  await page.waitForTimeout(1200)

  /*
   * ACT THREE: the grid fills, so act four has somewhere to go.
   *
   * This is the counter-and-tiles shot, and it is deliberately BEFORE the
   * frenzy rather than after it. The first cut had it the other way round and
   * the scrolling did nothing, because a fresh Everything is fifteen tiles on
   * one screen — there is no grid to travel through yet. Six hundred tiles is
   * about fourteen thousand pixels, and that is what makes the next act move.
   */
  await page.goto(`${base}/?demo=fast&ms=${MS}&batch=${BATCH}&stop=${FILL_TO}`)
  await page.getByRole('button', { name: /everything/i }).first().click()
  await page.waitForFunction(
    (target) => {
      const m = document.body.innerText.match(/(\d+)\/(\d+)\s*MADE/i)
      return m !== null && Number(m[1]) >= target
    },
    FILL_TO,
    { timeout: 300_000 },
  )
  console.log(`  grid filled to ${FILL_TO}`)
  await page.waitForTimeout(800)

  /*
   * ACT FOUR: THE ACTUAL TIMELAPSE.
   *
   * Leo: "i still want to see like the objects and new thing found tabs and
   * hint stuff pop up very very quickly, not just the bar and numbers going
   * up... movements quick jittery up and down, things increasing, unlovking,
   * screens poopping up, like an acutal time lapse video."
   *
   * Same human driver, wound right up. Tiles go in, cards open and close,
   * hints fire, the model gets asked, and the page hurls itself up and down
   * the grid because the driver scrolls to whatever it is about to click.
   * Nothing is legible and none of it is meant to be.
   */
  await page.goto(`${base}/?demo=human&ms=${FRENZY_MS}&hit=${FRENZY_HIT}&seed=${SEED + 1}`)
  await page.getByRole('button', { name: /everything/i }).first().click()
  await page.waitForTimeout(FRENZY_SECONDS * 1000)
  const travelled = await page.evaluate(() => document.documentElement.scrollHeight)
  console.log(`  frenzy over a grid ${travelled}px tall`)

  // ACT FIVE: flat out to the end.
  await page.goto(`${base}/?demo=fast&ms=${MS}&batch=${BATCH}`)
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
  const SCROLL_SECONDS = 7
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
  server?.close()

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
