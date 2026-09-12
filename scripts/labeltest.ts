/**
 * Every element name fits its tile, and no word is broken mid-letter.
 *
 * This is written because "manganese" shipped as "manganes" and a stranded
 * "e" — a nine-character word overflowing an eighty-eight pixel line by two
 * pixels. Nothing in the type-checker or the solver can see that, and it is
 * invisible until someone looks at that one tile, so it goes here instead.
 *
 * The stakes rise as the game grows: ARCHITECTURE.md plans hundreds of
 * elements, and every new name is another chance to reintroduce this. The test
 * walks the real data, so adding an unfittable name fails the build.
 */
import { fitFontSize, unbreakableRuns, lineCount } from '../src/components/ui/labelFit'
import { arcTitleWidth, fitArcUnit, arcTitlePlacement } from '../src/components/ArcTitle'
import { GAME_DATA } from '../src/data/gameData'
import { sizeAt, advanceEm, stripHeight, contrast, SQUASH, FLOOR_PX } from '../src/components/ui/legend'
import { TONES, LOCKED } from '../src/components/ui/PixelButton'

let pass = 0, fail = 0
const ok = (l: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  ok    ${l}${d ? '  — ' + d : ''}`) }
  else { fail++; console.log(`  FAIL  ${l}${d ? '  — ' + d : ''}`) }
}

/**
 * The tile's real geometry, from ElementTile. The usable line is the face
 * (24 units) minus its bevel (1 unit each side) — type crossing the raised lip
 * looks like a fault, so the bevel is not width the label may borrow.
 */
const UNIT = 4
const BOX = UNIT * 22
const SIZES = [UNIT * 2.5, UNIT * 2.25, UNIT * 2]
const MAX_LINES = 2

console.log('\n=== the runs CSS cannot break are found correctly ===')
ok('a plain word is one run', unbreakableRuns('manganese').join('|') === 'manganese')
ok('spaces separate runs', unbreakableRuns('soda ash').join('|') === 'soda|ash')
ok(
  'a hyphen breaks, and stays on the upper line',
  unbreakableRuns('high-carbon steel').join('|') === 'high-|carbon|steel',
  unbreakableRuns('high-carbon steel').join('|'),
)

console.log('\n=== wrapping counts lines the way the browser does ===')
ok('a short name is one line', lineCount('salt', 12) === 1)
ok('two words that do not fit together take two', lineCount('silica sand', 8) === 2)
ok('and one line when they do', lineCount('silica sand', 11) === 1)
ok(
  'a hyphen joins with no space between',
  lineCount('high-carbon', 11) === 1,
  `${lineCount('high-carbon', 11)} lines`,
)

console.log('\n=== every element name in the game fits its tile ===')
{
  const names = GAME_DATA.elements.map((e) => e.name)
  let broken = 0
  let overflowing = 0
  const worst: string[] = []

  for (const name of names) {
    const size = fitFontSize(name, BOX, SIZES, MAX_LINES)
    const charsPerLine = Math.floor(BOX / size)
    const longest = Math.max(...unbreakableRuns(name).map((r) => r.length))
    // Press Start 2P advances exactly one em per glyph, so this is the true
    // rendered width, not an approximation.
    if (longest > charsPerLine) { broken++; worst.push(`${name} @${size}px`) }
    if (lineCount(name, charsPerLine) > MAX_LINES) { overflowing++; worst.push(`${name} wraps`) }
  }

  ok(`no name breaks mid-word (${names.length} elements)`, broken === 0, worst.join(', '))
  ok('no name needs a third line', overflowing === 0, worst.join(', '))
}

console.log('\n=== the specific regression ===')
{
  const size = fitFontSize('manganese', BOX, SIZES, MAX_LINES)
  const charsPerLine = Math.floor(BOX / size)
  ok('"manganese" survives on one line', 'manganese'.length <= charsPerLine, `${charsPerLine} chars fit at ${size}px`)
  // It shrinks by one step to get there, and that is the intended trade: the
  // alternative is ten-pixel type crossing the bevel, or the split word again.
  ok('by stepping down exactly one size, not two', size === SIZES[1], `${size}px`)
}

console.log('\n=== type never drops below the legibility floor ===')
{
  const sizes = GAME_DATA.elements.map((e) => fitFontSize(e.name, BOX, SIZES, MAX_LINES))
  ok('every label is at least 8px', Math.min(...sizes) >= 8, `min ${Math.min(...sizes)}px`)
}

console.log('\n=== the wordmark fits every window ===')
{
  /*
   * It used to be four hand-picked breakpoints, and every change to the font
   * or the spacing found a width where "From Scratch" ran off the screen or
   * slid under the reset button. Moving to Pixelify Sans, which is wider than
   * Press Start 2P, broke it again immediately. This walks every width from a
   * small phone to a large desktop.
   */
  const TEXT = 'From Scratch'
  let overflowed = 0
  let tiny = 0
  let worst = ''
  for (let width = 320; width <= 2560; width += 1) {
    const available = width * 0.84
    const unit = fitArcUnit(TEXT, available, 12)
    const drawn = arcTitleWidth(TEXT, unit)
    if (drawn > available) { overflowed++; if (!worst) worst = `${width}px -> ${drawn}px in ${Math.round(available)}px` }
    if (unit < 2) tiny++
  }
  ok('never wider than the room it has', overflowed === 0, worst)
  ok('and never shrinks below the floor of 2', tiny === 0)
  ok(
    'it does grow with the window',
    fitArcUnit(TEXT, 2560 * 0.84, 12) > fitArcUnit(TEXT, 380 * 0.84, 12),
    `${fitArcUnit(TEXT, 380 * 0.84, 12)} -> ${fitArcUnit(TEXT, 2560 * 0.84, 12)}`,
  )
  // The ceiling is deliberate: past this the title stops being a title.
  ok('and stops at the ceiling', fitArcUnit(TEXT, 99_999, 12) === 12)
}

console.log('\n=== the word break sits at the top of the arc ===')
{
  /*
   * "i want the middle line to be the middle." The two words have different
   * letter counts, so spacing every letter equally put the apex inside
   * "Scratch". At balance 1 each word gets an identical share and the gap
   * between them is the midpoint of the arc - which only comes out exact if
   * the spans are measured from the glyph EDGES, since a four-letter word and
   * a seven-letter word inset their outermost glyphs by different amounts.
   * The first attempt missed by ten pixels for precisely that reason.
   */
  const TEXT = 'From Scratch'
  const balanced = arcTitlePlacement(TEXT, 1)
  const first = balanced.filter((p) => p.word === 0)
  const second = balanced.filter((p) => p.word === 1)
  const breakAt = (first[first.length - 1].t + second[0].t) / 2

  ok('the break is at the midpoint', Math.abs(breakAt - 0.5) < 0.001, `${breakAt.toFixed(4)}`)
  ok(
    'and the two words take the same room',
    Math.abs(
      (first[first.length - 1].t - first[0].t) - (second[second.length - 1].t - second[0].t),
    ) < 0.001,
  )

  // Backing the dial off must actually change something, or it is not a dial.
  const natural = arcTitlePlacement(TEXT, 0)
  const naturalBreak =
    (natural.filter((p) => p.word === 0).slice(-1)[0].t + natural.filter((p) => p.word === 1)[0].t) / 2
  ok('balance 0 leaves the break where the letters put it', Math.abs(naturalBreak - 0.5) > 0.05,
     `${naturalBreak.toFixed(3)}`)
  ok(
    'and spaces every letter evenly instead',
    (() => {
      const gaps = natural.slice(1).map((p, i) => p.t - natural[i].t).filter((_, i) => i !== 3)
      return Math.max(...gaps) - Math.min(...gaps) < 0.001
    })(),
  )
}

/*
 * THE SIDE-OF-KEY LEGENDS.
 *
 * Two regressions, both arithmetic and both invisible to the type-checker.
 * The size lost its floor when it moved to a container query and resolved to
 * 6px in landscape; and the locked tone borrowed the bevel highlight for its
 * legend colour, which measured 2.26:1 against the base it was printed on
 * while the other two sat near 5. The one carrying an instruction was the one
 * you could not read.
 */
console.log('\n=== the legend printed on the side of a key ===')
{
  const LEGENDS = ['the tutorial', 'the main game', 'finish survival first']

  // Every unit the start screen can pick, against every button width a
  // viewport from a small phone to a desktop produces.
  let smallest = Infinity
  let tightest = Infinity
  let fits = true
  for (let unit = 3; unit <= 10; unit++) {
    for (let width = 240; width <= 560; width += 8) {
      for (const text of LEGENDS) {
        const size = sizeAt(unit, width, text)
        smallest = Math.min(smallest, size * SQUASH)
        const needed = advanceEm(text) * size
        const room = width - unit * 2
        tightest = Math.min(tightest, room - needed)
        if (needed > room) fits = false
      }
    }
  }
  ok('never resolves below the floor', smallest >= FLOOR_PX * SQUASH - 0.001,
     `smallest drawn height ${smallest.toFixed(1)}px`)
  ok('and that is still readable', smallest >= 6, `${smallest.toFixed(1)}px of drawn height`)
  ok('every legend fits every button width', fits, `tightest fit had ${tightest.toFixed(0)}px to spare`)

  let insideStrip = true
  for (let unit = 3; unit <= 10; unit++) {
    const tallest = Math.round(unit * 2.1) * SQUASH
    if (tallest > stripHeight(unit)) insideStrip = false
  }
  ok('and sits inside the visible side face', insideStrip)

  /*
   * 4.5:1 is the text threshold. It is not decoration — the locked legend is
   * the only place the game says what you have to do to get in.
   */
  const tones: [string, { legend: string; base: string }][] = [
    ['survival', TONES.survival],
    ['everyday', TONES.everyday],
    ['default', TONES.default],
    ['danger', TONES.danger],
    ['locked', LOCKED],
  ]
  for (const [name, t] of tones) {
    const ratio = contrast(t.legend, t.base)
    ok(`${name} legend reads against its own side face`, ratio >= 4.5, `${ratio.toFixed(2)}:1`)
  }
}

console.log(`\n${pass} passed, ${fail} failed\n`)
if (fail > 0) process.exit(1)
