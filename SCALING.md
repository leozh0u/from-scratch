# How big can this get, and what it costs

## Where we are

| | Little Alchemy 1 | Little Alchemy 2 | From Scratch |
| --- | --- | --- | --- |
| Elements | 580 | 720 | **72** |
| Recipes | ~1,300 | ~5,000 | **74** |
| Starters | 4 | 4 | **12** (3 in Survival) |
| Every recipe true? | no | no | **yes** |
| Every number sourced? | n/a | n/a | **yes, 79 citations** |

That last row is the whole difference, and it is also the entire reason we are
at 72 instead of 720. Little Alchemy's elements are free to author because
nothing has to be true: unicorn, ninja, life. Ours cost a citation each.

We went from 43 to 72 today. That rate is about **20 to 25 elements an hour**
when I am designing a coherent chain, and it is limited by three things.

---

## The three bottlenecks, and how to remove each

### 1. Sprites — the hard cap

78 hand-drawn 11x11 sprites so far, and the data test refuses to let two
elements share one. At two minutes each, 300 elements is seven hours of
drawing alone. This is the real ceiling, not the recipes.

**The fix is a sprite vocabulary.** Almost every element in a game about
materials is one of about twenty *forms*: powder, liquid, ingot, sheet, fibre,
bolt of cloth, gas, lump, crystal, bottle, machine, tool, plant, fruit, board,
coil, brick, pellet, flame, dust. Draw each form once, then give each element a
palette from its own properties.

Two hundred elements becomes twenty drawings and two hundred colour triples.
The "no two elements share a sprite" test still passes, because a recoloured
form is a different bitmap. This is already sketched in `ARCHITECTURE.md` and
never built.

**Cost: about 2 hours. It removes the ceiling entirely.**

### 2. Citations — hand-verification does not scale

Every element and recipe currently carries a source a human read. Nobody can
read 600 of those before morning, and inventing them is the one mistake that
would destroy the project.

**The fix is already designed in `ARCHITECTURE.md`: two tiers, stated in the
UI.**

- **Sourced** — a human checked the source says what we claim, and the units
  are right. All 74 current recipes. **Every footprint number stays here.**
- **Referenced** — the transformation is real and the element links to an
  article that *provably exists*: a script fetches every URL, asserts HTTP 200,
  and asserts the page title matches the claimed label. No numeric claim is
  made.

This is a **stronger** position than pretending everything is hand-checked,
because Referenced is machine-verifiable at any scale and hand-checking is not.
A judge asking "how do you know the model didn't invent this?" gets: the model
never ships a number, and every article it cites is fetched and checked in CI.

**Cost: about 1 hour for the checker and the UI badge.**

### 3. Authoring throughput

`npm run probe` already asks the live adjudicator which missing pairs are real,
and a third of today's recipes came from its answers. The missing half is the
other direction: generating whole *chains* toward a named target.

`scripts/propose.ts` does this and has barely been used. With the link checker
above, a proposed chain can be auto-rejected before a human ever sees it if any
URL 404s, which is most of the bad ones.

**Cost: about 2 hours to wire probe and propose into one import pipeline.**

---

## What that buys, honestly

With the three unlocks built, review throughput goes to roughly **60 to 100
elements an hour**, because the work becomes reading a proposed chain and
saying yes or no rather than drawing and searching.

| Target | Work after the unlocks | Total from now |
| --- | --- | --- |
| 150 elements | ~1 hour | **~6 hours** |
| 250 elements | ~2.5 hours | **~7.5 hours** |
| 400 elements | ~5 hours | **~10 hours** |
| 720 (Little Alchemy 2) | ~11 hours | **~16 hours** |

It is 17:00 on Saturday. Submission is 09:00 Sunday: **16 hours**.

So 720 is arithmetically reachable and is the wrong target, because it uses
every remaining hour and the video is not shot, the Devpost is not written, and
your teammates are still holding footage of a UI that no longer exists. Those
are worth more marks than element count, and a judge will never count elements.

**My recommendation: build the three unlocks, aim at 200 to 250, and stop
authoring at about 02:00.** That is three times Little Alchemy 1's *starting*
impression, it looks and plays deep, and it leaves the night for the artifact
that actually gets judged.

---

## On combining more than two

Little Alchemy is **strictly two**, in both games. You drag one element onto
another and that is the entire interaction. What feels like more is chaining.

I would keep two, and the reason is the part of this game I spent the afternoon
on. Seventy-two elements give 2,554 pairs that are not recipes, and the rule
table explains 87% of them in half a millisecond. Three inputs gives roughly
**62,000 triples**, and there is no grammar that says why a particular three do
not work — every one of them would fall back to "nothing obvious happens",
which is the failure this game exists to avoid.

The things that genuinely take three inputs are better as chains anyway,
because chaining *names the intermediate* and the intermediate is the lesson:

- Concrete is cement + sand + water. As a chain it is limestone + clay ->
  **raw meal** -> **cement** -> concrete, and now you know what raw meal is and
  where the carbon leaves.
- Gunpowder is saltpetre + charcoal + sulphur. As a chain you meet each one.

Two inputs is what keeps failure explainable, and explaining failure is the
pitch. If you still want three, it is a slot in the UI and a change to the
recipe index, about an hour — but it costs the thing that makes this more than
a clone, so I would want you to say so deliberately.
