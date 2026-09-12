/*
 * Restores every composed icon to a colour that MEANS something, then spreads
 * only within that meaning.
 *
 * The old spread optimised distance alone and swept hue from zero, so it
 * happily turned rope lime green and a door teal: 102 elements had moved more
 * than fifty degrees of hue away from what a person picked. Distance is not
 * the goal — being TELLABLE APART is, and an icon that no longer looks like
 * the thing it names is not a better icon for being further from its
 * neighbour.
 *
 * So: colour comes from the element's material family, and the spread is
 * allowed to move lightness and saturation freely but hue only a little.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const path = 'src/data/iconRegistry.ts'
let src = readFileSync(path, 'utf8')

// What a thing is made of, as a base hue. Matched against the id, longest
// first, so 'copper_wire' picks copper rather than falling through to metal.
const FAMILY = [
  [/gold|brass|coin/, '#c8a030'],
  [/copper|bronze/, '#c4713a'],
  [/silver|pewter|tin\b|zinc|mirror|aluminium|aluminum/, '#c0c8d4'],
  [/lead|mercury|slag|iron|steel|nail|screw|chain|anvil|rail|weld|forge|alloy|metal|wire_mesh|bearing|gear|spring/, '#8792a3'],
  [/coal|coke|carbon|charcoal|pitch|tar|ink|soot/, '#2b2b33'],
  [/wood|plank|plywood|log|bark|timber|pallet|chair|table|door|board|handle|haft|guitar|violin/, '#9a6a38'],
  [/cotton|linen|wool|felt|cloth|jersey|fabric|yarn|thread|carpet|curtain|tent|canvas|sail|denim|jeans|bandage|jumper|shoe|leather|backpack/, '#d8c9a8'],
  [/glass|lens|prism|pane|window|bottle|vial|slide/, '#a8d4e4'],
  [/clay|brick|tile|pot|cement|concrete|render|plaster|mortar|stone|lime|chalk|sand|silica|ash|potash/, '#b6a78c'],
  [/water|ice|steam|liquid|acid|bleach|antiseptic|varnish|glue|vinegar|milk|oil|distillate|paraffin/, '#79b4d6'],
  [/plastic|poly|pvc|nylon|rayon|bakelite|celluloid|rubber|tyre|vinyl|ethylene|propylene/, '#cfd6de'],
  [/plant|flax|farm|compost|soil|leaf|fibre|cordage|rope|straw|yeast|sourdough|dough|bread|flour|sugar|beer/, '#c8a76a'],
  [/gas|oxygen|chlorine|ammonia|butane|acetylene|benzene|phenol|aniline/, '#9fd8e8'],
  [/fire|flame|ember|torch|lamp|bulb|candle|laser|light/, '#e8a03a'],
  [/motor|engine|machine|computer|laptop|screen|radio|phone|camera|circuit|transistor|chip|battery|solar|turbine|generator|crane|port|locomotive|rocket|satellite|aeroplane/, '#5f6f86'],
]

/*
 * Colours that are not allowed to move.
 *
 * Some elements carry their colour as part of what they ARE, and a shift that
 * is merely far enough from a neighbour is not good enough for them — a
 * mustard rope or a pink copper is a worse icon than the collision it solved.
 * These are placed first and every other icon in the same form moves around
 * them.
 *
 * Kept deliberately short. Everything a Survival player meets in the first
 * minute is here, because that is the impression the game gets to make once,
 * plus the metals, where the colour IS the identification.
 */
const PINNED = {
  cordage: '#c8a76a',
  rope: '#d0a75f',
  wood: '#8a5a33',
  plank: '#c09155',
  copper: '#c4713a',
  bronze: '#9a6b28',
  brass: '#c8a83a',
  gold: '#e0b830',
  silver: '#d0d4dc',
  lead: '#6a6a78',
  tin: '#c8ccd4',
  zinc: '#9aa8b0',
  coal: '#22222a',
  coke: '#3a3a40',
  carbon_black: '#2b2a30',
  ice: '#c8e8f4',
  whitewash: '#e8e6df',
  chalk: '#f4f4ec',
  flour: '#f0e8d8',
  soap: '#b9d4ad',
  slag: '#5d6157',
  potash: '#e3dcc4',
  wood_ash: '#8d8880',
}

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const hex = (a) => '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
const dist = (a, b) => { const x = rgb(a), y = rgb(b); return Math.hypot(x[0]-y[0], x[1]-y[1], x[2]-y[2]) }

