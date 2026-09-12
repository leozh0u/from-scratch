import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { GAME_DATA } from '../src/data/gameData'

/*
 * Offline recipe authoring, never called at runtime — this is what step 19's
 * adjudicator is NOT. Gemini proposes candidate recipe chains toward one or
 * more named targets in a SINGLE call; every proposal lands in a staging
 * file and stays there until a human applies the verification rubric (real
 * transformation? does the source say what we claim? right unit?) and moves
 * it into gameData.ts by hand. Nothing in src/ ever imports from data/staging.
 *
 * Targets are batched into one request on purpose, not just for fewer round
 * trips: the "existing elements" context (which grows every session) is only
 * sent once instead of once per target, and batching lets the model share an
 * intermediate across targets that really do share it in the supply chain
 * (e.g. two Everyday targets both routing through cotton yarn) instead of
 * each single-target call independently reinventing a near-duplicate.
 */

const STAGING_DIR = new URL('../data/staging/', import.meta.url)
// An alias Google keeps pointed at their current default flash model, rather
// than a pinned version — pinned versions get deprecated mid-event.
const MODEL = 'gemini-flash-latest'

function loadEnvLocal() {
  const path = new URL('../.env.local', import.meta.url)
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z_]+)="?([^"]*)"?$/)
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2]
  }
}

loadEnvLocal()

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('GEMINI_API_KEY not set (checked process.env and .env.local).')
  process.exit(1)
}

const targets = process.argv.slice(2)
if (targets.length === 0) {
  console.error('Usage: npx tsx scripts/propose.ts "<target 1>" "<target 2>" ...')
  process.exit(1)
}

const proposalSchema = {
  type: 'object',
  properties: {
    output_id: { type: 'string' },
    output_name: { type: 'string' },
    inputs: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 },
    process: { type: 'string' },
    rationale: { type: 'string' },
    suggested_sources: {
      type: 'array',
      items: {
        type: 'object',
        properties: { label: { type: 'string' }, url: { type: 'string' } },
        required: ['label', 'url'],
      },
    },
  },
  required: ['output_id', 'output_name', 'inputs', 'process', 'rationale', 'suggested_sources'],
}

const responseSchema = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          target: { type: 'string' },
          proposals: { type: 'array', items: proposalSchema },
        },
        required: ['target', 'proposals'],
      },
    },
  },
  required: ['results'],
}

const existingElements = GAME_DATA.elements.map((el) => `${el.id} (${el.name})`).join(', ')

const targetList = targets.map((t, i) => `${i + 1}. ${t}`).join('\n')

const prompt = `You are proposing DRAFT recipe data for an educational crafting game. Every recipe combines
exactly two existing or newly-introduced materials via a real physical/industrial process to produce
one output — the game is Little-Alchemy-style (two inputs -> one output), and every edge must
reflect how the output is ACTUALLY manufactured, not a plausible-sounding guess.

Targets to reach (propose one chain per target, one entry in "results" per target, in this order):
${targetList}

Elements that already exist in the graph (reuse these as inputs where the real supply chain
actually uses them, rather than inventing a duplicate):
${existingElements}

IMPORTANT — these targets are being proposed together on purpose: if two targets' real supply
chains genuinely share an intermediate (e.g. both route through the same cotton yarn), use the
EXACT SAME output_id and output_name for it in both targets' proposal lists rather than inventing
two near-identical materials with different names. Don't force sharing where it isn't real, though.

For each recipe in a chain from raw/existing materials to its target, provide:
- output_id: snake_case id
- output_name: display name
- inputs: exactly two element ids (existing ids above, ids shared with another target per the rule
  above, or new ones you introduce earlier in your own chain)
- process: a real one-or-two-word verb (e.g. "spinning", "weaving", "refining") — this is
  educational flavor text shown to the player, so it must be the ACTUAL correct verb, not vague ("making")
- rationale: one sentence on why this transformation is real
- suggested_sources: 1-2 real, specific citable sources (prefer Wikipedia article titles + their
  real URL) that a human could open to verify the claim. Do not fabricate a URL — only suggest a
  source if you are confident the article exists at that exact URL.

This is a DRAFT for a human to verify against the actual sources before anything ships. Do not
claim certainty — flag in the rationale if you're unsure about a specific detail (e.g. exact
water/energy figures), since numbers are looked up separately, not proposed here.`

async function main() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    }),
  })

  if (!res.ok) {
    console.error(`Gemini API error: ${res.status} ${res.statusText}`)
    console.error(await res.text())
    process.exit(1)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    console.error('No text in response:', JSON.stringify(data, null, 2))
    process.exit(1)
  }

  const parsed: { results: { target: string; proposals: Record<string, unknown>[] }[] } =
    JSON.parse(text)

  mkdirSync(STAGING_DIR, { recursive: true })

  const usage = data.usageMetadata
  if (usage) {
    console.log(
      `Tokens — prompt: ${usage.promptTokenCount}, response: ${usage.candidatesTokenCount}, total: ${usage.totalTokenCount}`,
    )
  }

  for (const result of parsed.results) {
    const slug = result.target.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
    const outPath = new URL(`${slug}.json`, STAGING_DIR)
    writeFileSync(outPath, JSON.stringify(result, null, 2))

    console.log(
      `\n=== ${result.target} — wrote ${result.proposals.length} candidate recipe(s) to ${outPath.pathname} ===`,
    )
    for (const p of result.proposals as Array<{
      inputs: string[]
      output_name: string
      process: string
      rationale: string
      suggested_sources: { label: string; url: string }[]
    }>) {
      console.log(`  ${p.inputs.join(' + ')} -> ${p.output_name}  [${p.process}]`)
      console.log(`    ${p.rationale}`)
      for (const s of p.suggested_sources) console.log(`    source: ${s.label} — ${s.url}`)
    }
  }

  console.log('\nUNVERIFIED — apply the rubric to each before touching gameData.ts:')
  console.log('  1. Is the transformation real?')
  console.log('  2. Does the source say what we claim? (open the URL)')
  console.log('  3. Is the number/unit the right kind?')
}

main()
