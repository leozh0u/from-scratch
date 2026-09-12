# Direction — what we are aiming at, and what comes next

> `PROGRESS.md` is what has happened and what is open right now. This is the
> longer arc: what the project is trying to be, how it wins, and what to pick
> up next when nobody is there to ask. If you have five spare minutes, the
> answer to "what should I do" is in **Next, in order** below.

---

## The one-sentence claim

**Nothing in this game is invented.** Every recipe is a transformation that
really happens, every figure has a source, and the model that helps build it is
fenced so it cannot quietly make either of those untrue.

Everything below is downstream of that sentence. If a feature would weaken it,
the feature is wrong, however good it looks in a demo.

---

## Where the model is, and why each use is safe

Four distinct uses, two at runtime and two in authoring. The second half of
each line is the part that matters.

**1. "Why not?" — `api/adjudicate.ts`, runtime.**
A player combines two things and nothing happens; the model explains what
actually goes on between them. It receives **two names and a realm, never the
recipe list**, so it cannot recite an answer, and the client only ever renders
its reply as prose. Only the recipe index grants an element. That is structural,
not a promise made in a prompt.

**2. "Learn more" — `api/ask.ts`, runtime.**
Three fixed questions on something already discovered: how is it made, why does
it work, where is it used. The player sends a **question key out of a closed
set of three**; the server owns the wording. Open devtools and the most you can
send is `how`, `why` or `where`. The prompt forbids naming any other material,
suggesting what to make next, or stating any number at all.

**3. The probe — `npm run probe`, authoring.**
Asks the live adjudicator about pairs the graph has no recipe for, and collects
the ones that come back real. This is how the graph grows from the inside: the
model reports gaps it cannot see the shape of. A third of the recipes in the
game arrived this way.

**4. The proposer — `npm run propose`, authoring.**
Drafts whole chains toward a named target into `data/staging/`, which `src/`
cannot import from. **Blocked: needs `GEMINI_API_KEY` in `.env.local`.**

### The fence, in one place

- The runtime endpoints have never seen `gameData.ts` and cannot import it.
- **No model output is ever a number.** Footprint figures come only from
  hand-read sources, and `npm test` fails the build if a recipe with a cost
  cites nothing hand-read.
- No player-typed text reaches a model. Anywhere.
- Every proposal passes `npm run import`, which fetches each citation and drops
  the ones that 404 or lead somewhere else.
- `gameData.ts` is edited by hand, after a human has read the source.

**This is the demo.** It takes fifteen seconds and a devtools window, and it is
the opposite of what most AI projects can show.

---

## Next, in order

Everything here is doable without asking anyone. Cross items off as they land.

1. **Hint mode.** Three per realm, then one per ten found. The solver picks the
   element to hint, because the solver is the thing that actually knows the
   graph; the model only phrases it as a clue, and is never told the answer's
   name. That keeps the fence intact and is a fifth honest use of the model.
2. **Everything's goal becomes completion, not three targets.** The targets bar
   is replaced by what is still missing. The inventory already lists every
   craftable element, found or not, which is most of the work.
3. **Scale the graph.** All three unlocks are built. Author into Everything and
   leave Survival frozen at 18 elements — it is the tutorial, and every element
   added to it lengthens the on-ramp. See **The scale plan** below.
4. **`UNLOCK_EVERYTHING` back to `false`** before submission.

---

## The scale plan

**Where it stands:** 85 elements, 88 recipes. Survival is 18 and frozen.
Everything is 67 and is where all new work goes.

**The three bottlenecks are all removed.**

- *Art*: 23 shared forms in `src/art/forms.ts`, composed from one colour. A new
  element's icon is one line. This was the hard cap.
- *Citations*: the Sourced/Referenced tier plus `npm run links`, which fetches
  every URL and checks its title against the label. 93 of 93 pass.
- *Throughput*: `npm run propose` drafts chains, `npm run import` rejects
  everything provably wrong before a human reads anything.

**The loop, per batch:**

1. `npm run probe` (finds real gaps) or `npm run propose "<target>"` (drafts a
   chain toward something named).
2. `npm run import` — throws out dead URLs, wrong labels, duplicate ids,
   unknown inputs, taken pairs, loops, placeholder verbs.
3. Read the survivors. Decide if each transformation is really real.
4. Paste into `gameData.ts`. Add a line each to `iconRegistry.ts` and
   `properties.ts` — **both, or the build fails**, and it should.
5. `npm test`, then `npm run links -- --new`, then `npm run sheet` and actually
   look at it.

**Two failure modes that have both already happened, so check for them:**

- *Missing properties* pushed the failure table's fallback share from 13% to
  38% in one batch. Adding elements without adding grammar fails the build.
- *Icons that read as each other.* Six of thirteen in the first batch: three
  grey cones, two tan boards, two ingots apart only in hue. The tests cannot
  see this and the contact sheet can.

**Targets worth building toward**, each a chain of real steps rather than a
single element: a bicycle, a window, a book, a brick wall, a battery, a circuit
board, a plastic bottle, a rope bridge, a knife, a lamp.

---

## Hedging, honestly

The strongest thing here is not that the Gemini integration is deep. It is that
the model is **fenced**, and that the fence is demonstrable rather than
described. Most projects in this category can only assert that their model
behaves. This one can open devtools.

Leading with the fence covers the AI-use angle and the responsible-AI angle
with the same thirty seconds of demo, because they are the same fact.

**What not to stretch for.** A judge notices a shoehorn faster than they notice
a missing integration, and a category we did not claim costs nothing. Claim
what is true: an educational game whose content is verifiable, built with a
model that is not allowed to invent any of it.

**Ask an organiser** which sponsor categories actually exist this year and how
the ones that are not on Devpost are judged. Nothing in this file should be
treated as current fact about the event.

---

## Leo's decisions, in his words

Written down because context compacts and files do not. His words, not a
paraphrase — a paraphrase of a decision loses the thing that made it one.

- *"lets stick with two things combined but lets increasen number of things."*
  Two inputs, settled. Three-input combining is dropped.
- *"survival is the tutorial, nice and easy, maybe make that clear... and
  Everyhting is the main layer. with literally everything you can think of,
  from car, to rocket, to wheels, to water bottle, to phone."*
- *"do we keep the 15 for the starter and add much much more for the
  everything."* Yes. Survival is frozen at 18 elements; everything new goes
  into Everything.
- *"the point of everyting is not to get the cotton t shrit, but to unlock
  every possible thing."* Completion is the goal, not three targets.
- *"only allow 3 hints in survival, and 3 in everything, then 1 hint per 10
  found ones."*
- *"that screenshot is the gemini api. thats an issue. i dont want that
  happening. it needs to be a thing."* If the model says a pairing is real,
  either it is a recipe or the model was asked the wrong question.
- *"we need more use out of it to have a high chance of winning."* More of the
  model, through the same fence — never by loosening it.
- *"nothing should look AI generated."* 8-bit everywhere, no exceptions unless
  he says so.
- *"details matter more than movement."*
- *"make sure when i give you important stuff its always rememebered/written
  down."*

---

## Standing rules, which do not bend

- Never invent a number or a citation. Zero is the correct value for an unknown
  footprint. A missing source is better than a plausible-looking wrong one.
- `src/` must never import from `data/staging/`.
- `gameData.ts` is edited by hand after human verification, never generated.
- The model proposes; it never ships.
- 8-bit, everywhere, with no exceptions unless Leo says so. Integer scales, no
  blur, no gradient, no rounded corner that is not a staircase.
- Details matter more than movement.
