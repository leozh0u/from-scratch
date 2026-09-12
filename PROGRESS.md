# From Scratch — running log

> Written so work can be resumed in a fresh session with no context. Newest
> section at the bottom. `CLAUDE.md` is what the project is; `DESIGN.md` is
> what it should look and feel like; this is what has happened.

---

## 2026-09-12, Saturday afternoon — Leo joins

### Context

Leo and Nathalie's group started as one team at HackRice 16, split up to try
separate ideas, and always planned to possibly recombine. Leo has been building
DREAD (a webcam-pulse horror game, `~/Projects/dread`) and is now joining From
Scratch. He has been added as a contributor and **has creative control of the
UI and the game feel**. Nathalie and Eliza are filming the video.

Submission deadline: **Sunday 2026-09-13, 9:00 AM.**

### Setup done

Cloned to `~/Projects/from-scratch` at `bf70f4a`.

- `npm install` — clean.
- `npm run build` — passes (`tsc -b` then vite, ~300ms).
- `npm run solve` — passes, no issues.
- Dev server registered in `~/Projects/.claude/launch.json` as `from-scratch`
  on **port 5174**, not 5173. DREAD holds 5173 and both need to run at once.

### State of the project as found

23 commits over ~13 hours, ~4,600 lines of TS/TSX. Nathalie 21 commits, Eliza 2.
Deployed and working at `from-scratch-three.vercel.app`. Verified by playing it
in a browser: realm select → flint + high-carbon steel → Spark, with a real
citation on the discovery card. The Gemini adjudicator answers failed
combinations correctly in production.

**What is genuinely strong:**

- The sourced data is real work. `gameData.ts` cites Chapagain & Hoekstra 2006
  Table 9 and splits the famous "~2,700 L per t-shirt" figure into its actual
  components — 1,230 L irrigation + 1,110 L rainfall + 380 L dye-effluent
  dilution — and assigns each to the step that spends it. The comments record
  two recipes corrected against sources after the concept doc got them wrong.
- The adjudicator's injection defence is architectural, not prompt-based: the
  endpoint receives only the two element *names*, and no code path turns model
  text into a discovery. Their comment says so explicitly.
- Client-side rate limiting and persistent caching protect the Gemini credit.
- 45 hand-authored pixel sprites, art stored as text.

### Problems found

**1. The receipt is empty for most targets.** The Everyday realm's entire
lesson is the hidden cost of ordinary objects, and of its three targets:

| Target | Water | CO2 |
| --- | --- | --- |
| Cotton T-Shirt | 2,720 L | **0** |
| Aluminium Can | **0** | 0.178 kg |
| Glass Bottle | **0** | **0** |

In the whole game there are exactly **three** recipes carrying any cost
(`gameData.ts` lines 368, 417, 475). The payoff screen — the thing the premise
builds toward — has nothing to show for the glass bottle and half a story for
the other two. **This is the single biggest content hole and it sits exactly
where the pitch lives.**

**2. No tests at all.** Zero. For a project whose whole claim is that the
numbers are right, and whose core is a DAG with footprint arithmetic over it,
this is the most obvious gap available. `npm run solve` is a CLI report, not an
assertion.

**3. The adjudicator takes 5–10 seconds.** The UI shows "Hmm…" the whole time.
Long enough that it reads as broken — it did to me before it resolved.

**4. Cross-realm inventory clutter.** Entering Survival — the tutorial realm,
three targets — shows 26 tiles including bauxite, manganese and silica sand
from the other realm.

**5. README is still the unedited Vite template.** First thing a judge
browsing the repo sees.

### Track finding — this changes the plan

Checked the live Devpost rather than trusting the handbook. **There is no Games
or Gamification track.** The three tracks are **Fintech**, **Health**, and
**Machine Learning/AI**. A project picks at most one track, unlimited
challenges.

→ **From Scratch enters Machine Learning/AI.** Full sponsor analysis in
`DESIGN.md` §5. Short version: Gemini is already earned and strong; GoDaddy and
Notability are nearly free; MathWorks, ElevenLabs and Backboard are worth real
effort in thin fields.

### Design direction set

