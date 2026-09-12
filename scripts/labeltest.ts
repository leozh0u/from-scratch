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
import { arcTitleWidth, fitArcUnit } from '../src/components/ArcTitle'
import { GAME_DATA } from '../src/data/gameData'

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

console.log(`\n${pass} passed, ${fail} failed\n`)
if (fail > 0) process.exit(1)
