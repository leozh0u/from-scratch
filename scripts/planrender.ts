/**
 * Renders `plan/graph.txt` into the readable tables in GAMEPLAN.md.
 *
 * The plan is authored as a machine-readable edge list precisely so it can be
 * checked (see plancheck.ts) — but an edge list is not something anyone reads
 * to understand a game. This turns it into play order: a recipe appears only
 * once both its inputs are already in hand, which is the order a player
 * actually meets them.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const read = (p: string) =>
  readFileSync(p, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))

const steps = read('plan/graph.txt').map((line) => {
  const [realm, pair, out] = line.split('|')
  const [a, b] = pair.split('+')
  return { realm, a, b, out, line }
})
const starters = read('plan/starters.txt').map((l) => {
  const [realm, id] = l.split('|')
  return { realm, id }
})

/** Ids are snake_case; names are what a player sees. */
const NAME: Record<string, string> = {
  cotton_t_shirt: 'Cotton T-Shirt',
  high_carbon_steel: 'High-Carbon Steel',
}
const title = (id: string) =>
  NAME[id] ?? id.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')

const have = new Set(starters.map((s) => s.id))
const ordered: typeof steps = []
let moved = true
while (moved) {
  moved = false
  for (const s of steps) {
    if (ordered.includes(s)) continue
    if (!have.has(s.a) || !have.has(s.b)) continue
    ordered.push(s)
    have.add(s.out)
    moved = true
  }
}

const out: string[] = []
for (const [code, heading] of [['S', 'Survival'], ['E', 'Everyday Objects']] as const) {
  const mine = ordered.filter((s) => s.realm === code)
  out.push(`### ${heading}`)
  out.push('')
  out.push(
    `**You start with ${starters.filter((s) => s.realm === code).length}:** ` +
      starters.filter((s) => s.realm === code).map((s) => title(s.id)).join(' · '),
  )
  out.push('')
  out.push('| # | | | |')
  out.push('| --- | --- | --- | --- |')
  mine.forEach((s, i) => {
    out.push(`| ${i + 1} | ${title(s.a)} | + ${title(s.b)} | = **${title(s.out)}** |`)
  })
  out.push('')
}

const all = new Set(steps.flatMap((s) => [s.a, s.b, s.out]))
out.push(`${all.size} elements, ${steps.length} recipes.`)

writeFileSync('plan/rendered.md', out.join('\n'))
console.log(`plan/rendered.md written — ${all.size} elements, ${steps.length} recipes`)
