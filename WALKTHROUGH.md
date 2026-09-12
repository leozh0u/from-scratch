# Walkthrough — every combination in the game

**Generated from `src/data/gameData.ts` by `npm run walkthrough`. Do not edit by hand.**

72 elements, 74 recipes. Steps are in an order you can actually follow: a combination only appears once you already hold both of its inputs.

## Survival

The tutorial: short, and it teaches the verb. Every recipe here costs nothing, because water and CO2 are the main game's lesson and inventing effort figures would be worse than zero.

**Targets:** Fire, Charcoal, Lit Torch

**You start with 3:** Stone, Wood, Plant Fibre

| # | Combine | | Gives | How | Cost |
| --- | --- | --- | --- | --- | --- |
| 1 | Stone | + Stone | Sharp Stone | knapping | — |
| 2 | Plant Fibre | + Plant Fibre | Cordage | twisting | — |
| 3 | Wood | + Wood | Hand Drill | spinning | — |
| 4 | Stone | + Plant Fibre | Tinder Bundle | shredding | — |
| 5 | Stone | + Wood | Bark | stripping | — |
| 6 | Wood | + Plant Fibre | Torch | wrapping | — |
| 7 | Wood | + Sharp Stone | Spindle | carving | — |
| 8 | Sharp Stone | + Spindle | Fire Board | carving | — |
| 9 | Wood | + Cordage | Bow | stringing | — |
| 10 | Bow | + Spindle | Bow Drill | assembling | — |
| 11 | Hand Drill | + Fire Board | Ember _(hand drill)_ | spinning | — |
| 12 | Bow Drill | + Fire Board | Ember _(bow drill)_ | drilling | — |
| 13 | Bark | + Sharp Stone | Tinder Bundle | shredding | — |
| 14 | Ember | + Tinder Bundle | Burning Tinder | blowing | — |
| 15 | Burning Tinder | + Wood | **Fire** | feeding | — |
| 16 | Fire | + Wood | **Charcoal** | charring | — |
| 17 | Torch | + Fire | **Lit Torch** | lighting | — |

All 3 targets reachable. ✅

## Everything

The main game. Everything a person can point at, and what it actually cost to make. Carries the real footprint numbers.

**Targets:** Cotton T-Shirt, Aluminium Can, Glass Bottle

**You start with 9:** Water, Soil, Limestone, Bauxite, Iron Ore, Crude Oil, Natural Gas, Beeswax, Textile Waste

**Carried over from Survival:** Stone, Wood, Plant Fibre, Cordage, Bark, Fire, Charcoal — these are real dependencies, which is why Survival comes first.

