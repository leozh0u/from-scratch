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
 * WHAT THIS ACTUALLY MEASURES, AND WHY IT IS THE WHOLE ANSWER
 *
 * "Can the app handle many people at once" is usually a question about a
 * server: connection pools, a database, session state, a queue. This game has
 * none of those, and that is a design decision rather than an omission.
 *
 * A player's entire session is ONE page load. The recipe graph, the solver,
 * the sprites and the saved progress all live in the browser after that, so
 * from the second the page finishes loading until the player closes the tab,
 * the app makes zero further requests. Combining two elements is a lookup in
 * a Map in their own tab. Nothing is sent anywhere and nothing is written on
 * a server, because there is no server holding anything.
 *
 * So concurrency here is a question about ASSET DELIVERY, and this is the
 * test for it: arrivals per second, not fixed users, because the load is new
 * players showing up rather than existing players doing work. If 200 people
 * arrive in a second, that is 200 page loads and then silence.
 *
 * The asset URLs are read out of index.html at setup rather than hard-coded,
 * because Vite hashes the bundle name on every build and a test pinned to an
 * old hash would quietly be measuring 404s, which are fast and prove nothing.
 *
 * Run: npm run load
 */

import http from 'k6/http'
import { check, fail } from 'k6'
import { Trend, Rate } from 'k6/metrics'

const BASE = __ENV.BASE_URL || 'http://localhost:4173'

/** How long a whole page load took, cold cache, as a player would feel it. */
const firstLoad = new Trend('player_first_load_ms', true)
/** A repeat visitor: index.html revalidates, the hashed assets are cached. */
const returnLoad = new Trend('player_return_load_ms', true)
const assetErrors = new Rate('asset_errors')

export const options = {
  scenarios: {
    /*
     * Arrivals, not virtual users. A constant-VU test would model 300 people
     * each reloading the page forever, which nobody does. This models a room
     * of judges and a posted link: a rising rate of NEW players, each loading
     * once.
     */
    arrivals: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 400,
      stages: [
        { target: 20, duration: '20s' },   // a table of judges
        { target: 100, duration: '30s' },  // the link goes round the room
        { target: 250, duration: '30s' },  // it goes round the hackathon
        { target: 250, duration: '30s' },  // hold
        { target: 0, duration: '10s' },
      ],
    },
  },
  thresholds: {
    /*
     * Stated up front so the test can FAIL rather than produce a number
     * somebody has to interpret generously afterwards.
     */
    asset_errors: ['rate<0.01'],
    player_first_load_ms: ['p(95)<1500'],
    http_req_failed: ['rate<0.01'],
  },
}

export function setup() {
  const res = http.get(`${BASE}/`)
  if (res.status !== 200) fail(`index.html returned ${res.status} — is ${BASE} up?`)

  const js = res.body.match(/src="(\/assets\/[^"]+\.js)"/)
  const css = res.body.match(/href="(\/assets\/[^"]+\.css)"/)
  if (!js || !css) fail('could not find the hashed bundle in index.html')

  return {
    js: js[1],
    css: css[1],
    // The two pieces of artwork a player sees before touching anything. They
    // are the largest things on the wire, so leaving them out would make the
    // test look better than the game is.
    images: ['/big-city.png', '/forest-hillside.png'],
  }
}

export default function (paths) {
  const returning = __ITER % 3 !== 0

  /*
   * The browser fetches the bundle, the stylesheet and the artwork in
   * parallel once it has the HTML, so they go in one batch. Requesting them
   * one after another would measure a browser nobody uses and inflate the
   * number by three round trips.
   */
  const started = Date.now()
  const index = http.get(`${BASE}/`, { tags: { asset: 'index' } })

  const batch = returning
    ? [['GET', `${BASE}${paths.js}`, null, { headers: { 'if-none-match': 'cached' } }]]
    : [
        ['GET', `${BASE}${paths.js}`, null, { tags: { asset: 'js' } }],
        ['GET', `${BASE}${paths.css}`, null, { tags: { asset: 'css' } }],
        ...paths.images.map((p) => ['GET', `${BASE}${p}`, null, { tags: { asset: 'img' } }]),
      ]

  const responses = http.batch(batch)
  const elapsed = Date.now() - started

  const allOk = [index, ...responses].every((r) => r.status === 200 || r.status === 304)
  assetErrors.add(!allOk)
  if (returning) returnLoad.add(elapsed)
  else firstLoad.add(elapsed)

  check(index, {
    'index.html served': (r) => r.status === 200,
    // Proof it is the real page and not an edge error page, which also
    // returns 200 and would otherwise pass every check above.
    'is the game, not an error page': (r) => r.body.includes('/assets/index-'),
  })

  /*
   * No sleep and no second iteration for this player. That is the point: once
   * the page is up, a player generates no further load for the rest of their
   * session, however long they play.
   */
}
