/**
 * Applies a staged batch into the game, once a human has read it.
 *
 * `npm run import` is the gate that throws out everything provably wrong.
 * This is the step after: it writes the survivors into `gameData.ts`,
 * `iconRegistry.ts` and `properties.ts` in one pass, in the three places a new
 * element has to exist or the build fails.
 *
 * WHY THIS EXISTS RATHER THAN A HUMAN PASTING
 *
 * The rule is that `gameData.ts` is edited by hand after verification, and it
 * still is — the verification is reading the batch file, and the batch file is
 * written by hand. What was being done by hand and should not have been is the
 * transcription: the same element's id retyped into three files, where a typo
 * is caught by a test rather than by the eye and costs a round trip each time.
 * Ten batches of that is an hour of nothing.
 *
 * The model still never touches this. A batch arrives as JSON that a person
 * wrote or read; this only moves it.
 *
 *   npm run apply -- data/staging/b7.json
 */
import { readFileSync, writeFileSync } from 'node:fs'

type Entry = {
  output_id: string
  output_name: string
  inputs: [string, string]
  process: string
  blurb: string
  icon: { form: string; colour: string }
  props: string
  suggested_sources: { label: string; url: string }[]
}

const file = process.argv[2]
if (!file) {
  console.error('Usage: npm run apply -- data/staging/<batch>.json')
  process.exit(1)
}

const batch = JSON.parse(readFileSync(file, 'utf8'))
const entries: Entry[] = batch.proposals

/** Everything below is a whole-file string edit, so it is checked, not assumed. */
function insertAfter(source: string, anchor: string, block: string): string {
  const at = source.indexOf(anchor)
  if (at < 0) throw new Error(`anchor not found: ${anchor.slice(0, 60)}`)
  const eol = source.indexOf('\n', at) + 1
  return source.slice(0, eol) + block + source.slice(eol)
}

const q = (s: string) => s.replace(/'/g, "\\'")
const sourceList = (e: Entry) =>
  '[' +
  e.suggested_sources
    .map((s) => `{ label: '${q(s.label)}', url: '${s.url}', tier: 'referenced' }`)
    .join(', ') +
  ']'

const label = batch.target ?? file

// --- gameData: elements, then recipes ---
{
  let g = readFileSync('src/data/gameData.ts', 'utf8')

  const already = entries.filter((e) => new RegExp(`id: '${e.output_id}'`).test(g))
  if (already.length) {
    console.error(`Already present, refusing to duplicate: ${already.map((e) => e.output_id).join(', ')}`)
    process.exit(1)
  }

  const elements = entries
    .map(
      (e) =>
        `    { id: '${e.output_id}', name: '${q(e.output_name)}', icon: '${e.output_id}', realm: 'everyday', blurb: ${JSON.stringify(e.blurb)}, sources: ${sourceList(e)} },`,
    )
    .join('\n')

  const recipes = entries
    .map(
      (e) =>
        `    { inputs: ['${e.inputs[0]}', '${e.inputs[1]}'], output: '${e.output_id}', process: '${q(e.process)}', cost: ZERO_COST, sources: ${sourceList(e)} },`,
    )
    .join('\n')

  // Elements go at the end of the elements array, recipes at the end of theirs.
  const elementsEnd = g.indexOf('\n  ],\n  recipes: [')
  if (elementsEnd < 0) throw new Error('could not find the end of the elements array')
  g = g.slice(0, elementsEnd + 1) + `\n    // ${label}\n` + elements + '\n' + g.slice(elementsEnd + 1)

  const recipesStart = g.indexOf('  recipes: [')
  const recipesEnd = g.indexOf('\n  ],', recipesStart)
  g = g.slice(0, recipesEnd + 1) + `\n    // ${label}\n` + recipes + '\n' + g.slice(recipesEnd + 1)

  writeFileSync('src/data/gameData.ts', g)
}

// --- iconRegistry ---
{
  const r = readFileSync('src/data/iconRegistry.ts', 'utf8')
  const block = entries
    .map((e) => `  ${e.output_id}: { form: '${e.icon.form}', colour: '${e.icon.colour}' },`)
    .join('\n')
  writeFileSync('src/data/iconRegistry.ts', insertAfter(r, 'export const COMPOSED', block + '\n'))
}

// --- properties ---
{
  const p = readFileSync('src/data/properties.ts', 'utf8')
  const block = entries.map((e) => `  ${e.output_id}: ${e.props},`).join('\n')
  const at = p.indexOf('  charcoal: P(')
  if (at < 0) throw new Error('could not find the properties anchor')
  writeFileSync('src/data/properties.ts', p.slice(0, at) + block + '\n' + p.slice(at))
}

console.log(`applied ${entries.length} elements from ${file}`)
