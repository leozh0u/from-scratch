import type { RecipeData } from './types'

/*
 * The real, source-pinned game data. This is what ships; `seed.ts` stays a
 * small hand-computable fixture used only to test the solver's arithmetic.
 *
 * REBUILT FROM THREE STARTERS
 *
 * The version this replaces began with nineteen starting elements, fourteen of
 * which were used in exactly one recipe. That is not an ingredient, it is a
 * single-use part handed over with its recipe already attached, and it is why
 * the game felt thin next to Little Alchemy, whose four starters turn up in
 * hundreds of combinations.
 *
 * Worse, the starters were not primitive. A cotton gin is a machine, more
 * complex than most of what you built with it. High-carbon steel is a
 * manufactured alloy given out like a rock. Crude oil and natural gas were
 * *survival* starters, in the realm where a person has their hands and a
 * forest.
 *
 * And a real contradiction hid inside that: you struck flint on high-carbon
 * steel to make the spark that made fire, but steel cannot be smelted without
 * fire. The game handed you a thing that required the goal in order to reach
 * the goal.
 *
 * So Survival now starts with Stone, Wood and Plant Fibre, and nothing else.
 * Every pair of those three does something, which means a new player's first
 * guess works. Fire is not given; it is the first thing you make, by spinning
 * wood against wood, and steel arrives afterwards in the other realm, which is
 * the only order it can arrive in.
 *
 * The whole graph is planned and checked in `plan/graph.txt`, which
 * `npm test` asserts for reachability, pair collisions and starter reuse.
 *
 * TWO WAYS TO MAKE AN EMBER, ON PURPOSE
 *
 * The hand drill is three steps from the start and it is how it was first
 * done. The bow drill is six steps and it works every time. Both are real, the
 * receipt records which one you took, and the difference between them is the
 * argument for building a tool before you need it.
 *
 * FOOTPRINTS
 *
 * Every Survival recipe carries zero. That is deliberate rather than a
 * placeholder: the water and CO2 meter is the other realm's lesson, and
 * inventing "time and effort" figures dressed up in those fields would be
 * worse than a clean zero.
 *
 * The cotton numbers come from Chapagain, Hoekstra et al. 2006, "The Water
 * Footprint of Cotton Consumption", Table 9, and are split across the steps
 * exactly as that source splits them: 2,340 L at the field, 380 L at dyeing,
 * 2,720 L in total for a 250 g shirt. Glass and aluminium carry the one figure
 * each that can be defended; the electricity side of smelting varies by grid
 * by more than a factor of ten and so is not claimed at all.
 */

const ZERO_COST = { waterL: 0, co2kg: 0 }

