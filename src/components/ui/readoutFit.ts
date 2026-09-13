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

/**
 * The key's label, longest first.
 *
 * "why not?" is the clearest and it is also the most expensive, because the
 * key's box is reserved on both sides of the message: every character costs
 * the message two. At 320px that is the difference between a five-line strip
 * and a seven-line one.
 *
 * So the label is chosen the same way the font size is — by what fits — rather
 * than by a width threshold somebody picked. A bare "?" sits directly beside
 * the sentence it refers to, which is enough of a question on a phone.
 */
export const KEY_LABELS = ['why not?', 'why?', '?'] as const

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
/**
 * Pick the label and the layout together.
 *
 * Fewest lines first, because a short strip is the point; then the largest
 * type, because legibility beats a shorter label; then the longest label,
 * because when nothing else separates them "why not?" says more than "?".
 *
 * `widthOf` is passed in rather than imported so this file stays pure
 * arithmetic and the test can drive it with the same function the component
 * uses.
 */
export function chooseKey(
  innerWidth: number,
  candidates: string[],
  widthOf: (label: string) => number,
): { label: string; keyWidth: number; layout: ReadoutLayout } {
  let best: { label: string; keyWidth: number; layout: ReadoutLayout } | null = null
  for (const label of KEY_LABELS) {
    const keyWidth = widthOf(label)
    // A label whose own box will not fit twice over is not a candidate at all.
    if (innerWidth - 2 * (keyWidth + GAP) < MIN_TEXT_WIDTH) continue
    const layout = readoutLayout(innerWidth, keyWidth, candidates)
    if (
      !best ||
      layout.lines < best.layout.lines ||
      (layout.lines === best.layout.lines && layout.fontPx > best.layout.fontPx)
    ) {
      best = { label, keyWidth, layout }
    }
  }
  /*
   * Nothing fitted, which means a window narrower than anything with a
   * browser on it. Take the shortest label and let readoutLayout's own floor
   * handle the rest, rather than returning nothing and rendering no strip.
   */
  if (!best) {
    const label = KEY_LABELS[KEY_LABELS.length - 1]
    const keyWidth = widthOf(label)
    return { label, keyWidth, layout: readoutLayout(innerWidth, keyWidth, candidates) }
  }
  return best
}

export function readoutLayout(
  innerWidth: number,
  keyWidth: number,
  candidates: string[],
): ReadoutLayout {
  /*
   * THE KEY'S WIDTH IS RESERVED ON BOTH SIDES, NOT JUST THE ONE IT SITS ON.
   *
   * Leo: "plant fibre + torch is not centered." It was not, and the reason is
   * worth stating because the fix looks wasteful. Holding the key's box open
   * only on the right leaves the message centred in what is left, which is
   * half the key's width off the middle of the strip — visible the moment the
   * message is short, which is most of the time.
   *
   * Mirroring it puts the message on the strip's true centre line and keeps the
   * key where it belongs. It costs width, so the message wraps sooner: nothing
   * at all above 700px, and fourteen to twenty-nine pixels of a taller strip on
   * a phone. That is a price worth paying for a line of text that sits where
   * the eye expects it, and the strip is still the same height in every state,
   * which is the property that mattered.
   */
  const textWidth = Math.max(MIN_TEXT_WIDTH, innerWidth - 2 * (keyWidth + GAP))

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
