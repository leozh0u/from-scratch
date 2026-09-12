import type { CSSProperties, HTMLAttributes } from 'react'
import { steppedNotch, OUTLINE } from './pixelShape'

/**
 * A panel.
 *
 * This was `rounded-panel bg-white shadow-[0_12px_40px_rgba(...)]` — a white
 * card with a forty-pixel blur under it, which is the single most recognisable
 * shape in modern web design and the exact thing that made the game read as a
 * template with a pixel background behind it.
 *
 * It is now built the same way as the buttons: a dark plate cut to a staircase
 * silhouette, a lighter face inset inside it, a hard band of highlight along
 * the top and shadow along the bottom, and no blur anywhere. Depth comes from
 * an offset block of darker colour, which is how it was always done.
 */
type CardProps = {
  /** Sprite-pixel unit. Outline, bevel and corner treads are multiples of it. */
  unit?: number
  /** Panel face. Defaults to the game's mid-navy. */
  tone?: string
  style?: CSSProperties
} & Omit<HTMLAttributes<HTMLDivElement>, 'style'>

const FACE = '#332f57'
const HI = '#4a4578'
const LO = '#231f40'

export function Card({
  unit = 4,
  tone = FACE,
  className = '',
  children,
  style,
  ...rest
}: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: OUTLINE,
        clipPath: steppedNotch(unit, 3),
        padding: unit,
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          background: tone,
          clipPath: steppedNotch(unit, 2),
          // Hard bands, zero blur: two rows of lighter pixels along the top
          // and darker along the bottom, exactly as a sprite artist would draw
          // the lip of a box.
          boxShadow: `inset 0 ${unit}px 0 0 ${HI}, inset 0 -${unit}px 0 0 ${LO}`,
          padding: unit * 3,
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  )
}
