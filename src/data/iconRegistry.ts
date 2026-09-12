import { composeSprite, type FormId } from '../art/forms'
import {
  ALUMINA,
  ALUMINUM_CAN,
  ALUMINUM_SHEET,
  BAUXITE,
  BEESWAX,
  BUTANE,
  CANDLE,
  COTTON_FIBER,
  COTTON_GIN,
  COTTON_JERSEY,
  COTTON_YARN,
  CRUDE_OIL,
  DYE,
  DYED_COTTON_FABRIC,
  FARMLAND,
  FLAME,
  FLINT,
  GINNED_COTTON,
  GLASS_BOTTLE,
  GLOWING_TINDER,
  HIGH_CARBON_STEEL,
  KINDLING,
  LIGHTER,
  LIMESTONE,
  MANGANESE,
  MOLTEN_ALUMINUM,
  MOLTEN_GLASS,
  NATURAL_GAS,
  PARAFFIN,
  PETROLEUM_COKE,
  RAW_COTTON,
  SALT,
  SEWING_THREAD,
  SHIRT,
  SILICA_SAND,
  SODA_ASH,
  SODIUM_HYDROXIDE,
  SODIUM_SILICATE,
  TEXTILE_WASTE,
  WROUGHT_IRON,
  MERCERISED_COTTON,
  CLAY,
  BRICK,
  SLAKED_LIME,
  LIME_MORTAR,
  RAW_MEAL,
  CEMENT,
  CONCRETE,
  WOOD_PULP,
  PAPER,
  FILTERED_WATER,
  TANNIN,
  COMPOST,
  SYNGAS,
  STONE,
  BARK,
  SPINDLE,
  FIRE_BOARD,
  BOW,
  HAND_DRILL,
  BOW_DRILL,
  EMBER,
  TORCH,
  LIT_TORCH,
  SOIL,
  IRON_ORE,
  AMMONIA,
  QUICKLIME,
  DISTILLATE,
  SPARK,
  TINDER,
  WATER,
  WICK,
} from '../art/sprites'
import type { Sprite } from '../components/PixelArt'

/*
 * Maps an ElementDef.icon key to its sprite. Every element in gameData.ts now
 * has a real entry; FLAME stays as the fallback so a future element added
 * without art is visibly wrong rather than missing.
 *
 * Keys below are exactly the icon keys that exist in gameData.ts — no more,
 * no less. (There used to be a `shirt: SHIRT` entry here too, but no
 * ElementDef has ever used icon key "shirt": StartScreen imports SHIRT
 * directly for the Everyday realm icon, bypassing this registry entirely, so
 * that line resolved for nobody. cotton_t_shirt below is the key that
 * actually needed the art, reusing the same sprite rather than duplicating it.)
 */
const REGISTRY: Record<string, Sprite> = {
  // Survival
  tinder: TINDER,
  kindling: KINDLING,
  flint: FLINT,
  high_carbon_steel: HIGH_CARBON_STEEL,
  cotton_fiber: COTTON_FIBER,
  beeswax: BEESWAX,
  crude_oil: CRUDE_OIL,
  natural_gas: NATURAL_GAS,
  spark: SPARK,
  glowing_tinder: GLOWING_TINDER,
  fire: FLAME,
  wick: WICK,
  candle: CANDLE,
  paraffin: PARAFFIN,
  butane: BUTANE,
  lighter: LIGHTER,

  // Everyday — cotton t-shirt
  farmland: FARMLAND,
  water: WATER,
  cotton_gin: COTTON_GIN,
  dye: DYE,
  raw_cotton: RAW_COTTON,
  ginned_cotton: GINNED_COTTON,
  cotton_yarn: COTTON_YARN,
  cotton_jersey: COTTON_JERSEY,
  dyed_cotton_fabric: DYED_COTTON_FABRIC,
  sewing_thread: SEWING_THREAD,
  cotton_t_shirt: SHIRT,

  // Everyday — aluminum can
  salt: SALT,
  bauxite: BAUXITE,
  manganese: MANGANESE,
  sodium_hydroxide: SODIUM_HYDROXIDE,
  alumina: ALUMINA,
  petroleum_coke: PETROLEUM_COKE,
  molten_aluminum: MOLTEN_ALUMINUM,
  aluminum_sheet: ALUMINUM_SHEET,
  aluminum_can: ALUMINUM_CAN,

  // Everyday — glass bottle
  silica_sand: SILICA_SAND,
  soda_ash: SODA_ASH,
  limestone: LIMESTONE,
  sodium_silicate: SODIUM_SILICATE,
  textile_waste: TEXTILE_WASTE,

  /*
   * The rebuild retired some elements and added more. Where an existing sprite
   * already draws the new thing, it is repointed rather than redrawn: the old
   * Flint is exactly a knapped sharp stone, the old Wick is a braided cord, the
   * old Kindling is a stick, and Petroleum Coke was already a black lump of
   * carbon. Redrawing them would have been work for no picture.
   */
  stone: STONE,
  plant_fibre: COTTON_FIBER,
  sharp_stone: FLINT,
  hand_drill: HAND_DRILL,
  tinder_bundle: TINDER,
  bark: BARK,
  torch: TORCH,
  spindle: SPINDLE,
  fire_board: FIRE_BOARD,
  bow: BOW,
  bow_drill: BOW_DRILL,
  ember: EMBER,
  burning_tinder: GLOWING_TINDER,
  charcoal: PETROLEUM_COKE,
  lit_torch: LIT_TORCH,

  soil: SOIL,
  iron_ore: IRON_ORE,
  ammonia: AMMONIA,
  quicklime: QUICKLIME,
  pig_iron: MANGANESE,
  wrought_iron: WROUGHT_IRON,
  mercerised_cotton: MERCERISED_COTTON,
  clay: CLAY,
  brick: BRICK,
  slaked_lime: SLAKED_LIME,
  lime_mortar: LIME_MORTAR,
  raw_meal: RAW_MEAL,
  cement: CEMENT,
  concrete: CONCRETE,
  wood_pulp: WOOD_PULP,
  paper: PAPER,
  filtered_water: FILTERED_WATER,
  tannin: TANNIN,
  compost: COMPOST,
  syngas: SYNGAS,
  distillate: DISTILLATE,
  paraffin_wax: PARAFFIN,
  molten_glass: MOLTEN_GLASS,
  glass_bottle: GLASS_BOTTLE,
}

