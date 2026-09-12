import { useCallback, useEffect, useState } from 'react'
import type { RealmId, RecipeData, RecipeDef } from '../data/types'

const STORAGE_KEY = 'from-scratch:discovered'

type StoredState = Record<RealmId, string[]>
/** Which route produced an element, for the (usually few) ids with more than one real recipe. */
type RouteMap = Record<string, string | undefined>

type PersistedState = {
  discovered: StoredState
  routes: RouteMap
}

function readStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Pre-route-tracking saves lack `.discovered` — treat as absent rather
    // than crash on a shape from before this field existed.
    if (!parsed?.discovered) return null
    return parsed as PersistedState
  } catch {
    // Corrupt or blocked storage (private mode, quota) — start fresh rather
    // than crash the app over save data.
    return null
  }
}

function writeStorage(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Best-effort. A failed save shouldn't break the current session.
  }
}

/** Order-independent lookup key for a recipe's two inputs. */
function pairKey(a: string, b: string): string {
  return [a, b].sort().join('+')
}

function buildRecipeIndex(data: RecipeData): Map<string, RecipeDef> {
  const index = new Map<string, RecipeDef>()
  for (const recipe of data.recipes) {
    index.set(pairKey(recipe.inputs[0], recipe.inputs[1]), recipe)
  }
  return index
}

export type CombineResult =
  | { status: 'discovered'; recipe: RecipeDef; alreadyKnown: false }
  | { status: 'already-known'; recipe: RecipeDef; alreadyKnown: true }
  | { status: 'no-match' }

export function useGameState(data: RecipeData) {
  const [recipeIndex] = useState(() => buildRecipeIndex(data))

  const [discovered, setDiscovered] = useState<StoredState>(() => {
    const stored = readStorage()?.discovered
    /*
     * A save from an older build can name elements this build no longer has.
     * The rebuild from three starters retired a dozen ids, and anyone who
     * played the previous version still has them in localStorage — including,
     * potentially, a judge who opened the link this morning. Unknown ids are
     * dropped rather than trusted, and the realm's starters are folded back in
     * so a pruned save can never leave someone with an empty shelf and no way
     * to combine anything.
     */
    const known = new Set(data.elements.map((el) => el.id))
    const clean = (ids: string[] | undefined, starters: string[]) => {
      const kept = (ids ?? []).filter((id) => known.has(id))
      return [...new Set([...starters, ...kept])]
    }
    return {
      survival: clean(stored?.survival, data.starters.survival),
      everyday: clean(stored?.everyday, data.starters.everyday),
    }
  })

  // Only ever gets an entry for ids with more than one real recipe (see
  // `combine` below) — most elements never appear here at all.
  const [routes, setRoutes] = useState<RouteMap>(() => readStorage()?.routes ?? {})

  useEffect(() => {
    writeStorage({ discovered, routes })
  }, [discovered, routes])

  const isDiscovered = useCallback(
    (elementId: string) =>
      discovered.survival.includes(elementId) || discovered.everyday.includes(elementId),
    [discovered],
  )

  /*
   * Flattened across every realm, not scoped to one. "Discovered" is a single
   * global fact per element id — each id has exactly one home realm and one
   * recipe set, so the survival/everyday split above is just storage
   * bookkeeping (which array a new discovery lands in), not a real per-realm
   * distinction. A player who found paraffin in Survival needs it selectable
   * while working in Everyday — that's the cross-realm carryover the concept
   * is built on ("one graph viewed through four windows"), so anything less
   * than a full union silently breaks it.
   */
  const allDiscovered = useCallback(
    () => [...discovered.survival, ...discovered.everyday],
    [discovered],
  )

  /**
   * Attempts to combine two elements. Elements carry over across realms (one
   * graph, two windows) — a match is found by input pair regardless of which
   * realm the player is currently in, and the result lands in its own
   * recipe's realm rather than the player's current one.
   */
  const combine = useCallback(
    (inputA: string, inputB: string): CombineResult => {
      const recipe = recipeIndex.get(pairKey(inputA, inputB))
      if (!recipe) return { status: 'no-match' }

      if (isDiscovered(recipe.output)) {
        return { status: 'already-known', recipe, alreadyKnown: true }
      }

      const outputRealm = data.elements.find((el) => el.id === recipe.output)?.realm
      if (!outputRealm) return { status: 'no-match' }

      setDiscovered((prev) => ({
        ...prev,
        [outputRealm]: [...prev[outputRealm], recipe.output],
      }))

      // Record which route the player actually took — needed the moment an
      // output has more than one real recipe (e.g. virgin vs recycled
      // cotton), since the receipt has to reflect what happened, not a
      // solver-computed "cheapest" guess that may not match at all.
      if (recipe.route !== undefined) {
        setRoutes((prev) => ({ ...prev, [recipe.output]: recipe.route }))
      }

      return { status: 'discovered', recipe, alreadyKnown: false }
    },
    [recipeIndex, isDiscovered, data.elements],
  )

  const reset = useCallback(() => {
    const fresh: StoredState = {
      survival: [...data.starters.survival],
      everyday: [...data.starters.everyday],
    }
    setDiscovered(fresh)
    setRoutes({})
  }, [data.starters])

  return { discovered, allDiscovered, isDiscovered, combine, reset, routes }
}
