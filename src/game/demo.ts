/**
 * The game, playing itself, for the camera.
 *
 * WHY THIS EXISTS
 *
 * Leo, on the demo video: *"after the fun intro, for the demo, i think we can
 * play a bit, then time lapse finishing the game, or going far. like very very
 * speedy time lapse."*
 *
 * The obvious way to get that shot is to record a real session and speed the
 * footage up in the edit. That is hours of clicking for thirty seconds of
 * video, and it produces a timelapse of somebody using a mouse — the cursor
 * jumping, the scroll position lurching, the recorder's own chrome in frame.
 *
 * Driving the game from its own recipe graph is better on every count. It is
 * genuinely the game playing, not a rendered animation of it, so every tile
 * that appears is a real discovery through the real code path. It runs at
 * whatever speed the shot wants. And it is repeatable, which matters more than
 * it sounds when the take has to be re-shot because the room was too bright.
 *
 * WHAT IT IS NOT
 *
 * It is not a cheat and it does not touch the graph. It picks pairs the player
 * could have picked, in an order the player could have found, and presses the
 * same button. Everything it discovers, it discovered.
 *
 *   ?demo=1&ms=250             slow enough to read, for the "play a bit" shot
 *   ?demo=1&ms=40&batch=12     the timelapse: a full realm in under a minute
 *   ?demo=1&stop=200           stop after 200 discoveries
 *
 * Inert without the parameter, so nothing about the normal game changes.
 */
import type { RecipeData, RecipeDef } from '../data/types'

export type DemoSettings = {
  on: boolean
  /** Milliseconds between discoveries. */
  ms: number
  /** Stop after this many, or Infinity. */
  stop: number
  /**
   * Discoveries per tick.
   *
   * One per tick is the readable speed and it is also the SLOW one, for a
   * reason that is not obvious: the cost is not finding the next pair, it is
   * React re-rendering an inventory grid that is on its way to nine hundred
   * tiles. At 200 tiles that capped the rate near three a second, which is
   * five minutes of footage for a full run.
   *
   * Making several discoveries inside one tick collapses them into one render.
   * On camera the tiles arrive in bursts, and above about ten a second a burst
   * is indistinguishable from a stream.
   */
  batch: number
}

export const DEMO_DEFAULT_MS = 40

export function readDemoSettings(search: string): DemoSettings {
  const params = new URLSearchParams(search)
  const raw = params.get('demo')
  const on = raw !== null && raw !== '0' && raw !== 'false'
  if (!on) return { on: false, ms: DEMO_DEFAULT_MS, stop: Infinity, batch: 1 }

  /*
   * Clamped rather than trusted. A zero here is an infinite loop inside a
   * timer and a negative one is the same thing with a confusing stack trace,
   * and this reads from a query string, which is the least trustworthy input
   * in the browser.
   */
  const ms = clamp(Number(params.get('ms')) || DEMO_DEFAULT_MS, 8, 5_000)
  const parsedStop = Number(params.get('stop'))
  const stop = Number.isFinite(parsedStop) && parsedStop > 0 ? Math.floor(parsedStop) : Infinity
  const batch = Math.floor(clamp(Number(params.get('batch')) || 1, 1, 50))
  return { on: true, ms, stop, batch }
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value))
}

/**
 * The next pair worth pressing: something makeable now that has not been made.
 *
 * Shallowest-useful-first, by preferring an output that is itself an input to
 * something else. That is what makes the inventory fill outward in waves
 * rather than chasing one chain to its end and stalling — and on camera, a
 * grid filling evenly is the shot. Ties break by id so a re-take is identical
 * to the take before it.
 */
export function nextDemoStep(
  data: RecipeData,
  discovered: Set<string>,
  realm: 'survival' | 'everyday',
): RecipeDef | null {
  const byId = new Map(data.elements.map((e) => [e.id, e]))
  const onward = new Map<string, number>()
  for (const recipe of data.recipes) {
    for (const id of recipe.inputs) onward.set(id, (onward.get(id) ?? 0) + 1)
  }

  let best: RecipeDef | null = null
  let bestScore = -Infinity
  for (const recipe of data.recipes) {
    if (discovered.has(recipe.output)) continue
    if (!recipe.inputs.every((id) => discovered.has(id))) continue
    // Survival only makes Survival, the same rule the hints follow: its
    // tutorial deliberately shows only its own elements.
    const output = byId.get(recipe.output)
    if (!output) continue
    if (realm === 'survival' && output.realm !== 'survival') continue

    const score = onward.get(recipe.output) ?? 0
    if (score > bestScore || (score === bestScore && best && recipe.output < best.output)) {
      best = recipe
      bestScore = score
    }
  }
  return best
}
