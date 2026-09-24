import { GAME_DATA } from '../data/gameData'
import type { RecipeData } from '../data/types'
import { WORLDS, type WorldDef } from '../data/worlds'
import { readStorage } from '../hooks/useGameState'
import { pathToTarget, type Step } from '../solver/hint'

/*
 * A WORLD RUNS ON SURVIVAL'S RULES, NOT ON NEW ONES.
 *
 * The Workspace already knows how to run a realm with a few starters, three
 * targets and a shelf limited to what those starters can make: that is
 * Survival. So a world is handed to it as a RecipeData whose Survival slot
 * holds the world's starters and targets, and the shelf, the target strip,
 * the hints and the give-up route all work unchanged. The graph itself is the
 * same object; only the starting point and the finish line differ.
 *
 * Cached per world, because this object is an effect dependency in the
 * Workspace and the key of the shelf's reach cache. A fresh one every render
 * would restart the demo drivers and recompute the reach each time.
 */
const dataCache = new Map<string, RecipeData>()

export function worldData(world: WorldDef): RecipeData {
  let data = dataCache.get(world.id)
  if (!data) {
    data = {
      ...GAME_DATA,
      starters: { survival: [...world.starters], everyday: [...world.starters] },
      targets: { survival: [...world.targets], everyday: [] },
    }
    dataCache.set(world.id, data)
  }
  return data
}

const PREFIX = 'from-scratch:world:'

export function worldStorageKey(world: WorldDef): string {
  return `${PREFIX}${world.id}`
}

/**
 * Every step still standing between `held` and the whole kit, in an order you
 * could follow: each target's give-up route in turn, each one starting from
 * what the routes before it will already have made.
 */
export function kitSteps(world: WorldDef, held: Set<string>): Step[] {
  const data = worldData(world)
  const have = new Set(held)
  const steps: Step[] = []
  for (const target of world.targets) {
    for (const step of pathToTarget(data, have, target)) {
      steps.push(step)
      have.add(step.output)
    }
  }
  return steps
}

const sizeCache = new Map<string, number>()

/**
 * How many things the kit takes to make from the world's own starters, by the
 * shortest road. This is the "made" counter's denominator, and it is a number
 * of CRAFTS, not of things reachable: from stone, wood and fire you can make a
 * great deal that has nothing to do with football.
 */
export function kitSize(world: WorldDef): number {
  let size = sizeCache.get(world.id)
  if (size === undefined) {
    size = kitSteps(world, new Set(world.starters)).length
    sizeCache.set(world.id, size)
  }
  return size
}

/**
 * The kit's parts, starters included: what Cheater lays on the bench in a
 * world. The whole reach of iron, fire and water is hundreds of tiles, which
 * would bury the three things the planet is about.
 */
export function kitParts(world: WorldDef): string[] {
  const steps = kitSteps(world, new Set(world.starters))
  return [...new Set([...world.starters, ...steps.map((step) => step.output)])]
}

/** What the picker shows under each planet, read straight from the save. */
export function readWorldProgress(world: WorldDef): { found: number; started: boolean } {
  const saved = readStorage(worldStorageKey(world))?.discovered
  if (!saved) return { found: 0, started: false }
  const held = new Set([...(saved.survival ?? []), ...(saved.everyday ?? [])])
  const found = world.targets.filter((id) => held.has(id)).length
  const started = [...held].some((id) => !world.starters.includes(id))
  return { found, started }
}

/*
 * START OVER MEANS EVERY PLANET TOO.
 *
 * The title screen's reset has one meaning, and a control that leaves five
 * saves behind is one nobody can predict. The keys are collected first and
 * removed after, because removing while walking `localStorage` by index skips
 * the one that slides into the gap. Anything under the prefix goes, which also
 * clears the save of a world a later build no longer has.
 */
export function clearWorldSaves() {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(PREFIX)) keys.push(key)
    }
    for (const key of keys) localStorage.removeItem(key)
  } catch {
    // Blocked storage has nothing in it to clear.
  }
}

export { WORLDS }