Leo supplied a Figma mock: deep navy starfield, large pixel Earth cropped by
the viewport, arced Press Start 2P wordmark, chunky lowercase pixel buttons.

**This reverses the codebase's stated design philosophy.** `src/index.css`
currently commits in writing to "retro backdrop, crisp panel — don't leak scene
styling into the panel". The new direction is pixel all the way through. Full
brief, principles and techniques in `DESIGN.md`.

Leo's stated veto: **nothing may look AI-generated.** That rules out NES.css,
RPGUI, soft shadows, blurs, smooth gradients, and evenly-spaced decoration.
Reference point is his own Vestigo (`~/Projects/vestigo`, vestigo.earth), whose
interaction code argues that weight and momentum are what make a control feel
like an object.

### Open

- Leo is still describing the game's logic and goals — more direction incoming.
- Nothing has been changed in the repo yet beyond adding `DESIGN.md` and this
  file. No commits pushed.

### Architecture plan written — `ARCHITECTURE.md`

Leo's direction: Little Alchemy scope, accurate pixel "emoji" for every object,
sound logic, failures explained, Nintendo theme throughout, education gamified.
Reference for the conversational part is his portfolio terminal — curated,
instant, deterministic, feels like an LLM without being one.

The number that decides the design: **over 98% of possible pairs fail.** Little
Alchemy 2 is ~720 elements and ~5,000 recipes out of 168,490 possible pairs. At
300 elements there are 45,150 pairs. So the failure case is not an edge case,
it is the main loop, and in an educational game that is where the teaching has
to happen.

Three decisions recorded there:

1. **Two-speed response.** An instant local rule table answers every failure
   categorically (state + material class + raw/processed/finished), and the
   Gemini call becomes an opt-in "why not?". Fixes the measured 5–10s latency,
   scales the credit with curiosity instead of flailing, and teaches the
   *grammar* of making rather than 45,000 disconnected facts.
2. **Tiered provenance.** "Sourced" (human-verified, cited, carries numbers)
   vs "Referenced" (transformation real, reference URL automatically fetched
   and asserted 200 + title match, no numeric claim). Nothing else ships.
   Makes traceability machine-verifiable at scale, which the current manual
   rubric cannot be. Footprint numbers stay Sourced-only.
3. **Sprite vocabulary.** Hand-draw a set of forms — powder, ingot, sheet,
   vial, gas, lump, coil, tool, product — each authored once in the existing
   text format and recoloured per material. Hand-drawn shape, data-driven
   palette. Bespoke art only for targets and demo-path elements.

Open questions for Leo are listed at the end of that file: how big "huge"
actually is, where the Nintendo zoom-out shot belongs, and how Layer 1 should
be worded so Layer 2's "that's actually real" stays a reveal rather than a
contradiction.

---

## Title screen rebuilt to the Figma direction

Leo confirmed his instructions override the codebase's stated visual
philosophy, so `src/index.css`'s "retro backdrop, crisp panel — don't leak
scene styling into the panel" is deleted rather than worked around. One world,
pixels throughout.

### The Earth is real geography, not drawn by eye

`scripts/makeLandMask.mjs` decodes NASA's Blue Marble land mask (public domain,
taken from `~/Projects/vestigo`, credited the same way), area-averages it down
to a 360x180 one-bit grid and writes `src/art/landMask.ts` (~11KB). It asserts
the resulting land fraction lands between 20% and 45% — Earth is ~29% land and
an equirectangular grid over-weights the poles — so a bad decode fails loudly
instead of shipping a wrong planet. Verified by rendering the mask as ASCII:
the Americas, Eurasia, Africa, Australia and Antarctica are all where they
should be.

`PixelEarth.tsx` projects that mask orthographically onto a sphere every frame
with a real 23.4° axial tilt, and rotates continuously. Canvas rather than SVG
because this redraws every pixel per frame. Six colours, two discrete shading
bands, hard one-pixel rim — no gradients anywhere.

Chosen over committing pre-rendered rotation frames: a dozen 64x64 sprites is
~65KB of uneditable text that locks the resolution and steps instead of
turning.

### New components

