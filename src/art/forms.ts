import type { Sprite } from '../components/PixelArt'

/**
 * The shapes every material in the game can take.
 *
 * WHY THIS EXISTS: SPRITES WERE THE HARD CAP ON SCOPE
 *
 * Seventy-eight hand-drawn 11x11 sprites got us to 72 elements, and the data
 * test refuses to let two elements share one. At roughly two minutes a sprite,
 * three hundred elements is seven hours of drawing — which made art, not
 * chemistry, the thing standing between this and Little Alchemy scale.
 *
 * But a game about materials does not need three hundred drawings. It needs
 * about twenty FORMS. Almost everything here is a powder, a liquid, an ingot,
 * a sheet, a lump, a tuft of fibre, a bolt of cloth, a gas, a crystal, a
 * bottle, a tool, a machine, a plant, a log, a coil, a brick, a pellet, a
 * flame, a board or a wheel. Draw each once, then colour it per element.
 *
 * Two hundred elements becomes twenty drawings and two hundred colours, and
 * every one is still a distinct bitmap, so "no two elements share a sprite"
 * keeps passing.
 *
 * PALETTE SLOTS ARE SEMANTIC, NOT LITERAL
 *
 * `k` is the outline, `a` the lit face, `b` the body, `c` the shadow side.
 * Light comes from the upper left in every one of them, which is the rule the
 * hand-drawn sprites follow and what stops a mixed set looking like it came
 * from two different games.
 */

export type FormId =
  | 'powder' | 'liquid' | 'ingot' | 'sheet' | 'lump' | 'fibre' | 'cloth'
  | 'gas' | 'crystal' | 'bottle' | 'tool' | 'machine' | 'plant' | 'log'
  | 'coil' | 'brick' | 'pellet' | 'flame' | 'board' | 'wheel'
  | 'book' | 'bar' | 'heap'
  | 'engine' | 'box' | 'tower' | 'panel' | 'drum' | 'rod' | 'ring'
  | 'blade' | 'cone' | 'dish' | 'card' | 'vial' | 'spool' | 'grid'
  | 'arch' | 'wedge' | 'spiral' | 'fan' | 'cross' | 'fork' | 'cup'
  | 'tube' | 'hook' | 'saw' | 'nib' | 'jar' | 'cap' | 'pin' | 'clip'
  | 'lens' | 'wave' | 'leafy' | 'seedpod' | 'brush' | 'anvilf'
  | 'coilspring' | 'plate'
  | 'roll' | 'slab' | 'chip' | 'star' | 'shell'

