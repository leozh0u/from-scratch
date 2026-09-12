import type { Footprint, RealmId, RecipeData, RecipeDef } from '../data/types'

export type IssueLevel = 'error' | 'warning'

export type SolverIssue = {
  level: IssueLevel
  message: string
}

export type ElementReport = {
  id: string
  name: string
  realm: RealmId
  /** Minimum crafting depth from that realm's starters; null if unreachable. */
  depth: number | null
  reachable: boolean
  /** Deduped footprint of the cheapest route to this element; null if unreachable. */
  footprint: Footprint | null
}

export type SolverReport = {
  issues: SolverIssue[]
  elements: ElementReport[]
  /** False if any issue is error-level. Warnings (e.g. dead ends) don't fail the build. */
  ok: boolean
}

function buildRecipesByOutput(data: RecipeData): Map<string, RecipeDef[]> {
  const map = new Map<string, RecipeDef[]>()
  for (const recipe of data.recipes) {
    const list = map.get(recipe.output) ?? []
    list.push(recipe)
    map.set(recipe.output, list)
  }
  return map
}

function allStarterIds(data: RecipeData): Set<string> {
  return new Set(Object.values(data.starters).flat())
}

/**
 * Reference integrity: every id a recipe or starter list mentions has to
 * exist and, for starters, has to belong to the realm claiming it. Run this
 * before anything else — the graph algorithms below assume it already holds.
 */
function validateReferences(data: RecipeData): SolverIssue[] {
  const issues: SolverIssue[] = []
  const elementIds = new Set(data.elements.map((el) => el.id))

  const seen = new Set<string>()
  for (const el of data.elements) {
    if (seen.has(el.id)) {
      issues.push({ level: 'error', message: `Duplicate element id "${el.id}"` })
    }
    seen.add(el.id)
  }

  for (const recipe of data.recipes) {
    for (const id of [...recipe.inputs, recipe.output]) {
      if (!elementIds.has(id)) {
        issues.push({
          level: 'error',
          message: `Recipe for "${recipe.output}" references unknown element "${id}"`,
        })
      }
    }
  }

  for (const [realm, ids] of Object.entries(data.starters) as [RealmId, string[]][]) {
    for (const id of ids) {
      const el = data.elements.find((e) => e.id === id)
      if (!el) {
        issues.push({ level: 'error', message: `Starter "${id}" in realm "${realm}" does not exist` })
      } else if (el.realm !== realm) {
        issues.push({
          level: 'error',
          message: `Starter "${id}" is listed under realm "${realm}" but belongs to "${el.realm}"`,
        })
      }
    }
  }

  return issues
}

/**
 * True dependency cycles (A needs B, B needs A) make both permanently
 * unreachable, which reachability alone reports as "unreachable" — accurate
 * but not diagnostic. This walks the plain input->output digraph so a cycle
 * gets its own, more useful message.
 */
function detectCycles(data: RecipeData): string[][] {
  const dependents = new Map<string, string[]>()
  for (const recipe of data.recipes) {
    for (const input of recipe.inputs) {
      const list = dependents.get(input) ?? []
      list.push(recipe.output)
      dependents.set(input, list)
    }
  }

  const cycles: string[][] = []
  const WHITE = 0
  const GRAY = 1
  const BLACK = 2
  const color = new Map<string, number>()
  const path: string[] = []

  function visit(id: string) {
    color.set(id, GRAY)
    path.push(id)

    for (const next of dependents.get(id) ?? []) {
      const state = color.get(next) ?? WHITE
      if (state === WHITE) {
        visit(next)
      } else if (state === GRAY) {
        const start = path.indexOf(next)
        cycles.push([...path.slice(start), next])
      }
    }

    path.pop()
    color.set(id, BLACK)
  }

  for (const el of data.elements) {
    if ((color.get(el.id) ?? WHITE) === WHITE) visit(el.id)
  }

  return cycles
}

/**
 * Fixpoint reachability per realm: an element is reachable once some recipe
 * producing it has both inputs already reachable. Ordinary graph BFS doesn't
 * apply because a recipe needs BOTH inputs, not just one incoming edge, so
 * this iterates to a fixpoint instead.
 */
function computeReachability(data: RecipeData): Map<RealmId, Set<string>> {
  const recipesByOutput = buildRecipesByOutput(data)
  const result = new Map<RealmId, Set<string>>()

  for (const [realm, starters] of Object.entries(data.starters) as [RealmId, string[]][]) {
    const reachable = new Set(starters)
    const realmElements = data.elements.filter((el) => el.realm === realm)

    let changed = true
    let guard = 0
    while (changed && guard <= realmElements.length + 1) {
      changed = false
      guard++
      for (const el of realmElements) {
        if (reachable.has(el.id)) continue
        const options = recipesByOutput.get(el.id) ?? []
        const craftable = options.some(
          (r) => reachable.has(r.inputs[0]) && reachable.has(r.inputs[1]),
        )
        if (craftable) {
          reachable.add(el.id)
          changed = true
        }
      }
    }

    result.set(realm, reachable)
  }

  return result
}

