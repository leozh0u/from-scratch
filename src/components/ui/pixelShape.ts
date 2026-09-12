/**
 * The staircase corner, shared by every surface in the game.
 *
 * A single 45-degree chamfer is one straight diagonal rendered at the display's
 * full resolution — smooth, antialiased, and not a shape that can exist on a
 * pixel grid. Every corner on an 8-bit control is a visible flight of steps,
 * each a whole pixel deep. This generates that.
 *
 * WHY IT WAS REWRITTEN
 *
 * The first version built each of the four corners with its own hand-written
 * loop, and the loops did not agree: two of them emitted two points per tread
 * and two emitted three, walking the staircase in different orders. The result
 * was a panel whose left corners stepped correctly and whose right corners were
 * cut square — visible immediately once anything wide was drawn.
 *
 * The fix is to stop writing the corners out four times. One corner routine,
 * called four times with the right anchor and direction, cannot disagree with
 * itself.
 *
 * Returns a clip-path polygon. Offsets from the right and bottom edges use
 * calc(), so one shape works at any size.
 */

/** Distance in from the left or top. */
const px = (n: number) => `${n}px`
/** Distance in from the right or bottom. */
const rpx = (n: number) => `calc(100% - ${n}px)`

export function steppedNotch(unit: number, steps: number): string {
  const radius = unit * steps
  const pts: string[] = []

  /**
   * One corner's staircase, walked clockwise.
   *
   * `along` is the coordinate that moves first, `down` the one that follows.
   * Each tread is: move one unit along, then one unit down — which is exactly
   * how the same corner is drawn pixel by pixel.
   *
   * Both are expressed as functions of how far in from the corner we are, so
   * the caller decides whether "in" counts from the left or the right, and
   * every corner reuses the identical body.
   */
  function corner(
    alongAt: (into: number) => string,
    downAt: (into: number) => string,
    swap: boolean,
  ) {
    for (let k = 0; k < steps; k++) {
      const a0 = alongAt(k * unit)
      const a1 = alongAt((k + 1) * unit)
      const d0 = downAt(k * unit)
      const d1 = downAt((k + 1) * unit)
      // `swap` is which axis is horizontal for this corner — the two vertical
      // edges walk the pair the other way round.
      pts.push(swap ? `${d0} ${a0}` : `${a0} ${d0}`)
      pts.push(swap ? `${d0} ${a1}` : `${a1} ${d0}`)
      pts.push(swap ? `${d1} ${a1}` : `${a1} ${d1}`)
    }
  }

  // Clockwise from the left end of the top edge.
  pts.push(`${px(radius)} 0`)
  pts.push(`${rpx(radius)} 0`)
  // Top-right: right along the top, then down the right.
  corner(
    (into) => rpx(radius - into),
    (into) => px(into),
    false,
  )
  pts.push(`100% ${px(radius)}`)
  pts.push(`100% ${rpx(radius)}`)
  // Bottom-right: down the right, then left along the bottom.
  corner(
    (into) => rpx(radius - into),
    (into) => rpx(into),
    true,
  )
  pts.push(`${rpx(radius)} 100%`)
  pts.push(`${px(radius)} 100%`)
  // Bottom-left: left along the bottom, then up the left.
  corner(
    (into) => px(radius - into),
    (into) => rpx(into),
    false,
  )
  pts.push(`0 ${rpx(radius)}`)
  pts.push(`0 ${px(radius)}`)
  // Top-left: up the left, then right along the top.
  corner(
    (into) => px(radius - into),
    (into) => px(into),
    true,
  )

  return `polygon(${pts.join(', ')})`
}

/** The one outline colour. Near-black with a hint of the space blue in it, so
 * it sits in the same world as everything else rather than reading as pure
 * CSS black. */
export const OUTLINE = '#100d20'
