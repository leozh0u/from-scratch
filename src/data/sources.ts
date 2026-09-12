import type { Source } from './types'

/** Merges any number of source lists, deduped by URL, order preserved. */
export function dedupeSources(...lists: Source[][]): Source[] {
  const seen = new Set<string>()
  const out: Source[] = []
  for (const source of lists.flat()) {
    if (seen.has(source.url)) continue
    seen.add(source.url)
    out.push(source)
  }
  return out
}
