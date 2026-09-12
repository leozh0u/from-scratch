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
    { id: 'textile_waste', name: 'Textile Waste', icon: 'textile_waste', realm: 'everyday', blurb: "Cotton reclaimed from old garments and factory scraps — recycling it back into fiber means never planting a new crop for it.", sources: [{ label: 'Recycling — Wikipedia', url: 'https://en.wikipedia.org/wiki/Recycling' }] },

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
      blurb: 'Two real routes lead here: gin it fresh from a harvested crop, or shred it out of textile waste that already exists — same fiber, very different water bill.',
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

    // Everyday — aluminum can starters
    { id: 'salt', name: 'Salt', icon: 'salt', realm: 'everyday', blurb: 'Sodium chloride — dissolved in water and run through an electric current, it splits into chlorine, hydrogen, and the caustic soda used all over industry.', sources: [{ label: 'Chloralkali process — Wikipedia', url: 'https://en.wikipedia.org/wiki/Chloralkali_process' }] },
    { id: 'bauxite', name: 'Bauxite', icon: 'bauxite', realm: 'everyday', blurb: 'The ore aluminum actually comes from — a rusty-looking rock that has to be dissolved out of, not melted down, to get at the aluminum inside.', sources: [{ label: 'Bayer process — Wikipedia', url: 'https://en.wikipedia.org/wiki/Bayer_process' }] },
    { id: 'manganese', name: 'Manganese', icon: 'manganese', realm: 'everyday', blurb: 'The alloying element that turns plain aluminum into can stock — it makes the metal strong enough to hold pressure without getting brittle.', sources: [{ label: 'Aluminium alloy — Wikipedia', url: 'https://en.wikipedia.org/wiki/Aluminium_alloy' }] },

    // Everyday — aluminum can, crafted
    {
      id: 'sodium_hydroxide',
      name: 'Sodium Hydroxide',
      icon: 'sodium_hydroxide',
      realm: 'everyday',
      blurb: "Made today by running electric current through salt water, not the older lime-and-soda-ash reaction it replaced — that method was fully phased out.",
      sources: [{ label: 'Chloralkali process — Wikipedia', url: 'https://en.wikipedia.org/wiki/Chloralkali_process' }],
    },
    {
      id: 'alumina',
      name: 'Alumina',
      icon: 'alumina',
      realm: 'everyday',
      blurb: 'Bauxite ore is dissolved in hot caustic soda under pressure — what comes out, once separated back out, is pure aluminum oxide.',
      sources: [{ label: 'Bayer process — Wikipedia', url: 'https://en.wikipedia.org/wiki/Bayer_process' }],
    },
    {
      id: 'petroleum_coke',
      name: 'Petroleum Coke',
      icon: 'petroleum_coke',
      realm: 'everyday',
      blurb: 'A carbon-rich leftover from cracking heavy crude oil — refineries turn it into the anodes that aluminum smelters consume by the ton.',
      sources: [{ label: 'Petroleum coke — Wikipedia', url: 'https://en.wikipedia.org/wiki/Petroleum_coke' }],
    },
    {
      id: 'molten_aluminum',
      name: 'Molten Aluminum',
      icon: 'molten_aluminum',
      realm: 'everyday',
      blurb: "Smelting alumina into aluminum is one of the most electricity-hungry things a factory can do — about 12.7 kg of CO2 per kg of aluminum, worldwide average.",
      sources: [{ label: 'Hall–Héroult process — Wikipedia', url: 'https://en.wikipedia.org/wiki/Hall%E2%80%93H%C3%A9roult_process' }],
    },
    {
      id: 'aluminum_sheet',
      name: 'Aluminum Sheet',
      icon: 'aluminum_sheet',
      realm: 'everyday',
      blurb: 'Alloying molten aluminum with manganese before rolling it flat is what actually makes "aluminum" cans — pure aluminum alone is too soft to hold pressure.',
      sources: [{ label: 'Aluminium alloy — Wikipedia', url: 'https://en.wikipedia.org/wiki/Aluminium_alloy' }],
    },
    {
      id: 'aluminum_can',
      name: 'Aluminum Can',
      icon: 'aluminum_can',
      realm: 'everyday',
      blurb: 'A flat disc of aluminum sheet is drawn into a cup, then ironed thinner against steel tooling — the whole seamless body comes from one piece of metal, no welds.',
      sources: [
        { label: 'Beverage can — Wikipedia', url: 'https://en.wikipedia.org/wiki/Beverage_can' },
        { label: 'Deep drawing — Wikipedia', url: 'https://en.wikipedia.org/wiki/Deep_drawing' },
      ],
    },

    // Everyday — glass bottle starters
    { id: 'silica_sand', name: 'Silica Sand', icon: 'silica_sand', realm: 'everyday', blurb: 'Fine sand rich in silicon dioxide — melt it hot enough and it becomes glass, though pure silica alone melts at an impractical 1,713°C.', sources: [{ label: 'Sodium silicate — Wikipedia', url: 'https://en.wikipedia.org/wiki/Sodium_silicate' }] },
    { id: 'soda_ash', name: 'Soda Ash', icon: 'soda_ash', realm: 'everyday', blurb: "Sodium carbonate — added to silica sand as a flux, it drops the melting point hundreds of degrees so glass can actually be made at industrial scale.", sources: [{ label: 'Sodium silicate — Wikipedia', url: 'https://en.wikipedia.org/wiki/Sodium_silicate' }] },
    { id: 'limestone', name: 'Limestone', icon: 'limestone', realm: 'everyday', blurb: "The calcium source in most real glass batches — added as raw limestone, not pre-processed lime, since the furnace's own heat breaks it down.", sources: [{ label: 'Soda–lime glass — Wikipedia', url: 'https://en.wikipedia.org/wiki/Soda%E2%80%93lime_glass' }] },

    // Everyday — glass bottle, crafted
    {
      id: 'sodium_silicate',
      name: 'Sodium Silicate',
      icon: 'sodium_silicate',
      realm: 'everyday',
      blurb: "Soda ash acts as a flux on silica sand, letting the two fuse into glass at a temperature furnaces can actually reach.",
      sources: [{ label: 'Sodium silicate — Wikipedia', url: 'https://en.wikipedia.org/wiki/Sodium_silicate' }],
    },
    {
      id: 'molten_glass',
      name: 'Molten Glass',
      icon: 'molten_glass',
      realm: 'everyday',
      blurb: "Soda alone makes glass that dissolves in water — adding lime is what makes it durable enough to actually hold a drink.",
      sources: [{ label: 'Soda–lime glass — Wikipedia', url: 'https://en.wikipedia.org/wiki/Soda%E2%80%93lime_glass' }],
    },
    {
      id: 'glass_bottle',
      name: 'Glass Bottle',
      icon: 'glass_bottle',
      realm: 'everyday',
      blurb: 'A measured gob of molten glass drops into a steel mold and gets blown hollow with compressed air — the same idea as glassblowing, just automated.',
      sources: [{ label: 'Container glass — Wikipedia', url: 'https://en.wikipedia.org/wiki/Container_glass' }],
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
      route: 'virgin',
      cost: ZERO_COST,
      sources: [{ label: 'Cotton gin — Wikipedia', url: 'https://en.wikipedia.org/wiki/Cotton_gin' }],
    },
    {
      // The replay mechanic: this bypasses `raw_cotton` (and its 2,340L
      // cultivation cost) entirely rather than just charging a lower number
      // for the same step — recycling doesn't grow a new crop, so there's no
      // cultivation stage to have a cost at all.
      inputs: ['textile_waste', 'textile_waste'],
      output: 'ginned_cotton',
      process: 'shredding',
      route: 'recycled',
      cost: ZERO_COST,
      sources: [{ label: 'Recycling — Wikipedia', url: 'https://en.wikipedia.org/wiki/Recycling' }],
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

    // Everyday — aluminum can. Reuses Survival's `fire` and `crude_oil` for
    // coking — a real cross-realm dependency, same pattern as sewing_thread.
    {
      inputs: ['salt', 'water'],
      output: 'sodium_hydroxide',
      process: 'electrolyzing',
      cost: ZERO_COST,
      sources: [{ label: 'Chloralkali process — Wikipedia', url: 'https://en.wikipedia.org/wiki/Chloralkali_process' }],
    },
    {
      inputs: ['bauxite', 'sodium_hydroxide'],
      output: 'alumina',
      process: 'digesting',
      cost: ZERO_COST,
      sources: [{ label: 'Bayer process — Wikipedia', url: 'https://en.wikipedia.org/wiki/Bayer_process' }],
    },
    {
      inputs: ['crude_oil', 'fire'],
      output: 'petroleum_coke',
      process: 'coking',
      cost: ZERO_COST,
      sources: [{ label: 'Petroleum coke — Wikipedia', url: 'https://en.wikipedia.org/wiki/Petroleum_coke' }],
    },
    {
      inputs: ['alumina', 'petroleum_coke'],
      output: 'molten_aluminum',
      process: 'smelting',
      // 12.7 kg CO2 per kg of aluminum (Hall–Héroult, 2012 global estimate)
      // times ~14g of aluminum in a standard can (Beverage can, 2011 figure).
      cost: { waterL: 0, co2kg: 0.178 },
      sources: [{ label: 'Hall–Héroult process — Wikipedia', url: 'https://en.wikipedia.org/wiki/Hall%E2%80%93H%C3%A9roult_process' }],
    },
    {
      inputs: ['molten_aluminum', 'manganese'],
      output: 'aluminum_sheet',
      process: 'alloying',
      cost: ZERO_COST,
      sources: [{ label: 'Aluminium alloy — Wikipedia', url: 'https://en.wikipedia.org/wiki/Aluminium_alloy' }],
    },
    {
      inputs: ['aluminum_sheet', 'high_carbon_steel'],
      output: 'aluminum_can',
      process: 'drawing',
      cost: ZERO_COST,
      sources: [
        { label: 'Beverage can — Wikipedia', url: 'https://en.wikipedia.org/wiki/Beverage_can' },
        { label: 'Deep drawing — Wikipedia', url: 'https://en.wikipedia.org/wiki/Deep_drawing' },
      ],
    },

    // Everyday — glass bottle
    {
      inputs: ['silica_sand', 'soda_ash'],
      output: 'sodium_silicate',
      process: 'fusing',
      cost: ZERO_COST,
      sources: [{ label: 'Sodium silicate — Wikipedia', url: 'https://en.wikipedia.org/wiki/Sodium_silicate' }],
    },
    {
      inputs: ['sodium_silicate', 'limestone'],
      output: 'molten_glass',
      process: 'melting',
      cost: ZERO_COST,
      sources: [{ label: 'Soda–lime glass — Wikipedia', url: 'https://en.wikipedia.org/wiki/Soda%E2%80%93lime_glass' }],
    },
    {
      inputs: ['molten_glass', 'high_carbon_steel'],
      output: 'glass_bottle',
      process: 'blowing',
      cost: ZERO_COST,
      sources: [{ label: 'Container glass — Wikipedia', url: 'https://en.wikipedia.org/wiki/Container_glass' }],
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
    everyday: [
      'farmland',
      'water',
      'cotton_gin',
      'dye',
      'salt',
      'bauxite',
      'manganese',
      'silica_sand',
      'soda_ash',
      'limestone',
      'textile_waste',
    ],
  },
  targets: {
    survival: ['fire', 'candle', 'lighter'],
    everyday: ['cotton_t_shirt', 'aluminum_can', 'glass_bottle'],
  },
}
