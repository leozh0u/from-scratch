/**
 * The title screen fits, on every device and both ways round.
 *
 * Written because it did not. At 844x390 — an iPhone held sideways — the
 * sizes were computed from viewport WIDTH alone, so the wordmark and the
 * buttons were drawn at nearly desktop size and all three menu buttons sat
 * below the fold. The screen clips its overflow so the planet can be cropped
 * off the bottom, which meant the buttons were not merely awkward to reach,
 * they could not be reached at all: the game was unstartable in landscape and
 * nothing in the type-checker or the other tests could see it.
 *
 * A screenshot would not have caught it either, since I only ever look at one
 * window size at a time.
 */
import { startScreenLayout, startScreenContentHeight, arcTitleWidth } from '../src/components/startLayout'

let pass = 0, fail = 0
const ok = (l: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  ok    ${l}${d ? '  — ' + d : ''}`) }
  else { fail++; console.log(`  FAIL  ${l}${d ? '  — ' + d : ''}`) }
}

/** Real devices, at their CSS pixel sizes. */
const DEVICES: [string, number, number][] = [
  ['iPhone SE', 375, 667],
  ['iPhone 12/13/14', 390, 844],
  ['iPhone 14 Pro Max', 430, 932],
  ['Pixel 7', 412, 915],
  ['Galaxy S8', 360, 740],
  ['iPad mini', 744, 1133],
  ['iPad Pro 11', 834, 1194],
  ['Surface Duo', 540, 720],
  ['MacBook Air', 1440, 900],
  ['MacBook Pro 16', 1728, 1117],
  ['1080p monitor', 1920, 1080],
  ['Ultrawide', 2560, 1080],
]

console.log('\n=== every device, both orientations, content fits on screen ===')
{
  let bad = 0
  const worst: string[] = []
  for (const [name, w, h] of DEVICES) {
    for (const [ww, hh, turn] of [[w, h, 'portrait'], [h, w, 'landscape']] as [number, number, string][]) {
      const layout = startScreenLayout(ww, hh)
      const content = startScreenContentHeight(layout)
      if (content > hh) { bad++; worst.push(`${name} ${turn} ${ww}x${hh}: needs ${content}px`) }
    }
  }
  ok(`all ${DEVICES.length * 2} fit`, bad === 0, worst.slice(0, 4).join(' | '))
}

console.log('\n=== and the wordmark never runs off the side ===')
{
  let bad = 0
  const worst: string[] = []
  for (const [name, w, h] of DEVICES) {
    for (const [ww, hh, turn] of [[w, h, 'portrait'], [h, w, 'landscape']] as [number, number, string][]) {
      const { titleUnit } = startScreenLayout(ww, hh)
      const drawn = arcTitleWidth('From Scratch', titleUnit)
      if (drawn > ww) { bad++; worst.push(`${name} ${turn}: ${drawn}px in ${ww}px`) }
    }
  }
  ok('no overflow', bad === 0, worst.slice(0, 4).join(' | '))
}

console.log('\n=== a sweep of sizes, not just the ones I thought of ===')
{
  // Device lists go stale. This walks the space between them.
  let bad = 0
  let firstBad = ''
  for (let w = 320; w <= 2560; w += 17) {
    for (let h = 320; h <= 1440; h += 13) {
      const layout = startScreenLayout(w, h)
      if (startScreenContentHeight(layout) > h) {
        bad++
        if (!firstBad) firstBad = `${w}x${h}`
      }
      if (arcTitleWidth('From Scratch', layout.titleUnit) > w) {
        bad++
        if (!firstBad) firstBad = `${w}x${h} (wide)`
      }
    }
  }
  ok('nothing overflows anywhere in the sweep', bad === 0, `${bad} bad, first at ${firstBad}`)
}

console.log('\n=== the sizes still grow with the screen ===')
{
  const phone = startScreenLayout(390, 844)
  const laptop = startScreenLayout(1440, 900)
  ok('a laptop gets a bigger wordmark than a phone', laptop.titleUnit > phone.titleUnit,
     `${phone.titleUnit} -> ${laptop.titleUnit}`)
  ok('and bigger buttons', laptop.unit > phone.unit, `${phone.unit} -> ${laptop.unit}`)
  const landscape = startScreenLayout(844, 390)
  ok('a sideways phone gets smaller ones than a laptop', landscape.unit < laptop.unit,
     `${landscape.unit} vs ${laptop.unit}`)
}

console.log(`\n${pass} passed, ${fail} failed\n`)
if (fail > 0) process.exit(1)