- `Starfield.tsx` — seeded hash so the sky is identical on every load and can
  be art-directed; density gradient so it is not a uniform CSS pattern;
  twinkling steps between three fixed greys rather than fading, because a fade
  is a sub-pixel alpha ramp. Capped at ~12 redraws/sec.
- `ui/PixelButton.tsx` — the atom everything inherits from. The face translates
  down by exactly the height of the dark block beneath it, which vanishes.
  **No transition on the press**; the old `Button` had the right mechanic and
  killed it with `transition-all duration-100`. Press state is tracked across
  pointer *and* keyboard, because the old one used `:active` and was visually
  dead for anyone pressing Enter.
- `ArcTitle.tsx` — per-letter rotation snapped to whole degrees, not a warped
  line. Flagged in `DESIGN.md` that a hand-drawn arc sprite is the safer answer
  if it reads badly at final size.

### Progression gate

`App.tsx` computes `everydayUnlocked` from whether all of Survival's targets
are discovered, rather than storing a flag — it can never disagree with what
the player actually did, and survives a reset for free.

### Two bugs found by looking at it on screen

1. **Locked buttons used `opacity: 0.55`.** Fine on a flat background;
   over the planet the globe showed straight through the button face and the
   label became unreadable. Locked is now its own muted, fully opaque palette.
2. **Ice cap was a white stripe across the picture.** The globe is cropped to
   its northern crown and the axial tilt turns that pole toward the viewer, so
   a 68° ice threshold painted a band through the middle of the frame. Moved to
   81°.

Horizon depth was tuned by looking: half the diameter matches the mock most
literally but puts bright green land behind the small type, which no drop
shadow rescues. Three quarters keeps every word on flat navy.

### Wind animation technique researched

From SLYNYRD's Pixelblog 33, the real numbers: trees use one wave per loop with
each layer moving up-and-right 1px, down 1px, left 1px to return, at 0.2s per
frame. Grass is 4 frames with 2–4 positions per leaf. Cloth uses flow points
12px apart moving 2px/frame over a 6-frame loop.

**The key point: sway is whole-pixel offsets per layer with a phase delay, not
a rotation or a skew.** A rotation resamples the pixel grid and destroys it.
This is what the forest and the city scenes should be built on. Not yet built.

### Still open

- Forest scene for Survival, city scene for Everyday — not started.
- Survival still shows all 26 starters including Everyday's. Needs trimming to
  a minimal set, per Leo's direction.
- No sound yet.

---

## LEDGER

Everything Leo has asked for, with a state and, for anything marked done, the
check that proved it. Nothing leaves this list silently. The **oldest** open
item is the one most at risk, so it is first.

Last verified: 2026-09-12, against commit `36ba79b` and the live deployment.

## Open

| # | Asked | State | Next |
| --- | --- | --- | --- |
| 1 | `UNLOCK_EVERYTHING` back to `false` | **open — blocks submission.** Verified still `true` at `src/App.tsx:30`. | One-line change. Leo asked for it on while iterating on Everyday Objects; Survival is now ~15 combinations so the gate is reasonable again. Must flip before 09:00. |
| 2 | *"we want things that cant go together also explained why"* — the instant failure copy | **open.** Nine rules and a fallback; pairs with no matching clause still get "nothing obvious happens". The pair count went from 903 to 1,596 with the rebuild, so this matters more than it did. | Widen the rule table. It is local, instant and cannot be wrong, unlike the model. |
| 3 | *"should we add a small chat for more questions"* | **open — needs Leo's call.** Recommended against: the endpoint never sees the recipe list, which is what makes "the model cannot grant a discovery" structural rather than a promise. A free-form chat gives that up. | His decision. |
| 4 | Silkscreen is caps-only, so the wordmark reads FROM SCRATCH | **open — needs Leo's call.** Verified by rendering `a` and `A` and comparing bitmaps. Jersey 10/15/25 are pixel sans faces with true lowercase and a distinct `c`, checked the same way. | One-line swap either way. |

## Blocked on Leo

| Asked | State |
| --- | --- |
| Teammates filming the old UI | **blocked.** They need https://from-scratch-three.vercel.app and almost certainly a re-shoot; the UI is unrecognisable from this morning. |

## Done, with the check that proved it

