# The game plan — the whole system, both realms

> `CLAUDE.md` is what the project is. `docs/ARCHITECTURE.md` is how the logic
> scales. `docs/DESIGN.md` is how it looks. **This is the content**: every element
> and every recipe, for both realms, from three starting things.
>
> The tables below are **generated** from `plan/graph.txt` by
> `npm run plan`, and `npm test` checks that graph for reachability, pair
> collisions and starter reuse. A plan this size cannot be proof-read — the
> first draft had four elements nothing could reach, and the checker found
> them in a second.

---

## 1. What was wrong, measured

`WALKTHROUGH.md` shows the shipped game. **Nineteen starting elements, and
fourteen of them are used exactly once.** A starter is meant to be an
ingredient you keep coming back to; Little Alchemy has four, and earth appears
in a hundred recipes. That reuse *is* the game. Ours were single-use parts
handed over with the recipe already attached.

The starters were also not primitive. A **cotton gin is a machine** — more
complex than most things you built with it. **High-carbon steel** is a
manufactured alloy handed over like a rock. **Crude oil and natural gas were
survival starters**, in the realm where a person has their hands and a forest.

And a real logic bug was hiding in that: you struck flint on high-carbon steel
to make the spark that made fire, but **you cannot smelt steel without fire**.
The game handed you a thing that required the goal in order to reach the goal.

---

## 2. The new shape

**Three things. Everything else is earned.**

> ## Stone · Wood · Plant Fibre

That is the whole starting inventory of the game. Everyday Objects adds the
materials you can only get by digging or pumping — but it opens with Survival's
fire, charcoal and tools already in hand, so it never starts from nothing.

**Fire is not a starter. Fire is the first thing you make.** Little Alchemy
hands you fire because its fire is an ingredient; ours is an achievement, and
the opening act of the game is earning it the way it was actually earned — by
spinning wood against wood until it smoulders.

### How the reuse changed

| | Shipped | Planned |
| --- | --- | --- |
| Starters | 19 | **11** (3 in Survival) |
| Starters used only once | 14 of 19 | **3 of 11** |
| Elements | 43 | **57** |
| Recipes | 26 | **52** |
| Wood is used in | — | **9 recipes** |
| Fire is used in | 1 | **7 recipes** |

Wood 9, fire 7, water 6, stone 5, plant fibre 5, sharp stone 4. Those are
ingredients now.

---

## 3. Survival — three acts

**Act I, fire from nothing.** Every pair of the three starters does something,
which is the best possible opening: a new player's first random guess works.
Stone on stone knaps a blade, fibre twisted on fibre makes cordage, wood spun
on wood is a hand drill, and stone against fibre shreds a tinder bundle.

There are **two ways to make an ember**, and that is the lesson of the act. The
hand drill is three steps from the start and it is how it was done first. The
bow drill is six steps and it is how it was done once people got tired of
failing. Both are real, the game records which one you used, and the slow
reliable road is worth more than the fast unreliable one.

**Act II, fire makes charcoal.** Fire spent on wood gives charcoal, and
charcoal is the bridge: it is the fuel that makes metal possible, and it is
what you carry into the second realm.

**Act III, fire you can carry.** A torch is fibre wrapped on a stick, lit.

### When Survival ends

**When you can make fire on purpose, twice.** Act I is fire by luck and sweat.
Act III is fire in your hand that you can walk with. Everyday Objects unlocks
there — not as arbitrary gating, but because its first smelt needs charcoal and
its first evaporation needs fire, and you now have both.

**Targets: Fire · Charcoal · Lit Torch.**

---

## 4. Everyday Objects — what the modern world costs

Its starters are the things you genuinely extract: water, soil, limestone,
bauxite, iron ore, crude oil, natural gas, beeswax. Nothing manufactured is
handed over, and **the machines are built, not given**:

- **Cotton Gin** = High-Carbon Steel + Wood. It is a machine; building it is
  the point.
- **Soda Ash** = Salt + Quicklime — the **Solvay process**, one of the most
  important industrial reactions there is, and we were skipping it entirely.
- **Salt** = Water + Fire. Evaporation, the oldest chemistry there is.
- **Farmland** = Ammonia + Soil, where ammonia is Natural Gas + Water — the
  **Haber–Bosch process**, which is why the planet can feed eight billion
  people, and it was nowhere in the game.
- **Dye** has two real routes: boiled plant fibre, or **red ochre**, which is
  iron oxide and the oldest pigment humans have used.
- **Textile Waste** = your own finished T-Shirt, cut up. A footprint game that
  lets you **recycle the shirt you just made** back into the chain is the best
  single idea in this document.

**Targets: Cotton T-Shirt · Aluminium Can · Glass Bottle**, with Candle and
Lighter as side routes — both moved here out of Survival, because a candle
needs refined paraffin and a lighter needs butane and a pressed steel case.

---

## 5. The whole system

### Survival

**You start with 3:** Stone · Wood · Plant Fibre

