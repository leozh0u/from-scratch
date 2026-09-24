import type { RealmId, RecipeData } from '../data/types'

/*
 * WHAT A REALM'S SHELF CAN HOLD.
 *
 * Survival's shelf is everything that can be MADE from Survival's own
 * starters, found by walking the recipes, and not everything whose `realm`
 * field says survival. Those were the same set until the bulk batches added
 * Everything recipes that happen to take only Survival inputs: bark and fire
 * make wood ash. `combine` does not know which realm you are standing in, so
 * the discovery card opened, the save recorded it, and the shelf, filtering on
 * the field, hid it. Leo: "sometimes you unlock items in survival and they
 * don't show up."
 *
 * Deriving the shelf from the graph makes that impossible rather than
 * unlikely. Anything the bench can make here is, by construction, something
 * the shelf shows. It also still keeps the tutorial clean, which is what the
 * filter was for: bauxite and soda ash cannot be made from stone, wood and
 * plant fibre, so they never reach it.
 *
 * Everything shows everything.
 */
const reachCache = new WeakMap<RecipeData, Set<string>>()

export function survivalReach(data: RecipeData): Set<string> {
  const cached = reachCache.get(data)
  if (cached) return cached

  const reach = new Set(data.starters.survival)
  for (let grew = true; grew; ) {
    grew = false
    for (const recipe of data.recipes) {
      if (reach.has(recipe.output)) continue
      if (reach.has(recipe.inputs[0]) && reach.has(recipe.inputs[1])) {
        reach.add(recipe.output)
        grew = true
      }
    }
  }
  reachCache.set(data, reach)
  return reach
}

/** Whether `id` belongs on `realm`'s shelf. The one rule every shelf, hint and counter uses. */
export function inRealm(data: RecipeData, realm: RealmId, id: string): boolean {
  return realm === 'everyday' || survivalReach(data).has(id)
}
