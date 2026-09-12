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
/*
 * SIX ROWS, NOT ELEVEN, AND THAT IS THE WHOLE FIX FOR THE ALIGNMENT.
 *
 * Leo: "they are not level." The button next to this one is the same control
 * with a word in it, and a word's box is the font's line height —
 * `unit * 3 * 1.3`, so twelve pixels at unit 3. The first speaker was eleven
 * rows drawn at scale 2, which is twenty-two, so the mute key stood ten
 * pixels taller than reset and their faces could not line up.
 *
 * Six rows at scale 2 is twelve pixels: the same box the label occupies. The
 * icon is now the same height as a line of type, which is what makes two
 * buttons with different contents the same size.
 */
const SPEAKER: Sprite = {
  rows: [
    '..aa...a...',
    '.aaa..a.a..',
    'aaaa.a.a.a.',
    'aaaa.a.a.a.',
    '.aaa..a.a..',
    '..aa...a...',
  ],
  palette: { a: '#ffffff' },
}

/*
 * Muted is a speaker with a cross beside it, not a speaker with a bar drawn
 * across it. A bar through the cone is a rendering trick that needs more
 * pixels than there are here; at this size it reads as a smudge.
 */
const MUTED: Sprite = {
  rows: [
    '..aa.......',
    '.aaa..b.b..',
    'aaaa...b...',
    'aaaa..b.b..',
    '.aaa.......',
    '..aa.......',
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
      {/* A box exactly as tall as a line of the button's own type, so this
        * key and the worded one beside it are the same height. */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          height: Math.round(unit * 3 * 1.3),
        }}
      >
        <PixelArt sprite={muted ? MUTED : SPEAKER} scale={2} />
      </span>
    </PixelButton>
  )
}
