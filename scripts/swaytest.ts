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
  ok('and it actually travels — 2px at the extremes', maxAmp === 2, `max ${maxAmp}px`)
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

console.log(`\n${fail === 0 ? 'Sway and leaves hold.' : `${fail} FAILED`}  (${pass} checks)`)
process.exit(fail === 0 ? 0 : 1)
