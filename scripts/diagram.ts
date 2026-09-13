/**
 * The diagrams, drawn the way the game is drawn.
 *
 * WHY THEY LOOK LIKE THIS
 *
 * Leo: *"take inspiration from the internet, and also more like the site
 * style, like the 3d buttons and pixelated stuff, maybe even the
 * background"*, and before that: *"the resolution/size/prportions feels off,
 * like too wide... the words are too small. hard to read. make it more simple
 * maybe... dont have the subheadings its very ai esque."*
 *
 * All four notes are the same note: these were laid out like documentation and
 * they needed to be laid out like slides. So:
 *
 * - **1920x1080, every one of them.** The first pass sized each canvas to its
 *   own content, which gave six different ultra-wide shapes that no timeline
 *   wants. A video is 16:9 and that is not negotiable by a diagram.
 * - **Type roughly three times bigger**, which forces the real discipline:
 *   there is room for about twelve words a panel, so only the twelve that
 *   matter survive.
 * - **No section headings.** "And the trade-off, since there is one" is an
 *   essay's furniture, and on a slide it reads as something written to fill a
 *   slot rather than something somebody wanted to say.
 * - **Panels are built like the game's buttons** — an extruded base, a face
 *   inset on top of it, a hard bevel on all four sides, stepped corners — over
 *   the game's own starfield. Same palette, same font, no blur, no gradient.
 *
 *   npm run diagram
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolveIcon, COMPOSED } from '../src/data/iconRegistry'
import { spriteRuns } from '../src/components/PixelArt'
import { composeSprite, FORMS } from '../src/art/forms'
import { GAME_DATA } from '../src/data/gameData'

const OUT = 'docs'
const W = 1920
const H = 1080
const FONT = "'Press Start 2P'"

const SKY = '#191536'
const INK = '#100d20'
const TEXT = '#ffffff'
const MUTED = '#a29ec4'
const BRAND = '#e8752c'
const GOOD = '#6fc48d'
const STAR = ['#6f6c9a', '#a8a6c8', '#ffffff']

/** The game's button tones, so a panel here is a key there. */
const TONE = {
  purple: { face: '#5b58a8', hi: '#8e8ad8', lo: '#3c3a7a', base: '#272552' },
  orange: { face: '#e8752c', hi: '#ffab5e', lo: '#b5501a', base: '#7a3310' },
  teal: { face: '#22a2bd', hi: '#68dcef', lo: '#137689', base: '#0b4a59' },
  sunk: { face: '#1e1b38', hi: '#3a3560', lo: '#12102a', base: '#0b0918' },
}
type ToneId = keyof typeof TONE

