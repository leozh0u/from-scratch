# Worlds

Leo, 2026-09-23: *"themes/challenges/kinda like other planets in other video
games, like football everything you need to play football, fencing, you can do
it for so many... make sure its consistent with the same art and background...
think about what themes would be good, what you need to start with, plan it
out."* Then: *"make sure youre considering how it looks, bugs, edge-cases."*

Called **planets** on screen and **worlds** in the code. The word changed on
screen because Silkscreen's bold `W` fills its own gaps and prints as a block
in the wordmark; "planets" is also the word Leo used.

## What a world is

A small planet with one job: **make everything you need to do one thing.**
Football is a ball, boots and a goal. Each world is Survival's shape again: a
short list of starters, three targets, the target strip at the top, and a
shelf that only shows what can be made there. It is the same game on a
different planet, not a new mode.

- **Its own save.** You land with only the starters. Everything's thousand
  discoveries do not follow you, or every world would open already solved.
- **Unlocked with Everything.** Finish Survival (or skip it, or pick Cheater)
  and the planets open. Survival is still where the verb is taught.
- **One graph.** A world uses the same thousand elements and the same recipes.
  Stone on stone still makes a sharp stone on the football planet. What a world
  chooses is only where you start and what you are aiming for.
- **You already know fire.** A world that needs heat hands over fire, because
  you learned it in Survival and re-rubbing sticks on every planet is chores.

## The five, as shipped

`src/data/worlds.ts` is the source of truth; this table is a copy of it.

| World | The kit | Starters | Crafts | Backdrop |
| --- | --- | --- | --- | --- |
| Football | football, football boots, goal | fire, wood, stone, plant fibre, water, hide, latex, sulfur | 13 | forest, autumn |
| Fencing | blade, mask, jacket | fire, wood, stone, water, iron ore, soil, beeswax | 19 | city, dusk |
| Chess | chessboard, chess pieces, sandglass | fire, wood, stone, water, iron ore | 16 | city, night |
| Drums | drum, drumsticks, cymbal | fire, wood, water, hide, iron ore, copper ore, tin ore | 14 | forest, dusk |
| Navigation | compass, map, sextant | fire, wood, stone, water, seawater, iron ore, lodestone, hide, limestone, copper ore, tin ore | 19 | forest, winter |

Rules every world keeps, all asserted in `scripts/worldtest.ts`:

1. Three targets, none of them handed over.
2. Starters are natural: dug, grown, gathered or tapped, plus fire. Nothing
   with a recipe is handed over except fire.
3. Every starter is used on the way to the kit. No dead tiles.
4. The whole kit is makeable from that world's starters, in order.
5. Between 10 and 20 crafts. A challenge, not a chore.
6. The name fits the HUD at every width (ten characters or fewer).
7. Nothing a world needs leaks onto Survival's shelf. The tutorial's reach is
   pinned to its nineteen ids.

## How it was decided

A council of three reviewers read the first draft of this plan before any UI
was written: one on game design and physical truth, one on UI and art
consistency, one on engineering and edge cases. Then a fresh critic judged the
built feature against a fixed checklist. What changed because of them:

- **Physics.** The first draft walked through recipes that were false:
  pig iron *carburised* into steel (it already has more carbon than steel; it
  is fined to wrought iron first), a fencing blade made of two steels, a mask of
  copper mesh, a mirror "silvered" with lye, salt boiled out of fresh water,
  soda ash from salt and quicklime (the carbonate comes from the limestone's own
  CO2, which quicklime has already lost), a compass needle of soft iron. All
  corrected in the one graph, so Everything is truer too.
- **A leak.** `cordage + cordage -> net` would have put a football net on the
  tutorial shelf, the bug this whole pass started from. The net's second road
  is `cordage + tannin` instead: nets were preserved by tanning ("barking").
- **Honest receipts.** Potash glass was first added as a second road to molten
  glass. With no measured footprint beside the soda-lime melt's 0.27 kg, the
  receipt would have said "the other route would have saved 0.27 kg". Forest
  glass is its own element instead, and a data test now forbids an unmeasured
  road beside a measured one.
- **Layout.** A third door on the title screen broke its fit at 168 of the
  window sizes its layout search sweeps. The planets key sits beside the
  inventory key instead and costs no height.
- **Edge cases.** A world sends `everyday` to the adjudicator, not the
  tutorial's `survival`; each world owns its hook, keyed by id, so switching
  planets cannot write one save into another; the title's reset clears every
  world; a save of the wrong shape costs that field, not the game.

