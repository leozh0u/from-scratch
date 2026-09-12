/**
 * The planned graph holds together.
 *
 * `plan/graph.txt` is the design for the rebuilt game — every recipe, written
 * before any of it is implemented. A plan this size cannot be checked by
 * reading it: the first draft had four elements that nothing could reach,
 * because one recipe was left as an open question and three more depended on
 * it. Nobody spots that by eye.
 *
 * So the plan is machine-readable and this asserts the properties that make it
 * a game rather than a list:
 *
 *  - every element can actually be reached from the starters
 *  - no pair means two different things, which the engine cannot express
 *  - the starters get reused instead of being single-use parts
 *
 * It runs in `npm test`, so the plan cannot quietly rot while the code catches
 * up with it.
 */
import { readFileSync } from 'node:fs'

let pass = 0, fail = 0
const ok = (l: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  ok    ${l}${d ? '  — ' + d : ''}`) }
  else { fail++; console.log(`  FAIL  ${l}${d ? '  — ' + d : ''}`) }
}

type Step = { realm: string; a: string; b: string; out: string }

function read(path: string): string[] {
  return readFileSync(path, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))
}

const steps: Step[] = read('plan/graph.txt').map((line) => {
  const [realm, pair, out] = line.split('|')
  const [a, b] = pair.split('+')
  return { realm, a, b, out }
})

const starters = new Set(read('plan/starters.txt').map((l) => l.split('|')[1]))
const key = (a: string, b: string) => [a, b].sort().join('+')

console.log('\n=== the plan parses ===')
ok('every line is realm|a+b|output', steps.every((s) => s.realm && s.a && s.b && s.out))
ok('starters are declared', starters.size > 0, `${starters.size} starters`)

console.log('\n=== no pair means two different things ===')
{
  // The engine indexes recipes by unordered pair, so a pair with two outputs
  // is not a design choice, it is data the game cannot represent.
  const byPair = new Map<string, Set<string>>()
  for (const s of steps) {
    const k = key(s.a, s.b)
    byPair.set(k, (byPair.get(k) ?? new Set()).add(s.out))
  }
  const clashes = [...byPair.entries()].filter(([, outs]) => outs.size > 1)
  ok('no collisions', clashes.length === 0, clashes.map(([k, o]) => `${k} -> ${[...o].join('/')}`).join(', '))
}

console.log('\n=== everything can be reached from the starters ===')
{
  const have = new Set(starters)
  let moved = true
  while (moved) {
    moved = false
    for (const s of steps) {
      if (have.has(s.a) && have.has(s.b) && !have.has(s.out)) { have.add(s.out); moved = true }
    }
  }
  const all = new Set<string>()
  for (const s of steps) { all.add(s.a); all.add(s.b); all.add(s.out) }
  const stranded = [...all].filter((id) => !have.has(id))
  ok('nothing is stranded', stranded.length === 0, stranded.join(', '))
  ok('and nothing is an input that is never produced or given', 
     [...all].every((id) => starters.has(id) || steps.some((s) => s.out === id)),
     [...all].filter((id) => !starters.has(id) && !steps.some((s) => s.out === id)).join(', '))
}

console.log('\n=== the starters are ingredients, not single-use parts ===')
{
  const uses = new Map<string, number>()
  for (const s of steps) {
    uses.set(s.a, (uses.get(s.a) ?? 0) + 1)
    uses.set(s.b, (uses.get(s.b) ?? 0) + 1)
  }
  const onceOnly = [...starters].filter((id) => (uses.get(id) ?? 0) <= 1)
  // The shipped game had 14 of 19. Anything at or below a third is a different
  // kind of object: an ingredient you keep coming back to.
  ok(
    'fewer than half the starters are used once',
    onceOnly.length * 2 < starters.size,
    `${onceOnly.length} of ${starters.size}: ${onceOnly.join(', ')}`,
  )
  const survivalStarters = read('plan/starters.txt').filter((l) => l.startsWith('S|')).map((l) => l.split('|')[1])
  const worst = Math.min(...survivalStarters.map((id) => uses.get(id) ?? 0))
  ok(
    "survival's starters are each used at least four times",
    worst >= 4,
    survivalStarters.map((id) => `${id}=${uses.get(id)}`).join(' '),
  )
}

console.log('\n=== survival comes first, and genuinely so ===')
{
  // Everyday must consume something Survival produces, or the ordering is
  // arbitrary gating rather than a real dependency.
  const survivalOutputs = new Set(steps.filter((s) => s.realm === 'S').map((s) => s.out))
  const borrowed = steps
    .filter((s) => s.realm === 'E')
    .flatMap((s) => [s.a, s.b])
    .filter((id) => survivalOutputs.has(id))
  ok('everyday consumes survival output', borrowed.length > 0, [...new Set(borrowed)].join(', '))
}

console.log('\n=== it is bigger than what it replaces ===')
{
  const all = new Set<string>()
  for (const s of steps) { all.add(s.a); all.add(s.b); all.add(s.out) }
  ok('more elements than the 43 shipped today', all.size > 43, `${all.size} elements`)
  ok('more recipes than the 26 shipped today', steps.length > 26, `${steps.length} recipes`)
}

console.log(`\n${pass} passed, ${fail} failed\n`)
if (fail > 0) process.exit(1)
