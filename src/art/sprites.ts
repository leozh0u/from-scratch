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

/**
 * Realm icon: Survival, and the Fire element.
 *
 * Padded with a transparent column on each side to reach the 11x11 element
 * canvas. The drawing is untouched — without the padding this renders two
 * pixels narrower than every other icon and sits visibly small in the
 * inventory grid.
 */
export const FLAME: Sprite = {
  rows: [
    '.....r.....',
    '....rrr....',
    '...rrorr...',
    '...rooor...',
    '..rrooorr..',
    '..rooyoor..',
    '.rrooyoorr.',
    '.rooyyyoor.',
    '.rooyyyoor.',
    '..rooooor..',
    '...rrrrr...',
  ],
  palette: {
    r: '#d9452b',
    o: '#f08a29',
    y: '#ffd24a',
  },
}

/**
 * Realm icon: Everyday Objects, and the Cotton T-Shirt element.
 *
 * Padded with one transparent row to reach the 11x11 element canvas, for the
 * same reason as FLAME. The drawing is untouched.
 */
export const SHIRT: Sprite = {
  rows: [
    '...........',
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

/*
 * Element icons below this line.
 *
 * All of them are 11x11. Element sprites render inline at their natural size
 * with no fixed box — ElementTile just centres them — so a mixed set makes the
 * inventory grid sit unevenly. One canvas for every element is what keeps the
 * rows aligned. 11x11 was chosen because it already fits FLAME (9x11) and
 * SHIRT (11x10), the two icons that predate the convention.
 *
 * Lit from above-left, matching PINE: the lighter shade goes on the left of a
 * form and the darker on the right. Palette characters use case for shade —
 * lowercase lit, uppercase shadow — so a sprite can be read without consulting
 * the palette.
 *
 * Check new art at scale 2. That is the target list, and it is where detail
 * collapses first.
 */

/** Target: Survival. Wick and flame over a wax column in a brass holder. */
export const CANDLE: Sprite = {
  rows: [
    '.....r.....',
    '....ror....',
    '....oyo....',
    '.....o.....',
    '.....k.....',
    '...wwwWW...',
    '...wwwWW...',
    '...wwwWW...',
    '...wwwWW...',
    '...wwwWW...',
    '..bbbbbbb..',
  ],
  palette: {
    r: '#d9452b',
    o: '#f08a29',
    y: '#ffd24a',
    k: '#4a2d19',
    w: '#fdf6e3',
    W: '#e0d2b4',
    b: '#b8863b',
  },
}

/**
 * Target: Survival. The disposable flint-wheel kind — steel hood over a red
 * body, which is the silhouette the blurb's "fire striker, miniaturized"
 * description is actually about.
 */
export const LIGHTER: Sprite = {
  rows: [
    '.....y.....',
    '....oyo....',
    '.....o.....',
    '..sssssss..',
    '..sSSSSSs..',
    '..ggggggg..',
    '..gggggGG..',
    '..gggggGG..',
    '..gggggGG..',
    '..gggggGG..',
    '..GGGGGGG..',
  ],
  palette: {
    y: '#ffd24a',
    o: '#f08a29',
    s: '#c9ccd1',
    S: '#9aa0a8',
    g: '#e03e3e',
    G: '#a32828',
  },
}

/**
 * Target: Everyday. The band is not decoration — a plain silver cylinder at
 * this size reads as a battery. The tab row is what fixes it as a drink can.
 */
export const ALUMINUM_CAN: Sprite = {
  rows: [
    '..lllllll..',
    '..lLLLLLl..',
    '.mmmmmmmmm.',
    '.mmmmmmmMM.',
    '.rrrrrrrRR.',
    '.rrrrrrrRR.',
    '.mmmmmmmMM.',
    '.mmmmmmmMM.',
    '.mmmmmmmMM.',
    '.mmmmmmmMM.',
    '..LLLLLLL..',
  ],
  palette: {
    l: '#dfe3e8',
    L: '#a8aeb6',
    m: '#c9ccd1',
    M: '#9aa0a8',
    r: '#e03e3e',
    R: '#a32828',
  },
}

/**
 * Target: Everyday. The single-pixel highlight column down the left is doing
 * the work here — without it, green glass reads as solid plastic.
 */
export const GLASS_BOTTLE: Sprite = {
  rows: [
    '....ccc....',
    '....ggg....',
    '....ggG....',
    '...gggGG...',
    '..gggggGG..',
    '..hggggGG..',
    '..hggggGG..',
    '..hggggGG..',
    '..hggggGG..',
    '..gggggGG..',
    '..GGGGGGG..',
  ],
  palette: {
    c: '#a9703a',
    g: '#57a04a',
    G: '#2f6b33',
    h: '#9bd98f',
  },
}

/*
 * A note on the pale sprites below (cotton, salt, alumina, paraffin, wick).
 * ElementTile puts every icon on a white card, so a white-on-white sprite
 * disappears. Each of those carries a one-pixel grey rim — the 'o' key by
 * convention — which is what keeps the silhouette readable on the tile.
 *
 * Several elements are the same substance at different stages, or genuinely
 * look alike at this size. Those are separated by silhouette rather than by
 * colour, since colour is what dies first at scale 2:
 *
 *   salt / silica sand / soda ash / alumina  -> heap, heap, sack, crucible
 *   cotton fibre / raw cotton / ginned cotton -> puff, boll with bracts, bale
 *   cotton yarn / sewing thread               -> round ball, flanged spool
 *   molten aluminium / molten glass           -> in a crucible, on a blowpipe
 *   flint / limestone / manganese             -> shard, pale chunks, ingot
 */

// ---------------------------------------------------------------- Survival

/** Loose dry fibre, open enough to catch a spark. */
export const TINDER: Sprite = {
  rows: [
    '...........',
    '...........',
    '....t.t....',
    '..t.tTt.t..',
    '.tTtTtTtTt.',
    '.tTtTtTtTt.',
    '..tTtTtTt..',
    '...tTtTt...',
    '....ttt....',
    '...........',
    '...........',
  ],
  palette: {
    t: '#d9b877',
    T: '#a8854a',
  },
}

/** Small dry sticks, stacked crosswise the way a fire lay actually goes. */
export const KINDLING: Sprite = {
  rows: [
    '...........',
    '...........',
    '..b.....b..',
    '...b...b...',
    '....b.b....',
    'bbbbbBbbbbb',
    '....b.b....',
    '...b...b...',
    '..b.....b..',
    '...........',
    '...........',
  ],
  palette: {
    b: '#8b5a2b',
    B: '#6b4220',
  },
}

/** A struck shard — the conchoidal fracture is the whole point of flint. */
export const FLINT: Sprite = {
  rows: [
    '...........',
    '...........',
    '....ff.....',
    '...fffF....',
    '..ffffFF...',
    '.fffffFFF..',
    '.ffffFFFF..',
    '..fffFFF...',
    '...ffFF....',
    '....fF.....',
    '...........',
  ],
  palette: {
    f: '#6e7480',
    F: '#454b56',
  },
}

/** The striker bar. Held on the diagonal so it never reads as a plain ingot. */
export const HIGH_CARBON_STEEL: Sprite = {
  rows: [
    '...........',
    '.........s.',
    '........ss.',
    '.......ssS.',
    '......ssS..',
    '.....ssS...',
    '....ssS....',
    '...ssS.....',
    '..ssS......',
    '.ssS.......',
    '.sS........',
  ],
  palette: {
    s: '#b8c0cc',
    S: '#7c8593',
  },
}

/** Raw fibre, before it is anything else. */
export const COTTON_FIBER: Sprite = {
  rows: [
    '...........',
    '....ooo....',
    '..occcco...',
    '.occcccco..',
    '.occcccCo..',
    '.occccCCo..',
    '..occCCo...',
    '...oCCo....',
    '....oo.....',
    '...........',
    '...........',
  ],
  palette: {
    o: '#9aa0a8',
    c: '#ffffff',
    C: '#d8dde3',
  },
}

/** Comb wax. The alternating cells are what separate it from paraffin. */
export const BEESWAX: Sprite = {
  rows: [
    '...........',
    '...........',
    '..wwwwwww..',
    '..wHwHwHw..',
    '..wwwwwww..',
    '..wHwHwHw..',
    '..wwwwwww..',
    '..wHwHwHw..',
    '..WWWWWWW..',
    '...........',
    '...........',
  ],
  palette: {
    w: '#ffd24a',
    H: '#e0a828',
    W: '#c98f1e',
  },
}

/** Unrefined petroleum, drawn as the drum it travels in. */
export const CRUDE_OIL: Sprite = {
  rows: [
    '...........',
    '..ddddddd..',
    '..dDDDDDd..',
    '..ddddddd..',
    '..bbbbbbb..',
    '..ddddddd..',
    '..ddddddd..',
    '..bbbbbbb..',
    '..ddddddd..',
    '..dDDDDDd..',
    '...........',
  ],
  palette: {
    d: '#3a3f47',
    D: '#23272d',
    b: '#5a6069',
  },
}

/** Gas off a wellhead pipe — the plume is the only readable way to draw a gas. */
export const NATURAL_GAS: Sprite = {
  rows: [
    '...........',
    '...g...g...',
    '..g.g.g.g..',
    '..g.g.g.g..',
    '...g.g.g...',
    '....ggg....',
    '...ppppp...',
    '...pPPPp...',
    '...ppppp...',
    '...pPPPp...',
    '...........',
  ],
  palette: {
    g: '#9ad6e8',
    p: '#8c9299',
    P: '#5f666e',
  },
}

/** A burst, not a flame — this is the thing that lands in tinder, not fire. */
export const SPARK: Sprite = {
  rows: [
    '...........',
    '.....y.....',
    '..y..y..y..',
    '...y.y.y...',
    '....yyy....',
    '.yyyyWyyyy.',
    '....yyy....',
    '...y.y.y...',
    '..y..y..y..',
    '.....y.....',
    '...........',
  ],
  palette: {
    y: '#ffd24a',
    W: '#ffffff',
  },
}

/** The same bundle as TINDER, smouldering — a coal, deliberately not a flame. */
export const GLOWING_TINDER: Sprite = {
  rows: [
    '...........',
    '...........',
    '....o.o....',
    '..o.oRo.o..',
    '.oRoRoRoRo.',
    '.oRoRyRoRo.',
    '..oRoyoRo..',
    '...oRoRo...',
    '....ooo....',
    '...........',
    '...........',
  ],
  palette: {
    o: '#e07a34',
    R: '#8a3a14',
    y: '#ffd24a',
  },
}

/** Braided, not twisted — the offset strands are the braid. */
export const WICK: Sprite = {
  rows: [
    '...ooooo...',
    '...occco...',
    '...oCcco...',
    '...occCo...',
    '...oCcco...',
    '...occCo...',
    '...oCcco...',
    '...occCo...',
    '...oCcco...',
    '...occco...',
    '...ooooo...',
  ],
  palette: {
    o: '#9aa0a8',
    c: '#f4ecd8',
    C: '#c9b990',
  },
}

/** A plain cast block. Flat and white against beeswax's patterned yellow. */
export const PARAFFIN: Sprite = {
  rows: [
    '...........',
    '...........',
    '..ooooooo..',
    '..owwwwWo..',
    '..owwwwWo..',
    '..owwwwWo..',
    '..owwwwWo..',
    '..owwwwWo..',
    '..oWWWWWo..',
    '..ooooooo..',
    '...........',
  ],
  palette: {
    o: '#9aa0a8',
    w: '#fdfbf5',
    W: '#ddd8cc',
  },
}

/** Bottled under pressure — the nozzle is what makes it a canister, not a tin. */
export const BUTANE: Sprite = {
  rows: [
    '.....n.....',
    '....nnn....',
    '...bbbbb...',
    '..bbbbbBB..',
    '..bbbbbBB..',
    '..bbbbbBB..',
    '..bbbbbBB..',
    '..bwwwwBB..',
    '..bbbbbBB..',
    '..BBBBBBB..',
    '...........',
  ],
  palette: {
    n: '#8c9299',
    b: '#3fb8de',
    B: '#2a8fb0',
    w: '#ffffff',
  },
}

// ------------------------------------------- Everyday: cotton t-shirt chain

/** Ploughed rows under a thin grass cap. */
export const FARMLAND: Sprite = {
  rows: [
    '...........',
    '..ggggggg..',
    '.ddddddddd.',
    '.dDdDdDdDd.',
    '.ddddddddd.',
    '.dDdDdDdDd.',
    '.ddddddddd.',
    '.dDdDdDdDd.',
    '.DDDDDDDDD.',
    '...........',
    '...........',
  ],
  palette: {
    g: '#6abe30',
    d: '#8b5a2b',
    D: '#6b4220',
  },
}

/** A droplet, with the rim left light so it reads as volume rather than a blob. */
export const WATER: Sprite = {
  rows: [
    '.....w.....',
    '.....w.....',
    '....wbw....',
    '....wbw....',
    '...wbbbw...',
    '..wbbbbbw..',
    '..wbbbbBw..',
    '..wbbbBBw..',
    '...wbBBw...',
    '....www....',
    '...........',
  ],
  palette: {
    w: '#76d5ef',
    b: '#3fb8de',
    B: '#2a8fb0',
  },
}

/** Housing, feed roller, hand crank. */
export const COTTON_GIN: Sprite = {
  rows: [
    '...........',
    '..mmmmmmm..',
    '..mMMMMMm.c',
    '..m.....m.c',
    '..m.rrr.mcc',
    '..m.rrr.m..',
    '..m.....m..',
    '..mMMMMMm..',
    '..mmmmmmm..',
    '...........',
    '...........',
  ],
  palette: {
    m: '#8c9299',
    M: '#5f666e',
    r: '#e07a34',
    c: '#b8863b',
  },
}

/** A dyebath. The only saturated purple in the set, so it never gets confused. */
export const DYE: Sprite = {
  rows: [
    '...........',
    '.ooooooooo.',
    '.odddddddo.',
    '.odddddddo.',
    '..ovvvvvo..',
    '..ovvvvvo..',
    '..ovvvvvo..',
    '...oVVVo...',
    '...ooooo...',
    '...........',
    '...........',
  ],
  palette: {
    o: '#5f666e',
    d: '#b455d0',
    v: '#8c9299',
    V: '#5f666e',
  },
}

/** The boll on the plant — bracts and stem, which no later cotton stage has. */
export const RAW_COTTON: Sprite = {
  rows: [
    '...........',
    '....ooo....',
    '..occccco..',
    '.occcccCco.',
    '.occccCCco.',
    '..occCCco..',
    '...ogggo...',
    '....ggg....',
    '.....G.....',
    '.....G.....',
    '...........',
  ],
  palette: {
    o: '#9aa0a8',
    c: '#ffffff',
    C: '#d8dde3',
    g: '#6abe30',
    G: '#4a8c22',
  },
}

/** Seeds out, baled square — the shape is what separates it from raw cotton. */
export const GINNED_COTTON: Sprite = {
  rows: [
    '...........',
    '...........',
    '..ooooooo..',
    '..occccco..',
    '..ocCcCco..',
    '..occccco..',
    '..ocCcCco..',
    '..occccco..',
    '..oCCCCCo..',
    '..ooooooo..',
    '...........',
  ],
  palette: {
    o: '#9aa0a8',
    c: '#ffffff',
    C: '#d8dde3',
  },
}

/** Wound into a ball. Round, against the thread spool's flanges. */
export const COTTON_YARN: Sprite = {
  rows: [
    '...........',
    '...........',
    '...ooooo...',
    '..oyYyYyo..',
    '.oyYyYyYyo.',
    '.oYyYyYyYo.',
    '.oyYyYyYyo.',
    '..oYyYyYo..',
    '...ooooo...',
    '...........',
    '...........',
  ],
  palette: {
    o: '#9aa0a8',
    y: '#fdf6e3',
    Y: '#cfc3a4',
  },
}

/** Knitted yardage, undyed — a wide flat swatch. */
export const COTTON_JERSEY: Sprite = {
  rows: [
    '...........',
    '...........',
    '.ooooooooo.',
    '.ojJjJjJjo.',
    '.oJjJjJjJo.',
    '.ojJjJjJjo.',
    '.oJjJjJjJo.',
    '.ojJjJjJjo.',
    '.ooooooooo.',
    '...........',
    '...........',
  ],
  palette: {
    o: '#9aa0a8',
    j: '#fdf6e3',
    J: '#ddd4bd',
  },
}

/** The same swatch after the dyebath, in SHIRT's teal so the chain reads through. */
export const DYED_COTTON_FABRIC: Sprite = {
  rows: [
    '...........',
    '...........',
    '.ooooooooo.',
    '.otTtTtTto.',
    '.oTtTtTtTo.',
    '.otTtTtTto.',
    '.oTtTtTtTo.',
    '.otTtTtTto.',
    '.ooooooooo.',
    '...........',
    '...........',
  ],
  palette: {
    o: '#0f6d75',
    t: '#2ba3ae',
    T: '#16757e',
  },
}

/** Waxed and wound on a flanged spool, with the tail left loose. */
export const SEWING_THREAD: Sprite = {
  rows: [
    '...........',
    '..sssssss..',
    '..sSSSSSs..',
    '..ttttttt..',
    '..tTtTtTt..',
    '..ttttttt..',
    '..tTtTtTt..',
    '..sSSSSSs..',
    '..sssssss..',
    '.....t.....',
    '....t......',
  ],
  palette: {
    s: '#b8bdc5',
    S: '#8a9099',
    t: '#2ba3ae',
    T: '#16757e',
  },
}

// --------------------------------------------- Everyday: aluminium can chain

/** A heap, with one sparkle for the crystal — the only lit pixel in the set. */
export const SALT: Sprite = {
  rows: [
    '...........',
    '....y......',
    '...yyy.....',
    '....y......',
    '.....o.....',
    '....ooo....',
    '...occco...',
    '..occcCco..',
    '.occcCCcco.',
    '.ooooooooo.',
    '...........',
  ],
  palette: {
    y: '#ffd24a',
    o: '#9aa0a8',
    c: '#ffffff',
    C: '#d8dde3',
  },
}

/** Ore, not metal. The rust colour is the iron oxide that makes bauxite red. */
export const BAUXITE: Sprite = {
  rows: [
    '...........',
    '...........',
    '...bbb.....',
    '..bbbBB....',
    '..bbBBB.bb.',
    '..bBBB.bbBB',
    '...BB..bBBB',
    '.......bBBB',
    '........BB.',
    '...........',
    '...........',
  ],
  palette: {
    b: '#c4703c',
    B: '#8a4a22',
  },
}

/** The alloying metal, as a cast ingot. */
export const MANGANESE: Sprite = {
  rows: [
    '...........',
    '...........',
    '...........',
    '..mmmmmmm..',
    '.mmmmmmmmM.',
    '.mmmmmmmMM.',
    '.mMMMMMMMM.',
    '..MMMMMMM..',
    '...........',
    '...........',
    '...........',
  ],
  palette: {
    m: '#7d7f96',
    M: '#4a4c60',
  },
}

/** Caustic soda in a flask — the narrow neck marks it as the reagent. */
export const SODIUM_HYDROXIDE: Sprite = {
  rows: [
    '....ooo....',
    '....o.o....',
    '....o.o....',
    '...o...o...',
    '..o.....o..',
    '..o.nnn.o..',
    '.o.nnnnn.o.',
    '.o.nnnnN.o.',
    '.o.nnnnN.o.',
    '..ooooooo..',
    '...........',
  ],
  palette: {
    o: '#8a9099',
    n: '#cfe6ee',
    N: '#a2c6d4',
  },
}

/** Aluminium oxide, heaped in a crucible ready for the smelter. */
export const ALUMINA: Sprite = {
  rows: [
    '...........',
    '...........',
    '....ooo....',
    '..oooaaoo..',
    '.oaaaaaaao.',
    '.oaaaaAAAo.',
    '.ccccccccc.',
    '.cCCCCCCCc.',
    '..cCCCCCc..',
    '...ccccc...',
    '...........',
  ],
  palette: {
    o: '#9aa0a8',
    a: '#ffffff',
    A: '#d8dde3',
    c: '#8c9299',
    C: '#5f666e',
  },
}

/** Anode carbon. The blackest thing in the set, against limestone's pale grey. */
export const PETROLEUM_COKE: Sprite = {
  rows: [
    '...........',
    '...........',
    '..kkk......',
    '.kkkKK.kk..',
    '.kkKKK.kKK.',
    '.kKKK..kKK.',
    '..KK...KK..',
    '....kkk....',
    '....kKK....',
    '.....K.....',
    '...........',
  ],
  palette: {
    k: '#4a4a4a',
    K: '#232323',
  },
}

/** Out of the pot cell and glowing, still in its crucible. */
export const MOLTEN_ALUMINUM: Sprite = {
  rows: [
    '...........',
    '...........',
    '.ggggggggg.',
    '.gyyyyyyyg.',
    '.gyyyyyyGg.',
    '..ccccccc..',
    '..cCCCCCc..',
    '..cCCCCCc..',
    '...cCCCc...',
    '....ccc....',
    '...........',
  ],
  palette: {
    g: '#ffd24a',
    y: '#ffeaa0',
    G: '#f08a29',
    c: '#8c9299',
    C: '#5f666e',
  },
}

/** Rolled flat. Drawn on the skew so a flat sheet still reads as a sheet. */
export const ALUMINUM_SHEET: Sprite = {
  rows: [
    '...........',
    '...........',
    '...........',
    '...ssssssss',
    '..ssssssssS',
    '.ssssssssSS',
    'ssssssssSS.',
    'SSSSSSSSS..',
    '...........',
    '...........',
    '...........',
  ],
  palette: {
    s: '#d4d9e0',
    S: '#98a0aa',
  },
}

// ---------------------------------------------- Everyday: glass bottle chain

/** A heap of sand — same silhouette as salt, separated purely by colour. */
export const SILICA_SAND: Sprite = {
  rows: [
    '...........',
    '...........',
    '...........',
    '.....s.....',
    '....sss....',
    '...sssSs...',
    '..sssSSSs..',
    '.sssSSSSSs.',
    '.sssSSSSSs.',
    '.SSSSSSSSS.',
    '...........',
  ],
  palette: {
    s: '#e0c08a',
    S: '#b8945c',
  },
}

/** Sodium carbonate, sacked — the tied neck is what tells it from a heap. */
export const SODA_ASH: Sprite = {
  rows: [
    '...........',
    '....ooo....',
    '...o...o...',
    '..ooooooo..',
    '..oaaaaAo..',
    '..oaaaaAo..',
    '..oaaaaAo..',
    '..oaaaaAo..',
    '..oAAAAAo..',
    '..ooooooo..',
    '...........',
  ],
  palette: {
    o: '#9aa0a8',
    a: '#f2efe6',
    A: '#d8d3c4',
  },
}

/** Quarried chunks. Pale, against flint's dark single shard. */
export const LIMESTONE: Sprite = {
  rows: [
    '...........',
    '...........',
    '..lll......',
    '.lllLL.....',
    '.llLLL.lll.',
    '.lLLL.llLL.',
    '..LL..lLLL.',
    '......lLLL.',
    '.......LL..',
    '...........',
    '...........',
  ],
  palette: {
    l: '#c6cad1',
    L: '#8f959f',
  },
}

/** Water glass in a squat jar, against the hydroxide flask's narrow neck. */
export const SODIUM_SILICATE: Sprite = {
  rows: [
    '...........',
    '...ooooo...',
    '...o...o...',
    '..ooooooo..',
    '..oxxxxxo..',
    '..oxxxxXo..',
    '..oxxxxXo..',
    '..oxxxxXo..',
    '..oXXXXXo..',
    '..ooooooo..',
    '...........',
  ],
  palette: {
    o: '#9aa0a8',
    x: '#b8e0d8',
    X: '#8ec0b6',
  },
}

/** A gathered gob on the blowpipe — the pipe is what separates it from metal. */
export const MOLTEN_GLASS: Sprite = {
  rows: [
    '...........',
    '.........p.',
    '........p..',
    '.......p...',
    '..ggg.p....',
    '.gyyyg.....',
    '.gyyyyg....',
    '.gyyyyg....',
    '..gyyg.....',
    '...gg......',
    '...........',
  ],
  palette: {
    p: '#8c9299',
    g: '#f08a29',
    y: '#ffd24a',
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

/*
 * PADLOCK — hung on a locked control.
 *
 * Leo's reference is a treasure chest with heavy padlocks hanging off the
 * front. The locks ARE the statement there; there is no chain in the picture
 * at all. An earlier version of this file tried three increasingly heavy
 * chain-link sprites and every one read as a decorative border rather than as
 * chain, because a thin row of repeated links inside a wide short button
 * always will. The chain is gone.
 *
 * So this is drawn big and with real weight: a two-tone steel shackle, a brass
 * body with a lit face and a shadowed base, and a hard outline the whole way
 * round. Light from above-left, matching PINE and the rest of the set.
 */
export const PADLOCK: Sprite = {
  rows: [
    '................',
    '.....KKKKKK.....',
    '....KSSSSSSK....',
    '...KSSKKKKSSK...',
    '...KSK....KsK...',
    '...KSK....KsK...',
    '...KSK....KsK...',
    '...KSK....KsK...',
    '..KKKKKKKKKKKK..',
    '..KBBBBBBBBBBK..',
    '..KBBBBBBBBBBK..',
    '..KBBBBhhBBBBK..',
    '..KBBBBhhBBBBK..',
    '..KBbBBhhBBbBK..',
    '..KBbBBBhBBbBK..',
    '..KbbbBhBBbbcK..',
    '..KbbbbbbbbbcK..',
    '..KccccccccccK..',
    '..KKKKKKKKKKKK..',
    '................',
  ],
  palette: {
    K: '#120f1a',
    // Shackle — steel, lit on the left arm and shadowed on the right so it
    // reads as a bent rod rather than two posts.
    S: '#d8d5e8',
    s: '#8d8aa8',
    /*
     * Body — STEEL, not brass.
     *
     * Brass reads as treasure: a gold padlock on a dark panel is a chest, and
     * this is a locked door, not loot. Cool grey keeps it as a plain heavy
     * lock. It is still the brightest thing on a dead button, which is what
     * makes it the first thing the eye lands on.
     */
    B: '#cdcae0',
    b: '#9895b4',
    c: '#605d7c',
    h: '#3a2a08',
  },
}

/*
 * CHAIN LINK — for a chain laid diagonally across a locked control.
 *
 * WHY THE RUN IS DIAGONAL AND THE SPRITE IS NOT
 *
 * A chain straight across the middle of a button reads as a decorative
 * border; three increasingly heavy horizontal versions all failed that way.
 * Running it on a slant fixes it, because a slant is not a thing a border
 * does.
 *
 * But the sprite itself stays upright. Rotating pixel art resamples the grid
 * and turns every hard edge into grey mush, which is the exact failure the
 * whole visual direction exists to avoid. Instead each link is placed a few
 * whole pixels further right AND a few further down than the last, so the RUN
 * descends while every link stays perfectly square. Same trick as the sway
 * animation: whole-pixel offsets, never a transform.
 *
 * The pair repeats — a flat ring, then one seen edge-on — because a real
 * chain alternates, and tiling a single ring reads as a row of circles.
 */
export const CHAIN_LINK: Sprite = {
  rows: [
    '................',
    '....LLLL........',
    '...LHHHHL...LL..',
    '..LHHLLHHL.LHHL.',
    '..LHL..LHLLHHHHL',
    '..LHL..LHLLHHHHL',
    '..LHL..LHLLHHHHL',
    '..LHL..LHLLHHHHL',
    '..LHL..LHLLHHHHL',
    '..LHHLLHHL.LDDL.',
    '...LDDDDL...LL..',
    '....LLLL........',
    '................',
  ],
  palette: {
    // Cold iron, deliberately not the greys of the locked button face, or the
    // chain sinks into it.
    L: '#181628',
    H: '#cfcce6',
    D: '#6e6b93',
  },
}
