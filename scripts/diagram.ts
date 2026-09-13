/**
 * The stack, drawn in the game's own vocabulary.
 *
 * WHY BOTHER DRAWING THESE
 *
 * Leo: *"we need a good explanation of the technical stuff, so it cant be weak
 * techncial stuff. we should use diagams of the stack adn sutff."*
 *
 * The temptation is a generic boxes-and-arrows picture out of a diagram tool,
 * and that is exactly the thing a judge has seen forty times that morning. The
 * two claims worth making here are architectural — that the model cannot see
 * the recipe graph, and that no proposal reaches the game without passing a
 * gate — and both are easier to believe when the picture is obviously drawn by
 * the same hand as the thing it describes.
 *
 * Same stepped corners, same hard bands, same palette, same font, no blur and
 * no gradient anywhere.
 *
 *   npm run diagram     writes docs/diagram-*.svg and the PNGs beside them
 */
import { writeFileSync, mkdirSync } from 'node:fs'

const OUT = 'docs'
const UNIT = 4
/** Quoted, because an SVG font-family with a space in it and no quotes is a
 * family nobody has, and the renderer silently falls back to a serif. */
const FONT = "'Press Start 2P'"

const BACKDROP = '#191536'
const INK = '#100d20'
const PANEL = '#332f57'
const PANEL_HI = '#4a4578'
const PANEL_LO = '#231f40'
const RECESS = '#1e1b38'
const RECESS_HI = '#3a3560'
const RECESS_LO = '#12102a'
const TEXT = '#ffffff'
const MUTED = '#a29ec4'
const BRAND = '#e8752c'
const DANGER = '#d4564a'
const GOOD = '#6fc48d'

const TITLE_Y = UNIT * 9
const LINE_TOP = UNIT * 15
const LINE_STEP = 17

/** Height a box needs for a title and this many lines. */
function boxHeight(lines: number): number {
  return LINE_TOP + lines * LINE_STEP + UNIT * 3
}

/**
 * The staircase corner, as a polygon rather than a border-radius.
 *
 * The same arithmetic as `ui/pixelShape.ts` — `treads` steps of one unit cut
 * out of each corner — restated here because that module emits a CSS
 * `clip-path` and this needs SVG points. The shape is identical; the syntax
 * is not.
 */
function stepped(x: number, y: number, w: number, h: number, unit: number, treads: number): string {
  const p: [number, number][] = []
  for (let i = 0; i <= treads; i++) p.push([x + unit * (treads - i), y + unit * i])
  for (let i = treads; i >= 0; i--) p.push([x + w - unit * (treads - i), y + unit * i])
  for (let i = 0; i <= treads; i++) p.push([x + w - unit * i, y + h - unit * (treads - i)])
  for (let i = treads; i >= 0; i--) p.push([x + unit * i, y + h - unit * (treads - i)])
  return p.map(([px, py]) => `${px},${py}`).join(' ')
}

function label(x: number, y: number, text: string, size: number, colour: string, spacing = 0): string {
  const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" fill="${colour}" text-anchor="middle" letter-spacing="${spacing}">${safe}</text>`
}

type BoxOptions = {
  sunk?: boolean
  title: string
  lines?: string[]
  titleColour?: string
  face?: string
  hi?: string
  lo?: string
}

/** A panel, built the way `ui/Card.tsx` builds one. */
function box(x: number, y: number, w: number, h: number, o: BoxOptions): string {
  const face = o.face ?? (o.sunk ? RECESS : PANEL)
  const hi = o.hi ?? (o.sunk ? RECESS_HI : PANEL_HI)
  const lo = o.lo ?? (o.sunk ? RECESS_LO : PANEL_LO)
  const cx = x + w / 2
  const parts = [
    `<polygon points="${stepped(x, y, w, h, UNIT, 3)}" fill="${INK}"/>`,
    `<polygon points="${stepped(x + UNIT, y + UNIT, w - UNIT * 2, h - UNIT * 2, UNIT, 2)}" fill="${face}"/>`,
    /*
     * Sunk panels are lit from BELOW, raised ones from above. That inversion
     * is the whole reason a recess reads as a hole rather than as another
     * panel somebody forgot to raise — it is the same trick the stats box and
     * the bench's readout use.
     */
    `<rect x="${x + UNIT * 3}" y="${o.sunk ? y + h - UNIT * 2 : y + UNIT}" width="${w - UNIT * 6}" height="${UNIT}" fill="${hi}"/>`,
    `<rect x="${x + UNIT * 3}" y="${o.sunk ? y + UNIT : y + h - UNIT * 2}" width="${w - UNIT * 6}" height="${UNIT}" fill="${lo}"/>`,
    label(cx, y + TITLE_Y, o.title, 12, o.titleColour ?? TEXT, 1),
  ]
  ;(o.lines ?? []).forEach((line, i) => {
    if (line) parts.push(label(cx, y + LINE_TOP + i * LINE_STEP, line, 8, MUTED))
  })
  return parts.join('\n')
}

