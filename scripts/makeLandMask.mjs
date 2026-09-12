/*
 * Turns NASA's equirectangular land mask into a tiny one-bit grid that the
 * game can project onto a sphere at runtime.
 *
 * WHY NOT JUST DRAW A GLOBE BY HAND
 *
 * The title screen's Earth is the first thing anyone sees, and a hand-drawn
 * pixel globe reads as "a circle with green blobs on it" no matter how much
 * care goes into the blobs — the continents are the one shape on Earth that
 * everybody can check at a glance. Projecting real geography means South
 * America is actually the right shape, and it costs less work than drawing it
 * badly would.
 *
 * WHY A MASK RATHER THAN PRE-RENDERED FRAMES
 *
 * A spinning globe needs a frame per rotation step. Committing, say, sixteen
 * 64x64 sprites is ~65KB of source text that nobody can edit and that locks
 * the resolution and the frame count in place. Committing the mask instead is
 * ~2KB, renders at any size, and rotates continuously rather than in steps.
 *
 * Source: NASA Visible Earth, Blue Marble Next Generation (Reto Stockli, NASA
 * Earth Observatory, MODIS/Terra). US government work, public domain. Taken
 * from ~/Projects/vestigo, which credits it the same way.
 *
 *   node scripts/makeLandMask.mjs
 *
 * Writes src/art/landMask.ts. Re-run only if the source or the grid size
 * changes; the output is committed.
 */
import { inflateSync } from 'node:zlib'
import { readFileSync, writeFileSync } from 'node:fs'

const SOURCE = '/Users/leo/Projects/vestigo/site/public/textures/globe-land.png'

/*
 * Output grid. 360x180 is one cell per degree, which is far more than a 64px
 * globe can show — but the globe is sampled at whatever size it is drawn, and
 * oversampling the mask is what keeps coastlines from shimmering as it turns.
 * Packed to one bit per cell it is still small.
 */
const COLS = 360
const ROWS = 180

/** Greyscale above this counts as land. The mask is near-binary already. */
const LAND_THRESHOLD = 128

/** Minimal decoder for the one PNG shape this file has to read:
 *  8-bit greyscale, no interlacing. Enough, and no dependency. */
function decodeGreyscalePng(buffer) {
  let at = 8
  let header = null
  const chunks = []

  while (at < buffer.length) {
    const length = buffer.readUInt32BE(at)
    const type = buffer.toString('ascii', at + 4, at + 8)
    if (type === 'IHDR') {
      header = {
        width: buffer.readUInt32BE(at + 8),
        height: buffer.readUInt32BE(at + 12),
        depth: buffer[at + 16],
        colorType: buffer[at + 17],
        interlace: buffer[at + 20],
      }
    }
    if (type === 'IDAT') chunks.push(buffer.subarray(at + 8, at + 8 + length))
    at += 12 + length
  }

  if (!header) throw new Error('no IHDR')
  if (header.depth !== 8 || header.colorType !== 0 || header.interlace !== 0) {
    throw new Error(
      `expected 8-bit non-interlaced greyscale, got depth=${header.depth} color=${header.colorType} interlace=${header.interlace}`,
    )
  }

  const raw = inflateSync(Buffer.concat(chunks))
  const { width, height } = header
  const out = Buffer.alloc(width * height)

  // PNG filtering: each scanline is prefixed with a filter byte and is
  // defined against the reconstructed line above it, so this has to run in
  // order and cannot be parallelised.
  let pos = 0
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++]
    const line = raw.subarray(pos, pos + width)
    pos += width
    const dest = y * width
    const above = dest - width

    for (let x = 0; x < width; x++) {
      const left = x > 0 ? out[dest + x - 1] : 0
      const up = y > 0 ? out[above + x] : 0
      const upLeft = x > 0 && y > 0 ? out[above + x - 1] : 0
      let value = line[x]

      if (filter === 1) value += left
      else if (filter === 2) value += up
      else if (filter === 3) value += (left + up) >> 1
      else if (filter === 4) {
        // Paeth: pick whichever neighbour the gradient predicts best.
        const p = left + up - upLeft
        const pa = Math.abs(p - left)
        const pb = Math.abs(p - up)
        const pc = Math.abs(p - upLeft)
        value += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft
      } else if (filter !== 0) {
        throw new Error(`unknown PNG filter ${filter} on row ${y}`)
      }

      out[dest + x] = value & 0xff
    }
  }

  return { width, height, data: out }
}

