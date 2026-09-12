import type { RecipeData } from './types'

/*
 * Real, source-pinned game data — this is what actually ships, as opposed to
 * `seed.ts`, which stays a small hand-computable fixture used only to test
 * the solver's own arithmetic.
 *
 * Survival (step 11): the fire / candle / lighter spine from the original
 * concept doc, corrected against what the sources actually say rather than
 * what seemed intuitive. Two corrections worth recording:
 *
 *   - The concept doc's "tinder bundle, then ignite" was an invented shape.
 *     The Tinder article's real causal chain is spark -> tinder catches ->
 *     flaming tinder ignites kindling -> fire. The graph follows that order.
 *   - "Twisted cotton fiber" for a wick was also assumed, not sourced —
 *     Candle Wick says wicks are braided, so the process here is "braiding."
 *
 * Every Survival recipe carries a zero footprint. That's deliberate, not a
 * placeholder: the water/CO2 meter is Everyday's lesson (the t-shirt's
 * embodied cost), not Survival's. Survival teaches the verb; inventing fake
 * "time and effort" numbers dressed up in water/CO2 fields would be worse
 * than leaving them at zero.
 *
 * Everyday is empty until step 15.
 */

const ZERO_COST = { waterL: 0, co2kg: 0 }

export const GAME_DATA: RecipeData = {
  elements: [
    // Starters
    { id: 'tinder', name: 'Tinder', icon: 'tinder', realm: 'survival', blurb: 'Finely divided, loosely structured material — dry grass, bark fibre, char cloth — with enough surface area to catch from a single spark.', sources: [{ label: 'Tinder — Wikipedia', url: 'https://en.wikipedia.org/wiki/Tinder' }] },
    { id: 'kindling', name: 'Kindling', icon: 'kindling', realm: 'survival', blurb: 'Small, dry sticks — the step between a fistful of burning tinder and a fire that can sustain itself.', sources: [{ label: 'Tinder — Wikipedia', url: 'https://en.wikipedia.org/wiki/Tinder' }] },
    { id: 'flint', name: 'Flint', icon: 'flint', realm: 'survival', blurb: 'A hard, brittle rock that shears cleanly — struck against the right steel, the impact shears off fragments hot enough to ignite.', sources: [{ label: 'Fire striker — Wikipedia', url: 'https://en.wikipedia.org/wiki/Fire_striker' }] },
    { id: 'high_carbon_steel', name: 'High-Carbon Steel', icon: 'high_carbon_steel', realm: 'survival', blurb: "Not just any steel — fire strikers specifically need high-carbon steel. Softer alloys like stainless barely spark at all.", sources: [{ label: 'Fire striker — Wikipedia', url: 'https://en.wikipedia.org/wiki/Fire_striker' }] },
    { id: 'cotton_fiber', name: 'Cotton Fiber', icon: 'cotton_fiber', realm: 'survival', blurb: 'Raw plant fibre, before it becomes thread, fabric, or a candle wick.', sources: [] },
    { id: 'beeswax', name: 'Beeswax', icon: 'beeswax', realm: 'survival', blurb: 'Secreted by honeybees to build their comb — for most of history, the good candle wax, and expensive because of it.', sources: [{ label: 'Candle — Wikipedia', url: 'https://en.wikipedia.org/wiki/Candle' }] },
    { id: 'crude_oil', name: 'Crude Oil', icon: 'crude_oil', realm: 'survival', blurb: "Unrefined petroleum — distilling it apart yields everything from gasoline to the wax in a candle.", sources: [] },
    { id: 'natural_gas', name: 'Natural Gas', icon: 'natural_gas', realm: 'survival', blurb: 'Extracted alongside crude oil and refined further to separate out heavier components like butane.', sources: [{ label: 'Butane — Wikipedia', url: 'https://en.wikipedia.org/wiki/Butane' }] },

    // Crafted
    {
      id: 'spark',
      name: 'Spark',
      icon: 'spark',
      realm: 'survival',
      blurb: 'Striking hardened steel against flint shears off tiny fragments hot enough to ignite in air — a technique that predates matches by thousands of years.',
      sources: [{ label: 'Fire striker — Wikipedia', url: 'https://en.wikipedia.org/wiki/Fire_striker' }],
    },
    {
      id: 'glowing_tinder',
      name: 'Glowing Tinder',
      icon: 'glowing_tinder',
      realm: 'survival',
      blurb: "A caught spark doesn't burst into flame right away — it smoulders in the tinder as a glowing coal until air (or breath) coaxes it alight.",
      sources: [{ label: 'Tinder — Wikipedia', url: 'https://en.wikipedia.org/wiki/Tinder' }],
    },
    {
      id: 'fire',
      name: 'Fire',
      icon: 'fire',
      realm: 'survival',
      blurb: 'Flaming tinder carries just enough heat to set kindling alight — and kindling, not the tinder itself, is what actually grows into a fire that lasts.',
      sources: [{ label: 'Tinder — Wikipedia', url: 'https://en.wikipedia.org/wiki/Tinder' }],
    },
    {
      id: 'wick',
      name: 'Wick',
      icon: 'wick',
      realm: 'survival',
      blurb: 'Candle wicks are braided cotton, not just twisted strands — the braid is what makes the wick curl back into its own flame as it burns down.',
      sources: [{ label: 'Candle wick — Wikipedia', url: 'https://en.wikipedia.org/wiki/Candle_wick' }],
    },
    {
      id: 'candle',
      name: 'Candle',
      icon: 'candle',
      realm: 'survival',
      blurb: 'A wick embedded in wax — dipped in layers or poured into a mould. The wax itself has changed eras more than once: beeswax, then paraffin.',
      sources: [{ label: 'Candle — Wikipedia', url: 'https://en.wikipedia.org/wiki/Candle' }],
    },
    {
      id: 'paraffin',
      name: 'Paraffin Wax',
      icon: 'paraffin',
      realm: 'survival',
      blurb: "Paraffin wax isn't a plant or animal product — it's distilled straight out of crude oil, the same barrel that becomes gasoline.",
      sources: [{ label: 'Paraffin wax — Wikipedia', url: 'https://en.wikipedia.org/wiki/Paraffin_wax' }],
    },
    {
      id: 'butane',
      name: 'Butane',
      icon: 'butane',
      realm: 'survival',
      blurb: 'Bottled fossil fuel — butane is pulled out of natural gas and petroleum refining, then compressed into a liquid for storage.',
      sources: [{ label: 'Butane — Wikipedia', url: 'https://en.wikipedia.org/wiki/Butane' }],
    },
    {
      id: 'lighter',
      name: 'Lighter',
      icon: 'lighter',
      realm: 'survival',
      blurb: "A classic flint-wheel lighter is the fire striker's trick, miniaturized: spinning the wheel throws a spark straight into a jet of butane.",
      sources: [{ label: 'Lighter — Wikipedia', url: 'https://en.wikipedia.org/wiki/Lighter' }],
    },
  ],
  recipes: [
    {
      inputs: ['flint', 'high_carbon_steel'],
      output: 'spark',
      process: 'striking',
      cost: ZERO_COST,
      sources: [{ label: 'Fire striker — Wikipedia', url: 'https://en.wikipedia.org/wiki/Fire_striker' }],
    },
    {
      inputs: ['spark', 'tinder'],
      output: 'glowing_tinder',
      process: 'catching',
      cost: ZERO_COST,
      sources: [{ label: 'Tinder — Wikipedia', url: 'https://en.wikipedia.org/wiki/Tinder' }],
    },
    {
      inputs: ['glowing_tinder', 'kindling'],
      output: 'fire',
      process: 'igniting',
      cost: ZERO_COST,
      sources: [{ label: 'Tinder — Wikipedia', url: 'https://en.wikipedia.org/wiki/Tinder' }],
    },
    {
      inputs: ['cotton_fiber', 'cotton_fiber'],
      output: 'wick',
      process: 'braiding',
      cost: ZERO_COST,
      sources: [{ label: 'Candle wick — Wikipedia', url: 'https://en.wikipedia.org/wiki/Candle_wick' }],
    },
    {
      inputs: ['beeswax', 'wick'],
      output: 'candle',
      process: 'dipping',
      route: 'beeswax',
      cost: ZERO_COST,
      sources: [{ label: 'Candle — Wikipedia', url: 'https://en.wikipedia.org/wiki/Candle' }],
    },
    {
      inputs: ['paraffin', 'wick'],
      output: 'candle',
      process: 'dipping',
      route: 'paraffin',
      cost: ZERO_COST,
      sources: [
        { label: 'Candle — Wikipedia', url: 'https://en.wikipedia.org/wiki/Candle' },
        { label: 'Paraffin wax — Wikipedia', url: 'https://en.wikipedia.org/wiki/Paraffin_wax' },
      ],
    },
    {
      inputs: ['crude_oil', 'crude_oil'],
      output: 'paraffin',
      process: 'refining',
      cost: ZERO_COST,
      sources: [{ label: 'Paraffin wax — Wikipedia', url: 'https://en.wikipedia.org/wiki/Paraffin_wax' }],
    },
    {
      inputs: ['natural_gas', 'crude_oil'],
      output: 'butane',
      process: 'refining',
      cost: ZERO_COST,
      sources: [{ label: 'Butane — Wikipedia', url: 'https://en.wikipedia.org/wiki/Butane' }],
    },
    {
      inputs: ['spark', 'butane'],
      output: 'lighter',
      process: 'igniting',
      cost: ZERO_COST,
      sources: [{ label: 'Lighter — Wikipedia', url: 'https://en.wikipedia.org/wiki/Lighter' }],
    },
  ],
  starters: {
    survival: [
      'tinder',
      'kindling',
      'flint',
      'high_carbon_steel',
      'cotton_fiber',
      'beeswax',
      'crude_oil',
      'natural_gas',
    ],
    everyday: [],
  },
  targets: {
    survival: ['fire', 'candle', 'lighter'],
    everyday: [],
  },
}
