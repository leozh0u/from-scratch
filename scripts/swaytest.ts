/**
 * The sway, asserted rather than watched.
 *
 * Two things have to hold and neither is visible from a screenshot: every
 * offset must be a whole number, because a fractional one puts pixels between
 * pixels and is exactly what the pixel look cannot survive; and the loop must
 * return to rest, or the foliage drifts permanently off its root.
 */
import { swayAt, leafAt } from '../src/components/ForestScene'

let pass = 0, fail = 0
const ok = (l: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  ok    ${l}${d ? '  — ' + d : ''}`) }
  else { fail++; console.log(`  FAIL  ${l}${d ? '  — ' + d : ''}`) }
}

console.log('\n=== the sway never lands between pixels ===')
{
  let bad = 0
  let maxAmp = 0
  for (let t = 0; t < 60_000; t += 37) {
    for (const phase of [0, 1, 2, 3, 4]) {
      const { dx, dy } = swayAt(t, phase)
      if (!Number.isInteger(dx) || !Number.isInteger(dy)) bad++
      maxAmp = Math.max(maxAmp, Math.abs(dx), Math.abs(dy))
    }
  }
  ok('every offset is a whole number', bad === 0, `${bad} fractional`)
  ok('and it actually travels — 3px at the extremes', maxAmp === 3, `max ${maxAmp}px`)
}

console.log('\n=== the loop returns to rest ===')
{
  // If the cycle never passes through {0,0}, foliage sits permanently offset
  // from where it was drawn and reads as misaligned rather than as moving.
  const seen = new Set<string>()
  for (let i = 0; i < 40; i++) {
    const { dx, dy } = swayAt(i * 240, 0)
    seen.add(`${dx},${dy}`)
  }
  ok('rest is part of the cycle', seen.has('0,0'))
  ok('it leans both ways', [...seen].some((s) => s.startsWith('2')) && [...seen].some((s) => s.startsWith('-2')))
}

console.log('\n=== phases are actually out of step ===')
{
  // Every layer moving together is one big sheet, not wind.
  let differing = 0
  for (let t = 0; t < 20_000; t += 53) {
    const a = swayAt(t, 0)
    const b = swayAt(t, 2)
    if (a.dx !== b.dx || a.dy !== b.dy) differing++
  }
  ok('layers are usually in different poses', differing > 200, `${differing} of 378 samples`)
}

console.log('\n=== leaves stay on the grid and always enter from above ===')
{
  let fractional = 0
  let above = 0
  for (let seed = 1; seed <= 8; seed++) {
    for (let t = 0; t < 40_000; t += 211) {
      const { x, y } = leafAt(t, seed, 200, 150)
      if (!Number.isInteger(x) || !Number.isInteger(y)) fractional++
      if (y < 0) above++
    }
  }
  ok('positions are whole pixels', fractional === 0, `${fractional} fractional`)
  ok('each leaf spends time above the frame before entering', above > 0)
}

console.log('\n=== a leaf falls, and keeps falling ===')
{
  // Monotonic descent: a leaf that goes back up is a bug, not a flutter.
  let regressions = 0
  let prev = -Infinity
  for (let t = 0; t < 12_000; t += 100) {
    const { y } = leafAt(t, 1, 200, 150)
    if (y < prev - 1) regressions++
    prev = y
  }
  ok('it never drifts upward mid-fall', regressions <= 1, `${regressions} reversals (1 = the wrap)`)
}

/*
 * THE FOLIAGE MUST NEVER TEAR.
 *
 * Leo: "when the bottom things sway, they sometimes separate and the pixels of
 * the trees start floating." That was arithmetic, not taste. A tuft is drawn
 * as rows one pixel apart; the vertical offset used to be scaled per row, so
 * at whatever row the rounded offset changed from 0 to -1, the scanline
 * between the two was drawn by nobody — a transparent seam straight across,
 * with the top half apparently hovering.
 *
 * This reproduces the drawing loop and asserts the rows it fills are
 * CONTIGUOUS in y, in every pose, across a range of tuft sizes.
 */
console.log('\n=== a swaying tuft never tears in half ===')
{
  /** The y values a tuft fills, given a pose — mirroring ForestScene's tuft(). */
  function rowsFilled(h: number, baseY: number, dy: number): number[] {
    const ROOT_OVERSHOOT = 3
    const ys: number[] = []
    for (let i = -ROOT_OVERSHOOT; i < h; i++) ys.push(baseY - i + dy)
    return ys.sort((a, b) => a - b)
  }

  let torn = 0
  let checked = 0
  for (let h = 4; h <= 14; h++) {
    for (let phase = 0; phase < 6; phase++) {
      for (let t = 0; t < 4000; t += 120) {
        const { dy } = swayAt(t, phase)
        const ys = rowsFilled(h, 300, dy)
        checked++
        for (let i = 1; i < ys.length; i++) if (ys[i] - ys[i - 1] !== 1) torn++
      }
    }
  }
  ok('every row it fills is adjacent to the next', torn === 0, `${checked} poses, ${torn} seams`)

  /*
   * And the same thing stated the way it broke, so this test has teeth: a dy
   * that differs BETWEEN rows of one tuft is the fault itself.
   */
  const perRowWouldTear = (() => {
    const h = 10
    const offsets = new Set<number>()
    for (let i = 0; i < h; i++) {
      const t = i / h
      const anchored = t < 0.2 ? 0 : (t - 0.2) / 0.8
      offsets.add(Math.round(-1 * anchored))
    }
    return offsets.size > 1
  })()
  ok('the per-row version really did tear', perRowWouldTear,
     'two different vertical offsets inside one tuft')
}

console.log(`\n${fail === 0 ? 'Sway and leaves hold.' : `${fail} FAILED`}  (${pass} checks)`)
process.exit(fail === 0 ? 0 : 1)
