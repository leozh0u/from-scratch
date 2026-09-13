/**
 * The bench's readout: one strip, one height, whatever it happens to be saying.
 *
 * WHY THIS IS ARITHMETIC AND NOT A PARAGRAPH
 *
 * The bench used to print its replies straight into its own flow — the reason
 * a pair did nothing, a hint, the model's answer, the route. Every one of them
 * is a different number of lines, so the panel changed height on almost every
 * press and the whole inventory below it moved. That is the worst possible
 * place for a layout shift: the player's hand is already travelling toward a
 * tile when the tile slides out from under it.
 *
 * The fix is not to reserve "enough" space by eye. Every message this strip
 * can ever hold is a known string — the failure table is a fixed list, the
 * hints are three templates, the rest are names — so the tallest one is
 * computable, and the strip is built exactly that tall at every width. It then
 * never changes height for any reason except the window changing size, which
 * is the player doing it on purpose.
 *
 * Press Start 2P advances exactly one em per character, so a line's capacity
 * in characters is width divided by font size. No measuring, no ref, no
 * layout pass.
 */

/** Font sizes to try, largest first. 8px is the floor for a sentence. */
export const FONT_STEPS = [10, 9, 8] as const
/** Line height, as a multiple of the font size. */
export const LEADING = 1.8
/** How many lines we would like to get away with before shrinking the type. */
export const WANTED_LINES = 3
/** Between the message and the key beside it. */
export const GAP = 8
/** The message never gets squeezed below this, whatever else wants room. */
export const MIN_TEXT_WIDTH = 120

/**
 * How many lines a string takes at a given number of characters per line.
 *
 * Greedy, which is what the browser does: a word goes on the current line if
 * it fits whole, otherwise it starts the next one. A word longer than the line
 * breaks inside itself, matching `overflow-wrap: anywhere` — no message in the
 * game has one, but a strip that silently overflows is not worth the risk.
 */
export function wrappedLines(text: string, cols: number): number {
  if (cols < 1) return text.length
  let lines = 1
  let used = 0
  for (const word of text.trim().split(/\s+/)) {
    if (!word) continue
    if (word.length > cols) {
      // Starts on a fresh line, then fills whole lines of its own.
      if (used > 0) lines++
      const extra = Math.ceil(word.length / cols) - 1
      lines += extra
      used = word.length - extra * cols
      continue
    }
    if (used === 0) {
      used = word.length
      continue
    }
    if (used + 1 + word.length <= cols) {
      used += 1 + word.length
      continue
    }
    lines++
    used = word.length
  }
  return lines
}

/** The worst of a set — the one the strip has to be built to hold. */
export function worstLines(candidates: string[], cols: number): number {
  return candidates.reduce((most, text) => Math.max(most, wrappedLines(text, cols)), 1)
}

export type ReadoutLayout = {
  fontPx: number
  lines: number
  /** Height of the message block alone, px. */
  textHeight: number
  /** Room the message gets, px. */
  textWidth: number
}

/**
 * Pick the type size and the number of lines to build the strip at.
 *
 * Largest type that keeps the worst message inside WANTED_LINES; if even the
 * floor cannot, the floor is used and the strip is built however tall that
 * message really is. Growing the strip is fine — it happens once, at this
 * width, for every state. Clipping the message is not.
 */
export function readoutLayout(
  innerWidth: number,
  keyWidth: number,
  candidates: string[],
): ReadoutLayout {
  const textWidth = Math.max(MIN_TEXT_WIDTH, innerWidth - keyWidth - GAP)

  for (const fontPx of FONT_STEPS) {
    const lines = worstLines(candidates, Math.floor(textWidth / fontPx))
    if (lines <= WANTED_LINES) {
      return { fontPx, lines, textWidth, textHeight: Math.ceil(lines * LEADING * fontPx) }
    }
  }

  const fontPx = FONT_STEPS[FONT_STEPS.length - 1]
  const lines = worstLines(candidates, Math.floor(textWidth / fontPx))
  return { fontPx, lines, textWidth, textHeight: Math.ceil(lines * LEADING * fontPx) }
}
