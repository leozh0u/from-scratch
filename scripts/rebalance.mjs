import { readFileSync, writeFileSync } from 'node:fs'
const path = 'src/data/iconRegistry.ts'
let src = readFileSync(path, 'utf8')
const MOVE = {
  grid: ['arch', 'chip', 'star', 'plate'], machine: ['engine', 'box', 'tower', 'anvilf'],
  tool: ['rod', 'blade', 'fork', 'cross', 'brush', 'hook'], bottle: ['vial', 'cup', 'shell', 'jar'],
  board: ['card', 'slab', 'panel', 'plate'], cloth: ['roll', 'fan', 'wave'],
  coil: ['spiral', 'spool', 'roll', 'coilspring'], ingot: ['slab', 'wedge', 'bar'],
  sheet: ['slab', 'card', 'plate'], wheel: ['ring', 'spiral', 'lens'], lump: ['wedge', 'shell', 'seedpod'],
  brick: ['slab', 'cup', 'cap'], pellet: ['star', 'chip', 'pin'], powder: ['cone', 'heap', 'seedpod'],
  tower: ['arch', 'star', 'tube'], panel: ['chip', 'slab', 'plate'], ring: ['spiral', 'fan', 'lens'],
  rod: ['fork', 'cross', 'pin', 'nib'], box: ['cup', 'roll', 'jar'], card: ['chip', 'slab', 'plate'],
  engine: ['fan', 'star', 'anvilf'], dish: ['cup', 'shell', 'plate'], vial: ['cup', 'jar'], drum: ['roll', 'tube'],
  cup: ['jar', 'cap', 'plate'], chip: ['plate', 'cap', 'clip'], slab: ['plate', 'wave', 'card'],
  arch: ['wave', 'hook', 'tube'], fan: ['leafy', 'brush', 'wave'], roll: ['tube', 'coilspring'],
  spiral: ['coilspring', 'clip'], star: ['pin', 'clip'], blade: ['saw', 'nib'],
  cone: ['seedpod', 'nib'], plant: ['leafy', 'seedpod'], shell: ['lens', 'wave'],
  wedge: ['nib', 'anvilf'], fork: ['brush', 'hook'], spool: ['coilspring', 'tube'],
}
const CAP = 11
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