| # | Combine | | Gives | How | Cost |
| --- | --- | --- | --- | --- | --- |
| 1 | Water | + Fire | Salt | evaporating | — |
| 2 | Natural Gas | + Water | Ammonia | reforming | — |
| 3 | Ammonia | + Soil | Farmland | fertilising | — |
| 4 | Stone | + Water | Silica Sand | weathering | — |
| 5 | Limestone | + Fire | Quicklime | calcining | — |
| 6 | Salt | + Quicklime | Soda Ash | the Solvay process | — |
| 7 | Salt | + Water | Sodium Hydroxide | electrolysing | — |
| 8 | Iron Ore | + Charcoal | Pig Iron | smelting | — |
| 9 | Pig Iron | + Charcoal | High-Carbon Steel | carburising | — |
| 10 | High-Carbon Steel | + Wood | Cotton Gin | building | — |
| 11 | Silica Sand | + Soda Ash | Sodium Silicate | fusing | — |
| 12 | Sodium Silicate | + Limestone | Molten Glass | melting | 0.27 kg CO₂ |
| 13 | Molten Glass | + High-Carbon Steel | **Glass Bottle** | blowing | — |
| 14 | Bauxite | + Sodium Hydroxide | Alumina | the Bayer process | — |
| 15 | Crude Oil | + Fire | Distillate | distilling | — |
| 16 | Distillate | + Fire | Paraffin Wax | dewaxing | — |
| 17 | Alumina | + Charcoal | Molten Aluminium | the Hall-Heroult process | 0.178 kg CO₂ |
| 18 | Molten Aluminium | + High-Carbon Steel | Aluminium Sheet | rolling | — |
| 19 | Aluminium Sheet | + High-Carbon Steel | **Aluminium Can** | drawing | — |
| 20 | Farmland | + Water | Raw Cotton | cultivating | 2340 L water |
| 21 | Raw Cotton | + Cotton Gin | Ginned Cotton _(virgin)_ | ginning | — |
| 22 | Textile Waste | + Cotton Gin | Ginned Cotton _(recycled)_ | shredding | — |
| 23 | Ginned Cotton | + Ginned Cotton | Cotton Yarn | spinning | — |
| 24 | Cotton Yarn | + Cotton Yarn | Cotton Jersey | knitting | — |
| 25 | Plant Fibre | + Water | Dye _(plant)_ | boiling | — |
| 26 | Iron Ore | + Fire | Dye _(ochre)_ | grinding | — |
| 27 | Cotton Jersey | + Dye | Dyed Cotton Fabric | dyeing | 380 L water |
| 28 | Cotton Yarn | + Paraffin Wax | Sewing Thread _(paraffin)_ | waxing | — |
| 29 | Beeswax | + Cotton Yarn | Sewing Thread _(beeswax)_ | waxing | — |
| 30 | Dyed Cotton Fabric | + Sewing Thread | **Cotton T-Shirt** | sewing | — |
| 31 | Iron Ore | + Natural Gas | Pig Iron _(gas)_ | direct reduction | — |
| 32 | Limestone | + Salt | Soda Ash _(brine and limestone)_ | the Solvay process | — |
| 33 | Quicklime | + Pig Iron | Wrought Iron | refining | — |
| 34 | Wrought Iron | + Charcoal | High-Carbon Steel _(cementation)_ | blister steelmaking | — |
| 35 | Sodium Hydroxide | + Cotton Jersey | Mercerised Cotton | mercerising | — |
| 36 | Mercerised Cotton | + Dye | Dyed Cotton Fabric _(mercerised)_ | dyeing | 380 L water |
| 37 | Soil | + Water | Clay | washing | — |
| 38 | Clay | + Fire | Brick | firing | 0.21 kg CO₂ |
| 39 | Quicklime | + Water | Slaked Lime | slaking | — |
| 40 | Slaked Lime | + Silica Sand | Lime Mortar | mixing | — |
| 41 | Limestone | + Clay | Raw Meal | grinding | — |
| 42 | Raw Meal | + Fire | Cement | calcining | 0.9 kg CO₂ |
| 43 | Cement | + Silica Sand | Concrete | mixing | — |
| 44 | Wood | + Water | Wood Pulp | pulping | — |
| 45 | Wood Pulp | + High-Carbon Steel | Paper | pressing | — |
| 46 | Charcoal | + Water | Filtered Water | filtering | — |
| 47 | Stone | + Cement | Concrete _(coarse aggregate)_ | mixing | — |
| 48 | Bark | + Water | Tannin | soaking | — |
| 49 | Tannin | + Cotton Jersey | Dyed Cotton Fabric _(tannin)_ | dyeing | 380 L water |
| 50 | Wood | + Soil | Compost | rotting | — |
| 51 | Compost | + Soil | Farmland _(compost)_ | feeding | — |
| 52 | Natural Gas | + Textile Waste | Syngas | gasifying | — |
| 53 | Syngas | + Water | Ammonia _(gasification)_ | shifting | — |
| 54 | Paraffin Wax | + Cordage | Candle _(paraffin)_ | dipping | — |
| 55 | Beeswax | + Cordage | Candle _(beeswax)_ | dipping | — |
| 56 | Natural Gas | + Fire | Butane | fractionating | — |
| 57 | Butane | + High-Carbon Steel | Lighter | assembling | — |

All 3 targets reachable. ✅

## Alternate routes

Elements with more than one real way to make them. The receipt tells you which road you took.

- **Tinder Bundle** — Stone + Plant Fibre; or Bark + Sharp Stone
- **Ember** — Hand Drill + Fire Board (hand drill); or Bow Drill + Fire Board (bow drill)
- **Ammonia** — Natural Gas + Water; or Syngas + Water (gasification)
- **Farmland** — Ammonia + Soil; or Compost + Soil (compost)
- **Soda Ash** — Salt + Quicklime; or Limestone + Salt (brine and limestone)
- **Pig Iron** — Iron Ore + Charcoal; or Iron Ore + Natural Gas (gas)
- **High-Carbon Steel** — Pig Iron + Charcoal; or Wrought Iron + Charcoal (cementation)
- **Ginned Cotton** — Raw Cotton + Cotton Gin (virgin); or Textile Waste + Cotton Gin (recycled)
- **Dye** — Plant Fibre + Water (plant); or Iron Ore + Fire (ochre)
- **Dyed Cotton Fabric** — Cotton Jersey + Dye; or Mercerised Cotton + Dye (mercerised); or Tannin + Cotton Jersey (tannin)
- **Sewing Thread** — Cotton Yarn + Paraffin Wax (paraffin); or Beeswax + Cotton Yarn (beeswax)
- **Concrete** — Cement + Silica Sand; or Stone + Cement (coarse aggregate)
- **Candle** — Paraffin Wax + Cordage (paraffin); or Beeswax + Cordage (beeswax)

## How much of the board is a dead end

72 elements make 2,556 possible pairs, and 74 of them are recipes. **97.1% of everything you can try does nothing** — which is why explaining failure is where the teaching has to happen.
