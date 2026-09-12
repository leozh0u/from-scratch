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


/**
 * How wide the wordmark comes out at a given unit, in pixels.
 *
 * Every term below is the same expression the component uses, so this is the
 * real width rather than an estimate: each glyph sits in a fixed box of
 * `advance`, the flex `gap` sits between every pair, and a space is its own
 * narrower box.
 */
export function arcTitleWidth(text: string, unit: number): number {
  const size = unit * 10
  const advance = Math.round(size * 0.82)
  const spaceWidth = Math.round(size * 0.55)
  const gap = Math.round(unit * 0.5)
  const letters = [...text]
  const glyphs = letters.filter((c) => c !== ' ').length
  const spaces = letters.length - glyphs
  return glyphs * advance + spaces * spaceWidth + Math.max(0, letters.length - 1) * gap
}

/**
 * The largest unit at which the wordmark still fits `available` pixels.
 *
 * WHY THIS IS COMPUTED AND NOT A LIST OF BREAKPOINTS
 *
 * It used to be four hand-picked steps against viewport width. Every time the
 * font, the letter spacing or the word changed, some window size appeared
 * where the title ran off the screen and under the reset button — it happened
 * again the moment the wordmark moved to Pixelify Sans, which is wider than
 * Press Start 2P. Breakpoints encode an answer that was only true for the old
 * measurements.
 *
 * Units stay whole, because a pixel font drawn at 7.5x has soft edges. The
 * floor is 2 rather than 3 because a 320px phone cannot fit the word at 3, and
 * a small wordmark beats one that runs off the side of the screen.
 */
export function fitArcUnit(text: string, available: number, maxUnit = 12, minUnit = 2): number {
  for (let unit = maxUnit; unit > minUnit; unit--) {
    if (arcTitleWidth(text, unit) <= available) return unit
  }
  return minUnit
}

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
  const spaceWidth = Math.round(size * 0.55)

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
  const advance = Math.round(size * 0.82)
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
          // "From" and "Scratch" were running together. The gap has to beat a
          // letter's own advance to read as a word break at all, and on an arc
          // it has to beat it by more, because the two neighbouring glyphs are
          // leaning toward each other across it.
          return <span key={i} aria-hidden="true" style={{ width: spaceWidth }} />
        }

        return (
          <span
            key={i}
            aria-hidden="true"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-wordmark)',
              /*
               * 500, AND NOT 700, BECAUSE OF ONE GLYPH.
               *
               * Leo: "the C looks like an O". He was right, and it is worse
               * than it sounds: rendered to a canvas and compared pixel by
               * pixel, Pixelify Sans at weight 700 draws lowercase `c` and `o`
               * as BYTE-FOR-BYTE IDENTICAL bitmaps. The bold weight thickens
               * the stroke until the aperture closes completely, so there is no
               * size, colour or shadow that could have fixed it.
               *
               * At 400 the aperture is a whole open row; at 500 it is still
               * open and the stems are four pixels instead of three, which is
               * where the weight was wanted in the first place. 600 nearly
               * closes it again.
               *
               * Checked by rendering both glyphs and diffing them, not by
               * squinting, because at a glance 700 looks fine until you read
               * the word.
               */
              fontWeight: 500,
              fontSize: size,
              /*
               * A FIXED BOX PER LETTER, because the wordmark font is
               * proportional and the arc maths is not.
               *
               * Every letter gets the same angular step, which is only true if
               * every letter takes the same horizontal room. Press Start 2P is
               * monospaced so this was free; Pixelify Sans is not, and left
               * alone a narrow 'r' would lean as though it sat where a wide 'm'
               * does. Boxing each glyph at the arc's own advance keeps the lean
               * and the position describing the same circle.
               */
              width: advance,
              textAlign: 'center',
              lineHeight: 1,
              color: '#ffffff',
              /*
               * A hard offset shadow, no blur, sized off the unit so it stays
               * a whole number of pixels at every scale. White type on a field
               * of white stars loses its edges; this gives every glyph a dark
               * side and is what the arcade titles it is imitating all did.
               */
              textShadow: `${unit}px ${unit}px 0 #17142e`,
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