/** Rows only: the palette is filled in per element by `composeSprite`. */
export const FORMS: Record<FormId, string[]> = {
  powder: [
    '...........','...........','...........','.....k.....','....kak....',
    '...kabak...','..kabbbak..','.kabbbcbak.','kkkkkkkkkkk','...........','...........',
  ],
  liquid: [
    '.....k.....','....kak....','...kaabk...','..kaabbbk..','..kabbbck..',
    '.kabbbbcck.','.kabbbccck.','..kbbbcck..','...kkkkk...','...........','...........',
  ],
  ingot: [
    '...........','...........','...kkkkkk..','..kaaaaakk.','.kaaaaaabbk',
    'kbbbbbbbbck','kbbbbbbbcck','.kccccccck.','..kkkkkkk..','...........','...........',
  ],
  sheet: [
    '...........','...........','kkkkkkkkkkk','kaaaaaaaaak','kabbbbbbbck',
    'kabbbbbbbck','kcccccccccK','kkkkkkkkkkk','...........','...........','...........',
  ],
  lump: [
    '...........','....kkkk...','...kaaakk..','..kaaabbbk.','.kaabbbbck.',
    '.kabbbbcck.','.kbbbbccck.','..kbbccck..','...kkkkkk..','...........','...........',
  ],
  fibre: [
    '...........','..a..a..a..','.kakakakak.','.kabababak.','..kabbbak..',
    '..kabbbak..','...kabak...','...kabak...','....kkk....','...........','...........',
  ],
  cloth: [
    '...........','...........','.kkkkkkkkk.','.kababababk','.kbabababak','.kababababk',
    '.kbabababck','.kcccccccck','.kkkkkkkkk.','...........','...........',
  ],
  gas: [
    '..a...a....','...a...a...','..a.a.a.a..','.kkkkkkkk..','.kabbbbak..',
    '.kabbbbbk..','.kbbbbcck..','..kkkkkk...','...........','...........','...........',
  ],
  crystal: [
    '.....k.....','....kak....','...kaabk...','..kaabbbk..','..kaabbbk..',
    '..kabbbck..','...kbbck...','....kck....','.....k.....','...........','...........',
  ],
  bottle: [
    '....kkk....','....kak....','....kak....','...kkakk...','..kaabbbk..',
    '..kabbbck..','..kabbbck..','..kabbbck..','..kkkkkkk..','...........','...........',
  ],
  tool: [
    '.........k.','........kak','.......kaak','kkkkkkkabk.','kcccccabk..',
    'kkkkkkkbk..','.....kkk...','...........','...........','...........','...........',
  ],
  machine: [
    '...........','..kkkkkkk..','.kaaaaaaak.','.kabbbbbak.','.kabkkkbak.',
    '.kabkakbak.','.kabbbbbck.','.kccccccck.','.kkkkkkkkk.','..k.....k..','..kk...kk..',
  ],
  plant: [
    '.....k.....','..k..k..k..','.kak.kak.k.','.kabkabkak.','..kabbbak..',
    '...kabak...','....kbk....','....kck....','....kkk....','...........','...........',
  ],
  log: [
    '...........','...kkkkk...','..kaaaaak..','.kabkkkbak.','.kabkakbak.',
    '.kabkkkbak.','.kbbbbbbck.','..kccccck..','...kkkkk...','...........','...........',
  ],
  coil: [
    '...........','..kkkkkkk..','.kaaaaaaak.','.kakkkkkak.','.kakaaakak.',
    '.kakkkkkak.','.kbbbbbbbk.','.kccccccck.','..kkkkkkk..','...........','...........',
  ],
  brick: [
    '...........','...........','kkkkkkkkkkk','kaaakaaaakk','kbbbkbbbbck',
    'kkkkkkkkkkk','kbbbbkbbbck','kcccckcccck','kkkkkkkkkkk','...........','...........',
  ],
  pellet: [
    '...........','...........','..kk...kk..','.kaak.kaak.','.kabk.kabk.',
    '..kk.k.kk..','...kaak....','...kabk....','....kk.....','...........','...........',
  ],
  flame: [
    '.....a.....','....aba....','...abbba...','..abbbbba..','..kbbbbbk..',
    '.kcbbbbbck.','.kccbbbcck.','..kcccck...','...kkkk....','...........','...........',
  ],
  /*
   * A BOOK. Cover, a stack of leaves down one side, and a spine.
   *
   * Added rather than reusing `board`, which is what the first pass did: a
   * red plank is not a book, it is a red plank. A form earns its place in the
   * vocabulary when it is the difference between an icon and a colour swatch.
   */
  book: [
    '...........','.kkkkkkkkk.','.kabbbbbbck','.kabbbbbbck','.kabbbbbbck',
    '.kabbbbbbck','.kabbbbbbck','.kabbbbbbck','.kcccccccck','.kkkkkkkkk.','...........',
  ],
  /*
   * A BAR: a rounded block with a stamped hollow across it, which is what a
   * pressed cake of anything looks like. Distinct from `brick` by being a
   * single object rather than stacked courses.
   */
  bar: [
    '...........','...........','..kkkkkkk..','.kaaaaaaak.','kabbbbbbbak',
    'kabkkkkkbak','kabbbbbbbak','kcccccccccK','.kkkkkkkkk.','...........','...........',
  ],
  /*
   * A HEAP, for anything poured out rather than measured: a loose pile with a
   * ragged top edge, where `powder` is a neat cone. Two forms because the game
   * now has half a dozen powders and they cannot all be the same triangle.
   */
  heap: [
    '...........','...........','...........','.....k.....','....kak....',
    '..kkaaakk..','.kaaabaaak.','kabbbbbbbak','kcccccccccK','kkkkkkkkkkk','...........',
  ],
  engine: [
    '...........','..kkkkkkk..','.kaaaaaaak.','.kabbbbbak.','kkabkbkbakk','kaabbbbbaak','.kabbbbbak.','.kccccccck.','..kkkkkkk..','...k...k...','...........',
  ],
  box: [
    '...........','.kkkkkkkkk.','.kaaaaaaak.','.kabbbbbak.','.kabbbbbak.','.kabbbbbak.','.kabbbbbak.','.kabbbbbak.','.kccccccck.','.kkkkkkkkk.','...........',
  ],
  tower: [
    '....kkk....','...kaaak...','...kabak...','...kabak...','..kkabakk..','..kaabaak..','..kabbbak..','.kabbbbbak.','.kcccccck..','.kkkkkkkk..','...........',
  ],
  panel: [
    '...........','kkkkkkkkkkk','kababababab','kbababababk','kababababab','kbababababk','kababababab','kcccccccccK','kkkkkkkkkkk','...........','...........',
  ],
  drum: [
    '...........','..kkkkkkk..','.kaaaaaaak.','.kbbbbbbbk.','.kbbbbbbbk.','.kbbbbbbbk.','.kbbbbbbbk.','.kccccccck.','..kkkkkkk..','...........','...........',
  ],
  rod: [
    '...........','...........','...........','.....k.....','.....a.....','kkkkkakkkkk','kaaaaaaaaak','kccccccccck','kkkkkkkkkkk','...........','...........',
  ],
  ring: [
    '...kkkkk...','..kaaaaak..','.kaakkkaak.','.kak...kak.','.kak...kak.','.kak...kak.','.kaakkkaak.','..kcccccK..','...kkkkk...','...........','...........',
  ],
  blade: [
    '.........k.','........ka.','.......kaa.','......kaak.','.....kaak..','....kaak...','...kaak....','..kbak.....','.kbbk......','.kkk.......','...........',
  ],
  cone: [
    '.....k.....','....kak....','....kak....','...kaaak...','...kabak...','..kaabaak..','..kabbbak..','.kabbbbbak.','.kccccccck.','.kkkkkkkkk.','...........',
  ],
  dish: [
    '...........','...........','kkkkkkkkkkk','kaaaaaaaaak','.kbbbbbbbk.','.kbbbbbbbk.','..kcccccK..','..kkkkkkk..','....k.k....','...kkkkk...','...........',
  ],
  card: [
    '...........','.kkkkkkkkk.','.kaaaaaaak.','.kabbbbbak.','.kabkkkbak.','.kabbbbbak.','.kabkkkbak.','.kabbbbbak.','.kccccccck.','.kkkkkkkkk.','...........',
  ],
  vial: [
    '....kkk....','....kak....','....kak....','...kaaak...','..kabbbak..','.kabbbbbak.','.kabbbbbak.','.kccccccck.','..kkkkkkk..','...........','...........',
  ],
  spool: [
    '..kkkkkkk..','..kaaaaak..','..kkkkkkk..','...kbbbk...','...kbbbk...','...kbbbk...','..kkkkkkk..','..kccccck..','..kkkkkkk..','...........','...........',
  ],
  grid: [
    '...........','kkkkkkkkkkk','kakakakakak','kkkkkkkkkkk','kakakakakak','kkkkkkkkkkk','kakakakakak','kccccccccck','kkkkkkkkkkk','...........','...........',
  ],
  arch: [
    '...........','...kkkkk...','..kaaaaak..','.kaakkkaak.','.kak...kak.','.kak...kak.','.kak...kak.','.kck...kck.','.kkk...kkk.','...........','...........',
  ],
  wedge: [
    '...........','.........k.','........ka.','.......kaa.','......kaaa.','.....kaaaa.','....kaaaaa.','...kccccca.','...kkkkkkk.','...........','...........',
  ],
  spiral: [
    '...........','..kkkkkkk..','.kaaaaaaak.','.kakkkkkak.','.kak...kak.','.kak.kkkak.','.kak.kaaak.','.kckkkcccK.','..kkkkkkk..','...........','...........',
  ],
  fan: [
    '.....k.....','....kak....','...kaaak...','..kaaaaak..','.kaaaaaaak.','kaaaaaaaaak','kccccccccck','.....k.....','.....k.....','....kkk....','...........',
  ],
  cross: [
    '....kkk....','....kak....','....kak....','kkkkkakkkkk','kaaaaaaaaak','kccccccccck','....kck....','....kck....','....kkk....','...........','...........',
  ],
  fork: [
    '.k.k.k.....','.k.k.k.....','.k.k.k.....','.kakakk....','.kaaaak....','..kaak.....','...kak.....','...kak.....','...kck.....','...kkk.....','...........',
  ],
  cup: [
    '...........','.kkkkkkk.k.','.kaaaaak.k.','.kbbbbbkkk.','.kbbbbbk...','.kbbbbbk...','.kcccccK...','..kkkkk....','...........','...........','...........',
  ],
  roll: [
    '...........','..kkkkkkk..','.kaaaaaaak.','.kabbbbbak.','.kabkkkbak.','.kabbbbbak.','.kccccccck.','..kkkkkkk..','...........','...........','...........',
  ],
  slab: [
    '...........','...........','kkkkkkkkkkk','kaaaaaaaaak','kbbbbbbbbbk','kbbbbbbbbbk','kcccccccccK','kkkkkkkkkkk','...........','...........','...........',
  ],
  chip: [
    '...........','.k.k.k.k.k.','kkkkkkkkkkk','kaaaaaaaaak','kabbbbbbbak','kabbbbbbbak','kcccccccccK','kkkkkkkkkkk','.k.k.k.k.k.','...........','...........',
  ],
  star: [
    '.....k.....','....kak....','....kak....','k.kkaakk.k.','.kaaaaaaak.','..kaaaaak..','..kaaaaak..','.kck...kck.','.kkk...kkk.','...........','...........',
  ],
  shell: [
    '...........','....kkk....','..kkaaakk..','.kaaaaaaak.','kaabababaak','kababababab','kcbcbcbcbck','.kkkkkkkkk.','...........','...........','...........',
  ],
  tube: [
    '...........','...........','..kkkkkkk..','.kaaaaaaak.','.kbkkkkkbk.','.kbkkkkkbk.','.kccccccck.','..kkkkkkk..','...........','...........','...........',
  ],
  hook: [
    '....kkk....','...kaak....','...kak.....','...kak.....','...kak.....','..kkak.....','.kaakk.....','.kak.......','.kckkk.....','..kkkk.....','...........',
  ],
  saw: [
    '...........','...........','kkkkkkkkkkk','kaaaaaaaaak','kcccccccccK','k.k.k.k.k.k','...........','...........','...........','...........','...........',
  ],
  nib: [
    '.....k.....','....kak....','....kak....','...kaaak...','...kabak...','...kabak...','...kabak...','...kcack...','....k.k....','.....k.....','...........',
  ],
  jar: [
    '...kkkkk...','...kaaak...','..kkkkkkk..','.kaaaaaaak.','.kbbbbbbbk.','.kbbbbbbbk.','.kbbbbbbbk.','.kccccccck.','..kkkkkkk..','...........','...........',
  ],
  cap: [
    '...........','...........','..kkkkkkk..','.kaaaaaaak.','kababababab','kcccccccccK','.kkkkkkkkk.','...........','...........','...........','...........',
  ],
  pin: [
    '...kkk.....','..kaaak....','..kaaak....','...kak.....','....k......','....k......','....k......','....k......','....k......','....k......','...........',
  ],
  clip: [
    '..kkkkkkk..','.kaaaaaaak.','.kakkkkkak.','.kak...kak.','.kakkkkkak.','.kaaaaaaak.','.kckkkkkck.','.kk.....kk.','...........','...........','...........',
  ],
  lens: [
    '...........','...kkkkk...','..kaaaaak..','.kaaaaaaak.','kaaaaaaaaak','.kaaaaaaak.','..kcccccK..','...kkkkk...','...........','...........','...........',
  ],
  wave: [
    '...........','...........','.kk.....kk.','kaakk.kkaak','k..kakak..k','k...kck....','kkkkkkkkkkk','...........','...........','...........','...........',
  ],
  leafy: [
    '.....k.....','....kak....','..kkaakk...','.kaaaaaak..','kaaaaaaaak.','.kaabaaak..','..kaabak...','...kcak....','....kk.....','.....k.....','...........',
  ],
  seedpod: [
    '...........','....kkk....','...kaaak...','..kaabaak..','.kaabbbaak.','.kabbbbbak.','.kabbbbbak.','..kcccccK..','...kkkkk...','...........','...........',
  ],
  brush: [
    '....kkk....','....kak....','....kak....','....kak....','...kkakk...','..kaaaaak..','..kbbbbbk..','..kbbbbbk..','..kcccccK..','..kkkkkkk..','...........',
  ],
  anvilf: [
    '...........','kkkkkkkkkkk','kaaaaaaaaak','kcccccccccK','..kkkkkkk..','...kbbbk...','...kbbbk...','..kkbbbkk..','.kaaaaaaak.','.kkkkkkkkk.','...........',
  ],
  coilspring: [
    '..kkkkkkk..','.kaaaaaaak.','.kkkkkkkkk.','..kaaaaak..','..kkkkkkk..','.kaaaaaaak.','.kkkkkkkkk.','..kcccccK..','..kkkkkkk..','...........','...........',
  ],
  plate: [
    '...........','...........','.kkkkkkkkk.','kaaaaaaaaak','kabbbbbbbak','kabbbbbbbak','kcccccccccK','.kkkkkkkkk.','...........','...........','...........',
  ],
  board: [
    '...........','...........','...........','kkkkkkkkkkk','kaaaaaaaaak',
    'kbbbbbbbbbk','kcccccccccK','kkkkkkkkkkk','...........','...........','...........',
  ],
  /*
   * ROUND, WITH SPOKES.
   *
   * The first one was a squared-off ring and on the contact sheet it read as a
   * crate — worse, as the same crate the Wood icon already is. A wheel is
   * recognised by two things at this size and neither of them is the tyre: it
   * is round, and light shows through between the spokes. So the rim steps
   * like a circle and the interior is transparent except for four spokes and a
   * hub.
   */
  wheel: [
    '...kkkkk...','.kkaaaaakk.','.kakk.kkak.','kak.kbk.kak','kakkkbkkkak',
    'ka.bbbbbb.k','kakkkckkkak','kck.kck.kck','.kckk.kkck.','.kkcccccKk.','...kkkkk...',
  ],
}

