/*
 * DEFAULTS TO A LOCAL PREVIEW SERVER, DELIBERATELY.
 *
 * The first run of this pointed at the production URL and did 48,000
 * requests in two minutes. Vercel's automatic DDoS mitigation denied the
 * whole IP — `x-vercel-mitigated: deny` — and the live link stopped loading
 * from this network for everyone on it, in the middle of a hackathon, in a
 * browser as well as from curl. Nothing was wrong with the project; the
 * platform was doing exactly what it should.
 *
 * So the target is `npm run preview` on localhost, which serves the same
 * built files with no CDN and no firewall in front of them. That measures
 * the application. Pointing it at production measures Vercel's patience, and
 * you find the edge of that by losing your demo.
 *
 * If you really do want a number from the live edge, use a handful of
 * requests, not a ramp:
 *   BASE_URL=https://from-scratch-three.vercel.app k6 run --vus 2 --duration 10s load/gameplay.js
 */
/*
 * The one piece of server in the whole project.
 *
 * `api/adjudicate.ts` is a Vercel function that exists for exactly one
 * reason: to keep the Gemini key off the client. It holds no state between
 * invocations, so it does not have a capacity in the usual sense — Vercel
 * starts another instance. What it HAS got is a cold start and a prepaid
 * balance, and those are the two things worth measuring.
 *
 * THE THING THIS TEST REFUSES TO DO
 *
 * Firing a thousand requests at the live endpoint would measure the latency
 * once and spend the demo's Gemini credit doing it. So the load is split:
 *
 *   cold   — the function's own overhead, at whatever volume you like, using
 *            a body the handler rejects at its validation step. That path
 *            never reaches Gemini and never costs anything, and it is still a
 *            real cold start, a real function invocation and a real network
 *            round trip. This is the part that answers "does the function
 *            fall over under concurrency".
 *   live   — the real path, capped at 20 calls by default, because this one
 *            spends money. Raise it deliberately with LIVE_CALLS=n or not at
 *            all.
 *
 * In the game itself this endpoint is reached at most a handful of times per
 * player anyway: src/adjudicator/client.ts caches every answer in
 * localStorage forever and caps a session at 20 calls, 5 a minute. So the
 * realistic worst case for 1000 simultaneous players is bounded by the
 * client, not by the server.
 *
 * The function only exists when something is serving it, so this one needs
 * `vercel dev` rather than `npm run preview` — or BASE_URL pointed at the
 * deployment, at the low volumes described at the top of this file.
 *
 * Run: npm run load:api          (cold path only, free)
 *      LIVE_CALLS=20 npm run load:api
 */

import http from 'k6/http'
import { check } from 'k6'
import { Trend } from 'k6/metrics'

const BASE = __ENV.BASE_URL || 'http://localhost:3000'
const LIVE_CALLS = Number(__ENV.LIVE_CALLS || 0)

const coldMs = new Trend('function_overhead_ms', true)
const liveMs = new Trend('gemini_round_trip_ms', true)

export const options = {
  scenarios: {
    cold: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 30,
      maxVUs: 200,
      stages: [
        { target: 30, duration: '15s' },
        { target: 80, duration: '20s' },
        { target: 0, duration: '5s' },
      ],
      exec: 'cold',
    },
    ...(LIVE_CALLS > 0
      ? {
          live: {
            executor: 'shared-iterations',
            vus: 4,
            iterations: LIVE_CALLS,
            maxDuration: '2m',
            exec: 'live',
            startTime: '5s',
          },
        }
      : {}),
  },
  thresholds: {
    // The validation path does no work, so anything slow here is the platform
    // rather than the handler.
    function_overhead_ms: ['p(95)<1200'],
    'checks{path:cold}': ['rate>0.99'],
  },
}

export function cold() {
  /*
   * An empty name fails the handler's length check and returns 400 before any
   * outbound call. Deliberately not a malformed JSON body, which some runtimes
   * reject at the platform edge and would never reach our code at all.
   */
  const res = http.post(`${BASE}/api/adjudicate`, JSON.stringify({ a: '', b: '' }), {
    headers: { 'content-type': 'application/json' },
    tags: { path: 'cold' },
  })
  coldMs.add(res.timings.duration)
  check(res, { 'handler rejected it, as designed': (r) => r.status === 400 }, { path: 'cold' })
}

/*
 * Real pairs that are NOT recipes, because that is the only case the game
 * ever sends. Sending a real recipe would be testing a path the client never
 * takes.
 */
const PAIRS = [
  ['Limestone', 'Beeswax'],
  ['Bauxite', 'Cordage'],
  ['Paper', 'Salt'],
  ['Brick', 'Tannin'],
]

export function live() {
  const [a, b] = PAIRS[__ITER % PAIRS.length]
  const res = http.post(`${BASE}/api/adjudicate`, JSON.stringify({ a, b }), {
    headers: { 'content-type': 'application/json' },
    tags: { path: 'live' },
    timeout: '30s',
  })
  liveMs.add(res.timings.duration)
  check(
    res,
    {
      'answered 200': (r) => r.status === 200,
      // A null message is the documented quiet failure, so it is a pass for
      // the endpoint and a fail for the feature. Counted separately.
      'and said something': (r) => {
        try {
          return typeof JSON.parse(r.body).message === 'string'
        } catch {
          return false
        }
      },
    },
    { path: 'live' },
  )
}
