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
    { id: 'wrought_iron', name: 'Wrought Iron', icon: 'wrought_iron', realm: 'everyday', blurb: "Pig iron refined with lime until most of the carbon is gone. Soft, tough, and it bends instead of snapping, which is why every gate and railing used to be made of it.", sources: [{ label: 'Wrought iron', url: 'https://en.wikipedia.org/wiki/Wrought_iron' }, { label: 'Finery forge', url: 'https://en.wikipedia.org/wiki/Finery_forge' }] },
    { id: 'mercerised_cotton', name: 'Mercerised Cotton', icon: 'mercerised_cotton', realm: 'everyday', blurb: "Cotton soaked in lye under tension. The fibres swell and straighten, so they end up stronger, shinier, and they take dye far better than they did.", sources: [{ label: 'Mercerised cotton', url: 'https://en.wikipedia.org/wiki/Mercerised_cotton' }] },
    { id: 'clay', name: 'Clay', icon: 'clay', realm: 'everyday', blurb: "The finest part of soil, washed out in water and left to settle. Wet it and it holds any shape you press into it; fire it and it holds that shape forever.", sources: [{ label: 'Clay', url: 'https://en.wikipedia.org/wiki/Clay' }] },
    { id: 'brick', name: 'Brick', icon: 'brick', realm: 'everyday', blurb: "Clay fired until the particles fuse. Nine thousand years old, still the cheapest way to stack a wall that will outlast you.", sources: [{ label: 'Brick', url: 'https://en.wikipedia.org/wiki/Brick' }] },
    { id: 'slaked_lime', name: 'Slaked Lime', icon: 'slaked_lime', realm: 'everyday', blurb: "Quicklime and water, which is not a gentle mixture: it boils itself, hot enough to set wood alight. What comes out sets hard again over years by pulling carbon dioxide back out of the air.", sources: [{ label: 'Calcium hydroxide', url: 'https://en.wikipedia.org/wiki/Calcium_hydroxide' }] },
    { id: 'lime_mortar', name: 'Lime Mortar', icon: 'lime_mortar', realm: 'everyday', blurb: "Slaked lime and sand. It is softer than the stone it joins, which sounds like a weakness and is the reason Roman walls are still standing.", sources: [{ label: 'Lime mortar', url: 'https://en.wikipedia.org/wiki/Lime_mortar' }] },
    { id: 'raw_meal', name: 'Raw Meal', icon: 'raw_meal', realm: 'everyday', blurb: "Limestone and clay ground together in the proportion a kiln wants. The industry's own name for it, and the last step before the carbon leaves.", sources: [{ label: 'Portland cement', url: 'https://en.wikipedia.org/wiki/Portland_cement' }] },
    { id: 'cement', name: 'Cement', icon: 'cement', realm: 'everyday', blurb: "Raw meal burnt at 1,450 degrees. Every kilogram drives roughly a kilogram of carbon dioxide out of the limestone and up the chimney, before you count the fuel that did the burning.", sources: [{ label: 'Environmental impact of concrete', url: 'https://en.wikipedia.org/wiki/Environmental_impact_of_concrete' }] },
    { id: 'concrete', name: 'Concrete', icon: 'concrete', realm: 'everyday', blurb: "Cement, sand and water. The most used material on earth after water itself, and cement alone is about eight percent of all human carbon dioxide.", sources: [{ label: 'Concrete', url: 'https://en.wikipedia.org/wiki/Concrete' }] },
    { id: 'wood_pulp', name: 'Wood Pulp', icon: 'wood_pulp', realm: 'everyday', blurb: "Wood beaten in water until it is nothing but loose fibre. Every sheet of paper you have ever written on started as this.", sources: [{ label: 'Pulp (paper)', url: 'https://en.wikipedia.org/wiki/Pulp_(paper)' }] },
    { id: 'paper', name: 'Paper', icon: 'paper', realm: 'everyday', blurb: "Pulp poured onto a screen, pressed and dried. The fibres tangle and hold each other with nothing added, which is why paper tears along a grain.", sources: [{ label: 'Papermaking', url: 'https://en.wikipedia.org/wiki/Papermaking' }] },
    { id: 'filtered_water', name: 'Filtered Water', icon: 'filtered_water', realm: 'everyday', blurb: "Water run through charcoal. The carbon is riddled with pores, so it catches what dissolved in the water and leaves the water behind.", sources: [{ label: 'Carbon filtering', url: 'https://en.wikipedia.org/wiki/Carbon_filtering' }] },
    { id: 'tannin', name: 'Tannin', icon: 'tannin', realm: 'everyday', blurb: "Bark left to soak. The water pulls out the compounds a tree uses to make itself unpalatable, and they bind hard to fibre, which is why they have coloured cloth and cured hides for thousands of years.", sources: [{ label: 'Tannin', url: 'https://en.wikipedia.org/wiki/Tannin' }] },
    { id: 'compost', name: 'Compost', icon: 'compost', realm: 'everyday', blurb: "Plant matter left to rot down with the soil. It puts the nitrogen back the slow way, without a gas well or a reactor at the other end of it.", sources: [{ label: 'Compost', url: 'https://en.wikipedia.org/wiki/Compost' }] },
    { id: 'syngas', name: 'Syngas', icon: 'syngas', realm: 'everyday', blurb: "Carbon monoxide and hydrogen, made by heating almost any carbon-rich rubbish with too little air to burn it properly. Old clothes go in and chemical feedstock comes out.", sources: [{ label: 'Syngas', url: 'https://en.wikipedia.org/wiki/Syngas' }, { label: 'Gasification', url: 'https://en.wikipedia.org/wiki/Gasification' }] },
    { id: 'candle', name: 'Candle', icon: 'candle', realm: 'everyday', blurb: "Wax and a braided wick. The wick is not what burns: it draws liquid wax up by capillary action and the wax burns at the top, which is why the thing lasts hours instead of seconds.", sources: [{ label: 'Candle', url: 'https://en.wikipedia.org/wiki/Candle' }] },
    { id: 'butane', name: 'Butane', icon: 'butane', realm: 'everyday', blurb: "Pulled out of natural gas by chilling it. It goes liquid under gentle pressure, and that is the only reason a lighter fits in a pocket.", sources: [{ label: 'Butane', url: 'https://en.wikipedia.org/wiki/Butane' }] },
    { id: 'lighter', name: 'Lighter', icon: 'lighter', realm: 'everyday', blurb: "Fuel, a valve, a flint and a pressed steel case. The end of a road that started with a stick spun between two palms.", sources: [{ label: 'Lighter', url: 'https://en.wikipedia.org/wiki/Lighter' }] },

    /*
     * THE FIRST BATCH THROUGH THE IMPORT GATE.
     *
     * Every citation below is `referenced` rather than `sourced`: the URL was
     * fetched, answered, and its page title checked against the label by
     * `npm run links`. Nobody has sat and read all thirteen articles, and the
     * game says so on the card rather than implying otherwise. Which is also
     * why every one of these recipes costs ZERO_COST — a machine-checked link
     * is no evidence at all for a number, and `npm test` fails the build if
     * one ever tries to carry one.
     *
     * The gate rejected one of the thirteen on the way in: a citation labelled
     * "Limewash" pointing at an article that redirects to "Whitewash". That is
     * exactly the class of mistake it exists to catch, and it was mine.
     */
    { id: 'wood_ash', name: 'Wood Ash', icon: 'wood_ash', realm: 'everyday', blurb: "What is left when a plant burns and the carbon has gone. Mostly calcium and potassium, which is to say most of what the tree pulled out of the ground in the first place.", sources: [{ label: 'Wood ash', url: 'https://en.wikipedia.org/wiki/Wood_ash', tier: 'referenced' }] },
    { id: 'potash', name: 'Potash', icon: 'potash', realm: 'everyday', blurb: "Ash soaked in water, strained, and the liquid boiled dry in a pot. The name is not a metaphor. It was the first industrial alkali and it came out of a fireplace.", sources: [{ label: 'Potash', url: 'https://en.wikipedia.org/wiki/Potash', tier: 'referenced' }] },
    { id: 'soap', name: 'Soap', icon: 'soap', realm: 'everyday', blurb: "One end of the molecule wants water and the other wants grease, so it stands between them and refuses to choose. That is the entire trick, and it has not been improved on.", sources: [{ label: 'Saponification', url: 'https://en.wikipedia.org/wiki/Saponification', tier: 'referenced' }] },
    { id: 'slag', name: 'Slag', icon: 'slag', realm: 'everyday', blurb: "The furnace's leftovers, floated off the top. For centuries it went on a heap; now it goes into cement, which is one of the better things that happened to concrete.", sources: [{ label: 'Slag', url: 'https://en.wikipedia.org/wiki/Slag', tier: 'referenced' }] },
    { id: 'slag_cement', name: 'Slag Cement', icon: 'slag_cement', realm: 'everyday', blurb: "Ground slag standing in for part of the clinker. Since the clinker is where nearly all the CO2 in cement comes from, replacing some of it with something already made is the whole point.", sources: [{ label: 'Ground granulated blast-furnace slag', url: 'https://en.wikipedia.org/wiki/Ground_granulated_blast-furnace_slag', tier: 'referenced' }] },
    { id: 'hardened_steel', name: 'Hardened Steel', icon: 'hardened_steel', realm: 'everyday', blurb: "Heated, then cooled faster than the carbon inside it can move. Everything is caught where it stood, and the result is hard enough to cut other steel and brittle enough to snap.", sources: [{ label: 'Quenching', url: 'https://en.wikipedia.org/wiki/Quenching', tier: 'referenced' }] },
    { id: 'tempered_steel', name: 'Tempered Steel', icon: 'tempered_steel', realm: 'everyday', blurb: "Warmed again, gently, to give back a little of the hardness in exchange for not shattering. Every blade and every spring is somewhere on that trade.", sources: [{ label: 'Tempering (metallurgy)', url: 'https://en.wikipedia.org/wiki/Tempering_(metallurgy)', tier: 'referenced' }] },
    { id: 'plank', name: 'Plank', icon: 'plank', realm: 'everyday', blurb: "A log opened along its length. Cutting with the grain rather than across it is why a plank carries weight and a slice of trunk does not.", sources: [{ label: 'Lumber', url: 'https://en.wikipedia.org/wiki/Lumber', tier: 'referenced' }] },
    { id: 'cart_wheel', name: 'Cart Wheel', icon: 'cart_wheel', realm: 'everyday', blurb: "Spokes, a rim in segments, and an iron tyre shrunk on red hot. As it cools it pulls the whole wheel into compression, so the thing holding it together is the cooling.", sources: [{ label: 'Wheelwright', url: 'https://en.wikipedia.org/wiki/Wheelwright', tier: 'referenced' }] },
    { id: 'book', name: 'Book', icon: 'book', realm: 'everyday', blurb: "Sheets folded into gatherings and sewn through the fold. Glue alone gives you a book that loses its pages; thread gives you one that opens flat and survives.", sources: [{ label: 'Bookbinding', url: 'https://en.wikipedia.org/wiki/Bookbinding', tier: 'referenced' }] },
    { id: 'cardboard', name: 'Cardboard', icon: 'cardboard', realm: 'everyday', blurb: "A fluted sheet glued between two flat ones. The strength is in the shape rather than the material, which is why a box holds you and the paper it is made of does not.", sources: [{ label: 'Corrugated fiberboard', url: 'https://en.wikipedia.org/wiki/Corrugated_fiberboard', tier: 'referenced' }] },
    { id: 'reinforced_concrete', name: 'Reinforced Concrete', icon: 'reinforced_concrete', realm: 'everyday', blurb: "Concrete is strong pushed and weak pulled; steel is the other way round. They also expand at almost exactly the same rate with heat, which is the coincidence the modern world is built on.", sources: [{ label: 'Reinforced concrete', url: 'https://en.wikipedia.org/wiki/Reinforced_concrete', tier: 'referenced' }] },
    { id: 'whitewash', name: 'Whitewash', icon: 'whitewash', realm: 'everyday', blurb: "Slaked lime thinned with water and painted on. It dries, then slowly takes CO2 back out of the air and turns into limestone again, which is where it started.", sources: [{ label: 'Whitewash', url: 'https://en.wikipedia.org/wiki/Whitewash', tier: 'referenced' }] },

    // Batch 2: petrochemicals, plastics, building. Referenced, zero cost.
    { id: 'ethylene', name: 'Ethylene', icon: 'ethylene', realm: 'everyday', blurb: "The single biggest thing the chemical industry makes. Almost every plastic in your house starts as this gas.", sources: [{ label: 'Cracking (chemistry)', url: 'https://en.wikipedia.org/wiki/Cracking_(chemistry)', tier: 'referenced' }] },
    { id: 'polyethylene', name: 'Polythene', icon: 'polyethylene', realm: 'everyday', blurb: "Polyethylene, under the name half the world uses for it. Bags, bottles, pipe, the film on a new screen. Chains of the same two carbons, over and over.", sources: [{ label: 'Polyethylene', url: 'https://en.wikipedia.org/wiki/Polyethylene', tier: 'referenced' }] },
    { id: 'plastic_bottle', name: 'Plastic Bottle', icon: 'plastic_bottle', realm: 'everyday', blurb: "A hot tube inflated inside a steel mould until it takes its shape. About twenty grams of material for something that holds a litre.", sources: [{ label: 'Blow molding', url: 'https://en.wikipedia.org/wiki/Blow_molding', tier: 'referenced' }] },
    { id: 'ethanol', name: 'Ethanol', icon: 'ethanol', realm: 'everyday', blurb: "Water added across the double bond. The same molecule fermentation makes, arrived at from oil instead of sugar.", sources: [{ label: 'Ethanol', url: 'https://en.wikipedia.org/wiki/Ethanol', tier: 'referenced' }] },
    { id: 'butadiene', name: 'Butadiene', icon: 'butadiene', realm: 'everyday', blurb: "Ethanol over a hot catalyst, dehydrated and coupled in one pass. The Soviet Union ran its rubber industry on this when it had no oil to spare.", sources: [{ label: 'Butadiene', url: 'https://en.wikipedia.org/wiki/Butadiene', tier: 'referenced' }] },
    { id: 'synthetic_rubber', name: 'Synthetic Rubber', icon: 'synthetic_rubber', realm: 'everyday', blurb: "Chains that coil at rest and straighten when pulled, then coil again. That is all elasticity is.", sources: [{ label: 'Polybutadiene', url: 'https://en.wikipedia.org/wiki/Polybutadiene', tier: 'referenced' }] },
    { id: 'carbon_black', name: 'Carbon Black', icon: 'carbon_black', realm: 'everyday', blurb: "Heavy oil burned with too little air. Almost pure carbon, fine enough that a spoonful has the surface area of a tennis court.", sources: [{ label: 'Carbon black', url: 'https://en.wikipedia.org/wiki/Carbon_black', tier: 'referenced' }] },
    { id: 'tyre', name: 'Tyre', icon: 'tyre', realm: 'everyday', blurb: "Rubber on its own wears away in miles. Carbon black is what makes it last, and it is why every tyre is black.", sources: [{ label: 'Tire', url: 'https://en.wikipedia.org/wiki/Tire', tier: 'referenced' }] },
    { id: 'vinyl_chloride', name: 'Vinyl Chloride', icon: 'vinyl_chloride', realm: 'everyday', blurb: "Chlorine out of salt, stuck onto ethylene, then one molecule of acid taken back off.", sources: [{ label: 'Vinyl chloride', url: 'https://en.wikipedia.org/wiki/Vinyl_chloride', tier: 'referenced' }] },
    { id: 'pvc', name: 'PVC', icon: 'pvc', realm: 'everyday', blurb: "Most of the world's pipework. Two thirds of it by weight is chlorine, which is to say two thirds of it is sea salt.", sources: [{ label: 'Polyvinyl chloride', url: 'https://en.wikipedia.org/wiki/Polyvinyl_chloride', tier: 'referenced' }] },
    { id: 'pipe', name: 'Pipe', icon: 'pipe', realm: 'everyday', blurb: "Softened plastic pushed continuously through a shaped die. It comes out as fast as you can cool it.", sources: [{ label: 'Extrusion', url: 'https://en.wikipedia.org/wiki/Extrusion', tier: 'referenced' }] },
    { id: 'propylene', name: 'Propylene', icon: 'propylene', realm: 'everyday', blurb: "Propane with the hydrogen pulled off. The second-biggest thing the chemical industry makes, after ethylene.", sources: [{ label: 'Propylene', url: 'https://en.wikipedia.org/wiki/Propene', tier: 'referenced' }] },
    { id: 'polypropylene', name: 'Polyprop', icon: 'polypropylene', realm: 'everyday', blurb: "Polypropylene, as the trade calls it. Stiffer than polythene and it survives boiling, which is why the hot things in a kitchen are made of it.", sources: [{ label: 'Polypropylene', url: 'https://en.wikipedia.org/wiki/Polypropylene', tier: 'referenced' }] },
    { id: 'rope', name: 'Rope', icon: 'rope', realm: 'everyday', blurb: "Strands twisted one way and the rope the other. Pull it and the two twists fight each other, so it tightens instead of unwinding.", sources: [{ label: 'Rope', url: 'https://en.wikipedia.org/wiki/Rope', tier: 'referenced' }] },
    { id: 'acetylene', name: 'Acetylene', icon: 'acetylene', realm: 'everyday', blurb: "Lime and coke fused into carbide, which fizzes into gas the moment it touches water. Miners carried lamps that worked exactly like that.", sources: [{ label: 'Acetylene', url: 'https://en.wikipedia.org/wiki/Acetylene', tier: 'referenced' }] },
    { id: 'welded_steel', name: 'Welded Steel', icon: 'welded_steel', realm: 'everyday', blurb: "An acetylene flame burns hot enough to melt steel, so two pieces become one piece rather than two pieces held together.", sources: [{ label: 'Oxy-fuel welding and cutting', url: 'https://en.wikipedia.org/wiki/Oxy-fuel_welding_and_cutting', tier: 'referenced' }] },
    { id: 'steel_frame', name: 'Steel Frame', icon: 'steel_frame', realm: 'everyday', blurb: "The skeleton. Once the frame carries the load the walls carry nothing, which is the whole reason buildings got tall.", sources: [{ label: 'Steel frame', url: 'https://en.wikipedia.org/wiki/Steel_frame', tier: 'referenced' }] },
    { id: 'glass_pane', name: 'Glass Pane', icon: 'glass_pane', realm: 'everyday', blurb: "Molten glass poured onto molten tin spreads dead flat by itself. Before that every flat sheet had to be ground and polished.", sources: [{ label: 'Float glass', url: 'https://en.wikipedia.org/wiki/Float_glass', tier: 'referenced' }] },
    { id: 'window', name: 'Window', icon: 'window', realm: 'everyday', blurb: "A hole you can see through but not walk through, and not lose all your heat through either. It took about two thousand years to get right.", sources: [{ label: 'Window', url: 'https://en.wikipedia.org/wiki/Window', tier: 'referenced' }] },
    { id: 'mirror', name: 'Mirror', icon: 'mirror', realm: 'everyday', blurb: "A film of silver a few atoms thick on the back of the glass. The glass is only there to hold it flat.", sources: [{ label: 'Silvering', url: 'https://en.wikipedia.org/wiki/Silvering', tier: 'referenced' }] },
    { id: 'brick_wall', name: 'Brick Wall', icon: 'brick_wall', realm: 'everyday', blurb: "Bricks bedded in mortar with the joints staggered, so a crack has to go the long way round instead of straight down.", sources: [{ label: 'Brickwork', url: 'https://en.wikipedia.org/wiki/Brickwork', tier: 'referenced' }] },
    { id: 'plaster', name: 'Plaster', icon: 'plaster', realm: 'everyday', blurb: "Lime putty with a filler, spread thin. It hardens by taking carbon dioxide back out of the air, slowly, for years.", sources: [{ label: 'Plaster', url: 'https://en.wikipedia.org/wiki/Plaster', tier: 'referenced' }] },
    { id: 'ink', name: 'Ink', icon: 'ink', realm: 'everyday', blurb: "Fine carbon held in gum. The recipe is about four thousand years old and it has not been improved on for black.", sources: [{ label: 'Ink', url: 'https://en.wikipedia.org/wiki/Ink', tier: 'referenced' }] },
    { id: 'newspaper', name: 'Newspaper', icon: 'newspaper', realm: 'everyday', blurb: "Ink lifted off a plate onto paper running past at speed. The press is why anyone outside a city could know what happened yesterday.", sources: [{ label: 'Printing press', url: 'https://en.wikipedia.org/wiki/Printing_press', tier: 'referenced' }] },

    // Batch 3: metals, electricity, light, machines. Referenced, zero cost.
    { id: 'copper_ore', name: 'Copper Ore', icon: 'copper_ore', realm: 'everyday', blurb: "Rock stained green by the copper inside it. Obvious enough that this was the first metal anyone worked out how to get.", sources: [{ label: 'Copper extraction', url: 'https://en.wikipedia.org/wiki/Copper_extraction', tier: 'referenced' }] },
    { id: 'copper', name: 'Copper', icon: 'copper', realm: 'everyday', blurb: "Charcoal pulls the oxygen off and the metal is left. Soft, red, and it carries electricity better than anything except silver.", sources: [{ label: 'Smelting', url: 'https://en.wikipedia.org/wiki/Smelting', tier: 'referenced' }] },
    { id: 'bronze', name: 'Bronze', icon: 'bronze', realm: 'everyday', blurb: "Copper with a little tin in it. Harder than either on its own, and it was the best material on earth for two thousand years.", sources: [{ label: 'Bronze', url: 'https://en.wikipedia.org/wiki/Bronze', tier: 'referenced' }] },
    { id: 'copper_wire', name: 'Copper Wire', icon: 'copper_wire', realm: 'everyday', blurb: "Pulled through a hole, then a smaller one, then a smaller one. The plate has to be harder than the wire, which is what steel is for.", sources: [{ label: 'Wire drawing', url: 'https://en.wikipedia.org/wiki/Wire_drawing', tier: 'referenced' }] },
    { id: 'insulated_wire', name: 'Insulated Wire', icon: 'insulated_wire', realm: 'everyday', blurb: "The conductor is the easy part. Keeping it apart from everything else it touches is the part that took a century to get right.", sources: [{ label: 'Electrical wiring', url: 'https://en.wikipedia.org/wiki/Electrical_wiring', tier: 'referenced' }] },
    { id: 'electromagnet', name: 'Magnet Coil', icon: 'electromagnet', realm: 'everyday', blurb: "An electromagnet: a coil round an iron core. Current makes it a magnet, stopping the current stops it, and a magnet you can switch off changed everything.", sources: [{ label: 'Electromagnet', url: 'https://en.wikipedia.org/wiki/Electromagnet', tier: 'referenced' }] },
    { id: 'electric_motor', name: 'Electric Motor', icon: 'electric_motor', realm: 'everyday', blurb: "A magnet switched just before it settles, over and over, so it never quite stops turning.", sources: [{ label: 'Electric motor', url: 'https://en.wikipedia.org/wiki/Electric_motor', tier: 'referenced' }] },
    { id: 'generator', name: 'Generator', icon: 'generator', realm: 'everyday', blurb: "A motor run backwards. Feed it current and it turns; turn it and it gives current back.", sources: [{ label: 'Electric generator', url: 'https://en.wikipedia.org/wiki/Electric_generator', tier: 'referenced' }] },
    { id: 'battery', name: 'Battery', icon: 'battery', realm: 'everyday', blurb: "Two different metals in something that conducts. The metals do the work and the liquid only carries it between them.", sources: [{ label: 'Electric battery', url: 'https://en.wikipedia.org/wiki/Electric_battery', tier: 'referenced' }] },
    { id: 'filament', name: 'Filament', icon: 'filament', realm: 'everyday', blurb: "A thread thin enough that current heats it white rather than merely warm. Edison's first ones were carbonised bamboo.", sources: [{ label: 'Incandescent light bulb', url: 'https://en.wikipedia.org/wiki/Incandescent_light_bulb', tier: 'referenced' }] },
    { id: 'light_bulb', name: 'Light Bulb', icon: 'light_bulb', realm: 'everyday', blurb: "The glass is not there to shape the light. It is there to keep the air out, or the filament burns away in seconds.", sources: [{ label: 'Incandescent light bulb', url: 'https://en.wikipedia.org/wiki/Incandescent_light_bulb', tier: 'referenced' }] },
    { id: 'lamp', name: 'Lamp', icon: 'lamp', realm: 'everyday', blurb: "A bulb, a holder, a switch and a flex. The first thing most houses were ever wired for.", sources: [{ label: 'Electric light', url: 'https://en.wikipedia.org/wiki/Electric_light', tier: 'referenced' }] },
    { id: 'silicon', name: 'Silicon', icon: 'silicon', realm: 'everyday', blurb: "Sand and carbon in an arc furnace. The oxygen leaves with the carbon and what is left is the second most common element in the crust.", sources: [{ label: 'Silicon', url: 'https://en.wikipedia.org/wiki/Silicon', tier: 'referenced' }] },
    { id: 'silicon_wafer', name: 'Silicon Wafer', icon: 'silicon_wafer', realm: 'everyday', blurb: "A single crystal pulled slowly out of the melt, sawn into discs, and polished flat to within a few atoms.", sources: [{ label: 'Wafer (electronics)', url: 'https://en.wikipedia.org/wiki/Wafer_(electronics)', tier: 'referenced' }] },
    { id: 'microchip', name: 'Microchip', icon: 'microchip', realm: 'everyday', blurb: "A pattern printed with light, etched away, and repeated in layers. Everything electronic you own is this and almost nothing else.", sources: [{ label: 'Integrated circuit', url: 'https://en.wikipedia.org/wiki/Integrated_circuit', tier: 'referenced' }] },
    { id: 'circuit_board', name: 'Circuit Board', icon: 'circuit_board', realm: 'everyday', blurb: "Copper tracks printed on a board instead of wires in a loom. That swap is most of why electronics got small.", sources: [{ label: 'Printed circuit board', url: 'https://en.wikipedia.org/wiki/Printed_circuit_board', tier: 'referenced' }] },
    { id: 'phone', name: 'Phone', icon: 'phone', realm: 'everyday', blurb: "Sand, oil and ore, arranged carefully enough to fit in a pocket and reach the other side of the world.", sources: [{ label: 'Mobile phone', url: 'https://en.wikipedia.org/wiki/Mobile_phone', tier: 'referenced' }] },
    { id: 'solar_cell', name: 'Solar Cell', icon: 'solar_cell', realm: 'everyday', blurb: "Silicon with a deliberate impurity, so light knocks an electron somewhere it cannot easily get back from.", sources: [{ label: 'Solar cell', url: 'https://en.wikipedia.org/wiki/Solar_cell', tier: 'referenced' }] },
    { id: 'steel_spring', name: 'Steel Spring', icon: 'steel_spring', realm: 'everyday', blurb: "Tempered so it bends a long way and comes back every time. Clocks, cars and mattresses all run on it.", sources: [{ label: 'Spring (device)', url: 'https://en.wikipedia.org/wiki/Spring_(device)', tier: 'referenced' }] },
    { id: 'bearing', name: 'Bearing', icon: 'bearing', realm: 'everyday', blurb: "Hardened balls in a race. It swaps sliding for rolling, which is most of why machines stopped wearing themselves out.", sources: [{ label: 'Bearing (mechanical)', url: 'https://en.wikipedia.org/wiki/Bearing_(mechanical)', tier: 'referenced' }] },
    { id: 'bicycle', name: 'Bicycle', icon: 'bicycle', realm: 'everyday', blurb: "The most efficient way a person has ever found to move themselves. Nothing with an engine comes close per unit of energy.", sources: [{ label: 'Bicycle', url: 'https://en.wikipedia.org/wiki/Bicycle', tier: 'referenced' }] },
    { id: 'gear', name: 'Gear', icon: 'gear', realm: 'everyday', blurb: "Teeth shaped so the next pair is already carrying before the last one lets go, or the whole thing clatters itself apart.", sources: [{ label: 'Gear', url: 'https://en.wikipedia.org/wiki/Gear', tier: 'referenced' }] },
    { id: 'clock', name: 'Clock', icon: 'clock', realm: 'everyday', blurb: "A spring wants to unwind all at once. An escapement lets it go one tick at a time, and that is the entire invention.", sources: [{ label: 'Clock', url: 'https://en.wikipedia.org/wiki/Clock', tier: 'referenced' }] },
    { id: 'engine', name: 'Engine', icon: 'engine', realm: 'everyday', blurb: "Fuel burned inside the cylinder instead of under a boiler. That is what made a vehicle small enough for one person to drive.", sources: [{ label: 'Internal combustion engine', url: 'https://en.wikipedia.org/wiki/Internal_combustion_engine', tier: 'referenced' }] },
    { id: 'car', name: 'Car', icon: 'car', realm: 'everyday', blurb: "About thirty thousand parts. Nearly every chain in this game runs into it somewhere, which is rather the point.", sources: [{ label: 'Car', url: 'https://en.wikipedia.org/wiki/Car', tier: 'referenced' }] },

    // Batch 4: sound, sport, cloth, kitchen. Referenced, zero cost.
    { id: 'speaker', name: 'Speaker', icon: 'speaker', realm: 'everyday', blurb: "A coil in a magnetic field, glued to a paper cone. Current moves the coil, the coil moves the air, and that is all sound is.", sources: [{ label: 'Loudspeaker', url: 'https://en.wikipedia.org/wiki/Loudspeaker', tier: 'referenced' }] },
    { id: 'microphone', name: 'Microphone', icon: 'microphone', realm: 'everyday', blurb: "A speaker run backwards. Air moves the coil and the coil makes current; it is the same machine facing the other way.", sources: [{ label: 'Microphone', url: 'https://en.wikipedia.org/wiki/Microphone', tier: 'referenced' }] },
    { id: 'headphones', name: 'Headphones', icon: 'headphones', realm: 'everyday', blurb: "Two very small speakers held close to the ear, where a few thousandths of a watt is already loud.", sources: [{ label: 'Headphones', url: 'https://en.wikipedia.org/wiki/Headphones', tier: 'referenced' }] },
    { id: 'record', name: 'Record', icon: 'record', realm: 'everyday', blurb: "A groove whose wiggle is the waveform itself. Nothing is encoded and nothing is decoded — the shape in the plastic is the sound.", sources: [{ label: 'Phonograph record', url: 'https://en.wikipedia.org/wiki/Phonograph_record', tier: 'referenced' }] },
    { id: 'wire_mesh', name: 'Wire Mesh', icon: 'wire_mesh', realm: 'everyday', blurb: "Wire woven on a loom like cloth. Strong in every direction, and open enough to see and breathe through.", sources: [{ label: 'Wire mesh', url: 'https://en.wikipedia.org/wiki/Mesh', tier: 'referenced' }] },
    { id: 'fencing_mask', name: 'Fencing Mask', icon: 'fencing_mask', realm: 'everyday', blurb: "Mesh fine enough that a blade cannot pass and open enough to see out of, on a padded bib that takes the hit.", sources: [{ label: 'Fencing', url: 'https://en.wikipedia.org/wiki/Fencing', tier: 'referenced' }] },
    { id: 'fencing_blade', name: 'Fencing Blade', icon: 'fencing_blade', realm: 'everyday', blurb: "Tempered to bend right over rather than snap. A blade that snaps at speed is the dangerous one, so it is made to give.", sources: [{ label: 'Foil (fencing)', url: 'https://en.wikipedia.org/wiki/Foil_(fencing)', tier: 'referenced' }] },
    { id: 'fencing_kit', name: 'Fencing Kit', icon: 'fencing_kit', realm: 'everyday', blurb: "Mask, jacket, glove, blade. The whole sport is an argument about how to make a knife fight safe enough to have on purpose.", sources: [{ label: 'Fencing', url: 'https://en.wikipedia.org/wiki/Fencing', tier: 'referenced' }] },
    { id: 'wool', name: 'Wool', icon: 'wool', realm: 'everyday', blurb: "A fleece off in one piece. The fibres are crimped, so they trap air, which is why it still keeps you warm soaked through.", sources: [{ label: 'Wool', url: 'https://en.wikipedia.org/wiki/Wool', tier: 'referenced' }] },
    { id: 'felt', name: 'Felt', icon: 'felt', realm: 'everyday', blurb: "Wool worked hot until the scales on each fibre hook into each other. The oldest fabric there is, and nobody wove it.", sources: [{ label: 'Felt', url: 'https://en.wikipedia.org/wiki/Felt', tier: 'referenced' }] },
    { id: 'woollen_yarn', name: 'Woollen Yarn', icon: 'woollen_yarn', realm: 'everyday', blurb: "The same twist that makes cordage out of plant fibre, applied to an animal one.", sources: [{ label: 'Yarn', url: 'https://en.wikipedia.org/wiki/Yarn', tier: 'referenced' }] },
    { id: 'jumper', name: 'Jumper', icon: 'jumper', realm: 'everyday', blurb: "Loops through loops, so it stretches. Woven cloth cannot, which is why a knitted sleeve bends at the elbow and a shirt creases.", sources: [{ label: 'Sweater', url: 'https://en.wikipedia.org/wiki/Sweater', tier: 'referenced' }] },
    { id: 'flax', name: 'Flax', icon: 'flax', realm: 'everyday', blurb: "Grown for the stem and not the seed. The fibre runs the entire length of the plant, which is why linen is so strong.", sources: [{ label: 'Flax', url: 'https://en.wikipedia.org/wiki/Flax', tier: 'referenced' }] },
    { id: 'retted_flax', name: 'Retted Flax', icon: 'retted_flax', realm: 'everyday', blurb: "Left in water until bacteria rot away everything holding the fibre to the stem. Days of decay, on purpose, watched carefully.", sources: [{ label: 'Retting', url: 'https://en.wikipedia.org/wiki/Retting', tier: 'referenced' }] },
    { id: 'linen', name: 'Linen', icon: 'linen', realm: 'everyday', blurb: "Cool, strong, and it creases if you look at it. Egyptians wrapped their dead in it and the cloth is still readable.", sources: [{ label: 'Linen', url: 'https://en.wikipedia.org/wiki/Linen', tier: 'referenced' }] },
    { id: 'flour', name: 'Flour', icon: 'flour', realm: 'everyday', blurb: "Grain crushed between stones. The mill is why so much of Europe uses the same word for it.", sources: [{ label: 'Flour', url: 'https://en.wikipedia.org/wiki/Flour', tier: 'referenced' }] },
    { id: 'dough', name: 'Dough', icon: 'dough', realm: 'everyday', blurb: "Working it lines the proteins up into sheets that can hold gas. That sheet is the only difference between dough and paste.", sources: [{ label: 'Dough', url: 'https://en.wikipedia.org/wiki/Dough', tier: 'referenced' }] },
    { id: 'bread', name: 'Bread', icon: 'bread', realm: 'everyday', blurb: "The gas expands, the protein sets around it, and the crust browns because sugar and protein react in the heat.", sources: [{ label: 'Bread', url: 'https://en.wikipedia.org/wiki/Bread', tier: 'referenced' }] },
    { id: 'beer', name: 'Beer', icon: 'beer', realm: 'everyday', blurb: "Starch to sugar, sugar to alcohol. Older than bread in some places, and for most of history safer than the water.", sources: [{ label: 'Beer', url: 'https://en.wikipedia.org/wiki/Beer', tier: 'referenced' }] },
    { id: 'vinegar', name: 'Vinegar', icon: 'vinegar', realm: 'everyday', blurb: "Alcohol left open to the air until a second bacterium finishes what the first started. The name is French for sour wine.", sources: [{ label: 'Vinegar', url: 'https://en.wikipedia.org/wiki/Vinegar', tier: 'referenced' }] },
    { id: 'knife', name: 'Knife', icon: 'knife', realm: 'everyday', blurb: "Hard enough to hold an edge, with a handle so it is not just a sharp stone. The oldest tool that is still the same tool.", sources: [{ label: 'Knife', url: 'https://en.wikipedia.org/wiki/Knife', tier: 'referenced' }] },
    { id: 'pot', name: 'Pot', icon: 'pot', realm: 'everyday', blurb: "Clay shaped wet, dried, then fired until the particles fuse and it can never be clay again.", sources: [{ label: 'Pottery', url: 'https://en.wikipedia.org/wiki/Pottery', tier: 'referenced' }] },
    { id: 'glaze', name: 'Glaze', icon: 'glaze', realm: 'everyday', blurb: "Ash melting on the surface into a thin skin of glass. The first ones were accidents in wood-fired kilns.", sources: [{ label: 'Ceramic glaze', url: 'https://en.wikipedia.org/wiki/Ceramic_glaze', tier: 'referenced' }] },
    { id: 'candle_lantern', name: 'Lantern', icon: 'candle_lantern', realm: 'everyday', blurb: "A flame you can carry outside. The glass is there to keep the wind off, not to make it brighter.", sources: [{ label: 'Lantern', url: 'https://en.wikipedia.org/wiki/Lantern', tier: 'referenced' }] },
    { id: 'soap_bar', name: 'Washing Soda', icon: 'soap_bar', realm: 'everyday', blurb: "Alkali in water, softening it by pulling the calcium out. Hard water is why soap sometimes refuses to lather.", sources: [{ label: 'Sodium carbonate', url: 'https://en.wikipedia.org/wiki/Sodium_carbonate', tier: 'referenced' }] },

    // Batch 5: medicine, navigation, the sea, the sky. Referenced, zero cost.
    { id: 'willow_bark', name: 'Willow Bark', icon: 'willow_bark', realm: 'everyday', blurb: "Chewed for pain for at least four thousand years before anyone could say why it worked. The answer was in the bark the whole time.", sources: [{ label: 'Salicylic acid', url: 'https://en.wikipedia.org/wiki/Salicylic_acid', tier: 'referenced' }] },
    { id: 'aspirin', name: 'Aspirin', icon: 'aspirin', realm: 'everyday', blurb: "The willow compound with an acetyl group stuck on, which is what stops it burning a hole in your stomach.", sources: [{ label: 'Aspirin', url: 'https://en.wikipedia.org/wiki/Aspirin', tier: 'referenced' }] },
    { id: 'antiseptic', name: 'Antiseptic', icon: 'antiseptic', realm: 'everyday', blurb: "Neat alcohol is worse than diluted. The water lets it through the cell wall before the protein sets and seals the way in.", sources: [{ label: 'Antiseptic', url: 'https://en.wikipedia.org/wiki/Antiseptic', tier: 'referenced' }] },
    { id: 'bandage', name: 'Bandage', icon: 'bandage', realm: 'everyday', blurb: "Clean cloth over a wound. The idea is younger than the steam engine, and it saved more lives than most of the chemistry in this game.", sources: [{ label: 'Bandage', url: 'https://en.wikipedia.org/wiki/Bandage', tier: 'referenced' }] },
    { id: 'lodestone', name: 'Lodestone', icon: 'lodestone', realm: 'everyday', blurb: "Iron ore that arrived already magnetised. Lightning strikes are still the leading theory for how.", sources: [{ label: 'Lodestone', url: 'https://en.wikipedia.org/wiki/Lodestone', tier: 'referenced' }] },
    { id: 'compass', name: 'Compass', icon: 'compass', realm: 'everyday', blurb: "A needle stroked on a lodestone and floated. It works because the entire planet is a weak magnet, which nobody knew at the time.", sources: [{ label: 'Compass', url: 'https://en.wikipedia.org/wiki/Compass', tier: 'referenced' }] },
    { id: 'sextant', name: 'Sextant', icon: 'sextant', realm: 'everyday', blurb: "Two mirrors bring the sun down to meet the horizon, so the angle can be measured from a deck that will not stay still.", sources: [{ label: 'Sextant', url: 'https://en.wikipedia.org/wiki/Sextant', tier: 'referenced' }] },
    { id: 'chronometer', name: 'Chronometer', icon: 'chronometer', realm: 'everyday', blurb: "A clock that keeps time at sea gives you longitude. It took forty years and a national prize before one existed.", sources: [{ label: 'Marine chronometer', url: 'https://en.wikipedia.org/wiki/Marine_chronometer', tier: 'referenced' }] },
    { id: 'pitch', name: 'Pitch', icon: 'pitch', realm: 'everyday', blurb: "Tar boiled until it sets hard when cold. Every wooden ship that ever floated depended on it and on somebody watching the pot.", sources: [{ label: 'Pitch (resin)', url: 'https://en.wikipedia.org/wiki/Pitch_(resin)', tier: 'referenced' }] },
    { id: 'sail', name: 'Sail', icon: 'sail', realm: 'everyday', blurb: "Cloth strong enough to hold wind, with the seams running the way the load runs rather than the way the cloth came.", sources: [{ label: 'Sail', url: 'https://en.wikipedia.org/wiki/Sail', tier: 'referenced' }] },
    { id: 'boat', name: 'Boat', icon: 'boat', realm: 'everyday', blurb: "Planks, and the stuff that keeps water out of the gaps between them. The second half is the harder half.", sources: [{ label: 'Caulk', url: 'https://en.wikipedia.org/wiki/Caulk', tier: 'referenced' }] },
    { id: 'ship', name: 'Ship', icon: 'ship', realm: 'everyday', blurb: "Once it can sail into the wind rather than only along it, every coast on earth is reachable from every other.", sources: [{ label: 'Sailing ship', url: 'https://en.wikipedia.org/wiki/Sailing_ship', tier: 'referenced' }] },
    { id: 'steam_boiler', name: 'Steam Boiler', icon: 'steam_boiler', realm: 'everyday', blurb: "Water heated in a sealed vessel until the steam has to go somewhere. The riveting is what decides whether that is useful or fatal.", sources: [{ label: 'Boiler', url: 'https://en.wikipedia.org/wiki/Boiler', tier: 'referenced' }] },
    { id: 'steam_engine', name: 'Steam Engine', icon: 'steam_engine', realm: 'everyday', blurb: "Steam pushes a piston and the piston turns a wheel. This machine is what the industrial revolution actually was.", sources: [{ label: 'Steam engine', url: 'https://en.wikipedia.org/wiki/Steam_engine', tier: 'referenced' }] },
    { id: 'rail', name: 'Rail', icon: 'rail', realm: 'everyday', blurb: "A smooth steel wheel on a smooth steel rail has almost no rolling resistance, which is the only reason a train can be that heavy.", sources: [{ label: 'Rail track', url: 'https://en.wikipedia.org/wiki/Track_(rail_transport)', tier: 'referenced' }] },
    { id: 'locomotive', name: 'Locomotive', icon: 'locomotive', realm: 'everyday', blurb: "The first machine that let an ordinary person travel faster than a horse for a whole day rather than a few minutes.", sources: [{ label: 'Locomotive', url: 'https://en.wikipedia.org/wiki/Locomotive', tier: 'referenced' }] },
    { id: 'alloy_frame', name: 'Alloy Frame', icon: 'alloy_frame', realm: 'everyday', blurb: "Aluminium is a third the weight of steel for the same stiffness if the shape is right. That sentence is the entire argument for flight.", sources: [{ label: 'Aluminium alloy', url: 'https://en.wikipedia.org/wiki/Aluminium_alloy', tier: 'referenced' }] },
    { id: 'propeller', name: 'Propeller', icon: 'propeller', realm: 'everyday', blurb: "A wing that goes round instead of forward, so it pulls rather than lifts. Same physics, turned ninety degrees.", sources: [{ label: 'Propeller', url: 'https://en.wikipedia.org/wiki/Propeller', tier: 'referenced' }] },
    { id: 'aeroplane', name: 'Aeroplane', icon: 'aeroplane', realm: 'everyday', blurb: "A wing, something to pull it, and a way to steer in three directions at once. The third part is what took everyone so long.", sources: [{ label: 'Airplane', url: 'https://en.wikipedia.org/wiki/Airplane', tier: 'referenced' }] },
    { id: 'liquid_oxygen', name: 'Liquid Oxygen', icon: 'liquid_oxygen', realm: 'everyday', blurb: "Air chilled until the oxygen turns to a pale blue liquid. It is the only practical way to carry enough of it to burn in a vacuum.", sources: [{ label: 'Liquid oxygen', url: 'https://en.wikipedia.org/wiki/Liquid_oxygen', tier: 'referenced' }] },
    { id: 'rocket_engine', name: 'Rocket Engine', icon: 'rocket_engine', realm: 'everyday', blurb: "It brings its own oxygen. That is the only real difference between an engine and a rocket engine.", sources: [{ label: 'Rocket engine', url: 'https://en.wikipedia.org/wiki/Rocket_engine', tier: 'referenced' }] },
    { id: 'rocket', name: 'Rocket', icon: 'rocket', realm: 'everyday', blurb: "Mostly fuel tank. Going up is the easy part; going sideways fast enough to keep missing the ground is the hard one.", sources: [{ label: 'Rocket', url: 'https://en.wikipedia.org/wiki/Rocket', tier: 'referenced' }] },
    { id: 'satellite', name: 'Satellite', icon: 'satellite', realm: 'everyday', blurb: "Solar cells because there is nowhere to plug in, and nothing at all to stop it falling round the earth forever.", sources: [{ label: 'Satellite', url: 'https://en.wikipedia.org/wiki/Satellite', tier: 'referenced' }] },
    { id: 'radio', name: 'Radio', icon: 'radio', realm: 'everyday', blurb: "A wire long enough to catch a wave, and a circuit that answers to one frequency and ignores every other.", sources: [{ label: 'Radio receiver', url: 'https://en.wikipedia.org/wiki/Radio_receiver', tier: 'referenced' }] },
    { id: 'camera', name: 'Camera', icon: 'camera', realm: 'everyday', blurb: "Something to gather the light and something to remember where it landed. For a century and a half the second part was silver.", sources: [{ label: 'Camera', url: 'https://en.wikipedia.org/wiki/Camera', tier: 'referenced' }] },
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
    /*
     * A SECOND ROAD TO CORDAGE, and it is here because the game told us.
     *
     * Combining the spindle with plant fibre in Survival got "that's actually
     * real: a rotating spindle twists loose plant fibres into strong
     * continuous strands" — which is the adjudicator doing exactly its job,
     * reporting a real transformation the graph did not have. It costs no new
     * element and it is how thread has been made for about nine thousand
     * years, so the honest answer was to add the recipe rather than to explain
     * the gap away.
     */
    {
      inputs: ['spindle', 'plant_fibre'],
      output: 'cordage',
      route: 'spun',
      process: 'spinning',
      cost: ZERO_COST,
      sources: [{ label: 'Spindle (textiles)', url: 'https://en.wikipedia.org/wiki/Spindle_(textiles)', tier: 'referenced' }],
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
      // The model, asked about iron ore and natural gas, said it was real. It
      // is: direct reduction is how a large and growing share of the world's
      // iron is made, and it is the route that does not need a blast furnace.
      inputs: ['iron_ore', 'natural_gas'],
      output: 'pig_iron',
      process: 'direct reduction',
      route: 'gas',
      cost: ZERO_COST,
      sources: [{ label: 'Direct reduced iron', url: 'https://en.wikipedia.org/wiki/Direct_reduced_iron' }],
    },
    {
      // Solvay's actual inputs are brine and limestone; the quicklime route
      // already in the game is the same cycle seen a step later. Both are real
      // and the receipt records which one you took.
      inputs: ['limestone', 'salt'],
      output: 'soda_ash',
      process: 'the Solvay process',
      route: 'brine and limestone',
      cost: ZERO_COST,
      sources: [{ label: 'Solvay process', url: 'https://en.wikipedia.org/wiki/Solvay_process' }],
    },
    {
      inputs: ['quicklime', 'pig_iron'],
      output: 'wrought_iron',
      process: 'refining',
      cost: ZERO_COST,
      sources: [{ label: 'Finery forge', url: 'https://en.wikipedia.org/wiki/Finery_forge' }],
    },
    {
      inputs: ['wrought_iron', 'charcoal'],
      output: 'high_carbon_steel',
      process: 'blister steelmaking',
      route: 'cementation',
      cost: ZERO_COST,
      sources: [{ label: 'Cementation process', url: 'https://en.wikipedia.org/wiki/Cementation_process' }],
    },
    {
      inputs: ['sodium_hydroxide', 'cotton_jersey'],
      output: 'mercerised_cotton',
      process: 'mercerising',
      cost: ZERO_COST,
      sources: [{ label: 'Mercerised cotton', url: 'https://en.wikipedia.org/wiki/Mercerised_cotton' }],
    },
    {
      inputs: ['mercerised_cotton', 'dye'],
      output: 'dyed_cotton_fabric',
      process: 'dyeing',
      route: 'mercerised',
      cost: { waterL: 380, co2kg: 0 },
      sources: [{ label: 'The Water Footprint of Cotton Consumption', url: 'https://waterfootprint.org/resources/Report18.pdf' }],
    },
    {
      inputs: ['soil', 'water'],
      output: 'clay',
      process: 'washing',
      cost: ZERO_COST,
      sources: [{ label: 'Clay', url: 'https://en.wikipedia.org/wiki/Clay' }],
    },
    {
      // Firing clay is about 0.21 kg CO2 per kg of brick from the kiln fuel. A\n      // standard brick is around 2.7 kg, so this is charged per kilogram and the\n      // blurb says so rather than pretending a brick is the unit.
      inputs: ['clay', 'fire'],
      output: 'brick',
      process: 'firing',
      cost: { waterL: 0, co2kg: 0.21 },
      sources: [{ label: 'Brick', url: 'https://en.wikipedia.org/wiki/Brick' }],
    },
    {
      inputs: ['quicklime', 'water'],
      output: 'slaked_lime',
      process: 'slaking',
      cost: ZERO_COST,
      sources: [{ label: 'Calcium hydroxide', url: 'https://en.wikipedia.org/wiki/Calcium_hydroxide' }],
    },
    {
      inputs: ['slaked_lime', 'silica_sand'],
      output: 'lime_mortar',
      process: 'mixing',
      cost: ZERO_COST,
      sources: [{ label: 'Lime mortar', url: 'https://en.wikipedia.org/wiki/Lime_mortar' }],
    },
    {
      inputs: ['limestone', 'clay'],
      output: 'raw_meal',
      process: 'grinding',
      cost: ZERO_COST,
      sources: [{ label: 'Portland cement', url: 'https://en.wikipedia.org/wiki/Portland_cement' }],
    },
    {
      // Roughly 0.9 kg of CO2 per kg of cement, of which about two thirds comes out\n      // of the limestone itself and cannot be avoided by burning cleaner fuel.\n      // Charged per kilogram, which is how the source states it.
      inputs: ['raw_meal', 'fire'],
      output: 'cement',
      process: 'calcining',
      cost: { waterL: 0, co2kg: 0.9 },
      sources: [{ label: 'Environmental impact of concrete', url: 'https://en.wikipedia.org/wiki/Environmental_impact_of_concrete' }],
    },
    {
      inputs: ['cement', 'silica_sand'],
      output: 'concrete',
      process: 'mixing',
      cost: ZERO_COST,
      sources: [{ label: 'Concrete', url: 'https://en.wikipedia.org/wiki/Concrete' }],
    },
    {
      inputs: ['wood', 'water'],
      output: 'wood_pulp',
      process: 'pulping',
      cost: ZERO_COST,
      sources: [{ label: 'Pulp (paper)', url: 'https://en.wikipedia.org/wiki/Pulp_(paper)' }],
    },
    {
      inputs: ['wood_pulp', 'high_carbon_steel'],
      output: 'paper',
      process: 'pressing',
      cost: ZERO_COST,
      sources: [{ label: 'Papermaking', url: 'https://en.wikipedia.org/wiki/Papermaking' }],
    },
    {
      inputs: ['charcoal', 'water'],
      output: 'filtered_water',
      process: 'filtering',
      cost: ZERO_COST,
      sources: [{ label: 'Carbon filtering', url: 'https://en.wikipedia.org/wiki/Carbon_filtering' }],
    },
    {
      // Concrete is cement plus aggregate, and the aggregate can be sand or it can\n      // be broken stone. Both are real and the receipt records which.
      inputs: ['stone', 'cement'],
      output: 'concrete',
      process: 'mixing',
      route: 'coarse aggregate',
      cost: ZERO_COST,
      sources: [{ label: 'Concrete', url: 'https://en.wikipedia.org/wiki/Concrete' }],
    },
    {
      inputs: ['bark', 'water'],
      output: 'tannin',
      process: 'soaking',
      cost: ZERO_COST,
      sources: [{ label: 'Tannin', url: 'https://en.wikipedia.org/wiki/Tannin' }],
    },
    {
      // The oldest way to colour cloth, and the same dilution water as the other\n      // dyeing routes, because the rinsing is the same problem whatever the dye.
      inputs: ['tannin', 'cotton_jersey'],
      output: 'dyed_cotton_fabric',
      process: 'dyeing',
      route: 'tannin',
      cost: { waterL: 380, co2kg: 0 },
      sources: [{ label: 'Tannin', url: 'https://en.wikipedia.org/wiki/Tannin' }],
    },
    {
      inputs: ['wood', 'soil'],
      output: 'compost',
      process: 'rotting',
      cost: ZERO_COST,
      sources: [{ label: 'Compost', url: 'https://en.wikipedia.org/wiki/Compost' }],
    },
    {
      // The point of this one is the comparison. Haber-Bosch and a compost heap\n      // both put nitrogen back into the ground, and the game now lets you take\n      // either road to the same field.
      inputs: ['compost', 'soil'],
      output: 'farmland',
      process: 'feeding',
      route: 'compost',
      cost: ZERO_COST,
      sources: [{ label: 'Compost', url: 'https://en.wikipedia.org/wiki/Compost' }],
    },
    {
      inputs: ['natural_gas', 'textile_waste'],
      output: 'syngas',
      process: 'gasifying',
      cost: ZERO_COST,
      sources: [{ label: 'Gasification', url: 'https://en.wikipedia.org/wiki/Gasification' }],
    },
    {
      // The water-gas shift: steam over the carbon monoxide gives more hydrogen,\n      // which is the same hydrogen Haber-Bosch wants. A second road to ammonia\n      // that starts from waste rather than from a gas well.
      inputs: ['syngas', 'water'],
      output: 'ammonia',
      process: 'shifting',
      route: 'gasification',
      cost: ZERO_COST,
      sources: [{ label: 'Syngas', url: 'https://en.wikipedia.org/wiki/Syngas' }],
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

    /*
     * The first batch through `npm run import`. Referenced citations, zero
     * cost — see the note above the elements they produce.
     */
    { inputs: ['bark', 'fire'], output: 'wood_ash', process: 'ashing', cost: ZERO_COST, sources: [{ label: 'Wood ash', url: 'https://en.wikipedia.org/wiki/Wood_ash', tier: 'referenced' }] },
    { inputs: ['wood_ash', 'water'], output: 'potash', process: 'leaching', cost: ZERO_COST, sources: [{ label: 'Potash', url: 'https://en.wikipedia.org/wiki/Potash', tier: 'referenced' }] },
    { inputs: ['sodium_hydroxide', 'beeswax'], output: 'soap', process: 'saponifying', cost: ZERO_COST, sources: [{ label: 'Saponification', url: 'https://en.wikipedia.org/wiki/Saponification', tier: 'referenced' }] },
    { inputs: ['pig_iron', 'limestone'], output: 'slag', process: 'fluxing', cost: ZERO_COST, sources: [{ label: 'Slag', url: 'https://en.wikipedia.org/wiki/Slag', tier: 'referenced' }] },
    { inputs: ['slag', 'cement'], output: 'slag_cement', process: 'grinding', cost: ZERO_COST, sources: [{ label: 'Ground granulated blast-furnace slag', url: 'https://en.wikipedia.org/wiki/Ground_granulated_blast-furnace_slag', tier: 'referenced' }] },
    { inputs: ['high_carbon_steel', 'water'], output: 'hardened_steel', process: 'quenching', cost: ZERO_COST, sources: [{ label: 'Quenching', url: 'https://en.wikipedia.org/wiki/Quenching', tier: 'referenced' }] },
    { inputs: ['hardened_steel', 'fire'], output: 'tempered_steel', process: 'tempering', cost: ZERO_COST, sources: [{ label: 'Tempering (metallurgy)', url: 'https://en.wikipedia.org/wiki/Tempering_(metallurgy)', tier: 'referenced' }] },
    { inputs: ['wood', 'wrought_iron'], output: 'plank', process: 'sawing', cost: ZERO_COST, sources: [{ label: 'Lumber', url: 'https://en.wikipedia.org/wiki/Lumber', tier: 'referenced' }] },
    { inputs: ['plank', 'wrought_iron'], output: 'cart_wheel', process: 'wheelwrighting', cost: ZERO_COST, sources: [{ label: 'Wheelwright', url: 'https://en.wikipedia.org/wiki/Wheelwright', tier: 'referenced' }] },
    { inputs: ['paper', 'sewing_thread'], output: 'book', process: 'bookbinding', cost: ZERO_COST, sources: [{ label: 'Bookbinding', url: 'https://en.wikipedia.org/wiki/Bookbinding', tier: 'referenced' }] },
    { inputs: ['paper', 'paper'], output: 'cardboard', process: 'corrugating', cost: ZERO_COST, sources: [{ label: 'Corrugated fiberboard', url: 'https://en.wikipedia.org/wiki/Corrugated_fiberboard', tier: 'referenced' }] },
    { inputs: ['concrete', 'high_carbon_steel'], output: 'reinforced_concrete', process: 'reinforcing', cost: ZERO_COST, sources: [{ label: 'Reinforced concrete', url: 'https://en.wikipedia.org/wiki/Reinforced_concrete', tier: 'referenced' }] },
    { inputs: ['slaked_lime', 'water'], output: 'whitewash', process: 'thinning', cost: ZERO_COST, sources: [{ label: 'Whitewash', url: 'https://en.wikipedia.org/wiki/Whitewash', tier: 'referenced' }] },

    // Batch 2.
    { inputs: ['distillate', 'water'], output: 'ethylene', process: 'steam cracking', cost: ZERO_COST, sources: [{ label: 'Cracking (chemistry)', url: 'https://en.wikipedia.org/wiki/Cracking_(chemistry)', tier: 'referenced' }] },
    { inputs: ['ethylene', 'ethylene'], output: 'polyethylene', process: 'polymerising', cost: ZERO_COST, sources: [{ label: 'Polyethylene', url: 'https://en.wikipedia.org/wiki/Polyethylene', tier: 'referenced' }] },
    { inputs: ['polyethylene', 'high_carbon_steel'], output: 'plastic_bottle', process: 'blow moulding', cost: ZERO_COST, sources: [{ label: 'Blow molding', url: 'https://en.wikipedia.org/wiki/Blow_molding', tier: 'referenced' }] },
    { inputs: ['ethylene', 'water'], output: 'ethanol', process: 'hydrating', cost: ZERO_COST, sources: [{ label: 'Ethanol', url: 'https://en.wikipedia.org/wiki/Ethanol', tier: 'referenced' }] },
    { inputs: ['ethanol', 'clay'], output: 'butadiene', process: 'coupling', cost: ZERO_COST, sources: [{ label: 'Butadiene', url: 'https://en.wikipedia.org/wiki/Butadiene', tier: 'referenced' }] },
    { inputs: ['butadiene', 'butadiene'], output: 'synthetic_rubber', process: 'polymerising', cost: ZERO_COST, sources: [{ label: 'Polybutadiene', url: 'https://en.wikipedia.org/wiki/Polybutadiene', tier: 'referenced' }] },
    { inputs: ['distillate', 'charcoal'], output: 'carbon_black', process: 'partial combustion', cost: ZERO_COST, sources: [{ label: 'Carbon black', url: 'https://en.wikipedia.org/wiki/Carbon_black', tier: 'referenced' }] },
    { inputs: ['synthetic_rubber', 'carbon_black'], output: 'tyre', process: 'compounding', cost: ZERO_COST, sources: [{ label: 'Tire', url: 'https://en.wikipedia.org/wiki/Tire', tier: 'referenced' }] },
    { inputs: ['ethylene', 'salt'], output: 'vinyl_chloride', process: 'oxychlorinating', cost: ZERO_COST, sources: [{ label: 'Vinyl chloride', url: 'https://en.wikipedia.org/wiki/Vinyl_chloride', tier: 'referenced' }] },
    { inputs: ['vinyl_chloride', 'vinyl_chloride'], output: 'pvc', process: 'polymerising', cost: ZERO_COST, sources: [{ label: 'Polyvinyl chloride', url: 'https://en.wikipedia.org/wiki/Polyvinyl_chloride', tier: 'referenced' }] },
    { inputs: ['pvc', 'high_carbon_steel'], output: 'pipe', process: 'extruding', cost: ZERO_COST, sources: [{ label: 'Extrusion', url: 'https://en.wikipedia.org/wiki/Extrusion', tier: 'referenced' }] },
    { inputs: ['distillate', 'quicklime'], output: 'propylene', process: 'dehydrogenating', cost: ZERO_COST, sources: [{ label: 'Propylene', url: 'https://en.wikipedia.org/wiki/Propene', tier: 'referenced' }] },
    { inputs: ['propylene', 'propylene'], output: 'polypropylene', process: 'polymerising', cost: ZERO_COST, sources: [{ label: 'Polypropylene', url: 'https://en.wikipedia.org/wiki/Polypropylene', tier: 'referenced' }] },
    { inputs: ['polypropylene', 'cordage'], output: 'rope', process: 'laying', cost: ZERO_COST, sources: [{ label: 'Rope', url: 'https://en.wikipedia.org/wiki/Rope', tier: 'referenced' }] },
    { inputs: ['quicklime', 'charcoal'], output: 'acetylene', process: 'carbide smelting', cost: ZERO_COST, sources: [{ label: 'Acetylene', url: 'https://en.wikipedia.org/wiki/Acetylene', tier: 'referenced' }] },
    { inputs: ['acetylene', 'high_carbon_steel'], output: 'welded_steel', process: 'welding', cost: ZERO_COST, sources: [{ label: 'Oxy-fuel welding and cutting', url: 'https://en.wikipedia.org/wiki/Oxy-fuel_welding_and_cutting', tier: 'referenced' }] },
    { inputs: ['welded_steel', 'reinforced_concrete'], output: 'steel_frame', process: 'erecting', cost: ZERO_COST, sources: [{ label: 'Steel frame', url: 'https://en.wikipedia.org/wiki/Steel_frame', tier: 'referenced' }] },
    { inputs: ['molten_glass', 'slag'], output: 'glass_pane', process: 'floating', cost: ZERO_COST, sources: [{ label: 'Float glass', url: 'https://en.wikipedia.org/wiki/Float_glass', tier: 'referenced' }] },
    { inputs: ['glass_pane', 'plank'], output: 'window', process: 'glazing', cost: ZERO_COST, sources: [{ label: 'Window', url: 'https://en.wikipedia.org/wiki/Window', tier: 'referenced' }] },
    { inputs: ['glass_pane', 'sodium_hydroxide'], output: 'mirror', process: 'silvering', cost: ZERO_COST, sources: [{ label: 'Silvering', url: 'https://en.wikipedia.org/wiki/Silvering', tier: 'referenced' }] },
    { inputs: ['brick', 'lime_mortar'], output: 'brick_wall', process: 'laying', cost: ZERO_COST, sources: [{ label: 'Brickwork', url: 'https://en.wikipedia.org/wiki/Brickwork', tier: 'referenced' }] },
    { inputs: ['slaked_lime', 'wood_ash'], output: 'plaster', process: 'gauging', cost: ZERO_COST, sources: [{ label: 'Plaster', url: 'https://en.wikipedia.org/wiki/Plaster', tier: 'referenced' }] },
    { inputs: ['carbon_black', 'tannin'], output: 'ink', process: 'grinding', cost: ZERO_COST, sources: [{ label: 'Ink', url: 'https://en.wikipedia.org/wiki/Ink', tier: 'referenced' }] },
    { inputs: ['ink', 'paper'], output: 'newspaper', process: 'printing', cost: ZERO_COST, sources: [{ label: 'Printing press', url: 'https://en.wikipedia.org/wiki/Printing_press', tier: 'referenced' }] },

    // Batch 3.
    { inputs: ['stone', 'sharp_stone'], output: 'copper_ore', process: 'prospecting', cost: ZERO_COST, sources: [{ label: 'Copper extraction', url: 'https://en.wikipedia.org/wiki/Copper_extraction', tier: 'referenced' }] },
    { inputs: ['copper_ore', 'charcoal'], output: 'copper', process: 'smelting', cost: ZERO_COST, sources: [{ label: 'Smelting', url: 'https://en.wikipedia.org/wiki/Smelting', tier: 'referenced' }] },
    { inputs: ['copper', 'slag'], output: 'bronze', process: 'alloying', cost: ZERO_COST, sources: [{ label: 'Bronze', url: 'https://en.wikipedia.org/wiki/Bronze', tier: 'referenced' }] },
    { inputs: ['copper', 'hardened_steel'], output: 'copper_wire', process: 'drawing', cost: ZERO_COST, sources: [{ label: 'Wire drawing', url: 'https://en.wikipedia.org/wiki/Wire_drawing', tier: 'referenced' }] },
    { inputs: ['copper_wire', 'pvc'], output: 'insulated_wire', process: 'sheathing', cost: ZERO_COST, sources: [{ label: 'Electrical wiring', url: 'https://en.wikipedia.org/wiki/Electrical_wiring', tier: 'referenced' }] },
    { inputs: ['insulated_wire', 'wrought_iron'], output: 'electromagnet', process: 'winding', cost: ZERO_COST, sources: [{ label: 'Electromagnet', url: 'https://en.wikipedia.org/wiki/Electromagnet', tier: 'referenced' }] },
    { inputs: ['electromagnet', 'tempered_steel'], output: 'electric_motor', process: 'assembling', cost: ZERO_COST, sources: [{ label: 'Electric motor', url: 'https://en.wikipedia.org/wiki/Electric_motor', tier: 'referenced' }] },
    { inputs: ['electric_motor', 'steel_frame'], output: 'generator', process: 'driving', cost: ZERO_COST, sources: [{ label: 'Electric generator', url: 'https://en.wikipedia.org/wiki/Electric_generator', tier: 'referenced' }] },
    { inputs: ['copper', 'sodium_hydroxide'], output: 'battery', process: 'stacking cells', cost: ZERO_COST, sources: [{ label: 'Electric battery', url: 'https://en.wikipedia.org/wiki/Electric_battery', tier: 'referenced' }] },
    { inputs: ['carbon_black', 'copper_wire'], output: 'filament', process: 'carbonising', cost: ZERO_COST, sources: [{ label: 'Incandescent light bulb', url: 'https://en.wikipedia.org/wiki/Incandescent_light_bulb', tier: 'referenced' }] },
    { inputs: ['filament', 'glass_bottle'], output: 'light_bulb', process: 'evacuating', cost: ZERO_COST, sources: [{ label: 'Incandescent light bulb', url: 'https://en.wikipedia.org/wiki/Incandescent_light_bulb', tier: 'referenced' }] },
    { inputs: ['light_bulb', 'insulated_wire'], output: 'lamp', process: 'wiring', cost: ZERO_COST, sources: [{ label: 'Electric light', url: 'https://en.wikipedia.org/wiki/Electric_light', tier: 'referenced' }] },
    { inputs: ['silica_sand', 'charcoal'], output: 'silicon', process: 'carbothermic reduction', cost: ZERO_COST, sources: [{ label: 'Silicon', url: 'https://en.wikipedia.org/wiki/Silicon', tier: 'referenced' }] },
    { inputs: ['silicon', 'hardened_steel'], output: 'silicon_wafer', process: 'slicing', cost: ZERO_COST, sources: [{ label: 'Wafer (electronics)', url: 'https://en.wikipedia.org/wiki/Wafer_(electronics)', tier: 'referenced' }] },
    { inputs: ['silicon_wafer', 'copper'], output: 'microchip', process: 'etching', cost: ZERO_COST, sources: [{ label: 'Integrated circuit', url: 'https://en.wikipedia.org/wiki/Integrated_circuit', tier: 'referenced' }] },
    { inputs: ['microchip', 'insulated_wire'], output: 'circuit_board', process: 'soldering', cost: ZERO_COST, sources: [{ label: 'Printed circuit board', url: 'https://en.wikipedia.org/wiki/Printed_circuit_board', tier: 'referenced' }] },
    { inputs: ['circuit_board', 'glass_pane'], output: 'phone', process: 'assembling', cost: ZERO_COST, sources: [{ label: 'Mobile phone', url: 'https://en.wikipedia.org/wiki/Mobile_phone', tier: 'referenced' }] },
    { inputs: ['silicon_wafer', 'glass_pane'], output: 'solar_cell', process: 'doping', cost: ZERO_COST, sources: [{ label: 'Solar cell', url: 'https://en.wikipedia.org/wiki/Solar_cell', tier: 'referenced' }] },
    { inputs: ['tempered_steel', 'copper_wire'], output: 'steel_spring', process: 'coiling', cost: ZERO_COST, sources: [{ label: 'Spring (device)', url: 'https://en.wikipedia.org/wiki/Spring_(device)', tier: 'referenced' }] },
    { inputs: ['hardened_steel', 'bronze'], output: 'bearing', process: 'grinding', cost: ZERO_COST, sources: [{ label: 'Bearing (mechanical)', url: 'https://en.wikipedia.org/wiki/Bearing_(mechanical)', tier: 'referenced' }] },
    { inputs: ['bearing', 'tyre'], output: 'bicycle', process: 'building', cost: ZERO_COST, sources: [{ label: 'Bicycle', url: 'https://en.wikipedia.org/wiki/Bicycle', tier: 'referenced' }] },
    { inputs: ['bronze', 'welded_steel'], output: 'gear', process: 'cutting teeth', cost: ZERO_COST, sources: [{ label: 'Gear', url: 'https://en.wikipedia.org/wiki/Gear', tier: 'referenced' }] },
    { inputs: ['gear', 'steel_spring'], output: 'clock', process: 'escaping', cost: ZERO_COST, sources: [{ label: 'Clock', url: 'https://en.wikipedia.org/wiki/Clock', tier: 'referenced' }] },
    { inputs: ['gear', 'distillate'], output: 'engine', process: 'firing', cost: ZERO_COST, sources: [{ label: 'Internal combustion engine', url: 'https://en.wikipedia.org/wiki/Internal_combustion_engine', tier: 'referenced' }] },
    { inputs: ['engine', 'bicycle'], output: 'car', process: 'assembling', cost: ZERO_COST, sources: [{ label: 'Car', url: 'https://en.wikipedia.org/wiki/Car', tier: 'referenced' }] },

    // Batch 4.
    { inputs: ['electromagnet', 'paper'], output: 'speaker', process: 'coning', cost: ZERO_COST, sources: [{ label: 'Loudspeaker', url: 'https://en.wikipedia.org/wiki/Loudspeaker', tier: 'referenced' }] },
    { inputs: ['speaker', 'copper_wire'], output: 'microphone', process: 'reversing', cost: ZERO_COST, sources: [{ label: 'Microphone', url: 'https://en.wikipedia.org/wiki/Microphone', tier: 'referenced' }] },
    { inputs: ['speaker', 'steel_spring'], output: 'headphones', process: 'assembling', cost: ZERO_COST, sources: [{ label: 'Headphones', url: 'https://en.wikipedia.org/wiki/Headphones', tier: 'referenced' }] },
    { inputs: ['pvc', 'microphone'], output: 'record', process: 'cutting', cost: ZERO_COST, sources: [{ label: 'Phonograph record', url: 'https://en.wikipedia.org/wiki/Phonograph_record', tier: 'referenced' }] },
    { inputs: ['copper_wire', 'hardened_steel'], output: 'wire_mesh', process: 'weaving', cost: ZERO_COST, sources: [{ label: 'Wire mesh', url: 'https://en.wikipedia.org/wiki/Mesh', tier: 'referenced' }] },
    { inputs: ['wire_mesh', 'cotton_jersey'], output: 'fencing_mask', process: 'shaping', cost: ZERO_COST, sources: [{ label: 'Fencing', url: 'https://en.wikipedia.org/wiki/Fencing', tier: 'referenced' }] },
    { inputs: ['tempered_steel', 'hardened_steel'], output: 'fencing_blade', process: 'forging', cost: ZERO_COST, sources: [{ label: 'Foil (fencing)', url: 'https://en.wikipedia.org/wiki/Foil_(fencing)', tier: 'referenced' }] },
    { inputs: ['fencing_mask', 'fencing_blade'], output: 'fencing_kit', process: 'kitting out', cost: ZERO_COST, sources: [{ label: 'Fencing', url: 'https://en.wikipedia.org/wiki/Fencing', tier: 'referenced' }] },
    { inputs: ['farmland', 'sharp_stone'], output: 'wool', process: 'shearing', cost: ZERO_COST, sources: [{ label: 'Wool', url: 'https://en.wikipedia.org/wiki/Wool', tier: 'referenced' }] },
    { inputs: ['wool', 'water'], output: 'felt', process: 'fulling', cost: ZERO_COST, sources: [{ label: 'Felt', url: 'https://en.wikipedia.org/wiki/Felt', tier: 'referenced' }] },
    { inputs: ['wool', 'spindle'], output: 'woollen_yarn', process: 'spinning', cost: ZERO_COST, sources: [{ label: 'Yarn', url: 'https://en.wikipedia.org/wiki/Yarn', tier: 'referenced' }] },
    { inputs: ['woollen_yarn', 'sewing_thread'], output: 'jumper', process: 'knitting', cost: ZERO_COST, sources: [{ label: 'Sweater', url: 'https://en.wikipedia.org/wiki/Sweater', tier: 'referenced' }] },
    { inputs: ['farmland', 'compost'], output: 'flax', process: 'sowing', cost: ZERO_COST, sources: [{ label: 'Flax', url: 'https://en.wikipedia.org/wiki/Flax', tier: 'referenced' }] },
    { inputs: ['flax', 'filtered_water'], output: 'retted_flax', process: 'retting', cost: ZERO_COST, sources: [{ label: 'Retting', url: 'https://en.wikipedia.org/wiki/Retting', tier: 'referenced' }] },
    { inputs: ['retted_flax', 'cotton_gin'], output: 'linen', process: 'scutching', cost: ZERO_COST, sources: [{ label: 'Linen', url: 'https://en.wikipedia.org/wiki/Linen', tier: 'referenced' }] },
    { inputs: ['farmland', 'cart_wheel'], output: 'flour', process: 'milling', cost: ZERO_COST, sources: [{ label: 'Flour', url: 'https://en.wikipedia.org/wiki/Flour', tier: 'referenced' }] },
    { inputs: ['flour', 'filtered_water'], output: 'dough', process: 'kneading', cost: ZERO_COST, sources: [{ label: 'Dough', url: 'https://en.wikipedia.org/wiki/Dough', tier: 'referenced' }] },
    { inputs: ['dough', 'fire'], output: 'bread', process: 'baking', cost: ZERO_COST, sources: [{ label: 'Bread', url: 'https://en.wikipedia.org/wiki/Bread', tier: 'referenced' }] },
    { inputs: ['dough', 'ethanol'], output: 'beer', process: 'brewing', cost: ZERO_COST, sources: [{ label: 'Beer', url: 'https://en.wikipedia.org/wiki/Beer', tier: 'referenced' }] },
    { inputs: ['beer', 'water'], output: 'vinegar', process: 'souring', cost: ZERO_COST, sources: [{ label: 'Vinegar', url: 'https://en.wikipedia.org/wiki/Vinegar', tier: 'referenced' }] },
    { inputs: ['hardened_steel', 'plank'], output: 'knife', process: 'hafting', cost: ZERO_COST, sources: [{ label: 'Knife', url: 'https://en.wikipedia.org/wiki/Knife', tier: 'referenced' }] },
    { inputs: ['clay', 'quicklime'], output: 'pot', process: 'throwing', cost: ZERO_COST, sources: [{ label: 'Pottery', url: 'https://en.wikipedia.org/wiki/Pottery', tier: 'referenced' }] },
    { inputs: ['pot', 'wood_ash'], output: 'glaze', process: 'glazing', cost: ZERO_COST, sources: [{ label: 'Ceramic glaze', url: 'https://en.wikipedia.org/wiki/Ceramic_glaze', tier: 'referenced' }] },
    { inputs: ['candle', 'glass_pane'], output: 'candle_lantern', process: 'housing', cost: ZERO_COST, sources: [{ label: 'Lantern', url: 'https://en.wikipedia.org/wiki/Lantern', tier: 'referenced' }] },
    { inputs: ['soda_ash', 'water'], output: 'soap_bar', process: 'dissolving', cost: ZERO_COST, sources: [{ label: 'Sodium carbonate', url: 'https://en.wikipedia.org/wiki/Sodium_carbonate', tier: 'referenced' }] },

    // Batch 5.
    { inputs: ['bark', 'plant_fibre'], output: 'willow_bark', process: 'stripping', cost: ZERO_COST, sources: [{ label: 'Salicylic acid', url: 'https://en.wikipedia.org/wiki/Salicylic_acid', tier: 'referenced' }] },
    { inputs: ['willow_bark', 'vinegar'], output: 'aspirin', process: 'acetylating', cost: ZERO_COST, sources: [{ label: 'Aspirin', url: 'https://en.wikipedia.org/wiki/Aspirin', tier: 'referenced' }] },
    { inputs: ['ethanol', 'filtered_water'], output: 'antiseptic', process: 'diluting', cost: ZERO_COST, sources: [{ label: 'Antiseptic', url: 'https://en.wikipedia.org/wiki/Antiseptic', tier: 'referenced' }] },
    { inputs: ['linen', 'antiseptic'], output: 'bandage', process: 'dressing', cost: ZERO_COST, sources: [{ label: 'Bandage', url: 'https://en.wikipedia.org/wiki/Bandage', tier: 'referenced' }] },
    { inputs: ['iron_ore', 'copper_ore'], output: 'lodestone', process: 'sorting', cost: ZERO_COST, sources: [{ label: 'Lodestone', url: 'https://en.wikipedia.org/wiki/Lodestone', tier: 'referenced' }] },
    { inputs: ['lodestone', 'wrought_iron'], output: 'compass', process: 'magnetising', cost: ZERO_COST, sources: [{ label: 'Compass', url: 'https://en.wikipedia.org/wiki/Compass', tier: 'referenced' }] },
    { inputs: ['mirror', 'bronze'], output: 'sextant', process: 'graduating', cost: ZERO_COST, sources: [{ label: 'Sextant', url: 'https://en.wikipedia.org/wiki/Sextant', tier: 'referenced' }] },
    { inputs: ['clock', 'bearing'], output: 'chronometer', process: 'regulating', cost: ZERO_COST, sources: [{ label: 'Marine chronometer', url: 'https://en.wikipedia.org/wiki/Marine_chronometer', tier: 'referenced' }] },
    { inputs: ['charcoal', 'paraffin_wax'], output: 'pitch', process: 'boiling down', cost: ZERO_COST, sources: [{ label: 'Pitch (resin)', url: 'https://en.wikipedia.org/wiki/Pitch_(resin)', tier: 'referenced' }] },
    { inputs: ['linen', 'rope'], output: 'sail', process: 'sewing', cost: ZERO_COST, sources: [{ label: 'Sail', url: 'https://en.wikipedia.org/wiki/Sail', tier: 'referenced' }] },
    { inputs: ['plank', 'pitch'], output: 'boat', process: 'caulking', cost: ZERO_COST, sources: [{ label: 'Caulk', url: 'https://en.wikipedia.org/wiki/Caulk', tier: 'referenced' }] },
    { inputs: ['boat', 'sail'], output: 'ship', process: 'rigging', cost: ZERO_COST, sources: [{ label: 'Sailing ship', url: 'https://en.wikipedia.org/wiki/Sailing_ship', tier: 'referenced' }] },
    { inputs: ['welded_steel', 'fire'], output: 'steam_boiler', process: 'riveting', cost: ZERO_COST, sources: [{ label: 'Boiler', url: 'https://en.wikipedia.org/wiki/Boiler', tier: 'referenced' }] },
    { inputs: ['steam_boiler', 'gear'], output: 'steam_engine', process: 'coupling', cost: ZERO_COST, sources: [{ label: 'Steam engine', url: 'https://en.wikipedia.org/wiki/Steam_engine', tier: 'referenced' }] },
    { inputs: ['welded_steel', 'plank'], output: 'rail', process: 'laying', cost: ZERO_COST, sources: [{ label: 'Rail track', url: 'https://en.wikipedia.org/wiki/Track_(rail_transport)', tier: 'referenced' }] },
    { inputs: ['steam_engine', 'rail'], output: 'locomotive', process: 'assembling', cost: ZERO_COST, sources: [{ label: 'Locomotive', url: 'https://en.wikipedia.org/wiki/Locomotive', tier: 'referenced' }] },
    { inputs: ['aluminum_sheet', 'welded_steel'], output: 'alloy_frame', process: 'riveting', cost: ZERO_COST, sources: [{ label: 'Aluminium alloy', url: 'https://en.wikipedia.org/wiki/Aluminium_alloy', tier: 'referenced' }] },
    { inputs: ['alloy_frame', 'engine'], output: 'propeller', process: 'balancing', cost: ZERO_COST, sources: [{ label: 'Propeller', url: 'https://en.wikipedia.org/wiki/Propeller', tier: 'referenced' }] },
    { inputs: ['propeller', 'alloy_frame'], output: 'aeroplane', process: 'airframing', cost: ZERO_COST, sources: [{ label: 'Airplane', url: 'https://en.wikipedia.org/wiki/Airplane', tier: 'referenced' }] },
    { inputs: ['natural_gas', 'steel_frame'], output: 'liquid_oxygen', process: 'liquefying', cost: ZERO_COST, sources: [{ label: 'Liquid oxygen', url: 'https://en.wikipedia.org/wiki/Liquid_oxygen', tier: 'referenced' }] },
    { inputs: ['liquid_oxygen', 'welded_steel'], output: 'rocket_engine', process: 'throttling', cost: ZERO_COST, sources: [{ label: 'Rocket engine', url: 'https://en.wikipedia.org/wiki/Rocket_engine', tier: 'referenced' }] },
    { inputs: ['rocket_engine', 'alloy_frame'], output: 'rocket', process: 'stacking', cost: ZERO_COST, sources: [{ label: 'Rocket', url: 'https://en.wikipedia.org/wiki/Rocket', tier: 'referenced' }] },
    { inputs: ['rocket', 'solar_cell'], output: 'satellite', process: 'launching', cost: ZERO_COST, sources: [{ label: 'Satellite', url: 'https://en.wikipedia.org/wiki/Satellite', tier: 'referenced' }] },
    { inputs: ['circuit_board', 'speaker'], output: 'radio', process: 'tuning', cost: ZERO_COST, sources: [{ label: 'Radio receiver', url: 'https://en.wikipedia.org/wiki/Radio_receiver', tier: 'referenced' }] },
    { inputs: ['mirror', 'silicon_wafer'], output: 'camera', process: 'focusing', cost: ZERO_COST, sources: [{ label: 'Camera', url: 'https://en.wikipedia.org/wiki/Camera', tier: 'referenced' }] },
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
