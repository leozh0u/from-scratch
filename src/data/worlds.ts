import type { MoodId } from '../art/moods'

/**
 * The worlds: small planets, each with one job. Make everything you need to do
 * one thing. See docs/WORLDS.md for why these five and why they start where
 * they do.
 *
 * A world is Survival's shape again: a few starters, three targets, a shelf
 * that only holds what can be made there. It does not add a single recipe of
 * its own; the graph is the same thousand elements everywhere, so stone on
 * stone still makes a sharp stone on the football planet. What a world chooses
 * is where you start and what you are aiming at.
 *
 * THE RULES EVERY WORLD KEEPS, asserted in scripts/worldtest.ts:
 *   - three targets, each something you would hold;
 *   - starters are natural (dug, grown, gathered, tapped), plus fire, which
 *     you learned in Survival and should not have to rub sticks for again;
 *   - every starter is used on the way to the kit, so no tile is a dud;
 *   - every target can be made from the world's own starters;
 *   - the name fits the HUD at every width, which is ten characters.
 */

export type WorldId = 'football' | 'fencing' | 'chess' | 'drums' | 'navigation'

/** Six colours for the whole planet, as the title Earth has. */
export type PlanetPalette = {
  oceanLit: string
  oceanDim: string
  landLit: string
  landDim: string
  ice: string
  outline: string
}

export type WorldDef = {
  id: WorldId
  /** Shown in the HUD and on the picker. Ten characters at most. */
  name: string
  /** What the three targets add up to, for the picker and the inventory. */
  kit: string
  starters: string[]
  targets: [string, string, string]
  /** Which of the two supplied backdrops, and the light it is seen in. */
  scene: 'forest' | 'city'
  mood: MoodId
  planet: {
    palette: PlanetPalette
    /**
     * The coastlines are Earth's, turned. Mirrored and started from a
     * different longitude, five planets drawn from one mask stop reading as
     * the same planet in five colours.
     */
    mirror: 'none' | 'x' | 'y' | 'xy'
    startLongitude: number
    secondsPerTurn: number
  }
}

const OUTLINE = '#0b0a16'

export const WORLDS: WorldDef[] = [
  {
    id: 'football',
    name: 'Football',
    kit: 'everything you need to play football',
    // Hide for the leather, latex and sulfur for the rubber, plant fibre for
    // the net's cord. The ball is leather over a vulcanised rubber bladder.
    starters: ['fire', 'wood', 'stone', 'plant_fibre', 'water', 'hide', 'latex', 'sulfur'],
    targets: ['football', 'football_boot', 'goal'],
    scene: 'forest',
    mood: 'autumn',
    planet: {
      palette: {
        oceanLit: '#2f7d4f',
        oceanDim: '#1f5a39',
        landLit: '#b8e05a',
        landDim: '#7fae3a',
        ice: '#ffffff',
        outline: OUTLINE,
      },
      mirror: 'x',
      startLongitude: 110,
      secondsPerTurn: 28,
    },
  },
  {
    id: 'fencing',
    name: 'Fencing',
    kit: 'a blade, a mask and a jacket',
    // Iron for the blade and the mask's mesh, soil to grow the cotton for the
    // jacket, beeswax for the thread that sews it.
    starters: ['fire', 'wood', 'stone', 'water', 'iron_ore', 'soil', 'beeswax'],
    targets: ['fencing_blade', 'fencing_mask', 'fencing_jacket'],
    scene: 'city',
    mood: 'dusk',
    planet: {
      palette: {
        oceanLit: '#3b4a6b',
        oceanDim: '#28324d',
        landLit: '#d8dde6',
        landDim: '#9aa3b5',
        ice: '#ffffff',
        outline: OUTLINE,
      },
      mirror: 'y',
      startLongitude: 182,
      secondsPerTurn: 36,
    },
  },
  {
    id: 'chess',
    name: 'Chess',
    kit: 'a board, the pieces and a clock',
    // The clock is a sandglass, which is what timed chess before the chess
    // clock existed. Forest glass, so the planet needs no salt and no lime.
    starters: ['fire', 'wood', 'stone', 'water', 'iron_ore'],
    targets: ['chessboard', 'chess_pieces', 'hourglass'],
    scene: 'city',
    mood: 'night',
    planet: {
      palette: {
        oceanLit: '#3a3230',
        oceanDim: '#241e1d',
        landLit: '#efe2c4',
        landDim: '#b8a47e',
        ice: '#ffffff',
        outline: OUTLINE,
      },
      mirror: 'xy',
      startLongitude: 254,
      secondsPerTurn: 40,
    },
  },
  {
    id: 'drums',
    name: 'Drums',
    kit: 'a drum, the sticks and a cymbal',
    // Hide over wood for the drum, iron for the knife that whittles the
    // sticks, copper and tin for the bronze the cymbal is hammered from.
    starters: ['fire', 'wood', 'water', 'hide', 'iron_ore', 'copper_ore', 'tin_ore'],
    targets: ['drum', 'drumsticks', 'cymbal'],
    scene: 'forest',
    mood: 'dusk',
    planet: {
      palette: {
        oceanLit: '#7a2e3a',
        oceanDim: '#521d27',
        landLit: '#e0a64a',
        landDim: '#a8742a',
        ice: '#fbe3a8',
        outline: OUTLINE,
      },
      mirror: 'none',
      startLongitude: 326,
      secondsPerTurn: 24,
    },
  },
  {
    id: 'navigation',
    name: 'Navigation',
    kit: 'a compass, a map and a sextant',
    // The hard one, and the only one by the sea. Lodestone magnetises a steel
    // needle, limed hide becomes the parchment, and the sextant needs glass
    // (salt from seawater, then Solvay's soda ash), a tin-backed mirror and
    // bronze.
    starters: [
      'fire',
      'wood',
      'stone',
      'water',
      'seawater',
      'iron_ore',
      'lodestone',
      'hide',
      'limestone',
      'copper_ore',
      'tin_ore',
    ],
    targets: ['compass', 'map', 'sextant'],
    scene: 'forest',
    mood: 'winter',
    planet: {
      palette: {
        oceanLit: '#1f8a8a',
        oceanDim: '#136262',
        landLit: '#e6cf98',
        landDim: '#b39a62',
        ice: '#f4f1e6',
        outline: OUTLINE,
      },
      mirror: 'x',
      startLongitude: 38,
      secondsPerTurn: 32,
    },
  },
]

export function worldById(id: string): WorldDef | undefined {
  return WORLDS.find((world) => world.id === id)
}
