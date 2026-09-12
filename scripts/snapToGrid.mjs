/**
 * Snap a traced pixel-art SVG back onto its real pixel grid.
 *
 * WHY THIS HAS TO EXIST
 *
 * Leo: "why are these pixles like not actaully pixels but weird shapes."
 *
 * Both backdrops arrived as vector traces of pixel art, and a trace does not
 * preserve a grid. It preserves OUTLINES: each block becomes a polygon whose
 * edges sit at fractional coordinates, so at any zoom the blocks have ragged
 * one-pixel steps and blended edges instead of square corners. It reads as
 * "nearly pixel art", which is worse than either honest option.
 *
 * The original grid is recoverable, because a trace of pixel art keeps the
 * block boundaries even when it fuzzes them. Measuring the forest: horizontal
 * run lengths pile up at 4, 8, 12 and 16, and 75% of all colour changes land
 * on a multiple of 4 against 25% for random data. It was drawn at 128 and
 * traced at 512.
 *
 * So: render the SVG, take a majority vote of the palette over each cell of
 * the real grid, and write a PNG at that size. Every block comes out exactly
 * square, and `image-rendering: pixelated` does the rest.
 *
 *   node scripts/snapToGrid.mjs public/forest-hillside.svg public/forest-hillside.png 128
 *
 * Needs `rsvg-convert` (brew install librsvg). It is an authoring tool, run by
 * hand when art changes, not part of the build.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { inflateSync, deflateSync } from 'node:zlib'

const [, , src, dest, gridArg] = process.argv
if (!src || !dest) {
  console.error('usage: snapToGrid.mjs <in.svg> <out.png> [grid=128]')
  process.exit(1)
}
const GRID = Number(gridArg ?? 128)
const RENDER = GRID * 4

/*
 * A PNG can be snapped too, and for the same reason. `big-city.png` is stored
 * at 512 but every run length in it is a multiple of four and 100% of its
 * colour transitions land on a multiple of four, so it is a clean 4x upscale
 * of a 128 grid. Reducing it back is lossless, makes the file a quarter of the
 * size, and — the part that matters — tells the overlay how big one of the
 * artwork's pixels actually is.
 */
const isSvg = src.toLowerCase().endsWith('.svg')

/** For an SVG the palette is declared; for a bitmap it is whatever is in it. */
const palette = isSvg
  ? [...new Set([...readFileSync(src, 'utf8').matchAll(/fill="#([0-9a-fA-F]{6})"/g)].map((m) => m[1]))]
      .map((h) => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)])
  : null
if (isSvg && palette.length === 0) throw new Error('no fills found in the svg')

const tmp = `${dest}.tmp.png`
if (isSvg) execFileSync('rsvg-convert', ['-w', String(RENDER), '-h', String(RENDER), src, '-o', tmp])
else execFileSync('cp', [src, tmp])

/* --- minimal PNG read: the renderer emits 8-bit RGBA, non-interlaced. --- */
function readPng(path) {
  const buf = readFileSync(path)
  let pos = 8
  const idat = []
  let width = 0, height = 0, colour = 0, depth = 0
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    const type = buf.toString('ascii', pos + 4, pos + 8)
    const data = buf.subarray(pos + 8, pos + 8 + len)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4)
      depth = data[8]; colour = data[9]
    } else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    pos += 12 + len
  }
  if (depth !== 8 || (colour !== 6 && colour !== 2)) {
    throw new Error(`unexpected png: depth ${depth}, colour ${colour}`)
  }
  const channels = colour === 6 ? 4 : 3
  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * channels
  const out = Buffer.alloc(height * stride)
  let p = 0
  for (let y = 0; y < height; y++) {
    const filter = raw[p++]
    for (let i = 0; i < stride; i++) {
      const x = raw[p++]
      const a = i >= channels ? out[y * stride + i - channels] : 0
      const b = y > 0 ? out[(y - 1) * stride + i] : 0
      const c = i >= channels && y > 0 ? out[(y - 1) * stride + i - channels] : 0
      let v
      if (filter === 0) v = x
      else if (filter === 1) v = x + a
      else if (filter === 2) v = x + b
      else if (filter === 3) v = x + ((a + b) >> 1)
      else {
        // Paeth
        const pp = a + b - c
        const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c)
        v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)
      }
      out[y * stride + i] = v & 0xff
    }
  }
  return { width, height, channels, data: out }
}

function writePng(path, width, height, rgb) {
  const stride = width * 3
  const raw = Buffer.alloc(height * (stride + 1))
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
    const crcTable = writePng.table ??= (() => {
      const t = new Int32Array(256)
      for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c }
      return t
    })()
    let crc = -1
    for (const byte of body) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
    const crcBuf = Buffer.alloc(4); crcBuf.writeInt32BE(crc ^ -1)
    return Buffer.concat([len, body, crcBuf])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8; ihdr[9] = 2
  writeFileSync(path, Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]))
}

const img = readPng(tmp)
unlinkSync(tmp)
const cell = img.width / GRID
const nearest = (r, g, b) => {
  let best = 0, bd = Infinity
  for (let i = 0; i < palette.length; i++) {
    const q = palette[i]
    const d = (r - q[0]) ** 2 + (g - q[1]) ** 2 + (b - q[2]) ** 2
    if (d < bd) { bd = d; best = i }
  }
  return best
}

const out = Buffer.alloc(GRID * GRID * 3)
for (let gy = 0; gy < GRID; gy++) {
  for (let gx = 0; gx < GRID; gx++) {
    // Majority vote over the cell. Against a declared palette for a trace;
    // against the colours actually present for a bitmap, where a clean upscale
    // means every vote in the cell is the same anyway.
    const votes = new Map()
    for (let y = 0; y < cell; y++) {
      for (let x = 0; x < cell; x++) {
        const i = ((gy * cell + y) * img.width + (gx * cell + x)) * img.channels
        const k = palette
          ? nearest(img.data[i], img.data[i + 1], img.data[i + 2])
          : (img.data[i] << 16) | (img.data[i + 1] << 8) | img.data[i + 2]
        votes.set(k, (votes.get(k) ?? 0) + 1)
      }
    }
    let win = null
    let most = -1
    for (const [k, n] of votes) if (n > most) { most = n; win = k }
    const q = palette ? palette[win] : [(win >> 16) & 255, (win >> 8) & 255, win & 255]
    const o = (gy * GRID + gx) * 3
    out[o] = q[0]; out[o + 1] = q[1]; out[o + 2] = q[2]
  }
}

writePng(dest, GRID, GRID, out)
console.log(`${src} -> ${dest} at ${GRID}x${GRID}${palette ? `, ${palette.length} colours` : ''}`)