/**
 * An arrow out of whole blocks.
 *
 * A stroked line with a marker would be one tag and the wrong thing: markers
 * scale with the stroke and land on half pixels, which is the single most
 * reliable way to make pixel art look like a screenshot of pixel art. Three
 * rectangles widening away from the tip is what a sprite artist draws.
 */
function arrow(x1: number, y1: number, x2: number, y2: number, colour: string, text?: string): string {
  const t = UNIT
  const parts: string[] = []
  const horizontal = y1 === y2
  const dir = Math.sign(horizontal ? x2 - x1 : y2 - y1)

  if (horizontal) {
    const from = Math.min(x1, x2)
    parts.push(`<rect x="${from}" y="${y1 - t / 2}" width="${Math.abs(x2 - x1) - t * 3}" height="${t}" fill="${colour}"/>`)
    for (let i = 0; i < 3; i++) {
      const height = t * (1 + i * 2)
      parts.push(
        `<rect x="${x2 - dir * t * (i + 1)}" y="${y1 - height / 2}" width="${t}" height="${height}" fill="${colour}"/>`,
      )
    }
    if (text) parts.push(label((x1 + x2) / 2, y1 - t * 4, text, 8, colour))
  } else {
    const from = Math.min(y1, y2)
    parts.push(`<rect x="${x1 - t / 2}" y="${from}" width="${t}" height="${Math.abs(y2 - y1) - t * 3}" fill="${colour}"/>`)
    for (let i = 0; i < 3; i++) {
      const width = t * (1 + i * 2)
      parts.push(
        `<rect x="${x1 - width / 2}" y="${y2 - dir * t * (i + 1)}" width="${width}" height="${t}" fill="${colour}"/>`,
      )
    }
    if (text) parts.push(label(x1, (y1 + y2) / 2, text, 8, colour))
  }
  return parts.join('\n')
}

