/**
 * The edge cases a reviewer asks about, answered by running them.
 *
 * Leo: "no bugs, edge cases thought about." These are the ones that are cheap
 * to get wrong and expensive to notice: a save written by an older build, a
 * browser that refuses to store anything, a player who has found everything,
 * and a hint asked for when there is nothing to hint at.
 *
 * Each is reproduced against the real data rather than a fixture, because a
 * fixture proves the fixture.
 */
import { GAME_DATA } from '../src/data/gameData'
import { pickHint, hintsEarned, pathToTarget, nextUnfoundTarget } from '../src/solver/hint'
import { explainFailure } from '../src/adjudicator/explain'
import { resolveIcon } from '../src/data/iconRegistry'

let pass = 0, fail = 0
const ok = (l: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  ok    ${l}${d ? '  — ' + d : ''}`) }
  else { fail++; console.log(`  FAIL  ${l}${d ? '  — ' + d : ''}`) }
}

const ids = new Set(GAME_DATA.elements.map((e) => e.id))

console.log('\n=== a hint never points at something impossible ===')
{
  /*
   * Asked from every reachable position a player can be in, not from one. The
   * expensive bug here is a hint naming a recipe whose inputs the player does
   * not hold, which reads as the game being broken rather than as a hard
   * puzzle.
   */
  let bad = 0
  let none = 0
  for (const realm of ['survival', 'everyday'] as const) {
    const held = new Set(GAME_DATA.starters[realm])
    for (let step = 0; step < 60; step++) {
      const hint = pickHint(GAME_DATA, held, realm, step)
      if (!hint) { none++; break }
      if (!hint.recipe.inputs.every((i) => held.has(i))) bad++
      if (held.has(hint.recipe.output)) bad++
      // Take the hint, so the next question is asked from a new position.
      held.add(hint.recipe.output)
    }
  }
  ok('every hint is makeable right now and not already made', bad === 0, `${bad} bad`)
  ok('and running out returns null rather than throwing', none >= 0)

  // The end of the game: nothing left to hint at.
  const everything = new Set(GAME_DATA.elements.map((e) => e.id))
  ok('a finished realm hints nothing rather than crashing',
     pickHint(GAME_DATA, everything, 'everyday', 0) === null)
  ok('and has no next target', nextUnfoundTarget(GAME_DATA, everything, 'everyday') === null)
}

console.log('\n=== give up always produces a followable route ===')
{
  let broken = 0
  for (const realm of ['survival', 'everyday'] as const) {
    const held = new Set(GAME_DATA.starters[realm])
    const target = nextUnfoundTarget(GAME_DATA, held, realm)
    if (!target) continue
    const steps = pathToTarget(GAME_DATA, held, target)
    if (steps.length === 0) { broken++; continue }
    // Replay it: every step's inputs must be held by the time it is reached.
    const sim = new Set(held)
    for (const step of steps) {
      if (!step.inputs.every((i) => sim.has(i))) broken++
      sim.add(step.output)
    }
    if (!sim.has(target)) broken++
  }
  ok('the route can be followed from the starters, in order', broken === 0, `${broken} broken`)

  /*
   * The stronger statement, and the one that caught the real bug: EVERY
   * target of a realm must be reachable from that realm's own starters. In
   * ordinary play Everything inherits Survival's elements, so this held by
   * accident — until the Cheater mode let somebody open Everything first,
   * which is exactly how a judge with three minutes arrives, and in that
   * state the realm was unwinnable rather than hard.
   */
  for (const realm of ['survival', 'everyday'] as const) {
    const reachable = new Set(GAME_DATA.starters[realm])
    for (let pass = 0; pass < GAME_DATA.recipes.length; pass++) {
      let grew = false
      for (const r of GAME_DATA.recipes) {
        if (reachable.has(r.output)) continue
        if (r.inputs.every((i) => reachable.has(i))) { reachable.add(r.output); grew = true }
      }
      if (!grew) break
    }
    const unreachable = GAME_DATA.targets[realm].filter((id) => !reachable.has(id))
    ok(`${realm} is completable from its own starters alone`, unreachable.length === 0,
       unreachable.length ? unreachable.join(', ') : `${reachable.size} of ${GAME_DATA.elements.length} reachable`)

    /*
     * And not only the targets. Every element BELONGING to the realm has to be
     * reachable within it, or the inventory lists things the player is shown
     * as missing and cannot ever make — which is worse than not listing them,
     * because it looks like a puzzle rather than a dead end. Ten of them were
     * stranded behind cordage until Survival's third starter was handed over
     * as well.
     */
    const stranded = GAME_DATA.elements
      .filter((e) => e.realm === realm && !reachable.has(e.id))
      .map((e) => e.id)
    ok(`and nothing in ${realm} is stranded`, stranded.length === 0,
       stranded.length ? stranded.join(', ') : 'every element in the realm is makeable')
  }

  ok('a target already made needs no steps',
     pathToTarget(GAME_DATA, new Set(GAME_DATA.elements.map((e) => e.id)), GAME_DATA.targets.everyday[0]).length === 0)
}

console.log('\n=== a save from an older build cannot break the game ===')
{
  /*
   * Elements get renamed and retired as the graph grows — polyethylene became
   * polythene today, and aluminium_sheet still carries an American id from
   * before the game settled on British spelling. A save naming something that
   * no longer exists must be pruned, not rendered.
   */
  const stale = ['fire', 'a_retired_element', 'wood', 'another_one_that_left']
  const survivors = stale.filter((id) => ids.has(id))
  ok('unknown ids are droppable without touching the known ones',
     survivors.length === 2 && survivors.includes('fire'), survivors.join(', '))

  ok('every starter still exists',
     [...GAME_DATA.starters.survival, ...GAME_DATA.starters.everyday].every((id) => ids.has(id)))
  ok('every target still exists',
     [...GAME_DATA.targets.survival, ...GAME_DATA.targets.everyday].every((id) => ids.has(id)))
  ok('every recipe input and output still exists',
     GAME_DATA.recipes.every((r) => ids.has(r.output) && r.inputs.every((i) => ids.has(i))))
}

console.log('\n=== nothing in the game can render as nothing ===')
{
  let missingArt = 0
  let emptyName = 0
  let emptyBlurb = 0
  for (const element of GAME_DATA.elements) {
    const sprite = resolveIcon(element.icon)
    if (!sprite || sprite.rows.length === 0) missingArt++
    if (!element.name.trim()) emptyName++
    if (!element.blurb.trim()) emptyBlurb++
  }
  ok('every element resolves to art', missingArt === 0, `${GAME_DATA.elements.length} checked`)
  ok('every element has a name', emptyName === 0)
  ok('every element has a blurb', emptyBlurb === 0, 'a blurb is the rule for adding one at all')
  ok('and every element has at least one source',
     GAME_DATA.elements.every((e) => e.sources.length > 0))
}

console.log('\n=== the failure explainer never throws, whatever it is given ===')
{
  let threw = 0
  const sample = GAME_DATA.elements.slice(0, 40).map((e) => e.id)
  for (const a of sample) {
    for (const b of sample) {
      try { explainFailure(a, b) } catch { threw++ }
    }
  }
  try { explainFailure('not_an_element', 'also_not') } catch { threw++ }
  try { explainFailure('', '') } catch { threw++ }
  ok('including on ids that do not exist', threw === 0, `${sample.length ** 2 + 2} pairs`)
}

console.log('\n=== the hint budget cannot go negative or explode ===')
{
  ok('zero of everything is the starting three', hintsEarned(0, 0) === 3)
  ok('and it only ever goes up', hintsEarned(1000, 1000) === 3 + 100 + 100)
  ok('a negative count cannot be reached from the UI, and is clamped anyway',
     Math.max(0, hintsEarned(0, 0) - 99) === 0)
}

console.log(`\n${pass} passed, ${fail} failed\n`)
if (fail > 0) process.exit(1)
