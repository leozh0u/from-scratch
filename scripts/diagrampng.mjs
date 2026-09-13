/**
 * The diagrams, rasterised.
 *
 * An SVG is the right thing to keep in the repo — text, diffable, resolution
 * independent — and the wrong thing to drop on a video timeline, where an
 * editor either refuses it or renders it with its own idea of the font. This
 * opens each one in the same browser the game runs in, with the same Google
 * Fonts stylesheet the app loads, and photographs it at 2x.
 */
import { chromium } from 'playwright'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const SRC = 'docs/slides/svg'
const DIR = 'docs/slides'
const FONTS =
  'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'

const browser = await chromium.launch()
const page = await browser.newPage({ deviceScaleFactor: 2 })

for (const file of readdirSync(SRC).filter((f) => f.endsWith('.svg'))) {
  const svg = readFileSync(join(SRC, file), 'utf8')
  const [, w, h] = svg.match(/width="(\d+)" height="(\d+)"/) ?? []
  await page.setViewportSize({ width: Number(w), height: Number(h) })
  await page.setContent(
    `<link rel="stylesheet" href="${FONTS}">
     <style>html,body{margin:0;padding:0;background:#191536}</style>
     ${svg}`,
    { waitUntil: 'networkidle' },
  )
  // The face has to be resident before the shot, or every label falls back to
  // a monospace that is not the game's.
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  const out = join(DIR, file.replace(/\.svg$/, '.png'))
  await page.screenshot({ path: out })
  console.log(`  ${out}`)
}

await browser.close()