const image = decodeGreyscalePng(readFileSync(SOURCE))
console.log(`source ${image.width}x${image.height}`)

/*
 * Downsample by area-averaging rather than by point-sampling. Point-sampling a
 * 2048-wide mask down to 360 throws away 82% of the pixels and drops narrow
 * features entirely — Italy and the Korean peninsula both vanish. Averaging
 * the block and then thresholding keeps anything that covers a reasonable
 * fraction of a cell.
 */
const bits = new Uint8Array(COLS * ROWS)
let landCells = 0

for (let row = 0; row < ROWS; row++) {
  const y0 = Math.floor((row / ROWS) * image.height)
  const y1 = Math.max(y0 + 1, Math.floor(((row + 1) / ROWS) * image.height))

  for (let col = 0; col < COLS; col++) {
    const x0 = Math.floor((col / COLS) * image.width)
    const x1 = Math.max(x0 + 1, Math.floor(((col + 1) / COLS) * image.width))

    let sum = 0
    let count = 0
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        sum += image.data[y * image.width + x]
        count++
      }
    }

    const isLand = sum / count >= LAND_THRESHOLD ? 1 : 0
    bits[row * COLS + col] = isLand
    landCells += isLand
  }
}

const landFraction = landCells / (COLS * ROWS)
console.log(`land cells ${landCells} / ${COLS * ROWS} = ${(landFraction * 100).toFixed(1)}%`)

/*
 * Sanity check against reality rather than against the last run. Earth is
 * about 29% land by surface area; an equirectangular grid over-weights the
 * poles, where Antarctica and Greenland are, so the cell fraction comes out
 * higher than the true figure. Anywhere in this band means the mask decoded
 * and the threshold is sane. Outside it means something is wrong and the
 * globe would be visibly incorrect, which is the one thing this file exists
 * to prevent.
 */
if (landFraction < 0.2 || landFraction > 0.45) {
  throw new Error(
    `land fraction ${(landFraction * 100).toFixed(1)}% is implausible — decode or threshold is wrong`,
  )
}

// Pack one bit per cell, base64. ~8KB of source rather than ~65KB of text.
const packed = Buffer.alloc(Math.ceil(bits.length / 8))
for (let i = 0; i < bits.length; i++) {
  if (bits[i]) packed[i >> 3] |= 0x80 >> (i & 7)
}

const file = `/*
 * Real coastlines, one bit per cell, ${COLS}x${ROWS} equirectangular.
 *
 * GENERATED by scripts/makeLandMask.mjs — do not edit by hand. Re-run that
 * script to change the resolution.
 *
 * Source: NASA Visible Earth, Blue Marble Next Generation (Reto Stockli, NASA
 * Earth Observatory, using MODIS/Terra data). A US government work, in the
 * public domain. The credit is here because saying where a picture came from
 * is right, not because a licence demands it.
 *
 * Projected onto a sphere at runtime by components/PixelEarth.tsx, so the
 * globe can be drawn at any size and rotate continuously instead of stepping
 * through pre-rendered frames.
 */

export const LAND_COLS = ${COLS}
export const LAND_ROWS = ${ROWS}

const PACKED =
  '${packed.toString('base64')}'

const bytes = Uint8Array.from(atob(PACKED), (c) => c.charCodeAt(0))

/** True where cell (col, row) is land. Row 0 is the north pole. */
export function isLand(col: number, row: number): boolean {
  const wrapped = ((col % LAND_COLS) + LAND_COLS) % LAND_COLS
  if (row < 0 || row >= LAND_ROWS) return false
  const i = row * LAND_COLS + wrapped
  return (bytes[i >> 3] & (0x80 >> (i & 7))) !== 0
}
`

writeFileSync('src/art/landMask.ts', file)
console.log(`wrote src/art/landMask.ts (${(file.length / 1024).toFixed(1)}KB)`)
