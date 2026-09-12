/**
 * "From Scratch", bent around the curve of the planet below it.
 *
 * ROTATING PIXEL TEXT IS A TRAP, AND THIS IS THE WAY ROUND IT
 *
 * Press Start 2P is a pixel font: every glyph is built from whole squares on a
 * grid. Rotate one by an arbitrary angle and the browser resamples it, the
 * squares turn into soft grey parallelograms, and the letter stops being pixel
 * art — which is precisely the "looks generated" failure the whole direction
 * is fighting.
 *
 * Two things keep it honest here:
 *
 *   - Each letter is rotated INDIVIDUALLY and placed on the arc, rather than
 *     the whole word being warped. A per-letter rotation is a rigid transform
 *     of one small glyph; warping the line is a distortion of all of them.
 *   - Angles are SNAPPED to whole degrees and positions to whole pixels, so
 *     the same letter at the same place always resamples identically instead
 *     of shimmering between subpixel positions.
 *
 * It still is not perfect — a 14-degree rotation of a pixel grid never is —
 * and that is a deliberate trade. DESIGN.md flags a hand-drawn arc sprite as
 * the safer answer if this reads badly at the final size; this exists so the
 * wordmark can be changed by editing a string rather than by redrawing art.
 */

type ArcTitleProps = {
  text: string
  /** Sprite-pixel unit, matching the buttons. */
  unit?: number
  /**
   * How far the ends of the word drop, in degrees across the whole word.
   * Positive bends the line downward at both ends, following the top of a
   * sphere sitting below it.
   */
  spread?: number
  className?: string
}

export function ArcTitle({
  text,
  unit = 4,
  spread = 46,
  className,
}: ArcTitleProps) {
  const letters = [...text]
  const size = unit * 10

  /*
   * The arc is described by an angle per letter and a vertical drop that
   * follows a cosine — the letters near the ends sit lower, as they would on
   * the rim of a circle. Both are rounded: degrees to integers, pixels to
   * whole numbers.
   */
  const step = letters.length > 1 ? spread / (letters.length - 1) : 0

  return (
    <h1
      className={className}
      aria-label={text}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        margin: 0,
        // Space letters tighter than the font's own advance, because each one
        // is rotated into its neighbour's gap.
        gap: Math.round(unit * 0.5),
        // The dropped ends need vertical room or they clip the element box.
        paddingBottom: Math.round(unit * 6),
      }}
    >
      {letters.map((letter, i) => {
        const angle = Math.round(-spread / 2 + i * step)
        const fromCentre = (i - (letters.length - 1) / 2) / ((letters.length - 1) / 2 || 1)
        const drop = Math.round((1 - Math.cos(fromCentre * 0.9)) * unit * 11)

        // A space carries the gap but must not carry a glyph box, or the word
        // spacing fights the rotation.
        if (letter === ' ') {
          return <span key={i} aria-hidden="true" style={{ width: unit * 3 }} />
        }

        return (
          <span
            key={i}
            aria-hidden="true"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-display)',
              fontSize: size,
              lineHeight: 1,
              color: '#ffffff',
              transform: `translateY(${drop}px) rotate(${angle}deg)`,
              // Rotate about the glyph's own centre so the baseline follows
              // the curve instead of swinging out from a corner.
              transformOrigin: '50% 50%',
            }}
          >
            {letter}
          </span>
        )
      })}
    </h1>
  )
}
