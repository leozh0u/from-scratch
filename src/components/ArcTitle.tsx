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
   * The total sweep of the arc in degrees, end to end. This is the angle the
   * whole word subtends at the centre of its circle, so it is also exactly how
   * far the last letter is rotated relative to the first. Around 34 reads as
   * following the curve of the planet below; past about 50 it stops looking
   * like a horizon and starts looking like a logo on a beach ball.
   */
  spread?: number
  className?: string
}

export function ArcTitle({
  text,
  unit = 4,
  spread = 34,
  className,
}: ArcTitleProps) {
  const letters = [...text]
  const size = unit * 10

  /*
   * A TRUE CIRCULAR ARC, not a rotation and a separate hand-tuned drop.
   *
   * The first version rotated each letter linearly across the word and sank it
   * by `(1 - cos(t * 0.9))`, with the 0.9 picked by eye. Those two curves do
   * not describe the same circle, so the letters leaned as though they were on
   * an arc while sitting on a shape that was not one — the ends looked snapped
   * downward rather than curved, which is what "should look rounder, curving
   * with the earth" is pointing at.
   *
   * Both numbers now come off one circle. A letter at angle theta from the top
   * sits at height R(1 - cos theta) below the apex and is rotated by exactly
   * theta. R is derived from the word's own width so the arc always spans the
   * requested sweep regardless of how many letters there are.
   */
  const sweep = (spread * Math.PI) / 180
  const advance = size * 0.82
  const chord = advance * Math.max(1, letters.length - 1)
  // The radius that puts the whole word on an arc of exactly `sweep`.
  const radius = chord / (2 * Math.sin(sweep / 2))
  const step = letters.length > 1 ? sweep / (letters.length - 1) : 0

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
        // The dropped ends need exactly this much room or they clip the box.
        paddingBottom: Math.round(radius * (1 - Math.cos(sweep / 2))) + unit * 2,
      }}
    >
      {letters.map((letter, i) => {
        const theta = -sweep / 2 + i * step
        // Same circle for both: the drop and the lean cannot disagree.
        const drop = Math.round(radius * (1 - Math.cos(theta)))
        const angle = Math.round((theta * 180) / Math.PI)

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
