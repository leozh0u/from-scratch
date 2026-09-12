# Walkthrough — every combination in the game

**Generated from `src/data/gameData.ts` by `npm run walkthrough`. Do not edit by hand.**

43 elements, 26 recipes. Steps are in an order you can actually follow: a combination only appears once you already hold both of its inputs.

## Survival

Teaches the verb — how making anything works at all. Every recipe here costs nothing: water and CO₂ are Everyday’s lesson, and inventing effort figures would be worse than zero.

**Targets:** Fire, Candle, Lighter

**You start with 8:** Tinder, Kindling, Flint, High-Carbon Steel, Cotton Fiber, Beeswax, Crude Oil, Natural Gas

| # | Combine | | Gives | How | Cost |
| --- | --- | --- | --- | --- | --- |
| 1 | Flint | + High-Carbon Steel | Spark | striking | — |
| 2 | Spark | + Tinder | Glowing Tinder | catching | — |
| 3 | Glowing Tinder | + Kindling | **Fire** | igniting | — |
| 4 | Cotton Fiber | + Cotton Fiber | Wick | braiding | — |
| 5 | Beeswax | + Wick | **Candle** _(beeswax)_ | dipping | — |
| 6 | Crude Oil | + Crude Oil | Paraffin Wax | refining | — |
| 7 | Natural Gas | + Crude Oil | Butane | refining | — |
| 8 | Spark | + Butane | **Lighter** | igniting | — |
| 9 | Paraffin Wax | + Wick | **Candle** _(paraffin)_ | dipping | — |

All 3 targets reachable. ✅

## Everyday Objects

Teaches what ordinary manufactured things actually cost. Carries the real footprint numbers.

**Targets:** Cotton T-Shirt, Aluminum Can, Glass Bottle

**You start with 11:** Farmland, Water, Cotton Gin, Dye, Salt, Bauxite, Manganese, Silica Sand, Soda Ash, Limestone, Textile Waste

**Carried over from Survival:** High-Carbon Steel, Crude Oil, Fire, Paraffin Wax — these are real dependencies, which is why Survival comes first.

| # | Combine | | Gives | How | Cost |
| --- | --- | --- | --- | --- | --- |
| 1 | Farmland | + Water | Raw Cotton | cultivating | 2340 L water |
| 2 | Raw Cotton | + Cotton Gin | Ginned Cotton _(virgin)_ | ginning | — |
| 3 | Textile Waste | + Textile Waste | Ginned Cotton _(recycled)_ | shredding | — |
| 4 | Ginned Cotton | + Ginned Cotton | Cotton Yarn | spinning | — |
| 5 | Cotton Yarn | + Cotton Yarn | Cotton Jersey | knitting | — |
| 6 | Cotton Jersey | + Dye | Dyed Cotton Fabric | dyeing | 380 L water |
| 7 | Cotton Yarn | + Paraffin Wax | Sewing Thread | waxing | — |
| 8 | Dyed Cotton Fabric | + Sewing Thread | **Cotton T-Shirt** | sewing | — |
| 9 | Salt | + Water | Sodium Hydroxide | electrolyzing | — |
| 10 | Bauxite | + Sodium Hydroxide | Alumina | digesting | — |
| 11 | Crude Oil | + Fire | Petroleum Coke | coking | — |
| 12 | Alumina | + Petroleum Coke | Molten Aluminum | smelting | 0.178 kg CO₂ |
| 13 | Molten Aluminum | + Manganese | Aluminum Sheet | alloying | — |
| 14 | Aluminum Sheet | + High-Carbon Steel | **Aluminum Can** | drawing | — |
| 15 | Silica Sand | + Soda Ash | Sodium Silicate | fusing | — |
| 16 | Sodium Silicate | + Limestone | Molten Glass | melting | 0.27 kg CO₂ |
| 17 | Molten Glass | + High-Carbon Steel | **Glass Bottle** | blowing | — |

All 3 targets reachable. ✅

## Alternate routes

Elements with more than one real way to make them. The receipt tells you which road you took.

- **Candle** — Beeswax + Wick (beeswax); or Paraffin Wax + Wick (paraffin)
- **Ginned Cotton** — Raw Cotton + Cotton Gin (virgin); or Textile Waste + Textile Waste (recycled)

## How much of the board is a dead end

43 elements make 903 possible pairs, and 26 of them are recipes. **97.1% of everything you can try does nothing** — which is why explaining failure is where the teaching has to happen.
