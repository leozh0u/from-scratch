import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { steppedNotch, OUTLINE } from './pixelShape'
import { faceHeightFor } from './legend'
import { GAP, LEADING, chooseKey } from './readoutFit'

/**
 * The bench's display: what just happened, in a hole in the machine.
 *
 * WHY A FIXED STRIP AND NOT A LINE OF TEXT
 *
 * Leo: "the size of this block is inconsistent as it gives the explanations
 * for wrong combinations, hints, etc. that kind of trips up the location of
 * the items below which is bad for the user experience." Exactly right, and
 * it was every reply the bench could make — a one-line reason, a three-line
 * one, a hint, nothing at all — each printed straight into the panel's flow.
 *
 * So the strip is built once, at the height of the tallest thing it can ever
 * hold, and every message lands inside it. `readoutFit.ts` does that sum over
 * the real set of messages, which is finite and knowable: the failure table is
 * a fixed list, the hints are three templates, the rest are element names. The
 * two replies that are NOT knowable in advance — the model's prose and the
 * give-up route — open panels instead.
 *
 * WHY THE WIDTH IS MEASURED AND THE HEIGHT IS NOT
 *
 * They are different kinds of number. The height must not depend on the
 * message, or the tiles move — so it comes from the candidate set. The width
 * depends on nothing but the window, and re-deriving it in JS means keeping a
 * private copy of the page's padding that goes stale the moment anyone edits
 * it. Worse, `window.innerWidth` includes a classic scrollbar, so the sum is
 * quietly 15px wrong on Windows and Linux, where nobody here would see it.
 *
 * A ResizeObserver on the strip itself is exact and cannot drift. It cannot
 * loop either: what it watches is the width, and the width is not affected by
 * anything this component does with the height.
 *
 * It is sunk rather than raised, like the stats panel beside it and for the
 * same reason: a readout is a hole in the machine, not a control on it. That
 * matters more than it sounds, because the strip is often empty — an empty
 * recess reads as a screen with nothing on it, where an empty gap reads as a
 * mistake.
 */
const FACE = '#1e1b38'
const EDGE = '#3a3560'

type ReadoutProps = {
  /** Every message this strip can ever hold, so it can be built to the worst. */
  candidates: string[]
  /** What it is saying now. Empty is a legitimate state, not a missing one. */
  children?: ReactNode
  /** Type colour, so a hint and a dead end do not read the same. */
  tone?: string
  /**
   * The key beside the message, if this state has one. Its box is always
   * reserved — and mirrored on the left, so the message is centred. Given the
   * label the strip has chosen, since the width it can afford decides how much
   * the key is allowed to say.
   */
  action?: (label: string) => ReactNode
  /** How wide a key with this label would be, at the unit the key is drawn at. */
  keyWidthOf: (label: string) => number
  keyUnit: number
  /**
   * What to assume until the observer has reported. Only ever visible for one
   * frame, and only on the very first mount.
   */
  estimatedWidth: number
  unit?: number
}

export function Readout({
  candidates,
  children,
  tone = 'var(--color-star-mid)',
  action,
  keyWidthOf,
  keyUnit,
  estimatedWidth,
  unit = 3,
}: ReadoutProps) {
  const row = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(estimatedWidth)

  useLayoutEffect(() => {
    const element = row.current
    if (!element) return
    const measure = () => {
      const style = getComputedStyle(element)
      const inner =
        element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      if (inner > 0) setWidth((current) => (Math.abs(current - inner) < 1 ? current : inner))
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  /*
   * Orientation change does not always come through the observer on iOS, and
   * a rotated phone that keeps the portrait strip is a visible bug rather than
   * a subtle one.
   */
  useEffect(() => {
    const onChange = () => {
      const element = row.current
      if (!element) return
      const style = getComputedStyle(element)
      const inner =
        element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      if (inner > 0) setWidth(inner)
    }
    window.addEventListener('orientationchange', onChange)
    return () => window.removeEventListener('orientationchange', onChange)
  }, [])

  const { label, keyWidth, layout } = useMemo(
    () => chooseKey(width, candidates, keyWidthOf),
    [width, candidates, keyWidthOf],
  )

  return (
    <div
      style={{
        width: '100%',
        background: OUTLINE,
        clipPath: steppedNotch(unit, 2),
        padding: unit,
      }}
    >
      <div
        ref={row}
        className="flex items-center justify-center"
        style={{
          background: FACE,
          clipPath: steppedNotch(unit, 2),
          padding: unit * 3,
          gap: GAP,
          /*
           * The row is as tall as the taller of the two, always — not as tall
           * as whichever of them happens to be there. The key only exists
           * after a failed combine, so without this the strip grew by the
           * difference at the exact moment it was meant to hold still. That
           * was 17.7px on a laptop, and it moved every tile in the inventory.
           */
          height: Math.max(layout.textHeight, faceHeightFor(keyUnit)),
          boxSizing: 'content-box',
          // Lit from below: the inversion that makes it read as recessed.
          boxShadow: `inset 0 -${unit}px 0 0 ${EDGE}, inset 0 ${unit}px 0 0 #12102a`,
        }}
      >
        {/*
         * The mirror. Same width as the key's slot, holding nothing — which is
         * what puts the message on the strip's centre line rather than half a
         * key to the left of it.
         */}
        <span aria-hidden="true" style={{ flex: `0 0 ${keyWidth}px`, width: keyWidth }} />
        <p
          role="status"
          style={{
            flex: `0 0 ${layout.textWidth}px`,
            width: layout.textWidth,
            /*
             * The whole point. Fixed, not min-height: a message one line long
             * and a message three lines long occupy the same box, so nothing
             * below this panel ever moves.
             */
            height: layout.textHeight,
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: layout.fontPx,
            lineHeight: LEADING,
            letterSpacing: '0.02em',
            textTransform: 'lowercase',
            textAlign: 'center',
            color: tone,
            overflowWrap: 'anywhere',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </p>
        {/*
         * Reserved whether or not there is a key in it. If the slot appeared
         * with the key, the message would be rewrapped at a narrower width at
         * the same moment — which is the shift this strip exists to remove,
         * just moved sideways.
         */}
        <span
          className="flex items-center justify-center"
          style={{ flex: `0 0 ${keyWidth}px`, width: keyWidth }}
        >
          {action?.(label)}
        </span>
      </div>
    </div>
  )
}
