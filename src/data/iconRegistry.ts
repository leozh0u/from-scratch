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
  steel_wire: { form: 'coil', colour: '#9aa6b4' },
  chain: { form: 'coil', colour: '#772222' },
  nail_file: { form: 'tool', colour: '#b0b6c0' },
  saw: { form: 'tool', colour: '#772222' },
  hammer: { form: 'tool', colour: '#8a6a3a' },
  chisel: { form: 'tool', colour: '#588415' },
  lathe: { form: 'machine', colour: '#6a7484' },
  screw_thread: { form: 'coil', colour: '#b8a068' },
  clamp: { form: 'tool', colour: '#158420' },
  plywood: { form: 'board', colour: '#d8b070' },
  sandpaper: { form: 'sheet', colour: '#c8a878' },
  varnish: { form: 'liquid', colour: '#b07030' },
  paint: { form: 'bottle', colour: '#3a7ac8' },
  brush: { form: 'tool', colour: '#3f5a45' },
  canvas: { form: 'cloth', colour: '#d8cba8' },
  painting: { form: 'board', colour: '#8a5a7a' },
  quill: { form: 'tool', colour: '#e8e0c8' },
  parchment: { form: 'sheet', colour: '#e0d4b0' },
  map: { form: 'sheet', colour: '#772222' },
  glass_lens: { form: 'crystal', colour: '#bfe0ee' },
  spectacles: { form: 'tool', colour: '#15846e' },
  magnifier: { form: 'tool', colour: '#c8a850' },
  prism: { form: 'crystal', colour: '#d8a0e0' },
  spectrometer: { form: 'machine', colour: '#772222' },
  mould: { form: 'brick', colour: '#6a5a4a' },
  cast_iron: { form: 'ingot', colour: '#4a4a52' },
  stove: { form: 'machine', colour: '#3a3a42' },
  kettle: { form: 'bottle', colour: '#6a6a74' },
  bell: { form: 'bottle', colour: '#b08a30' },
  leather: { form: 'cloth', colour: '#8a5a34' },
  shoe: { form: 'tool', colour: '#154084' },
  drum: { form: 'bottle', colour: '#772222' },
  guitar: { form: 'tool', colour: '#512277' },
  bow_hair: { form: 'fibre', colour: '#e8dcc0' },
  telescope: { form: 'tool', colour: '#911a9e' },
  microscope: { form: 'machine', colour: '#846315' },
  thermometer: { form: 'bottle', colour: '#776722' },
  barometer: { form: 'wheel', colour: '#b8a050' },
  pencil: { form: 'tool', colour: '#b8301e' },
  chalk: { form: 'powder', colour: '#f4f4ec' },
  render: { form: 'brick', colour: '#c8c0b0' },
  roof_tile: { form: 'board', colour: '#a04a38' },
  house: { form: 'machine', colour: '#b07a50' },
  lock: { form: 'tool', colour: '#9fb81e' },
  nail: { form: 'pellet', colour: '#98a0a8' },
  door: { form: 'board', colour: '#841515' },
  screw: { form: 'pellet', colour: '#772222' },
  chair: { form: 'board', colour: '#5a3f3f' },
  table: { form: 'board', colour: '#847c15' },
  mattress: { form: 'cloth', colour: '#e4e0ee' },
  kite: { form: 'cloth', colour: '#e06a8a' },
  parachute: { form: 'cloth', colour: '#f0a030' },
  bellows: { form: 'tool', colour: '#1eb899' },
  anvil: { form: 'lump', colour: '#3a3a44' },
  horseshoe: { form: 'coil', colour: '#846315' },
  plough: { form: 'tool', colour: '#587e77' },
  windmill: { form: 'machine', colour: '#d8c8a0' },
  water_wheel: { form: 'wheel', colour: '#6a5a3a' },
  willow_bark: { form: 'log', colour: '#9a8a5a' },
  aspirin: { form: 'pellet', colour: '#f4f4f8' },
  antiseptic: { form: 'bottle', colour: '#a8e0d8' },
  bandage: { form: 'cloth', colour: '#841515' },
  lodestone: { form: 'lump', colour: '#772222' },
  compass: { form: 'wheel', colour: '#841515' },
  sextant: { form: 'tool', colour: '#1e7db8' },
  chronometer: { form: 'wheel', colour: '#e0d0a0' },
  pitch: { form: 'lump', colour: '#846315' },
  sail: { form: 'cloth', colour: '#588415' },
  boat: { form: 'board', colour: '#417722' },
  ship: { form: 'machine', colour: '#417722' },
  steam_boiler: { form: 'machine', colour: '#158454' },
  steam_engine: { form: 'machine', colour: '#154d84' },
  rail: { form: 'ingot', colour: '#7a7a86' },
  locomotive: { form: 'machine', colour: '#381584' },
  alloy_frame: { form: 'machine', colour: '#772275' },
  propeller: { form: 'tool', colour: '#3d1eb8' },
  aeroplane: { form: 'machine', colour: '#1a9e93' },
  liquid_oxygen: { form: 'bottle', colour: '#318415' },
  rocket_engine: { form: 'machine', colour: '#b8301e' },
  rocket: { form: 'tool', colour: '#a6305f' },
  satellite: { form: 'machine', colour: '#b8ae1e' },
  radio: { form: 'board', colour: '#158454' },
  camera: { form: 'board', colour: '#224d77' },
  speaker: { form: 'machine', colour: '#77a630' },
  microphone: { form: 'tool', colour: '#d37522' },
  headphones: { form: 'machine', colour: '#21b81e' },
  record: { form: 'wheel', colour: '#1a1a20' },
  wire_mesh: { form: 'cloth', colour: '#98a0ac' },
  fencing_mask: { form: 'machine', colour: '#611eb8' },
  fencing_blade: { form: 'tool', colour: '#59be37' },
  fencing_kit: { form: 'cloth', colour: '#158420' },
  wool: { form: 'fibre', colour: '#772222' },
  felt: { form: 'cloth', colour: '#3f5a45' },
  woollen_yarn: { form: 'coil', colour: '#d8c8a8' },
  jumper: { form: 'cloth', colour: '#15846e' },
  flax: { form: 'plant', colour: '#9ab06a' },
  retted_flax: { form: 'fibre', colour: '#a89468' },
  linen: { form: 'cloth', colour: '#154084' },
  flour: { form: 'powder', colour: '#772222' },
  dough: { form: 'lump', colour: '#e8d8b8' },
  bread: { form: 'lump', colour: '#b8783a' },
  beer: { form: 'bottle', colour: '#158454' },
  vinegar: { form: 'bottle', colour: '#224d77' },
  knife: { form: 'tool', colour: '#6b50a5' },
  pot: { form: 'bottle', colour: '#451584' },
  glaze: { form: 'bottle', colour: '#841568' },
  candle_lantern: { form: 'tool', colour: '#c122d3' },
  soap_bar: { form: 'powder', colour: '#846315' },
  copper_ore: { form: 'lump', colour: '#7a8c5a' },
  copper: { form: 'ingot', colour: '#c4713a' },
  bronze: { form: 'ingot', colour: '#772222' },
  copper_wire: { form: 'coil', colour: '#4f5a3f' },
  insulated_wire: { form: 'coil', colour: '#4a7fd9' },
  electromagnet: { form: 'machine', colour: '#a91eb8' },
  electric_motor: { form: 'machine', colour: '#4a9ac4' },
  generator: { form: 'machine', colour: '#22d35d' },
  battery: { form: 'bottle', colour: '#1a9e93' },
  filament: { form: 'fibre', colour: '#ffcf6a' },
  light_bulb: { form: 'bottle', colour: '#ffe9a0' },
  lamp: { form: 'tool', colour: '#d32292' },
  silicon: { form: 'crystal', colour: '#8e93a8' },
  silicon_wafer: { form: 'sheet', colour: '#6f7aa0' },
  microchip: { form: 'board', colour: '#451584' },
  circuit_board: { form: 'board', colour: '#841568' },
  phone: { form: 'board', colour: '#1a9e93' },
  solar_cell: { form: 'sheet', colour: '#2a3f8a' },
  steel_spring: { form: 'coil', colour: '#318415' },
  bearing: { form: 'wheel', colour: '#aab0bc' },
  bicycle: { form: 'machine', colour: '#22d3c4' },
  gear: { form: 'wheel', colour: '#3e8415' },
  clock: { form: 'wheel', colour: '#227752' },
  engine: { form: 'machine', colour: '#2266d3' },
  car: { form: 'machine', colour: '#a55086' },
  ethylene: { form: 'gas', colour: '#9fd8e8' },
  polyethylene: { form: 'pellet', colour: '#846315' },
  plastic_bottle: { form: 'bottle', colour: '#b8301e' },
  ethanol: { form: 'liquid', colour: '#d8e7c0' },
  butadiene: { form: 'gas', colour: '#772222' },
  synthetic_rubber: { form: 'lump', colour: '#417722' },
  carbon_black: { form: 'powder', colour: '#2b2a30' },
  tyre: { form: 'wheel', colour: '#154d84' },
  vinyl_chloride: { form: 'gas', colour: '#b9e6a7' },
  pvc: { form: 'pellet', colour: '#4f5a3f' },
  pipe: { form: 'coil', colour: '#158454' },
  propylene: { form: 'gas', colour: '#846315' },
  polypropylene: { form: 'pellet', colour: '#318415' },
  rope: { form: 'coil', colour: '#224d77' },
  acetylene: { form: 'flame', colour: '#7ec8ff' },
  welded_steel: { form: 'ingot', colour: '#846315' },
  steel_frame: { form: 'machine', colour: '#d32269' },
  glass_pane: { form: 'sheet', colour: '#a8d4e0' },
  window: { form: 'board', colour: '#8fb8c9' },
  mirror: { form: 'sheet', colour: '#846315' },
  brick_wall: { form: 'brick', colour: '#772222' },
  plaster: { form: 'powder', colour: '#417722' },
  ink: { form: 'liquid', colour: '#1f1d2b' },
  newspaper: { form: 'sheet', colour: '#4f5a3f' },
  // The first import-gate batch. One line each, from the shared form
  // vocabulary in art/forms.ts — which is what made a batch this size a
  // half-hour job rather than a half-day of drawing.
  wood_ash: { form: 'heap', colour: '#8d8880' },
  potash: { form: 'powder', colour: '#158454' },
  soap: { form: 'bar', colour: '#b9d4ad' },
  slag: { form: 'lump', colour: '#158454' },
  slag_cement: { form: 'powder', colour: '#5d6b7a' },
  hardened_steel: { form: 'ingot', colour: '#417722' },
  tempered_steel: { form: 'ingot', colour: '#158454' },
  plank: { form: 'board', colour: '#b8ae1e' },
  cart_wheel: { form: 'wheel', colour: '#381584' },
  book: { form: 'book', colour: '#8e3242' },
  cardboard: { form: 'sheet', colour: '#318415' },
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
  cordage: { form: 'coil', colour: '#451584' },
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
