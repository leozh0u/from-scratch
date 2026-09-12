import { useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { PixelArt } from '../PixelArt'
import { CHAIN_LINK, PADLOCK } from '../../art/sprites'

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

/** The octagon. `c` is how far each corner is cut, in pixels. */
function notch(c: number) {
  return `polygon(${c}px 0, calc(100% - ${c}px) 0, 100% ${c}px, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, ${c}px 100%, 0 calc(100% - ${c}px), 0 ${c}px)`
}

/**
 * The chain, laid across a locked button like a chest nobody has opened yet.
 *
 * A greyed-out control tells you that you cannot press it. A chained one tells
 * you there is something inside worth getting to, which is the whole point of
 * locking Everyday behind Survival — it has to read as a prize, not as a
 * disabled form field.
 *
 * Built from one repeated link sprite rather than one long drawn chain, so it
 * fits a button of any width without stretching. Stretching pixel art is the
 * one thing that always looks wrong.
 */
function Chain({ unit }: { unit: number }) {
  /*
   * Sized from the button, not picked by eye.
   *
   * Half the unit gave ~50 tiny links across the button, which read as a row
   * of little circles. Twice the unit made the padlock taller than the button
   * itself, so it was clipped into an unrecognisable blob. The sprites are 10
   * and 12 rows tall, and the button's face is about 12 units, so one unit per
   * sprite pixel is the scale that fits both inside it.
   */
  const scale = Math.max(2, unit)
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        /*
         * BEHIND the label, not over it.
         *
         * The first pass drew the chain across the front and the padlock dead
         * centre, which buried the word it was supposed to be locking. The
         * chain has to say "shut" without making the button illegible — so it
         * runs behind the text, and the lock hangs off to one side rather than
         * sitting on top of the label.
         */
        zIndex: 0,
      }}
    >
      {/*
       * TWO RUNS WITH A GAP, not one continuous band.
       *
       * A chain straight across the middle put links directly behind every
       * letter of the label and smothered it. Real chain on a chest wraps the
       * body and leaves the front plate readable, so this does the same:
       * a run in from each edge, a clear span in the middle for the word, and
       * the padlock hanging where the right-hand run stops.
       */}
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '30%',
          transform: 'translateY(-50%)',
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <PixelArt key={i} sprite={CHAIN_LINK} scale={scale} />
        ))}
      </span>
      <span
        style={{
          position: 'absolute',
          top: '50%',
          right: 0,
          width: '30%',
          transform: 'translateY(-50%)',
          display: 'flex',
          justifyContent: 'flex-end',
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <PixelArt key={i} sprite={CHAIN_LINK} scale={scale} />
        ))}
      </span>
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '68%',
          transform: 'translateY(-50%)',
        }}
      >
        <PixelArt sprite={PADLOCK} scale={scale} />
      </span>
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
  const border = unit
  const corner = unit * 2
  const depth = unit * 2
  const bevel = unit

  function press(from: 'pointer' | 'key') {
    if (inert) return
    source.current = from
    setPressed(true)
  }

  function release(from: 'pointer' | 'key') {
    if (source.current !== from) return
    source.current = null
    setPressed(false)
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
      onPointerEnter={() => setHovered(true)}
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
          clipPath: notch(corner),
          display: down ? 'none' : 'block',
        }}
      >
        <span
          style={{
            position: 'absolute',
            inset: border,
            background: c.base,
            clipPath: notch(Math.max(1, corner - border)),
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
          clipPath: notch(corner),
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
            padding: `${unit * 3}px ${unit * 4}px`,
            background: hovered && !inert ? c.hi : c.face,
            clipPath: notch(Math.max(1, corner - border)),
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
          {locked && <Chain unit={unit} />}
          <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: unit * 2 }}>
            {icon}
            {children}
          </span>
        </span>
      </span>
    </button>
  )
}
