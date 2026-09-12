# Walkthrough — every combination in the game

**Generated from `src/data/gameData.ts` by `npm run walkthrough`. Do not edit by hand.**

57 elements, 51 recipes. Steps are in an order you can actually follow: a combination only appears once you already hold both of its inputs.

## Survival

Teaches the verb — how making anything works at all. Every recipe here costs nothing: water and CO₂ are Everyday’s lesson, and inventing effort figures would be worse than zero.

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

## Everyday Objects

Teaches what ordinary manufactured things actually cost. Carries the real footprint numbers.

**Targets:** Cotton T-Shirt, Aluminium Can, Glass Bottle

**You start with 9:** Water, Soil, Limestone, Bauxite, Iron Ore, Crude Oil, Natural Gas, Beeswax, Textile Waste

**Carried over from Survival:** Stone, Wood, Plant Fibre, Cordage, Fire, Charcoal — these are real dependencies, which is why Survival comes first.

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
| 31 | Paraffin Wax | + Cordage | Candle _(paraffin)_ | dipping | — |
| 32 | Beeswax | + Cordage | Candle _(beeswax)_ | dipping | — |
| 33 | Natural Gas | + Fire | Butane | fractionating | — |
| 34 | Butane | + High-Carbon Steel | Lighter | assembling | — |

All 3 targets reachable. ✅

## Alternate routes

Elements with more than one real way to make them. The receipt tells you which road you took.

- **Tinder Bundle** — Stone + Plant Fibre; or Bark + Sharp Stone
- **Ember** — Hand Drill + Fire Board (hand drill); or Bow Drill + Fire Board (bow drill)
- **Ginned Cotton** — Raw Cotton + Cotton Gin (virgin); or Textile Waste + Cotton Gin (recycled)
- **Dye** — Plant Fibre + Water (plant); or Iron Ore + Fire (ochre)
- **Sewing Thread** — Cotton Yarn + Paraffin Wax (paraffin); or Beeswax + Cotton Yarn (beeswax)
- **Candle** — Paraffin Wax + Cordage (paraffin); or Beeswax + Cordage (beeswax)

## How much of the board is a dead end

57 elements make 1,596 possible pairs, and 51 of them are recipes. **96.8% of everything you can try does nothing** — which is why explaining failure is where the teaching has to happen.