/** Deterministic, so a re-render is the render before it. */
function rnd(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * The game's sky, behind every slide.
 *
 * Whole pixels at scale 3 and two shapes of star — a single block and a plus —
 * which is what makes it read as 8-bit rather than as noise. Same as
 * `Starfield.tsx`; drawn here rather than imported because that one paints to
 * a canvas and this needs rects.
 */
function starfield(seed = 9): string {
  const random = rnd(seed)
  const S = 3
  const out: string[] = [`<rect width="${W}" height="${H}" fill="${SKY}"/>`]
  for (let i = 0; i < 260; i++) {
    const x = Math.floor(random() * (W / S)) * S
    const y = Math.floor(random() * (H / S)) * S
    const c = STAR[random() < 0.12 ? 2 : random() < 0.45 ? 1 : 0]
    if (random() < 0.22) {
      // A plus, which is the one that makes it a sky.
      out.push(
        `<rect x="${x}" y="${y - S}" width="${S}" height="${S}" fill="${c}"/>`,
        `<rect x="${x - S}" y="${y}" width="${S * 3}" height="${S}" fill="${c}"/>`,
        `<rect x="${x}" y="${y + S}" width="${S}" height="${S}" fill="${c}"/>`,
      )
    } else {
      out.push(`<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="${c}"/>`)
    }
  }
  return out.join('')
}

/** The staircase corner, same arithmetic as `ui/pixelShape.ts`. */
function stepped(x: number, y: number, w: number, h: number, u: number, treads: number): string {
  const p: [number, number][] = []
  for (let i = 0; i <= treads; i++) p.push([x + u * (treads - i), y + u * i])
  for (let i = treads; i >= 0; i--) p.push([x + w - u * (treads - i), y + u * i])
  for (let i = 0; i <= treads; i++) p.push([x + w - u * i, y + h - u * (treads - i)])
  for (let i = treads; i >= 0; i--) p.push([x + u * i, y + h - u * (treads - i)])
  return p.map(([px, py]) => `${px},${py}`).join(' ')
}

function text(x: number, y: number, s: string, size: number, colour: string, spacing = 0, shadow?: string): string {
  const safe = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const shade = shadow
    ? `<text x="${x + Math.round(size / 8)}" y="${y + Math.round(size / 8)}" font-family="${FONT}" font-size="${size}" fill="${shadow}" text-anchor="middle" letter-spacing="${spacing}">${safe}</text>`
    : ''
  return `${shade}<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" fill="${colour}" text-anchor="middle" letter-spacing="${spacing}">${safe}</text>`
}

/**
 * A panel built like one of the game's keys: an extruded base under a face,
 * a hard bevel on all four sides, no blur anywhere. The depth is what makes it
 * a button rather than a card, and it is the whole reason these now look like
 * they came from the same place as the game.
 */
function key(x: number, y: number, w: number, h: number, tone: ToneId, u = 6): string {
  const c = TONE[tone]
  const depth = u * 4
  const faceH = h - depth
  return [
    `<polygon points="${stepped(x, y + depth, w, faceH, u, 4)}" fill="${INK}"/>`,
    `<polygon points="${stepped(x, y, w, faceH, u, 4)}" fill="${c.base}"/>`,
    `<polygon points="${stepped(x + u, y + u, w - u * 2, faceH - u * 2, u, 3)}" fill="${c.face}"/>`,
    `<rect x="${x + u * 4}" y="${y + u}" width="${w - u * 8}" height="${u}" fill="${c.hi}"/>`,
    `<rect x="${x + u}" y="${y + u * 4}" width="${u}" height="${faceH - u * 8}" fill="${c.hi}"/>`,
    `<rect x="${x + u * 4}" y="${y + faceH - u * 2}" width="${w - u * 8}" height="${u}" fill="${c.lo}"/>`,
    `<rect x="${x + w - u * 2}" y="${y + u * 4}" width="${u}" height="${faceH - u * 8}" fill="${c.lo}"/>`,
  ].join('')
}

/** An arrow out of whole blocks. A marker would land on half pixels. */
function arrow(x1: number, y1: number, x2: number, colour = BRAND, u = 6): string {
  const out = [`<rect x="${x1}" y="${y1 - u / 2}" width="${x2 - x1 - u * 3}" height="${u}" fill="${colour}"/>`]
  for (let i = 0; i < 3; i++) {
    const height = u * (1 + i * 2)
    out.push(`<rect x="${x2 - u * (i + 1)}" y="${y1 - height / 2}" width="${u}" height="${height}" fill="${colour}"/>`)
  }
  return out.join('')
}

/** A real game sprite, at an integer scale. */
function sprite(art: { rows: string[]; palette: Record<string, string> }, cx: number, y: number, scale: number): string {
  const left = Math.round(cx - (art.rows[0].length * scale) / 2)
  return spriteRuns(art)
    .map((r) => `<rect x="${left + r.x * scale}" y="${y + r.y * scale}" width="${r.w * scale}" height="${scale}" fill="${r.fill}"/>`)
    .join('')
}

function slide(title: string, body: string, footer?: string, seed = 9): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">
${starfield(seed)}
${text(W / 2, 130, title, 46, TEXT, 4, INK)}
${body}
${footer ? text(W / 2, H - 70, footer, 20, GOOD, 1) : ''}
</svg>`
}

/** Three or four keys across the middle, each with a few lines under it. */
function row(panels: { title: string; lines: string[]; tone: ToneId }[], arrows: string[] = []): string {
  const MARGIN = 80
  /*
   * Wide enough for an arrow to read as one. At 60 the shaft was eighteen
   * pixels after the head took its share, which draws as a plus sign between
   * two buttons rather than as a direction.
   */
  const gap = 130
  const w = Math.floor((W - MARGIN * 2 - gap * (panels.length - 1)) / panels.length)
  /*
   * The block sits on the middle of the frame rather than near the top. The
   * first pass put everything in the upper half and left a third of a 1080
   * slide empty, which reads as a page that ran out rather than a composition.
   */
  const h = 150
  const lines = Math.max(...panels.map((p) => p.lines.filter(Boolean).length))
  const block = h + 40 + lines * 46
  const top = Math.round(180 + (H - 260 - block) / 2)
  const out: string[] = []

  panels.forEach((panel, i) => {
    const x = MARGIN + i * (w + gap)
    const cx = x + w / 2
    out.push(key(x, top, w, h, panel.tone))
    out.push(text(cx, top + 70, panel.title, 26, TEXT, 2, INK))
    panel.lines.forEach((line, j) => {
      if (line) out.push(text(cx, top + h + 56 + j * 46, line, 21, MUTED))
    })
    if (i < panels.length - 1) {
      // Centred on the face, which is the panel minus its extruded base.
      const faceMid = top + (h - 24) / 2
      out.push(arrow(x + w + 16, faceMid, x + w + gap - 16))
      // Labels go ABOVE the panels, never across them.
      if (arrows[i]) out.push(text(x + w + gap / 2, top - 34, arrows[i], 19, BRAND))
    }
  })
  return out.join('')
}

/* ------------------------------------------------------------------ slides */

const stack = slide(
  'THE STACK',
  row(
    [
      { title: 'THE BROWSER', tone: 'teal', lines: ['the whole game', '1,036 recipes', 'the save lives here'] },
      { title: 'TWO FUNCTIONS', tone: 'purple', lines: ['stateless', 'no database', 'they hold the key'] },
      { title: 'GEMINI', tone: 'orange', lines: ['gets two names', 'and nothing else', 'answers in prose'] },
    ],
    ['two names', 'the prompt'],
  ),
  'the model has never seen the recipe list. it cannot: they are bundled separately.',
  9,
)

const combine = slide(
  'PRESSING COMBINE',
  row(
    [
      { title: 'THE INDEX', tone: 'teal', lines: ['a map lookup', 'grants the element', 'or grants nothing'] },
      { title: 'THE RULES', tone: 'purple', lines: ['37 of them', 'says why not', 'under a millisecond'] },
      { title: 'THE MODEL', tone: 'orange', lines: ['only if you press', '"why?"', 'five seconds'] },
    ],
    ['miss', 'on request'],
  ),
  '99.8% of presses never leave the browser.',
  14,
)

const gate = slide(
  'HOW A RECIPE GETS IN',
  row(
    [
      { title: 'PROPOSE', tone: 'orange', lines: ['the model drafts', 'a chain'] },
      { title: 'THE GATE', tone: 'purple', lines: ['fetches every', 'citation'] },
      { title: 'A HUMAN', tone: 'teal', lines: ['reads it and', 'decides'] },
      { title: 'IT SHIPS', tone: 'teal', lines: ['edited by hand', 'into the game'] },
    ],
    ['', '', ''],
  ),
  '1,024 of 1,024 citations answer and match their page title.',
  21,
)

const chain = (() => {
  const steps: [string, string, string][] = [
    ['soil', 'SOIL', 'cultivating'],
    ['raw_cotton', 'RAW COTTON', 'ginning'],
    ['cotton_yarn', 'COTTON YARN', 'knitting'],
    ['cotton_jersey', 'JERSEY', 'dyeing'],
    ['cotton_t_shirt', 'T-SHIRT', ''],
  ]
  const SCALE = 11
  const MARGIN = 100
  const cell = (W - MARGIN * 2) / steps.length
  // Sat on the middle of the frame, not the top third.
  const y = 470
  const out: string[] = []
  steps.forEach(([id, name, process], i) => {
    const cx = MARGIN + cell * i + cell / 2
    out.push(sprite(resolveIcon(id), cx, y, SCALE))
    out.push(text(cx, y + 11 * SCALE + 70, name, 22, TEXT, 1, INK))
    if (process) {
      out.push(arrow(cx + 110, y + 60, cx + cell - 110))
      out.push(text(cx + cell / 2, y + 24, process, 18, BRAND))
    }
  })
  out.push(text(W / 2, 300, 'twenty-four steps from nothing. this is one branch of three.', 22, MUTED))
  return slide('ONE CHAIN', out.join(''), 'every arrow is a real process with a citation behind it.', 31)
})()

const icons = (() => {
  const shown: [string, string][] = [
    ['cup', '#b5651f'], ['blade', '#7d8797'], ['leafy', '#6f8f4f'],
    ['ingot', '#c8a030'], ['cloth', '#8f3f3f'], ['ring', '#4f7fb5'],
  ]
  const SCALE = 13
  const MARGIN = 120
  const cell = (W - MARGIN * 2) / shown.length
  const y = 400
  const out: string[] = [text(W / 2, 250, `${Object.keys(FORMS).length} shapes carry ${Object.keys(COMPOSED).length} icons.`, 24, MUTED)]
  shown.forEach(([form, colour], i) => {
    const cx = MARGIN + cell * i + cell / 2
    const art = composeSprite(form as never, colour)
    out.push(sprite(art, cx, y, SCALE))
    out.push(text(cx, y + art.rows.length * SCALE + 66, form.toUpperCase(), 20, TEXT, 1, INK))
  })
  out.push(text(W / 2, 830, 'one silhouette, one colour. nobody hand-drew a thousand sprites.', 22, MUTED))
  return slide('THE ART', out.join(''), 'two things sharing a shape must differ in colour. the tests enforce it.', 44)
})()

const numbers = (() => {
  const craftable = new Set(GAME_DATA.recipes.map((r) => r.output)).size
  const processes = new Set(GAME_DATA.recipes.map((r) => r.process)).size
  const figures: [string, string][] = [
    [String(GAME_DATA.elements.length), 'THINGS'],
    [String(GAME_DATA.recipes.length), 'RECIPES'],
    [String(processes), 'PROCESSES'],
    [String(craftable), 'TO MAKE'],
  ]
  const MARGIN = 90
  const cell = (W - MARGIN * 2) / figures.length
  const out: string[] = []
  figures.forEach(([value, name], i) => {
    const cx = MARGIN + cell * i + cell / 2
    out.push(text(cx, 470, value, 96, TEXT, 4, INK))
    out.push(text(cx, 540, name, 22, BRAND, 3))
  })
  out.push(text(W / 2, 720, '534,061 possible pairs.', 26, MUTED))
  out.push(text(W / 2, 780, 'you are wrong 99.8% of the time.', 26, MUTED))
  return slide('WHAT IS IN IT', out.join(''), 'none of it was invented. that is the whole point.', 57)
})()

mkdirSync(OUT, { recursive: true })
for (const [name, doc] of [
  ['stack', stack], ['combine', combine], ['gate', gate],
  ['chain', chain], ['icons', icons], ['numbers', numbers],
] as [string, string][]) {
  writeFileSync(`${OUT}/diagram-${name}.svg`, doc)
  console.log(`  ${OUT}/diagram-${name}.svg`)
}
