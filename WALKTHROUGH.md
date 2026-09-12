# Walkthrough — every combination in the game

**Generated from `src/data/gameData.ts` by `npm run walkthrough`. Do not edit by hand.**

302 elements, 305 recipes. Steps are in an order you can actually follow: a combination only appears once you already hold both of its inputs.

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
| 9 | Spindle | + Plant Fibre | Cordage _(spun)_ | spinning | — |
| 10 | Wood | + Cordage | Bow | stringing | — |
| 11 | Bow | + Spindle | Bow Drill | assembling | — |
| 12 | Hand Drill | + Fire Board | Ember _(hand drill)_ | spinning | — |
| 13 | Bow Drill | + Fire Board | Ember _(bow drill)_ | drilling | — |
| 14 | Bark | + Sharp Stone | Tinder Bundle | shredding | — |
| 15 | Ember | + Tinder Bundle | Burning Tinder | blowing | — |
| 16 | Burning Tinder | + Wood | **Fire** | feeding | — |
| 17 | Fire | + Wood | **Charcoal** | charring | — |
| 18 | Torch | + Fire | **Lit Torch** | lighting | — |

All 3 targets reachable. ✅

## Everything

The main game. Everything a person can point at, and what it actually cost to make. Carries the real footprint numbers.

**Targets:** Cotton T-Shirt, Aluminium Can, Glass Bottle

**You start with 12:** Stone, Wood, Plant Fibre, Water, Soil, Limestone, Bauxite, Iron Ore, Crude Oil, Natural Gas, Beeswax, Textile Waste

