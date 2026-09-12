import type { Footprint, RealmId, RecipeData, RecipeDef, Source } from '../data/types'

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

  function validateRealmList(kind: 'Starter' | 'Target', list: Record<RealmId, string[]>) {
    for (const [realm, ids] of Object.entries(list) as [RealmId, string[]][]) {
      for (const id of ids) {
        const el = data.elements.find((e) => e.id === id)
        if (!el) {
          issues.push({ level: 'error', message: `${kind} "${id}" in realm "${realm}" does not exist` })
        } else if (el.realm !== realm) {
          issues.push({
            level: 'error',
            message: `${kind} "${id}" is listed under realm "${realm}" but belongs to "${el.realm}"`,
          })
        }
      }
    }
  }

  validateRealmList('Starter', data.starters)
  validateRealmList('Target', data.targets)

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
 * Fixpoint reachability across the WHOLE graph, not per realm: an element is
 * reachable once some recipe producing it has both inputs already reachable.
 * Ordinary graph BFS doesn't apply because a recipe needs BOTH inputs, not
 * just one incoming edge, so this iterates to a fixpoint instead.
 *
 * This has to be global rather than realm-scoped because cross-realm
 * carryover is a real mechanic (useGameState.allDiscovered), not a
 * theoretical one: Everyday's `sewing_thread` genuinely depends on
 * Survival's `paraffin`. A per-realm closure seeded only from that realm's
 * own starters would report every such dependency as unreachable, which is
 * exactly the bug this used to have.
 */
function computeReachability(data: RecipeData): Set<string> {
  const recipesByOutput = buildRecipesByOutput(data)
  const reachable = new Set(allStarterIds(data))

  let changed = true
  let guard = 0
  while (changed && guard <= data.elements.length + 1) {
    changed = false
    guard++
    for (const el of data.elements) {
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

  return reachable
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

export type FootprintStep = {
  id: string
  name: string
  cost: Footprint
  process: string
}

export type FootprintDetail = {
  total: Footprint
  /** Every ancestor in the dependency tree (including starters), deduped, in visit order. */
  ancestors: { id: string; name: string; isStarter: boolean }[]
  /** Only the steps that carry a nonzero cost — what the receipt highlights. */
  costSteps: FootprintStep[]
  /** Every source cited anywhere in the chain, deduped by URL. */
  sources: Source[]
}

/**
 * Full footprint breakdown for `targetId`, walking its dependency tree
 * exactly once per node. The visited-set guard is the fix for the
 * double-counting bug a naive recursive sum has: if two branches share an
 * ancestor (this seed's `spark`, reachable both directly and via `fire`),
 * only the first visit charges its cost.
 *
 * Returns the full tree, not just the total, so the receipt screen can show
 * its work — which steps carried real numbers, what the whole chain cites —
 * rather than presenting a total as if it fell from the sky.
 */
export function computeFootprintDetail(data: RecipeData, targetId: string): FootprintDetail {
  const recipesByOutput = buildRecipesByOutput(data)
  const starterSet = allStarterIds(data)
  const elementById = new Map(data.elements.map((el) => [el.id, el]))
  const visited = new Set<string>()
  const ancestors: FootprintDetail['ancestors'] = []
  const costSteps: FootprintStep[] = []
  const sourcesSeen = new Set<string>()
  const sources: Source[] = []
  let waterL = 0
  let co2kg = 0

  function addSources(list: Source[]) {
    for (const source of list) {
      if (sourcesSeen.has(source.url)) continue
      sourcesSeen.add(source.url)
      sources.push(source)
    }
  }

  function visit(id: string) {
    if (visited.has(id)) return
    visited.add(id)

    const isStarter = starterSet.has(id)
    ancestors.push({ id, name: elementById.get(id)?.name ?? id, isStarter })
    if (isStarter) return

    const options = recipesByOutput.get(id)
    if (!options || options.length === 0) return

    const recipe = cheapestRoute(options)
    addSources(recipe.sources)
    if (recipe.cost.waterL > 0 || recipe.cost.co2kg > 0) {
      costSteps.push({
        id,
        name: elementById.get(id)?.name ?? id,
        cost: recipe.cost,
        process: recipe.process,
      })
    }
    waterL += recipe.cost.waterL
    co2kg += recipe.cost.co2kg
    for (const input of recipe.inputs) visit(input)
  }

  visit(targetId)

  return {
    total: { waterL, co2kg: Math.round(co2kg * 1e6) / 1e6 },
    ancestors,
    costSteps,
    sources,
  }
}

/** Total footprint only — see computeFootprintDetail for the full breakdown. */
export function computeFootprint(data: RecipeData, targetId: string): Footprint {
  return computeFootprintDetail(data, targetId).total
}

export function runSolver(data: RecipeData): SolverReport {
  const issues = validateReferences(data)

  // Reference errors make every downstream algorithm unsafe to run.
  if (issues.some((i) => i.level === 'error')) {
    return { issues, elements: [], ok: false }
  }

  const recipesByOutput = buildRecipesByOutput(data)
  const starterSet = allStarterIds(data)
  const reachable = computeReachability(data)
  const depths = computeDepths(data)

  for (const cycle of detectCycles(data)) {
    issues.push({ level: 'error', message: `Cycle detected: ${cycle.join(' -> ')}` })
  }

  const consumedIds = new Set(data.recipes.flatMap((r) => r.inputs))
  const targetIds = new Set(Object.values(data.targets).flat())

  const elements: ElementReport[] = data.elements.map((el) => {
    const isReachable = reachable.has(el.id)
    const hasRecipe = starterSet.has(el.id) || (recipesByOutput.get(el.id)?.length ?? 0) > 0

    if (!hasRecipe) {
      issues.push({
        level: 'error',
        message: `"${el.id}" has no recipe and is not a starter — it can never be produced`,
      })
    } else if (!isReachable) {
      issues.push({
        level: 'error',
        message: `"${el.id}" is unreachable — its inputs never all become available across any realm`,
      })
    }

    // A target is *meant* to be terminal — that's not the dead end this warns about.
    if (isReachable && !starterSet.has(el.id) && !consumedIds.has(el.id) && !targetIds.has(el.id)) {
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
      depth: isReachable && depth !== undefined ? depth : null,
      reachable: isReachable,
      footprint: isReachable ? computeFootprint(data, el.id) : null,
    }
  })

  return {
    issues,
    elements,
    ok: !issues.some((i) => i.level === 'error'),
  }
}