| Asked | Check |
| --- | --- |
| *"we want the scope to be huge"* — Little Alchemy scale | Played both realms through in the browser from the three starters. Survival 3 starters to 3 targets in 15 combinations; the aluminium can's receipt lists 22 ancestors back to stone, wood and plant fibre. `npm run solve` passes, 57 elements, 51 recipes. |
| *"can you plan the entire system"* | `GAMEPLAN.md` + `plan/graph.txt`, checked by `scripts/plancheck.ts` in `npm test` for reachability, pair collisions and starter reuse. |
| *"make a pretty easy to understand file of every combo"* | `WALKTHROUGH.md`, generated by `npm run walkthrough` from the live data. |
| *"give reset button that works to start from scratch"* | Clicked through in the browser: save wiped to exactly the starters (survival 3, everyday 9), routes cleared, returned to the title screen. |
| *"maybe in the main ui... small in top right"* | Measured at top 16, right 16. Opens the confirm dialog; confirmed wipe verified as above. |
| *"remove this: every discovery in both realms is wiped..."* | `grep` for the sentence across `src/` returns nothing. |
| *"also call items everyday objects instead"* | Title screen button and HUD both read it; verified in the DOM. |
| *"small bugs like this need to be fixed"* — "manganes/e" | Rendered: one line at 9px, no overflow. `scripts/labeltest.ts` walks all 43 names. |
| *"this button is tiny"* | Both HUD actions are PixelButtons; measured 54px tall, equal heights, no overlap at a 335px viewport. |
| *"make the survival word much bigger"* | 11px to 22px at 1512 wide; measured one line, no collision, floor of 8px on a narrow window. |
| *"make it bigger and more legible"* / *"tiny bit bigger"* | Wordmark unit ceiling raised and the margin made flat; 10 to 11 at 1440. |
| *"the C looks like an O"* | Rendered `c` and `o` to canvas and diffed: Pixelify Sans at 700 draws them BYTE-FOR-BYTE identical. Moved to Silkscreen, whose `c` keeps two open rows at 700, checked the same way. |
| *"try pixel sans serif"* | Silkscreen loaded and verified rendering in the DOM. Glyph advance recalibrated from 0.82 to 1.0 as Silkscreen's widest glyph is a full em. |
| *"i want the middle line to be the middle"* | Built, measured exact (0px off), then reverted on his instruction. `balance` ships at 0; the machinery and its tests remain. |
| *"the city background is bad"* | Rasterised his SVG and PNG at 512 and diffed: **60% of pixels differ**, the SVG is a lossy trace. Switched to the PNG with `image-rendering: pixelated`. Verified in the DOM and live. |
| *"make it mobile friendly / not bug out in different orientations"* | `scripts/layouttest.ts`: 24 device orientations plus a sweep of every size from 320x320 to 2560x1440, zero overflows. Verified in-browser at 390x844 and 844x390 that no button is off-screen. |
| *"why is there nothing now"* — empty shelf | Reproduced by seeding an old save, then fixed twice (prune on load, and a starter fallback). Verified the shelf shows stone/wood/plant fibre with a fully stale save. |
| *"is the gemini api key working right now"* | Hit production twice with new-element pairs; both returned real answers. |
| *"can you also put it on github to launch"* | Live on Vercel from `main`. Verified the deployed bundle contains this commit's work (`big-city.png`, `padBlock`, Silkscreen). |
| *"occasional shooting stars"* | Retuned after they proved invisible; `scripts/startest.ts` measures one every ~6.5s, on screen 17% of the time, 14px tail. |
| *"ACCURATE LOOKING pixelated emoji things for every object"* | All 57 elements have distinct art; `datatest.ts` fails the build if any falls back to the flame or shares a sprite. |
| *"make sure every explanation is great, fun, not ai sounding, using leos voice"* | Read `leos-voice.md` first. All 57 blurbs written to it: no em dashes (asserted in the generator), none of the banned words, British spelling. |
| Pixie credit | `README.md`. |

## Dropped

