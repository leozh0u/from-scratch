import { useCallback, useEffect, useState } from 'react'
import type { RealmId, RecipeData, RecipeDef } from '../data/types'

const STORAGE_KEY = 'from-scratch:discovered'

type StoredState = Record<RealmId, string[]>
/** Which route produced an element, for the (usually few) ids with more than one real recipe. */
type RouteMap = Record<string, string | undefined>

type PersistedState = {
  discovered: StoredState
  routes: RouteMap
  /**
   * How many hints have been SPENT, per realm. Not how many are left.
   *
   * Storing the spend rather than the balance is what makes the budget grow
   * correctly: earned hints go up as the player discovers more, and a stored
   * balance would have to be topped up on every discovery and would drift the
   * moment the earning rule changed. Spend is a fact; balance is derived.
   */
  hintsSpent?: Record<RealmId, number>
  /** How many combines have been pressed, per realm. Shown as a stat. */
  attempts?: Record<RealmId, number>
  /**
   * Distinct pairs that were tried and produced nothing, per realm.
   *
   * Stored as pair keys rather than a count, because the count has to ignore
   * repeats and there is no way to know whether a pair is a repeat without
   * remembering which ones have been seen. Leo: "every 10 failed tries gives a
   * hint. but only if its not repeated" — otherwise pressing combine on the
   * same dead pair ten times is a hint, which is not a game, it is a button.
   */
  misses?: Record<RealmId, string[]>
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

  /*
   * Hints spent, per realm. See the note on PersistedState: the balance is
   * derived from this and the discovery count, never stored.
   */
  const [hintsSpent, setHintsSpent] = useState<Record<RealmId, number>>(
    () => readStorage()?.hintsSpent ?? { survival: 0, everyday: 0 },
  )

  const spendHint = useCallback((realm: RealmId) => {
    setHintsSpent((prev) => ({ ...prev, [realm]: (prev[realm] ?? 0) + 1 }))
  }, [])

  /*
   * Tries, per realm. Counted here rather than in the component because a
   * component's ref is gone the moment you walk back to the title screen, and
   * a number that resets when you leave the room is not a statistic.
   */
  const [attempts, setAttempts] = useState<Record<RealmId, number>>(
    () => readStorage()?.attempts ?? { survival: 0, everyday: 0 },
  )

  const countAttempt = useCallback((realm: RealmId) => {
    setAttempts((prev) => ({ ...prev, [realm]: (prev[realm] ?? 0) + 1 }))
  }, [])

  /*
   * The distinct dead pairs, per realm. A Set would be the natural shape and
   * an array is what survives JSON, so it is stored as one and deduped on the
   * way in.
   */
  const [misses, setMisses] = useState<Record<RealmId, string[]>>(
    () => readStorage()?.misses ?? { survival: [], everyday: [] },
  )

  const countMiss = useCallback((realm: RealmId, a: string, b: string) => {
    const key = pairKey(a, b)
    setMisses((prev) => {
      const seen = prev[realm] ?? []
      if (seen.includes(key)) return prev
      return { ...prev, [realm]: [...seen, key] }
    })
  }, [])

  useEffect(() => {
    writeStorage({ discovered, routes, hintsSpent, attempts, misses })
  }, [discovered, routes, hintsSpent, attempts, misses])

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
  /*
   * DEDUPED, BECAUSE AN ELEMENT CAN NOW BE SEEDED INTO BOTH REALMS.
   *
   * "Discovered" is one global fact per element id — the two lists are only
   * bookkeeping for which realm a new find belongs to. That distinction was
   * invisible until Survival's three starters were also listed as Everything's,
   * so they were seeded into both arrays and the Survival shelf showed stone,
   * wood and plant fibre twice.
   *
   * A Set rather than a filter on the concatenation, so this stays linear as
   * the graph grows past two hundred.
   */
  const allDiscovered = useCallback(
    () => [...new Set([...discovered.survival, ...discovered.everyday])],
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
    setHintsSpent({ survival: 0, everyday: 0 })
    setAttempts({ survival: 0, everyday: 0 })
    setMisses({ survival: [], everyday: [] })
  }, [data.starters])

  return { discovered, allDiscovered, isDiscovered, combine, reset, routes, hintsSpent, spendHint, attempts, countAttempt, misses, countMiss }
}
