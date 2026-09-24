/**
 * Re-light the two backdrops for every world that needs them.
 *
 * The rules live in `src/art/moods.ts`, because the scenes' moving parts use
 * them at runtime too; this only applies them to the PNGs ahead of time, so a
 * world's backdrop is one ordinary image and never a flash of the wrong light
 * while a canvas repaints. See that file for why worlds are re-lit rather than
 * repainted.
 *
 *   npm run relight
 *
 * Authoring tool: run it when a mood rule changes. `scripts/worldtest.ts`
 * fails if a committed variant has drifted from the rules.
 */
import { relight, backdropFile, type MoodId, type Rgb } from '../src/art/moods'
import { WORLDS } from '../src/data/worlds'
import { readPng, writePng, rgbOf } from './png'

export function relightPixels(src: string, mood: MoodId): { width: number; height: number; rgb: Buffer; colours: number } {
  const png = readPng(src)
  const pixels = rgbOf(png)
  const out = Buffer.alloc(pixels.length)
  const seen = new Map<number, Rgb>()
  for (let i = 0; i < pixels.length; i += 3) {
    const key = (pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2]
    let next = seen.get(key)
    if (!next) {
      next = relight([pixels[i], pixels[i + 1], pixels[i + 2]], mood)
      seen.set(key, next)
    }
    out[i] = next[0]
    out[i + 1] = next[1]
    out[i + 2] = next[2]
  }
  return { width: png.width, height: png.height, rgb: out, colours: seen.size }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const wanted = new Map<string, { scene: 'forest' | 'city'; mood: MoodId }>()
  for (const world of WORLDS) wanted.set(backdropFile(world.scene, world.mood), world)
  for (const [file, { scene, mood }] of wanted) {
    if (mood === 'day') continue
    const { width, height, rgb, colours } = relightPixels(`public/${backdropFile(scene, 'day')}`, mood)
    writePng(`public/${file}`, width, height, rgb)
    console.log(`public/${file}: ${width}x${height}, ${colours} colours, ${mood}`)
  }
}
