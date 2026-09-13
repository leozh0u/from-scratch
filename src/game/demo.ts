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
 *   ?demo=human&ms=220         somebody playing, at about four times life
 *   ?demo=human&hit=0.25       wrong three times in four, like the real thing
 *   ?demo=fast&ms=90&batch=4   the scale shot: a full realm in twenty seconds
 *   ?demo=fast&stop=200        stop after 200 discoveries
 *
 * Inert without the parameter, so nothing about the normal game changes.
 */
import type { RecipeData, RecipeDef } from '../data/types'

/**
 * TWO WAYS TO PLAY FOR THE CAMERA.
 *
 * Leo: *"are you able to use it like how a normal person would, like clicking
 * hints, clicking two things and combining, getting things wrong, etc... i
 * want you to mimic real speed time lampse like getting things wrong and right
 * and the aniamtions etc etc."*
 *
 * He is right, and the first driver was wrong for the shot. It made the best
 * pair available every tick and never missed, which is a solver executing a
 * route — a counter climbing and a grid filling, with a 100% hit rate on
 * screen saying plainly that nobody is playing.
 *
 * `human` drives the UI instead of the state: it picks a tile, picks a second
 * tile, presses combine, gets it wrong most of the time, reads the reason,
 * occasionally asks the model why, spends a hint when it is stuck, and closes
 * the discovery card when it lands one. Every animation happens because the
 * real handler ran.
 *
 * `fast` is the old one, kept for the tail of the video where the point is the
 * scale rather than the play.
 */
export type DemoMode = 'off' | 'human' | 'fast'

export type DemoSettings = {
  mode: DemoMode
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
  /**
   * Roughly how often a deliberate attempt should succeed, in `human` mode.
   *
   * A real player is under 3%, which is the honest number and unwatchable: a
   * thirty-second clip would be thirty seconds of nothing working. Around one
   * in three reads as somebody exploring and getting somewhere, which is the
   * truthful impression even though it is not the truthful rate.
   */
  hitRate: number
  /** Fixed so a re-take is identical to the take before it. */
  seed: number
}

export const DEMO_DEFAULT_MS = 40

export function readDemoSettings(search: string): DemoSettings {
  const params = new URLSearchParams(search)
  const raw = params.get('demo')
  const on = raw !== null && raw !== '0' && raw !== 'false'
  const mode: DemoMode = !on ? 'off' : raw === 'human' ? 'human' : 'fast'
  if (!on) {
    return { mode, on: false, ms: DEMO_DEFAULT_MS, stop: Infinity, batch: 1, hitRate: 0.3, seed: 7 }
  }

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
  const hitRate = clamp(Number(params.get('hit')) || 0.3, 0.02, 1)
  const seed = Math.floor(Number(params.get('seed')) || 7)
  return { mode, on: true, ms, stop, batch, hitRate, seed }
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

/**
 * A small deterministic generator, so a re-take is the take before it.
 *
 * `Math.random` would be fine for gameplay and is wrong here: the whole point
 * of driving the capture rather than screen-recording it is that the shot can
 * be re-shot, and a performance that differs every run is a performance you
 * cannot cut around.
 */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type HumanTurn =
  | { kind: 'hit'; inputs: [string, string] }
  | { kind: 'miss'; inputs: [string, string] }
  | { kind: 'stuck' }

/**
 * What a person would try next.
 *
 * A miss is two things the player actually holds, which is what a real wrong
 * guess is — not two ids drawn from the whole graph. It also has to be a pair
 * the game will genuinely refuse, or the "miss" lands a discovery and the clip
 * shows a hit rate that does not match what is on screen.
 *
 * A hit is the shallowest thing reachable, same as `nextDemoStep`, so the
 * chain visibly builds on itself rather than jumping about.
 */
export function nextHumanTurn(
  data: RecipeData,
  discovered: Set<string>,
  realm: 'survival' | 'everyday',
  wantHit: boolean,
  random: () => number,
  tried: Set<string>,
): HumanTurn {
  if (wantHit) {
    const step = nextDemoStep(data, discovered, realm)
    if (step) return { kind: 'hit', inputs: [step.inputs[0], step.inputs[1]] }
  }

  const held = [...discovered].filter((id) => {
    const el = data.elements.find((e) => e.id === id)
    return el && (realm === 'everyday' || el.realm === 'survival')
  })
  if (held.length < 2) return { kind: 'stuck' }

  const real = new Set(data.recipes.map((r) => [r.inputs[0], r.inputs[1]].sort().join('+')))

  /*
   * Bounded rather than looped until it finds one. Over 97% of pairs do
   * nothing, so this lands on the first or second try in practice — but an
   * unbounded search inside a render loop is a hang waiting for the one board
   * where everything left is a recipe.
   */
  for (let attempt = 0; attempt < 40; attempt++) {
    const a = held[Math.floor(random() * held.length)]
    const b = held[Math.floor(random() * held.length)]
    if (a === b) continue
    const key = [a, b].sort().join('+')
    if (real.has(key) || tried.has(key)) continue
    return { kind: 'miss', inputs: [a, b] }
  }

  const step = nextDemoStep(data, discovered, realm)
  return step ? { kind: 'hit', inputs: [step.inputs[0], step.inputs[1]] } : { kind: 'stuck' }
}
