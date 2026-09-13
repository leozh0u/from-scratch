# Direction — what we are aiming at, and what comes next

> `PROGRESS.md` is what has happened and what is open right now. This is the
> longer arc: what the project is trying to be, how it wins, and what to pick
> up next when nobody is there to ask. If you have five spare minutes, the
> answer to "what should I do" is in **Next, in order** below.

---

## The pitch, in Leo's words

> *"the point of this site, is to gamify/make it a game/ make it fun to make
> people learn more about the things around them, both lering how thing they
> know are made, but also learn new things completely. we undersatnd it is very
> dumbed down and basic, but its fun. so since it is so dumbed down details can
> be aadded in with the ai gemini api to learn more, and the wikepedia links.
> etc. thats the main pitch."*

This is the sentence every other decision answers to, and it settles an
argument that keeps coming back: **the simplification is not a weakness to
apologise for, it is the on-ramp.** Two things combining into a third is a lie
about how manufacturing works, and it is the lie that gets somebody to find out
that bauxite becomes aluminium. The depth is not removed, it is moved — into
the model's answers and into the citation on every card, both of which are one
press away and neither of which is in the way.

So a feature earns its place by making somebody curious, then having something
real to give them when they are. That is why "why not?" and "learn more" are
buttons rather than automatic text, and why every element carries a source
somebody can open.

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

### The ground rules for every element added

Leo's brief, and the test each candidate has to pass before it is written
down: *"needs to be real, logical, and smart, so able to be figured out and is
realistic. good pixel emojis too. and not toooo niche."*

**1. Real.** The transformation happens in the world, and the citation is
checked by `npm run links`. No exceptions, no "close enough", no chemistry that
only works on paper.

**2. Guessable.** This is the rule that gets broken most, and it is the one
that decides whether the game is fun. A recipe has to be something a thinking
person could ARRIVE at, not merely verify afterwards. Ask: if I held both of
these and wanted this, would I try it? Slaked lime plus sand makes mortar —
guessable. Ethanol over a clay catalyst makes butadiene — real, cited, and
nobody is guessing it, so it only belongs in the game if the two inputs are
things a player already associates with rubber.

Where a step is real but unguessable, the fix is usually to name the
intermediate more plainly rather than to drop the step.

**3. Niche is good — that is the teaching.** Leo, reversing an earlier note of
mine: *"i like niche things, its what helps people learn."* He is right, and
the obscure steps are the ones worth knowing. Almost nobody can name the
process that turns bauxite into aluminium and it is the most interesting thing
in that chain.

So the constraint is not obscurity, it is having a HANDLE. An element earns its
place when its name tells you something and two sentences can explain what it
is for. Wrought iron, slag, potash, quicklime, mordant, retting: obscure, and
every one of them is a door. What to avoid is jargon with nothing to hold on
to — a name that is a formula, a number, or a trade code, where the player
learns a string rather than a thing.

If you cannot write the blurb, the element is the wrong one.

**4. It has to draw.** Every element needs an icon that is distinguishable at
scale 2 in the target list. Two greys of the same shape are one icon and a
bug. `npm run sheet` is the check, and looking at it is not optional — the
tests cannot see this and the contact sheet can. If a candidate has no
distinguishable form, either add a form to the vocabulary or drop the element.

**5. It has to lead somewhere.** Prefer things that are inputs to something
else over dead ends. A branch of the graph that terminates immediately is a
cul-de-sac the player walks into and backs out of. Some leaves are fine — a
book, a mirror — and a realm made of them is not.

**6. The name has to fit a tile.** Eleven characters at the middle size, and
the label test fails the build otherwise. Use the name people actually say:
Polythene rather than Polyethylene, with the formal name in the blurb.

**7. Zero cost unless a human read the source.** Every bulk-added element is
`referenced` and costs nothing. A footprint figure needs someone to have
opened the page and checked the units, and `npm test` enforces it.

**Targets worth building toward**, each a chain of real steps rather than a
single element: a bicycle, a window, a book, a brick wall, a battery, a circuit
board, a plastic bottle, a rope bridge, a knife, a lamp.

---

## The ceiling — how many elements is realistic

**Where it stands: 932 elements, 935 recipes, 920 of them craftable.** Sixty-eight
short of a thousand, which is two batches of thirty.

Leo asked what the realistic maximum is. Four things bind, in this order:

**1. Art, and it is the one that bites first.** Icons are composed from a shared
vocabulary of forms plus one colour. That vocabulary has had to grow three times
already — 20 forms to 65 — and the colour-distance floor has come down from 60 to
38 as density rose. At 65 forms and roughly eleven members each before two tiles
start reading as the same tile, the honest capacity is **around 1,200**. Past that
needs a different kind of sprite, not more shades.

**2. Guessability, which is a design ceiling rather than a data one.** Under 3% of
pairs do anything now. Every element added makes that fraction smaller, so past
some point more content makes the game emptier to explore rather than richer.

**3. Citations.** Every element needs a URL that resolves and whose title matches
its label. This scales linearly with effort and is the slow part, not the hard
part — 926 of 926 currently pass.

**4. Names.** Eleven characters at the middle tile size. This is a real filter:
Polyethylene, Refrigerator and Electron Microscope all had to be renamed.

**The answer: 1,000 is comfortable, 1,200 is the honest ceiling, and stopping at
1,000 is right** — the remaining hours are worth more on the video than on
element 1,050.

### What is actually missing at 932

A 190-item probe across everyday categories — tools, clothing, kitchen,
medicine, music, sport, transport, electronics, food — finds **159 already in the
game**. The 31 absent are all real, buildable from what exists, and enough for one
batch on their own:

