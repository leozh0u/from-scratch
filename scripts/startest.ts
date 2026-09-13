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
import { startScreenLayout } from '../src/components/startLayout'

let pass = 0, fail = 0
const ok = (l: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  ok    ${l}${d ? '  — ' + d : ''}`) }
  else { fail++; console.log(`  FAIL  ${l}${d ? '  — ' + d : ''}`) }
}

/** A laptop window, in star-pixels: the canvas is the viewport over pixelScale 3. */
const W = 640
const H = 360
// Matches STREAKS in Starfield.tsx — five in flight at once.
const SEEDS = [1, 2, 3, 4, 5]
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
  'one every 2 to 8 seconds',
  m.secondsBetween >= 2 && m.secondsBetween <= 8,
  `one every ${m.secondsBetween.toFixed(1)}s`,
)
ok(
  'but the sky is empty most of the time',
  m.visibleFraction < 0.6,
  `something on screen ${(m.visibleFraction * 100).toFixed(0)}% of the time`,
)

console.log('\n=== and one is big enough to register ===')
ok('the tail reaches at least 12 pixels', m.maxLength >= 12, `${m.maxLength}px`)

/*
 * THE TAIL HAS TO TRAIL, NOT LEAD.
 *
 * The drawing used `x - t` for the tail whatever direction the streak was
 * travelling, so the one going down-and-left dragged its tail down-and-left
 * too — in front of itself. Leo caught it by eye. The streak now reports its
 * direction, and this asserts the sign is the one the drawing needs.
 */
console.log('\n=== a streak travels the way its tail says it came from ===')
{
  let checked = 0
  let wrong = 0
  for (const seed of SEEDS) {
    for (let now = 0; now < SPAN_MS; now += STEP) {
      const a = shootingStarAt(now, seed, W, H)
      const b = shootingStarAt(now + 200, seed, W, H)
      if (!a || !b) continue
      checked++
      // Moving in the direction it says, and always downward.
      if (Math.sign(b.x - a.x) !== 0 && Math.sign(b.x - a.x) !== a.dir) wrong++
      if (b.y < a.y) wrong++
    }
  }
  ok('every streak moves the way its dir says, and downward', wrong === 0, `${checked} samples, ${wrong} wrong`)
  ok('both directions actually occur', new Set(SEEDS.map((seed) => {
    for (let now = 0; now < SPAN_MS; now += STEP) {
      const shot = shootingStarAt(now, seed, W, H)
      if (shot) return shot.dir
    }
    return 0
  })).size === 2, 'a sky where they all fall the same way is a tilt, not a sky')
}

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

console.log('\n=== they never synchronise ===')
{
  /*
   * THE PROPERTY, NOT THE PROXY.
   *
   * This used to assert that all three were never on screen together, which
   * worked as a stand-in while there were three of them at a low rate. At
   * five and a shorter window they do occasionally coincide, and that is
   * DENSITY rather than synchronisation — the assertion failed on correct
   * behaviour, which is the kind of test that gets deleted rather than read.
   *
   * What actually matters is that no two share a period. Two streaks on the
   * same period pair up forever and read as a scripted effect; two on
   * different periods drift past each other and read as a sky.
   */
  const periods = SEEDS.map((seed) => {
    let first = -1
    let second = -1
    let wasNull = true
    for (let now = 0; now < SPAN_MS; now += STEP) {
      const live = shootingStarAt(now, seed, W, H) !== null
      if (live && wasNull) {
        if (first < 0) first = now
        else if (second < 0) second = now
      }
      wasNull = !live
    }
    return second - first
  })
  /*
   * Distinct is not enough — 10430ms and 10410ms are distinct and still pair
   * up for ninety minutes, which is every session anyone will ever have. The
   * property is SEPARATION, and a second is the smallest gap that visibly
   * drifts inside a few minutes.
   */
  const sorted = [...periods].sort((a, b) => a - b)
  const closest = Math.min(...sorted.slice(1).map((p, i) => p - sorted[i]))
  ok('no two streaks share a period, by at least a second', closest >= 1_000,
     `${periods.map((p) => (p / 1000).toFixed(1) + 's').join(', ')} — closest pair ${(closest / 1000).toFixed(1)}s apart`)

  let allAtOnce = 0
  for (let now = 0; now < SPAN_MS; now += STEP) {
    if (SEEDS.every((s) => shootingStarAt(now, s, W, H) !== null)) allAtOnce++
  }
  ok('and they are never all on screen together', allAtOnce === 0, `${allAtOnce} samples`)
}

/*
 * THE WORDMARK CLEARS THE CORNER CONTROLS ON A PHONE.
 *
 * There are four of them — skip, mode, mute, reset — and below about 460px
 * they cannot fit on one line at any size still worth tapping, so they wrap.
 * The layout reserved one row's worth on every screen, which put the second
 * row straight through the middle of "FROM SCRATCH".
 */
{
  console.log('\n=== the wordmark clears a wrapped corner ===')
  let tooTight = 0
  for (let w = 280; w < 460; w += 10) {
    for (const h of [568, 640, 740, 844, 932]) {
      if (startScreenLayout(w, h).topInset < 96) tooTight++
    }
  }
  ok('every narrow screen reserves two rows', tooTight === 0, `${tooTight} too tight`)

  let wasteful = 0
  for (let w = 560; w <= 1600; w += 40) {
    if (startScreenLayout(w, 900).topInset > 78) wasteful++
  }
  ok('and a wide one is not made to pay for it', wasteful === 0,
     'the second row only exists where the corner actually wraps')
}

console.log(`\n${pass} passed, ${fail} failed\n`)
if (fail > 0) process.exit(1)