| # | | | |
| --- | --- | --- | --- |
| 1 | Stone | + Stone | = **Sharp Stone** |
| 2 | Plant Fibre | + Plant Fibre | = **Cordage** |
| 3 | Wood | + Wood | = **Hand Drill** |
| 4 | Stone | + Plant Fibre | = **Tinder Bundle** |
| 5 | Stone | + Wood | = **Bark** |
| 6 | Wood | + Plant Fibre | = **Torch** |
| 7 | Wood | + Sharp Stone | = **Spindle** |
| 8 | Sharp Stone | + Spindle | = **Fire Board** |
| 9 | Wood | + Cordage | = **Bow** |
| 10 | Bow | + Spindle | = **Bow Drill** |
| 11 | Hand Drill | + Fire Board | = **Ember** |
| 12 | Bow Drill | + Fire Board | = **Ember** |
| 13 | Bark | + Sharp Stone | = **Tinder Bundle** |
| 14 | Ember | + Tinder Bundle | = **Flame** |
| 15 | Flame | + Wood | = **Fire** |
| 16 | Fire | + Wood | = **Charcoal** |
| 17 | Torch | + Fire | = **Lit Torch** |

### Everyday Objects

**You start with 8:** Water · Soil · Limestone · Bauxite · Iron Ore · Crude Oil · Natural Gas · Beeswax

| # | | | |
| --- | --- | --- | --- |
| 1 | Water | + Fire | = **Salt** |
| 2 | Natural Gas | + Water | = **Ammonia** |
| 3 | Ammonia | + Soil | = **Farmland** |
| 4 | Stone | + Water | = **Silica Sand** |
| 5 | Limestone | + Fire | = **Quicklime** |
| 6 | Salt | + Quicklime | = **Soda Ash** |
| 7 | Salt | + Water | = **Sodium Hydroxide** |
| 8 | Iron Ore | + Charcoal | = **Pig Iron** |
| 9 | Pig Iron | + Charcoal | = **High-Carbon Steel** |
| 10 | High-Carbon Steel | + Wood | = **Cotton Gin** |
| 11 | Silica Sand | + Soda Ash | = **Sodium Silicate** |
| 12 | Sodium Silicate | + Limestone | = **Molten Glass** |
| 13 | Molten Glass | + High-Carbon Steel | = **Glass Bottle** |
| 14 | Bauxite | + Sodium Hydroxide | = **Alumina** |
| 15 | Crude Oil | + Fire | = **Distillate** |
| 16 | Distillate | + Fire | = **Paraffin Wax** |
| 17 | Alumina | + Charcoal | = **Molten Aluminium** |
| 18 | Molten Aluminium | + High-Carbon Steel | = **Aluminium Sheet** |
| 19 | Aluminium Sheet | + High-Carbon Steel | = **Aluminium Can** |
| 20 | Farmland | + Water | = **Raw Cotton** |
| 21 | Raw Cotton | + Cotton Gin | = **Ginned Cotton** |
| 22 | Ginned Cotton | + Ginned Cotton | = **Cotton Yarn** |
| 23 | Cotton Yarn | + Cotton Yarn | = **Cotton Jersey** |
| 24 | Plant Fibre | + Water | = **Dye** |
| 25 | Iron Ore | + Fire | = **Dye** |
| 26 | Cotton Jersey | + Dye | = **Dyed Cotton Fabric** |
| 27 | Cotton Yarn | + Paraffin Wax | = **Sewing Thread** |
| 28 | Dyed Cotton Fabric | + Sewing Thread | = **Cotton T-Shirt** |
| 29 | Cotton T-Shirt | + Sharp Stone | = **Textile Waste** |
| 30 | Paraffin Wax | + Cordage | = **Candle** |
| 31 | Natural Gas | + Fire | = **Butane** |
| 32 | Butane | + High-Carbon Steel | = **Lighter** |
| 33 | Beeswax | + Cordage | = **Candle** |
| 34 | Beeswax | + Cotton Yarn | = **Sewing Thread** |
| 35 | Textile Waste | + Cotton Gin | = **Ginned Cotton** |

57 elements, 52 recipes.

---

## 6. What this costs to build

Fifty-two recipes, each needing a real source before it ships — **the rule that
we never invent a citation does not bend for scope**. Fifty-seven elements,
each needing a sprite; sprite work is the quiet cost and it is the real limit.

Ordered so that stopping anywhere still leaves a working game:

1. **Survival first, whole.** Seventeen recipes, fourteen new elements, and it
   is the realm a judge touches first. Self-contained: if nothing else lands,
   the game still opens on three stones and ends with fire in your hand.
2. **The machines-not-starters fixes** in Everyday — gin, soda ash, salt,
   farmland, dye. Five changes, high teaching value each, and they do not
   disturb the chains below them.
3. **The recycling loop** — shirt to waste to yarn.
4. **The rest of Everyday** as time allows.

**Not in this plan, deliberately:** paper, concrete, PET, bread, smartphone.
All were considered and all are out of scope tonight. Saying so is cheaper than
half-building one.
