import { PixelArt } from '../PixelArt'
import type { Sprite } from '../PixelArt'

/**
 * The back arrow, drawn rather than typed.
 *
 * It was the character "←", which is a glyph from the label's own font at the
 * label's own size — so on a button whose text is 9px, the arrow is a 9px
 * arrow with a one-pixel stem, and it reads as a speck. Making the type bigger
 * to fix the arrow makes the word too big; the two want different sizes, which
 * is the tell that the arrow should not be type.
 *
 * As a sprite it scales on its own. It is drawn chunky on purpose: a solid
 * head and a three-pixel shaft, so it survives at the smallest unit the HUD
 * uses and still reads as an arrow rather than as a hyphen.
 */
const ARROW: Sprite = {
  rows: [
    '...a.......',
    '..aa.......',
    '.aaa.......',
    'aaaaaaaaaa.',
    'aaaaaaaaaa.',
    'aaaaaaaaaa.',
    '.aaa.......',
    '..aa.......',
    '...a.......',
  ],
  palette: { a: '#ffffff' },
}

export function BackArrow({ unit = 3 }: { unit?: number }) {
  /*
   * Scaled from the button's unit rather than fixed, so it grows with the
   * control it sits in. Floored at 2, because a one-pixel-per-pixel sprite at
   * this size is the speck we started with.
   */
  return <PixelArt sprite={ARROW} scale={Math.max(2, Math.round(unit * 0.75))} />
}
