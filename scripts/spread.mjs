import { readFileSync, writeFileSync } from 'node:fs'
const path = 'src/data/iconRegistry.ts'
let src = readFileSync(path, 'utf8')
const re = /^(\s*)([a-z0-9_]+): \{ form: '([a-z]+)', colour: '(#[0-9a-fA-F]{6})' \},$/gm
const entries = [...src.matchAll(re)].map(m => ({ indent: m[1], id: m[2], form: m[3], colour: m[4], raw: m[0] }))

const rgb = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16))
const hex = a => '#' + a.map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')
const dist = (a,b) => { const x=rgb(a), y=rgb(b); return Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2]) }

function hsl(h,s,l){
  const c=(1-Math.abs(2*l-1))*s, x=c*(1-Math.abs(((h/60)%2)-1)), m=l-c/2
  let r,g,b
  if(h<60)[r,g,b]=[c,x,0]; else if(h<120)[r,g,b]=[x,c,0]; else if(h<180)[r,g,b]=[0,c,x]
  else if(h<240)[r,g,b]=[0,x,c]; else if(h<300)[r,g,b]=[x,0,c]; else [r,g,b]=[c,0,x]
  return hex([(r+m)*255,(g+m)*255,(b+m)*255])
}

const MIN = 66
const byForm = new Map()
for (const e of entries) byForm.set(e.form, [...(byForm.get(e.form) ?? []), e])

let changed = 0
for (const [, list] of byForm) {
  const kept = []
  for (const e of list) {
    if (kept.every(k => dist(k.colour, e.colour) >= MIN)) { kept.push(e); continue }
    // Search hue/lightness space for the nearest colour that clears everything.
    let best = null
    for (let l = 0.30; l <= 0.80 && !best; l += 0.06) {
      for (let h = 0; h < 360; h += 7) {
        for (const s of [0.55, 0.35, 0.72, 0.18]) {
          const c = hsl(h, s, l)
          if (kept.every(k => dist(k.colour, c) >= MIN)) { best = c; break }
        }
        if (best) break
      }
    }
    if (!best) { kept.push(e); continue }
    src = src.replace(e.raw, `${e.indent}${e.id}: { form: '${e.form}', colour: '${best}' },`)
    e.colour = best
    kept.push(e)
    changed++
  }
}
writeFileSync(path, src)
console.log(`respread ${changed} colours`)
