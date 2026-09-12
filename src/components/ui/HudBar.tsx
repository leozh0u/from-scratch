import type { CSSProperties, ReactNode } from 'react'
import { steppedNotch, OUTLINE } from './pixelShape'

/**
 * The status strip across the top of a screen.
 *
 * These were the last plain rectangles in the game: a flat fill with
 * `border: 4px solid` and square corners, while every other surface had
 * staircase corners and a bevel. One unstyled element is enough to make the
 * whole screen read as unfinished, which is what Leo was pointing at.
 *
 * Built from the same parts as everything else — an outline plate cut to the
 * staircase, a face inset inside it, and a hard band of highlight and shadow.
 * Darker than a Card on purpose: a HUD is chrome the eye should skip over, not
 * a panel it should read.
 */
type HudBarProps = {
  unit?: number
  children: ReactNode
  className?: string
  style?: CSSProperties
}

const FACE = '#13101f'
const HI = '#2e2a4d'
const LO = '#0a0813'

export function HudBar({ unit = 4, children, className = '', style }: HudBarProps) {
  return (
    <div
      style={{
        background: OUTLINE,
        clipPath: steppedNotch(unit, 3),
        padding: unit,
        ...style,
      }}
    >
      <div
        className={className}
        style={{
          background: FACE,
          clipPath: steppedNotch(unit, 2),
          boxShadow: [
            `inset 0 ${unit}px 0 0 ${HI}`,
            `inset ${unit}px 0 0 0 ${HI}`,
            `inset 0 -${unit}px 0 0 ${LO}`,
            `inset -${unit}px 0 0 0 ${LO}`,
          ].join(', '),
          padding: `${unit * 2.5}px ${unit * 3.5}px`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * An empty combine slot — a socket, not a box.
 *
 * This was a CSS dashed border, which is not a shape a pixel grid can draw:
 * the dashes are whatever length the browser picks and they land between
 * pixels. A recessed well is both period-correct and clearer about what it
 * means — the bevel runs the other way from every raised surface in the game,
 * dark along the top and light along the bottom, which is how a hole has
 * always been drawn.
 */
export function EmptySlot({ unit = 4, size = 64 }: { unit?: number; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: OUTLINE,
        clipPath: steppedNotch(unit, 2),
        padding: unit,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1b1830',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Inverted: dark at the top, light at the bottom. A hole.
          boxShadow: [
            `inset 0 ${unit}px 0 0 #100d20`,
            `inset ${unit}px 0 0 0 #100d20`,
            `inset 0 -${unit}px 0 0 #3a3560`,
            `inset -${unit}px 0 0 0 #3a3560`,
          ].join(', '),
        }}
      >
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: unit * 3,
            color: '#4d4878',
          }}
        >
          ?
        </span>
      </div>
    </div>
  )
}
