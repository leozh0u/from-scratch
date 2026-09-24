/**
 * Re-light a backdrop for a world, one colour at a time.
 *
 * WHY THE WORLDS DO NOT GET NEW PAINTINGS
 *
 * Leo: "make sure its consistent with the same art and background." The two
 * backdrops were drawn by one hand at 128px, and anything drawn now, by anyone
 * else, would sit next to them looking like it came from another game. So a
 * world does not get a new painting. It gets the forest or the city under a
 * different sky: every colour in the palette is mapped to a new one, pixel for
 * pixel, so the drawing, the grid and the hand are untouched and only the light
 * changes. Games have done this for as long as there have been palettes.
 *
 * It maps COLOURS, not pixels, which is what keeps it pixel art: a 40-colour
 * scene comes out a 40-colour scene, every block still square.
 *
 *   node scripts/relight.mjs public/forest-hillside.png public/forest-autumn.png autumn
 *
 * Authoring tool, run by hand when a mood changes. Not part of the build.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { inflateSync, deflateSync } from 'node:zlib'

/* --- minimal PNG read and write, as in snapToGrid.mjs: 8-bit RGB(A), non-interlaced. --- */
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
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
    let crc = -1
    for (const byte of body) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
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

/* --- colour --- */
function toHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}
function fromHsl(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360
  const f = (t) => {
    t = (t + 1) % 1
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q
    return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p
  }
  return s === 0 ? [l, l, l].map((v) => Math.round(v * 255)) : [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255))
}
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v))
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const isGreen = (h, s) => s > 0.12 && h >= 70 && h <= 185
const isSky = (h, s, l) => s > 0.15 && h > 185 && h < 250 && l > 0.45

/*
 * Each mood is a function of one colour. Rules, not a lookup table, so the
 * same mood can light either scene and a new world costs one line.
 */
const MOODS = {
  /* Leaves turn, sky warms slightly. Hue is spread by the original hue so the
   * canopy keeps its depth instead of going one flat orange. */
  autumn(rgb) {
    const [h, s, l] = toHsl(rgb)
    if (isGreen(h, s)) {
      const t = (h - 70) / 115
      return fromHsl(48 - t * 40, clamp(s * 1.05 + 0.08), clamp(l * 0.98))
    }
    if (isSky(h, s, l)) return fromHsl(h - 8, s * 0.8, l)
    return rgb
  },
  /* Snow on everything that faced the sky; the shaded greens go blue-black. */
  winter(rgb) {
    const [h, s, l] = toHsl(rgb)
    if (isGreen(h, s)) {
      if (l > 0.42) return fromHsl(205, 0.25, clamp(0.72 + l * 0.25))
      return fromHsl(200, clamp(s * 0.45), clamp(l * 0.9))
    }
    if (isSky(h, s, l)) return fromHsl(210, s * 0.45, clamp(l * 1.04))
    return fromHsl(h, s * 0.6, l)
  },
  /* Low sun: blues go to peach and violet by height of lightness, everything
   * else is warmed and dropped a step. */
  dusk(rgb) {
    const [h, s, l] = toHsl(rgb)
    if (isSky(h, s, l)) return l > 0.7 ? fromHsl(28, 0.85, clamp(l * 0.92)) : fromHsl(300, 0.35, clamp(l * 0.72))
    const warm = mix(rgb, [255, 140, 90], 0.18)
    const [h2, s2, l2] = toHsl(warm)
    return fromHsl(h2, s2, clamp(l2 * 0.82))
  },
  /* Night: everything cools and drops, except light sources. A bright, warm
   * pixel in the city is a lit window or a lamp, and it stays lit. */
  night(rgb) {
    const [h, s, l] = toHsl(rgb)
    const lamp = l > 0.55 && s > 0.45 && (h < 60 || h > 330)
    if (lamp) return fromHsl(h < 60 ? 44 : h, clamp(s * 1.05), clamp(l * 1.02))
    if (isSky(h, s, l) || (s < 0.12 && l > 0.8)) return fromHsl(232, 0.42, clamp(0.12 + l * 0.2))
    return fromHsl(230 + (h - 230) * 0.35, clamp(s * 0.55 + 0.08), clamp(l * 0.42))
  },
}

const [, , src, dest, mood] = process.argv
if (!src || !dest || !MOODS[mood]) {
  console.error(`usage: node scripts/relight.mjs <in.png> <out.png> <${Object.keys(MOODS).join('|')}>`)
  process.exit(1)
}
const img = readPng(src)
const out = Buffer.alloc(img.width * img.height * 3)
const seen = new Map()
for (let i = 0, o = 0; i < img.data.length; i += img.channels, o += 3) {
  const key = (img.data[i] << 16) | (img.data[i + 1] << 8) | img.data[i + 2]
  let next = seen.get(key)
  if (!next) {
    next = MOODS[mood]([img.data[i], img.data[i + 1], img.data[i + 2]])
    seen.set(key, next)
  }
  out[o] = next[0]; out[o + 1] = next[1]; out[o + 2] = next[2]
}
writePng(dest, img.width, img.height, out)
console.log(`${dest}: ${img.width}x${img.height}, ${seen.size} colours in, ${new Set([...seen.values()].map(String)).size} out, mood ${mood}`)
