/**
 * Picking a type size that a tile label actually fits in.
 *
 * THE BUG THIS EXISTS TO STOP
 *
 * "manganese" rendered as "manganes" on one line and a lone "e" on the next.
 * Not a wrap — a word broken mid-letter, which looks like a rendering fault
 * rather than a layout choice, and it was one pixel's worth of overflow: nine
 * characters at ten pixels is ninety, and the label had eighty-eight to play
 * with.
 *
 * The old rule stepped the size down when `label.length > 13`, which is the
 * wrong measurement. What has to fit on a line is not the whole label — it is
 * the longest run of characters that CSS is not allowed to break. "sodium
 * hydroxide" is sixteen characters and fits comfortably; "manganese" is nine
 * and did not.
 *
 * WHY THIS CAN BE COMPUTED RATHER THAN MEASURED
 *
 * Press Start 2P is monospaced, and measured in the browser its advance is
 * exactly 1em for every glyph — 'i', 'W' and '.' all come back at 100px at
 * 100px type. So a run of n characters is exactly n * fontSize wide, and the
 * fit is arithmetic. No canvas measurement, no layout read, no effect that
 * runs after paint and shifts the text once it is already on screen.
 *
 * WHERE THE BREAKS ARE
 *
 * CSS may break at whitespace, and after a hyphen — keeping the hyphen on the
 * upper line. So "high-carbon" is two runs, "high-" and "carbon", and the
 * longest unbreakable run is six, not eleven. Splitting the same way the
 * renderer does is the whole trick.
 */

/** The one point of contact with the font: characters are square. */
const ADVANCE_PER_EM = 1

/**
 * Split a label into the runs CSS cannot break apart, keeping each hyphen on
 * the run it terminates — which is where the browser leaves it.
 */
export function unbreakableRuns(label: string): string[] {
  return label
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .flatMap((word) => word.split(/(?<=-)/))
}

/**
 * Greedy wrap, the same first-fit rule the browser uses: put each run on the
 * current line if it still fits, otherwise start a new one. Returns how many
 * lines the label needs at this width in characters.
 */
export function lineCount(label: string, charsPerLine: number): number {
  const runs = unbreakableRuns(label)
  if (runs.length === 0) return 0

  let lines = 1
  let used = 0
  let previousEndedHyphen = false

  for (const run of runs) {
    // A run that follows a hyphen butts straight up against it; anything else
    // that follows something is preceded by a space.
    const gap = used > 0 && !previousEndedHyphen ? 1 : 0
    if (used > 0 && used + gap + run.length > charsPerLine) {
      lines++
      used = run.length
    } else {
      used += gap + run.length
    }
    previousEndedHyphen = run.endsWith('-')
  }

  return lines
}

/**
 * The largest size in `sizes` (descending) at which `label` breaks nowhere it
 * shouldn't and occupies no more than `maxLines`. Falls back to the smallest
 * size offered rather than returning nothing — a slightly-too-small label is
 * survivable, an absent one is not.
 */
export function fitFontSize(
  label: string,
  boxWidthPx: number,
  sizes: number[],
  maxLines: number,
): number {
  for (const size of sizes) {
    const charsPerLine = Math.floor(boxWidthPx / (size * ADVANCE_PER_EM))
    if (charsPerLine <= 0) continue
    const longestRun = Math.max(...unbreakableRuns(label).map((r) => r.length), 0)
    if (longestRun > charsPerLine) continue
    if (lineCount(label, charsPerLine) > maxLines) continue
    return size
  }
  return sizes[sizes.length - 1]
}
