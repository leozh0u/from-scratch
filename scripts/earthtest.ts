/**
 * The globe turns in visible steps.
 *
 * Written because the bug it guards against was invisible in exactly the way
 * that matters: the planet WAS rotating, correctly, continuously, and at a
 * four-minute period on a 72-pixel disc each animation frame moved the
 * surface by a fraction of a pixel. What you saw was a scatter of pixels
 * flickering between two shades — the rotation was real and unwatchable, and
 * the dither was the only thing on screen. "It looks like random movement"
 * was the right description of correct code.
 *
 * So the test is not "does the longitude change". It is "does one step of the
 * animation move enough pixels to read as motion", answered by rendering two
 * consecutive steps and counting.
 *
 * It runs in Node on purpose. The animation is driven by
 * `requestAnimationFrame`, which browsers rightly refuse to run in a hidden
 * tab, so a preview pane cannot answer this question when it happens to be
 * hidden — and a check that only works when someone is looking is not a check.
 */
import { projectEarth, rgbPalette, longitudeSteps } from '../src/components/PixelEarth'

let pass = 0, fail = 0
const ok = (l: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  ok    ${l}${d ? '  — ' + d : ''}`) }
  else { fail++; console.log(`  FAIL  ${l}${d ? '  — ' + d : ''}`) }
}

const SIZE = 72          // what the title screen actually renders
const SECONDS_PER_TURN = 32
const colours = rgbPalette()

function frame(longitude: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(SIZE * SIZE * 4)
  projectEarth(out, SIZE, longitude, colours)
  return out
}

function differing(a: Uint8ClampedArray, b: Uint8ClampedArray): number {
  let n = 0
  for (let i = 0; i < a.length; i += 4) {
    if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) n++
  }
  return n
}

const steps = longitudeSteps(SIZE)
const stepRadians = (2 * Math.PI) / steps
const discPixels = Math.round(Math.PI * (SIZE / 2) ** 2)

console.log('\n=== one step is a visible step ===')
{
  /*
   * Sampled around the whole rotation rather than at one longitude: the
   * Pacific is mostly ocean and a step there moves far less than a step
   * across Africa, so a single sample could pass on a lucky frame.
   */
  const moved: number[] = []
  for (let s = 0; s < steps; s++) {
    moved.push(differing(frame(s * stepRadians), frame((s + 1) * stepRadians)))
  }
  const worst = Math.min(...moved)
  const median = [...moved].sort((a, b) => a - b)[Math.floor(moved.length / 2)]

  ok('every step changes part of the picture', worst > 0, `quietest step moved ${worst} pixels`)
  ok('and the quiet ones are still a real move',
     worst >= discPixels * 0.02,
     `${worst} of ${discPixels} disc pixels, floor is ${Math.round(discPixels * 0.02)}`)
  ok('a typical step moves a noticeable part of the globe',
     median >= discPixels * 0.05,
     `${median} pixels, ${((median / discPixels) * 100).toFixed(1)}% of the disc`)
}

console.log('\n=== and the frame rate is deliberately low ===')
{
  const perSecond = steps / SECONDS_PER_TURN

  ok('the step count gives one pixel of travel at the centre',
     steps === SIZE * 2,
     `${steps} steps, ${SIZE} pixels across, half a turn crosses the face`)
  ok('it redraws a handful of times a second, not sixty',
     perSecond >= 2 && perSecond <= 12,
     `${perSecond.toFixed(1)} steps a second`)
  ok('a full turn is watchable rather than geological',
     SECONDS_PER_TURN <= 60,
     `${SECONDS_PER_TURN}s a rotation`)
}

console.log('\n=== it is a globe, not a disc of noise ===')
{
  const f = frame(0)
  const at = (x: number, y: number) => {
    const i = (y * SIZE + x) * 4
    return [f[i], f[i + 1], f[i + 2], f[i + 3]]
  }
  ok('the corners are transparent', at(0, 0)[3] === 0 && at(SIZE - 1, SIZE - 1)[3] === 0)
  ok('the centre is opaque', at(SIZE >> 1, SIZE >> 1)[3] === 255)

  // Six colours and no more: shading picks between discrete bands rather
  // than blending, which is the whole reason it still reads as pixel art.
  const seen = new Set<string>()
  for (let i = 0; i < f.length; i += 4) {
    if (f[i + 3] === 255) seen.add(`${f[i]},${f[i + 1]},${f[i + 2]}`)
  }
  ok('and it uses six colours, not a gradient', seen.size <= 6, `${seen.size} colours`)
}

console.log('\n=== the same longitude always draws the same frame ===')
{
  // The step index is derived from the clock rather than accumulated, so a
  // backgrounded tab resumes where the world would be. That only holds if the
  // projection is a pure function of longitude.
  ok('rendering is deterministic', differing(frame(1.234), frame(1.234)) === 0)
  ok('and a full turn comes back round',
     differing(frame(0.5), frame(0.5 + 2 * Math.PI)) === 0)
}

console.log(`\n${pass} passed, ${fail} failed\n`)
if (fail > 0) process.exit(1)
