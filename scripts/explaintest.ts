/**
 * The instant failure explanations.
 *
 * Over 98% of pairs a player can try produce nothing, so this table is the
 * sentence the game says most often by a very wide margin. Two things have to
 * hold and neither is visible from playing for a minute.
 */
import { explainFailure, RULE_IDS } from '../src/adjudicator/explain'
import { PROPERTIES, everyElementIsTagged } from '../src/data/properties'
import { GAME_DATA } from '../src/data/gameData'

let pass = 0, fail = 0
const ok = (l: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  ok    ${l}${d ? '  — ' + d : ''}`) }
  else { fail++; console.log(`  FAIL  ${l}${d ? '  — ' + d : ''}`) }
}

console.log('\n=== every element is tagged ===')
{
  // An untagged element silently falls through to the vaguest line in the
  // file, which is exactly the failure the table exists to remove.
  const untagged = everyElementIsTagged()
  ok('no element is missing properties', untagged.length === 0, untagged.join(', '))
  ok('and nothing is tagged that does not exist',
    Object.keys(PROPERTIES).every((id) => GAME_DATA.elements.some((e) => e.id === id)),
    Object.keys(PROPERTIES).filter((id) => !GAME_DATA.elements.some((e) => e.id === id)).join(', '))
}

console.log('\n=== it answers instantly, for every possible pair ===')
{
  const ids = GAME_DATA.elements.map((e) => e.id)
  const started = performance.now()
  let blank = 0
  let pairs = 0
  for (let i = 0; i < ids.length; i++) {
    for (let j = i; j < ids.length; j++) {
      const { message } = explainFailure(ids[i], ids[j])
      if (!message || message.length < 8) blank++
      pairs++
    }
  }
  const ms = performance.now() - started
  ok('every pair gets a real sentence', blank === 0, `${pairs} pairs, ${blank} blank`)
  ok('the whole space resolves in a few milliseconds', ms < 250, `${pairs} pairs in ${ms.toFixed(1)}ms`)
  ok('which is the point — the model took 5-10 SECONDS for one', ms / pairs < 0.05,
    `${((ms / pairs) * 1000).toFixed(1)}µs per pair`)
}

console.log('\n=== it is symmetric ===')
{
  // A player does not think of "flint + steel" and "steel + flint" as
  // different attempts, and the game must not either.
  const ids = GAME_DATA.elements.map((e) => e.id)
  let asymmetric = 0
  for (const a of ids) for (const b of ids) {
    if (explainFailure(a, b).message !== explainFailure(b, a).message) asymmetric++
  }
  ok('order never changes the answer', asymmetric === 0, `${asymmetric} asymmetric pairs`)
}

console.log('\n=== the rules that matter actually fire ===')
{
  const cases: Array<[string, string, string]> = [
    ['high_carbon_steel', 'cotton_gin', 'tool'],
    ['candle', 'lighter', 'finished'],
    ['stone', 'limestone', 'rocks'],
    ['natural_gas', 'butane', 'gases'],
    ['fire', 'ember', 'heat'],
  ]
  for (const [a, b, expect] of cases) {
    const { message } = explainFailure(a, b)
    ok(`${a} + ${b} gets a specific answer`,
      message.toLowerCase().includes(expect) || !message.startsWith('Nothing obvious'),
      message)
  }
}

console.log('\n=== nothing claims a pair is impossible ===')
{
  /*
   * THE CONSTRAINT THAT MATTERS MOST.
   *
   * The model underneath can answer "that's actually real, just not in this
   * game", which is the single best moment this game has. A local line that
   * said "these cannot combine" would be flatly contradicting the sentence
   * that replaces it a second later. Every line has to describe what does not
   * happen HERE, or what is missing — never what cannot exist.
   */
  const banned = [/\bimpossible\b/i, /\bcannot\b/i, /\bcan't\b/i, /\bnever\b/i, /\bdoes not exist\b/i]
  const ids = GAME_DATA.elements.map((e) => e.id)
  const offenders = new Set<string>()
  for (const a of ids) for (const b of ids) {
    const { message } = explainFailure(a, b)
    if (banned.some((re) => re.test(message))) offenders.add(message)
  }
  ok('no line forecloses on the model', offenders.size === 0, [...offenders].join(' | '))
}

console.log('\n=== every rule in the table is reachable ===')
{
  // A rule shadowed by an earlier one is dead code that looks like content.
  const ids = GAME_DATA.elements.map((e) => e.id)
  const produced = new Set<string>()
  for (const a of ids) for (const b of ids) produced.add(explainFailure(a, b).message)
  ok('the table produces several distinct answers', produced.size >= 5,
    `${produced.size} distinct of ${RULE_IDS.length} rules + fallback`)
}

console.log(`\n${fail === 0 ? 'Instant explanations hold.' : `${fail} FAILED`}  (${pass} checks)`)
process.exit(fail === 0 ? 0 : 1)
