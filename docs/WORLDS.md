# Worlds

Leo, 2026-09-23: *"themes/challenges/kinda like other planets in other video
games, like football everything you need to play football, fencing, you can do
it for so many... make sure its consistent with the same art and background...
think about what themes would be good, what you need to start with, plan it
out."* Then: *"make sure youre considering how it looks, bugs, edge-cases."*

## What a world is

A small planet with one job: **make everything you need to do one thing.**
Football is a ball, boots and a goal. Each world is Survival's shape again, a
short list of starters, three targets, the target strip at the top, and a shelf
that only shows what can be made there. It is the same game on a different
planet, not a new mode.

- **Its own save.** You land with only the starters. Everything's thousand
  discoveries do not follow you, or every world would open already solved.
- **Unlocked with Everything.** Finish Survival (or skip it, or pick Cheater)
  and the worlds open. Survival is still where the verb is taught.
- **One graph.** A world uses the same 1,000 elements and the same recipes.
  Stone on stone still makes a sharp stone on the football planet. What a world
  chooses is only where you start and what you are aiming for.
- **You already know fire.** A world that needs heat hands over fire, because
  you learned it in Survival and re-rubbing sticks on every planet is chores.

## The five

| World | The kit | Starters | Crafts | Why this one |
| --- | --- | --- | --- | --- |
| Football | football, football boots, goal | wood, stone, plant fibre, water, hide, latex, sulfur | 12 | Leo asked first. Goodyear's vulcanised ball, 1855, is a real story |
| Fencing | blade, mask, jacket | fire, wood, water, iron ore, copper ore, raw cotton, beeswax | 16 | Leo fences. Quench-and-temper steel is the lesson |
| Chess | chessboard, chess pieces, sandglass | fire, wood, stone, water, iron ore, limestone | 17 | Chess was timed with sandglasses before the clock existed |
| Drums | drum, drumsticks, cymbal | fire, wood, water, hide, iron ore, limestone, copper ore, cassiterite | 15 | Leo drums. A cymbal is hammered bronze |
| Navigation | compass, map, sextant | fire, wood, stone, water, iron ore, limestone, lodestone, hide, copper ore, cassiterite | ~19 | The hard one: magnetism, parchment and glass |

Rules every world keeps, all asserted by tests rather than hoped:

1. Three targets, each something you would hold.
2. Starters are natural: dug, grown, gathered or tapped, plus fire. Nothing
   manufactured is handed over.
3. Every starter is used on the way to the kit. No dead tiles.
4. Every target is reachable from that world's starters alone.
5. Every recipe on the kit's path is physically true. Where the shared graph was
   wrong on a path, it is fixed for everyone, not worked around.
6. A world's name fits the HUD at every width (ten characters or fewer).

## Graph changes this needs

New raw materials, added to Everything's starters too so the one graph stays
whole: **hide, latex, sulfur, cassiterite (tin ore), lodestone.**

Fixes to existing recipes that were false, found because a world walks through
them:

| Element | Was | Now | Why |
| --- | --- | --- | --- |
| leather | tannin + wool | tannin + hide | Leather is tanned skin. Wool is not skin |
| glue | leather + filtered water | hide + water | Hide glue is boiled from untanned hide; tanning is what stops leather dissolving |
| tin | slag + charcoal | cassiterite + charcoal | Tin comes from its own ore, not iron slag |
| lodestone | iron ore + copper ore | raw | Lodestone is magnetite magnetised in the ground, not a mix of two ores |
| parchment | leather + chalk | hide + quicklime | Parchment is limed, untanned hide |
| glass pane | molten glass + slag | molten glass + tin | Float glass is poured onto molten tin |
| chess set | dice + plywood | chessboard + chess pieces | A chess set is a board and pieces |

New elements: vulcanised rubber, football boot, goal, fencing jacket,
chessboard, chess pieces, sandglass, drumsticks, cymbal. New routes to existing
ones: football (leather + vulcanised rubber), rubber pad, net (cordage +
cordage), drum (hide + wood).

## How it looks

Nothing new is drawn from nothing. Consistency is the brief.

- **The picker is a sky of planets.** Same starfield, same arc title, same
  pixel buttons as the title screen. Each world is a small turning planet, the
  title Earth's own renderer with a world's palette and its coastlines mirrored
  so it is not Earth again.
- **Backdrops are the two scenes Leo supplied, re-lit.** Every colour in the
  forest and the city is remapped to a mood (autumn, winter, dusk, night), one
  pixel for one pixel, so the art stays one hand's. New paintings would not
  match; these cannot help matching.
- **The workspace is untouched.** Same HUD, same target strip, same bench, same
  tiles. The HUD says the world's name and its back key says WORLDS.

## Edge cases, each with a test

- Reset on the title screen wipes every world too. "Start over" has one meaning.
- A world save from an older build naming retired ids is pruned, like the main save.
- Blocked or corrupt storage starts the world fresh rather than crashing.
- Cheater reveals the kit's parts, not the whole planet's reach.
- The made counter counts the kit's parts, not everything reachable.
- Hints point at the kit, not at whatever is shallowest.
- Back from a world lands on the picker, and back from the picker on the title.
- The picker and every world pass the 14-device layout suite.
