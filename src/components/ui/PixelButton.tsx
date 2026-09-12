import { useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'

/**
 * The button, and the thing every other control in the game inherits from.
 *
 * THE WHOLE POINT IS THAT IT FEELS LIKE AN OBJECT
 *
 * The design brief takes this from Leo's own Vestigo, whose drag code argues
 * it better than a comment here could:
 *
 *   "A drag that stops dead the instant the pointer lifts feels like a
 *    control. One that carries and slows feels like an object with weight,
 *    and it costs four lines."
 *
 * For a button, weight means it physically moves. There is a block of darker
 * colour sitting under the face; pressing translates the face down by exactly
 * that block's height and the block disappears. That is the entire illusion,
 * it is how every console UI since the NES has done it, and it only works if
 * the numbers match — a 4px offset with a 3px shadow reads as a glitch.
 *
 * WHAT THE OLD BUTTON GOT WRONG
 *
 * The component this replaces had the right mechanic and killed it with
 * `transition-all duration-100`. A press is instantaneous. Easing it is what
 * makes a control feel like a web page rather than a machine: the finger is
 * already down before the button has finished moving. Easing belongs on the
 * release, if anywhere, and here it is nowhere.
 *
 * It also used `:active`, which never fires for a keyboard user, so the
 * button was dead for anyone pressing Enter. Press state is tracked here
 * across pointer, keyboard and blur instead.
 */

export type PixelButtonTone = 'default' | 'survival' | 'everyday' | 'danger'

type PixelButtonProps = {
  tone?: PixelButtonTone
  /** Sprite-pixel unit. The shadow and border scale from this. */
  unit?: number
  block?: boolean
  icon?: ReactNode
  /** Renders locked: visible, legible, and explicitly not available yet. */
  locked?: boolean
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

type Tone = {
  face: string
  faceHover: string
  edge: string
  shadow: string
  text: string
}

/*
 * Six colours per tone, and no gradients anywhere. `shadow` is the block that
 * disappears on press, `edge` is the hard border that keeps the button legible
 * against the starfield.
 */
/**
 * Locked is its own palette, not a transparency.
 *
 * The first version dimmed the locked button with `opacity: 0.55`, which looks
 * fine on a flat background and falls apart completely on this one: the planet
 * shows straight through the button face and the label becomes unreadable. A
 * control that is unavailable still has to be a solid object. So locked gets
 * muted colours instead, and stays fully opaque.
 */
const LOCKED: Tone = {
  face: '#33324f',
  faceHover: '#33324f',
  edge: '#565480',
  shadow: '#1c1b34',
  text: '#8b88b5',
}

const TONES: Record<PixelButtonTone, Tone> = {
  default: {
    face: '#3b3a66',
    faceHover: '#4a4880',
    edge: '#8c89c9',
    shadow: '#1c1b34',
    text: '#ffffff',
  },
  survival: {
    face: '#8a4b1f',
    faceHover: '#a55c28',
    edge: '#e0a86b',
    shadow: '#3f200c',
    text: '#ffffff',
  },
  everyday: {
    face: '#146d75',
    faceHover: '#1a868f',
    edge: '#5fd3dc',
    shadow: '#07363b',
    text: '#ffffff',
  },
  danger: {
    face: '#9c2b2b',
    faceHover: '#b83636',
    edge: '#f08a8a',
    shadow: '#4a1212',
    text: '#ffffff',
  },
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
  // Tracks which input actually initiated the press, so releasing the mouse
  // does not clear a press the keyboard is still holding and vice versa.
  const source = useRef<'pointer' | 'key' | null>(null)

  const inert = disabled || locked
  const colours = locked ? LOCKED : TONES[tone]
  const lift = unit
  const down = pressed && !inert

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
      onPointerLeave={(e) => {
        setHovered(false)
        release('pointer')
        onPointerLeave?.(e)
      }}
      onPointerEnter={() => setHovered(true)}
      // Space and Enter are what a button responds to, and without this the
      // control is visually dead for anyone not using a mouse.
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
        // No transition. A press is instantaneous; easing it is what makes a
        // control feel like a web page. See the note at the top of the file.
        transform: down ? `translateY(${lift}px)` : 'none',
        boxShadow: down ? 'none' : `0 ${lift}px 0 0 ${colours.shadow}`,
        background: hovered && !inert ? colours.faceHover : colours.face,
        color: colours.text,
        border: `${Math.max(2, unit / 2)}px solid ${colours.edge}`,
        // A real radius, not a soft one. Rounded by whole pixels so the corner
        // steps like a sprite instead of anti-aliasing into a curve.
        borderRadius: unit * 2,
        padding: `${unit * 3}px ${unit * 5}px`,
        font: `inherit`,
        fontFamily: 'var(--font-display)',
        fontSize: unit * 3.5,
        lineHeight: 1.2,
        letterSpacing: '0.04em',
        textTransform: 'lowercase',
        display: block ? 'flex' : 'inline-flex',
        width: block ? '100%' : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        gap: unit * 2,
        cursor: inert ? 'not-allowed' : 'pointer',
        // Never hidden, and never transparent: a player has to be able to read
        // what they have not unlocked, or it is not a goal. See LOCKED above.
        opacity: disabled && !locked ? 0.5 : 1,
        imageRendering: 'pixelated',
        userSelect: 'none',
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