| Asked | Why |
| --- | --- |
| Procedural city with walkers, cars, pigeons | Rejected; composed art beat generated art a third time. `src/art/city.ts` deleted. |
| Recycling your own finished t-shirt back into cotton | The solver rejects cyclic graphs, and the footprint accumulator walks ancestors, so the loop would double-count the field it was meant to skip. Textile waste is a starter instead, which is also how a mill buys it. |
| Chains around locked items | *"acutalltg ignore the chains, that padlock was good enough"* |
| Equal-halves wordmark | Built and measured exact; Leo looked at it and went back. Kept behind `balance`. |
| `public/big-city.svg` | 645KB of lossy trace, unreferenced once the PNG went in. Deleted. |

## The rebuild, done

`gameData.ts` is now the planned graph: **three starters** (Stone, Wood, Plant
Fibre), 57 elements, 51 recipes. Played through in the browser, both realms.

Survival runs 3 starters to 3 targets in fifteen combinations, and all six
opening pairs work, so a new player's first guess lands whatever they try.
Everyday needs Survival's fire and charcoal for real: the aluminium can's
receipt lists twenty-two ancestors and they run back through the ember and the
hand drill to stone, wood and plant fibre. 178 g CO2, sourced.

Two things the tests caught that review would not have:

**The solver rejected a cycle.** Recycling your own finished t-shirt back into
the cotton chain closes a loop, and the footprint accumulator walks ancestors,
so a cycle either recurses forever or silently double-counts the field it was
meant to skip. Textile waste went back to being a starter, which is also how
the industry works: a mill buys old clothes the way it buys ore.

**The art test caught all 24 missing sprites.** Fifteen were drawn; nine were
repointed from sprites whose elements had been retired, as the old Flint is
exactly a knapped sharp stone and the old Wick is a braided cord.

Old saves are now pruned on load. A save from the previous build names a dozen
ids this build does not have, and anyone who opened the link earlier still has
them.


## The empty shelf, and the reset button in the corner

Leo: "why is there nothing now." A save written by the previous build named
only retired ids, so the shelf filtered every one of them out and left the
realm unplayable. Reproduced by seeding an old save, and fixed twice over:
`useGameState` prunes unknown ids on load and folds the starters back in, and
`Workspace` falls back to the realm's starters if the shelf would render empty
anyway. The second guard should never fire. It is there because the failure is
total rather than cosmetic.

Reset now also sits in the top right of the title screen, as it was reachable
only two screens deep, which is the wrong place for the one control you want
when somebody else is about to try the game. Both buttons call the same
handler, so they cannot drift.

The confirm dialog lost its paragraph. It was doing the title's job at a third
of the size, and "start over?" against "keep it" and "wipe it" is the whole
decision.

Citations are now built like buttons: staircase corners, a bevel, an underline
and a glyph set larger than the label. They were 8px muted grey and read as a
caption, which matters more than it sounds, as "every number has a source you
can click" is worth nothing if nobody can tell it is clickable.

The realm name in the HUD scales with the window now, from 9px on a phone up to
22px on a laptop, where it was pinned at 11px and smaller than the buttons
either side of it.

## The wordmark

Pixelify Sans, which Leo asked for by name, and the one sanctioned departure
from Press Start 2P. It is still a pixel font on a grid, so the rule holds; it
is just wider and rounder than a 5x7 arcade face, which is what a title wants.

**"the C looks like an O".** He was right, and it is worse than it sounds.
Rendered to a canvas and diffed pixel by pixel, Pixelify Sans at weight 700
draws lowercase `c` and `o` as byte-for-byte identical bitmaps: the bold weight
thickens the stroke until the aperture closes completely. No size, colour or
shadow could have fixed that. At 400 the aperture is a whole open row and at
500 it is still open with four-pixel stems, so the wordmark sits at 500.

Checked by diffing the two glyphs rather than by looking, because at a glance
700 looks fine until you try to read the word. Six alternative pixel faces were
measured the same way; none was both close to Pixelify Sans and free of the
collision, so staying with his font and dropping the weight was the right
trade.

**The size is computed, not stepped.** `fitArcUnit` returns the largest whole
unit at which the word still fits the room it has. It used to be four
hand-picked breakpoints, and every change to the font or the spacing found a
width where the title ran off the screen; moving to a wider font broke it
immediately. A test walks every width from 320 to 2560 and caught the last one,
at exactly 320, where even the old floor overflowed.

