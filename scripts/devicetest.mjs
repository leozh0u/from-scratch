/**
 * The game, on every screen anyone will open it on.
 *
 * WHY A REAL BROWSER AND NOT MORE ASSERTIONS
 *
 * `scripts/layouttest.ts` does the arithmetic — it knows what the readout and
 * the title screen should measure at any width, and it catches the faults that
 * are sums. It cannot catch the faults that are CSS: a flex child that refuses
 * to shrink, a label clipped by its own overflow rule, a page that scrolls
 * sideways because one element is eight pixels too wide.
 *
 * Those only show up in a layout engine, and they are exactly the ones that
 * reach a judge first, because the judge opens the link on a phone.
 *
 * Three checks per size, each one a thing that has actually gone wrong here:
 * the document must not scroll sideways, no text may be cut off by its own
 * container, and every control the player needs must be on the page and big
 * enough to hit.
 *
 *   npm run test:device
 */
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'

const DEVICES = [
  ['iPhone SE (1st gen)', 320, 568],
  ['iPhone SE', 375, 667],
  ['iPhone 12/13/14', 390, 844],
  ['Galaxy S8', 360, 740],
  ['Pixel 7', 412, 915],
  ['iPhone 14 Pro Max', 430, 932],
  ['Surface Duo', 540, 720],
  ['iPad mini', 744, 1133],
  ['iPad Pro 11', 834, 1194],
  ['iPad landscape', 1194, 834],
  ['MacBook Air', 1440, 900],
  ['1080p monitor', 1920, 1080],
  ['iPhone SE landscape', 667, 375],
  ['iPhone 14 landscape', 844, 390],
]

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

/** Press the button whose own label reads exactly this. */
async function clickLabel(page, label) {
  await page.evaluate((want) => {
    const button = [...document.querySelectorAll('button')].find((b) =>
      [...b.querySelectorAll('span')].some(
        (s) => s.children.length === 0 && s.textContent.trim().toLowerCase() === want,
      ),
    )
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }, label)
  await page.waitForTimeout(260)
}

let pass = 0
let fail = 0
const ok = (label, condition, detail = '') => {
  if (condition) {
    pass++
  } else {
    fail++
    console.log(`  FAIL  ${label}${detail ? '  — ' + detail : ''}`)
  }
}

/** Everything wrong with the page as it currently stands, in one pass. */
async function audit(page) {
  return page.evaluate(() => {
    const doc = document.documentElement
    const sideways = doc.scrollWidth - doc.clientWidth

    /*
     * Clipped text. `overflow: hidden` plus `white-space: nowrap` is the
     * combination that silently eats the last letter of a label — it is how
     * "EVERYTHING" became "EVERYTHINC" at 375px, invisibly, for days.
     */
    const clipped = []
    for (const el of document.querySelectorAll('h1, h2, span, p, li')) {
      if (el.children.length > 0) continue
      const style = getComputedStyle(el)
      if (style.overflow === 'visible') continue
      if (el.scrollWidth > el.clientWidth + 1) {
        clipped.push(`${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 24)}"`)
      }
    }

    /*
     * Anything smaller than 24px in either direction is a control nobody can
     * hit with a thumb. Apple asks for 44, which the pixel styling cannot
     * always give without distorting the art; 24 is the floor below which it
     * is a bug rather than a trade-off.
     */
    const tiny = []
    for (const el of document.querySelectorAll('button')) {
      const box = el.getBoundingClientRect()
      if (box.width === 0 && box.height === 0) continue
      if (box.width < 24 || box.height < 24) {
        tiny.push(`"${(el.textContent ?? '').trim().slice(0, 18)}" ${Math.round(box.width)}x${Math.round(box.height)}`)
      }
    }

    /* A control pushed off the side of the screen cannot be pressed. */
    const offscreen = []
    for (const el of document.querySelectorAll('button')) {
      const box = el.getBoundingClientRect()
      if (box.width === 0) continue
      if (box.left < -1 || box.right > doc.clientWidth + 1) {
        offscreen.push(`"${(el.textContent ?? '').trim().slice(0, 18)}"`)
      }
    }

    return { sideways, clipped, tiny, offscreen }
  })
}

async function main() {
  if (!existsSync('dist/index.html')) {
    console.error('\nNo build to test. Run `npm run build` first.\n')
    process.exit(1)
  }

  const { server, port } = await serveDist()
  const base = `http://127.0.0.1:${port}`
  const browser = await chromium.launch()

  for (const [name, width, height] of DEVICES) {
    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()

    // The title screen, with the tutorial already skipped so Everything opens.
    await page.goto(`${base}/`)
    await page.evaluate(() => {
      localStorage.clear()
      localStorage.setItem('from-scratch:skipped', '1')
    })

    for (const [screen, go] of [
      ['title', async () => page.goto(`${base}/`)],
      /*
       * Clicked by visible label rather than by accessible name. "Survival"
       * is also in the aria-label of the skipped key in the corner, so a role
       * lookup found that one and waited thirty seconds for a disabled button
       * to become clickable. What a player reads is the text on the face.
       */
      ['survival', async () => clickLabel(page, 'survival')],
      ['everything', async () => {
        await page.goto(`${base}/`)
        await clickLabel(page, 'everything')
      }],
      ['inventory', async () => {
        await page.goto(`${base}/`)
        await clickLabel(page, 'inventory')
      }],
      ['processes', async () => {
        await page.goto(`${base}/`)
        await clickLabel(page, 'inventory')
        await clickLabel(page, 'processes')
      }],
    ]) {
      await go()
      await page.waitForTimeout(220)
      const found = await audit(page)
      ok(`${name} ${width}x${height} · ${screen} does not scroll sideways`, found.sideways <= 1, `${found.sideways}px over`)
      ok(`${name} ${width}x${height} · ${screen} clips no text`, found.clipped.length === 0, found.clipped.slice(0, 3).join(', '))
      ok(`${name} ${width}x${height} · ${screen} has no unhittable control`, found.tiny.length === 0, found.tiny.slice(0, 3).join(', '))
      ok(`${name} ${width}x${height} · ${screen} keeps every control on screen`, found.offscreen.length === 0, found.offscreen.slice(0, 3).join(', '))
    }

    await context.close()
    process.stdout.write(`  ${name.padEnd(22)} ${String(width).padStart(4)}x${String(height).padEnd(4)}  checked\n`)
  }

  await browser.close()
  server.close()

  console.log(`\n${pass} passed, ${fail} failed  (${DEVICES.length} sizes, 5 screens each)\n`)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
