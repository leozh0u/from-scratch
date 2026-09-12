import { GAME_DATA } from './gameData'

/**
 * What KIND of thing each element is.
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT IN gameData.ts
 *
 * Over 98% of the pairs a player can try produce nothing. Little Alchemy 2 is
 * roughly 720 elements and 5,000 recipes against 168,490 possible pairs; at
 * even 300 elements there are 45,150 pairs and about 44,000 of them do
 * nothing. So the failure case is not an edge case, it is the main loop — and
 * in a game about how things are made, it is where nearly all the teaching has
 * to happen.
 *
 * Right now every failure calls Gemini and the player watches "Hmm…" for five
 * to ten seconds, measured in production. That is irritating at 43 elements
 * and unplayable at 300.
 *
 * Tagging elements lets the game answer instantly, offline, and honestly —
 * and the answer is BETTER than a per-pair fact, because it teaches the
 * grammar of making rather than 45,000 disconnected trivia items. A player who
 * learns "a tool acts on a material" starts predicting instead of guessing.
 *
 * It lives in its own file because `gameData.ts` is hand-curated against
 * sources and the project's rule is that it is edited by hand after human
 * verification. These tags are a UI concern, not a factual claim about the
 * world, and mixing the two would blur a line worth keeping sharp.
 */

/** Roughly, what phase the thing is in. */
export type Phase = 'solid' | 'granular' | 'liquid' | 'gas' | 'fibre' | 'energy' | 'place'

/** What it is FOR — the axis that decides most failures. */
export type Kind =
  | 'mineral'
  | 'metal'
  | 'organic'
  | 'chemical'
  | 'fuel'
  | 'tool'
  | 'textile'
  | 'product'
  | 'place'
  | 'energy'

/** How far along the chain it already is. */
export type Stage = 'raw' | 'processed' | 'finished'

export type Properties = { phase: Phase; kind: Kind; stage: Stage }

const P = (phase: Phase, kind: Kind, stage: Stage): Properties => ({ phase, kind, stage })

/**
 * Every element in the game, tagged.
 *
 * Deliberately exhaustive rather than defaulted: a missing tag would silently
 * fall through to the vaguest possible answer, which is the failure this whole
 * file exists to remove. `everyElementIsTagged` below asserts it.
 */
export const PROPERTIES: Record<string, Properties> = {
  // Survival — starters
  tinder: P('fibre', 'organic', 'raw'),
  kindling: P('solid', 'organic', 'raw'),
  flint: P('solid', 'mineral', 'raw'),
  high_carbon_steel: P('solid', 'tool', 'finished'),
  cotton_fiber: P('fibre', 'organic', 'raw'),
  beeswax: P('solid', 'organic', 'raw'),
  crude_oil: P('liquid', 'fuel', 'raw'),
  natural_gas: P('gas', 'fuel', 'raw'),

  // Survival — crafted
  spark: P('energy', 'energy', 'processed'),
  glowing_tinder: P('energy', 'energy', 'processed'),
  fire: P('energy', 'energy', 'processed'),
  wick: P('fibre', 'textile', 'processed'),
  paraffin: P('solid', 'chemical', 'processed'),
  butane: P('gas', 'fuel', 'processed'),
  candle: P('solid', 'product', 'finished'),
  lighter: P('solid', 'product', 'finished'),

  // Everyday — starters
  farmland: P('place', 'place', 'raw'),
  water: P('liquid', 'chemical', 'raw'),
  cotton_gin: P('solid', 'tool', 'finished'),
  dye: P('liquid', 'chemical', 'raw'),
  salt: P('granular', 'mineral', 'raw'),
  bauxite: P('granular', 'mineral', 'raw'),
  manganese: P('solid', 'metal', 'raw'),
  silica_sand: P('granular', 'mineral', 'raw'),
  soda_ash: P('granular', 'chemical', 'raw'),
  limestone: P('solid', 'mineral', 'raw'),
  textile_waste: P('fibre', 'textile', 'raw'),

  // Everyday — cotton
  raw_cotton: P('fibre', 'organic', 'processed'),
  ginned_cotton: P('fibre', 'organic', 'processed'),
  cotton_yarn: P('fibre', 'textile', 'processed'),
  cotton_jersey: P('fibre', 'textile', 'processed'),
  dyed_cotton_fabric: P('fibre', 'textile', 'processed'),
  sewing_thread: P('fibre', 'textile', 'processed'),
  cotton_t_shirt: P('fibre', 'product', 'finished'),

  // Everyday — aluminium
  sodium_hydroxide: P('liquid', 'chemical', 'processed'),
  alumina: P('granular', 'chemical', 'processed'),
  petroleum_coke: P('solid', 'fuel', 'processed'),
  molten_aluminum: P('liquid', 'metal', 'processed'),
  aluminum_sheet: P('solid', 'metal', 'processed'),
  aluminum_can: P('solid', 'product', 'finished'),

  // Everyday — glass
  sodium_silicate: P('solid', 'chemical', 'processed'),
  molten_glass: P('liquid', 'mineral', 'processed'),
  glass_bottle: P('solid', 'product', 'finished'),
}

/** True when every element in the shipping graph carries tags. */
export function everyElementIsTagged(): string[] {
  return GAME_DATA.elements.filter((e) => !PROPERTIES[e.id]).map((e) => e.id)
}
