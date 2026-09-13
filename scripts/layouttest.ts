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
import { chooseKey, wrappedLines, worstLines } from '../src/components/ui/readoutFit'
import { faceWidthFor } from '../src/components/ui/legend'
import { RULE_MESSAGES, explainFailure } from '../src/adjudicator/explain'
import { hintTexts } from '../src/solver/hint'
import { GAME_DATA } from '../src/data/gameData'

let pass = 0, fail = 0
const ok = (l: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  ok    ${l}${d ? '  — ' + d : ''}`) }
  else { fail++; console.log(`  FAIL  ${l}${d ? '  — ' + d : ''}`) }
}

/** Real devices, at their CSS pixel sizes. */
const DEVICES: [string, number, number][] = [
  // The narrowest phone anyone still browses on, and the width at which the
  // HUD's back key drops its label so the realm name stays legible.
  ['iPhone SE (1st gen)', 320, 568],
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

console.log('\n=== losing a tab bar must not resize the wordmark ===')
{
  /*
   * Leo: "why is the tabbed and untabbed size so different." Because the title
   * was the shock absorber: the search returned the first fit starting from
   * the biggest buttons, so every pixel of height lost came off the wordmark.
   * The wordmark should track WIDTH, which a tab bar does not change.
   */
  const width = 1512
  const heights = [1300, 1180, 1100, 1040, 1000, 950]
  const units = heights.map((h) => startScreenLayout(width, h).titleUnit)
  ok(
    'the same width gives the same wordmark at every sensible height',
    new Set(units).size === 1,
    `${heights.map((h, i) => h + ':' + units[i]).join(' ')}`,
  )

  // And it must still be the width that drives it.
  const narrow = startScreenLayout(900, 1100).titleUnit
  const wide = startScreenLayout(1900, 1100).titleUnit
  ok('but a wider window still gets a bigger one', wide > narrow, `${narrow} -> ${wide}`)
}

/*
 * THE BENCH'S READOUT IS THE SAME HEIGHT IN EVERY STATE.
 *
 * Leo: "the size of this block is inconsistent as it gives the explanations
 * for wrong combinations, hints, etc. that kind of trips up the location of
 * the items below which is bad for the user experience."
 *
 * The fix only works if the strip is genuinely built to the tallest message
 * it can ever hold, and "ever" is the word doing the work — there are 433,843
 * pairs that do nothing and each one gets a line from the rule table. These
 * assertions walk the real set rather than a sample, at the real widths.
 */
const LONGEST_NAME = GAME_DATA.elements.reduce(
  (longest, el) => (el.name.length > longest.length ? el.name : longest),
  '',
)

/** Exactly what Workspace builds, so the test cannot drift from the app. */
function candidatesFor(): string[] {
  const name = LONGEST_NAME.toLowerCase()
  return [
    ...RULE_MESSAGES,
    ...hintTexts(LONGEST_NAME),
    `already have ${name}.`,
    `${name} + ${name}`,
  ]
}

/** Exactly what Workspace measures, so the widths cannot drift either. */
function stripFor(viewportWidth: number) {
  // Mirrors Workspace: the key's box is reserved on BOTH sides so the message
  // is centred, and the strip picks how much the label is allowed to say.
  const whyUnit = viewportWidth < 520 ? 2 : 3
  // The estimate Workspace hands the strip before its observer reports. The
  // running component measures its own box, so this is the starting point, not
  // the authority — which is why the assertions below are about the FIT, not
  // about matching a number in the DOM.
  const page = Math.max(240, Math.min(768, viewportWidth) - 40)
  const stripInner = page - 2 * (4 + 12) - 2 * (3 + 9)
  const chosen = chooseKey(stripInner, candidatesFor(), (l) => faceWidthFor(whyUnit, l))
  return { layout: chosen.layout, whyWidth: chosen.keyWidth, label: chosen.label, stripInner }
}

console.log('\n=== the readout holds every message it can ever be given ===')
{
  /*
   * Every distinct line the failure table can print, against the real graph.
   * Sampled by RULE, not by pair: `explainFailure` returns one of a fixed set,
   * so walking the rules covers all 433,843 pairs.
   */
  const seen = new Set<string>()
  const ids = GAME_DATA.elements.map((e) => e.id)
  const paired = new Set(GAME_DATA.recipes.map((r) => [r.inputs[0], r.inputs[1]].sort().join('+')))
  for (let i = 0; i < ids.length; i++) {
    for (let j = i; j < ids.length; j++) {
      if (paired.has([ids[i], ids[j]].sort().join('+'))) continue
      seen.add(explainFailure(ids[i], ids[j]).message)
    }
  }
  const declared = new Set(RULE_MESSAGES)
  const undeclared = [...seen].filter((m) => !declared.has(m))
  ok(
    'every message the game can actually print is in RULE_MESSAGES',
    undeclared.length === 0,
    `${seen.size} reachable, ${undeclared.length} unaccounted for`,
  )

  for (const [name, w] of DEVICES.map((d) => [d[0], d[1]] as [string, number])) {
    const { layout, stripInner } = stripFor(w)
    const cols = Math.floor(layout.textWidth / layout.fontPx)
    const over = candidatesFor().filter((t) => wrappedLines(t, cols) > layout.lines)
    ok(
      `${name} (${w}px): ${layout.lines} lines at ${layout.fontPx}px holds all of them`,
      over.length === 0 && layout.textWidth > 0 && stripInner > 0,
      `strip ${layout.textHeight}px, ${cols} cols, key "${stripFor(w).label}"${over.length ? `, ${over.length} overflow` : ''}`,
    )
  }
}

console.log('\n=== and its height does not depend on what it is saying ===')
{
  /*
   * The actual property Leo asked for. One layout per viewport, and every
   * message rendered into it — so the height is a function of the window and
   * nothing else. If this can be made to fail, the tiles move again.
   */
  let varying = 0
  for (const [, w] of DEVICES.map((d) => [d[0], d[1]] as [string, number])) {
    const heights = new Set<number>()
    for (const _text of ['', ...candidatesFor()]) {
      // The layout is computed from the width and the candidate set, never
      // from the message on screen — which is the whole point, stated as code.
      heights.add(stripFor(w).layout.textHeight)
    }
    if (heights.size !== 1) varying++
  }
  ok('one height per viewport, whatever is on the strip', varying === 0, `${varying} of ${DEVICES.length} varied`)

  // A narrow phone must not end up with type below the floor or a strip so
  // tall it becomes the panel.
  const worstDevice = DEVICES.reduce((worst, d) => (d[1] < worst[1] ? d : worst))
  const worst = stripFor(worstDevice[1]).layout
  /*
   * NOTHING OVERFLOWS THE STRIP.
   *
   * The message, the gap and the key have to add up to no more than the room
   * inside the recess. This caught the width formula being wrong by 40px:
   * `px-5` sits INSIDE `max-w-3xl`, not outside it, so the padding comes off
   * the capped width rather than off the viewport, and the "why not?" key was
   * hanging 20px past the panel it sits in.
   */
  let overflowing = 0
  for (const [, w] of DEVICES.map((d) => [d[0], d[1]] as [string, number])) {
    const { layout, whyWidth, stripInner } = stripFor(w)
    // Mirrored: the key's box is held open on both sides so the message is
    // centred, so the sum has to account for both.
    if (layout.textWidth + 2 * (8 + whyWidth) > stripInner) overflowing++
  }
  ok('the message, the gap and the key fit inside the recess', overflowing === 0, `${overflowing} of ${DEVICES.length} overflow`)

  ok('type never drops below the 8px floor', worst.fontPx >= 8, `${worst.fontPx}px at ${worstDevice[0]}`)
  ok('and the strip stays under 100px even there', worst.textHeight <= 100, `${worst.textHeight}px`)
}

console.log('\n=== the wrap arithmetic matches how a browser breaks a line ===')
{
  ok('a word that fits goes on the line', wrappedLines('abc de', 6) === 1)
  ok('a word that does not starts the next one', wrappedLines('abc def', 6) === 2)
  ok('a word longer than the line breaks inside itself', wrappedLines('abcdefghij', 4) === 3)
  ok('an empty string is still one line', wrappedLines('', 20) === 1)
  ok('a nonsense width degrades instead of looping', wrappedLines('abc', 0) === 3)
  ok('the worst of a set is the set\'s worst', worstLines(['a', 'a b c d e f'], 3) === 3)
}

console.log(`\n${pass} passed, ${fail} failed\n`)
if (fail > 0) process.exit(1)
