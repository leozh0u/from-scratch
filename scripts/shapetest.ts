/**
 * The staircase corner.
 *
 * This shape is under every surface in the game, and the way it failed was
 * invisible until something wide was drawn: the four corners were written as
 * four separate loops that quietly disagreed, so the left side stepped and the
 * right side came out square. Symmetry is the property that was broken, so
 * symmetry is what this asserts.
 */
import { steppedNotch } from '../src/components/ui/pixelShape'

let pass = 0, fail = 0
const ok = (l: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  ok    ${l}${d ? '  — ' + d : ''}`) }
  else { fail++; console.log(`  FAIL  ${l}${d ? '  — ' + d : ''}`) }
}

/** Resolve a polygon into numeric points at a known box size. */
function resolve(poly: string, w: number, h: number): Array<[number, number]> {
  const inner = poly.slice('polygon('.length, -1)
  return inner.split(',').map((pair) => {
    const [a, b] = pair.trim().split(/\s+(?![^(]*\))/)
    const num = (s: string, extent: number): number => {
      s = s.trim()
      if (s === '0') return 0
      if (s === '100%') return extent
      const m = s.match(/^calc\(100% - ([\d.]+)px\)$/)
      if (m) return extent - parseFloat(m[1])
      const p = s.match(/^([\d.]+)px$/)
      if (p) return parseFloat(p[1])
      throw new Error(`cannot parse "${s}"`)
    }
    return [num(a, w), num(b, h)]
  })
}

const UNIT = 4
const STEPS = 3
const W = 400
const H = 120
const points = resolve(steppedNotch(UNIT, STEPS), W, H)

console.log('\n=== it is a closed, sane polygon ===')
{
  ok('every point parses', points.length > 0, `${points.length} points`)
  ok('nothing lands outside the box',
    points.every(([x, y]) => x >= 0 && x <= W && y >= 0 && y <= H))
  ok('every coordinate is a whole pixel',
    points.every(([x, y]) => Number.isInteger(x) && Number.isInteger(y)))
}

console.log('\n=== THE BUG: left and right must be mirror images ===')
{
  // This is the check that would have caught it. Mirroring the polygon about
  // the vertical centreline must produce the same set of points.
  const key = (p: [number, number]) => `${p[0]},${p[1]}`
  const have = new Set(points.map(key))
  const mirrored = points.map(([x, y]) => [W - x, y] as [number, number])
  const missing = mirrored.filter((p) => !have.has(key(p)))
  ok('the shape is symmetric left to right', missing.length === 0,
    missing.length ? `${missing.length} unmatched, e.g. ${key(missing[0])}` : '')
}

console.log('\n=== and top must mirror bottom ===')
{
  const key = (p: [number, number]) => `${p[0]},${p[1]}`
  const have = new Set(points.map(key))
  const mirrored = points.map(([x, y]) => [x, H - y] as [number, number])
  const missing = mirrored.filter((p) => !have.has(key(p)))
  ok('the shape is symmetric top to bottom', missing.length === 0,
    missing.length ? `${missing.length} unmatched, e.g. ${key(missing[0])}` : '')
}

console.log('\n=== all four corners are actually cut ===')
{
  // A corner that was cut has no point at the literal rectangle corner.
  const key = (p: [number, number]) => `${p[0]},${p[1]}`
  const have = new Set(points.map(key))
  const corners: Array<[string, [number, number]]> = [
    ['top-left', [0, 0]],
    ['top-right', [W, 0]],
    ['bottom-right', [W, H]],
    ['bottom-left', [0, H]],
  ]
  for (const [name, c] of corners) {
    ok(`${name} is cut, not square`, !have.has(key(c)))
  }
}

console.log('\n=== every corner has the same number of treads ===')
{
  // The original fault: two corners emitted two points per tread and two
  // emitted three, so opposite sides of the same panel were different shapes.
  const inQuadrant = (fx: (x: number) => boolean, fy: (y: number) => boolean) =>
    points.filter(([x, y]) => fx(x) && fy(y)).length
  const r = UNIT * STEPS + 1
  const tl = inQuadrant((x) => x <= r, (y) => y <= r)
  const tr = inQuadrant((x) => x >= W - r, (y) => y <= r)
  const br = inQuadrant((x) => x >= W - r, (y) => y >= H - r)
  const bl = inQuadrant((x) => x <= r, (y) => y >= H - r)
  ok('all four corners use the same point count', tl === tr && tr === br && br === bl,
    `tl=${tl} tr=${tr} br=${br} bl=${bl}`)
  ok('and there is one tread per step', tl >= STEPS * 3, `${tl} points for ${STEPS} steps`)
}

console.log('\n=== it holds at other sizes ===')
{
  for (const [u, s, w, h] of [[3, 2, 90, 90], [5, 4, 600, 80], [2, 3, 64, 64]] as const) {
    const p = resolve(steppedNotch(u, s), w, h)
    const key = (q: [number, number]) => `${q[0]},${q[1]}`
    const have = new Set(p.map(key))
    const missing = p.map(([x, y]) => [w - x, y] as [number, number]).filter((q) => !have.has(key(q)))
    ok(`unit ${u}, ${s} steps, ${w}x${h} is symmetric`, missing.length === 0)
  }
}

console.log(`\n${fail === 0 ? 'The staircase holds.' : `${fail} FAILED`}  (${pass} checks)`)
process.exit(fail === 0 ? 0 : 1)
