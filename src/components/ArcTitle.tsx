/**
 * "From Scratch", bent around the curve of the planet below it.
 *
 * ROTATING PIXEL TEXT IS A TRAP, AND THIS IS THE WAY ROUND IT
 *
 * A pixel font builds every glyph from whole squares on a grid. Rotate one by
 * an arbitrary angle and the browser resamples it, the squares turn into soft
 * grey parallelograms, and the letter stops being pixel art, which is exactly
 * the "looks generated" failure the whole direction is fighting.
 *
 * Two things keep it honest. Each letter is rotated INDIVIDUALLY and placed on
 * the arc, rather than the whole word being warped: a per-letter rotation is a
 * rigid transform of one small glyph, where warping the line distorts all of
 * them. And angles are snapped to whole degrees and positions to whole pixels,
 * so the same letter at the same place always resamples identically instead of
 * shimmering between subpixel positions.
 */

/** One glyph's place along the chord, as a fraction from 0 to 1. */
export type ArcGlyph = { char: string; t: number; word: number }

/**
 * Where every letter sits along the arc.
 *
 * WHY THE TWO WORDS GET EQUAL SHARES
 *
 * Spacing every letter identically is correct typography and the wrong answer
 * here. "From" is four letters and "Scratch" is seven, so the apex of the arc
 * fell somewhere inside "Scratch" and the wordmark read as hung off-centre
 * even though it was perfectly centred. Giving each word half the arc puts the
 * break at the top of the curve, which is the point the eye reads as the
 * middle.
 *
 * The cost is that the two words end up letterspaced differently, "From" wider
 * and "Scratch" tighter, and that is the trade being made deliberately. Uneven
 * tracking between two words of a logotype is ordinary; a logotype whose
 * optical centre is two letters off is not. `balance` dials between the two.
 *
 * Pure and exported so the centring can be asserted rather than eyeballed: the
 * first version of this missed the midpoint by ten pixels and looked close
 * enough to pass a glance. Positions are fractions of the chord, so they do
 * not depend on the unit.
 */
export function arcTitlePlacement(text: string, balance = 1): ArcGlyph[] {
  const words = text.split(' ').filter((w) => w.length > 0)
  const glyphCount = words.reduce((n, w) => n + w.length, 0)
  if (glyphCount === 0) return []

  // Half a glyph box, and the word break, as fractions of the chord. The gap
  // is the space glyph's width (0.55 of the type size) over one glyph box
  // (0.82), so the ratio holds at any unit.
  const halfGlyph = 1 / (2 * glyphCount)
  const gap = words.length > 1 ? 0.55 / (0.82 * glyphCount) : 0
  const usable = 1 - gap

  const placed: ArcGlyph[] = []
  let cursor = 0
  words.forEach((word, w) => {
    const earned = word.length / glyphCount
    const equal = 1 / words.length
    const share = (earned + (equal - earned) * balance) * usable

    /*
     * Measured from the glyph EDGES, which is what makes the centring exact.
     * A four-letter word and a seven-letter word inset their outermost glyph
     * centres by different amounts (half a box out of a quarter of the arc
     * against half a box out of a seventh), so spreading by centre alone
     * drifts the break off the apex even when both spans are the same length.
     */
    const from = cursor + halfGlyph
    const to = cursor + share - halfGlyph
    const step = word.length > 1 ? (to - from) / (word.length - 1) : 0
    for (let i = 0; i < word.length; i++) {
      // A one-letter word sits in the middle of its own span.
      placed.push({
        char: word[i],
        t: word.length > 1 ? from + i * step : (from + to) / 2,
        word: w,
      })
    }
    cursor += share + (w < words.length - 1 ? gap / (words.length - 1) : 0)
  })
  return placed
}

/**
 * How wide the wordmark comes out at a given unit, in pixels.
 *
 * Glyph centres span the chord; the outermost letters overhang it by half a
 * box each side, so the ink is one box wider than the chord.
 */
export function arcTitleWidth(text: string, unit: number): number {
  const size = unit * 10
  const advance = Math.round(size * 0.82)
  const glyphs = [...text].filter((c) => c !== ' ').length
  return glyphs * advance + advance
}

