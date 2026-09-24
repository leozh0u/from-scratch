/**
 * The light a world's backdrop is seen in.
 *
 * WHY THE WORLDS DO NOT GET NEW PAINTINGS
 *
 * Leo: "make sure its consistent with the same art and background." The two
 * backdrops were drawn by one hand at 128px, and anything drawn now, by anyone
 * else, would sit beside them looking like it came from another game. So a
 * world gets the forest or the city under a different sky: every colour is
 * mapped to a new one, and the drawing, the grid and the hand stay untouched.
 *
 * It maps COLOURS, not pixels, which is what keeps it pixel art. The forest is
 * eight colours and stays eight; the city is sixteen and stays sixteen.
 *
 * ONE MODULE FOR BOTH HALVES OF A SCENE
 *
 * The backdrop PNGs are re-lit ahead of time by `scripts/relight.ts`, and the
 * scenes' moving parts (swaying tufts, falling leaves, drifting clouds, lit
 * windows) are drawn at runtime in colours taken from the same palette. Both
 * go through `relight` below, so a tuft cannot be summer-green on an autumn
 * hillside. `scripts/worldtest.ts` re-lights the source PNGs and fails if a
 * committed variant no longer matches.
 */

export type MoodId = 'day' | 'autumn' | 'winter' | 'dusk' | 'night'
export type Rgb = [number, number, number]

function toHsl([r, g, b]: Rgb): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h =
    max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

function fromHsl(h: number, s: number, l: number): Rgb {
  const hue = (((h % 360) + 360) % 360) / 360
  if (s === 0) {
    const v = Math.round(l * 255)
    return [v, v, v]
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const channel = (t: number) => {
    const u = (t + 1) % 1
    const v =
      u < 1 / 6 ? p + (q - p) * 6 * u : u < 1 / 2 ? q : u < 2 / 3 ? p + (q - p) * (2 / 3 - u) * 6 : p
    return Math.round(v * 255)
  }
  return [channel(hue + 1 / 3), channel(hue), channel(hue - 1 / 3)]
}

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const mix = (a: Rgb, b: Rgb, t: number): Rgb =>
  [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as Rgb
const isGreen = (h: number, s: number) => s > 0.12 && h >= 70 && h <= 185
const isSky = (h: number, s: number, l: number) => s > 0.15 && h > 185 && h < 250 && l > 0.45

/*
 * Rules rather than lookup tables, so either scene can take any mood and a new
 * world costs one line. Each is written against what the light would do, not
 * against a target colour.
 */
const RULES: Record<MoodId, (rgb: Rgb) => Rgb> = {
  day: (rgb) => rgb,

  /* The canopy turns, hue spread by the original hue so it keeps its depth
   * instead of going one flat orange. The sky warms a little. */
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

  /* Low sun: the bright sky goes to peach and the rest of it to violet, and
   * everything under it is warmed and dropped a step. */
  dusk(rgb) {
    const [h, s, l] = toHsl(rgb)
    if (isSky(h, s, l)) {
      return l > 0.7 ? fromHsl(28, 0.85, clamp(l * 0.92)) : fromHsl(300, 0.35, clamp(l * 0.72))
    }
    const [h2, s2, l2] = toHsl(mix(rgb, [255, 140, 90], 0.18))
    return fromHsl(h2, s2, clamp(l2 * 0.82))
  },

  /* Everything cools and drops, except light sources. A bright, warm pixel in
   * the city is a lit window or a lamp, and it stays lit. */
  night(rgb) {
    const [h, s, l] = toHsl(rgb)
    const lamp = l > 0.55 && s > 0.45 && (h < 60 || h > 330)
    if (lamp) return fromHsl(h < 60 ? 44 : h, clamp(s * 1.05), clamp(l * 1.02))
    if (isSky(h, s, l) || (s < 0.12 && l > 0.8)) return fromHsl(232, 0.42, clamp(0.12 + l * 0.2))
    return fromHsl(230 + (h - 230) * 0.35, clamp(s * 0.55 + 0.08), clamp(l * 0.42))
  },
}

export function relight(rgb: Rgb, mood: MoodId): Rgb {
  return RULES[mood](rgb)
}

const HEX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i
const RGB = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/

/** The same, for a CSS colour string as the scenes hold them: `#rrggbb` or `rgb(r,g,b)`. */
export function relightCss(colour: string, mood: MoodId): string {
  if (mood === 'day') return colour
  const m = HEX.exec(colour) ?? RGB.exec(colour)
  if (!m) return colour
  const base = HEX.test(colour)
    ? ([1, 2, 3].map((i) => parseInt(m[i], 16)) as Rgb)
    : ([1, 2, 3].map((i) => Number(m[i])) as Rgb)
  const [r, g, b] = relight(base, mood)
  return `rgb(${r},${g},${b})`
}

/** Where a scene's re-lit backdrop is served from. `day` is the original. */
export function backdropFile(scene: 'forest' | 'city', mood: MoodId): string {
  const base = scene === 'forest' ? 'forest-hillside' : 'big-city'
  return mood === 'day' ? `${base}.png` : `${base}-${mood}.png`
}