function toHsl(h) {
  const [r, g, b] = rgb(h).map((v) => v / 255)
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn
  const l = (mx + mn) / 2
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  let hu = 0
  if (d) { if (mx === r) hu = ((g - b) / d) % 6; else if (mx === g) hu = (b - r) / d + 2; else hu = (r - g) / d + 4 }
  return [(hu * 60 + 360) % 360, s, l]
}
function fromHsl(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2
  let r, g, b
  if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x]
  return hex([(r + m) * 255, (g + m) * 255, (b + m) * 255])
}

const re = /^(\s*)([a-z0-9_]+): \{ form: '([a-z]+)', colour: '(#[0-9a-fA-F]{6})' \},$/gm
const entries = [...src.matchAll(re)].map((m) => ({ indent: m[1], id: m[2], form: m[3], colour: m[4], raw: m[0] }))

// 1. Reset every colour to its family, unless it is pinned.
for (const e of entries) {
  const hit = FAMILY.find(([rx]) => rx.test(e.id))
  e.base = PINNED[e.id] ?? (hit ? hit[1] : '#8a86a8')
  e.colour = e.base
  e.pinned = e.id in PINNED
}

// 2. Spread within the family: lightness and saturation freely, hue by at
//    most thirty degrees either way.
const MIN = 66
const byForm = new Map()
for (const e of entries) byForm.set(e.form, [...(byForm.get(e.form) ?? []), e])

let moved = 0, unresolved = 0, escaped = 0
for (const [, list] of byForm) {
  const kept = []
  // Pinned first, so everything else has to find room around them.
  const ordered = [...list.filter((e) => e.pinned), ...list.filter((e) => !e.pinned)]
  for (const e of ordered) {
    if (e.pinned) { kept.push(e); continue }
    if (kept.every((k) => dist(k.colour, e.colour) >= MIN)) { kept.push(e); continue }
    const [h0, s0, l0] = toHsl(e.base)
    let best = null
    outer:
    /*
     * Lightness first, and almost only lightness.
     *
     * A tan rope separated from a tan pipe by moving HUE comes out pink, which
     * is a worse icon than the collision it was fixing. Lightness is the axis
     * that keeps a material looking like itself: dark brown through tan to
     * pale cream is two hundred units of distance and every step of it still
     * reads as fibre. Saturation moves a little, hue barely at all.
     */
    for (const dl of [0.18, -0.18, 0.28, -0.28, 0.38, -0.38, 0.48, -0.48, 0.58, -0.58, 0.66, -0.66, 0.74, -0.74]) {
      for (const ds of [0, 0.18, -0.18, 0.32, -0.32, 0.48, -0.48]) {
        for (const dh of [0, 8, -8, 16, -16]) {
          const c = fromHsl((h0 + dh + 360) % 360, Math.max(0.05, Math.min(0.95, s0 + ds)), Math.max(0.13, Math.min(0.93, l0 + dl)))
          if (kept.every((k) => dist(k.colour, c) >= MIN)) { best = c; break outer }
        }
      }
    }
    /*
     * Last resort: leave the family and sweep the whole circle. A colour that
     * no longer suggests the material is bad; two icons that are the same
     * picture is worse, because one of them is then simply wrong.
     */
    if (!best) {
      for (let h = 0; h < 360 && !best; h += 6) {
        for (const l of [0.34, 0.5, 0.66, 0.78]) {
          const c = fromHsl(h, 0.5, l)
          if (kept.every((k) => dist(k.colour, c) >= MIN)) { best = c; break }
        }
      }
      if (best) { escaped++ }
    }
    if (!best) { unresolved++; kept.push(e); continue }
    e.colour = best
    moved++
    kept.push(e)
  }
}

for (const e of entries) {
  src = src.replace(e.raw, `${e.indent}${e.id}: { form: '${e.form}', colour: '${e.colour}' },`)
}
writeFileSync(path, src)
console.log(`recoloured ${entries.length} icons by family, ${moved} shifted within it, ${escaped} had to leave it, ${unresolved} unresolved`)
