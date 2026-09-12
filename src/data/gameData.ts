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
 * Everyday (step 15, in progress): starting with the cotton t-shirt spine.
 * The headline number — water used to grow and dye the cotton in one
 * t-shirt — comes from a real primary source: Chapagain, Hoekstra et al.
 * 2006, "The Water Footprint of Cotton Consumption" (Water Footprint
 * Network), Table 9. For a standard 250g t-shirt it gives blue water
 * (irrigation) 1,230L + green water (rainfall) 1,110L + dilution water
 * (diluting dyeing effluent) 380L = 2,720L total — which is where the
 * commonly-quoted "~2,700 liters" figure actually comes from.
 *
 * The two Everyday recipes below that carry real cost split that total
 * exactly the way the source does: 2,340L (irrigation+rainfall) at growing,
 * 380L (dilution) at dyeing. Every other step is mechanically real but water-
 * light, so it stays at zero rather than getting an invented number.
 *
 * `sewing_thread` deliberately reuses `paraffin` from Survival — thread is
 * waxed before sewing, and it's a real example of "one graph, many windows."
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

    // Everyday — starters
    { id: 'farmland', name: 'Farmland', icon: 'farmland', realm: 'everyday', blurb: 'Land given over to a crop — for cotton, that mostly means land committed to irrigation.', sources: [] },
    { id: 'water', name: 'Water', icon: 'water', realm: 'everyday', blurb: 'Cotton is one of the thirstiest crops grown at scale — about 8,000–10,000 liters per kilogram of fiber, globally averaged.', sources: [{ label: 'Cotton — Wikipedia', url: 'https://en.wikipedia.org/wiki/Cotton' }] },
    { id: 'cotton_gin', name: 'Cotton Gin', icon: 'cotton_gin', realm: 'everyday', blurb: 'A machine that separates cotton fiber from its seeds — its invention in 1793 multiplied how fast raw cotton could be processed.', sources: [{ label: 'Cotton gin — Wikipedia', url: 'https://en.wikipedia.org/wiki/Cotton_gin' }] },
    { id: 'dye', name: 'Dye', icon: 'dye', realm: 'everyday', blurb: 'Colorant applied to fabric — one of the most water-intensive steps between raw fiber and a finished garment.', sources: [{ label: 'Dyeing — Wikipedia', url: 'https://en.wikipedia.org/wiki/Dyeing' }] },

    // Everyday — crafted
    {
      id: 'raw_cotton',
      name: 'Raw Cotton',
      icon: 'raw_cotton',
      realm: 'everyday',
      blurb: 'Growing enough cotton for one t-shirt takes about 2,340 liters of water — irrigation and rainfall combined — before a single thread is spun.',
      sources: [
        { label: 'The Water Footprint of Cotton Consumption (Chapagain et al., 2006) — Water Footprint Network', url: 'https://www.waterfootprint.org/resources/multimediahub/Chapagain_et_al_2006_cotton_2.pdf' },
        { label: 'Cotton — Wikipedia', url: 'https://en.wikipedia.org/wiki/Cotton' },
      ],
    },
    {
      id: 'ginned_cotton',
      name: 'Ginned Cotton',
      icon: 'ginned_cotton',
      realm: 'everyday',
      blurb: 'Ginning pulls the seeds out, leaving pure cotton fiber ready to spin.',
      sources: [{ label: 'Cotton gin — Wikipedia', url: 'https://en.wikipedia.org/wiki/Cotton_gin' }],
    },
    {
      id: 'cotton_yarn',
      name: 'Cotton Yarn',
      icon: 'cotton_yarn',
      realm: 'everyday',
      blurb: 'Raw fiber is drawn out and twisted together — spinning is what turns a puff of cotton into a continuous, usable thread.',
      sources: [{ label: 'Spinning (textiles) — Wikipedia', url: 'https://en.wikipedia.org/wiki/Spinning_(textiles)' }],
    },
    {
      id: 'cotton_jersey',
      name: 'Cotton Jersey',
      icon: 'cotton_jersey',
      realm: 'everyday',
      blurb: 'Interlooped on a circular knitting machine, cotton yarn becomes jersey — the standard knit fabric almost every t-shirt is cut from.',
      sources: [
        { label: 'Jersey (fabric) — Wikipedia', url: 'https://en.wikipedia.org/wiki/Jersey_(fabric)' },
        { label: 'Circular knitting — Wikipedia', url: 'https://en.wikipedia.org/wiki/Circular_knitting' },
      ],
    },
    {
      id: 'dyed_cotton_fabric',
      name: 'Dyed Cotton Fabric',
      icon: 'dyed_cotton_fabric',
      realm: 'everyday',
      blurb: "Turning plain fabric into something you'd actually wear costs another 380 liters of water — most of it used to dilute and treat the leftover dye.",
      sources: [
        { label: 'The Water Footprint of Cotton Consumption (Chapagain et al., 2006) — Water Footprint Network', url: 'https://www.waterfootprint.org/resources/multimediahub/Chapagain_et_al_2006_cotton_2.pdf' },
        { label: 'Dyeing — Wikipedia', url: 'https://en.wikipedia.org/wiki/Dyeing' },
      ],
    },
    {
      id: 'sewing_thread',
      name: 'Sewing Thread',
      icon: 'sewing_thread',
      realm: 'everyday',
      blurb: "Cotton yarn gets a coat of paraffin wax before it's wound onto a spool — the wax keeps it from fraying or snapping under a sewing machine's tension.",
      sources: [
        { label: 'Thread (yarn) — Wikipedia', url: 'https://en.wikipedia.org/wiki/Thread_(yarn)' },
        { label: 'Paraffin wax — Wikipedia', url: 'https://en.wikipedia.org/wiki/Paraffin_wax' },
      ],
    },
    {
      id: 'cotton_t_shirt',
      name: 'Cotton T-Shirt',
      icon: 'cotton_t_shirt',
      realm: 'everyday',
      blurb: 'Fabric is cut using a pattern and stitched together — by the time a plain cotton t-shirt is finished, growing and dyeing its cotton alone used about 2,700 liters of water.',
      sources: [
        { label: 'Pattern (sewing) — Wikipedia', url: 'https://en.wikipedia.org/wiki/Pattern_(sewing)' },
        { label: 'The Water Footprint of Cotton Consumption (Chapagain et al., 2006) — Water Footprint Network', url: 'https://www.waterfootprint.org/resources/multimediahub/Chapagain_et_al_2006_cotton_2.pdf' },
      ],
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

    // Everyday
    {
      inputs: ['farmland', 'water'],
      output: 'raw_cotton',
      process: 'cultivating',
      // The two real numbers in this chain: irrigation (blue) + rainfall
      // (green) water, per Chapagain et al. 2006 Table 9 (250g t-shirt).
      cost: { waterL: 1230 + 1110, co2kg: 0 },
      sources: [
        { label: 'The Water Footprint of Cotton Consumption (Chapagain et al., 2006) — Water Footprint Network', url: 'https://www.waterfootprint.org/resources/multimediahub/Chapagain_et_al_2006_cotton_2.pdf' },
        { label: 'Cotton — Wikipedia', url: 'https://en.wikipedia.org/wiki/Cotton' },
      ],
    },
    {
      inputs: ['raw_cotton', 'cotton_gin'],
      output: 'ginned_cotton',
      process: 'ginning',
      cost: ZERO_COST,
      sources: [{ label: 'Cotton gin — Wikipedia', url: 'https://en.wikipedia.org/wiki/Cotton_gin' }],
    },
    {
      inputs: ['ginned_cotton', 'ginned_cotton'],
      output: 'cotton_yarn',
      process: 'spinning',
      cost: ZERO_COST,
      sources: [{ label: 'Spinning (textiles) — Wikipedia', url: 'https://en.wikipedia.org/wiki/Spinning_(textiles)' }],
    },
    {
      inputs: ['cotton_yarn', 'cotton_yarn'],
      output: 'cotton_jersey',
      process: 'knitting',
      cost: ZERO_COST,
      sources: [
        { label: 'Jersey (fabric) — Wikipedia', url: 'https://en.wikipedia.org/wiki/Jersey_(fabric)' },
        { label: 'Circular knitting — Wikipedia', url: 'https://en.wikipedia.org/wiki/Circular_knitting' },
      ],
    },
    {
      inputs: ['cotton_jersey', 'dye'],
      output: 'dyed_cotton_fabric',
      process: 'dyeing',
      // The second real number: dilution water for treating dye effluent,
      // same source, same table.
      cost: { waterL: 380, co2kg: 0 },
      sources: [
        { label: 'The Water Footprint of Cotton Consumption (Chapagain et al., 2006) — Water Footprint Network', url: 'https://www.waterfootprint.org/resources/multimediahub/Chapagain_et_al_2006_cotton_2.pdf' },
        { label: 'Dyeing — Wikipedia', url: 'https://en.wikipedia.org/wiki/Dyeing' },
      ],
    },
    {
      // Reuses Survival's paraffin — a real cross-realm dependency, not a
      // coincidence: thread genuinely is waxed with paraffin before sewing.
      inputs: ['cotton_yarn', 'paraffin'],
      output: 'sewing_thread',
      process: 'waxing',
      cost: ZERO_COST,
      sources: [
        { label: 'Thread (yarn) — Wikipedia', url: 'https://en.wikipedia.org/wiki/Thread_(yarn)' },
        { label: 'Paraffin wax — Wikipedia', url: 'https://en.wikipedia.org/wiki/Paraffin_wax' },
      ],
    },
    {
      inputs: ['dyed_cotton_fabric', 'sewing_thread'],
      output: 'cotton_t_shirt',
      process: 'sewing',
      cost: ZERO_COST,
      sources: [
        { label: 'Pattern (sewing) — Wikipedia', url: 'https://en.wikipedia.org/wiki/Pattern_(sewing)' },
        { label: 'The Water Footprint of Cotton Consumption (Chapagain et al., 2006) — Water Footprint Network', url: 'https://www.waterfootprint.org/resources/multimediahub/Chapagain_et_al_2006_cotton_2.pdf' },
      ],
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
    everyday: ['farmland', 'water', 'cotton_gin', 'dye'],
  },
  targets: {
    survival: ['fire', 'candle', 'lighter'],
    everyday: ['cotton_t_shirt'],
  },
}