## Graph changes

New raw materials, added to Everything's starters too so the one graph stays
whole: **hide, latex, sulfur, tin ore, lodestone, seawater.**

Recipes corrected because a world walks through them (most were contradicting
their own element's blurb):

| Element | Was | Now |
| --- | --- | --- |
| leather | tannin + wool | tannin + hide |
| glue | leather + filtered water | hide + water |
| tin | slag + charcoal | tin ore + charcoal |
| lodestone | iron ore + copper ore | raw |
| parchment | leather + chalk | hide + quicklime |
| glass pane | molten glass + slag | molten glass + tin |
| wrought iron | quicklime + pig iron | pig iron + charcoal (fining) |
| high-carbon steel | pig iron + charcoal, or wrought iron + charcoal | wrought iron + charcoal only |
| steel wire | tempered steel + wire mesh | high-carbon steel + hardened steel |
| wire mesh | copper wire + hardened steel | steel wire + steel wire |
| fencing blade | tempered steel + hardened steel | tempered steel + stone (grinding) |
| fencing mask | wire mesh + cotton jersey | wire mesh + cotton drill |
| mirror | glass pane + sodium hydroxide | glass pane + tin |
| hourglass | glass blowing + sugar | forest glass + silica sand |
| drum | leather + pot | hide + wood |
| chess set | dice + plywood | chessboard + chess pieces |
| salt | water + fire | seawater + fire |
| soda ash | salt + quicklime, or limestone + salt | limestone + salt only |
| compass | lodestone + wrought iron | lodestone + high-carbon steel |

New elements: rubber compound, vulcanised rubber, football boots, goal, cotton
drill, fencing jacket, chessboard, chess pieces, drumsticks, forest glass,
seawater, and the raw materials above. New named second roads: football
(vulcanised), rubber pad (vulcanised), net (barked cord), cymbal (bronze).

**Still wrong, and not on any world's path**, left for whoever works on the
Everything graph next: stone + sulfuric acid -> cinnabar, slag + water ->
sulfuric acid, slag + coke -> zinc, slag + aluminium sheet -> chromium, slag +
fire -> lead, benzene + sulfuric acid -> nylon, phenol + wood ash -> bakelite,
porcelain + wood ash -> bone china, farmland + sharp stone -> wool, wool + knife
-> quill, water + vinegar -> cheese, cheese + pot -> butter, compost + stone ->
coal, natural gas + steel frame -> liquid oxygen, farmland + cart wheel ->
flour. These are bulk imports from the hackathon; their citations are
link-checked, which proves the article exists and nothing more.

## How it looks

Nothing new is drawn from nothing. Consistency is the brief.

- **The picker is a sky of planets.** Same starfield, same arc wordmark, same
  pixel keys as the title screen. Each world is a small turning planet: the
  title Earth's own renderer in the world's colours, its coastlines mirrored
  and started at a different longitude so it is not Earth again, with an
  outline on the rim that small discs otherwise lose.
- **Backdrops are the two scenes Leo supplied, re-lit.** Every colour in the
  forest (eight) and the city (sixteen) is remapped to a mood: autumn, winter,
  dusk, night. One colour for one colour, so the drawing, the grid and the hand
  are untouched. `src/art/moods.ts` holds the rules; `npm run relight` writes
  the PNGs; the scenes' moving parts (tufts, leaves, clouds, lit windows) go
  through the same rules at runtime, and the city still finds its windows and
  clouds in the daylight picture.
- **The workspace is untouched.** Same HUD, same target strip, same bench, same
  tiles. The HUD says the world's name, its back key says PLANETS, and a
  finished world's key on the picker turns the same orange a made target does.

## Counters, hints and Cheater in a world

- **Made** counts crafts toward the kit, measured from where the player is:
  the kit's shortest route from its starters is the denominator, and progress
  is how much of it no longer stands between the player and the kit. Taking a
  different road still ends at full; wandering off to make a hand drill does
  not move it.
- **Hints** point at the next steps of the kit, not at whatever is shallowest.
- **Give up** takes the shorter of two roads from where the player stands.
- **Cheater** lays out the kit's parts and starters, not the hundreds of
  things iron, fire and water can reach.
- **Inventory** lists the kit's parts, and anything else made there, and its
  reset starts only that planet over.
