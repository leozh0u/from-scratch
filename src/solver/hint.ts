import type { RealmId, RecipeData, RecipeDef } from '../data/types'

/**
 * Hints, and the rule that the model never gives one.
 *
 * WHY THE SOLVER AND NOT GEMINI
 *
 * A hint is a claim about the game's own graph — "these two make something" —
 * and the one thing the runtime model is never allowed to know is the graph.
 * That is the fence the whole project rests on: the endpoints receive two
 * names and could not name a real recipe if they tried. Asking a model for a
 * hint would hand it exactly the job the architecture exists to keep it out
 * of, and it would be wrong often, which in a game whose claim is that
 * nothing is invented is the worst possible place to be wrong.
 *
 * So the solver picks. It has the recipe list, it is deterministic, and it is
 * never wrong.
 *
 * WHAT A HINT ACTUALLY IS
 *
 * Not the answer. A hint names ONE of the two inputs of something the player
 * could make right now, and says what kind of thing comes out. That is enough
 * to turn 2,000 pairs into about thirty, which is the difference between
 * searching and guessing, and it still leaves the player the discovery.
 *
 * It only ever points at a recipe whose BOTH inputs are already in the
 * inventory. A hint about something unreachable is not a hint, it is a
 * complaint.
 */

export type Hint = {
  /** One of the two inputs, by id. */
  knownInput: string
  /** The recipe being pointed at, so the caller can check it was taken. */
  recipe: RecipeDef
  /** What kind of thing comes out — never its name. */
  shape: string
}

/**
 * Deterministic, given the same inventory and the same counter.
 *
 * Not random: pressing hint twice in a row and getting the same nudge is
 * correct behaviour, because nothing about the world changed between the two
 * presses. The counter moves the choice on only when the player has actually
 * spent a hint.
 */
export function pickHint(
  data: RecipeData,
  discoveredIds: Set<string>,
  realm: RealmId,
  nth: number,
): Hint | null {
  const byId = new Map(data.elements.map((e) => [e.id, e]))

  const reachable = data.recipes.filter((recipe) => {
    if (discoveredIds.has(recipe.output)) return false
    if (!recipe.inputs.every((id) => discoveredIds.has(id))) return false
    /*
     * Survival only hints at Survival. The realms share one graph and the
     * tutorial deliberately shows only its own elements, so a hint naming
     * bauxite in the opening chapter would point at a tile that is not on
     * the screen.
     */
    const output = byId.get(recipe.output)
    if (!output) return false
    return realm === 'everyday' || output.realm === 'survival'
  })

  if (reachable.length === 0) return null

  /*
   * Shallowest first: of everything makeable right now, point at the one
   * whose output has the fewest onward uses, because that is the end of a
   * branch and least likely to be something the player was about to find
   * anyway. Ties broken by id so the order is stable across runs.
   */
  const onwardUses = new Map<string, number>()
  for (const recipe of data.recipes) {
    for (const id of recipe.inputs) onwardUses.set(id, (onwardUses.get(id) ?? 0) + 1)
  }
  const ordered = [...reachable].sort((a, b) => {
    const ua = onwardUses.get(a.output) ?? 0
    const ub = onwardUses.get(b.output) ?? 0
    if (ua !== ub) return ua - ub
    return a.output.localeCompare(b.output)
  })

  const recipe = ordered[nth % ordered.length]
  // The input the player is LESS likely to have thought of: the one used in
  // fewer recipes. Naming the obvious one is not a hint.
  const [x, y] = recipe.inputs
  const knownInput = (onwardUses.get(x) ?? 0) <= (onwardUses.get(y) ?? 0) ? x : y

  return { knownInput, recipe, shape: describe(byId.get(recipe.output)?.realm) }
}

/**
 * What comes out, without saying what it is.
 *
 * Deliberately vague, and vague in a way that is still true. "Something new"
 * would be useless; the element's own name would be the answer.
 */
function describe(realm: RealmId | undefined): string {
  return realm === 'survival' ? 'something you can use' : 'something further along'
}

/**
 * How many hints the player has earned in total.
 *
 * Three to start, then one for every ten discoveries AND one for every ten
 * DISTINCT dead ends. Leo asked for the second: "every 10 failed tries gives a
 * hint. but only if its not repeated."
 *
 * The repeat rule is the whole thing. Without it, pressing combine on the same
 * dead pair ten times earns a hint, which makes the button the game. With it,
 * the currency is genuinely trying things — and since over 97% of pairs do
 * nothing, a player who is exploring properly earns hints faster than one who
 * is stuck and mashing, which is the right way round.
 *
 * Earning from failure matters more than earning from success. A player who is
 * finding things does not need help; a player who has tried thirty pairs and
 * found nothing does, and under the discovery rule alone they would earn
 * nothing at all.
 */
export const STARTING_HINTS = 3
export const FOUND_PER_HINT = 10
export const MISSES_PER_HINT = 10

export function hintsEarned(foundCount: number, distinctMisses = 0): number {
  return (
    STARTING_HINTS +
    Math.floor(foundCount / FOUND_PER_HINT) +
    Math.floor(distinctMisses / MISSES_PER_HINT)
  )
}

/**
 * Every step still missing between here and a target, in an order you could
 * actually follow.
 *
 * This is what "give up" shows. It is generated from the recipe graph rather
 * than written down anywhere, so it cannot go stale as the graph grows, and it
 * is ordered the way the walkthrough is: a step only appears once both of its
 * inputs are either already held or produced by an earlier step in the list.
 *
 * It deliberately does not wipe anything. Being shown the answer is already
 * the cost; deleting what the player made on top of that is a punishment for
 * asking, and there is no fail state here to be sent back to.
 */
export type Step = { inputs: [string, string]; output: string; process: string }

export function pathToTarget(
  data: RecipeData,
  discoveredIds: Set<string>,
  targetId: string,
): Step[] {
  const byOutput = new Map<string, RecipeDef[]>()
  for (const recipe of data.recipes) {
    byOutput.set(recipe.output, [...(byOutput.get(recipe.output) ?? []), recipe])
  }

  const held = new Set(discoveredIds)
  const steps: Step[] = []
  const building = new Set<string>()

  /*
   * Depth first, cheapest branch first, with `building` guarding against a
   * graph that has somehow gained a cycle. The solver already rejects cyclic
   * data at build time; this is belt and braces, because a stack overflow
   * inside a help feature is a worse failure than an incomplete answer.
   */
  function make(id: string): boolean {
    if (held.has(id)) return true
    if (building.has(id)) return false
    const routes = byOutput.get(id)
    if (!routes || routes.length === 0) return false

    building.add(id)
    for (const recipe of routes) {
      if (recipe.inputs.every((input) => make(input))) {
        building.delete(id)
        held.add(id)
        steps.push({
          inputs: [recipe.inputs[0], recipe.inputs[1]],
          output: id,
          process: recipe.process,
        })
        return true
      }
    }
    building.delete(id)
    return false
  }

  return make(targetId) ? steps : []
}

/** The target a "give up" should answer about: the first one not yet found. */
export function nextUnfoundTarget(
  data: RecipeData,
  discoveredIds: Set<string>,
  realm: RealmId,
): string | null {
  return data.targets[realm].find((id) => !discoveredIds.has(id)) ?? null
}
