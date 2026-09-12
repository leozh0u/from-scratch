# From Scratch

A craft-and-combine game where **nothing is invented**. You start with three
things you could pick up on a walk, combine exactly two at a time, and work
toward a finished object — and every recipe is a transformation that actually
happens in the world, with a source you can click.

Finish something and you get a receipt for what it really cost to make.

**Play it:** https://from-scratch-three.vercel.app

---

## The idea

Little Alchemy teaches you that fire plus water makes steam. It does not teach
you anything about steam.

This does the same thing with real industrial chemistry, and it starts lower
than you expect. The whole game opens with **Stone, Wood and Plant Fibre**.
Fire is not given to you; it is the first thing you make, by spinning wood
against wood until the dust smoulders, which is how it was actually done.

Every pair of those three starters does something, so a new player's first
guess works whatever they try.

| Realm | Teaches | Targets |
| --- | --- | --- |
| **Survival** | The verb — how making anything works at all | Fire, Charcoal, Lit Torch |
| **Everyday Objects** | What ordinary manufactured things actually cost | Cotton T-Shirt, Aluminium Can, Glass Bottle |

They are not separate games. Everyday cannot smelt without Survival's charcoal
or evaporate without its fire, so the aluminium can's receipt traces twenty-two
ancestors back through the ember and the hand drill to a stone and a stick.
That is why Survival comes first: not as gating, but because the graph
genuinely requires it.

**85 elements, 87 recipes, and thirteen of them have more than one real route.**
The receipt records which road you took.

---

## There are two ways to do almost everything, and that is the lesson

- **Fire** comes from a hand drill in three steps, or a bow drill in six. The
  hand drill is how it was first done and it usually fails; the bow drill is
  more work to build and works every time. That is the argument for building a
  tool before you need one.
- **Farmland** comes from ammonia and soil — the Haber-Bosch process, which
  feeds roughly half the people alive — or from a compost heap, which takes a
  season and no gas well.
- **Ammonia** itself comes from natural gas, or from gasifying old clothes.
- **Steel** comes straight from pig iron, or through wrought iron and the
  cementation process.
- **Cotton** comes from a watered field, or from shredded textile waste, which
  skips the 2,340 litres entirely rather than charging a smaller number for it.
- **Dye** comes from boiled plants, from red ochre, or from bark tannin.

---

## Where the AI is, and where it deliberately is not

Two distinct uses, and the difference between them is the point.

**Offline, for authoring.** `scripts/propose.ts` asks Gemini to draft candidate
recipes, and `scripts/probe.ts` asks the live adjudicator which *missing* pairs
it thinks are real — which is where a third of the current recipes came from.
Nothing in `src/` may import either. A draft becomes real only when a human
checks the transformation against a source and copies it in by hand. **The
model proposes; it never ships.**

**At runtime, to explain a failure.** Over 97% of the pairs you can try produce
nothing, so "that didn't work" is the sentence this game says most often by an
enormous margin — and in a game about how things are made, that is where the
teaching has to happen.

It answers in two speeds:

- **Instantly**, from a local rule table over element properties. *A tool works
  on a material, so two tools have nothing to work on. Cold metal keeps its
  shape. Two reagents need a third thing.* Thirty-six rules answer **87% of the
  2,554 pairs that are not recipes**, in half a millisecond, offline. This is
  better teaching than a per-pair fact, because it is the **grammar** of making
  things — learn it and you start predicting instead of guessing.
- **On request**, by pressing *why not?*, which asks Gemini about that specific
  pair. The best answer it gives is *"that's actually real, just not in here"*,
  and that answer is a bug report we act on.

