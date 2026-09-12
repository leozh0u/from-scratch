/**
 * The legend printed on the extruded side of a key.
 *
 * The sizing lives here rather than inline in the component because it is the
 * part that broke twice and both breaks were arithmetic, not appearance. The
 * component renders it; `scripts/labeltest.ts` checks it. One formula, two
 * readers — a copy of the sum in the test would drift away from the CSS and
 * pass while the button was wrong.
 */

/**
 * Press Start 2P advances exactly 1em a character (measured, not assumed),
 * and the legend adds 0.08em of letter-spacing after each one.
 */
const ADVANCE_EM = 1.08

/** Vertical squash. Foreshortening, on top of the skew. */
export const SQUASH = 0.72

/** Degrees of horizontal shear. */
export const SKEW_DEG = 18

/**
 * The smallest the legend may ever be, in CSS pixels.
 *
 * In landscape the unit drops to 3 and an unfloored size resolved to 6px,
 * which after the squash is 4.3 real pixels of a font built from one-pixel
 * stems — in the DOM and invisible on the screen. A viewport sweep found it
 * at 24 sizes.
 */
export const FLOOR_PX = 9

/** Width in ems the string needs, including the shear the skew adds. */
export function advanceEm(text: string): number {
  const shear = Math.tan((SKEW_DEG * Math.PI) / 180) * SQUASH
  return text.length * ADVANCE_EM + shear
}

/**
 * What the CSS above resolves to at a given container width — the same
 * `max(floor, min(cap, (width - inset) / advance))`, in numbers.
 */
export function sizeAt(unit: number, containerWidth: number, text: string): number {
  const cap = Math.round(unit * 2.1)
  const byWidth = (containerWidth - unit * 4) / advanceEm(text)
  return Math.max(FLOOR_PX, Math.min(cap, byWidth))
}

/**
 * The CSS `font-size` value. A container query rather than a measuring pass:
 * the button's own width is the container, so the legend fits whatever width
 * the button ends up at, including one it reaches after the first paint.
 */
export function fontSizeCss(unit: number, text: string): string {
  return `max(${FLOOR_PX}px, min(${Math.round(unit * 2.1)}px, (100cqw - ${unit * 4}px) / ${advanceEm(text).toFixed(2)}))`
}

/** Height of the visible side face a legend has to sit inside. */
export function stripHeight(unit: number): number {
  // depth (unit * 4) less the outline along the bottom (unit).
  return unit * 3
}

/** Contrast ratio, for checking a legend actually reads against its base. */
export function contrast(a: string, b: string): number {
  const lum = (hex: string) =>
    [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((s, v, i) => s + [0.2126, 0.7152, 0.0722][i] * v, 0)
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