**Carried over from Survival:** Stone, Wood, Plant Fibre, Sharp Stone, Cordage, Bark, Spindle, Fire, Charcoal — these are real dependencies, which is why Survival comes first.

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
| 58 | Bark | + Fire | Wood Ash | ashing | — |
| 59 | Wood Ash | + Water | Potash | leaching | — |
| 60 | Sodium Hydroxide | + Beeswax | Soap | saponifying | — |
| 61 | Pig Iron | + Limestone | Slag | fluxing | — |
| 62 | Slag | + Cement | Slag Cement | grinding | — |
| 63 | High-Carbon Steel | + Water | Hardened Steel | quenching | — |
| 64 | Hardened Steel | + Fire | Tempered Steel | tempering | — |
| 65 | Wood | + Wrought Iron | Plank | sawing | — |
| 66 | Plank | + Wrought Iron | Cart Wheel | wheelwrighting | — |
| 67 | Paper | + Sewing Thread | Book | bookbinding | — |
| 68 | Paper | + Paper | Cardboard | corrugating | — |
| 69 | Concrete | + High-Carbon Steel | Reinforced Concrete | reinforcing | — |
| 70 | Slaked Lime | + Water | Whitewash | thinning | — |
| 71 | Distillate | + Water | Ethylene | steam cracking | — |
| 72 | Ethylene | + Ethylene | Polythene | polymerising | — |
| 73 | Polythene | + High-Carbon Steel | Plastic Bottle | blow moulding | — |
| 74 | Ethylene | + Water | Ethanol | hydrating | — |
| 75 | Ethanol | + Clay | Butadiene | coupling | — |
| 76 | Butadiene | + Butadiene | Synthetic Rubber | polymerising | — |
| 77 | Distillate | + Charcoal | Carbon Black | partial combustion | — |
| 78 | Synthetic Rubber | + Carbon Black | Tyre | compounding | — |
| 79 | Ethylene | + Salt | Vinyl Chloride | oxychlorinating | — |
| 80 | Vinyl Chloride | + Vinyl Chloride | PVC | polymerising | — |
| 81 | PVC | + High-Carbon Steel | Pipe | extruding | — |
| 82 | Distillate | + Quicklime | Propylene | dehydrogenating | — |
| 83 | Propylene | + Propylene | Polyprop | polymerising | — |
| 84 | Polyprop | + Cordage | Rope | laying | — |
| 85 | Quicklime | + Charcoal | Acetylene | carbide smelting | — |
| 86 | Acetylene | + High-Carbon Steel | Welded Steel | welding | — |
| 87 | Welded Steel | + Reinforced Concrete | Steel Frame | erecting | — |
| 88 | Molten Glass | + Slag | Glass Pane | floating | — |
| 89 | Glass Pane | + Plank | Window | glazing | — |
| 90 | Glass Pane | + Sodium Hydroxide | Mirror | silvering | — |
| 91 | Brick | + Lime Mortar | Brick Wall | laying | — |
| 92 | Slaked Lime | + Wood Ash | Plaster | gauging | — |
| 93 | Carbon Black | + Tannin | Ink | grinding | — |
| 94 | Ink | + Paper | Newspaper | printing | — |
| 95 | Stone | + Sharp Stone | Copper Ore | prospecting | — |
| 96 | Copper Ore | + Charcoal | Copper | smelting | — |
| 97 | Copper | + Slag | Bronze | alloying | — |
| 98 | Copper | + Hardened Steel | Copper Wire | drawing | — |
| 99 | Copper Wire | + PVC | Insulated Wire | sheathing | — |
| 100 | Insulated Wire | + Wrought Iron | Magnet Coil | winding | — |
| 101 | Magnet Coil | + Tempered Steel | Electric Motor | assembling | — |
| 102 | Electric Motor | + Steel Frame | Generator | driving | — |
| 103 | Copper | + Sodium Hydroxide | Battery | stacking cells | — |
| 104 | Carbon Black | + Copper Wire | Filament | carbonising | — |
| 105 | Filament | + Glass Bottle | Light Bulb | evacuating | — |
| 106 | Light Bulb | + Insulated Wire | Lamp | wiring | — |
| 107 | Silica Sand | + Charcoal | Silicon | carbothermic reduction | — |
| 108 | Silicon | + Hardened Steel | Silicon Wafer | slicing | — |
| 109 | Silicon Wafer | + Copper | Microchip | etching | — |
| 110 | Microchip | + Insulated Wire | Circuit Board | soldering | — |
| 111 | Circuit Board | + Glass Pane | Phone | assembling | — |
| 112 | Silicon Wafer | + Glass Pane | Solar Cell | doping | — |
| 113 | Tempered Steel | + Copper Wire | Steel Spring | coiling | — |
| 114 | Hardened Steel | + Bronze | Bearing | grinding | — |
| 115 | Bearing | + Tyre | Bicycle | building | — |
| 116 | Bronze | + Welded Steel | Gear | cutting teeth | — |
| 117 | Gear | + Steel Spring | Clock | escaping | — |
| 118 | Gear | + Distillate | Engine | firing | — |
| 119 | Engine | + Bicycle | Car | assembling | — |
| 120 | Magnet Coil | + Paper | Speaker | coning | — |
| 121 | Speaker | + Copper Wire | Microphone | reversing | — |
| 122 | Speaker | + Steel Spring | Headphones | assembling | — |
| 123 | PVC | + Microphone | Record | cutting | — |
| 124 | Copper Wire | + Hardened Steel | Wire Mesh | weaving | — |
| 125 | Wire Mesh | + Cotton Jersey | Fencing Mask | shaping | — |
| 126 | Tempered Steel | + Hardened Steel | Fencing Blade | forging | — |
| 127 | Fencing Mask | + Fencing Blade | Fencing Kit | kitting out | — |
| 128 | Farmland | + Sharp Stone | Wool | shearing | — |
| 129 | Wool | + Water | Felt | fulling | — |
| 130 | Wool | + Spindle | Woollen Yarn | spinning | — |
| 131 | Woollen Yarn | + Sewing Thread | Jumper | knitting | — |
| 132 | Farmland | + Compost | Flax | sowing | — |
| 133 | Flax | + Filtered Water | Retted Flax | retting | — |
| 134 | Retted Flax | + Cotton Gin | Linen | scutching | — |
| 135 | Farmland | + Cart Wheel | Flour | milling | — |
| 136 | Flour | + Filtered Water | Dough | kneading | — |
| 137 | Dough | + Fire | Bread | baking | — |
| 138 | Dough | + Ethanol | Beer | brewing | — |
| 139 | Beer | + Water | Vinegar | souring | — |
| 140 | Hardened Steel | + Plank | Knife | hafting | — |
| 141 | Clay | + Quicklime | Pot | throwing | — |
| 142 | Pot | + Wood Ash | Glaze | glazing | — |
| 143 | Candle | + Glass Pane | Lantern | housing | — |
| 144 | Soda Ash | + Water | Washing Soda | dissolving | — |
| 145 | Bark | + Plant Fibre | Willow Bark | stripping | — |
| 146 | Willow Bark | + Vinegar | Aspirin | acetylating | — |
| 147 | Ethanol | + Filtered Water | Antiseptic | diluting | — |
| 148 | Linen | + Antiseptic | Bandage | dressing | — |
| 149 | Iron Ore | + Copper Ore | Lodestone | sorting | — |
| 150 | Lodestone | + Wrought Iron | Compass | magnetising | — |
| 151 | Mirror | + Bronze | Sextant | graduating | — |
| 152 | Clock | + Bearing | Chronometer | regulating | — |
| 153 | Charcoal | + Paraffin Wax | Pitch | boiling down | — |
| 154 | Linen | + Rope | Sail | sewing | — |
| 155 | Plank | + Pitch | Boat | caulking | — |
| 156 | Boat | + Sail | Ship | rigging | — |
| 157 | Welded Steel | + Fire | Steam Boiler | riveting | — |
| 158 | Steam Boiler | + Gear | Steam Engine | coupling | — |
| 159 | Welded Steel | + Plank | Rail | laying | — |
| 160 | Steam Engine | + Rail | Locomotive | assembling | — |
| 161 | Aluminium Sheet | + Welded Steel | Alloy Frame | riveting | — |
| 162 | Alloy Frame | + Engine | Propeller | balancing | — |
| 163 | Propeller | + Alloy Frame | Aeroplane | airframing | — |
| 164 | Natural Gas | + Steel Frame | Liquid Oxygen | liquefying | — |
| 165 | Liquid Oxygen | + Welded Steel | Rocket Engine | throttling | — |
| 166 | Rocket Engine | + Alloy Frame | Rocket | stacking | — |
| 167 | Rocket | + Solar Cell | Satellite | launching | — |
| 168 | Circuit Board | + Speaker | Radio | tuning | — |
| 169 | Mirror | + Silicon Wafer | Camera | focusing | — |
| 170 | Tannin | + Wool | Leather | tanning | — |
| 171 | Leather | + Sewing Thread | Shoe | lasting | — |
| 172 | Leather | + Pot | Drum | stretching | — |
| 173 | Plank | + Steel Spring | Guitar | luthiery | — |
| 174 | Woollen Yarn | + Pitch | Bow Hair | rosining | — |
| 175 | Glass Pane | + Pipe | Telescope | grinding lenses | — |
| 176 | Telescope | + Mirror | Microscope | illuminating | — |
| 177 | Glass Bottle | + Ethanol | Thermometer | calibrating | — |
| 178 | Thermometer | + Bronze | Barometer | sealing | — |
| 179 | Carbon Black | + Plank | Pencil | encasing | — |
| 180 | Limestone | + Water | Chalk | levigating | — |
| 181 | Cement | + Plaster | Render | floating | — |
| 182 | Clay | + Glaze | Roof Tile | pressing | — |
| 183 | Brick Wall | + Roof Tile | House | building | — |
| 184 | Bronze | + Steel Spring | Lock | pinning | — |
| 185 | Wrought Iron | + Hardened Steel | Nail | heading | — |
| 186 | Plank | + Nail | Door | hanging | — |
| 187 | Nail | + Gear | Screw | threading | — |
| 188 | Plank | + Screw | Chair | joinery | — |
| 189 | Chair | + Plank | Table | jointing | — |
| 190 | Steel Spring | + Felt | Mattress | upholstering | — |
| 191 | Linen | + Cordage | Kite | bridling | — |
| 192 | Kite | + Rope | Parachute | packing | — |
| 193 | Leather | + Plank | Bellows | hinging | — |
| 194 | Pig Iron | + Hardened Steel | Anvil | casting | — |
| 195 | Anvil | + Wrought Iron | Horseshoe | shoeing | — |
| 196 | Anvil | + Plank | Plough | shaping | — |
| 197 | Sail | + Gear | Windmill | milling | — |
| 198 | Cart Wheel | + Boat | Water Wheel | damming | — |
| 199 | Tempered Steel | + Wire Mesh | Steel Wire | drawing | — |
| 200 | Steel Wire | + Anvil | Chain | linking | — |
| 201 | Hardened Steel | + Chalk | File | cutting teeth | — |
| 202 | Tempered Steel | + File | Saw | setting | — |
| 203 | Pig Iron | + Plank | Hammer | hafting | — |
| 204 | Hardened Steel | + Hammer | Chisel | grinding | — |
| 205 | Electric Motor | + Bearing | Lathe | turning | — |
| 206 | Lathe | + Steel Wire | Threaded Rod | threading | — |
| 207 | Threaded Rod | + Wrought Iron | Clamp | assembling | — |
| 208 | Plank | + Glaze | Plywood | laminating | — |
| 209 | Silica Sand | + Paper | Sandpaper | gluing | — |
| 210 | Pitch | + Ethanol | Varnish | dissolving | — |
| 211 | Whitewash | + Dye | Paint | milling | — |
| 212 | Wool | + Threaded Rod | Brush | setting | — |
| 213 | Linen | + Varnish | Canvas | priming | — |
| 214 | Canvas | + Paint | Painting | painting | — |
| 215 | Wool | + Knife | Quill | cutting | — |
| 216 | Leather | + Chalk | Parchment | stretching | — |
| 217 | Parchment | + Compass | Map | surveying | — |
| 218 | Molten Glass | + Sandpaper | Lens | grinding | — |
| 219 | Lens | + Copper Wire | Spectacles | fitting | — |
| 220 | Lens | + Bronze | Magnifier | mounting | — |
| 221 | Molten Glass | + Lens | Prism | polishing | — |
| 222 | Prism | + Camera | Spectrum | calibrating | — |
| 223 | Clay | + Charcoal | Mould | packing | — |
| 224 | Pig Iron | + Mould | Cast Iron | casting | — |
| 225 | Cast Iron | + Pipe | Stove | fitting | — |
| 226 | Cast Iron | + Water | Kettle | spinning | — |
| 227 | Bronze | + Mould | Bell | founding | — |
| 228 | Dough | + Compost | Yeast | culturing | — |
| 229 | Yeast | + Flour | Sourdough | fermenting | — |
| 230 | Water | + Vinegar | Cheese | curdling | — |
| 231 | Cheese | + Pot | Butter | churning | — |
| 232 | Farmland | + Quicklime | Sugar | refining | — |
| 233 | Sugar | + Fire | Caramel | caramelising | — |
| 234 | Charcoal | + Pipe | Water Filter | packing | — |
| 235 | Pipe | + Bearing | Well | boring | — |
| 236 | Brick Wall | + Render | Aqueduct | surveying | — |
| 237 | Pipe | + Concrete | Sewer | laying | — |
| 238 | Salt | + Battery | Chlorine | electrolysing | — |
| 239 | Chlorine | + Soda Ash | Bleach | reacting | — |
| 240 | Slag | + Water | Sulfuric Acid | roasting | — |
| 241 | Ammonia | + Sulfuric Acid | Fertiliser | neutralising | — |
| 242 | Slag | + Fire | Lead | cupellation | — |
| 243 | Lead | + Sulfuric Acid | Car Battery | plating | — |
| 244 | Lead | + Copper | Solder | alloying | — |
| 245 | Silicon Wafer | + Solder | Transistor | doping | — |
| 246 | Transistor | + Circuit Board | Computer | programming | — |
| 247 | Glass Pane | + Transistor | Screen | layering | — |
| 248 | Polyprop | + Steel Spring | Keyboard | moulding | — |
| 249 | Computer | + Screen | Laptop | assembling | — |
| 250 | Copper Wire | + Alloy Frame | Antenna | tuning | — |
| 251 | Microphone | + Antenna | Telephone | switching | — |
| 252 | Screen | + Radio | Television | broadcasting | — |
| 253 | Prism | + Transistor | Laser | pumping | — |
| 254 | Lens | + Laser | Optic Fibre | drawing | — |
| 255 | Laser | + Ink | Barcode | printing | — |
| 256 | Solar Cell | + Alloy Frame | Solar Panel | framing | — |
| 257 | Generator | + Propeller | Wind Turbine | erecting | — |
| 258 | Compost | + Stone | Coal | burial | — |
| 259 | Coal | + Fire | Coke | coking | — |
| 260 | Coke | + Water | Coal Tar | condensing | — |
| 261 | Coal Tar | + Quicklime | Benzene | distilling | — |
| 262 | Benzene | + Ammonia | Aniline | aminating | — |
| 263 | Aniline | + Sulfuric Acid | Synthetic Dye | coupling | — |
| 264 | Benzene | + Sodium Hydroxide | Phenol | sulfonating | — |
| 265 | Phenol | + Wood Ash | Bakelite | curing | — |
| 266 | Benzene | + Sulfuric Acid | Nylon | polycondensing | — |
| 267 | Wood Pulp | + Sodium Hydroxide | Rayon | spinning | — |
| 268 | Woollen Yarn | + Canvas | Carpet | tufting | — |
| 269 | Linen | + Chain | Curtain | hanging | — |
| 270 | Nylon | + Steel Spring | Umbrella | ribbing | — |
| 271 | Nylon | + Rope | Tent | pitching | — |
| 272 | Nylon | + Leather | Backpack | stitching | — |
| 273 | Copper | + Limestone | Brass | alloying | — |
| 274 | Brass | + Nylon | Zip | meshing | — |
| 275 | Brass | + Pipe | Trumpet | belling | — |
| 276 | Steel Wire | + Felt | Piano | voicing | — |
| 277 | Plywood | + Bow Hair | Violin | luthiery | — |
| 278 | Lead | + Fire | Silver | cupellation | — |
| 279 | Wood Pulp | + Sulfuric Acid | Celluloid | nitrating | — |
| 280 | Celluloid | + Silver | Film | coating | — |
| 281 | Record | + Brass | Gramophone | cranking | — |
| 282 | Film | + Lamp | Projector | shuttering | — |
| 283 | Projector | + Screen | Cinema | showing | — |
| 284 | Glass Pane | + Knife | Slide | cutting | — |
| 285 | Slide | + Antiseptic | Vaccine | attenuating | — |
| 286 | Yeast | + Slide | Penicillin | culturing | — |
| 287 | Glass Bottle | + Steel Wire | Syringe | grinding | — |

All 3 targets reachable. ✅

## Alternate routes

Elements with more than one real way to make them. The receipt tells you which road you took.

- **Cordage** — Plant Fibre + Plant Fibre; or Spindle + Plant Fibre (spun)
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

302 elements make 45,451 possible pairs, and 305 of them are recipes. **99.3% of everything you can try does nothing** — which is why explaining failure is where the teaching has to happen.
