import { readFileSync, writeFileSync } from 'node:fs'
const path = 'src/data/iconRegistry.ts'
let src = readFileSync(path, 'utf8')
const MOVE = {
  grid: ['arch', 'chip', 'star'], machine: ['engine', 'box', 'tower'],
  tool: ['rod', 'blade', 'fork', 'cross'], bottle: ['vial', 'cup', 'shell'],
  board: ['card', 'slab', 'panel'], cloth: ['roll', 'fan'],
  coil: ['spiral', 'spool', 'roll'], ingot: ['slab', 'wedge'],
  sheet: ['slab', 'card'], wheel: ['ring', 'spiral'], lump: ['wedge', 'shell'],
  brick: ['slab', 'cup'], pellet: ['star', 'chip'], powder: ['cone', 'heap'],
  tower: ['arch', 'star'], panel: ['chip', 'slab'], ring: ['spiral', 'fan'],
  rod: ['fork', 'cross'], box: ['cup', 'roll'], card: ['chip', 'slab'],
  engine: ['fan', 'star'], dish: ['cup', 'shell'], vial: ['cup'], drum: ['roll'],
}
const CAP = 9
const re = /^(\s*)([a-z0-9_]+): \{ form: '([a-z]+)', colour: '(#[0-9a-fA-F]{6})' \},$/gm
const entries = [...src.matchAll(re)].map((m) => ({ indent: m[1], id: m[2], form: m[3], colour: m[4], raw: m[0] }))
const byForm = new Map()
for (const e of entries) byForm.set(e.form, [...(byForm.get(e.form) ?? []), e])
let moved = 0
for (const [form, list] of byForm) {
  const targets = MOVE[form]
  if (!targets || list.length <= CAP) continue
  list.slice(CAP).forEach((e, i) => {
    const to = targets[i % targets.length]
    src = src.replace(e.raw, `${e.indent}${e.id}: { form: '${to}', colour: '${e.colour}' },`)
    moved++
  })
}
writeFileSync(path, src)
console.log(`moved ${moved}`)
