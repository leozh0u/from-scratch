/**
 * The city's small motions are occasional, not constant.
 *
 * The shooting stars sat in the build for hours at a rate that read as "never",
 * and the only reason that got fixed is that the rate turned out to be
 * measurable. Same treatment here before anyone looks at it: a bird that
 * crosses in half a second is a dead pixel, and windows that twinkle are a
 * broken screen rather than a city.
 */
import { coverTransform, windowLitAt, birdAt, BIRD_FRAMES } from '../src/components/cityMotion'

let pass = 0, fail = 0
const ok = (l: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  ok    ${l}${d ? '  — ' + d : ''}`) }
  else { fail++; console.log(`  FAIL  ${l}${d ? '  — ' + d : ''}`) }
}

console.log('\n=== the overlay lands exactly where the image does ===')
{
  // A light drawn half a building away from its window is worse than none.
  const wide = coverTransform(512, 1512, 900, 0.42)
  ok('cover scales by the larger axis', Math.abs(wide.scale - 1512 / 512) < 1e-9, wide.scale.toFixed(3))
  ok('and centres the horizontal overflow', Math.abs(wide.offsetX) < 1e-9)
  ok('while biasing the vertical crop', wide.offsetY < 0, wide.offsetY.toFixed(1))

  const tall = coverTransform(512, 400, 900, 0.42)
  ok('a tall box scales by height instead', Math.abs(tall.scale - 900 / 512) < 1e-9)
  ok('and the image covers the box in both axes',
     512 * tall.scale >= 400 - 1e-9 && 512 * tall.scale >= 900 - 1e-9)
}

console.log('\n=== most windows never change, and none of them twinkle ===')
{
  const COUNT = 400
  // Long enough to see a slow window go dark and come back.
  const SPAN = 400_000
  let everDark = 0
  let flips = 0
  const litNow = new Map<number, boolean>()

  for (let t = 0; t < SPAN; t += 250) {
    for (let seed = 1; seed <= COUNT; seed++) {
      const lit = windowLitAt(t, seed)
      if (litNow.has(seed) && litNow.get(seed) !== lit) flips++
      litNow.set(seed, lit)
    }
  }
  for (let seed = 1; seed <= COUNT; seed++) {
    let dark = false
    for (let t = 0; t < SPAN; t += 250) if (!windowLitAt(t, seed)) { dark = true; break }
    if (dark) everDark++
  }

  const share = everDark / COUNT
  ok('only a minority are on a timer at all', share > 0.1 && share < 0.3,
     `${(share * 100).toFixed(0)}% ever go dark`)
  // Two minutes, four hundred windows: a handful of changes, not a light show.
  const perSecond = flips / (SPAN / 1000)
  ok('and changes are rare across the whole city', perSecond < 2.5,
     `${perSecond.toFixed(2)} changes a second over ${COUNT} windows`)
  ok('a window that is dark stays dark for a while', (() => {
    // Find one that changes, and measure its shortest dark spell.
    for (let seed = 1; seed <= COUNT; seed++) {
      let runs: number[] = []
      let run = 0
      for (let t = 0; t < SPAN; t += 250) {
        if (!windowLitAt(t, seed)) run += 250
        else if (run > 0) { runs.push(run); run = 0 }
      }
      if (runs.length > 1) return Math.min(...runs) > 3_000
    }
    return false
  })())
}

console.log('\n=== birds cross slowly, and the sky is usually empty ===')
{
  const W = 1512
  const SKY = 300
  const SPAN = 10 * 60_000
  let visibleSamples = 0
  let starts = 0
  const SEEDS = [1, 2]
  const wasNull = new Map<number, boolean>(SEEDS.map((s) => [s, true]))
  let minY = Infinity
  let maxY = -Infinity

  for (let t = 0; t < SPAN; t += 250) {
    let any = false
    for (const seed of SEEDS) {
      const b = birdAt(t, seed, W, SKY)
      if (b) {
        any = true
        minY = Math.min(minY, b.y)
        maxY = Math.max(maxY, b.y)
        if (wasNull.get(seed)) starts++
      }
      wasNull.set(seed, b === null)
    }
    if (any) visibleSamples++
  }

  const gap = SPAN / 1000 / starts
  ok('one every 8 to 40 seconds', gap >= 8 && gap <= 40, `one every ${gap.toFixed(1)}s`)
  ok('the sky is empty most of the time', visibleSamples / (SPAN / 250) < 0.7,
     `${((visibleSamples / (SPAN / 250)) * 100).toFixed(0)}% of the time`)
  ok('and they stay in the sky, never over the street', maxY < SKY, `lowest ${maxY}px of ${SKY}px`)
  ok('none fly above the frame', minY >= 0, `highest ${minY}px`)
}

console.log('\n=== a bird crosses, rather than jumping ===')
{
  let found = false
  let bad = 0
  for (let t = 0; t < 60_000 && !found; t += 250) {
    if (!birdAt(t, 1, 1512, 300)) continue
    found = true
    let prev = birdAt(t, 1, 1512, 300)!
    for (let u = t + 250; ; u += 250) {
      const next = birdAt(u, 1, 1512, 300)
      if (!next) break
      if (Math.abs(next.x - prev.x) > 120) bad++
      prev = next
    }
  }
  ok('a crossing was found', found)
  ok('it travels smoothly', bad === 0, `${bad} jumps`)
  ok('and the wings beat', BIRD_FRAMES.length === 2 && BIRD_FRAMES[0][0] !== BIRD_FRAMES[1][0])
}

console.log('\n=== every offset is a whole pixel ===')
{
  let fractional = 0
  for (let t = 0; t < 60_000; t += 250) {
    for (const seed of [1, 2]) {
      const b = birdAt(t, seed, 1512, 300)
      if (!b) continue
      if (!Number.isInteger(b.x) || !Number.isInteger(b.y)) fractional++
    }
  }
  ok('nothing lands between pixels', fractional === 0, `${fractional} fractional`)
}

console.log(`\n${pass} passed, ${fail} failed\n`)
if (fail > 0) process.exit(1)
