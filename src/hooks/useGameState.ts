import { useCallback, useEffect, useState } from 'react'
import type { RealmId, RecipeData, RecipeDef } from '../data/types'

/** The main game's save. Each world keeps its own under `from-scratch:world:<id>`. */
export const STORAGE_KEY = 'from-scratch:discovered'

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
   * How many of those produced something new, per realm.
   *
   * Counted separately from the discovery total on purpose. "Made" is how much
   * of the realm exists — it includes elements carried over from Survival and
   * anything found before this counter existed — so dividing it by tries gave
   * a hit rate of 300%. A rate needs a numerator and a denominator that count
   * the same events, and these two do.
   */
  successes?: Record<RealmId, number>
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

export function readStorage(key: string = STORAGE_KEY): PersistedState | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return sanitize(JSON.parse(raw))
  } catch {
    // Corrupt or blocked storage (private mode, quota) — start fresh rather
    // than crash the app over save data.
    return null
  }
}

/*
 * EVERY FIELD IS COERCED TO ITS SHAPE, NOT TRUSTED.
 *
 * Parsing was the only check, so a save that was valid JSON but the wrong
 * shape got through: `discovered.everyday` as a string reached
 * `ids.filter(...)` and the whole screen went blank. Found by the review of
 * the worlds, where a world's save is one more thing that can be edited by
 * hand or left behind by an older build; the main save had the same hole.
 *
 * A malformed field falls back to what a new player has, field by field, so
 * one bad value costs that value and not the whole save.
 */
function sanitize(parsed: unknown): PersistedState | null {
  if (!isRecord(parsed) || !isRecord(parsed.discovered)) return null
  const d = parsed.discovered
  return {
    discovered: { survival: strings(d.survival), everyday: strings(d.everyday) },
    routes: isRecord(parsed.routes)
      ? (Object.fromEntries(
          Object.entries(parsed.routes).filter(([, v]) => typeof v === 'string'),
        ) as RouteMap)
      : {},
    hintsSpent: counts(parsed.hintsSpent),
    attempts: counts(parsed.attempts),
    successes: counts(parsed.successes),
    misses: isRecord(parsed.misses)
      ? { survival: strings(parsed.misses.survival), everyday: strings(parsed.misses.everyday) }
      : undefined,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
}

function counts(value: unknown): Record<RealmId, number> | undefined {
  if (!isRecord(value)) return undefined
  const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0)
  return { survival: n(value.survival), everyday: n(value.everyday) }
}

function writeStorage(key: string, state: PersistedState) {
  try {
    localStorage.setItem(key, JSON.stringify(state))
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

/*
 * `storageKey` is fixed for the life of the hook. A world mounts its own
 * instance under its own key, keyed in React by the world's id, so leaving one
 * planet for another unmounts this rather than pointing a live hook at a
 * different save — which would write world A's state into world B's slot on
 * the first render.
 */
export function useGameState(data: RecipeData, storageKey: string = STORAGE_KEY) {
  const [key] = useState(storageKey)
  const [recipeIndex] = useState(() => buildRecipeIndex(data))

  const [discovered, setDiscovered] = useState<StoredState>(() => {
    const stored = readStorage(key)?.discovered
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
  const [routes, setRoutes] = useState<RouteMap>(() => readStorage(key)?.routes ?? {})

  /*
   * Hints spent, per realm. See the note on PersistedState: the balance is
   * derived from this and the discovery count, never stored.
   */
  const [hintsSpent, setHintsSpent] = useState<Record<RealmId, number>>(
    () => readStorage(key)?.hintsSpent ?? { survival: 0, everyday: 0 },
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
    () => readStorage(key)?.attempts ?? { survival: 0, everyday: 0 },
  )

  const countAttempt = useCallback((realm: RealmId) => {
    setAttempts((prev) => ({ ...prev, [realm]: (prev[realm] ?? 0) + 1 }))
  }, [])

  const [successes, setSuccesses] = useState<Record<RealmId, number>>(
    () => readStorage(key)?.successes ?? { survival: 0, everyday: 0 },
  )

  const countSuccess = useCallback((realm: RealmId) => {
    setSuccesses((prev) => ({ ...prev, [realm]: (prev[realm] ?? 0) + 1 }))
  }, [])

  /*
   * The distinct dead pairs, per realm. A Set would be the natural shape and
   * an array is what survives JSON, so it is stored as one and deduped on the
   * way in.
   */
  const [misses, setMisses] = useState<Record<RealmId, string[]>>(
    () => readStorage(key)?.misses ?? { survival: [], everyday: [] },
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
    writeStorage(key, { discovered, routes, hintsSpent, attempts, successes, misses })
  }, [key, discovered, routes, hintsSpent, attempts, successes, misses])

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
    setSuccesses({ survival: 0, everyday: 0 })
    setMisses({ survival: [], everyday: [] })
  }, [data.starters])

  return { discovered, allDiscovered, isDiscovered, combine, reset, routes, hintsSpent, spendHint, attempts, countAttempt, successes, countSuccess, misses, countMiss }
}
