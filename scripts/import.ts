/**
 * The gate between a model's proposals and the game.
 *
 * `npm run propose` writes candidate chains to `data/staging/`. Nothing in
 * `src/` can import from there, and this does not write to `gameData.ts`
 * either. What it does is throw away everything that is provably wrong before
 * a human looks, and print the survivors as code to paste. The model proposes;
 * it never ships.
 *
 * WHY A GATE RATHER THAN A WRITER
 *
 * The slow step in growing this game was never typing. It was reading: most of
 * an hour goes on opening citations, and the great majority of what gets
 * rejected is rejected for reasons a machine can see — a URL that 404s, an id
 * that already exists, a pair already spoken for, a chain that closes a loop.
 * Every one of those checked here is a citation nobody has to open.
 *
 * What is deliberately NOT automated is the judgement: does this
 * transformation really happen, and does the page really say so. That stays
 * human, and everything this prints is marked `referenced` and carries a zero
 * footprint, so a survivor cannot silently become a claim about a number.
 *
 *   npm run import                 check everything staged
 *   npm run import -- --no-fetch   skip the network pass (structure only)
 *
 * Exit code is 0 even when proposals are rejected: rejection is the normal
 * case and the report is the output.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { GAME_DATA } from '../src/data/gameData'
import { pageTitle, titleMatches } from './links'

const STAGING = new URL('../data/staging/', import.meta.url)

type Proposal = {
  output_id: string
  output_name: string
  inputs: string[]
  process: string
  rationale: string
  suggested_sources: { label: string; url: string }[]
}

type Verdict = { proposal: Proposal; problems: string[] }

const existingIds = new Set(GAME_DATA.elements.map((e) => e.id))
const existingNames = new Set(GAME_DATA.elements.map((e) => e.name.toLowerCase()))
const pairKey = (a: string, b: string) => [a, b].sort().join('+')
const usedPairs = new Set(GAME_DATA.recipes.map((r) => pairKey(r.inputs[0], r.inputs[1])))

/**
 * Would adding these edges close a loop?
 *
 * The solver rejects a cyclic graph and it has earned that twice on real
 * chemistry — recycling a finished t-shirt back into cotton, and heat-treating
 * stone to knap it better. Both are true and neither can exist here, because
 * the footprint accumulator walks ancestors and a cycle either recurses
 * forever or double-counts the step it was meant to skip.
 *
 * So it is checked BEFORE a human spends twenty minutes sourcing a chain that
 * cannot be added whatever the sources say.
 */
export function wouldCycle(
  edges: { output: string; inputs: string[] }[],
  existing: { output: string; inputs: string[] }[],
): string[] {
  const producers = new Map<string, string[][]>()
  for (const e of [...existing, ...edges]) {
    producers.set(e.output, [...(producers.get(e.output) ?? []), e.inputs])
  }

  const bad: string[] = []
  for (const edge of edges) {
    const seen = new Set<string>()
    const stack = [...edge.inputs]
    while (stack.length) {
      const id = stack.pop()!
      if (id === edge.output) {
        bad.push(edge.output)
        break
      }
      if (seen.has(id)) continue
      seen.add(id)
      for (const inputs of producers.get(id) ?? []) stack.push(...inputs)
    }
  }
  return [...new Set(bad)]
}

/** Everything checkable without the network. */
export function structuralProblems(p: Proposal, introduced: Set<string>): string[] {
  const problems: string[] = []

  if (!/^[a-z][a-z0-9_]*$/.test(p.output_id)) problems.push(`id "${p.output_id}" is not snake_case`)
  if (existingIds.has(p.output_id)) problems.push(`id "${p.output_id}" already exists`)
  if (existingNames.has(p.output_name?.toLowerCase?.() ?? '')) {
    problems.push(`name "${p.output_name}" already exists under a different id`)
  }
  if (p.inputs?.length !== 2) problems.push(`needs exactly two inputs, got ${p.inputs?.length}`)

  for (const input of p.inputs ?? []) {
    if (!existingIds.has(input) && !introduced.has(input)) {
      problems.push(`input "${input}" does not exist and is not introduced earlier in this chain`)
    }
  }

  if (p.inputs?.length === 2) {
    const key = pairKey(p.inputs[0], p.inputs[1])
    if (usedPairs.has(key)) {
      const taken = GAME_DATA.recipes.find((r) => pairKey(r.inputs[0], r.inputs[1]) === key)
      problems.push(`pair ${p.inputs.join(' + ')} already makes ${taken?.output}`)
    }
  }

  /*
   * A one-or-two-word real verb. "making", "creating" and "processing" are
   * the model reaching for something when it does not know the actual verb,
   * and that word is shown to the player as the thing they just did.
   */
  if (!p.process || p.process.split(/\s+/).length > 2) {
    problems.push(`process "${p.process}" should be one or two words`)
  }
  if (/^(making|creating|processing|producing|forming|combining)$/i.test(p.process ?? '')) {
    problems.push(`process "${p.process}" is a placeholder verb, not a real one`)
  }

  if (!p.suggested_sources?.length) problems.push('no source suggested')

  return problems
}

