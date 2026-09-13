/**
 * The two endpoints, exercised — and the fence asserted where it matters.
 *
 * WHY THIS EXISTS
 *
 * Leo: *"make sure the api stuff works"*. Everything about them was checked by
 * reading until now: `asktest.ts` greps the source for the rules it expects to
 * find, which catches a rule being deleted and nothing else. The handlers
 * themselves — the 405, the 400, the behaviour when the key is missing, the
 * trimming of a truncated answer — had never been run.
 *
 * They can be. A Vercel function is a plain async function of a request and a
 * response, so it runs in Node with a stubbed `fetch` standing in for Gemini.
 * No key, no network, and every branch reachable.
 *
 * THE ONE THAT MATTERS
 *
 * The last section asserts the fence at the only place it can be proved: the
 * bytes actually sent to Google. The whole project rests on the claim that the
 * model never sees the recipe graph, and every other statement of that is a
 * promise — a comment, a prompt, an architecture diagram. This reads the
 * outgoing request body and fails if a single element id from `gameData.ts`
 * appears in it.
 *
 *   npm run test:api
 */
import askHandler from '../api/ask'
import adjudicateHandler from '../api/adjudicate'
import { GAME_DATA } from '../src/data/gameData'

let pass = 0
let fail = 0
const ok = (label: string, condition: boolean, detail = '') => {
  if (condition) {
    pass++
    console.log(`  ok    ${label}${detail ? '  — ' + detail : ''}`)
  } else {
    fail++
    console.log(`  FAIL  ${label}${detail ? '  — ' + detail : ''}`)
  }
}

/** The smallest thing a Vercel handler will accept as a response. */
function mockRes() {
  const out: { code: number | null; body: unknown } = { code: null, body: null }
  const res = {
    status(code: number) {
      out.code = code
      return res
    },
    json(body: unknown) {
      out.body = body
      return res
    },
  }
  return { res, out }
}

type Sent = { url: string; body: string }

/** Stand in for Google, and keep what was sent so the fence can be read. */
function stubGemini(reply: string | null, status = 200) {
  const sent: Sent[] = []
  globalThis.fetch = (async (url: string, init?: { body?: string }) => {
    sent.push({ url: String(url), body: String(init?.body ?? '') })
    return {
      ok: status === 200,
      status,
      json: async () =>
        reply === null
          ? {}
          : { candidates: [{ content: { parts: [{ text: reply }] } }] },
    }
  }) as unknown as typeof fetch
  return sent
}

const call = async (handler: typeof askHandler, req: Record<string, unknown>) => {
  const { res, out } = mockRes()
  // The handlers take Vercel's types; the shape they actually touch is this.
  await handler(req as never, res as never)
  return out
}