const PLACEHOLDER = FLAME

/**
 * Elements drawn from the shared vocabulary rather than by hand.
 *
 * A form and one colour, composed at load. This is what makes the element
 * count free to grow: adding a material is a line here, not twenty minutes of
 * drawing, and the composed result is still a distinct bitmap so the "no two
 * elements share a sprite" test keeps its teeth.
 *
 * Hand-drawn art always wins where it exists. The seventy-eight sprites drawn
 * by hand are better than anything a palette swap produces, and nothing here
 * replaces them.
 */
export const COMPOSED: Record<string, { form: FormId; colour: string }> = {
  // The first import-gate batch. One line each, from the shared form
  // vocabulary in art/forms.ts — which is what made a batch this size a
  // half-hour job rather than a half-day of drawing.
  wood_ash: { form: 'heap', colour: '#8d8880' },
  potash: { form: 'powder', colour: '#e3dcc4' },
  soap: { form: 'bar', colour: '#b9d4ad' },
  slag: { form: 'lump', colour: '#5d6157' },
  slag_cement: { form: 'powder', colour: '#5d6b7a' },
  hardened_steel: { form: 'ingot', colour: '#8794a8' },
  tempered_steel: { form: 'ingot', colour: '#7a5a3c' },
  plank: { form: 'board', colour: '#d8a86a' },
  cart_wheel: { form: 'wheel', colour: '#7a4f2c' },
  book: { form: 'book', colour: '#8e3242' },
  cardboard: { form: 'sheet', colour: '#a8703a' },
  reinforced_concrete: { form: 'brick', colour: '#8d8d91' },
  whitewash: { form: 'liquid', colour: '#e8e6df' },
  /*
   * The first two elements drawn from the vocabulary, and they are here
   * because the contact sheet caught them being wrong.
   *
   * `wood` was repointed at the old Kindling sprite and `cordage` at the old
   * Wick, on the reasoning that a stick is a stick and a braided cord is a
   * braided cord. Seen next to their names at the size they are used, Kindling
   * is an orange starburst that reads as a spark and Wick is a pale strip that
   * reads as a wick. Neither is wood or rope.
   */
  wood: { form: 'log', colour: '#8a5a33' },
  cordage: { form: 'coil', colour: '#c8a76a' },
}

/** Memoised: composing is cheap but it happens on every tile render. */
const composedCache = new Map<string, Sprite>()

export function resolveIcon(iconKey: string): Sprite {
  const drawn = REGISTRY[iconKey]
  if (drawn) return drawn

  const recipe = COMPOSED[iconKey]
  if (recipe) {
    const cached = composedCache.get(iconKey)
    if (cached) return cached
    const made = composeSprite(recipe.form, recipe.colour)
    composedCache.set(iconKey, made)
    return made
  }

  return PLACEHOLDER
}