export const GAME_DATA: RecipeData = {
  elements: [
    { id: 'stone', name: 'Stone', icon: 'stone', realm: 'survival', blurb: "A rock off the ground. You get three things to start with and this is the one that does the cutting.", sources: [{ label: 'Rock (geology)', url: 'https://en.wikipedia.org/wiki/Rock_(geology)' }] },
    { id: 'wood', name: 'Wood', icon: 'wood', realm: 'survival', blurb: "A branch. It turns into a tool, a drill, a handle, a fire, and finally charcoal, which is nine of the seventeen recipes in this realm.", sources: [{ label: 'Wood', url: 'https://en.wikipedia.org/wiki/Wood' }] },
    { id: 'plant_fibre', name: 'Plant Fibre', icon: 'plant_fibre', realm: 'survival', blurb: "Stringy inner bark, nettle, dry grass. Twist it and you get rope. Shred it and it catches a spark.", sources: [{ label: 'Bast fibre', url: 'https://en.wikipedia.org/wiki/Bast_fibre' }] },
    { id: 'sharp_stone', name: 'Sharp Stone', icon: 'sharp_stone', realm: 'survival', blurb: "Hit stone at the right angle and it breaks in a smooth curved shell, leaving an edge a few atoms across. Sharper than a scalpel, and surgeons have used it.", sources: [{ label: 'Knapping', url: 'https://en.wikipedia.org/wiki/Knapping' }, { label: 'Conchoidal fracture', url: 'https://en.wikipedia.org/wiki/Conchoidal_fracture' }] },
    { id: 'cordage', name: 'Cordage', icon: 'cordage', realm: 'survival', blurb: "Two bundles of fibre twisted one way, then wrapped around each other the other way, so each one fights the other's unwinding. That argument between them is the whole reason rope holds.", sources: [{ label: 'Rope', url: 'https://en.wikipedia.org/wiki/Rope' }] },
    { id: 'hand_drill', name: 'Hand Drill', icon: 'hand_drill', realm: 'survival', blurb: "A stick spun between your palms. The oldest way there is, and the one most likely to fail, as it wants dry wood, hard hands, and about two minutes of nothing going wrong.", sources: [{ label: 'Fire making', url: 'https://en.wikipedia.org/wiki/Fire_making' }] },
    { id: 'tinder_bundle', name: 'Tinder Bundle', icon: 'tinder_bundle', realm: 'survival', blurb: "Fibre teased apart until it is more air than material. Put an ember in the middle, blow, and the whole nest goes up.", sources: [{ label: 'Tinder', url: 'https://en.wikipedia.org/wiki/Tinder' }] },
    { id: 'bark', name: 'Bark', icon: 'bark', realm: 'survival', blurb: "Knocked off a trunk with a stone. The stringy inner layer is some of the best tinder going, and the outer layer will hold water over a fire without burning through.", sources: [{ label: 'Bark (botany)', url: 'https://en.wikipedia.org/wiki/Bark_(botany)' }] },
    { id: 'torch', name: 'Torch', icon: 'torch', realm: 'survival', blurb: "Fibre wound tight round the end of a stick. Unlit it is a stick, but it is the shape that lets fire travel.", sources: [{ label: 'Torch', url: 'https://en.wikipedia.org/wiki/Torch' }] },
    { id: 'spindle', name: 'Spindle', icon: 'spindle', realm: 'survival', blurb: "A shaft carved round, blunt at the bottom and pointed at the top. It wants to be softer wood than most people guess, as you are trying to make dust, not a hole.", sources: [{ label: 'Fire making', url: 'https://en.wikipedia.org/wiki/Fire_making' }] },
    { id: 'fire_board', name: 'Fire Board', icon: 'fire_board', realm: 'survival', blurb: "A flat board with a socket and a notch cut into the side of it. The notch is the design: without it the hot dust scatters instead of piling up where you need it.", sources: [{ label: 'Bow drill', url: 'https://en.wikipedia.org/wiki/Bow_drill' }] },
    { id: 'bow', name: 'Bow', icon: 'bow', realm: 'survival', blurb: "A springy branch strung with cordage. Not for shooting. It turns a back and forth pull into a spindle spinning far faster than hands can manage.", sources: [{ label: 'Bow drill', url: 'https://en.wikipedia.org/wiki/Bow_drill' }] },
    { id: 'bow_drill', name: 'Bow Drill', icon: 'bow_drill', realm: 'survival', blurb: "Bow, spindle and board together. More work to build than a hand drill and much less work to use, which is the argument for building tools in general.", sources: [{ label: 'Bow drill', url: 'https://en.wikipedia.org/wiki/Bow_drill' }] },
    { id: 'ember', name: 'Ember', icon: 'ember', realm: 'survival', blurb: "Friction does not set wood alight. It grinds off dust and heats the dust until it smoulders on its own. What you are carrying is a coal about the size of a match head, and it will go out if you look at it wrong.", sources: [{ label: 'Ember', url: 'https://en.wikipedia.org/wiki/Ember' }] },
    { id: 'burning_tinder', name: 'Burning Tinder', icon: 'burning_tinder', realm: 'survival', blurb: "The ember folded into the bundle and blown on until the nest catches. This is the point where it stops being heat and starts being fire.", sources: [{ label: 'Tinder', url: 'https://en.wikipedia.org/wiki/Tinder' }] },
    { id: 'fire', name: 'Fire', icon: 'fire', realm: 'survival', blurb: "Feed it wood and it keeps itself going. Every smelt, every kiln and every evaporation pond in the other realm sits downstream of this one tile.", sources: [{ label: 'Fire', url: 'https://en.wikipedia.org/wiki/Fire' }] },
    { id: 'charcoal', name: 'Charcoal', icon: 'charcoal', realm: 'survival', blurb: "Wood cooked with almost no air, so everything but the carbon boils off. It burns a few hundred degrees hotter than the wood it came from, and that gap is what makes metal possible.", sources: [{ label: 'Charcoal', url: 'https://en.wikipedia.org/wiki/Charcoal' }, { label: 'Pyrolysis', url: 'https://en.wikipedia.org/wiki/Pyrolysis' }] },
    { id: 'lit_torch', name: 'Lit Torch', icon: 'lit_torch', realm: 'survival', blurb: "Fire you can walk with. You opened this realm rubbing a stick between your palms and you are closing it holding the flame and going somewhere.", sources: [{ label: 'Torch', url: 'https://en.wikipedia.org/wiki/Torch' }] },
    { id: 'water', name: 'Water', icon: 'water', realm: 'everyday', blurb: "The most used input here by a distance. It grows the cotton, splits into the lye, weathers the sand, and carries most of the numbers on your receipt.", sources: [{ label: 'Water', url: 'https://en.wikipedia.org/wiki/Water' }] },
    { id: 'soil', name: 'Soil', icon: 'soil', realm: 'everyday', blurb: "Dirt. On its own it grows very little. What turns it into a field is nitrogen, and where that nitrogen comes from is one of the better stories in this game.", sources: [{ label: 'Soil', url: 'https://en.wikipedia.org/wiki/Soil' }] },
    { id: 'limestone', name: 'Limestone', icon: 'limestone', realm: 'everyday', blurb: "Calcium carbonate, mostly old shells. Burn it and you get lime; melt it with sand and you get glass. Two of the three targets run through it.", sources: [{ label: 'Limestone', url: 'https://en.wikipedia.org/wiki/Limestone' }] },
    { id: 'bauxite', name: 'Bauxite', icon: 'bauxite', realm: 'everyday', blurb: "The ore almost all aluminium comes from. Roughly four tonnes of it for one tonne of metal, and the leftovers are a bright red mud nobody has a good answer for.", sources: [{ label: 'Bauxite', url: 'https://en.wikipedia.org/wiki/Bauxite' }] },
    { id: 'iron_ore', name: 'Iron Ore', icon: 'iron_ore', realm: 'everyday', blurb: "Iron stuck to oxygen, which is to say rust that got there first. Getting the oxygen back off is what the charcoal is for.", sources: [{ label: 'Iron ore', url: 'https://en.wikipedia.org/wiki/Iron_ore' }] },
    { id: 'crude_oil', name: 'Crude Oil', icon: 'crude_oil', realm: 'everyday', blurb: "Plankton buried under pressure for something like a hundred million years. Heat it carefully and it comes apart into everything from petrol to candle wax.", sources: [{ label: 'Petroleum', url: 'https://en.wikipedia.org/wiki/Petroleum' }] },
    { id: 'natural_gas', name: 'Natural Gas', icon: 'natural_gas', realm: 'everyday', blurb: "Mostly methane. It is a fuel, but the thing it really does for the world is feed the reaction that makes fertiliser.", sources: [{ label: 'Natural gas', url: 'https://en.wikipedia.org/wiki/Natural_gas' }] },
    { id: 'beeswax', name: 'Beeswax', icon: 'beeswax', realm: 'everyday', blurb: "Bees make it to build comb with. For most of history it was the good candle wax, and priced like it.", sources: [{ label: 'Beeswax', url: 'https://en.wikipedia.org/wiki/Beeswax' }] },
    { id: 'salt', name: 'Salt', icon: 'salt', realm: 'everyday', blurb: "Seawater left in the sun, or boiled, until only the solid is left. Probably the oldest chemistry anyone did on purpose, and it feeds two whole industries from here.", sources: [{ label: 'Salt evaporation pond', url: 'https://en.wikipedia.org/wiki/Salt_evaporation_pond' }] },
    { id: 'ammonia', name: 'Ammonia', icon: 'ammonia', realm: 'everyday', blurb: "Nitrogen taken out of the air and forced onto hydrogen stripped from methane. Haber Bosch feeds roughly half the people alive and almost nobody can name it, which seems like an oversight.", sources: [{ label: 'Haber process', url: 'https://en.wikipedia.org/wiki/Haber_process' }] },
    { id: 'farmland', name: 'Farmland', icon: 'farmland', realm: 'everyday', blurb: "Soil that can carry a crop, as someone put the nitrogen back into it.", sources: [{ label: 'Fertilizer', url: 'https://en.wikipedia.org/wiki/Fertilizer' }] },
    { id: 'silica_sand', name: 'Silica Sand', icon: 'silica_sand', realm: 'everyday', blurb: "Rock that water has been grinding down for long enough. Close to pure quartz, and the body of every piece of glass you have ever held.", sources: [{ label: 'Sand', url: 'https://en.wikipedia.org/wiki/Sand' }] },
    { id: 'quicklime', name: 'Quicklime', icon: 'quicklime', realm: 'everyday', blurb: "Limestone burnt until the carbon dioxide walks out of it. That escaping gas, before you count any fuel, is why cement alone is about 8 percent of global emissions.", sources: [{ label: 'Calcination', url: 'https://en.wikipedia.org/wiki/Calcination' }, { label: 'Calcium oxide', url: 'https://en.wikipedia.org/wiki/Calcium_oxide' }] },
    { id: 'soda_ash', name: 'Soda Ash', icon: 'soda_ash', realm: 'everyday', blurb: "Salt and lime, via the Solvay process. It is one of the most important reactions ever worked out and the reason a glass bottle costs pennies.", sources: [{ label: 'Solvay process', url: 'https://en.wikipedia.org/wiki/Solvay_process' }] },
    { id: 'sodium_hydroxide', name: 'Sodium Hydroxide', icon: 'sodium_hydroxide', realm: 'everyday', blurb: "Lye. Salt water with a current run through it. Strong enough to dissolve aluminium straight out of rock.", sources: [{ label: 'Chloralkali process', url: 'https://en.wikipedia.org/wiki/Chloralkali_process' }] },
    { id: 'pig_iron', name: 'Pig Iron', icon: 'pig_iron', realm: 'everyday', blurb: "Iron carrying so much carbon that it snaps rather than bends. Useless on its own, and the thing every other kind of steel is refined out of.", sources: [{ label: 'Pig iron', url: 'https://en.wikipedia.org/wiki/Pig_iron' }] },
    { id: 'high_carbon_steel', name: 'High-Carbon Steel', icon: 'high_carbon_steel', realm: 'everyday', blurb: "Iron with the carbon brought under control. Hard enough to cut, roll and press every other material in this realm, which is why it turns up in four recipes.", sources: [{ label: 'Carbon steel', url: 'https://en.wikipedia.org/wiki/Carbon_steel' }] },
    { id: 'cotton_gin', name: 'Cotton Gin', icon: 'cotton_gin', realm: 'everyday', blurb: "A machine, so you have to build it before you can use it. It takes the seeds out of cotton roughly fifty times faster than hands do.", sources: [{ label: 'Cotton gin', url: 'https://en.wikipedia.org/wiki/Cotton_gin' }] },
    { id: 'sodium_silicate', name: 'Sodium Silicate', icon: 'sodium_silicate', realm: 'everyday', blurb: "Sand fused with soda ash. The soda drops silica's melting point by several hundred degrees, which is the only reason glass is makeable at all.", sources: [{ label: 'Sodium silicate', url: 'https://en.wikipedia.org/wiki/Sodium_silicate' }] },
    { id: 'molten_glass', name: 'Molten Glass', icon: 'molten_glass', realm: 'everyday', blurb: "The melt. Limestone goes in to stop the glass slowly dissolving in water, which is what sand and soda on their own will happily do.", sources: [{ label: 'Soda-lime glass', url: 'https://en.wikipedia.org/wiki/Soda%E2%80%93lime_glass' }] },
    { id: 'glass_bottle', name: 'Glass Bottle', icon: 'glass_bottle', realm: 'everyday', blurb: "Blown into a steel mould. It recycles forever with no loss, and it is heavy enough that moving it around is most of its footprint.", sources: [{ label: 'Glass bottle', url: 'https://en.wikipedia.org/wiki/Glass_bottle' }] },
    { id: 'alumina', name: 'Alumina', icon: 'alumina', realm: 'everyday', blurb: "Aluminium oxide, dissolved out of bauxite with lye and dropped back out as a white powder. The Bayer process, and it is half the reason aluminium stopped being a precious metal.", sources: [{ label: 'Bayer process', url: 'https://en.wikipedia.org/wiki/Bayer_process' }] },
    { id: 'distillate', name: 'Distillate', icon: 'distillate', realm: 'everyday', blurb: "Crude oil heated in a tall column so it separates by weight, light things at the top and tar at the bottom. Every layer that comes off is somebody's entire industry.", sources: [{ label: 'Fractional distillation', url: 'https://en.wikipedia.org/wiki/Fractional_distillation' }] },
    { id: 'paraffin_wax', name: 'Paraffin Wax', icon: 'paraffin_wax', realm: 'everyday', blurb: "Chilled out of the heavy fraction and filtered off. It undercut beeswax and tallow so badly that candles went from a luxury to a thing you buy without thinking.", sources: [{ label: 'Paraffin wax', url: 'https://en.wikipedia.org/wiki/Paraffin_wax' }] },
    { id: 'molten_aluminum', name: 'Molten Aluminium', icon: 'molten_aluminum', realm: 'everyday', blurb: "Alumina split apart by a current running through a carbon anode, which is eaten by the reaction as it goes. Hall Heroult, and it drinks electricity.", sources: [{ label: 'Hall-Heroult process', url: 'https://en.wikipedia.org/wiki/Hall%E2%80%93H%C3%A9roult_process' }] },
    { id: 'aluminum_sheet', name: 'Aluminium Sheet', icon: 'aluminum_sheet', realm: 'everyday', blurb: "Rolled between steel rollers until it is thinner than the paper this sentence would be printed on.", sources: [{ label: 'Rolling (metalworking)', url: 'https://en.wikipedia.org/wiki/Rolling_(metalworking)' }] },
    { id: 'aluminum_can', name: 'Aluminium Can', icon: 'aluminum_can', realm: 'everyday', blurb: "Drawn and ironed out of one flat disc in a single machine. The wall ends up about a tenth of a millimetre thick and still holds six atmospheres of fizz.", sources: [{ label: 'Aluminium can', url: 'https://en.wikipedia.org/wiki/Aluminum_can' }] },
    { id: 'raw_cotton', name: 'Raw Cotton', icon: 'raw_cotton', realm: 'everyday', blurb: "Straight off the plant with the seeds still in it. This one step is where almost all of a t-shirt's water goes.", sources: [{ label: 'Cotton', url: 'https://en.wikipedia.org/wiki/Cotton' }] },
    { id: 'ginned_cotton', name: 'Ginned Cotton', icon: 'ginned_cotton', realm: 'everyday', blurb: "Seeds out, fibre loose. The same material reaches this tile from a watered field or from a pile of old shirts, and the two cost wildly different amounts.", sources: [{ label: 'Cotton gin', url: 'https://en.wikipedia.org/wiki/Cotton_gin' }] },
    { id: 'cotton_yarn', name: 'Cotton Yarn', icon: 'cotton_yarn', realm: 'everyday', blurb: "Fibre drawn thin and twisted. It is the same trick as the cordage you made in the forest, done by a machine, about a thousand times faster.", sources: [{ label: 'Spinning (textiles)', url: 'https://en.wikipedia.org/wiki/Spinning_(textiles)' }] },
    { id: 'cotton_jersey', name: 'Cotton Jersey', icon: 'cotton_jersey', realm: 'everyday', blurb: "Knitted rather than woven, so it is loops instead of a grid. That is the reason a t-shirt stretches and a dress shirt does not.", sources: [{ label: 'Jersey (fabric)', url: 'https://en.wikipedia.org/wiki/Jersey_(fabric)' }] },
    { id: 'dye', name: 'Dye', icon: 'dye', realm: 'everyday', blurb: "Colour that will bond to fibre instead of rinsing back out. It comes from boiled plants or from ground up iron oxide, and both roads are open here.", sources: [{ label: 'Dye', url: 'https://en.wikipedia.org/wiki/Dye' }] },
    { id: 'dyed_cotton_fabric', name: 'Dyed Cotton Fabric', icon: 'dyed_cotton_fabric', realm: 'everyday', blurb: "Coloured, then rinsed, and the rinsing is where the last 380 litres of the shirt's water bill gets run up.", sources: [{ label: 'Dyeing', url: 'https://en.wikipedia.org/wiki/Dyeing' }] },
    { id: 'sewing_thread', name: 'Sewing Thread', icon: 'sewing_thread', realm: 'everyday', blurb: "Yarn waxed so it slides through cloth without fraying or knotting. Paraffin or beeswax both work; saddlers have used the beeswax for centuries.", sources: [{ label: 'Thread (yarn)', url: 'https://en.wikipedia.org/wiki/Thread_(yarn)' }] },
    { id: 'cotton_t_shirt', name: 'Cotton T-Shirt', icon: 'cotton_t_shirt', realm: 'everyday', blurb: "Around 2,700 litres of water, and most of it was spent in a field months before anyone cut a pattern.", sources: [{ label: 'Water footprint', url: 'https://en.wikipedia.org/wiki/Water_footprint' }] },
    { id: 'textile_waste', name: 'Textile Waste', icon: 'textile_waste', realm: 'everyday', blurb: "Old clothes and offcuts, baled. Run them back through the gin and you get fibre again without watering a single new acre.", sources: [{ label: 'Textile recycling', url: 'https://en.wikipedia.org/wiki/Textile_recycling' }] },
    { id: 'candle', name: 'Candle', icon: 'candle', realm: 'everyday', blurb: "Wax and a braided wick. The wick is not what burns: it draws liquid wax up by capillary action and the wax burns at the top, which is why the thing lasts hours instead of seconds.", sources: [{ label: 'Candle', url: 'https://en.wikipedia.org/wiki/Candle' }] },
    { id: 'butane', name: 'Butane', icon: 'butane', realm: 'everyday', blurb: "Pulled out of natural gas by chilling it. It goes liquid under gentle pressure, and that is the only reason a lighter fits in a pocket.", sources: [{ label: 'Butane', url: 'https://en.wikipedia.org/wiki/Butane' }] },
    { id: 'lighter', name: 'Lighter', icon: 'lighter', realm: 'everyday', blurb: "Fuel, a valve, a flint and a pressed steel case. The end of a road that started with a stick spun between two palms.", sources: [{ label: 'Lighter', url: 'https://en.wikipedia.org/wiki/Lighter' }] },
  ],
  recipes: [
    {
      inputs: ['stone', 'stone'],
      output: 'sharp_stone',
      process: 'knapping',
      cost: ZERO_COST,
      sources: [{ label: 'Knapping', url: 'https://en.wikipedia.org/wiki/Knapping' }],
    },
    {
      inputs: ['plant_fibre', 'plant_fibre'],
      output: 'cordage',
      process: 'twisting',
      cost: ZERO_COST,
      sources: [{ label: 'Rope', url: 'https://en.wikipedia.org/wiki/Rope' }],
    },
    {
      inputs: ['wood', 'wood'],
      output: 'hand_drill',
      process: 'spinning',
      cost: ZERO_COST,
      sources: [{ label: 'Fire making', url: 'https://en.wikipedia.org/wiki/Fire_making' }],
    },
    {
      inputs: ['stone', 'plant_fibre'],
      output: 'tinder_bundle',
      process: 'shredding',
      cost: ZERO_COST,
      sources: [{ label: 'Tinder', url: 'https://en.wikipedia.org/wiki/Tinder' }],
    },
    {
      inputs: ['stone', 'wood'],
      output: 'bark',
      process: 'stripping',
      cost: ZERO_COST,
      sources: [{ label: 'Bark (botany)', url: 'https://en.wikipedia.org/wiki/Bark_(botany)' }],
    },
    {
      inputs: ['wood', 'plant_fibre'],
      output: 'torch',
      process: 'wrapping',
      cost: ZERO_COST,
      sources: [{ label: 'Torch', url: 'https://en.wikipedia.org/wiki/Torch' }],
    },
    {
      inputs: ['wood', 'sharp_stone'],
      output: 'spindle',
      process: 'carving',
      cost: ZERO_COST,
      sources: [{ label: 'Fire making', url: 'https://en.wikipedia.org/wiki/Fire_making' }],
    },
    {
      inputs: ['sharp_stone', 'spindle'],
      output: 'fire_board',
      process: 'carving',
      cost: ZERO_COST,
      sources: [{ label: 'Bow drill', url: 'https://en.wikipedia.org/wiki/Bow_drill' }],
    },
    {
      inputs: ['wood', 'cordage'],
      output: 'bow',
      process: 'stringing',
      cost: ZERO_COST,
      sources: [{ label: 'Bow drill', url: 'https://en.wikipedia.org/wiki/Bow_drill' }],
    },
    {
      inputs: ['bow', 'spindle'],
      output: 'bow_drill',
      process: 'assembling',
      cost: ZERO_COST,
      sources: [{ label: 'Bow drill', url: 'https://en.wikipedia.org/wiki/Bow_drill' }],
    },
    {
      // The fast road and the unreliable one. Three steps from the start, and
      // historically the first method there was — which is exactly why the bow
      // drill was invented.
      inputs: ['hand_drill', 'fire_board'],
      output: 'ember',
      process: 'spinning',
      route: 'hand drill',
      cost: ZERO_COST,
      sources: [{ label: 'Fire making', url: 'https://en.wikipedia.org/wiki/Fire_making' }],
    },
    {
      // Six steps instead of three, and it works. The receipt records which road
      // you took, because the difference between them is the whole argument for
      // building a tool before you need one.
      inputs: ['bow_drill', 'fire_board'],
      output: 'ember',
      process: 'drilling',
      route: 'bow drill',
      cost: ZERO_COST,
      sources: [{ label: 'Bow drill', url: 'https://en.wikipedia.org/wiki/Bow_drill' }],
    },
    {
      inputs: ['bark', 'sharp_stone'],
      output: 'tinder_bundle',
      process: 'shredding',
      cost: ZERO_COST,
      sources: [{ label: 'Tinder', url: 'https://en.wikipedia.org/wiki/Tinder' }],
    },
    {
      inputs: ['ember', 'tinder_bundle'],
      output: 'burning_tinder',
      process: 'blowing',
      cost: ZERO_COST,
      sources: [{ label: 'Tinder', url: 'https://en.wikipedia.org/wiki/Tinder' }],
    },
    {
      inputs: ['burning_tinder', 'wood'],
      output: 'fire',
      process: 'feeding',
      cost: ZERO_COST,
      sources: [{ label: 'Fire', url: 'https://en.wikipedia.org/wiki/Fire' }],
    },
    {
      inputs: ['fire', 'wood'],
      output: 'charcoal',
      process: 'charring',
      cost: ZERO_COST,
      sources: [{ label: 'Charcoal', url: 'https://en.wikipedia.org/wiki/Charcoal' }],
    },
    {
      inputs: ['torch', 'fire'],
      output: 'lit_torch',
      process: 'lighting',
      cost: ZERO_COST,
      sources: [{ label: 'Torch', url: 'https://en.wikipedia.org/wiki/Torch' }],
    },
    {
      inputs: ['water', 'fire'],
      output: 'salt',
      process: 'evaporating',
      cost: ZERO_COST,
      sources: [{ label: 'Salt evaporation pond', url: 'https://en.wikipedia.org/wiki/Salt_evaporation_pond' }],
    },
    {
      // Steam reforming strips hydrogen off the methane; Haber-Bosch pushes it
      // onto nitrogen from the air. No footprint number here on purpose - the
      // real figure is enormous and contested, and a wrong one is worse than
      // none.
      inputs: ['natural_gas', 'water'],
      output: 'ammonia',
      process: 'reforming',
      cost: ZERO_COST,
      sources: [{ label: 'Haber process', url: 'https://en.wikipedia.org/wiki/Haber_process' }],
    },
    {
      inputs: ['ammonia', 'soil'],
      output: 'farmland',
      process: 'fertilising',
      cost: ZERO_COST,
      sources: [{ label: 'Fertilizer', url: 'https://en.wikipedia.org/wiki/Fertilizer' }],
    },
    {
      inputs: ['stone', 'water'],
      output: 'silica_sand',
      process: 'weathering',
      cost: ZERO_COST,
      sources: [{ label: 'Sand', url: 'https://en.wikipedia.org/wiki/Sand' }],
    },
    {
      inputs: ['limestone', 'fire'],
      output: 'quicklime',
      process: 'calcining',
      cost: ZERO_COST,
      sources: [{ label: 'Calcination', url: 'https://en.wikipedia.org/wiki/Calcination' }],
    },
    {
      inputs: ['salt', 'quicklime'],
      output: 'soda_ash',
      process: 'the Solvay process',
      cost: ZERO_COST,
      sources: [{ label: 'Solvay process', url: 'https://en.wikipedia.org/wiki/Solvay_process' }],
    },
    {
      inputs: ['salt', 'water'],
      output: 'sodium_hydroxide',
      process: 'electrolysing',
      cost: ZERO_COST,
      sources: [{ label: 'Chloralkali process', url: 'https://en.wikipedia.org/wiki/Chloralkali_process' }],
    },
    {
      inputs: ['iron_ore', 'charcoal'],
      output: 'pig_iron',
      process: 'smelting',
      cost: ZERO_COST,
      sources: [{ label: 'Bloomery', url: 'https://en.wikipedia.org/wiki/Bloomery' }],
    },
    {
      inputs: ['pig_iron', 'charcoal'],
      output: 'high_carbon_steel',
      process: 'carburising',
      cost: ZERO_COST,
      sources: [{ label: 'Carbon steel', url: 'https://en.wikipedia.org/wiki/Carbon_steel' }],
    },
    {
      inputs: ['high_carbon_steel', 'wood'],
      output: 'cotton_gin',
      process: 'building',
      cost: ZERO_COST,
      sources: [{ label: 'Cotton gin', url: 'https://en.wikipedia.org/wiki/Cotton_gin' }],
    },
    {
      inputs: ['silica_sand', 'soda_ash'],
      output: 'sodium_silicate',
      process: 'fusing',
      cost: ZERO_COST,
      sources: [{ label: 'Sodium silicate', url: 'https://en.wikipedia.org/wiki/Sodium_silicate' }],
    },
    {
      // FEVE's life-cycle assessment gives ~0.9 kg CO2 per kg of container glass;
      // a 500 ml bottle is about 300 g, so 0.27 kg. Charged to the melt, because
      // the melt is where the energy goes.
      inputs: ['sodium_silicate', 'limestone'],
      output: 'molten_glass',
      process: 'melting',
      cost: { waterL: 0, co2kg: 0.27 },
      sources: [{ label: 'Glass container recycling', url: 'https://en.wikipedia.org/wiki/Glass_recycling' }],
    },
    {
      inputs: ['molten_glass', 'high_carbon_steel'],
      output: 'glass_bottle',
      process: 'blowing',
      cost: ZERO_COST,
      sources: [{ label: 'Glass bottle', url: 'https://en.wikipedia.org/wiki/Glass_bottle' }],
    },
    {
      inputs: ['bauxite', 'sodium_hydroxide'],
      output: 'alumina',
      process: 'the Bayer process',
      cost: ZERO_COST,
      sources: [{ label: 'Bayer process', url: 'https://en.wikipedia.org/wiki/Bayer_process' }],
    },
    {
      inputs: ['crude_oil', 'fire'],
      output: 'distillate',
      process: 'distilling',
      cost: ZERO_COST,
      sources: [{ label: 'Fractional distillation', url: 'https://en.wikipedia.org/wiki/Fractional_distillation' }],
    },
    {
      inputs: ['distillate', 'fire'],
      output: 'paraffin_wax',
      process: 'dewaxing',
      cost: ZERO_COST,
      sources: [{ label: 'Paraffin wax', url: 'https://en.wikipedia.org/wiki/Paraffin_wax' }],
    },
    {
      // The carbon anode is consumed by the reaction itself: roughly 1.5 t CO2 per
      // tonne of aluminium from the anode alone. A 15 g can body is ~0.178 kg.
      // This is the anode chemistry only, not the electricity, which varies by
      // grid by more than a factor of ten and so is deliberately not claimed.
      inputs: ['alumina', 'charcoal'],
      output: 'molten_aluminum',
      process: 'the Hall-Heroult process',
      cost: { waterL: 0, co2kg: 0.178 },
      sources: [{ label: 'Hall-Heroult process', url: 'https://en.wikipedia.org/wiki/Hall%E2%80%93H%C3%A9roult_process' }],
    },
    {
      inputs: ['molten_aluminum', 'high_carbon_steel'],
      output: 'aluminum_sheet',
      process: 'rolling',
      cost: ZERO_COST,
      sources: [{ label: 'Rolling (metalworking)', url: 'https://en.wikipedia.org/wiki/Rolling_(metalworking)' }],
    },
    {
      inputs: ['aluminum_sheet', 'high_carbon_steel'],
      output: 'aluminum_can',
      process: 'drawing',
      cost: ZERO_COST,
      sources: [{ label: 'Aluminum can', url: 'https://en.wikipedia.org/wiki/Aluminum_can' }],
    },
    {
      // Chapagain & Hoekstra et al. 2006, Table 9: for a 250 g t-shirt, 1,230 L
      // blue (irrigation) + 1,110 L green (rainfall) = 2,340 L at the field. The
      // remaining 380 L of the famous ~2,700 is dilution water, charged at
      // dyeing below, exactly as the source splits it.
      inputs: ['farmland', 'water'],
      output: 'raw_cotton',
      process: 'cultivating',
      cost: { waterL: 2340, co2kg: 0 },
      sources: [{ label: 'The Water Footprint of Cotton Consumption', url: 'https://waterfootprint.org/resources/Report18.pdf' }],
    },
    {
      inputs: ['raw_cotton', 'cotton_gin'],
      output: 'ginned_cotton',
      process: 'ginning',
      route: 'virgin',
      cost: ZERO_COST,
      sources: [{ label: 'Cotton gin', url: 'https://en.wikipedia.org/wiki/Cotton_gin' }],
    },
    {
      // The replay mechanic. This bypasses the field entirely rather than charging
      // a smaller number for it - recycling does not grow a crop, so there is no
      // cultivation step to have a cost at all.
      inputs: ['textile_waste', 'cotton_gin'],
      output: 'ginned_cotton',
      process: 'shredding',
      route: 'recycled',
      cost: ZERO_COST,
      sources: [{ label: 'Textile recycling', url: 'https://en.wikipedia.org/wiki/Textile_recycling' }],
    },
    {
      inputs: ['ginned_cotton', 'ginned_cotton'],
      output: 'cotton_yarn',
      process: 'spinning',
      cost: ZERO_COST,
      sources: [{ label: 'Spinning (textiles)', url: 'https://en.wikipedia.org/wiki/Spinning_(textiles)' }],
    },
    {
      inputs: ['cotton_yarn', 'cotton_yarn'],
      output: 'cotton_jersey',
      process: 'knitting',
      cost: ZERO_COST,
      sources: [{ label: 'Jersey (fabric)', url: 'https://en.wikipedia.org/wiki/Jersey_(fabric)' }],
    },
    {
      inputs: ['plant_fibre', 'water'],
      output: 'dye',
      process: 'boiling',
      route: 'plant',
      cost: ZERO_COST,
      sources: [{ label: 'Natural dye', url: 'https://en.wikipedia.org/wiki/Natural_dye' }],
    },
    {
      // Red ochre is iron oxide, and it is the oldest pigment humans have used -
      // which is why the ore has a second life here that has nothing to do with
      // metal.
      inputs: ['iron_ore', 'fire'],
      output: 'dye',
      process: 'grinding',
      route: 'ochre',
      cost: ZERO_COST,
      sources: [{ label: 'Ochre', url: 'https://en.wikipedia.org/wiki/Ochre' }],
    },
    {
      // The dilution water from the same table - the water needed to dilute the
      // dyeing effluent back to a safe concentration.
      inputs: ['cotton_jersey', 'dye'],
      output: 'dyed_cotton_fabric',
      process: 'dyeing',
      cost: { waterL: 380, co2kg: 0 },
      sources: [{ label: 'The Water Footprint of Cotton Consumption', url: 'https://waterfootprint.org/resources/Report18.pdf' }],
    },
    {
      inputs: ['cotton_yarn', 'paraffin_wax'],
      output: 'sewing_thread',
      process: 'waxing',
      route: 'paraffin',
      cost: ZERO_COST,
      sources: [{ label: 'Thread (yarn)', url: 'https://en.wikipedia.org/wiki/Thread_(yarn)' }],
    },
    {
      inputs: ['beeswax', 'cotton_yarn'],
      output: 'sewing_thread',
      process: 'waxing',
      route: 'beeswax',
      cost: ZERO_COST,
      sources: [{ label: 'Beeswax', url: 'https://en.wikipedia.org/wiki/Beeswax' }],
    },
    {
      inputs: ['dyed_cotton_fabric', 'sewing_thread'],
      output: 'cotton_t_shirt',
      process: 'sewing',
      cost: ZERO_COST,
      sources: [{ label: 'T-shirt', url: 'https://en.wikipedia.org/wiki/T-shirt' }],
    },
    {
      inputs: ['paraffin_wax', 'cordage'],
      output: 'candle',
      process: 'dipping',
      route: 'paraffin',
      cost: ZERO_COST,
      sources: [{ label: 'Candle', url: 'https://en.wikipedia.org/wiki/Candle' }],
    },
    {
      inputs: ['beeswax', 'cordage'],
      output: 'candle',
      process: 'dipping',
      route: 'beeswax',
      cost: ZERO_COST,
      sources: [{ label: 'Candle', url: 'https://en.wikipedia.org/wiki/Candle' }],
    },
    {
      inputs: ['natural_gas', 'fire'],
      output: 'butane',
      process: 'fractionating',
      cost: ZERO_COST,
      sources: [{ label: 'Butane', url: 'https://en.wikipedia.org/wiki/Butane' }],
    },
    {
      inputs: ['butane', 'high_carbon_steel'],
      output: 'lighter',
      process: 'assembling',
      cost: ZERO_COST,
      sources: [{ label: 'Lighter', url: 'https://en.wikipedia.org/wiki/Lighter' }],
    },
  ],
  starters: {
    // Three. Everything else in the game is earned from them.
    survival: ['stone', 'wood', 'plant_fibre'],
    // Industry legitimately begins from what you dig up and pump, but nothing
    // manufactured is handed over: the gin is built, the soda ash is made, the
    // salt is evaporated, the farmland is fertilised.
    everyday: [
      'water',
      'soil',
      'limestone',
      'bauxite',
      'iron_ore',
      'crude_oil',
      'natural_gas',
      'beeswax',
      /*
       * Post-consumer textile waste is a starter rather than something you
       * make from your own finished shirt, and that is an engine constraint
       * rather than a preference. Any edge from the t-shirt back into the
       * cotton chain closes a loop, and the footprint accumulator walks
       * ancestors: a cycle either recurses forever or silently double-counts
       * the field it was supposed to skip. The solver rejects cyclic graphs
       * for exactly that reason and caught this within a minute of the rebuild.
       *
       * It is also true to the industry. Old clothes already exist in the
       * world; a mill buys them the way it buys ore.
       */
      'textile_waste',
    ],
  },
  targets: {
    // You finish Survival when fire stops being luck and becomes something you
    // carry, and charcoal is the thing you carry into the other realm.
    survival: ['fire', 'charcoal', 'lit_torch'],
    everyday: ['cotton_t_shirt', 'aluminum_can', 'glass_bottle'],
  },
}
