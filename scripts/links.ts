/**
 * Every citation in the game points at a page that exists, and says what we
 * say it says on the label.
 *
 * WHY THIS IS THE LOAD-BEARING SCRIPT
 *
 * The project's one claim is that nothing here is invented. At seventy-two
 * elements that is kept by a human reading every source. At three hundred it
 * is not, and the failure mode is specific and ugly: a model asked for a
 * citation produces a real-looking URL to an article that has never existed,
 * and it is indistinguishable from a good one by eye. That is the single
 * mistake that would destroy this project, so it is the one thing checked by
 * machine rather than trusted.
 *
 * WHAT IT PROVES AND WHAT IT DOES NOT
 *
 * It proves the page is reachable and that the title we print next to the link
 * still corresponds to it. It does NOT prove the page supports the claim — no
 * script can — which is exactly why the tier exists. A `sourced` citation had
 * a human read it; a `referenced` one has only been through here. The game
 * says which, on the card, rather than implying the stronger one everywhere.
 *
 *   npm run links            check every URL
 *   npm run links -- --new   only URLs not in the pass cache
 *
 * Results are cached in `scratch/linkcache.json` (gitignored) so a re-run
 * after adding ten elements checks ten URLs and not four hundred.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { GAME_DATA } from '../src/data/gameData'
import type { Source } from '../src/data/types'

const CACHE_PATH = new URL('../scratch/linkcache.json', import.meta.url)
const TIMEOUT_MS = 15_000
/*
 * Six at a time. Enough to check four hundred links in a couple of minutes,
 * far short of anything a host would read as abuse — a lesson learned today
 * at some cost, when a load test at four hundred requests a second got this
 * project's own deployment firewalled mid-hackathon.
 */
const CONCURRENCY = 6

type CacheEntry = { status: number; title: string | null; checkedAt: string }
type Cache = Record<string, CacheEntry>

function readCache(): Cache {
  try {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf8'))
  } catch {
    return {}
  }
}

function writeCache(cache: Cache) {
  const dir = new URL('../scratch/', import.meta.url)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + '\n')
}

/** Every citation in the game, with the element or recipe it belongs to. */
export function allCitations(): { where: string; source: Source }[] {
  const out: { where: string; source: Source }[] = []
  for (const element of GAME_DATA.elements) {
    for (const source of element.sources) out.push({ where: element.name, source })
  }
  for (const recipe of GAME_DATA.recipes) {
    for (const source of recipe.sources) {
      out.push({ where: `${recipe.inputs.join(' + ')} -> ${recipe.output}`, source })
    }
  }
  return out
}

/** The <title> of a fetched page, lower-cased and stripped of site suffixes. */
export function pageTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]{0,300}?)<\/title>/i)
  if (!match) return null
  return match[1]
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Does the page title correspond to the label the game prints?
 *
 * Deliberately loose, and the looseness is the point. A citation labelled
 * "Hall-Heroult process" pointing at a page titled "Hall–Héroult process -
 * Wikipedia" is correct, and a checker that fails on an en dash or an accent
 * is a checker nobody will keep running. What it is actually catching is the
 * case that matters: a label describing one thing and a URL leading to
 * something else entirely, or to a 404 page whose title is "Page not found".
 *
 * So: strip accents and punctuation, drop the site suffix after a dash, and
 * ask whether a majority of the label's real words appear.
 */