The space between the words went from `unit * 3` to `size * 0.55`, since on an
arc the gap has to beat a letter's own advance by more than usual - the glyphs
either side of it are leaning toward each other.

## The word break at the apex

Leo: "i want the middle line to be the middle. but from and scratch are
different lengths."

"From" is four letters and "Scratch" is seven, so spacing every letter equally
put the top of the arc inside "Scratch" and the wordmark read as hung
off-centre even though it was centred. Each word now gets an identical share of
the arc, which puts the break on the apex. The cost is that the two words are
letterspaced differently, "From" wider and "Scratch" tighter, and that is the
trade taken on purpose: uneven tracking between two words of a logotype is
ordinary, a logotype whose optical centre is two letters off is not.

There is a `balance` prop between the two, 0 for even letter spacing and 1 for
equal halves. It ships at 1.

**Two passes to get it exact.** Spreading each word's glyphs by centre inside
its half missed the midpoint by ten pixels, because a four-letter word and a
seven-letter word inset their outermost glyph centres by different amounts.
Measuring from the glyph edges instead makes it exact by construction. Then the
element box was `chord + advance` wide while the glyph centres only spanned
`chord`, which slid the whole arc half a glyph left of its own container.
Measured at 0 off centre now, and `scripts/labeltest.ts` asserts it, since both
misses looked right at a glance.

## The wordmark, take three

Leo: "scratch that, back to originnal and try pixel sans serif."

**Even letter spacing is back.** `balance` ships at 0. The equalised version was
built, measured exact and looked at, and the cure was worse than the disease:
putting the break on the apex means letterspacing "From" visibly wider than
"Scratch". The machinery stays, since it is one number to change.

**Silkscreen** is the wordmark now, the pixel sans-serif. It replaces Pixelify
Sans, which drew lowercase `c` and `o` as byte-for-byte identical bitmaps at
bold weight. Silkscreen's `c` keeps two whole open rows on the right at 700.

It is **caps-only**: its lowercase maps to capital forms, so the wordmark reads
FROM SCRATCH. Jersey 10, 15 and 25 are pixel sans faces with true lowercase and
a distinct `c`, checked the same way, if mixed case is wanted back.

**And one real bug in the swap.** The glyph box was 0.82 of the type size, a
number that belonged to Pixelify Sans. Silkscreen's widest glyph is exactly 1.0,
so the letters overlapped. The two ratios the layout stands on are named
constants now rather than numbers buried in three places, because they are
properties of whichever font is in the slot.

## The city backdrop: it was the wrong file all along

Leo: "the city background is bad. why cant you just use the actual svg i gave
you." I was using it. The SVG is the problem.

He supplied "Big City.svg" and "Big City.png". The SVG looked like the obvious
choice, being vector, and an earlier check sampled five points in both and
found them matching. Rasterised side by side at 512 and compared properly,
**sixty percent of the pixels differ**: the SVG is a lossy trace of the PNG,
not the artwork.

The PNG is now the backdrop, with `image-rendering: pixelated`, which is
correct for a bitmap and was exactly wrong for the vector it replaced. Every
source pixel becomes a clean block at roughly 3x instead of a smeared trace.

Five sampled points is not a comparison. Diff the whole thing.

## Mobile and orientation

`startLayout.ts` computes every size on the title screen from BOTH axes, by
searching down from the largest that fits rather than by thresholds. The bug it
fixes: at 844x390, a phone held sideways, width said there was plenty of room
so everything was drawn near desktop size and all three menu buttons fell below
the fold of a screen that clips its overflow. The game could not be started in
landscape at all.

Three separate misses along the way, each caught by a test rather than by
looking: height thresholds still failed at 194 sizes in a sweep from 320 to
2560, first at 915x528; `menuButtonHeight` was modelled from PixelButton's
source and came out ten pixels short; and the content column's own vertical
padding was left out of the sum entirely, which is eighty pixels at unit 5.

In the HUD the title now yields and the buttons never do. All three were
`shrink-0`, so a narrow screen pushed the overflow onto the right-hand end and
cut the INVENTORY button in half. A clipped label is untidy; a clipped control
is broken, and on a phone that button is the only way into the inventory.
