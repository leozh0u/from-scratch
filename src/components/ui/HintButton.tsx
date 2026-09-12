import { PixelButton } from './PixelButton'
import { PixelArt } from '../PixelArt'
import type { Sprite } from '../PixelArt'

/**
 * The hint key, with its remaining count printed on the side of it.
 *
 * Same construction as every other control: staircase corners, hard outline,
 * extruded base, a real press that travels. The count rides on the extruded
 * side face, which is the same trick the title screen's two keys use for
 * their legends — it costs no vertical space and it reads as part of the
 * object rather than as a badge stuck on top of one.
 *
 * Spent out, it goes locked rather than hidden. A control that vanishes
 * teaches the player nothing; one that is visibly out of charges teaches them
 * that finding more things earns another.
 */
const BULB: Sprite = {
  rows: [
    '...aaa...',
    '..aaaaa..',
    '.aaaaaaa.',
    '.aaaaaaa.',
    '.aaaaaaa.',
    '..aaaaa..',
    '...bbb...',
    '...bbb...',
    '....b....',
  ],
  palette: { a: '#ffd24a', b: '#8a6a1f' },
}

export function HintButton({
  left,
  onClick,
  disabled,
  block,
}: {
  left: number
  onClick: () => void
  disabled?: boolean
  /** Fills its column, so this key and the other one are the same width. */
  block?: boolean
}) {
  return (
    <PixelButton
      tone="default"
      unit={3}
      block={block}
      locked={disabled}
      side={left === Infinity ? 'unlimited' : left > 0 ? `${left} left` : 'find more'}
      onClick={onClick}
      icon={<PixelArt sprite={BULB} scale={2} />}
      aria-label={left === Infinity ? 'Hint' : left > 0 ? `Hint, ${left} left` : 'No hints left'}
    >
      hint
    </PixelButton>
  )
}