export function titleMatches(label: string, title: string): boolean {
  const normalise = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const t = normalise(title)
  // "Not found", "Access denied" and friends are titles too, and they are the
  // exact thing this is for.
  if (/\b(not found|page not found|error|access denied|forbidden|just a moment)\b/.test(t)) {
    return false
  }

  const words = normalise(label)
    .split(' ')
    .filter((w) => w.length > 2 && !['the', 'and', 'for', 'process'].includes(w))
  if (words.length === 0) return true

  /*
   * A word counts if the title contains it, OR contains a long enough prefix
   * of it. English does this to every process in the game — calcining and
   * calcination, smelting and smelter, mercerised and mercerisation — and a
   * checker that treats "Mercerised cotton" pointing at "Mercerisation" as a
   * broken link is a checker that cries wolf on the first real run. It did,
   * on the first real run.
   *
   * The prefix has to be at least five characters, which is long enough that
   * it is not matching on a common stem by accident.
   */
  const hits = words.filter((w) => {
    if (t.includes(w)) return true
    if (w.length < 6) return false
    return t.includes(w.slice(0, Math.max(5, w.length - 3)))
  }).length
  return hits / words.length >= 0.5
}

async function check(url: string): Promise<CacheEntry> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      /*
       * A browser user agent, because several publishers serve a bot a 403
       * and a person the article. Checking whether a citation exists is the
       * most ordinary possible reason to fetch a page, and being refused for
       * looking like a script would make the checker report failures that are
       * not failures.
       */
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml',
      },
    })
    const html = res.ok ? (await res.text()).slice(0, 20_000) : ''
    return { status: res.status, title: html ? pageTitle(html) : null, checkedAt: new Date().toISOString() }
  } catch (error) {
    return {
      status: 0,
      title: error instanceof Error && error.name === 'AbortError' ? 'timeout' : 'network error',
      checkedAt: new Date().toISOString(),
    }
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  const onlyNew = process.argv.includes('--new')
  const cache = readCache()
  const citations = allCitations()

  // Deduped by URL: the same article is cited by an element and its recipe all
  // over the data, and fetching it twelve times is rude and slow.
  const byUrl = new Map<string, { where: string; source: Source }[]>()
  for (const c of citations) {
    const list = byUrl.get(c.source.url) ?? []
    list.push(c)
    byUrl.set(c.source.url, list)
  }

  const urls = [...byUrl.keys()].filter((u) => !(onlyNew && cache[u]?.status === 200))
  console.log(
    `\n${citations.length} citations, ${byUrl.size} distinct URLs, checking ${urls.length}${onlyNew ? ' (new only)' : ''}\n`,
  )

  let done = 0
  const queue = [...urls]
  async function worker() {
    for (;;) {
      const url = queue.shift()
      if (!url) return
      cache[url] = await check(url)
      done++
      if (done % 20 === 0) console.log(`  ...${done}/${urls.length}`)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  writeCache(cache)

  const dead: string[] = []
  const mislabelled: string[] = []
  const tiers = { sourced: 0, referenced: 0 }

  for (const [url, uses] of byUrl) {
    const entry = cache[url]
    for (const use of uses) tiers[use.source.tier ?? 'sourced']++
    if (!entry) continue
    if (entry.status !== 200) {
      dead.push(`  ${entry.status || 'no response'}  ${url}\n      cited by ${uses.map((u) => u.where).join(', ')}`)
      continue
    }
    if (entry.title && !titleMatches(uses[0].source.label, entry.title)) {
      mislabelled.push(`  "${uses[0].source.label}"\n      page says "${entry.title}"\n      ${url}`)
    }
  }

  console.log(`\n=== tiers ===`)
  console.log(`  sourced     ${tiers.sourced}  (a human read it and checked the units)`)
  console.log(`  referenced  ${tiers.referenced}  (fetched and title-checked here, never carries a number)`)

  if (dead.length) {
    console.log(`\n=== ${dead.length} dead ===`)
    dead.forEach((d) => console.log(d))
  }
  if (mislabelled.length) {
    console.log(`\n=== ${mislabelled.length} where the label does not match the page ===`)
    mislabelled.forEach((m) => console.log(m))
  }

  const ok = byUrl.size - dead.length - mislabelled.length
  console.log(`\n${ok}/${byUrl.size} URLs answer and match their label\n`)
  if (dead.length || mislabelled.length) process.exit(1)
}

// Importable by the tests without running the network pass.
if (process.argv[1] && process.argv[1].endsWith('links.ts')) {
  main()
}
