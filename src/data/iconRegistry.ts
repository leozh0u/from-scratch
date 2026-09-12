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
  willow_bark: { form: 'log', colour: '#9a8a5a' },
  aspirin: { form: 'pellet', colour: '#f4f4f8' },
  antiseptic: { form: 'bottle', colour: '#a8e0d8' },
  bandage: { form: 'cloth', colour: '#f0e8dc' },
  lodestone: { form: 'lump', colour: '#4a4a58' },
  compass: { form: 'wheel', colour: '#c8a83a' },
  sextant: { form: 'tool', colour: '#b08a3a' },
  chronometer: { form: 'wheel', colour: '#e0d0a0' },
  pitch: { form: 'lump', colour: '#22201c' },
  sail: { form: 'cloth', colour: '#772222' },
  boat: { form: 'board', colour: '#8a5a2a' },
  ship: { form: 'machine', colour: '#6a4a2a' },
  steam_boiler: { form: 'machine', colour: '#4b8415' },
  steam_engine: { form: 'machine', colour: '#5a5a6a' },
  rail: { form: 'ingot', colour: '#7a7a86' },
  locomotive: { form: 'machine', colour: '#227748' },
  alloy_frame: { form: 'machine', colour: '#b8bcc4' },
  propeller: { form: 'tool', colour: '#8a9aa8' },
  aeroplane: { form: 'machine', colour: '#155984' },
  liquid_oxygen: { form: 'bottle', colour: '#772222' },
  rocket_engine: { form: 'machine', colour: '#1f1584' },
  rocket: { form: 'tool', colour: '#e8e8f0' },
  satellite: { form: 'machine', colour: '#c8b060' },
  radio: { form: 'board', colour: '#841515' },
  camera: { form: 'board', colour: '#3a3a44' },
  speaker: { form: 'machine', colour: '#6c1584' },
  microphone: { form: 'tool', colour: '#5a5a72' },
  headphones: { form: 'machine', colour: '#9e1a1a' },
  record: { form: 'wheel', colour: '#1a1a20' },
  wire_mesh: { form: 'cloth', colour: '#98a0ac' },
  fencing_mask: { form: 'machine', colour: '#9e761a' },
  fencing_blade: { form: 'tool', colour: '#772222' },
  fencing_kit: { form: 'cloth', colour: '#846315' },
  wool: { form: 'fibre', colour: '#efe6d6' },
  felt: { form: 'cloth', colour: '#4f5a3f' },
  woollen_yarn: { form: 'coil', colour: '#d8c8a8' },
  jumper: { form: 'cloth', colour: '#8a4a6a' },
  flax: { form: 'plant', colour: '#9ab06a' },
  retted_flax: { form: 'fibre', colour: '#a89468' },
  linen: { form: 'cloth', colour: '#318415' },
  flour: { form: 'powder', colour: '#f0e8d8' },
  dough: { form: 'lump', colour: '#e8d8b8' },
  bread: { form: 'lump', colour: '#b8783a' },
  beer: { form: 'bottle', colour: '#d8a33a' },
  vinegar: { form: 'bottle', colour: '#846315' },
  knife: { form: 'tool', colour: '#846315' },
  pot: { form: 'bottle', colour: '#4f5a3f' },
  glaze: { form: 'bottle', colour: '#4a8a7a' },
  candle_lantern: { form: 'tool', colour: '#f0c860' },
  soap_bar: { form: 'powder', colour: '#772222' },
  copper_ore: { form: 'lump', colour: '#7a8c5a' },
  copper: { form: 'ingot', colour: '#c4713a' },
  bronze: { form: 'ingot', colour: '#772222' },
  copper_wire: { form: 'coil', colour: '#d98a4a' },
  insulated_wire: { form: 'coil', colour: '#4a7fd9' },
  electromagnet: { form: 'machine', colour: '#6a5ac4' },
  electric_motor: { form: 'machine', colour: '#4a9ac4' },
  generator: { form: 'machine', colour: '#1a9e83' },
  battery: { form: 'bottle', colour: '#318415' },
  filament: { form: 'fibre', colour: '#ffcf6a' },
  light_bulb: { form: 'bottle', colour: '#ffe9a0' },
  lamp: { form: 'tool', colour: '#417722' },
  silicon: { form: 'crystal', colour: '#8e93a8' },
  silicon_wafer: { form: 'sheet', colour: '#6f7aa0' },
  microchip: { form: 'board', colour: '#588415' },
  circuit_board: { form: 'board', colour: '#158420' },
  phone: { form: 'board', colour: '#227766' },
  solar_cell: { form: 'sheet', colour: '#2a3f8a' },
  steel_spring: { form: 'coil', colour: '#9aa4b0' },
  bearing: { form: 'wheel', colour: '#aab0bc' },
  bicycle: { form: 'machine', colour: '#b1b81e' },
  gear: { form: 'wheel', colour: '#8a7a5a' },
  clock: { form: 'wheel', colour: '#772222' },
  engine: { form: 'machine', colour: '#21b81e' },
  car: { form: 'machine', colour: '#971eb8' },
  ethylene: { form: 'gas', colour: '#9fd8e8' },
  polyethylene: { form: 'pellet', colour: '#772222' },
  plastic_bottle: { form: 'bottle', colour: '#155984' },
  ethanol: { form: 'liquid', colour: '#d8e7c0' },
  butadiene: { form: 'gas', colour: '#772222' },
  synthetic_rubber: { form: 'lump', colour: '#772222' },
  carbon_black: { form: 'powder', colour: '#2b2a30' },
  tyre: { form: 'wheel', colour: '#846315' },
  vinyl_chloride: { form: 'gas', colour: '#b9e6a7' },
  pvc: { form: 'pellet', colour: '#846315' },
  pipe: { form: 'coil', colour: '#772222' },
  propylene: { form: 'gas', colour: '#846315' },
  polypropylene: { form: 'pellet', colour: '#4f5a3f' },
  rope: { form: 'coil', colour: '#846315' },
  acetylene: { form: 'flame', colour: '#7ec8ff' },
  welded_steel: { form: 'ingot', colour: '#846315' },
  steel_frame: { form: 'machine', colour: '#a6306d' },
  glass_pane: { form: 'sheet', colour: '#a8d4e0' },
  window: { form: 'board', colour: '#8fb8c9' },
  mirror: { form: 'sheet', colour: '#772222' },
  brick_wall: { form: 'brick', colour: '#a85a3f' },
  plaster: { form: 'powder', colour: '#846315' },
  ink: { form: 'liquid', colour: '#1f1d2b' },
  newspaper: { form: 'sheet', colour: '#846315' },
  // The first import-gate batch. One line each, from the shared form
  // vocabulary in art/forms.ts — which is what made a batch this size a
  // half-hour job rather than a half-day of drawing.
  wood_ash: { form: 'heap', colour: '#8d8880' },
  potash: { form: 'powder', colour: '#417722' },
  soap: { form: 'bar', colour: '#b9d4ad' },
  slag: { form: 'lump', colour: '#846315' },
  slag_cement: { form: 'powder', colour: '#5d6b7a' },
  hardened_steel: { form: 'ingot', colour: '#4f5a3f' },
  tempered_steel: { form: 'ingot', colour: '#318415' },
  plank: { form: 'board', colour: '#d8a86a' },
  cart_wheel: { form: 'wheel', colour: '#4f5a3f' },
  book: { form: 'book', colour: '#8e3242' },
  cardboard: { form: 'sheet', colour: '#4f5a3f' },
  reinforced_concrete: { form: 'brick', colour: '#8d8d91' },
  whitewash: { form: 'liquid', colour: '#772222' },
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
  wood: { form: 'log', colour: '#772222' },
  cordage: { form: 'coil', colour: '#4f5a3f' },
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
