/**
 * Writes WALKTHROUGH.md — every combination needed to finish the game.
 *
 * Generated, never hand-written, because a hand-written walkthrough drifts
 * from the data the moment a recipe changes and then actively misleads. This
 * reads GAME_DATA and re-derives the whole thing, so `npm run walkthrough`
 * after any data edit produces a file that is true by construction.
 *
 * Steps are emitted in discovery order: a recipe is only listed once both its
 * inputs are already in hand, which is the order a player can actually follow.
 */
import { writeFileSync } from 'node:fs'
import { GAME_DATA } from '../src/data/gameData'
import type { RealmId, RecipeDef } from '../src/data/types'

const byId = new Map(GAME_DATA.elements.map((e) => [e.id, e]))
const name = (id: string) => byId.get(id)?.name ?? id

const REALMS: { id: RealmId; title: string; note: string }[] = [
  {
    id: 'survival',
    title: 'Survival',
    note: 'Teaches the verb — how making anything works at all. Every recipe here costs nothing: water and CO₂ are Everyday’s lesson, and inventing effort figures would be worse than zero.',
  },
  {
    id: 'everyday',
    title: 'Everyday Objects',
    note: 'Teaches what ordinary manufactured things actually cost. Carries the real footprint numbers.',
  },
]

/**
 * Walk a realm forward from its starters, taking any recipe whose inputs are
 * both available. Cross-realm inputs count as available in the later realm,
 * because Survival is finished first — that dependency is the reason for the
 * ordering, not an accident.
 */
function order(realm: RealmId, carried: Set<string>) {
  const have = new Set([...GAME_DATA.starters[realm], ...carried])
  const steps: RecipeDef[] = []
  const pool = GAME_DATA.recipes.filter((r) => byId.get(r.output)?.realm === realm)
  let moved = true
  while (moved) {
    moved = false
    for (const r of pool) {
      if (steps.includes(r)) continue
      if (!r.inputs.every((i) => have.has(i))) continue
      steps.push(r)
      have.add(r.output)
      moved = true
    }
  }
  const missed = pool.filter((r) => !steps.includes(r))
  return { steps, have, missed }
}

const out: string[] = []
out.push('# Walkthrough — every combination in the game')
out.push('')
out.push('**Generated from `src/data/gameData.ts` by `npm run walkthrough`. Do not edit by hand.**')
out.push('')
out.push(
  `${GAME_DATA.elements.length} elements, ${GAME_DATA.recipes.length} recipes. ` +
    'Steps are in an order you can actually follow: a combination only appears once you already hold both of its inputs.',
)
out.push('')

const carried = new Set<string>()

for (const realm of REALMS) {
  const starters = GAME_DATA.starters[realm.id]
  const targets = GAME_DATA.targets[realm.id]
  const { steps, have, missed } = order(realm.id, carried)

  out.push(`## ${realm.title}`)
  out.push('')
  out.push(realm.note)
  out.push('')
  out.push(`**Targets:** ${targets.map(name).join(', ')}`)
  out.push('')
  out.push(`**You start with ${starters.length}:** ${starters.map(name).join(', ')}`)
  const borrowed = [...carried].filter((id) => steps.some((s) => s.inputs.includes(id)))
  if (borrowed.length > 0) {
    out.push('')
    out.push(`**Carried over from Survival:** ${borrowed.map(name).join(', ')} — these are real dependencies, which is why Survival comes first.`)
  }
  out.push('')
  out.push('| # | Combine | | Gives | How | Cost |')
  out.push('| --- | --- | --- | --- | --- | --- |')

  steps.forEach((r, i) => {
    const target = targets.includes(r.output)
    const gives = target ? `**${name(r.output)}**` : name(r.output)
    const cost =
      r.cost.waterL === 0 && r.cost.co2kg === 0
        ? '—'
        : [
            r.cost.waterL ? `${r.cost.waterL} L water` : '',
            r.cost.co2kg ? `${r.cost.co2kg} kg CO₂` : '',
          ]
            .filter(Boolean)
            .join(', ')
    const route = r.route ? ` _(${r.route})_` : ''
    out.push(
      `| ${i + 1} | ${name(r.inputs[0])} | + ${name(r.inputs[1])} | ${gives}${route} | ${r.process} | ${cost} |`,
    )
  })
  out.push('')

  if (missed.length > 0) {
    out.push(`> **Unreachable:** ${missed.map((r) => name(r.output)).join(', ')} — this is a bug in the data.`)
    out.push('')
  }

  const unreached = targets.filter((t) => !have.has(t))
  out.push(
    unreached.length === 0
      ? `All ${targets.length} targets reachable. ✅`
      : `> **Targets not reachable: ${unreached.map(name).join(', ')}** — this is a bug in the data.`,
  )
  out.push('')

  for (const id of have) carried.add(id)
}

out.push('## Alternate routes')
out.push('')
out.push('Elements with more than one real way to make them. The receipt tells you which road you took.')
out.push('')
const routes = new Map<string, RecipeDef[]>()
for (const r of GAME_DATA.recipes) {
  const list = routes.get(r.output) ?? []
  list.push(r)
  routes.set(r.output, list)
}
let any = false
for (const [output, list] of routes) {
  if (list.length < 2) continue
  any = true
  out.push(`- **${name(output)}** — ${list.map((r) => `${name(r.inputs[0])} + ${name(r.inputs[1])}${r.route ? ` (${r.route})` : ''}`).join('; or ')}`)
}
if (!any) out.push('_None._')
out.push('')

out.push('## How much of the board is a dead end')
out.push('')
{
  const n = GAME_DATA.elements.length
  const pairs = (n * (n - 1)) / 2
  const real = GAME_DATA.recipes.length
  const pct = ((1 - real / pairs) * 100).toFixed(1)
  out.push(
    `${n} elements make ${pairs.toLocaleString()} possible pairs, and ${real} of them are recipes. ` +
      `**${pct}% of everything you can try does nothing** — which is why explaining failure is where the teaching has to happen.`,
  )
}
out.push('')

writeFileSync('WALKTHROUGH.md', out.join('\n'))
console.log(`WALKTHROUGH.md written — ${GAME_DATA.recipes.length} recipes across ${REALMS.length} realms`)
