import { useState } from 'react'
import { PixelButton } from './PixelButton'
import { PixelArt } from '../PixelArt'
import type { Sprite } from '../PixelArt'
import { isMuted, setMuted } from '../../audio/sfx'

/**
 * Mute, next to reset.
 *
 * A speaker drawn as a sprite rather than set as a character: an emoji is the
 * one thing on this screen that would not be pixel art, and a glyph from the
 * display font is a 9px speck for the same reason the back arrow was.
 *
 * The two states are two sprites, not one sprite with something drawn over
 * it. A bar across a speaker is a rendering trick; a speaker with a cross
 * beside it is a drawing, and at eleven pixels the difference is whether it
 * reads at all.
 */
const SPEAKER: Sprite = {
  rows: [
    '..........a',
    '...aa...a.a',
    '..aaa..a..a',
    '.aaaa.a.a.a',
    'aaaaa.a.a.a',
    'aaaaa.a.a.a',
    '.aaaa.a.a.a',
    '..aaa..a..a',
    '...aa...a.a',
    '..........a',
    '...........',
  ],
  palette: { a: '#ffffff' },
}

const MUTED: Sprite = {
  rows: [
    '...........',
    '...aa......',
    '..aaa..b.b.',
    '.aaaa...b..',
    'aaaaa..b.b.',
    'aaaaa......',
    '.aaaa..b.b.',
    '..aaa...b..',
    '...aa..b.b.',
    '...........',
    '...........',
  ],
  palette: { a: '#ffffff', b: '#ff7d7d' },
}

export function MuteButton({ unit = 3 }: { unit?: number }) {
  // Read once on mount. The module owns the truth and persists it; this is
  // only what to draw.
  const [muted, setLocal] = useState(() => isMuted())

  return (
    <PixelButton
      tone="default"
      unit={unit}
      aria-label={muted ? 'Unmute' : 'Mute'}
      aria-pressed={muted}
      onClick={() => {
        const next = !muted
        setMuted(next)
        setLocal(next)
      }}
    >
      <PixelArt sprite={muted ? MUTED : SPEAKER} scale={Math.max(2, Math.round(unit * 0.7))} />
    </PixelButton>
  )
}