async function checkSource(source: { label: string; url: string }): Promise<string | null> {
  if (!/^https:\/\//.test(source.url)) return `source url is not https: ${source.url}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)
  try {
    const res = await fetch(source.url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml',
      },
    })
    if (!res.ok) return `source ${res.status}: ${source.url}`
    const title = pageTitle((await res.text()).slice(0, 20_000))
    if (!title) return null
    if (!titleMatches(source.label, title)) {
      return `source labelled "${source.label}" is a page titled "${title}"`
    }
    return null
  } catch {
    return `source unreachable: ${source.url}`
  } finally {
    clearTimeout(timer)
  }
}

/** The block a human pastes, once they have read the sources. */
function emit(p: Proposal, realm: string): string {
  const sources = p.suggested_sources
    .map((s) => `{ label: '${s.label.replace(/'/g, "\\'")}', url: '${s.url}', tier: 'referenced' }`)
    .join(', ')
  return [
    `    // ${p.rationale}`,
    `    { id: '${p.output_id}', name: '${p.output_name}', icon: '${p.output_id}', realm: '${realm}', blurb: "TODO", sources: [${sources}] },`,
    `    // recipe:`,
    `    { inputs: ['${p.inputs[0]}', '${p.inputs[1]}'], output: '${p.output_id}', process: '${p.process}', cost: ZERO_COST, sources: [${sources}] },`,
  ].join('\n')
}

async function main() {
  const noFetch = process.argv.includes('--no-fetch')
  if (!existsSync(STAGING)) {
    console.log('\nNothing staged. Run `npm run propose "<target>"` first.\n')
    return
  }

  const files = readdirSync(STAGING).filter((f) => f.endsWith('.json'))
  if (files.length === 0) {
    console.log('\nNothing staged.\n')
    return
  }

  const accepted: Proposal[] = []
  const rejected: Verdict[] = []

  for (const file of files) {
    const raw = JSON.parse(readFileSync(new URL(file, STAGING), 'utf8'))
    const proposals: Proposal[] = raw.proposals ?? []
    console.log(`\n=== ${raw.target ?? file} — ${proposals.length} proposed ===`)

    /*
     * Ids introduced earlier in the SAME chain count as available, because a
     * chain is allowed to build on itself. Filled in as the chain is walked
     * rather than up front, so a proposal cannot reference something defined
     * after it.
     */
    const introduced = new Set<string>()
    const chainEdges: { output: string; inputs: string[] }[] = []

    for (const p of proposals) {
      const problems = structuralProblems(p, introduced)

      if (problems.length === 0 && !noFetch) {
        for (const source of p.suggested_sources) {
          const problem = await checkSource(source)
          if (problem) problems.push(problem)
        }
      }

      if (problems.length === 0) {
        introduced.add(p.output_id)
        chainEdges.push({ output: p.output_id, inputs: p.inputs })
        accepted.push(p)
        console.log(`  keep    ${p.inputs.join(' + ')} -> ${p.output_name}  [${p.process}]`)
      } else {
        rejected.push({ proposal: p, problems })
        console.log(`  drop    ${p.output_name}`)
        for (const problem of problems) console.log(`            ${problem}`)
      }
    }

    const cycles = wouldCycle(
      chainEdges,
      GAME_DATA.recipes.map((r) => ({ output: r.output, inputs: r.inputs })),
    )
    for (const id of cycles) {
      const index = accepted.findIndex((a) => a.output_id === id)
      if (index >= 0) {
        rejected.push({ proposal: accepted[index], problems: ['closes a loop in the graph'] })
        accepted.splice(index, 1)
        console.log(`  drop    ${id} — closes a loop in the graph`)
      }
    }
  }

  console.log(`\n=== ${accepted.length} survived, ${rejected.length} rejected ===`)

  if (accepted.length) {
    console.log(`
Paste-ready, but NOT verified. Each one still needs a human to answer:
  1. Does this transformation really happen?
  2. Does the page actually say so? (open it)
Everything below is marked 'referenced' and costs ZERO_COST on purpose — a
machine-checked link may never carry a number. Write a real blurb.
`)
    for (const p of accepted) console.log(emit(p, 'everyday'))
  }
}

if (process.argv[1] && process.argv[1].endsWith('import.ts')) {
  main()
}
