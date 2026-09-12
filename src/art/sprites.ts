import type { Sprite } from '../components/PixelArt'

/** Classic 8-bit cloud: flat-bottomed, lit from above, one shade row beneath. */
export const CLOUD: Sprite = {
  rows: [
    '.....wwww.....',
    '...wwwwwwww...',
    '..wwwwwwwwww..',
    '.wwwwwwwwwwww.',
    'wwwwwwwwwwwwww',
    '.ssssssssssss.',
  ],
  palette: {
    w: '#ffffff',
    s: '#d6edf7',
  },
}

/**
 * Pine tree. Lit from the left: the left half uses the lighter green and the
 * right half the dark, which is what stops it reading as a flat triangle.
 */
export const PINE: Sprite = {
  rows: [
    '.....g.....',
    '....ggk....',
    '...gggkk...',
    '..ggggkkk..',
    '....ggk....',
    '...gggkk...',
    '..ggggkkk..',
    '.gggggkkkk.',
    '...gggkk...',
    '..ggggkkk..',
    '.gggggkkkk.',
    'gggggGkkkkk',
    '.....tT....',
    '.....tT....',
    '....ttTT...',
  ],
  palette: {
    g: '#4e9a3a',
    G: '#3a7a2c',
    k: '#2a5a20',
    t: '#6b4226',
    T: '#4a2d19',
  },
}

/** Realm icon: Survival. */
export const FLAME: Sprite = {
  rows: [
    '....r....',
    '...rrr...',
    '..rrorr..',
    '..rooor..',
    '.rrooorr.',
    '.rooyoor.',
    'rrooyoorr',
    'rooyyyoor',
    'rooyyyoor',
    '.rooooor.',
    '..rrrrr..',
  ],
  palette: {
    r: '#d9452b',
    o: '#f08a29',
    y: '#ffd24a',
  },
}

/** Realm icon: Everyday Objects — and the demo's hero object. */
export const SHIRT: Sprite = {
  rows: [
    'ccc..c..ccc',
    'ccccc.ccccc',
    'ccccccccccc',
    'ccccccccccc',
    '.ccccccccc.',
    '..ccccccc..',
    '..ccccccc..',
    '..ccccccc..',
    '..ccccccc..',
    '..ddddddd..',
  ],
  palette: {
    c: '#2ba3ae',
    d: '#16757e',
  },
}

/**
 * Ground tile — grass cap over dirt, with pebbles scattered irregularly so the
 * repeat is not obvious. 16 sprite pixels wide, so at scale 4 it tiles every
 * 64 CSS pixels.
 */
export const GROUND: Sprite = {
  rows: [
    'llllllllllllllll',
    'gggggggggggggggg',
    'gggggggggggggggg',
    'kgkkgggkkgggkkgg',
    'kkkkkkkkkkkkkkkk',
    'dddDdddddddLdddd',
    'ddddddLdddddddDd',
    'dDdddddddsdddddd',
    'ddddLdddddddddDd',
    'dddddddDddddLddd',
    'dLdddddddddddddd',
    'ddddddddDdddddsd',
    'dddLdddddddddddd',
    'ddddddddddDddddd',
    'dddddddddddddddd',
    'ddDdddddLddddddd',
    'dddddddddddddddd',
    'ddddddddddddddDd',
    'dddddddddddddddd',
    'dddddddddddddddd',
  ],
  palette: {
    l: '#7ed04a',
    g: '#6abe30',
    k: '#4a8c22',
    d: '#8b5a2b',
    D: '#6b4220',
    L: '#a9703a',
    s: '#7e7e7e',
  },
}
