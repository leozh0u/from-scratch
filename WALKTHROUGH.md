# Walkthrough — every combination in the game

**Generated from `src/data/gameData.ts` by `npm run walkthrough`. Do not edit by hand.**

812 elements, 815 recipes. Steps are in an order you can actually follow: a combination only appears once you already hold both of its inputs.

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
| 288 | Slag | + Coke | Zinc | retorting | — |
| 289 | Zinc | + High-Carbon Steel | Galvanised Steel | dipping | — |
| 290 | Galvanised Steel | + Chain | Bucket | seaming | — |
| 291 | Slag | + Charcoal | Tin | smelting | — |
| 292 | Tin | + Aluminium Sheet | Tin Can | seaming | — |
| 293 | Tin | + Lead | Pewter | alloying | — |
| 294 | Stone | + Filtered Water | Gold | panning | — |
| 295 | Gold | + Anvil | Coin | striking | — |
| 296 | Gold | + Hammer | Gold Leaf | beating | — |
| 297 | Stone | + Sulfuric Acid | Cinnabar | prospecting | — |
| 298 | Cinnabar | + Fire | Mercury | roasting | — |
| 299 | Mercury | + Glass Bottle | Vacuum | evacuating | — |
| 300 | Cast Iron | + Lathe | Piston | boring | — |
| 301 | Vacuum | + Piston | Vacuum Pump | pumping | — |
| 302 | Piston | + Steel Spring | Pressure Gauge | calibrating | — |
| 303 | Electric Motor | + Ammonia | Fridge | compressing | — |
| 304 | Fridge | + Filtered Water | Ice | freezing | — |
| 305 | Fridge | + Propeller | Air Conditioner | ducting | — |
| 306 | Electric Motor | + Washing Soda | Washing Machine | agitating | — |
| 307 | Electric Motor | + Sewing Thread | Sewing Machine | lockstitching | — |
| 308 | Gear | + Cotton Yarn | Loom | weaving | — |
| 309 | Cotton Yarn | + Synthetic Dye | Denim | weaving | — |
| 310 | Denim | + Zip | Jeans | riveting | — |
| 311 | Nylon | + Wire Mesh | Velcro | hooking | — |
| 312 | Leather | + Filtered Water | Glue | boiling | — |
| 313 | Cardboard | + Glue | Box | folding | — |
| 314 | Plywood | + Nail | Pallet | nailing | — |
| 315 | Galvanised Steel | + Welded Steel | Container | corrugating | — |
| 316 | Electric Motor | + Chain | Crane | jibbing | — |
| 317 | Crane | + Container | Port | berthing | — |
| 318 | Coal | + Pressure Gauge | Graphite | compressing | — |
| 319 | Stone | + Chisel | Mortar | hollowing | — |
| 320 | Wire Mesh | + Brass | Sieve | stretching | — |
| 321 | Brass | + Bearing | Balance | calibrating | — |
| 322 | Clay | + Graphite | Crucible | firing | — |
| 323 | Brick | + Bellows | Furnace | building | — |
| 324 | Furnace | + Coke | Blast Furnace | charging | — |
| 325 | Liquid Oxygen | + Pressure Gauge | Oxygen | boiling | — |
| 326 | Liquid Oxygen | + Sieve | Nitrogen | fractionating | — |
| 327 | Nitrogen | + Prism | Argon | separating | — |
| 328 | Blast Furnace | + Oxygen | Steel Ingot | blowing | — |
| 329 | Argon | + Acetylene | Welding Torch | regulating | — |
| 330 | Slag | + Aluminium Sheet | Chromium | reducing | — |
| 331 | Steel Ingot | + Chromium | Stainless Steel | alloying | — |
| 332 | Stainless Steel | + Mould | Cutlery | pressing | — |
| 333 | Stainless Steel | + Pipe | Sink | pressing | — |
| 334 | Synthetic Rubber | + Sieve | Washer | punching | — |
| 335 | Brass | + Washer | Tap | threading | — |
| 336 | Washer | + Pipe | Valve | seating | — |
| 337 | Valve | + Piston | Pump | reciprocating | — |
| 338 | Pump | + Cast Iron | Hydraulic Press | pressurising | — |
| 339 | Hydraulic Press | + Galvanised Steel | Stamped Part | stamping | — |
| 340 | Stamped Part | + Welded Steel | Car Body | spot welding | — |
| 341 | Car Body | + Chain | Assembly Line | conveying | — |
| 342 | Concrete | + Pitch | Road | paving | — |
| 343 | Steel Frame | + Reinforced Concrete | Bridge | spanning | — |
| 344 | Hydraulic Press | + Brick Wall | Tunnel | boring | — |
| 345 | Lamp | + Transistor | Traffic Light | sequencing | — |
| 346 | Lamp | + Steel Frame | Street Lamp | erecting | — |
| 347 | Road | + Street Lamp | City | planning | — |
| 348 | Clock | + Brick Wall | Clock Tower | erecting | — |
| 349 | Battery | + Insulated Wire | Telegraph | keying | — |
| 350 | Telegraph | + Paper | Morse Code | encoding | — |
| 351 | Keyboard | + Ink | Typewriter | levering | — |
| 352 | Cardboard | + Loom | Punched Card | punching | — |
| 353 | Punched Card | + Gear | Calculator | cranking | — |
| 354 | Microscope | + Water | Cell | observing | — |
| 355 | Filtered Water | + Compost | Seaweed | harvesting | — |
| 356 | Cell | + Seaweed | Agar | boiling | — |
| 357 | Seaweed | + Sulfuric Acid | Iodine | subliming | — |
| 358 | Iodine | + Ethanol | Tincture | dissolving | — |
| 359 | Ethanol | + Chlorine | Anaesthetic | chlorinating | — |
| 360 | Vacuum | + Copper Wire | X-Ray | exciting | — |
| 361 | Pipe | + Drum | Stethoscope | listening | — |
| 362 | Sulfuric Acid | + Paraffin Wax | Detergent | sulfonating | — |
| 363 | Chalk | + Glaze | Toothpaste | milling | — |
| 364 | Nylon | + Polyprop | Toothbrush | tufting | — |
| 365 | Silver | + Glass Pane | Silvered Glass | depositing | — |
| 366 | Film | + Silver | Photograph | developing | — |
| 367 | Photograph | + Antiseptic | Negative | fixing | — |
| 368 | Zinc | + Synthetic Dye | Printing Plate | etching | — |
| 369 | Printing Plate | + Paper | Poster | lithography | — |
| 370 | Cotton Jersey | + Printing Plate | Banknote | intaglio | — |
| 371 | Glue | + Poster | Stamp | perforating | — |
| 372 | Paper | + Glue | Envelope | folding | — |
| 373 | Cast Iron | + Paint | Postbox | casting | — |
| 374 | Chain | + Gear | Bicycle Chain | meshing | — |
| 375 | Synthetic Rubber | + Glue | Rubber Pad | moulding | — |
| 376 | Rubber Pad | + Steel Wire | Brake | cabling | — |
| 377 | Polyprop | + Felt | Helmet | moulding | — |
| 378 | Salt | + Filtered Water | Brine | dissolving | — |
| 379 | Brine | + Battery | Hydrogen | electrolysing | — |
| 380 | Hydrogen | + Solar Cell | Fuel Cell | stacking | — |
| 381 | Hydrogen | + Synthetic Rubber | Balloon | inflating | — |
| 382 | Balloon | + Alloy Frame | Airship | framing | — |
| 383 | Alloy Frame | + Canvas | Glider | rigging | — |
| 384 | Propeller | + Tunnel | Wind Tunnel | testing | — |
| 385 | Wind Tunnel | + Welding Torch | Jet Engine | balancing | — |
| 386 | Jet Engine | + Aeroplane | Airliner | certifying | — |
| 387 | Road | + Traffic Light | Runway | grading | — |
| 388 | Antenna | + Vacuum Pump | Radar | sweeping | — |
| 389 | Radar | + Water | Sonar | pinging | — |
| 390 | Sonar | + Steel Frame | Submarine | pressurising | — |
| 391 | Synthetic Rubber | + Pressure Gauge | Diving Suit | sealing | — |
| 392 | Pump | + Nitrogen | Compressed Air | compressing | — |
| 393 | Compressed Air | + Hardened Steel | Pneumatic Drill | hammering | — |
| 394 | Nitrogen | + Clay | Dynamite | absorbing | — |
| 395 | Dynamite | + Crane | Quarry | blasting | — |
| 396 | Pneumatic Drill | + Rail | Mine | shafting | — |
| 397 | Electric Motor | + Steel Wire | Lift | counterweighting | — |
| 398 | Lift | + Steel Frame | Skyscraper | cladding | — |
| 399 | Bicycle Chain | + Electric Motor | Escalator | stepping | — |
| 400 | Escalator | + Tunnel | Underground | signalling | — |
| 401 | Steam Engine | + Generator | Power Station | synchronising | — |
| 402 | Magnet Coil | + Steel Ingot | Transformer | laminating | — |
| 403 | Aluminium Sheet | + Steel Wire | Aluminium Cable | stranding | — |
| 404 | Transformer | + Aluminium Cable | Power Line | stringing | — |
| 405 | Power Line | + Power Station | Power Grid | interconnecting | — |
| 406 | Bakelite | + Brass | Plug | moulding | — |
| 407 | Tin | + Glass Bottle | Fuse | calibrating | — |
| 408 | Celluloid | + Lodestone | Magnetic Tape | coating | — |
| 409 | Magnetic Tape | + Speaker | Tape Recorder | biasing | — |
| 410 | Magnetic Tape | + Bearing | Hard Drive | spinning | — |
| 411 | Transistor | + Microchip | Memory Chip | etching | — |
| 412 | Telephone | + Memory Chip | Modem | modulating | — |
| 413 | Modem | + Optic Fibre | Router | routing | — |
| 414 | Router | + Power Grid | Internet | peering | — |
| 415 | Computer | + Air Conditioner | Server | racking | — |
| 416 | Server | + Power Station | Data Centre | cooling | — |
| 417 | Satellite | + Memory Chip | GPS | triangulating | — |
| 418 | Screen | + Copper Wire | Touchscreen | layering | — |
| 419 | Phone | + GPS | Smartphone | integrating | — |
| 420 | Brine | + Sieve | Lithium | evaporating | — |
| 421 | Lithium | + Polyprop | Lithium Battery | layering | — |
| 422 | Lithium Battery | + Car Body | Electric Car | assembling | — |
| 423 | Electric Car | + Power Line | Charging Point | installing | — |
| 424 | Fridge | + Valve | Heat Pump | reversing | — |
| 425 | Glass Pane | + Air Conditioner | Insulation | spinning | — |
| 426 | Glass Pane | + Argon | Double Glazing | sealing | — |
| 427 | Cast Iron | + Valve | Radiator | casting | — |
| 428 | Radiator | + Steam Boiler | Central Heating | plumbing | — |
| 429 | Thermometer | + Transistor | Thermostat | switching | — |
| 430 | Transistor | + Laser | Smoke Alarm | detecting | — |
| 431 | Compressed Air | + Soda Ash | Fire Bottle | charging | — |
| 432 | Valve | + Glass Bottle | Sprinkler | plumbing | — |
| 433 | Copper Wire | + Skyscraper | Lightning Rod | earthing | — |
| 434 | Brass | + Compass | Weather Vane | balancing | — |
| 435 | Glass Bottle | + Balance | Rain Gauge | graduating | — |
| 436 | Rain Gauge | + Weather Vane | Weather Station | logging | — |
| 437 | Weather Station | + Computer | Forecast | modelling | — |
| 438 | Beeswax | + Sugar | Honey | extracting | — |
| 439 | Honey | + Yeast | Mead | fermenting | — |
| 440 | Salt | + Pot | Salted Fish | curing | — |
| 441 | Salted Fish | + Charcoal | Smoked Food | smoking | — |
| 442 | Tin Can | + Steam Boiler | Canned Food | retorting | — |
| 443 | Canned Food | + Thermometer | Pasteurised Milk | pasteurising | — |
| 444 | Sugar | + Butter | Chocolate | conching | — |
| 445 | Farmland | + Fire | Coffee | roasting | — |
| 446 | Farmland | + Filtered Water | Tea | oxidising | — |
| 447 | Glaze | + Kettle | Teapot | throwing | — |
| 448 | Clay | + Chalk | Porcelain | vitrifying | — |
| 449 | Porcelain | + Wood Ash | Bone China | calcining | — |
| 450 | Glaze | + Copper | Enamel | firing | — |
| 451 | Enamel | + Cast Iron | Bathtub | enamelling | — |
| 452 | Tap | + Pipe | Shower | plumbing | — |
| 453 | Cotton Jersey | + Loom | Towel | pile weaving | — |
| 454 | Stainless Steel | + Hydraulic Press | Razor | honing | — |
| 455 | Stainless Steel | + Washer | Scissors | pivoting | — |
| 456 | Steel Wire | + File | Needle | pointing | — |
| 457 | Porcelain | + Needle | Button | drilling | — |
| 458 | Cotton Jersey | + Button | Shirt | tailoring | — |
| 459 | Wool | + Sewing Machine | Suit | tailoring | — |
| 460 | Felt | + Steam Boiler | Hat | blocking | — |
| 461 | Leather | + Needle | Glove | stitching | — |
| 462 | Woollen Yarn | + Loom | Sock | knitting | — |
| 463 | Leather | + Rubber Pad | Boot | welting | — |
| 464 | Clock | + Steel Spring | Watch | miniaturising | — |
| 465 | Gold | + File | Ring | sizing | — |
| 466 | Graphite | + Hydraulic Press | Diamond | compressing | — |
| 467 | Diamond | + Steel Wire | Drill Bit | bonding | — |
| 468 | Plank | + Button | Abacus | stringing | — |
| 469 | Bone China | + Ink | Dice | marking | — |
| 470 | Cardboard | + Poster | Playing Card | cutting | — |
| 471 | Dice | + Plywood | Chess Set | turning | — |
| 472 | Leather | + Synthetic Rubber | Football | stitching | — |
| 473 | Alloy Frame | + Nylon | Racket | stringing | — |
| 474 | Plywood | + Varnish | Ski | camber | — |
| 475 | Stainless Steel | + Boot | Skate | riveting | — |
| 476 | Plank | + Glue | Ladder | rungs | — |
| 477 | Rope | + Plank | Rope Ladder | knotting | — |
| 478 | Ladder | + Clamp | Scaffold | tying | — |
| 479 | Cart Wheel | + Galvanised Steel | Wheelbarrow | riveting | — |
| 480 | Stainless Steel | + Hammer | Spade | forging | — |
| 481 | Farmland | + Sieve | Seed | winnowing | — |
| 482 | Glass Pane | + Steel Frame | Greenhouse | glazing | — |
| 483 | Pump | + Valve | Irrigation | channelling | — |
| 484 | Engine | + Tyre | Tractor | hitching | — |
| 485 | Tractor | + Sieve | Harvester | threshing | — |
| 486 | Galvanised Steel | + Crane | Silo | corrugating | — |
| 487 | Quarry | + Chisel | Millstone | dressing | — |
| 488 | Water Wheel | + Millstone | Mill | grinding | — |
| 489 | Bread | + Furnace | Bakery | proving | — |
| 490 | Bakery | + Coin | Market | trading | — |
| 491 | Balance | + Steel Spring | Weighing Scale | calibrating | — |
| 492 | Calculator | + Bell | Cash Register | ringing | — |
| 493 | Cash Register | + Paper | Receipt | printing | — |
| 494 | Market | + Window | Shop | fitting | — |
| 495 | Pallet | + Crane | Warehouse | stacking | — |
| 496 | Engine | + Container | Lorry | coupling | — |
| 497 | Postbox | + Lorry | Postal Service | sorting | — |
| 498 | Polythene | + Hydraulic Press | Plastic Film | blowing | — |
| 499 | Tin | + Synthetic Rubber | Bottle Cap | crimping | — |
| 500 | Bark | + Knife | Cork | stripping | — |
| 501 | Sugar | + Yeast | Wine | fermenting | — |
| 502 | Plank | + Chisel | Barrel | coopering | — |
| 503 | Beer | + Barrel | Whisky | distilling | — |
| 504 | Molten Glass | + Pipe | Blown Glass | blowing | — |
| 505 | Quarry | + Hydrogen | Tungsten | reducing | — |
| 506 | Tungsten | + Argon | Welding Rod | sharpening | — |
| 507 | Tungsten | + Graphite | Carbide Tool | sintering | — |
| 508 | Carbide Tool | + Computer | CNC Machine | programming | — |
| 509 | CNC Machine | + Polythene | 3D Printer | extruding | — |
| 510 | CNC Machine | + Electric Motor | Robot Arm | jointing | — |
| 511 | Robot Arm | + Assembly Line | Factory | commissioning | — |
| 512 | Rubber Pad | + Bearing | Conveyor | belting | — |
| 513 | Electric Motor | + Hydraulic Press | Forklift | counterweighting | — |
| 514 | Barcode | + Laser | Scanner | decoding | — |
| 515 | Antenna | + Memory Chip | RFID Tag | printing | — |
| 516 | RFID Tag | + Server | Stock System | tracking | — |
| 517 | Solar Panel | + Irrigation | Solar Farm | siting | — |
| 518 | Wind Turbine | + Power Line | Wind Farm | siting | — |
| 519 | Reinforced Concrete | + Valve | Dam | impounding | — |
| 520 | Dam | + Generator | Hydro Power | penstocking | — |
| 521 | Lithium Battery | + Container | Grid Battery | racking | — |
| 522 | Carbide Tool | + Electric Motor | Shredder | shearing | — |
| 523 | Shredder | + Conveyor | Recycling | sorting | — |
| 524 | Compost | + Seed | Compost Heap | turning | — |
| 525 | Compost Heap | + Pipe | Biogas | digesting | — |
| 526 | Tractor | + Stamped Part | Bulldozer | tracking | — |
| 527 | Bulldozer | + Clay | Landfill | capping | — |
| 528 | Furnace | + Limestone | Lime Kiln | calcining | — |
| 529 | Furnace | + Plank | Charcoal Kiln | smouldering | — |
| 530 | Furnace | + Anvil | Forge | striking | — |
| 531 | Wrought Iron | + Forge | Tongs | drawing out | — |
| 532 | Brass | + Hammer | Buckle | forging | — |
| 533 | Leather | + Buckle | Harness | stitching | — |
| 534 | Cart Wheel | + Harness | Cart | yoking | — |
| 535 | Leather | + Plywood | Saddle | tree building | — |
| 536 | Cast Iron | + Harness | Stirrup | casting | — |
| 537 | Clay | + Spade | Canal | puddling | — |
| 538 | Canal | + Plank | Canal Lock | mitring | — |
| 539 | Boat | + Canal | Barge | towing | — |
| 540 | Lens | + Lathe | Fresnel Lens | cutting rings | — |
| 541 | Fresnel Lens | + Brick Wall | Lighthouse | flashing | — |
| 542 | Compressed Air | + Trumpet | Foghorn | sounding | — |
| 543 | Boat | + Cork | Lifeboat | buoying | — |
| 544 | Cast Iron | + Chain | Anchor | forging | — |
| 545 | Rope | + Needle | Net | netting | — |
| 546 | Net | + Boat | Fishing Boat | rigging | — |
| 547 | Quarry | + Concrete | Breakwater | armouring | — |
| 548 | Breakwater | + Crane | Quay | piling | — |
| 549 | Breakwater | + Quay | Harbour | dredging | — |
| 550 | Quay | + Pump | Dry Dock | dewatering | — |
| 551 | Dry Dock | + Welded Steel | Shipyard | blocking | — |
| 552 | Shipyard | + Container | Cargo Ship | launching | — |
| 553 | Cargo Ship | + Steel Frame | Icebreaker | reinforcing | — |
| 554 | Pipe | + Welding Torch | Pipeline | laying | — |
| 555 | Pipeline | + Distillate | Refinery | cracking | — |
| 556 | Refinery | + Lead | Petrol | blending | — |
| 557 | Petrol | + Pump | Petrol Station | forecourting | — |
| 558 | Seaweed | + Hammer | Papyrus | laminating | — |
| 559 | Papyrus | + Rope | Scroll | rolling | — |
| 560 | Scroll | + Shop | Library | cataloguing | — |
| 561 | Lead | + Mould | Movable Type | casting | — |
| 562 | Movable Type | + Book | Printed Book | setting | — |
| 563 | Printed Book | + Ink | Dictionary | compiling | — |
| 564 | Dictionary | + Library | Compendium | editing | — |
| 565 | Printing Plate | + Steam Engine | Rotary Press | rotating | — |
| 566 | Morse Code | + Postal Service | Telegram | delivering | — |
| 567 | Insulated Wire | + Cargo Ship | Undersea Cable | laying | — |
| 568 | Telephone | + Copper Wire | Switchboard | patching | — |
| 569 | Switchboard | + Bakelite | Dial Phone | pulsing | — |
| 570 | Tape Recorder | + Dial Phone | Answering Machine | triggering | — |
| 571 | Modem | + Scanner | Fax | scanning | — |
| 572 | Printing Plate | + Laser | Photocopier | fusing | — |
| 573 | Photocopier | + Computer | Printer | rasterising | — |
| 574 | Magnetic Tape | + Polyprop | Floppy Disk | slitting | — |
| 575 | Polyprop | + Laser | Compact Disc | pressing | — |
| 576 | Memory Chip | + Transistor | Flash Memory | trapping | — |
| 577 | Flash Memory | + Polyprop | USB Drive | moulding | — |
| 578 | Bearing | + Transistor | Mouse | tracking | — |
| 579 | Computer | + Punched Card | Operating System | scheduling | — |
| 580 | Operating System | + Dictionary | Compiler | compiling | — |
| 581 | Compiler | + Hard Drive | Database | indexing | — |
| 582 | Database | + Internet | Search Engine | crawling | — |
| 583 | Compiler | + Memory Chip | Encryption | keying | — |
| 584 | RFID Tag | + Encryption | Bank Card | embossing | — |
| 585 | Bank Card | + Cash Register | Cashpoint | dispensing | — |
| 586 | Plastic Film | + Glue | Label | die cutting | — |
| 587 | Label | + Box | Packaging | packing | — |
| 588 | Steel Wire | + Needle | Spoke | threading | — |
| 589 | Bearing | + Spoke | Hub | lacing | — |
| 590 | Synthetic Rubber | + Valve | Inner Tube | vulcanising | — |
| 591 | Bearing | + Polyprop | Pedal | threading | — |
| 592 | Bicycle Chain | + Steel Spring | Gears | indexing | — |
| 593 | Leather | + Steel Spring | Bike Saddle | tensioning | — |
| 594 | Magnet Coil | + Cart Wheel | Dynamo | commutating | — |
| 595 | Dynamo | + Light Bulb | Bike Light | mounting | — |
| 596 | Engine | + Inner Tube | Motorbike | framing | — |
| 597 | Lorry | + Chair | Bus | bodying | — |
| 598 | Electric Motor | + Rail | Tram | overhead wiring | — |
| 599 | Wrought Iron | + Bearing | Lever | pivoting | — |
| 600 | Lever | + Telegraph | Signal Box | interlocking | — |
| 601 | Hub | + Rope | Pulley | reeving | — |
| 602 | Pulley | + Gear | Winch | ratcheting | — |
| 603 | Threaded Rod | + Lever | Jack | threading | — |
| 604 | Hardened Steel | + Forge | Wedge | splitting | — |
| 605 | Wedge | + Plank | Axe | hafting | — |
| 606 | Saw | + Water Wheel | Sawmill | reciprocating | — |
| 607 | Sawmill | + Chisel | Timber Frame | jointing | — |
| 608 | Seed | + Harvester | Straw | baling | — |
| 609 | Straw | + Rope | Thatch | thatching | — |
| 610 | Clay | + Straw | Cob Wall | treading | — |
| 611 | Cob Wall | + Mould | Adobe | sun drying | — |
| 612 | Ice | + Saw | Igloo | blocking | — |
| 613 | Felt | + Timber Frame | Yurt | lashing | — |
| 614 | Timber Frame | + Pitch | Stilt House | piling | — |
| 615 | Brick | + Render | Chimney | corbelling | — |
| 616 | Chimney | + Cast Iron | Fireplace | fitting | — |
| 617 | Bellows | + Trumpet | Organ | voicing | — |
| 618 | Quarry | + Sieve | Quartz | sorting | — |
| 619 | Crucible | + Alumina | Kiln Shelf | refractory casting | — |
| 620 | Clay | + Kiln Shelf | Terracotta | biscuit firing | — |
| 621 | Terracotta | + Quartz | Stoneware | vitrifying | — |
| 622 | Quartz | + Transistor | Quartz Clock | oscillating | — |
| 623 | Quartz Clock | + Laser | Atomic Clock | trapping | — |
| 624 | Atomic Clock | + Radio | Time Signal | broadcasting | — |
| 625 | Telescope | + Balance | Theodolite | levelling | — |
| 626 | Theodolite | + Map | Survey | triangulating | — |
| 627 | Survey | + Printing Plate | Contour Map | hachuring | — |
| 628 | Camera | + Glider | Aerial Photo | overflying | — |
| 629 | Satellite | + Camera | Satellite Image | imaging | — |
| 630 | Satellite Image | + Forecast | Weather Satellite | orbiting | — |
| 631 | Antenna | + Fresnel Lens | Radio Telescope | steering | — |
| 632 | Quarry | + Mortar | Stone Arch | voussoir cutting | — |
| 633 | Stone Arch | + Brick | Dome | centring | — |
| 634 | Telescope | + Dome | Observatory | tracking | — |
| 635 | Stone Arch | + Render | Vault | ribbing | — |
| 636 | Blown Glass | + Lead | Stained Glass | leading | — |
| 637 | Vault | + Stained Glass | Cathedral | buttressing | — |
| 638 | Bell | + Timber Frame | Belfry | hanging | — |
| 639 | Stone | + Survey | Sundial | gnomon setting | — |
| 640 | Pot | + Valve | Water Clock | dripping | — |
| 641 | Blown Glass | + Sugar | Hourglass | calibrating | — |
| 642 | Sundial | + Printed Book | Calendar | intercalating | — |
| 643 | Calendar | + Forecast | Almanac | compiling | — |
| 644 | Almanac | + Calculator | Log Table | tabulating | — |
| 645 | Log Table | + Plywood | Slide Rule | engraving | — |
| 646 | Celluloid | + Printing Plate | Protractor | graduating | — |
| 647 | Brass | + Needle | Dividers | pivoting | — |
| 648 | Butter | + Furnace | Tallow | rendering | — |
| 649 | Beeswax | + Plank | Wax Tablet | recessing | — |
| 650 | Beeswax | + Ring | Seal | impressing | — |
| 651 | Tallow | + Cordage | Tallow Candle | dipping | — |
| 652 | Tallow | + Filtered Water | Lamp Oil | clarifying | — |
| 653 | Refinery | + Sulfuric Acid | Kerosene | treating | — |
| 654 | Kerosene | + Blown Glass | Oil Lamp | wicking | — |
| 655 | Crucible | + Pipe | Retort | sealing | — |
| 656 | Coke | + Retort | Gasworks | carbonising | — |
| 657 | Coal Tar | + Pipeline | Gas Lamp | mantling | — |
| 658 | Retort | + Water Filter | Still | condensing | — |
| 659 | Still | + Seaweed | Perfume | enfleurage | — |
| 660 | Still | + Plant Fibre | Essential Oil | steam distilling | — |
| 661 | Seed | + Greenhouse | Lavender | cultivating | — |
| 662 | Plank | + Straw | Beehive | skepping | — |
| 663 | Beehive | + Lavender | Pollination | foraging | — |
| 664 | Pollination | + Irrigation | Orchard | grafting | — |
| 665 | Orchard | + Barrel | Cider | pressing | — |
| 666 | Orchard | + Sugar | Jam | setting | — |
| 667 | Blown Glass | + Bottle Cap | Jar | sealing | — |
| 668 | Jar | + Vinegar | Pickle | pickling | — |
| 669 | Seaweed | + Quarry | Salt Pan | evaporating | — |
| 670 | Windmill | + Pump | Windpump | gearing | — |
| 671 | Windpump | + Dam | Polder | draining | — |
| 672 | Polder | + Clay | Dyke | embanking | — |
| 673 | Dyke | + Hydraulic Press | Flood Gate | sluicing | — |
| 674 | Dam | + Aqueduct | Reservoir | impounding | — |
| 675 | Reservoir | + Steel Frame | Water Tower | standpiping | — |
| 676 | Water Tower | + Valve | Hydrant | casting | — |
| 677 | Hydrant | + Lorry | Fire Engine | pumping | — |
| 678 | Paper | + Varnish | Paper Straw | spiral winding | — |
| 679 | Raw Cotton | + Paper Straw | Cotton Bud | spinning | — |
| 680 | Wood Pulp | + Plastic Film | Tissue | creping | — |
| 681 | Tissue | + Polyprop | Nappy | layering | — |
| 682 | Plaster | + Bandage | Plaster Cast | setting | — |
| 683 | Alloy Frame | + Rubber Pad | Crutch | adjusting | — |
| 684 | Bicycle | + Alloy Frame | Wheelchair | cambering | — |
| 685 | Microphone | + Lithium Battery | Hearing Aid | amplifying | — |
| 686 | Paper | + Punched Card | Braille | embossing | — |
| 687 | Carbon Black | + Alloy Frame | Prosthetic | socketing | — |
| 688 | X-Ray | + Film | X-Ray Plate | exposing | — |
| 689 | Sonar | + Screen | Ultrasound | scanning | — |
| 690 | Thermometer | + Mercury | Fever Gauge | constricting | — |
| 691 | Barometer | + Synthetic Rubber | Pressure Cuff | occluding | — |
| 692 | Stainless Steel | + Razor | Scalpel | honing | — |
| 693 | Nylon | + Needle | Suture | swaging | — |
| 694 | Steam Boiler | + Pressure Gauge | Autoclave | sterilising | — |
| 695 | Autoclave | + Scalpel | Operating Theatre | scrubbing | — |
| 696 | Operating Theatre | + Central Heating | Hospital | wards | — |
| 697 | Hospital | + Lorry | Ambulance | fitting out | — |
| 698 | Microscope | + Vacuum Pump | Electron Scope | focusing | — |
| 699 | Agar | + Blown Glass | Petri Dish | pouring | — |
| 700 | Electric Motor | + Balance | Centrifuge | spinning | — |
| 701 | Centrifuge | + Fridge | Blood Bank | storing | — |
| 702 | Pump | + Water Filter | Dialysis | filtering | — |
| 703 | Thermostat | + Glass Pane | Incubator | warming | — |
| 704 | Lens | + Spectacles | Bifocals | grinding | — |
| 705 | Polyprop | + Water | Contact Lens | moulding | — |
| 706 | Spectacles | + Carbon Black | Sunglasses | tinting | — |
| 707 | Sunglasses | + Synthetic Rubber | Goggles | sealing | — |
| 708 | Stone | + Fire | Obsidian | quenching | — |
| 709 | Quarry | + Hammer | Flint | knapping | — |
| 710 | Flint | + Hardened Steel | Fire Steel | striking | — |
| 711 | Fire Steel | + Steel Spring | Flintlock | cocking | — |
| 712 | Seaweed | + Knife | Reed | cutting | — |
| 713 | Clay | + Quill | Clay Tablet | impressing | — |
| 714 | Clay Tablet | + Reed | Cuneiform | wedging | — |
| 715 | Reed | + Water | Basket | soaking | — |
| 716 | Reed | + Chisel | Flute | boring | — |
| 717 | Flute | + Leather | Bagpipes | inflating | — |
| 718 | Timber Frame | + Steel Wire | Harp | stringing | — |
| 719 | Clock | + Lead | Metronome | weighting | — |
| 720 | Movable Type | + Paper | Sheet Music | engraving | — |
| 721 | Sheet Music | + Violin | Orchestra | conducting | — |
| 722 | Orchestra | + Plaster | Concert Hall | tuning | — |
| 723 | Transistor | + Transformer | Amplifier | biasing | — |
| 724 | Guitar | + Magnet Coil | Electric Guitar | winding | — |
| 725 | Amplifier | + Keyboard | Synthesiser | oscillating | — |
| 726 | Synthesiser | + Tape Recorder | Mixing Desk | mixing | — |
| 727 | Mixing Desk | + Insulation | Studio | isolating | — |
| 728 | PVC | + Mixing Desk | Vinyl Record | mastering | — |
| 729 | Antenna | + Studio | Radio Station | transmitting | — |
| 730 | Camera | + Celluloid | Film Camera | cranking | — |
| 731 | Film Camera | + Street Lamp | Film Set | lighting | — |
| 732 | Film Set | + Scissors | Editing Bench | splicing | — |
| 733 | Editing Bench | + Painting | Animation | cel painting | — |
| 734 | Magnetic Tape | + Television | Video Tape | helical scanning | — |
| 735 | Microchip | + Television | Games Console | rendering | — |
| 736 | Lever | + Transistor | Joystick | gimballing | — |
| 737 | Games Console | + Screen | Pixel Art | dithering | — |
| 738 | Synthetic Rubber | + Printing Plate | Rubber Stamp | vulcanising | — |
| 739 | Carbon Black | + Tissue | Carbon Paper | coating | — |
| 740 | Galvanised Steel | + Bearing | Filing Cabinet | drawer slides | — |
| 741 | Cardboard | + Filing Cabinet | Index Card | ruling | — |
| 742 | Printed Book | + Index Card | Ledger | ruling | — |
| 743 | Banknote | + Seal | Cheque | countersigning | — |
| 744 | Stainless Steel | + Lock | Safe | fireproofing | — |
| 745 | Safe | + Reinforced Concrete | Bank Vault | time locking | — |
| 746 | Brass | + File | Key | cutting | — |
| 747 | Key | + Hardened Steel | Padlock | shackling | — |
| 748 | Tin | + Needle | Drawing Pin | pressing | — |
| 749 | Brass | + Drawing Pin | Hinge | knuckling | — |
| 750 | Plywood | + Hinge | Cupboard | carcassing | — |
| 751 | Cupboard | + Bearing | Drawer | running | — |
| 752 | Drawer | + Table | Desk | fitting | — |
| 753 | Desk | + Filing Cabinet | Office | laying out | — |
| 754 | Lamp | + Steel Spring | Desk Lamp | counterbalancing | — |
| 755 | Chair | + Bearing | Swivel Chair | castoring | — |
| 756 | Enamel | + Plastic Film | Whiteboard | laminating | — |
| 757 | Ink | + Felt | Marker Pen | wicking | — |
| 758 | Steel Wire | + Ink | Ballpoint | ball seating | — |
| 759 | Gold | + Chisel | Gold Nib | slitting | — |
| 760 | Gold Nib | + Ink | Fountain Pen | filling | — |
| 761 | Synthetic Rubber | + Chalk | Eraser | abrading | — |
| 762 | Plywood | + Printing Plate | Ruler | graduating | — |
| 763 | Steel Wire | + Steel Spring | Stapler | clinching | — |
| 764 | Steel Wire | + Clamp | Paperclip | bending | — |
| 765 | Cork | + Timber Frame | Noticeboard | backing | — |
| 766 | Noticeboard | + Whiteboard | School | timetabling | — |
| 767 | School | + Printer | Exam Paper | invigilating | — |
| 768 | Reed | + Varnish | Wicker | weaving | — |
| 769 | Straw | + Ruler | Broom | binding | — |
| 770 | Cotton Yarn | + Broom | Mop | twisting | — |
| 771 | Electric Motor | + Tissue | Vacuum Cleaner | filtering | — |
| 772 | Stamped Part | + Broom | Dustpan | pressing | — |
| 773 | Polyprop | + Pedal | Bin | levering | — |
| 774 | Plastic Film | + Bin | Bin Bag | gusseting | — |
| 775 | Plywood | + Steel Spring | Clothes Peg | pivoting | — |
| 776 | Rope | + Clothes Peg | Washing Line | stringing | — |
| 777 | Cast Iron | + Thermostat | Iron | pressing | — |
| 778 | Alloy Frame | + Felt | Ironing Board | padding | — |
| 779 | Steel Wire | + Pulley | Coat Hanger | bending | — |
| 780 | Cupboard | + Coat Hanger | Wardrobe | hanging | — |
| 781 | Mattress | + Timber Frame | Bed | slatting | — |
| 782 | Felt | + Linen | Pillow | stuffing | — |
| 783 | Felt | + Towel | Duvet | quilting | — |
| 784 | Woollen Yarn | + Felt | Blanket | fulling | — |
| 785 | Aluminium Cable | + Bearing | Curtain Rail | gliding | — |
| 786 | Aluminium Cable | + Cordage | Blind | slatting | — |
| 787 | Seaweed | + Sieve | Coir | retting | — |
| 788 | Coir | + Synthetic Rubber | Doormat | tufting | — |
| 789 | Bell | + Battery | Doorbell | chiming | — |
| 790 | Door | + Steel Spring | Letterbox | flapping | — |
| 791 | Enamel | + Screw | House Number | fixing | — |
| 792 | Enamel | + Street Lamp | Street Sign | mounting | — |
| 793 | Quarry | + Render | Kerb | dressing | — |
| 794 | Concrete | + Kerb | Pavement | laying | — |
| 795 | Kerb | + Pipe | Drain | gullying | — |
| 796 | Cast Iron | + Drain | Manhole | casting | — |
| 797 | Paint | + Road | Crossing | striping | — |

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

812 elements make 329,266 possible pairs, and 815 of them are recipes. **99.8% of everything you can try does nothing** — which is why explaining failure is where the teaching has to happen.