/** Every form is a rectangle. Ragged rows misalign silently in the renderer. */
export function checkForms(): string[] {
  const bad: string[] = []
  for (const [id, rows] of Object.entries(FORMS)) {
    if (rows.length !== 11) bad.push(`${id}: ${rows.length} rows`)
    for (const [i, row] of rows.entries()) {
      if (row.length !== 11) bad.push(`${id} row ${i}: ${row.length} wide`)
    }
  }
  return bad
}

/* --- turning one base colour into a lit face, a body and a shadow --- */

function clamp(n: number) { return Math.max(0, Math.min(255, Math.round(n))) }

function shift(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const to = (v: number) => (factor >= 1 ? v + (255 - v) * (factor - 1) : v * factor)
  return `#${[to(r), to(g), to(b)].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`
}

/**
 * A form plus one colour makes a sprite.
 *
 * The three shades are derived rather than chosen, so adding an element is one
 * hex code rather than a palette. `K` is a second, softer shadow used where a
 * form wants an edge that is dark but not the full outline.
 */
export function composeSprite(form: FormId, base: string): Sprite {
  return {
    rows: FORMS[form],
    palette: {
      k: shift(base, 0.28),
      K: shift(base, 0.45),
      a: shift(base, 1.34),
      b: base,
      c: shift(base, 0.7),
    },
  }
}
