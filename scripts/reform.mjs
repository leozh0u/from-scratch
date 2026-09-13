/**
 * Give every icon the shape of the thing it actually is.
 *
 * WHY THIS HAD TO BE WRITTEN
 *
 * Icons are composed: a shared silhouette plus one colour. The silhouette was
 * chosen by hand when each element was authored, and then `rebalance.mjs`
 * moved the overflow from crowded forms into related ones. That second step is
 * the problem. It optimises for CAPACITY and pays for it in MEANING, and
 * because `plate` is a fallback target for nine other forms, everything
 * eventually drained into it: eighty members, including a house, a kettle and
 * a road.
 *
 * Measured before this ran: 631 pairs sharing a form sat within a perceptual
 * distance of 20, which is close enough to read as the same tile. A sock was
 * drawn as a wave and a photocopier as a jar.
 *
 * So the form comes from the NAME first, by a table of what things are, and
 * only then from the element's own tags. A wrong-but-distinct icon is worse
 * than a right-but-crowded one, because the player is being told something
 * false about the object either way and at least the crowded one is honest.
 *
 *   node scripts/reform.mjs            rewrite the forms
 *   node scripts/reform.mjs --dry      report without writing
 */
import { readFileSync, writeFileSync } from 'node:fs'

const REGISTRY = 'src/data/iconRegistry.ts'
const GAME_DATA = 'src/data/gameData.ts'
const DRY = process.argv.includes('--dry')

/*
 * Ordered specific to general: the first match wins, so "fire engine" must be
 * tested before "engine" and "bottle opener" before "bottle". Everything here
 * is a word that appears in an element's own name.
 */
/*
 * A handful of elements whose colour is PINNED to the real thing — gold is
 * gold-coloured, rope is rope-coloured — and which the name table would put in
 * the same silhouette as something equally pinned. Two pinned colours cannot
 * be moved apart, so the SHAPE has to carry the difference instead, and each
 * of these is the more specific truth anyway: a gold bar, a heap of potash, a
 * length of cordage that is visibly twisted fibre.
 */
const BY_ID = {
  gold: 'bar',
  gold_leaf: 'sheet',
  potash: 'heap',
  cordage: 'fibre',
}