/**
 * Minimum crafting depth per element, via relaxation rather than a single
 * topological pass: when an element has more than one route, depth has to
 * take the shallowest, and relaxation converges to that without needing to
 * pick a route up front.
 */
function computeDepths(data: RecipeData): Map<string, number> {
  const depth = new Map<string, number>()

  for (const id of allStarterIds(data)) depth.set(id, 0)

  let changed = true
  let guard = 0
  while (changed && guard <= data.elements.length + 1) {
    changed = false
    guard++
    for (const recipe of data.recipes) {
      const [a, b] = recipe.inputs
      if (!depth.has(a) || !depth.has(b)) continue
      const candidate = Math.max(depth.get(a)!, depth.get(b)!) + 1
      const current = depth.get(recipe.output)
      if (current === undefined || candidate < current) {
        depth.set(recipe.output, candidate)
        changed = true
      }
    }
  }

  return depth
}

/** Among alternate routes to the same output, the cheapest by CO2 then water. */
function cheapestRoute(options: RecipeDef[]): RecipeDef {
  return options.reduce((best, r) =>
    r.cost.co2kg < best.cost.co2kg ||
    (r.cost.co2kg === best.cost.co2kg && r.cost.waterL < best.cost.waterL)
      ? r
      : best,
  )
}

/**
 * Total footprint to craft `targetId`, walking its dependency tree exactly
 * once per node. The visited-set guard is the fix for the double-counting
 * bug a naive recursive sum has: if two branches share an ancestor (this
 * seed's `spark`, reachable both directly and via `fire`), only the first
 * visit charges its cost.
 */
export function computeFootprint(data: RecipeData, targetId: string): Footprint {
  const recipesByOutput = buildRecipesByOutput(data)
  const starterSet = allStarterIds(data)
  const visited = new Set<string>()
  let waterL = 0
  let co2kg = 0

  function visit(id: string) {
    if (visited.has(id)) return
    visited.add(id)
    if (starterSet.has(id)) return

    const options = recipesByOutput.get(id)
    if (!options || options.length === 0) return

    const recipe = cheapestRoute(options)
    waterL += recipe.cost.waterL
    co2kg += recipe.cost.co2kg
    for (const input of recipe.inputs) visit(input)
  }

  visit(targetId)
  return { waterL, co2kg: Math.round(co2kg * 1e6) / 1e6 }
}

export function runSolver(data: RecipeData): SolverReport {
  const issues = validateReferences(data)

  // Reference errors make every downstream algorithm unsafe to run.
  if (issues.some((i) => i.level === 'error')) {
    return { issues, elements: [], ok: false }
  }

  const recipesByOutput = buildRecipesByOutput(data)
  const starterSet = allStarterIds(data)
  const reachabilityByRealm = computeReachability(data)
  const depths = computeDepths(data)

  for (const cycle of detectCycles(data)) {
    issues.push({ level: 'error', message: `Cycle detected: ${cycle.join(' -> ')}` })
  }

  const consumedIds = new Set(data.recipes.flatMap((r) => r.inputs))

  const elements: ElementReport[] = data.elements.map((el) => {
    const reachable =
      starterSet.has(el.id) || (reachabilityByRealm.get(el.realm)?.has(el.id) ?? false)
    const hasRecipe = starterSet.has(el.id) || (recipesByOutput.get(el.id)?.length ?? 0) > 0

    if (!hasRecipe) {
      issues.push({
        level: 'error',
        message: `"${el.id}" has no recipe and is not a starter — it can never be produced`,
      })
    } else if (!reachable) {
      issues.push({
        level: 'error',
        message: `"${el.id}" is unreachable from ${el.realm}'s starters (inputs never all become available)`,
      })
    }

    if (reachable && !starterSet.has(el.id) && !consumedIds.has(el.id)) {
      issues.push({
        level: 'warning',
        message: `"${el.id}" is a dead end — nothing in the game consumes it`,
      })
    }

    const depth = depths.get(el.id)

    return {
      id: el.id,
      name: el.name,
      realm: el.realm,
      depth: reachable && depth !== undefined ? depth : null,
      reachable,
      footprint: reachable ? computeFootprint(data, el.id) : null,
    }
  })

  return {
    issues,
    elements,
    ok: !issues.some((i) => i.level === 'error'),
  }
}