The model **cannot** grant you a discovery, and that is structural rather than
a matter of prompting. The endpoint receives the two element **names** and
nothing else — never the recipe list — and no code path turns its text into an
element. Only a real lookup in the recipe index does that.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # type-check, 207 assertions, production build
npm run solve        # reachability and cost report over the recipe graph
npm run walkthrough  # regenerate WALKTHROUGH.md from the data
npm run probe        # ask the live adjudicator which missing pairs are real
npm run snap         # snap traced pixel art back onto its real grid
npm run sheet        # every sprite on one page at the size it is used
npm run preview      # serve the production build on :4173
npm run load         # k6 load test against that preview
npm run load:api     # k6 against the one serverless function
npm run links        # fetch every citation and check it still exists
npm run links -- --new   # only the ones not already passing
npm run propose "X" "Y"  # ask Gemini for draft chains toward named targets
npm run import       # throw out every draft that is provably wrong
```

There is a dev-only styleguide at `/styleguide`.

`GAMEPLAN.md` is the design; `plan/graph.txt` is that design in a form
`npm test` can check. `PROGRESS.md` is the running log, and its ledger is at
the top.

---

## The tests

207 assertions, because a project whose claim is rigour should be able to prove
it. The ones worth knowing about are the ones that caught something:

- **The footprint accumulator does not double-count.** The graph is a DAG where
  a node is reachable by several paths, so a naive walk counts shared ancestors
  twice. `seed.ts` is a hand-computable fixture whose header states both
  answers; the tests assert the right one (0.08) *and* that it is not the wrong
  one (0.09).
- **The solver refuses a cyclic graph**, and it has earned that twice. Letting
  you recycle your own finished t-shirt back into cotton closed a loop, and so
  did heat-treating stone for better knapping. Both are real; neither can exist
  here, because the accumulator walks ancestors and a cycle either recurses
  forever or silently double-counts the step it was meant to skip.
- **No local explanation may say a pair is impossible** — the model can answer
  "that's actually real", and the two would contradict each other. A test walks
  every pair looking for *impossible / cannot / never*, and it caught a rule on
  the way in.
- **The failure table has to keep up with the element count.** The fallback
  share is pinned under a fifth, so adding elements without adding grammar
  fails the build.
- **Every element has its own art.** No sprite may be shared and none may fall
  back to the flame. This found twenty-four missing sprites in one run.
- **The title screen fits on every device, both ways round.** Written after the
  sizes were computed from viewport width alone, which put all three menu
  buttons below the fold of a phone held sideways — on a screen that clips its
  overflow, so the game could not be started at all in landscape.
- **Motion is rare enough to be an event.** The shooting stars shipped at a
  rate that read as "never"; the city's window lights were measured at 7.6
  changes a second, which is a twinkle rather than a city. Both are now
  measured rather than watched.
- **The pixel staircase is symmetric.** Mirror the corner polygon about its
  centreline and the points must be unchanged. Written after a real bug where
  a panel's left corners stepped and its right corners came out square.

---

## How you know nothing here is invented

At seventy-two elements, by a human reading every source. That does not scale,
and the failure it guards against is the one that would destroy this project: a
model asked for a citation produces a real-looking URL to an article that has
never existed, and by eye it is indistinguishable from a good one.

So a citation now says how much checking it has had, rather than implying the
strongest kind everywhere.

**Sourced** means a person opened the page, confirmed it says what the game
claims, and confirmed the units. All 151 citations in the game are currently
this.

**Referenced** means `npm run links` fetched the URL, got an answer, and
confirmed the page title still matches the label printed next to it. That
proves the article exists and nothing more, which is why the game marks it on
the card instead of hiding it.

**A footprint figure may only ever rest on a Sourced citation.** "This page
exists" is no evidence at all for "this costs 2,340 litres", and `npm test`
fails the build if a recipe with a non-zero cost has nothing hand-read behind
it. That is the one rule that does not bend as the element count grows.

### The gate between a model and the game

`npm run propose` writes draft chains to `data/staging/`, which is gitignored
and which `src/` cannot import from. `npm run import` then throws away
everything provably wrong before a human opens a single citation: a URL that
404s, a label that leads to a different article, an id that already exists, an
input that does not, a pair another recipe already owns, a chain that closes a
loop, a placeholder verb like "making" where the real process word belongs.

What it deliberately does not do is write to `gameData.ts`. Judgement — does
this transformation really happen, does the page really say so — stays human,
and every survivor it prints is marked `referenced` with a zero footprint, so
nothing that comes through this route can quietly become a claim about a
number. The model proposes; it never ships.

Exercised against a staged file carrying one good proposal and six bad ones:
all six rejected, each for the right reason, including a fabricated Wikipedia
URL caught by its 404 and a real URL under a label belonging to a different
article.

First real run of the link checker over all 79 distinct URLs: 79 answer and
match their label. It
also caught a live mismatch on the way in — a citation labelled "Mercerised
cotton" pointing at a page titled "Mercerisation" — which is a redirect rather
than a broken link, and is why the matcher compares word prefixes. English does
that to every process in this game.

---

## Can it take a crowd

The honest answer is that there is almost nothing to take a crowd *with*, and
that is the design rather than a gap in it.

**There is no database, no accounts and no session state.** The whole thing is
static files on a CDN plus exactly one serverless function, `api/adjudicate.ts`,
whose only job is to keep the Gemini key off the client. It remembers nothing
between invocations, by construction.

**A player is one page load and then silence.** The recipe graph, the solver,
the sprites and your progress all live in the tab once the page is up.
Combining two elements is a lookup in a Map on your own machine — no request is
made, nothing is written anywhere else, and that stays true whether you play
for one minute or an hour. So the server does zero work per move, and two
people playing at the same time never touch the same thing, because there is no
shared thing to touch.

**Progress is `localStorage`, which is why there are no accounts.** It is
per-browser, it never leaves the machine, and the game asks for no personal
information at all — there is nothing to sign in *to*. The cost is that
progress does not follow you to another device, which for a game about making a
t-shirt from soil is the right trade.

The one shared resource is the Gemini quota, and it is protected on the client
where it can actually be protected: every answer is cached in `localStorage`
forever, and a session is capped at 20 calls, five a minute. A thousand
simultaneous players are bounded by that cap, not by the function.

### The load test

`load/gameplay.js` models **arrivals** rather than a fixed pool of users,
because the load is new players showing up, not existing players doing work. It
ramps to 250 new players a second, and reads the hashed bundle name out of
`index.html` at setup so it cannot end up measuring 404s after a rebuild.

Measured against the production build on `npm run preview`: **48,151 requests,
16,050 complete player sessions, 401 requests a second, zero failures, p95 of
4ms for a full cold page load.** Against the live deployment before the run was
stopped, p95 was 179ms for the same thing.

It was stopped because it worked. Pointed at production, the ramp did 48,000
requests in two minutes and Vercel's automatic DDoS mitigation denied the whole
IP — `x-vercel-mitigated: deny`, in a browser as well as from curl. Nothing was
wrong with the project; the platform did exactly what it should. Both scripts
default to localhost now, and the reason is written at the top of each file.

`load/adjudicate.js` splits the serverless function in two. The **cold** path
sends a body the handler rejects at its own validation step, so it never
reaches Gemini and costs nothing, and can be run at any volume — that is the
one that answers whether the function survives concurrency. The **live** path
is capped at 20 calls and has to be asked for by name, because that one spends
money.

---

## Sources

The headline number is real. Chapagain & Hoekstra et al. 2006, *The Water
Footprint of Cotton Consumption*, Table 9: for a 250 g t-shirt, 1,230 L blue
water (irrigation) + 1,110 L green (rainfall) + 380 L dilution = **2,720 L**.
That is where the commonly quoted "~2,700 litres" comes from, and the game
splits it across the steps exactly as the source does.

Glass: FEVE's life-cycle assessment gives ~0.9 kg CO₂ per kg of container
glass; at one 500 ml bottle of 300 g that is 0.27 kg, charged to the melt,
because the melt is where the energy goes.

Aluminium: the carbon anode is consumed by the reaction itself, roughly 1.5 t
CO₂ per tonne of metal from the anode alone. The electricity is not claimed,
because it varies by grid by more than a factor of ten.

Cement: about 0.9 kg CO₂ per kg, two thirds of it out of the limestone rather
than the fuel. Concrete is the most used material on earth after water, and
cement alone is roughly eight percent of human CO₂.

Every element links to its own reference in-game.

---

## Built with

React 19, TypeScript and Vite, styled with Tailwind, linted with Oxlint,
deployed on Vercel from `main`. The pixel art is not image files: sprites are
authored as arrays of strings, one character per pixel, and a renderer merges
horizontal runs of the same colour into `<rect>` elements — so every icon in
the game is editable in a text editor and an 11×11 tile costs tens of SVG
nodes rather than hundreds. Load testing is k6. The scene backdrops are the
only bitmaps.

---

## Credits

- Backdrop art: `public/forest-hillside.png` and `public/big-city.png`, both
  collected from Pixie. Both arrived as vector traces, and both were snapped
  back onto their real 128×128 grid with `npm run snap` — the city reduction
  verified lossless across all 262,144 pixels.
- Type: Press Start 2P, and Silkscreen for the wordmark.
- Sound is synthesised at runtime, not sampled.