async function main() {
  process.env.GEMINI_API_KEY = 'test-key-not-real'

  console.log('\n=== ask: the method and the body are checked before anything else ===')
  {
    stubGemini('It is made by heating limestone. That drives off carbon dioxide.')
    ok('a GET is refused', (await call(askHandler, { method: 'GET' })).code === 405)
    ok(
      'a question outside the closed set is refused',
      (await call(askHandler, { method: 'POST', body: { name: 'Chalk', question: 'cost' } })).code === 400,
      'the whole point of a closed set',
    )
    ok(
      'a missing name is refused',
      (await call(askHandler, { method: 'POST', body: { question: 'how' } })).code === 400,
    )
    ok(
      'an absurdly long name is refused',
      (await call(askHandler, { method: 'POST', body: { name: 'x'.repeat(500), question: 'how' } })).code === 400,
      'a name field is not a prompt field',
    )
    const good = await call(askHandler, { method: 'POST', body: { name: 'Chalk', question: 'how' } })
    ok('a valid question answers', good.code === 200 && typeof (good.body as { message: string }).message === 'string')
  }

  console.log('\n=== ask: every failure is a soft one, never a crash ===')
  {
    stubGemini(null, 500)
    const down = await call(askHandler, { method: 'POST', body: { name: 'Chalk', question: 'why' } })
    ok('gemini failing gives 200 and no message', down.code === 200 && (down.body as { message: unknown }).message === null)

    stubGemini('the process begins when the stone is')
    const cut = await call(askHandler, { method: 'POST', body: { name: 'Chalk', question: 'why' } })
    ok(
      'an answer cut off mid-clause is refused rather than shown',
      cut.code === 200 && (cut.body as { message: unknown }).message === null,
      'this happened live to charcoal',
    )

    delete process.env.GEMINI_API_KEY
    const keyless = await call(askHandler, { method: 'POST', body: { name: 'Chalk', question: 'how' } })
    ok('a missing key is the deployment\'s problem, not the player\'s', keyless.code === 200)
    process.env.GEMINI_API_KEY = 'test-key-not-real'
  }

  console.log('\n=== adjudicate: the same guards ===')
  {
    stubGemini('They just sit next to each other. Nothing passes between them.')
    ok('a GET is refused', (await call(adjudicateHandler, { method: 'GET' })).code === 405)
    const good = await call(adjudicateHandler, {
      method: 'POST',
      body: { a: 'Stone', b: 'Beeswax', realm: 'survival' },
    })
    ok('a valid pair answers', good.code === 200)
  }

  /*
   * THE FENCE, READ OFF THE WIRE.
   *
   * Every other statement of this is a promise. This is the only one that is
   * evidence: the bytes that actually left the process.
   */
  console.log('\n=== the fence: what actually goes to google ===')
  {
    const sent = stubGemini('Limestone is heated until it gives up its carbon dioxide.')
    await call(askHandler, { method: 'POST', body: { name: 'Quicklime', question: 'how' } })
    await call(adjudicateHandler, { method: 'POST', body: { a: 'Stone', b: 'Beeswax', realm: 'survival' } })
    ok('both endpoints sent exactly one request each', sent.length === 2, `${sent.length} requests`)

    const wire = sent.map((s) => s.body).join(' ')

    /*
     * Element IDS are the give-away. They are snake_case and appear nowhere in
     * human prose, so finding one in the request body means the graph leaked.
     * Names are excluded from this check on purpose — a name is exactly what
     * the endpoint is supposed to receive.
     */
    const leaked = GAME_DATA.elements
      .map((el) => el.id)
      .filter((id) => id.includes('_'))
      .filter((id) => wire.includes(id))
    ok('no element id reaches the model', leaked.length === 0, leaked.slice(0, 5).join(', '))

    /*
     * Process names, but only the ones the PROMPT does not already use as
     * ordinary English.
     *
     * The first version of this check failed on "melting", "cutting" and
     * "heating" — and that was the test being crude, not a leak. The
     * adjudicator's prompt lists what does not count as making something
     * ("burning, igniting or melting it"), and those are English words that
     * happen to also be processes in the graph.
     *
     * So the baseline is the prompt itself, taken by sending names that cannot
     * appear in it. Anything matched against a real request and NOT in the
     * baseline came from the graph, which is the thing worth failing on.
     */
    const baselineSent = stubGemini('A sentence that ends properly and is long enough.')
    await call(askHandler, { method: 'POST', body: { name: 'Zzqx', question: 'how' } })
    await call(adjudicateHandler, { method: 'POST', body: { a: 'Zzqx', b: 'Wwvy', realm: 'survival' } })
    const baseline = baselineSent.map((s) => s.body).join(' ').toLowerCase()

    const processes = [...new Set(GAME_DATA.recipes.map((r) => r.process))]
      .filter((p) => p.length > 4)
      .filter((p) => wire.toLowerCase().includes(p.toLowerCase()))
      .filter((p) => !baseline.includes(p.toLowerCase()))
    ok(
      'no recipe process name reaches the model that the prompt did not already say',
      processes.length === 0,
      processes.length ? processes.slice(0, 5).join(', ') : 'checked against the prompt\'s own wording',
    )

    ok(
      'the request carries the names it was given, and those are in the prompt',
      wire.includes('Quicklime') && wire.includes('Stone') && wire.includes('Beeswax'),
      'which is the entire payload',
    )
    ok(
      'and it is small — a prompt, not a database',
      Math.max(...sent.map((s) => s.body.length)) < 4000,
      `largest body ${Math.max(...sent.map((s) => s.body.length))} bytes against a ${(JSON.stringify(GAME_DATA).length / 1024).toFixed(0)}KB graph`,
    )
  }

  console.log(`\n${pass} passed, ${fail} failed\n`)
  process.exit(fail === 0 ? 0 : 1)
}

main()