/**
 * The largest unit at which the wordmark still fits `available` pixels.
 *
 * WHY THIS IS COMPUTED AND NOT A LIST OF BREAKPOINTS
 *
 * It used to be four hand-picked steps against viewport width. Every time the
 * font, the letter spacing or the word changed, some window size appeared
 * where the title ran off the screen and under the reset button, and moving
 * the wordmark to Pixelify Sans (wider than Press Start 2P) did it again
 * immediately. Breakpoints encode an answer that was only true for the old
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
  /**
   * How hard to equalise the two words, 0 to 1. 0 spaces every letter the same
   * and lets the break fall where it falls; 1 gives each word an equal share
   * so the break lands on the apex. See `arcTitlePlacement`.
   */
  balance?: number
  className?: string
}

export function ArcTitle({
  text,
  unit = 4,
  spread = 34,
  balance = 1,
  className,
}: ArcTitleProps) {
  const size = unit * 10
  const sweep = (spread * Math.PI) / 180
  const advance = Math.round(size * 0.82)
  const glyphCount = [...text].filter((c) => c !== ' ').length
  const chord = advance * glyphCount

  /*
   * A TRUE CIRCULAR ARC, not a rotation with a separate hand-tuned drop.
   *
   * An earlier version rotated each letter linearly across the word and sank
   * it by `(1 - cos(t * 0.9))`, with the 0.9 picked by eye. Those two curves
   * do not describe the same circle, so the letters leaned as though they were
   * on an arc while sitting on a shape that was not one, and the ends looked
   * snapped downward rather than curved.
   *
   * Both numbers now come off one circle: a letter at angle theta from the
   * apex sits R(1 - cos theta) below it and is rotated by exactly theta.
   */
  const radius = chord / (2 * Math.sin(sweep / 2))
  const placed = arcTitlePlacement(text, balance)
  const maxDrop = radius * (1 - Math.cos(sweep / 2))

  return (
    <h1
      className={className}
      aria-label={text}
      style={{
        position: 'relative',
        margin: 0,
        /*
         * The box is the CHORD, not the chord plus a glyph.
         *
         * Glyph centres run from 0 to `chord`, so a box any wider puts the
         * arc's midpoint left of the element's midpoint and the word break
         * lands off-centre by half a glyph however carefully the letters are
         * placed. The outermost letters overhang half a box each side,
         * symmetrically, and `arcTitleWidth` reserves that slack when it picks
         * the unit.
         */
        width: chord,
        height: Math.round(size * 1.25 + maxDrop),
      }}
    >
      {placed.map(({ char, t }, i) => {
        const theta = -sweep / 2 + t * sweep
        const x = Math.round(radius * Math.sin(theta) + chord / 2)
        const drop = Math.round(radius * (1 - Math.cos(theta)))
        const angle = Math.round((theta * 180) / Math.PI)

        return (
          <span
            key={i}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: x,
              top: drop,
              width: advance,
              marginLeft: -advance / 2,
              textAlign: 'center',
              fontFamily: 'var(--font-wordmark)',
              /*
               * 500, AND NOT 700, BECAUSE OF ONE GLYPH.
               *
               * Leo: "the C looks like an O". Rendered to a canvas and diffed
               * pixel by pixel, Pixelify Sans at weight 700 draws lowercase `c`
               * and `o` as BYTE-FOR-BYTE IDENTICAL bitmaps: the bold weight
               * thickens the stroke until the aperture closes completely, so no
               * size, colour or shadow could have fixed it. At 500 the aperture
               * is open and the stems are still four pixels wide.
               */
              fontWeight: 500,
              fontSize: size,
              lineHeight: 1,
              color: '#ffffff',
              // Hard offset, no blur, a whole number of pixels at every scale.
              // White type on a field of white stars loses its edges.
              textShadow: `${unit}px ${unit}px 0 #17142e`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: '50% 50%',
            }}
          >
            {char}
          </span>
        )
      })}
    </h1>
  )
}
