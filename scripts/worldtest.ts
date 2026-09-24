/**
 * The worlds, asserted rather than eyeballed.
 *
 * Every rule docs/WORLDS.md states is checked here against the shipping data,
 * along with the edge cases the design council raised: a world's save never
 * leaks into another, the title's reset clears every planet, a corrupt save
 * starts fresh, the re-lit backdrops still match the rules that made them, and
 * the tutorial shelf is exactly what it was.
 *
 *   npx tsx scripts/worldtest.ts
 */
import { GAME_DATA } from '../src/data/gameData'
import { WORLDS } from '../src/data/worlds'
import { backdropFile, relight, type Rgb } from '../src/art/moods'
import { survivalReach, inRealm } from '../src/game/realms'
import { pickHint, pathToTarget } from '../src/solver/hint'
import { readPng, rgbOf } from './png'
import { relightPixels } from './relight'

/*
 * A stand-in localStorage, installed BEFORE game/worlds.ts is loaded, so the
 * save helpers run against something that can be inspected and broken.
 */
const store = new Map<string, string>()
;(globalThis as { localStorage?: Storage }).localStorage = {
  get length() { return store.size },
  key: (i: number) => [...store.keys()][i] ?? null,
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
} as Storage
const { worldData, kitSteps, kitSize, kitParts, readWorldProgress, clearWorldSaves, worldStorageKey } =
  await import('../src/game/worlds')
const { readStorage } = await import('../src/hooks/useGameState')

let pass = 0, fail = 0
const ok = (label: string, cond: boolean, detail = '') => {
  if (cond) { pass++; console.log(`  ok    ${label}${detail ? '  — ' + detail : ''}`) }
  else { fail++; console.log(`  FAIL  ${label}${detail ? '  — ' + detail : ''}`) }
}

const ids = new Set(GAME_DATA.elements.map((e) => e.id))
const made = new Set(GAME_DATA.recipes.map((r) => r.output))

console.log('\n=== every world keeps the rules it was written to ===')
for (const world of WORLDS) {
  const starters = new Set(world.starters)
  ok(`${world.id}: every starter and target exists`,
     [...world.starters, ...world.targets].every((id) => ids.has(id)))
  ok(`${world.id}: three targets, none of them handed over`,
     world.targets.length === 3 && world.targets.every((id) => !starters.has(id)))
  ok(`${world.id}: the name fits the HUD`, world.name.length <= 10, world.name)
  // Natural things only, plus the fire Survival taught. Raw cotton would be
  // "grown", but it has a recipe, and the world makes it instead.
  const manufactured = world.starters.filter((id) => id !== 'fire' && made.has(id))
  ok(`${world.id}: nothing manufactured is handed over`, manufactured.length === 0, manufactured.join(', '))

  const steps = kitSteps(world, starters)
  const held = new Set(starters)
  let broken = 0
  for (const step of steps) {
    if (!step.inputs.every((i) => held.has(i))) broken++
    held.add(step.output)
  }
  ok(`${world.id}: the whole kit is makeable from its own starters, in order`,
     broken === 0 && world.targets.every((t) => held.has(t)), `${steps.length} crafts`)
  const used = new Set(steps.flatMap((s) => s.inputs))
  const idle = world.starters.filter((id) => !used.has(id))
  ok(`${world.id}: every starter is used on the way`, idle.length === 0, idle.join(', '))
  ok(`${world.id}: the kit is a challenge, not a chore`, steps.length >= 10 && steps.length <= 20, `${steps.length} crafts`)

  // Everything the kit needs is on this world's shelf: the shelf is the reach
  // of its starters, which is the same rule Survival's shelf uses.
  const data = worldData(world)
  const offShelf = steps.map((s) => s.output).filter((id) => !inRealm(data, 'survival', id))
  ok(`${world.id}: every part lands on the world's own shelf`, offShelf.length === 0, offShelf.join(', '))

  // The first hint points at the kit, not at a hand drill.
  const focus = new Set(steps.map((s) => s.output))
  const hint = pickHint(data, starters, 'survival', 0, focus)
  ok(`${world.id}: the first hint points into the kit`, Boolean(hint && focus.has(hint.recipe.output)),
     hint ? hint.recipe.output : 'no hint')

  // Give up, from the start: every target's route replays.
  const sim = new Set(starters)
  let replayBroken = 0
  for (const target of world.targets) {
    for (const step of pathToTarget(data, sim, target)) {
      if (!step.inputs.every((i) => sim.has(i))) replayBroken++
      sim.add(step.output)
    }
  }
  ok(`${world.id}: give up lays out a route that can be followed`, replayBroken === 0)

  ok(`${world.id}: the made counter's total is the kit's length`, kitSize(world) === steps.length)
  ok(`${world.id}: Cheater lays out the kit and its starters, not the planet`,
     kitParts(world).length === new Set([...world.starters, ...steps.map((s) => s.output)]).size)
}

console.log('\n=== worlds are distinct from each other ===')
{
  ok('five worlds, five ids', new Set(WORLDS.map((w) => w.id)).size === WORLDS.length)
  ok('no two worlds aim at the same thing',
     new Set(WORLDS.flatMap((w) => w.targets)).size === WORLDS.length * 3)
  ok('no two worlds share a backdrop',
     new Set(WORLDS.map((w) => backdropFile(w.scene, w.mood))).size === WORLDS.length)
  ok('none of them is a realm\'s own backdrop', WORLDS.every((w) => w.mood !== 'day'))
}