const BY_NAME = [
  // --- vessels, by what shape they actually are -------------------------
  [/\b(bottle|flask|decanter)\b/, 'bottle'],
  [/\b(jar|jam|pickle|honey|marmalade)\b/, 'jar'],
  [/\b(cup|mug|tankard|goblet|teacup|egg cup)\b/, 'cup'],
  [/\b(vial|ampoule|phial|tincture|syringe|dose)\b/, 'vial'],
  [/\b(bowl|dish|colander|basin|sink|plate|saucer|pan)\b/, 'dish'],
  [/\b(cauldron|pot|kettle|crucible|retort|still)\b/, 'cup'],
  [/\b(barrel|drum|cask|butt|cistern|tank)\b/, 'drum'],
  [/\b(bucket|pail|watering can|jug)\b/, 'cup'],
  [/\b(tin|can|canned|packaging|carton)\b/, 'drum'],

  // --- cloth and what is worn ------------------------------------------
  [/\b(shirt|jersey|jumper|suit|swimsuit|wetsuit|apron|glove|sock|hat|boot|shoe|plimsoll|nappy|denim|jeans)\b/, 'cloth'],
  [/\b(towel|blanket|duvet|curtain|tablecloth|sheet music|dishcloth|carpet|mat|rug|tartan|felt|linen|canvas|wool|cotton|silk|velvet)\b/, 'cloth'],
  [/\b(rope|cordage|cord|twine|yarn|thread|string|hammock|net|web)\b/, 'roll'],
  [/\b(fibre|fiber|flax|coir|straw|hair|bristle)\b/, 'fibre'],

  // --- tools, by the shape of the tool ---------------------------------
  [/\b(hammer|mallet|axe|adze|pick)\b/, 'anvilf'],
  [/\b(saw|hacksaw|fretsaw)\b/, 'saw'],
  [/\b(knife|blade|scalpel|chisel|razor|sword|shear|secateur|scissors|cutter|guillotine)\b/, 'blade'],
  [/\b(pliers|tongs|tweezers|caliper|forceps|clamp|vice|spanner|wrench)\b/, 'fork'],
  [/\b(screwdriver|awl|skewer|needle|nib|pin|spike|drill bit|bradawl)\b/, 'nib'],
  [/\b(file|rasp|sandpaper|whetstone|strop|hone)\b/, 'slab'],
  [/\b(brush|broom|mop|whisk|comb)\b/, 'brush'],
  [/\b(hook|crowbar|opener|handle|lever|crank)\b/, 'hook'],
  [/\b(ladder|scaffold|trellis|frame|truss|girder)\b/, 'grid'],

  // --- fasteners and small hardware ------------------------------------
  [/\b(screw|bolt|nail|rivet|tack|stud|thread)\b/, 'pin'],
  [/\b(nut|washer|grommet|bearing|ring|hoop|band)\b/, 'ring'],
  [/\b(clip|peg|clothes peg|paperclip|stapler|staple|buckle|zip|velcro|button)\b/, 'clip'],
  [/\b(spring|coil|turnbuckle|shock)\b/, 'coilspring'],
  [/\b(chain|chainmail|mail)\b/, 'grid'],
  [/\b(hinge|bracket|latch|catch)\b/, 'clip'],

  // --- machines and engines --------------------------------------------
  [/\b(engine|motor|turbine|pump|compressor|generator|dynamo|piston)\b/, 'engine'],
  [/\b(mill|lathe|press|loom|gin|forge|kiln|furnace|reactor|centrifuge|laminator|shredder|printer|photocopier|scanner|machine)\b/, 'machine'],
  [/\b(gear|cog|pulley|winch|jack|wheel|axle|hub|spoke)\b/, 'wheel'],
  [/\b(valve|tap|nozzle|hydrant|ballcock)\b/, 'hook'],

  // --- electrics and electronics ---------------------------------------
  [/\b(wire|cable|lead|flex)\b/, 'coil'],
  [/\b(resistor|capacitor|diode|transistor|relay|fuse|switch|thermostat|sensor)\b/, 'chip'],
  [/\b(chip|microchip|processor|wafer|circuit|board|memory|ram|drive|disk)\b/, 'chip'],
  [/\b(battery|cell|accumulator|fuel cell)\b/, 'box'],
  [/\b(magnet|electromagnet|coil|solenoid|transformer)\b/, 'coilspring'],
  [/\b(bulb|lamp|led|torch|flashlight|lantern|spotlight|filament|light)\b/, 'flame'],
  [/\b(screen|monitor|display|touchscreen|television|projector)\b/, 'panel'],
  [/\b(antenna|aerial|dish|radar|satellite)\b/, 'fan'],
  [/\b(speaker|microphone|headphone|megaphone|siren|horn|bell|whistle|buzzer)\b/, 'cone'],

  // --- optics -----------------------------------------------------------
  [/\b(lens|magnifier|spectacles|goggles|glasses|bifocal|monocle|prism|telescope|microscope|periscope)\b/, 'lens'],
  [/\b(mirror|silvered|reflector)\b/, 'plate'],

  // --- paper, books, records -------------------------------------------
  [/\b(book|binder|ledger|almanac|dictionary|compendium|encyclopedia|bible|codex|manual)\b/, 'book'],
  [/\b(paper|papyrus|parchment|card|note|letter|poster|newspaper|map|chart|blotter|receipt|label|stamp|ticket|sticker)\b/, 'card'],
  [/\b(scroll|roll|reel|tape|film|spool|ribbon)\b/, 'spool'],
  [/\b(pen|pencil|quill|crayon|marker|stylus|chalk)\b/, 'rod'],
  [/\b(ink|dye|paint|varnish|glaze|polish|lacquer)\b/, 'liquid'],

  // --- buildings and places --------------------------------------------
  [/\b(house|hut|igloo|yurt|shed|cabin|cottage|barn|silo|tower|skyscraper|cathedral|belfry|lighthouse|chimney|observatory)\b/, 'tower'],
  [/\b(city|town|village|market|harbour|port|quay|farm|orchard|garden|park|field|quarry|mine|factory|works|station|depot|yard|school|library|hospital|theatre|cinema|stadium|restaurant|bakery|shop|office|bank)\b/, 'tower'],
  [/\b(bridge|arch|aqueduct|viaduct|dome|vault|tunnel|canal|dam|dyke|dike|weir|lock)\b/, 'arch'],
  [/\b(wall|fence|hedge|gate|door|window|panel|floor|roof|tile|brick|block|slab|kerb|pavement|road|runway|rail|track)\b/, 'slab'],
  [/\b(room|kitchen|bathroom|studio|theatre|hall|stage|set)\b/, 'box'],

  // --- furniture and the house's contents ------------------------------
  [/\b(chair|stool|bench|table|desk|bed|mattress|shelf|cupboard|wardrobe|drawer|cabinet|bin|box|crate|chest|case|safe)\b/, 'box'],
  [/\b(pillow|cushion|bolster)\b/, 'lump'],

  // --- transport --------------------------------------------------------
  [/\b(car|lorry|truck|bus|tram|train|locomotive|wagon|cart|barrow|trolley|bicycle|motorbike|tractor|bulldozer|forklift|ambulance)\b/, 'wheel'],
  [/\b(boat|ship|canoe|kayak|yacht|barge|ferry|raft|punt|dinghy|submarine|icebreaker|lifeboat)\b/, 'shell'],
  [/\b(aeroplane|airplane|airliner|aircraft|glider|airship|balloon|rocket|kite|parachute|drone)\b/, 'cone'],
  [/\b(sail|rudder|keel|oar|paddle|anchor|mast|propeller)\b/, 'fan'],
  [/\b(tyre|tire|inner tube|wheel)\b/, 'ring'],

  // --- chemicals and materials, by state -------------------------------
  [/\b(acid|alkali|solvent|oil|petrol|diesel|kerosene|alcohol|ethanol|spirit|water|brine|syrup|vinegar|bleach|detergent|shampoo|soap)\b/, 'liquid'],
  [/\b(gas|hydrogen|oxygen|nitrogen|argon|methane|butane|propane|acetylene|chlorine|steam|air|smoke)\b/, 'gas'],
  [/\b(powder|ash|dust|flour|sugar|salt|talc|potash|soda|cement|lime|sand|grit)\b/, 'powder'],
  [/\b(ore|rock|stone|mineral|quartz|flint|obsidian|diamond|crystal|gem|slag|clay|soil|mud|peat|coal|coke|charcoal)\b/, 'lump'],
  [/\b(steel|iron|copper|brass|bronze|aluminium|aluminum|tin|zinc|lead|silver|gold|nickel|chromium|titanium|tungsten|pewter|alloy|ingot|metal)\b/, 'ingot'],
  [/\b(wax|tallow|grease|fat|butter|dubbin|putty|resin|pitch|tar|glue|paste)\b/, 'lump'],
  [/\b(plastic|polythene|polyprop|pvc|nylon|rayon|bakelite|celluloid|rubber|foam|silicone|vinyl)\b/, 'sheet'],
  [/\b(glass|pane|glazing|porcelain|ceramic|stoneware|terracotta|enamel)\b/, 'sheet'],
  [/\b(wood|timber|plank|board|log|plywood|veneer|bark|cork|wicker|reed|cane|bamboo)\b/, 'log'],

  // --- food and growing things -----------------------------------------
  [/\b(bread|dough|cake|biscuit|pasta|pizza|cheese|yogurt|yoghurt|milk|cream|jam|chocolate|honey|meat|fish|egg)\b/, 'heap'],
  [/\b(seed|grain|bean|nut|pod|fruit|berry)\b/, 'seedpod'],
  [/\b(plant|tree|flower|leaf|herb|lavender|moss|grass|hedge|crop|seaweed|yeast|agar|compost)\b/, 'leafy'],
  [/\b(beer|wine|cider|mead|whisky|tea|coffee|lemonade|tonic|juice)\b/, 'bottle'],

  // --- instruments: things whose job is to READ a number ---------------
  [/\b(clock|watch|stopwatch|timer|metronome|chronometer|sundial|hourglass|atomic clock)\b/, 'ring'],
  [/\b(gauge|meter|barometer|thermometer|hygrometer|manometer|scale|balance|weighing|cuff|spectrum)\b/, 'plate'],
  [/\b(compass|sextant|theodolite|protractor|dividers|ruler|tape measure|square|plumb bob|spirit level)\b/, 'cross'],
  [/\b(abacus|calculator|slide rule|log table|counter|register)\b/, 'grid'],
  [/\b(stethoscope|x-ray|ultrasound|sonar|radar|scope|monitor|dialysis|autoclave|incubator)\b/, 'lens'],
  [/\b(gps|semaphore|beacon|buoy|vane|windsock)\b/, 'star'],

  // --- the workshop's big fixtures --------------------------------------
  [/\b(anvil|workbench|bench|assembly line|conveyor|sawmill|robot arm|switchboard)\b/, 'anvilf'],
  [/\b(mould|die|form|template|movable type|seal|stamp|punch)\b/, 'slab'],
  [/\b(bellows|sieve|mortar|millstone|spindle|distaff|bobbin)\b/, 'dish'],
  [/\b(bow|crossbow|slingshot|catapult|sling)\b/, 'arch'],
  [/\b(spade|shovel|hoe|plough|rake|fork|trowel|dustpan|wheelbarrow)\b/, 'wedge'],
  [/\b(corkscrew|helix|auger|drill|bit|reamer)\b/, 'spiral'],
  [/\b(laser|beam|ray|spotlight|projector)\b/, 'cone'],
  [/\b(suture|stitch|bandage|dressing|plaster|splint)\b/, 'roll'],
  [/\b(beehive|nest|hive|coop)\b/, 'seedpod'],
  [/\b(flintlock|musket|rifle|pistol|cannon)\b/, 'rod'],

  // --- energy and weather ----------------------------------------------
  [/\b(fire|flame|spark|ember|torch|candle|furnace|heat)\b/, 'flame'],
  [/\b(ice|snow|frost|freezer|fridge|cool)\b/, 'crystal'],
]

