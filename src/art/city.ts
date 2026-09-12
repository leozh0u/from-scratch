/**
 * The moving parts of the street: people, traffic, birds.
 *
 * WHY THESE ARE SPRITES AND THE STREET ITSELF IS NOT
 *
 * The backdrop is a piece of art — a composed image, better than anything a
 * generator produces, which the forest proved twice over. But a painting
 * cannot walk. Pedestrians, cars and pigeons are the difference between a
 * picture of a street and a street, and they have to be drawn as sprites so
 * they can have frames.
 *
 * They are also small enough that hand-authoring them is realistic: a person
 * at this scale is eleven pixels tall and the whole walk cycle is two poses.
 *
 * EVERY WALK CYCLE IS TWO FRAMES, AND THAT IS ENOUGH
 *
 * Two poses — legs apart, legs together — read unambiguously as walking at
 * this size, which is why almost every 8-bit game did exactly that. More
 * frames need more pixels than eleven rows can carry, and the extra detail
 * lands between the grid rather than on it.
 *
 * COLOUR IS DATA, SHAPE IS DRAWN
 *
 * One person sprite, recoloured per pedestrian. A crowd of identical figures
 * reads as a pattern; a crowd of the same silhouette in different coats reads
 * as a crowd. This is the sprite-vocabulary idea from ARCHITECTURE.md applied
 * to the one place it obviously belongs.
 *
 * `c` is the coat, `t` the trousers, `s` skin, `k` the outline. The palettes
 * below fill those in.
 */

export type CitySprite = { rows: string[]; palette: Record<string, string> }

/** Legs together — the passing pose. */
const PERSON_A = [
  '..kkk.',
  '.kssk.',
  '.ksssk',
  '.kkkk.',
  'kcccck',
  'kcccck',
  'kcccck',
  '.kcck.',
  '.kttk.',
  '.kttk.',
  '.kk.k.',
]

/** Legs apart — mid-stride. */
const PERSON_B = [
  '..kkk.',
  '.kssk.',
  '.ksssk',
  '.kkkk.',
  '.kccck',
  'kcccck',
  'kcccck',
  '.kcck.',
  '.kttk.',
  'kt..tk',
  'k....k',
]

/**
 * Coats, picked per pedestrian from a seed.
 *
 * Muted and various on purpose — a street crowd is mostly dark coats with the
 * occasional bright one, and an evenly-distributed rainbow reads as a parade.
 */
export const COAT_COLOURS = [
  '#39406b',
  '#7a3b3b',
  '#2f5a4a',
  '#6b5233',
  '#4a3760',
  '#8a6a2e',
  '#2d4a6b',
  '#7d3f5c',
]

export const PERSON_FRAMES: CitySprite[] = [PERSON_A, PERSON_B].map((rows) => ({
  rows,
  palette: {
    k: '#15121f',
    s: '#d8a87e',
    c: '#39406b',
    t: '#2b2838',
  },
}))

/**
 * A car, side on, 16x8.
 *
 * Two frames differing only in the wheels, so the wheels appear to turn while
 * the body stays rigid. At this size that is the whole animation — a body that
 * bobbed would read as a suspension fault rather than as motion.
 */
const CAR_A = [
  '....kkkkkk......',
  '...kwwwwwwk.....',
  '..kkwwwwwwkkkkk.',
  '.kbbbbbbbbbbbbk.',
  'kbbbbbbbbbbbbbbk',
  'kbbbbbbbbbbbbbbk',
  '.kkdkkkkkkkdkkk.',
  '..ddd.....ddd...',
]

const CAR_B = [
  '....kkkkkk......',
  '...kwwwwwwk.....',
  '..kkwwwwwwkkkkk.',
  '.kbbbbbbbbbbbbk.',
  'kbbbbbbbbbbbbbbk',
  'kbbbbbbbbbbbbbbk',
  '.kkdkkkkkkkdkkk.',
  '..d.d.....d.d...',
]

/** Cab yellow first — it is a New York street and the cabs are the signal. */
export const CAR_COLOURS = ['#f0b429', '#f0b429', '#d9d7e0', '#3a4a7a', '#7a2f2f', '#2f4f3a']

export const CAR_FRAMES: CitySprite[] = [CAR_A, CAR_B].map((rows) => ({
  rows,
  palette: {
    k: '#15121f',
    b: '#f0b429',
    // Windows read as sky, because at this size that is what a window is.
    w: '#9fc4e0',
    d: '#22202e',
  },
}))

/**
 * A pigeon, 5x4, two frames: wings up and wings down.
 *
 * The single most characteristic small detail of a city street, and the
 * cheapest to draw. Flying ones only — a pigeon on the ground at five pixels
 * is a smudge.
 */
const PIGEON_UP = [
  '.k.k.',
  'kgkgk',
  '.ggg.',
  '..k..',
]

const PIGEON_DOWN = [
  '.....',
  '.ggg.',
  'kgggk',
  'k...k',
]

export const PIGEON_FRAMES: CitySprite[] = [PIGEON_UP, PIGEON_DOWN].map((rows) => ({
  rows,
  palette: {
    k: '#2a2733',
    g: '#8f95a8',
  },
}))
