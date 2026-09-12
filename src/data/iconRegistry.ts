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
 * Keys below are exactly the icon keys that exist in gameData.ts and nothing
 * else — the one exception is `shirt`, which predates this file's current
 * shape. No ElementDef uses it; SHIRT is reached directly by StartScreen as
 * the Everyday realm icon, so the art is live but this line resolves for
 * nobody. Dropping it is the repo owner's call, so it stays for now.
 * `cotton_t_shirt` is the key that actually needed it, and it reuses the same
 * sprite rather than duplicating the art.
 */
const REGISTRY: Record<string, Sprite> = {
  shirt: SHIRT,

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
  molten_glass: MOLTEN_GLASS,
  glass_bottle: GLASS_BOTTLE,
}

const PLACEHOLDER = FLAME

export function resolveIcon(iconKey: string): Sprite {
  return REGISTRY[iconKey] ?? PLACEHOLDER
}
