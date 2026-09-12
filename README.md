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

**72 elements, 74 recipes, and thirteen of them have more than one real route.**
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
npm test             # type-check, 135 assertions, production build
npm run solve        # reachability and cost report over the recipe graph
npm run walkthrough  # regenerate WALKTHROUGH.md from the data
npm run probe        # ask the live adjudicator which missing pairs are real
npm run snap         # snap traced pixel art back onto its real grid
```

There is a dev-only styleguide at `/styleguide`.

`GAMEPLAN.md` is the design; `plan/graph.txt` is that design in a form
`npm test` can check. `PROGRESS.md` is the running log, and its ledger is at
the top.

---

## The tests

135 assertions, because a project whose claim is rigour should be able to prove
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

## Credits

- Backdrop art: `public/forest-hillside.png` and `public/big-city.png`, both
  collected from Pixie. Both arrived as vector traces, and both were snapped
  back onto their real 128×128 grid with `npm run snap` — the city reduction
  verified lossless across all 262,144 pixels.
- Type: Press Start 2P, and Silkscreen for the wordmark.
- Sound is synthesised at runtime, not sampled.
