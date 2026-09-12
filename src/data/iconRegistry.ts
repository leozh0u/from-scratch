import { FLAME, SHIRT } from '../art/sprites'
import type { Sprite } from '../components/PixelArt'

/*
 * Maps an ElementDef.icon key to its sprite. Only a couple of keys have real
 * art so far (they double as the realm icons on the start screen); everything
 * else is seed-era placeholder data and falls back to FLAME. Real per-element
 * sprites land alongside the verified data in steps 11 and 15 — at that point
 * every seed key below should have a genuine entry.
 */
const REGISTRY: Record<string, Sprite> = {
  fire: FLAME,
  shirt: SHIRT,
}

const PLACEHOLDER = FLAME

export function resolveIcon(iconKey: string): Sprite {
  return REGISTRY[iconKey] ?? PLACEHOLDER
}
