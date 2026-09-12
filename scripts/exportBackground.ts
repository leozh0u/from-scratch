import { writeFileSync } from 'node:fs'
import { CLOUD, GROUND, PINE } from '../src/art/sprites'
import { spriteRuns, spriteSize } from '../src/components/PixelArt'
import type { Sprite } from '../src/components/PixelArt'

/*
 * One-off exporter: bakes the pixel scene (sky bands, clouds, trees, ground)
 * into a single standalone SVG file, at a fixed desktop size, for opening in
 * Figma/Illustrator/etc. outside the running app. Reuses the same
 * spriteRuns/spriteSize logic PixelArt.tsx renders with, so it's pixel-exact
 * to what's on screen — not a hand-eyeballed reproduction.
 *
 * The live app's version is responsive (scales differ by viewport); this is
 * a single frozen reference at 1280x800, matching the desktop proportions.
 */

const WIDTH = 1280
const HEIGHT = 800

const GROUND_SCALE = 6
const GROUND_HEIGHT = GROUND.rows.length * GROUND_SCALE
const TREE_LINE = GROUND_HEIGHT - 4 * GROUND_SCALE

const SKY_BANDS: [string, number, number][] = [
  ['#3fb8de', 0, 0.2],
  ['#58c7e8', 0.2, 0.38],
  ['#76d5ef', 0.38, 0.54],
  ['#97e1f3', 0.54, 0.7],
  ['#b8ecf7', 0.7, 0.86],
  ['#d6f4fa', 0.86, 1],
]

const CLOUDS = [
  { left: 0.06, top: 0.14, scale: 5 },
  { left: 0.68, top: 0.09, scale: 7 },
  { left: 0.38, top: 0.26, scale: 4 },
  { left: 0.85, top: 0.34, scale: 5 },
]

const TREES = [
  { left: 0.02, scale: 7 },
  { left: 0.1, scale: 5 },
  { left: 0.16, scale: 6 },
  { left: 0.83, scale: 6 },
  { left: 0.91, scale: 8 },
]

function spriteRects(sprite: Sprite, x: number, y: number, scale: number): string {
  return spriteRuns(sprite)
    .map(
      (run) =>
        `<rect x="${x + run.x * scale}" y="${y + run.y * scale}" width="${run.w * scale}" height="${scale}" fill="${run.fill}" />`,
    )
    .join('\n    ')
}

function groundStrip(): string {
  const { width, height } = spriteSize(GROUND)
  const tileWidth = width * GROUND_SCALE
  const tileHeight = height * GROUND_SCALE
  const tiles = Math.ceil(WIDTH / tileWidth) + 1
  const runs = spriteRuns(GROUND)

  const rects: string[] = []
  for (let t = 0; t < tiles; t++) {
    for (const run of runs) {
      rects.push(
        `<rect x="${t * tileWidth + run.x * GROUND_SCALE}" y="${HEIGHT - tileHeight + run.y * GROUND_SCALE}" width="${run.w * GROUND_SCALE}" height="${GROUND_SCALE}" fill="${run.fill}" />`,
      )
    }
  }
  return rects.join('\n    ')
}

const skyRects = SKY_BANDS.map(
  ([color, from, to]) =>
    `<rect x="0" y="${from * HEIGHT}" width="${WIDTH}" height="${(to - from) * HEIGHT}" fill="${color}" />`,
).join('\n    ')

const cloudRects = CLOUDS.map((c) =>
  spriteRects(CLOUD, c.left * WIDTH, c.top * HEIGHT, c.scale),
).join('\n    ')

const treeRects = TREES.map((t) => {
  const { height } = spriteSize(PINE)
  const y = HEIGHT - TREE_LINE - height * t.scale
  return spriteRects(PINE, t.left * WIDTH, y, t.scale)
}).join('\n    ')

const svg = `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    ${skyRects}
    ${cloudRects}
    ${treeRects}
    ${groundStrip()}
</svg>
`

const outPath = new URL('../design-exports/background.svg', import.meta.url)
writeFileSync(outPath, svg)
console.log(`Wrote ${outPath.pathname}`)
