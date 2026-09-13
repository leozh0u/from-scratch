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

/**
 * The narrowest the button may be if its side legend is to fit.
 *
 * The legend is sized from the button's own width, which is the right way
 * round for a long word on a wide key and the wrong way round for a long
 * legend on a short one: "standard" under a button reading "mode" had nowhere
 * to go and came out as "standarc". A minimum width closes that — the button
 * grows to fit what is written on its side rather than clipping it.
 *
 * Computed at the FLOOR size, because that is the smallest the legend can
 * legally be drawn, so this is the smallest width that can ever hold it.
 */
export function minWidthForSide(unit: number, text: string): number {
  return Math.ceil(advanceEm(text) * FLOOR_PX) + unit * 4
}

/**
 * How wide a button's own FACE needs to be for its label.
 *
 * Sibling of `minWidthForSide`, and the same arithmetic: the display face
 * advances exactly 1em a character plus 0.08em of letter-spacing, so the label
 * width is computable rather than measurable. Added because two keys that do
 * the same job should be the same size, and taking the max of their side
 * legends alone was not enough — "give up" with a flag beside it is wider than
 * any legend either of them carries, so the pair still came out ragged.
 *
 * The pieces are PixelButton's own: the face is `unit * 3` type inside
 * `unit * 5` of padding either side, with `unit` of border, and an icon costs
 * its own width plus a `unit * 2` gap.
 */
/**
 * How tall a key stands, including the extruded base under it.
 *
 * The same arithmetic PixelButton lays out with, stated once so a caller can
 * reserve room for a key that is not there yet: a border of one unit each
 * side, four units of padding each side, a line box of `unit * 3` type at 1.3,
 * and four units of depth beneath. The bench's readout needs this because its
 * "why not?" key appears only after a failure — and a slot that grows when the
 * key arrives is the layout shift the strip exists to remove, just later.
 */
export function faceHeightFor(unit: number): number {
  const border = unit * 2
  const padding = unit * 8
  const line = unit * 3 * 1.3
  const depth = unit * 4
  return Math.ceil(border + padding + line + depth)
}

export function faceWidthFor(unit: number, label: string, iconPx = 0): number {
  const type = Math.ceil(label.length * ADVANCE_EM * (unit * 3))
  const padding = unit * 10
  const border = unit * 2
  const icon = iconPx > 0 ? iconPx + unit * 2 : 0
  return type + padding + border + icon
}
