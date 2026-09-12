/**
 * The shooting stars are actually findable.
 *
 * Written because they were in the build for hours and Leo, looking straight
 * at the screen they render on, asked for them to be added. That is the only
 * evidence that matters, and it means the first tuning was wrong: one streak
 * every fourteen seconds, twenty-one pixels long, lasting two thirds of a
 * second, is arithmetically "occasional" and perceptually nothing.
 *
 * Rate and legibility are both measurable, so neither should ever again be a
 * matter of squinting at the page and hoping.
 */
import { shootingStarAt } from '../src/components/Starfield'

let pass = 0, fail = 0
const ok = (l: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  ok    ${l}${d ? '  — ' + d : ''}`) }
  else { fail++; console.log(`  FAIL  ${l}${d ? '  — ' + d : ''}`) }
}

/** A laptop window, in star-pixels: the canvas is the viewport over pixelScale 3. */
const W = 640
const H = 360
const SEEDS = [1, 2, 3]
const STEP = 50
const SPAN_MS = 10 * 60_000

function sample() {
  let visibleSamples = 0
  let starts = 0
  let maxLength = 0
  const wasNull = new Map<number, boolean>(SEEDS.map((s) => [s, true]))

  for (let now = 0; now < SPAN_MS; now += STEP) {
    let anyVisible = false
    for (const seed of SEEDS) {
      const shot = shootingStarAt(now, seed, W, H)
      if (shot) {
        anyVisible = true
        maxLength = Math.max(maxLength, shot.length)
        if (wasNull.get(seed)) starts++
      }
      wasNull.set(seed, shot === null)
    }
    if (anyVisible) visibleSamples++
  }

  const minutes = SPAN_MS / 60_000
  return {
    perMinute: starts / minutes,
    secondsBetween: (SPAN_MS / 1000) / starts,
    visibleFraction: visibleSamples / (SPAN_MS / STEP),
    maxLength,
  }
}

const m = sample()

console.log('\n=== they happen often enough to be seen, and rarely enough to be an event ===')
ok(
  'one every 4 to 12 seconds',
  m.secondsBetween >= 4 && m.secondsBetween <= 12,
  `one every ${m.secondsBetween.toFixed(1)}s`,
)
ok(
  'but the sky is empty most of the time',
  m.visibleFraction < 0.35,
  `something on screen ${(m.visibleFraction * 100).toFixed(0)}% of the time`,
)

console.log('\n=== and one is big enough to register ===')
ok('the tail reaches at least 12 pixels', m.maxLength >= 12, `${m.maxLength}px`)

console.log('\n=== the streak is a streak, not a jump ===')
{
  // Find a live one and walk it: it must move monotonically and never
  // teleport, or it reads as three separate sparks rather than one object.
  let found = false
  let bad = 0
  for (let now = 0; now < 120_000 && !found; now += STEP) {
    if (!shootingStarAt(now, 1, W, H)) continue
    found = true
    let prev = shootingStarAt(now, 1, W, H)!
    for (let t = now + STEP; ; t += STEP) {
      const next = shootingStarAt(t, 1, W, H)
      if (!next) break
      const dx = Math.abs(next.x - prev.x)
      const dy = next.y - prev.y
      // A 50ms step at this speed moves tens of pixels, never hundreds.
      if (dx > 60 || dy < 0) bad++
      prev = next
    }
  }
  ok('a streak was found to inspect', found)
  ok('it travels smoothly and always downward', bad === 0, `${bad} bad steps`)
}

console.log('\n=== every offset is a whole pixel ===')
{
  let fractional = 0
  for (let now = 0; now < 120_000; now += STEP) {
    for (const seed of SEEDS) {
      const shot = shootingStarAt(now, seed, W, H)
      if (!shot) continue
      if (!Number.isInteger(shot.x) || !Number.isInteger(shot.y) || !Number.isInteger(shot.length)) {
        fractional++
      }
    }
  }
  ok('nothing lands between pixels', fractional === 0, `${fractional} fractional`)
}

console.log('\n=== the three never synchronise ===')
{
  // If two streaks shared a period they would pair up forever, which reads as
  // a scripted effect rather than a sky.
  let together = 0
  for (let now = 0; now < SPAN_MS; now += STEP) {
    const live = SEEDS.filter((s) => shootingStarAt(now, s, W, H) !== null).length
    if (live === 3) together++
  }
  ok('all three are never on screen at once', together === 0, `${together} samples`)
}

console.log(`\n${pass} passed, ${fail} failed\n`)
if (fail > 0) process.exit(1)