> match, belt, cd, crayon, sleeping bag, carabiner, kayak, basketball, tennis
> racket, golf club, sword, armour, shield, wrench, pliers, resistor, capacitor,
> semiconductor, fibre optic, aeroplane, helicopter, train, tyre, windscreen,
> airbag, seatbelt, yoghurt, pasta, soy sauce, tofu, pizza

Transport is the thinnest area (no aeroplane, helicopter, train, and a car with
no tyres or seatbelt), and it is also the most recognisable, so it is where the
next batch should go.

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

Leo: *"the sponsors also shouldnt be a stretch. they have to make sense being
there. not there for the sake of it. so think about it a lot. think about
realistically what we could win."*

### Sponsor by sponsor, honestly

The test each one has to pass: **would this integration exist if the sponsor
did not?** If the answer is no, it is a shoehorn and it costs more than it
earns.

**Claim — Google / Gemini.** The core, and four distinct uses: the "why not?"
adjudicator, the "learn more" questions, the probe that finds gaps in the
graph, and the proposer that drafts chains. What makes it worth a prize is not
the count, it is the **fence**: the runtime endpoints have never seen
`gameData.ts` and cannot import it, the player cannot send free text, and no
model output is ever a number. Fifteen seconds and a devtools window proves it.

**Claim — Ken Kennedy Institute (responsible AI).** The strongest fit after
Gemini and probably the least contested. Most submissions in this category
*describe* how their model behaves. This one has a build step that **fails**
when the rule is broken: `npm run links` fetches every citation and checks its
title against its label, `npm run import` rejects fabricated URLs by their 404,
and `npm test` fails if a recipe carries a footprint figure without a hand-read
source. The rule is enforced by the repository, not promised in a prompt.

**Claim — GoDaddy.** A domain. Not a shoehorn in any direction: the game needs
a URL a judge can type, and a `vercel.app` subdomain is worse than one. Twenty
minutes.

**Claim — Games & Gamification.** Obviously, and it is the thinnest field.

**Conditional — MathWorks.** There is a genuine fit and it is worth stating
because it is not obvious. Computing embodied footprint over a graph where
sub-paths are shared is **Leontief input-output analysis** — the standard method
in life-cycle assessment, and exactly what this game claims to do. Build the
recipe graph as a sparse matrix in MATLAB, solve for total embodied water and
CO2 per element, export a lookup table the game reads at runtime. Never call
MATLAB live.

The catch is real: **most footprints here are zero**, because a figure needs a
human to have read the source, so the matrix would be mostly zeros and the
result would be technically correct and substantively empty. Making it mean
something needs forty to sixty hand-read figures along one chain — the cotton
t-shirt, say — and that is hours of reading, not hours of coding.

**So: worth it only if a teammate takes the sourcing.** It must not come out of
the video's time.

**Skip — Tiger Data.** This is the stretch, and naming it is the point of this
list. The game has no backend storage and no time-series data **on purpose**.
The nearest honest use would be logging anonymous combine attempts to show
which pairs people try — genuinely interesting, and in direct contradiction with
the thing we lead with, which is that nothing leaves the browser and there are
no accounts. Either the use is fake or the pitch is weaker. Skip.

**Skip — ElevenLabs.** The audio is 8-bit and the standing rule is that nothing
looks or sounds AI-generated. Narration over the demo video is a video asset
rather than a product feature, and a judge can tell which one they are being
shown.

**Skip — Persona, Backboard.** Both need an account. There are none, deliberately.

**Skip — Vultr.** It is deployed and working on Vercel. Moving hosting the day
before submission to claim a prize is how the demo gets lost.

**Skip — Capital One, Solana.** No finance angle that is not invented.

**Marginal — Lilie.** Judged on venture potential. There is a real story — a
classroom tool where every claim is sourced — but it is a free educational game,
and a weak venture pitch beside a strong product one costs credibility.

**Nearly free — Notability**, if anyone kept the ideation notes from hour zero.

### What could realistically win

Four claims, all defensible: **Games**, **Gemini**, **Ken Kennedy**, **GoDaddy**.
Games is the thinnest field and this is a finished game with 932 sourced
elements. Ken Kennedy is the least contested and the best fit on the merits.
Gemini's field is crowded, but the fence is an unusual angle in it.

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
- *"the point of this site, is to gamify... make it fun to make people learn
  more about the things around them, both lering how thing they know are made,
  but also learn new things completely. we undersatnd it is very dumbed down and
  basic, but its fun. so since it is so dumbed down details can be aadded in with
  the ai gemini api to learn more, and the wikepedia links. etc. thats the main
  pitch."* See the top of this file.
- *"if 500 comes easy aim for 800, or even 1000. 1000 would be a great number to
  say, like there are over 1000 combinations etc etc. make sure they all make
  sense though."*
- *"in reality, whats around the max you can do/think of thats realistc and the
  logic makes snese."* Answered in **The ceiling** below.
- *"the sponsors also shouldnt be a stretch. they have to make sense being there.
  not there for the sake of it. so think about it a lot. think about
  realistically what we could win."*
- *"the size of this block is inconsistent as it gives the explanations for wrong
  combinations, hints, etc. that kind of trips up the location of the items below
  which is bad for the user experience."* Fixed: the bench has one fixed-height
  readout, and the two replies whose length cannot be known in advance — the
  model's prose and the give-up route — open panels.
- On the demo video: *"after the fun intro, for the demo, i think we can play a
  bit, then time lapse finishing the game, or going far. like very very speedy
  time lapse."*

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
