import { useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { PixelArt } from '../PixelArt'
import { PADLOCK } from '../../art/sprites'
import { playPress, playRelease, playHover, playLocked } from '../../audio/sfx'

/**
 * The button, and the thing every other control in the game inherits from.
 *
 * WHAT IT IS COPYING
 *
 * Leo's reference sheet of 8-bit UI buttons. Five things make those read as
 * physical objects rather than as coloured rectangles, and all five are here:
 *
 *   1. NOTCHED CORNERS, not rounded ones. The corner is cut off at 45 degrees
 *      — an octagon — because a pixel grid cannot draw a curve, and faking one
 *      with border-radius is the clearest tell that a "pixel" UI was made out
 *      of CSS boxes.
 *   2. A HARD BLACK OUTLINE around the whole silhouette, following the notch.
 *   3. AN EXTRUDED BASE: a solid block of a much darker shade of the same hue,
 *      offset downward, with its own outline. This is a side face, not a
 *      shadow. It is what gives the button height.
 *   4. AN INNER BEVEL: one bright band inside the top edge, one dark band
 *      inside the bottom. Hard-edged, no blur, no gradient.
 *   5. BLOCKY UPPERCASE TEXT with its own hard shadow.
 *
 * HOW IT IS BUILT
 *
 * `clip-path` cannot be combined with `border` to get an outlined octagon, and
 * it clips away any outer box-shadow. So the shape is layered instead: a black
 * plate clipped to the notch, with the coloured face inset inside it and
 * clipped to a slightly smaller notch. The base is the same pair of layers in
 * darker colours, sitting behind and below.
 *
 * THE PRESS
 *
 * The face travels down by exactly the depth of the base, and the base stops
 * showing. That is the whole illusion, and it only works if the numbers match.
 *
 * There is NO TRANSITION on it. A press is instantaneous; easing it is what
 * makes a control feel like a web page rather than a machine. The component
 * this replaces had the right mechanic and killed it with `transition-all
 * duration-100`.
 *
 * It also keyed off `:active`, which never fires for someone pressing Enter,
 * so the button was visually dead for keyboard users. Press state is tracked
 * here across pointer, keyboard and blur instead.
 */

export type PixelButtonTone = 'default' | 'survival' | 'everyday' | 'danger'

type PixelButtonProps = {
  tone?: PixelButtonTone
  /** Sprite-pixel unit. Every dimension below is a whole multiple of this. */
  unit?: number
  block?: boolean
  icon?: ReactNode
  /** Renders locked: solid, legible, and chained shut. */
  locked?: boolean
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

type Tone = {
  /** The main face colour. */
  face: string
  /** Bright band inside the top edge. */
  hi: string
  /** Dark band inside the bottom edge. */
  lo: string
  /** The extruded side face beneath the button. */
  base: string
  text: string
  textShadow: string
}

/*
 * Six flat colours per tone and not one gradient. The reference sheet's
 * buttons are saturated almost to the point of being garish, and that is
 * deliberate — an 8-bit palette had no room for tasteful desaturation, and
 * muted versions of these read as a modern UI wearing a costume.
 */
const TONES: Record<PixelButtonTone, Tone> = {
  default: {
    face: '#5b58a8',
    hi: '#8e8ad8',
    lo: '#3c3a7a',
    base: '#272552',
    text: '#ffffff',
    textShadow: '#241f4d',
  },
  survival: {
    face: '#e8752c',
    hi: '#ffab5e',
    lo: '#b5501a',
    base: '#7a3310',
    text: '#ffffff',
    textShadow: '#6b2c0d',
  },
  everyday: {
    face: '#22a2bd',
    hi: '#68dcef',
    lo: '#137689',
    base: '#0b4a59',
    text: '#ffffff',
    textShadow: '#093f4c',
  },
  danger: {
    face: '#d43b3b',
    hi: '#ff7d7d',
    lo: '#9c2424',
    base: '#651414',
    text: '#ffffff',
    textShadow: '#571010',
  },
}

/**
 * Locked is its own palette, never a transparency.
 *
 * The first version dimmed the locked button with `opacity: 0.55`, which is
 * fine on a flat background and falls apart on this one: the planet showed
 * straight through the button face and the label stopped being readable. A
 * control that is unavailable is still a solid object — it is just a cold,
 * dead one, and then it gets chained shut.
 */
const LOCKED: Tone = {
  face: '#3f3d63',
  hi: '#56537f',
  lo: '#2e2c4c',
  base: '#1f1e38',
  text: '#908dbb',
  textShadow: '#1f1e38',
}

const OUTLINE = '#100d20'

/**
 * A STAIRCASE corner, not a smooth chamfer.
 *
 * This is the difference between a UI that is pixel-themed and one that is
 * actually pixel art, and it was the thing still reading as wrong. A single
 * 45-degree cut is one straight diagonal line rendered at the display's full
 * resolution — perfectly smooth, sub-pixel antialiased, and impossible to draw
 * on a pixel grid. Look closely at the reference sheet and every corner is a
 * visible flight of steps, two or three of them, each a whole pixel deep.
 *
 * So the corner is built as a staircase whose tread is exactly one unit. At
 * y = 0 the edge starts `steps` units in; each unit down, it moves one unit
 * out. Nothing here is ever between pixels.
 *
 * Returns a clip-path polygon; the right and bottom sides use calc() so one
 * shape works at any button size.
 */
function steppedNotch(unit: number, steps: number): string {
  const pts: string[] = []
  const px = (n: number) => `${n}px`
  const rpx = (n: number) => `calc(100% - ${n}px)`

  // Top-left staircase, descending from the top edge.
  for (let k = 0; k < steps; k++) {
    pts.push(`${px((steps - k) * unit)} ${px(k * unit)}`)
    pts.push(`${px((steps - k) * unit)} ${px((k + 1) * unit)}`)
  }
  pts.push(`0 ${px(steps * unit)}`)
  // Left edge down, then the bottom-left staircase.
  pts.push(`0 ${rpx(steps * unit)}`)
  for (let k = steps - 1; k >= 0; k--) {
    pts.push(`${px((steps - k - 1) * unit)} ${rpx((k + 1) * unit)}`)
    pts.push(`${px((steps - k) * unit)} ${rpx((k + 1) * unit)}`)
    pts.push(`${px((steps - k) * unit)} ${rpx(k * unit)}`)
  }
  // Bottom edge across, then bottom-right staircase climbing.
  pts.push(`${rpx(steps * unit)} 100%`)
  for (let k = 0; k < steps; k++) {
    pts.push(`${rpx((steps - k - 1) * unit)} ${rpx(k * unit)}`)
    pts.push(`${rpx((steps - k - 1) * unit)} ${rpx((k + 1) * unit)}`)
  }
  pts.push(`100% ${rpx(steps * unit)}`)
  // Right edge up, then the top-right staircase.
  pts.push(`100% ${px(steps * unit)}`)
  for (let k = steps - 1; k >= 0; k--) {
    pts.push(`${rpx((steps - k - 1) * unit)} ${px((k + 1) * unit)}`)
    pts.push(`${rpx((steps - k - 1) * unit)} ${px(k * unit)}`)
  }

  return `polygon(${pts.join(', ')})`
}

/**
 * The padlock hung on a locked control.
 *
 * A chain was tried four times — tiled rings that read as a row of circles, a
 * thin pair that read as "oIoIoI", a heavy horizontal pair that still read as
 * decorative trim, and a diagonal run that escaped the button entirely. The
 * lock on its own says it, so the chain is gone.
 *
 * It deliberately overhangs the button's top and bottom edges, which is why
 * this is a sibling of the face rather than a child: the face is clipped to
 * its own silhouette and anything inside gets cut off at the bevel.
 */
function Lock({ unit }: { unit: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        // Measured from the left edge rather than centred: dead centre puts it
        // straight through the label.
        left: unit * 4,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      <PixelArt sprite={PADLOCK} scale={Math.max(2, Math.round(unit * 0.75))} />
    </span>
  )
}

export function PixelButton({
  tone = 'default',
  unit = 4,
  block = false,
  icon,
  locked = false,
  disabled,
  children,
  onKeyDown,
  onKeyUp,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onBlur,
  style,
  ...rest
}: PixelButtonProps) {
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)
  // Which input started the press, so releasing the mouse does not clear a
  // press the keyboard is still holding, and vice versa.
  const source = useRef<'pointer' | 'key' | null>(null)

  const inert = disabled || locked
  const c = locked ? LOCKED : TONES[tone]
  const down = pressed && !inert

  // Every measurement is a whole multiple of the unit, so the whole control
  // lands on the pixel grid at any size.
  /*
   * Everything is a whole multiple of the unit so the control always lands on
   * the pixel grid — and the unit is now large, because "not pixellated
   * enough" is mostly a matter of how coarse the blocks are. A 2px outline at
   * a 4px unit is a thin line; at a 7px unit it is a slab, which is what the
   * reference sheet has.
   */
  const border = unit
  const depth = unit * 3
  const bevel = unit
  // Three treads of one unit each. Two reads as a chamfer, four starts
  // rounding the corner off entirely.
  const shape = steppedNotch(unit, 3)
  const innerShape = steppedNotch(unit, 2)

  function press(from: 'pointer' | 'key') {
    // A locked control still answers — with a dull thud rather than silence.
    // Silence is indistinguishable from a broken button, and the one thing a
    // locked door has to do is feel locked rather than feel dead.
    if (inert) {
      if (locked) playLocked()
      return
    }
    source.current = from
    setPressed(true)
    playPress()
  }

  function release(from: 'pointer' | 'key') {
    if (source.current !== from) return
    source.current = null
    setPressed(false)
    playRelease()
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={locked || undefined}
      onPointerDown={(e) => {
        press('pointer')
        onPointerDown?.(e)
      }}
      onPointerUp={(e) => {
        release('pointer')
        onPointerUp?.(e)
      }}
      onPointerEnter={() => {
        setHovered(true)
        if (!inert) playHover()
      }}
      onPointerLeave={(e) => {
        setHovered(false)
        release('pointer')
        onPointerLeave?.(e)
      }}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') press('key')
        onKeyDown?.(e)
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') release('key')
        onKeyUp?.(e)
      }}
      // Tabbing away mid-press would otherwise leave it stuck down.
      onBlur={(e) => {
        setPressed(false)
        setHovered(false)
        source.current = null
        onBlur?.(e)
      }}
      style={{
        // The <button> itself is only a positioning context and a hit area.
        // Everything visible is the two plates inside it.
        position: 'relative',
        background: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        display: block ? 'block' : 'inline-block',
        width: block ? '100%' : undefined,
        // Room underneath for the extruded base.
        paddingBottom: depth,
        cursor: inert ? 'not-allowed' : 'pointer',
        opacity: disabled && !locked ? 0.5 : 1,
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      {...rest}
    >
      {/*
       * THE BASE — the side face the button sits on.
       *
       * Drawn only while the button is up. On press the face comes down to
       * occupy exactly this space, so hiding it is what sells the travel;
       * leaving it visible would read as the button growing rather than
       * sinking.
       */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: depth,
          bottom: 0,
          background: OUTLINE,
          clipPath: shape,
          display: down ? 'none' : 'block',
        }}
      >
        <span
          style={{
            position: 'absolute',
            inset: border,
            background: c.base,
            clipPath: innerShape,
            display: 'block',
          }}
        />
      </span>

      {/* THE FACE — black plate, coloured face inset inside it. */}
      <span
        style={{
          position: 'relative',
          display: 'block',
          background: OUTLINE,
          clipPath: shape,
          // No transition: see the note at the top of the file.
          transform: down ? `translateY(${depth}px)` : 'none',
        }}
      >
        <span
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: unit * 2,
            margin: border,
            padding: `${unit * 4}px ${unit * 5}px`,
            background: hovered && !inert ? c.hi : c.face,
            clipPath: innerShape,
            /*
             * The inner bevel: one bright band inside the top edge, one dark
             * band inside the bottom. Inset box-shadows with ZERO blur, which
             * is a hard-edged band rather than a gradient — the same thing a
             * sprite artist would draw as two rows of lighter pixels. Pressed,
             * the highlight goes and only the dark band stays, so the face
             * reads as sunk into its own hole.
             */
            boxShadow: down
              ? `inset 0 ${bevel}px 0 0 ${c.lo}`
              : `inset 0 ${bevel}px 0 0 ${c.hi}, inset 0 -${bevel}px 0 0 ${c.lo}`,
            fontFamily: 'var(--font-display)',
            fontSize: unit * 3,
            lineHeight: 1.3,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: c.text,
            // Hard offset, no blur — the reference sheet's labels all carry
            // one and it is what keeps them readable on a saturated face.
            textShadow: `${Math.max(1, Math.round(unit / 2))}px ${Math.max(1, Math.round(unit / 2))}px 0 ${c.textShadow}`,
          }}
        >
          <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: unit * 2 }}>
            {icon}
            {children}
          </span>
        </span>
      </span>

      {locked && <Lock unit={unit} />}
    </button>
  )
}
