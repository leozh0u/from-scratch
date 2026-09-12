/**
 * Every element's icon on one page, so they can be judged together.
 *
 * "make sure the pixelated small emojis are good and accurate for all" is not
 * something a test can answer. A test can say a sprite is rectangular, is not
 * the fallback flame, and is not identical to another one — all of which pass
 * happily for art that is unreadable or wrong for the thing it names.
 *
 * The only check that works is looking at all of them at once, at the size
 * they are actually used, next to their names. This writes that page.
 *
 *   npm run sheet && open scratch/sprites.html
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { GAME_DATA } from '../src/data/gameData'
import { resolveIcon } from '../src/data/iconRegistry'

const SCALE = 4

function render(rows: string[], palette: Record<string, string>): string {
  const w = rows[0].length
  const h = rows.length
  const cells: string[] = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x]
      if (ch === '.') continue
      const colour = palette[ch]
      if (!colour) continue
      cells.push(
        `<i style="left:${x * SCALE}px;top:${y * SCALE}px;background:${colour}"></i>`,
      )
    }
  }
  return `<div class="s" style="width:${w * SCALE}px;height:${h * SCALE}px">${cells.join('')}</div>`
}

const byRealm = { survival: [] as string[], everyday: [] as string[] }
for (const element of GAME_DATA.elements) {
  const sprite = resolveIcon(element.icon)
  const ink = sprite.rows.join('').split('').filter((c) => c !== '.').length
  const total = sprite.rows.length * sprite.rows[0].length
  const coverage = Math.round((ink / total) * 100)
  byRealm[element.realm].push(
    `<figure${coverage < 8 || coverage > 92 ? ' class="flag"' : ''}>
       ${render(sprite.rows, sprite.palette)}
       <figcaption>${element.name}<small>${coverage}%</small></figcaption>
     </figure>`,
  )
}

writeFileSync(
  'scratch/sprites.html',
  `<!doctype html><meta charset="utf-8"><title>sprites</title>
<style>
  body { background:#262246; color:#fff; font:12px ui-monospace,monospace; padding:24px; }
  h2 { font-size:13px; letter-spacing:.14em; text-transform:uppercase; color:#a29ec4; margin:28px 0 12px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,96px); gap:14px; }
  figure { margin:0; text-align:center; }
  .s { position:relative; margin:0 auto 6px; image-rendering:pixelated; }
  .s i { position:absolute; width:${SCALE}px; height:${SCALE}px; }
  figcaption { font-size:10px; line-height:1.4; color:#ded9f5; }
  small { display:block; color:#6f6a96; }
  .flag figcaption { color:#ff7b6b; }
</style>
<h1 style="font-size:14px">${GAME_DATA.elements.length} elements</h1>
<h2>Survival</h2><div class="grid">${byRealm.survival.join('')}</div>
<h2>Everything</h2><div class="grid">${byRealm.everyday.join('')}</div>`,
)
console.log(`scratch/sprites.html — ${GAME_DATA.elements.length} icons`)
