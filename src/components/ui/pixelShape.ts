/**
 * The staircase corner, shared by every surface in the game.
 *
 * A single 45-degree chamfer is one straight diagonal rendered at the
 * display's full resolution — smooth, antialiased, and not a shape that can
 * exist on a pixel grid. Every corner on an 8-bit control is a visible flight
 * of steps, each a whole pixel deep. This generates that: at y = 0 the edge
 * starts `steps` units in, and each unit down it moves one unit out.
 *
 * Lives in its own file rather than inside PixelButton because the panels, the
 * element tiles and the progress bar all have to cut their corners the same
 * way. A game where the buttons are pixel art and the panels have CSS
 * border-radius is the half-committed look the whole direction is against.
 */
export function steppedNotch(unit: number, steps: number): string {
  const pts: string[] = []
  const px = (n: number) => `${n}px`
  const rpx = (n: number) => `calc(100% - ${n}px)`

  for (let k = 0; k < steps; k++) {
    pts.push(`${px((steps - k) * unit)} ${px(k * unit)}`)
    pts.push(`${px((steps - k) * unit)} ${px((k + 1) * unit)}`)
  }
  pts.push(`0 ${px(steps * unit)}`)
  pts.push(`0 ${rpx(steps * unit)}`)
  for (let k = steps - 1; k >= 0; k--) {
    pts.push(`${px((steps - k - 1) * unit)} ${rpx((k + 1) * unit)}`)
    pts.push(`${px((steps - k) * unit)} ${rpx((k + 1) * unit)}`)
    pts.push(`${px((steps - k) * unit)} ${rpx(k * unit)}`)
  }
  pts.push(`${rpx(steps * unit)} 100%`)
  for (let k = 0; k < steps; k++) {
    pts.push(`${rpx((steps - k - 1) * unit)} ${rpx(k * unit)}`)
    pts.push(`${rpx((steps - k - 1) * unit)} ${rpx((k + 1) * unit)}`)
  }
  pts.push(`100% ${rpx(steps * unit)}`)
  pts.push(`100% ${px(steps * unit)}`)
  for (let k = steps - 1; k >= 0; k--) {
    pts.push(`${rpx((steps - k - 1) * unit)} ${px((k + 1) * unit)}`)
    pts.push(`${rpx((steps - k - 1) * unit)} ${px(k * unit)}`)
  }

  return `polygon(${pts.join(', ')})`
}

/** The one outline colour. Near-black with a hint of the space blue in it, so
 * it sits in the same world as everything else rather than reading as pure
 * CSS black. */
export const OUTLINE = '#100d20'