/** When the name says nothing, the element's own tags do. */
const BY_TAG = {
  'liquid|': 'liquid',
  'gas|': 'gas',
  'granular|': 'powder',
  'fibre|': 'fibre',
  'place|': 'tower',
  'energy|': 'flame',
  '|metal': 'ingot',
  '|mineral': 'lump',
  '|organic': 'leafy',
  '|chemical': 'vial',
  '|fuel': 'drum',
  '|tool': 'tool',
  '|textile': 'cloth',
  '|energy': 'flame',
  '|place': 'tower',
}

const registry = readFileSync(REGISTRY, 'utf8')
const gameData = readFileSync(GAME_DATA, 'utf8')
const properties = readFileSync('src/data/properties.ts', 'utf8')

/** id -> display name, read out of the shipping data. */
const names = new Map()
for (const m of gameData.matchAll(/\{ id: '([a-z0-9_]+)', name: '([^']+)'/g)) names.set(m[1], m[2])
for (const m of gameData.matchAll(/\{ id: '([a-z0-9_]+)', name: "([^"]+)"/g)) names.set(m[1], m[2])

/** id -> phase, kind. */
const tags = new Map()
for (const m of properties.matchAll(/^\s*([a-z0-9_]+): P\('([a-z]+)', '([a-z]+)'/gm)) {
  tags.set(m[1], { phase: m[2], kind: m[3] })
}

function formFor(id) {
  if (BY_ID[id]) return BY_ID[id]
  const name = (names.get(id) ?? id.replace(/_/g, ' ')).toLowerCase()
  for (const [pattern, form] of BY_NAME) if (pattern.test(name)) return form
  const tag = tags.get(id)
  if (tag) {
    for (const key of [`${tag.phase}|`, `|${tag.kind}`]) {
      if (BY_TAG[key]) return BY_TAG[key]
    }
  }
  return null
}

const line = /^(\s*)([a-z0-9_]+): \{ form: '([a-z]+)', colour: '(#[0-9a-fA-F]{6})' \},$/gm
let out = registry
let changed = 0
let untouched = 0
const after = new Map()

for (const m of registry.matchAll(line)) {
  const [raw, indent, id, was, colour] = m
  const now = formFor(id) ?? was
  after.set(now, (after.get(now) ?? 0) + 1)
  if (now === was) {
    untouched++
    continue
  }
  out = out.replace(raw, `${indent}${id}: { form: '${now}', colour: '${colour}' },`)
  changed++
}

const spread = [...after.entries()].sort((a, b) => b[1] - a[1])
console.log(`\n${changed} icons reshaped, ${untouched} already right`)
console.log(`${spread.length} forms in use; largest: ${spread.slice(0, 6).map(([f, n]) => `${f} ${n}`).join(', ')}`)
console.log(`smallest: ${spread.slice(-6).map(([f, n]) => `${f} ${n}`).join(', ')}\n`)

if (!DRY) writeFileSync(REGISTRY, out)
