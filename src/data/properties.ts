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
  // Survival - the three you are given
  stone: P('solid', 'mineral', 'raw'),
  wood: P('solid', 'organic', 'raw'),
  plant_fibre: P('fibre', 'organic', 'raw'),

  // Survival - tools and parts
  sharp_stone: P('solid', 'tool', 'processed'),
  cordage: P('fibre', 'textile', 'processed'),
  hand_drill: P('solid', 'tool', 'processed'),
  spindle: P('solid', 'tool', 'processed'),
  fire_board: P('solid', 'tool', 'processed'),
  bow: P('solid', 'tool', 'processed'),
  bow_drill: P('solid', 'tool', 'finished'),

  // Survival - the fire chain
  bark: P('fibre', 'organic', 'raw'),
  tinder_bundle: P('fibre', 'organic', 'processed'),
  ember: P('energy', 'energy', 'processed'),
  burning_tinder: P('energy', 'energy', 'processed'),
  fire: P('energy', 'energy', 'processed'),
  charcoal: P('solid', 'fuel', 'processed'),
  torch: P('solid', 'product', 'processed'),
  lit_torch: P('energy', 'product', 'finished'),

  // Everyday - what you dig up and pump
  water: P('liquid', 'chemical', 'raw'),
  soil: P('granular', 'place', 'raw'),
  limestone: P('solid', 'mineral', 'raw'),
  bauxite: P('granular', 'mineral', 'raw'),
  iron_ore: P('solid', 'mineral', 'raw'),
  crude_oil: P('liquid', 'fuel', 'raw'),
  natural_gas: P('gas', 'fuel', 'raw'),
  beeswax: P('solid', 'organic', 'raw'),
  textile_waste: P('fibre', 'textile', 'raw'),

  // Everyday - chemistry
  salt: P('granular', 'mineral', 'processed'),
  ammonia: P('gas', 'chemical', 'processed'),
  farmland: P('place', 'place', 'processed'),
  silica_sand: P('granular', 'mineral', 'processed'),
  quicklime: P('granular', 'chemical', 'processed'),
  soda_ash: P('granular', 'chemical', 'processed'),
  sodium_hydroxide: P('liquid', 'chemical', 'processed'),
  dye: P('liquid', 'chemical', 'processed'),

  // Everyday - metal
  pig_iron: P('solid', 'metal', 'processed'),
  wrought_iron: P('solid', 'metal', 'processed'),
  high_carbon_steel: P('solid', 'tool', 'finished'),
  cotton_gin: P('solid', 'tool', 'finished'),
  alumina: P('granular', 'chemical', 'processed'),
  molten_aluminum: P('liquid', 'metal', 'processed'),
  aluminum_sheet: P('solid', 'metal', 'processed'),
  aluminum_can: P('solid', 'product', 'finished'),

  // Everyday - the cement chain, and the two lime products beside it
  clay: P('granular', 'mineral', 'processed'),
  brick: P('solid', 'product', 'finished'),
  slaked_lime: P('granular', 'chemical', 'processed'),
  lime_mortar: P('granular', 'product', 'finished'),
  raw_meal: P('granular', 'mineral', 'processed'),
  cement: P('granular', 'mineral', 'processed'),
  concrete: P('solid', 'product', 'finished'),

  // Everyday - the second roads: rot instead of a reactor, bark instead of a vat
  tannin: P('liquid', 'chemical', 'processed'),
  compost: P('granular', 'organic', 'processed'),
  syngas: P('gas', 'fuel', 'processed'),

  // Everyday - paper, and water worth drinking
  wood_pulp: P('fibre', 'organic', 'processed'),
  paper: P('fibre', 'product', 'finished'),
  filtered_water: P('liquid', 'chemical', 'processed'),

  // Everyday - glass
  sodium_silicate: P('solid', 'chemical', 'processed'),
  molten_glass: P('liquid', 'mineral', 'processed'),
  glass_bottle: P('solid', 'product', 'finished'),

  // Everyday - oil
  distillate: P('liquid', 'fuel', 'processed'),
  paraffin_wax: P('solid', 'chemical', 'processed'),
  butane: P('gas', 'fuel', 'processed'),

  // Everyday - cotton
  raw_cotton: P('fibre', 'organic', 'processed'),
  ginned_cotton: P('fibre', 'organic', 'processed'),
  cotton_yarn: P('fibre', 'textile', 'processed'),
  cotton_jersey: P('fibre', 'textile', 'processed'),
  mercerised_cotton: P('fibre', 'textile', 'processed'),
  dyed_cotton_fabric: P('fibre', 'textile', 'processed'),
  sewing_thread: P('fibre', 'textile', 'processed'),
  cotton_t_shirt: P('fibre', 'product', 'finished'),

  // Everyday - the two side products
  candle: P('solid', 'product', 'finished'),
  lighter: P('solid', 'product', 'finished'),
}

/** True when every element in the shipping graph carries tags. */
export function everyElementIsTagged(): string[] {
  return GAME_DATA.elements.filter((e) => !PROPERTIES[e.id]).map((e) => e.id)
}