function svg(width: number, height: number, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">
<rect width="${width}" height="${height}" fill="${BACKDROP}"/>
${body}
</svg>`
}

/* ------------------------------------------------------------------ stack */

const stack = (() => {
  const parts: string[] = []

  const browser = [
    'react 19 · typescript · vite',
    '',
    'gameData.ts   932 elements, 935 recipes',
    'solver.ts     reachability over the DAG',
    'explain.ts    37 failure rules, local',
    'localStorage  the entire save',
  ]
  const functions = [
    'vercel · stateless · no storage',
    '',
    'api/adjudicate.ts',
    '   "why did nothing happen?"',
    'api/ask.ts',
    '   one of { how, why, where }',
  ]
  const gemini = [
    'receives two element NAMES',
    'and a realm. or one key out',
    'of a closed set of three.',
    '',
    'cannot name a recipe,',
    'because it has never',
    'been shown one.',
  ]

  const rows = Math.max(browser.length, functions.length, gemini.length)
  const h = boxHeight(rows)
  /*
   * The canvas is measured from the row, not picked. A hardcoded width put the
   * third panel 60px off the right-hand edge of its own image — the kind of
   * thing that is invisible in the file and obvious on a projector.
   */
  const MARGIN = 60
  const w = 460
  const gap = 110
  const x1 = MARGIN
  const x2 = x1 + w + gap
  const x3 = x2 + w + gap
  const W = x3 + w + MARGIN
  const H = 190 + h + 40 + boxHeight(5) + 70

  parts.push(
    label(W / 2, 60, 'THE STACK', 22, TEXT, 3),
    label(W / 2, 96, 'no database.  no accounts.  no server-held state.', 10, BRAND, 1),
    label(W / 2, 130, 'one static bundle, two stateless functions, and the model behind them', 8, MUTED),
  )

  const top = 190

  parts.push(box(x1, top, w, h, { title: 'THE BROWSER', lines: browser }))
  parts.push(box(x2, top, w, h, { title: 'TWO FUNCTIONS', lines: functions }))
  parts.push(box(x3, top, w, h, { title: 'GEMINI', lines: gemini, titleColour: BRAND }))

  const mid = top + h / 2
  parts.push(arrow(x1 + w, mid - 30, x2, mid - 30, BRAND, 'two names'))
  parts.push(arrow(x2, mid + 40, x1 + w, mid + 40, MUTED, 'prose'))
  parts.push(arrow(x2 + w, mid - 30, x3, mid - 30, BRAND, 'the prompt'))
  parts.push(arrow(x3, mid + 40, x2 + w, mid + 40, MUTED, 'prose'))

  const fenceY = top + h + 40
  parts.push(
    box(x1, fenceY, W - MARGIN * 2, boxHeight(5), {
      sunk: true,
      title: 'THE FENCE',
      titleColour: BRAND,
      lines: [
        'the two endpoints have never seen gameData.ts and cannot import it — they are bundled separately',
        'no model output is ever a number.  every footprint figure is hand-read from a cited source',
        'no player-typed text reaches a model.  the "learn more" wire carries the string "how", "why" or "where"',
        '',
        'only the recipe index grants an element. that is structural, not a promise made in a prompt.',
      ],
    }),
  )

  parts.push(label(W / 2, H - 26, 'open devtools and watch the request. it is the whole demo, and it takes fifteen seconds.', 8, GOOD))

  return svg(W, H, parts.join('\n'))
})()

/* ------------------------------------------------------------------- gate */

const gate = (() => {
  const parts: string[] = []

  const stages: [string, string[], string][] = [
    ['PROPOSE', ['npm run propose', '', 'the model drafts', 'chains into', 'data/staging/', '', 'src/ cannot import', 'from there'], BRAND],
    ['THE GATE', ['npm run import', '', 'fetches every citation', 'checks its title', 'against its label', '', 'rejects taken pairs,', 'cycles, dead URLs'], DANGER],
    ['A HUMAN READS IT', ['does this really', 'happen?', 'does the page', 'actually say so?', '', 'the only step that', 'cannot be automated,', 'and the only one', 'that decides'], TEXT],
    ['IT SHIPS', ['gameData.ts,', 'edited by hand', '', '926 of 926', 'citations answer', 'and match', 'their label'], GOOD],
  ]

  const rows = Math.max(...stages.map(([, l]) => l.length))
  const h = boxHeight(rows)
  const MARGIN = 60
  const w = 330
  const gap = 80
  const W = MARGIN * 2 + stages.length * w + (stages.length - 1) * gap
  const H = 180 + h + 50 + boxHeight(4) + 60

  parts.push(
    label(W / 2, 60, 'HOW A RECIPE GETS IN', 22, TEXT, 3),
    label(W / 2, 96, 'the model proposes.  it never ships.', 10, BRAND, 1),
  )

  const top = 180
  stages.forEach(([title, lines, colour], i) => {
    const x = MARGIN + i * (w + gap)
    parts.push(box(x, top, w, h, { title, lines, titleColour: colour, sunk: i === 1 }))
    if (i < stages.length - 1) {
      parts.push(arrow(x + w, top + h / 2, x + w + gap, top + h / 2, MUTED))
    }
  })

  const caughtY = top + h + 50
  parts.push(
    box(MARGIN, caughtY, W - MARGIN * 2, boxHeight(4), {
      sunk: true,
      title: 'WHAT THE GATE HAS ACTUALLY CAUGHT, IN THIRTY BATCHES',
      titleColour: DANGER,
      lines: [
        'fabricated URLs, by their own 404.  redirects — Propene to Propylene, Dike to Levee, Lavender to Lavandula',
        'pairs already spoken for.  forward references.  chains that close a loop the footprint walk cannot survive',
        'placeholder verbs — "creating", "processing" — which is the model reaching when it does not know the real one',
        'and a tap and a valve that both claimed brass + washer, in the same batch as each other',
      ],
    }),
  )

  parts.push(label(W / 2, H - 24, 'every one of those is a citation nobody had to open.', 8, MUTED))

  return svg(W, H, parts.join('\n'))
})()

mkdirSync(OUT, { recursive: true })
writeFileSync(`${OUT}/diagram-stack.svg`, stack)
writeFileSync(`${OUT}/diagram-gate.svg`, gate)
console.log(`\nWrote ${OUT}/diagram-stack.svg and ${OUT}/diagram-gate.svg`)
