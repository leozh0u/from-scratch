# From Scratch

A craft-and-combine game where **nothing is invented**. You start with a handful
of raw things, combine exactly two at a time, and work toward a finished object
— and every recipe is a transformation that actually happens in the world, with
a source you can click.

Finish something and you get a receipt for what it really cost to make.

**Play it:** https://from-scratch-three.vercel.app

---

## The idea

Little Alchemy teaches you that fire plus water makes steam. It does not teach
you anything about steam.

This does the same thing with real industrial chemistry. Striking flint on
high-carbon steel gives a spark; the spark catches in tinder and *smoulders*
before it flames, which is a correction we made after reading the source rather
than trusting the intuition. Cotton fibre braids into a wick. Crude oil refines
into paraffin. Wick and paraffin make a candle — and so do wick and beeswax,
because those are the two real histories of candle-making, and the receipt at
the end tells you which road you took.

Two realms, sharing one graph:

| Realm | Teaches | Targets |
| --- | --- | --- |
| **Survival** | The verb — how making anything works at all | Fire, Candle, Lighter |
| **Everyday Objects** | What ordinary manufactured things actually cost | Cotton T-Shirt, Aluminium Can, Glass Bottle |

They are not separate games. Everyday's sewing thread is waxed with Survival's
paraffin, and its aluminium chain cokes crude oil over Survival's fire. That is
why Survival comes first: not as arbitrary gating, but because the graph
genuinely requires it.

---

## Where the AI is, and where it deliberately is not

Two distinct uses, and the difference between them is the point.

**Offline, for authoring.** `scripts/propose.ts` asks Gemini to draft candidate
recipe chains into `data/staging/`. Nothing in `src/` may import from there. A
draft becomes real only when a human checks it against the rubric — is the
transformation real, does the source say what we claim, is the unit right — and
copies it into `gameData.ts` by hand. **The model proposes; it never ships.**

**At runtime, to explain a failure.** Over 98% of the pairs you can try produce
nothing, so "that didn't work" is the sentence this game says most often by an
enormous margin — and in a game about how things are made, that is where the
teaching has to happen.

It answers in two speeds:

- **Instantly**, from a local rule table over element properties. *A tool works
  on a material, so two tools have nothing to work on. Two rocks sitting
  together do nothing until something brings heat.* 946 pairs resolve in half a
  millisecond. This is better teaching than a per-pair fact, because it is the
  **grammar** of making things — learn it and you start predicting instead of
  guessing.
- **On request**, by pressing *why not?*, which asks Gemini about that specific
  pair. The best answer it gives is *"that's actually real, just not in here"*.

The model **cannot** grant you a discovery, and that is structural rather than
a matter of prompting. The endpoint receives the two element **names** and
nothing else — never the recipe list — and no code path turns its text into an
element. Only a real lookup in the recipe index does that.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # type-check, 71 assertions, production build
npm run solve    # solver report over the recipe graph
```

There is a dev-only styleguide at `/styleguide`.

---

## The tests

71 checks, because a project whose claim is rigour should be able to prove it.

- **The footprint accumulator does not double-count.** The graph is a DAG where
  a node is reachable by several paths, so a naive walk counts shared ancestors
  twice. `seed.ts` is a hand-computable fixture whose header states both
  answers; the tests assert the right one (0.08) *and* that it is not the wrong
  one (0.09).
- **Every numeric claim carries a source**, every citation is a well-formed
  URL, and Survival carries zero cost by rule — water and CO₂ are Everyday's
  lesson, and inventing "time and effort" figures dressed up in those fields
  would be worse than zero.
- **Known gaps are pinned, not forgotten.** The t-shirt has no CO₂ figure and
  the can has no water figure, because published water data for primary
  aluminium spans 495–1,490 L/kg and a number that uncertain presented as fact
  is the one mistake this project cannot afford. A test asserts the gap is
  exactly that size, so closing it *fails the build* and forces the expectation
  to be tightened rather than the gap to be forgotten.
- **No local explanation may say a pair is impossible** — the model can answer
  "that's actually real", and the two would contradict each other. A test walks
  every pair looking for *impossible / cannot / never*.
- **The pixel staircase is symmetric.** Mirror the corner polygon about its
  centreline and the points must be unchanged. Written after a real bug where
  a panel's left corners stepped and its right corners came out square.

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

Every element links to its own reference in-game.

---

## Credits

- Backdrop art: `public/forest-hillside.svg` and `public/neon-city.png`,
  both collected from [Pixie](https://pixiepng.com/).
- Type: Press Start 2P.
- Sound is synthesised at runtime, not sampled.