console.log('\n=== the tutorial is exactly what it was ===')
{
  /*
   * Pinned, because every world added recipes to the one graph, and a recipe
   * whose inputs are all Survival's leaks onto the tutorial shelf. The net did
   * exactly that in the first draft (cordage + cordage) before it was caught.
   */
  const expected = [
    'stone', 'wood', 'plant_fibre', 'sharp_stone', 'cordage', 'hand_drill', 'tinder_bundle', 'bark',
    'torch', 'spindle', 'fire_board', 'bow', 'bow_drill', 'ember', 'burning_tinder', 'fire',
    'charcoal', 'lit_torch', 'wood_ash',
  ]
  const reach = survivalReach(GAME_DATA)
  const extra = [...reach].filter((id) => !expected.includes(id))
  const missing = expected.filter((id) => !reach.has(id))
  ok('the Survival shelf can hold exactly its nineteen', extra.length === 0 && missing.length === 0,
     [...extra.map((id) => '+' + id), ...missing.map((id) => '-' + id)].join(', ') || `${reach.size} ids`)
  const raws = ['hide', 'latex', 'sulfur', 'tin_ore', 'lodestone', 'seawater']
  ok('the new raw materials are Everything starters too',
     raws.every((id) => GAME_DATA.starters.everyday.includes(id)))
}

console.log('\n=== saves: one per planet, and reset clears them all ===')
{
  const [football, fencing] = WORLDS
  store.clear()
  store.set('from-scratch:discovered', '{"discovered":{"survival":["fire"],"everyday":[]}}')
  store.set(worldStorageKey(football), JSON.stringify({
    discovered: { survival: ['fire', 'wood'], everyday: ['football', 'goal'] },
  }))
  ok('a world reads its own save', readWorldProgress(football).found === 2)
  ok('and not the one next door', readWorldProgress(fencing).found === 0 && !readWorldProgress(fencing).started)
  store.set(worldStorageKey(fencing), '{ not json')
  ok('a corrupt save reads as a fresh planet rather than throwing', readWorldProgress(fencing).found === 0)
  store.set('from-scratch:world:a-world-that-was-retired', '{}')
  clearWorldSaves()
  const left = [...store.keys()]
  ok('reset clears every world, including retired ones',
     !left.some((k) => k.startsWith('from-scratch:world:')), left.join(', '))
  ok('and leaves the main save to the main reset', left.includes('from-scratch:discovered'))
  ok('a world\'s data object is stable, so effects keyed on it do not restart',
     worldData(football) === worldData(football))
}

console.log('\n=== a save of the wrong shape costs that field, not the game ===')
{
  /*
   * Valid JSON of the wrong shape used to get straight through: a list stored
   * as a string reached `.filter` and the screen went blank. The review of the
   * worlds found it in a world's save; the main save had the same hole.
   */
  const read = (raw: string) => {
    store.set('from-scratch:discovered', raw)
    try { return { ok: true, value: readStorage() } } catch (e) { return { ok: false, value: String(e) } }
  }
  const cases: [string, string][] = [
    ['a list stored as a string', '{"discovered":{"survival":["fire"],"everyday":"oops"}}'],
    ['a list stored as a number', '{"discovered":{"survival":7,"everyday":[]}}'],
    ['counts and misses as strings', '{"discovered":{},"hintsSpent":"x","misses":{"survival":"a"}}'],
    ['an array at the top', '[1,2]'],
    ['null', 'null'],
    ['discovered set to null', '{"discovered":null}'],
  ]
  for (const [label, raw] of cases) {
    const got = read(raw)
    const v = got.value as ReturnType<typeof readStorage>
    const shaped = v === null || (Array.isArray(v.discovered.survival) && Array.isArray(v.discovered.everyday))
    ok(`${label}: read without throwing, every list a list`, got.ok && shaped, JSON.stringify(v))
  }
  const kept = read('{"discovered":{"survival":["fire",3,"wood"],"everyday":"oops"}}').value as ReturnType<typeof readStorage>
  ok('and the good values in it survive', JSON.stringify(kept?.discovered.survival) === '["fire","wood"]')
  store.set(worldStorageKey(WORLDS[0]), '{"discovered":{"survival":"football","everyday":["goal"]}}')
  ok('a world save of the wrong shape counts only what is really there', readWorldProgress(WORLDS[0]).found === 1)
  store.clear()
}

console.log('\n=== the re-lit backdrops still match the rules ===')
{
  for (const world of WORLDS) {
    const file = backdropFile(world.scene, world.mood)
    const committed = rgbOf(readPng(`public/${file}`))
    const fresh = relightPixels(`public/${backdropFile(world.scene, 'day')}`, world.mood).rgb
    ok(`${file} matches art/moods.ts`, committed.equals(fresh), 'run `npm run relight` if not')
  }
  /*
   * A mood must not merge two colours into one, or two regions of the drawing
   * that the artist kept apart become one blob.
   */
  for (const scene of ['forest', 'city'] as const) {
    const base = rgbOf(readPng(`public/${backdropFile(scene, 'day')}`))
    const palette = new Map<number, Rgb>()
    for (let i = 0; i < base.length; i += 3) {
      palette.set((base[i] << 16) | (base[i + 1] << 8) | base[i + 2], [base[i], base[i + 1], base[i + 2]])
    }
    for (const mood of new Set(WORLDS.filter((w) => w.scene === scene).map((w) => w.mood))) {
      const out = new Set([...palette.values()].map((c) => relight(c, mood).join(',')))
      ok(`${scene} at ${mood} keeps all ${palette.size} colours apart`, out.size === palette.size, `${out.size}`)
    }
  }
}

console.log(`\n${pass} passed, ${fail} failed\n`)
if (fail > 0) process.exit(1)
