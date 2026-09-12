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

## LEDGER — 2026-09-12, ~15:00 Saturday

Submission is **Sunday 09:00**. Roughly 18 hours.

### From Scratch — done

| Asked, in his words | State |
|---|---|
| "clone it here, do all the setup… add it to the projects folder" | **done** — builds, solver passes, dev server on 5174 |
| "add a context/prorgess file for all of this" | **done** — `DESIGN.md`, `ARCHITECTURE.md`, this file |
| "look into my friends [repo]… what do you think" | **done** — played it in production, reviewed the code |
| "also i need to consider the sponsor routes… look into it" | **done** — `DESIGN.md` §5. **No Games track exists**; ML/AI is the fit |
| "even look at my project vestigo" | **done** — the weight/momentum principle is quoted in `PixelButton` |
| "give me the localhost" | **done** — `http://localhost:5174` |
| "the stars are a little too much" | **done** — canvas resolution now follows the viewport |
| "why does the earth seperate from the buttons when the screen becomes bigger" | **done** — horizon pinned by percentage, not fixed pixels |
| "everythin should be looking like this" (button sheet) | **done** — extruded, notched, bevelled |
| "the locked items… like chains around it like a chest" | **done** — two-link chain + brass padlock |
| "from scratch should be bigger" | **done** — own viewport-stepped scale |
| "the button has no need to be this wide" | **done** — capped at 420 |
| "the items is getting smothereed" | **done** — chain breaks around the label |
| "buttons should be in the centre, always" | **done** — vertically centred |
| "rename the codex… maybe like item inventory" | **done** — Inventory throughout |

### From Scratch — OPEN

| Item | State |
|---|---|
| **Push to the remote** | **BLOCKED ON LEO.** 4 commits sit local. Asked twice, never answered. It is Nathalie's repo and they were filming. |
| Survival = forest, wavy animated trees, nature | **open** — technique researched (whole-pixel per-layer offsets, 1px up-right/down/left, 0.2s/frame), not built |
| Everyday = bustling metropolis, street, pixel people walking | **open** — not started |
| "the survival should start with mininmal objects" | **open** — Survival still shows all 26 starters including Everyday's |
| Little Alchemy scope, hundreds of elements | **open** — planned in `ARCHITECTURE.md`, not built |
| "accurate looking pixelated emoji things for every object" | **open** — sprite-vocabulary plan written, not built |
| Two-speed failure explanation + "why not" LLM | **open** — planned, not built |
| The Nintendo zoom-out shot | **open** — Leo has not said where it goes |
| Receipt is empty for 2 of 3 targets | **open** — the biggest content hole |
| No tests at all | **open** — highest-value thing Leo could bring |
| README still the Vite template | **open** |

### DREAD — OPEN, and older than everything above

| Item | State |
|---|---|
| **Pulse reads 51 when Leo is 68** | **OPEN.** The P dump he captured came back with `samples: []` — pressed before the camera was sampling. **Needs one retry with the camera live.** The ROI is at y=58–144 of a 480px frame, which is very likely his hairline, not his face. |
| **Presage** | **Dead, diagnosed.** No physiology model ships in the package; it is fetched remotely and never arrives. Not fixable from our side. Leo was told to show the Presage table the exact log line. **Not known whether he did.** |
| **MathWorks** | **BLOCKED ON LEO.** ~30 seconds. Unclaimed at comparable events. |
| **Rotate the 4 exposed API keys** | **BLOCKED ON LEO.** Never confirmed. |
| **66 `Co-Authored-By: Claude` trailers in a public repo** | **BLOCKED ON LEO.** Violates his own standing rule. Needs explicit approval for a history rewrite. |
| **DREAD video** | **Not shot.** |
| **Can he submit two projects?** | **Unknown.** Needs an organiser. |


---

## Title screen, second pass — and the pulse fix

### Done since the last ledger

- **Arc is a true circle.** The wordmark had been rotating each letter linearly
  while sinking it by a hand-tuned cosine with a `0.9` in it. Those two curves
  do not describe the same circle, so the ends read as snapped down rather than
  curved. Both numbers now come off one circle, radius derived from the word's
  own width. Sweep 46° → 34°.
- **Stepped corners.** This was what "still not pixellated enough" meant. A
  single 45° chamfer is one straight diagonal at full display resolution —
  smooth, antialiased, and not drawable on a pixel grid. The clip-path is now a
  staircase with a one-unit tread.
- **Bigger blocks.** Buttons take their own unit (7 on desktop, was 4). Outline,
  bevel and extrusion are multiples of it, so at 4 they were thin lines and at 7
  they are slabs. Extrusion depth 2 units → 3.
- **The chain is abandoned.** Four attempts: tiled rings read as a row of
  circles; a thin two-link pair read as "oIoIoI"; a heavy horizontal pair still
  read as decorative trim; a diagonal run escaped the button and drifted across
  the page. Leo: "chains are a bit hard to do… that padlock was good enough."
  One steel padlock, hung left so the label keeps the middle.
- **Tagline removed** — "find out how things are really made" reads as generated.
- **Codex → Inventory.**

### DREAD: the 51-vs-68 pulse bug is fixed

The region of interest was a fixed rectangle at 35–65% across and 12–30% down.
On Leo's 640×480 camera that is rows 58–144 — the top third of the frame. He
had been asked to sit back for Presage, which made his face smaller and higher,
so the box was on his hairline or the wall.

Hair has no pulse. With no cardiac signal in the patch the strongest remaining
thing is slow drift — breathing, posture, auto-exposure — and slow drift
estimates low. 51 against a hand-counted 68 is exactly that shape.

Now samples a grid of **nine overlapping patches** and takes the one with the
highest confidence, where confidence is peakiness — how far the winning
frequency stands above the median of the spectrum. A patch of wall scores near
zero; lit skin produces one spike. Each patch averages to 16×16 rather than
64×64, so nine of them read *fewer* pixels than the single patch they replace.

`scripts/roitest.ts` (15 checks) puts skin in one patch and wall in the other
eight and asserts the rate is found wherever it lands — and asserts the old
behaviour was broken: **the fixed patch alone returns null on the same frame
where the grid returns 68.** Committed and **pushed** (`2d6d54b`).

### Still open, unchanged

Forest scene, city scene, minimal Survival starters, Little Alchemy scope, the
sprite vocabulary, the two-speed failure explanation, the Nintendo zoom-out,
the empty receipt for 2 of 3 targets, no tests, stock README.

**8 commits here remain unpushed** — still waiting on Leo.

DREAD still blocked on Leo: MathWorks, rotating the four exposed keys, the 66
`Co-Authored-By: Claude` trailers, the video, and whether two submissions are
allowed at all.

---

## LEDGER — 2026-09-12, ~14:40 Saturday

### Done this stretch

| Asked, in his words | State |
|---|---|
| "make sure the reset button works" | **done** — tested end to end: planted 3 discoveries, clicked through the confirm, store and localStorage both back to starters |
| "tell me the logic behind the connections" | **done** — answered: chains, self-combination, convergence, cross-realm |
| "the survival should start with mininmal objects" | **done** — 8 tiles, was 26 |
| "make a clicking sound… nice interactive sound" | **done** — synthesised, not sampled |
| "a little too loud/abrupt… include it for all buttons and clicks" | **done** — 6ms attack, master 0.9→0.55, low-pass 3600→2400, wired to every control |
| "should be in the middle" (combine panel) | **done** — `Card` was applying its class to the outer plate |
| "rename the codex… maybe like item inventory" | **done** |
| "the forrest needs much work… much brighter and fun" | **done** — now uses his own SVG |
| "can't you use the photos i gave you" | **done** — yes, and I should have from the start |
| "only minimal [movement]… swaying bushes and trees on top, occasional leaves" | **done** — edge tufts + 8 leaves on 14-30s falls |
| Tests | **done** — 34 checks, wired into `npm test` |

### The backdrop, honestly

Two procedural versions were worse than the reference they imitated. A good
pixel background is art somebody composed; a generator reproduces its rules
without the judgement. The SVG is now the backdrop — a **vector** of pixel art,
so it scales to any window with hard edges intact.

**Open question for Leo: where did `forest hillside.svg` come from?** If it
needs attribution, that has to go in the Devpost and the README before
submission.

### OPEN — mine to do

| Item | State |
|---|---|
| Everyday = bustling metropolis, pixel people walking | **open, not started** — his direction from the first scene message |
| Glass bottle has no footprint at all | **open** — now pinned by a test that fails when fixed |
| T-shirt has no CO2; can has no water | **open** |
| Little Alchemy scope, hundreds of elements | **open** — planned in ARCHITECTURE.md |
| Two-speed failure explanation + "why not" | **open** — planned |
| Sprite vocabulary | **open** |
| Nintendo zoom-out | **open** — Leo has not said where it goes |
| README still the Vite template | **open** |

### BLOCKED ON LEO

| Item | Why |
|---|---|
| **13 commits unpushed** | Asked five times. Repo ownership unresolved — fork vs transfer vs stay a contributor |
| Repo on his GitHub | Nathalie's repo; needs her to transfer, or a fork the team agrees on |
| DREAD: MathWorks | ~30 seconds, unclaimed at comparable events |
| DREAD: rotate 4 exposed API keys | Never confirmed |
| DREAD: 66 `Co-Authored-By: Claude` trailers | Public repo, breaks his own standing rule |
| DREAD: video | Not shot |
| Two submissions allowed? | Needs an organiser — decides whether DREAD matters at all |

---

## LEDGER — 2026-09-12, ~15:20 Saturday

### Done this stretch

| Asked | State |
|---|---|
| "unreadable, not to the pixel theme… go through everything, every scenario" | **done** — discovery card, receipt, inventory, styleguide all converted |
| "this reads ai: Nothing happens — at least not in a way…" | **done** — now "They just sit there." |
| "high carbon steel is so long it looks different… think of a workaround" | **done** — every tile is 92x124, verified in browser |
| "make them more pixelated… like the inspiration buttons" | **done** — four-sided bevels, deeper block, coarser corner treads |
| "the swaying is nice but id like a litle more" | **done** — 2px amplitude, eight positions, fronds on the sides too |
| "the bottom ones sometimes start floating" | **done** — roots overshoot the frame edge by 3px; bottom fifth never moves |
| "Starting over clears every discovery… is not pixelated" | **done** |
| "no exceptions unless i tell you" | **done** — reversed the body-font exception I had taken on the blurb |
| Two-speed failure explanation | **done** — was planned in ARCHITECTURE.md hours ago and never built |

### The adjudicator stall is fixed

Found when I first played the game and flagged repeatedly without being fixed.
Every failed combination called Gemini and showed "Hmm…" for a measured 5–10
seconds — in a game where **over 98% of attempts fail**.

Elements are now tagged (`src/data/properties.ts`) and a rule table
(`src/adjudicator/explain.ts`) answers instantly: **946 pairs in 0.5ms, 0.6µs
each.** The model sits behind a "why not?" the player presses.

The constraint that matters is asserted by test: **no local line may claim a
pair is impossible**, because the model can answer "that's actually real, just
not in this game" and the two would contradict each other.

### Test count now 57

36 data/solver · 13 explanations · 8 sway.

### OPEN — mine

| Item | State |
|---|---|
| Everyday city scene | **open** — waiting on Leo's SVG; wiring is one line once it exists |
| Everyday has no backdrop at all | **open** — only Survival has one |
| T-shirt CO2, aluminium can water | **open** — pinned by test; aluminium sources span 495–1,490 L/kg so zero is honest |
| Little Alchemy scope, hundreds of elements | **open** |
| Sprite vocabulary | **open** |
| Nintendo zoom-out | **open** — Leo has not placed it |
| README still the Vite template | **open** — first thing a judge browsing the repo sees |

### BLOCKED ON LEO

| Item | Why |
|---|---|
| **Tell Nathalie and Eliza to re-shoot** | The UI is unrecognisable from an hour ago. Anything filmed before ~15:00 is unusable. |
| City SVG | Same source as the forest, so the palettes match |
| **Pixie URL + licence for `forest-hillside.svg`** | It ships in the repo now. If attribution is required it must be in the README and Devpost. |
| DREAD: MathWorks | ~30 seconds, unclaimed at comparable events |
| DREAD: rotate 4 exposed API keys | Never confirmed |
| DREAD: 66 Claude co-author trailers | Public repo, breaks his own standing rule |
| DREAD: video | Not shot |
| Two submissions allowed? | Needs an organiser |

---

## LEDGER — 2026-09-12, ~15:50 Saturday

### Done this stretch

| Asked | State |
|---|---|
| "i would like walking pedestrians, and car… flying pigeons etc" | **done** — crowd in varied coats, cabs with turning wheels, pigeons on a rising arc |
| "occasional shooting stars on the main ui" | **done** — rare by design: a 24–64s window, under 1s of streak |
| "the tops dont have rounded/pixellated edges and sides" | **done** — `HudBar`; empty slots are recessed sockets, not CSS dashes |
| "why are the left and right sides rounded differently" | **done** — real bug in the corner generator, see below |
| "for now let items be unlocked" | **done** — `UNLOCK_EVERYTHING` flag, named so it cannot be mistaken for design |
| "it doesnt need to be good, just fun pixelated animations" | **done** — drew a placeholder street rather than waiting on art |
| README still the Vite template | **done** — oldest purely-mine item, open since setup |

### The corner bug was real

The staircase was four separate hand-rolled loops that disagreed: two emitted
two points per tread, two emitted three, walking the staircase in different
orders. Narrow controls hid it; a wide panel stepped on the left and came out
square on the right.

One corner routine called four times cannot disagree with itself.
`scripts/shapetest.ts` (14 checks) asserts the thing that would have caught it:
**mirror the polygon about its centreline and the point set must be
unchanged.**

### Verified end to end

Combined molten glass with high-carbon steel in the browser. The receipt opens
and reads **270 g CO₂**, charged to the melt, with its FEVE source and the full
six-element ancestor chain. That screen was completely blank this morning.

**Test count: 71.**

### OPEN — mine

| Item | State |
|---|---|
| Little Alchemy scope, hundreds of elements | **open** — planned in ARCHITECTURE.md, biggest remaining piece |
| Sprite vocabulary | **open** |
| Nintendo zoom-out | **open** — Leo has not placed it |
| T-shirt CO₂, aluminium can water | **open** — pinned by test; zero is honest until a source is good enough |
| `UNLOCK_EVERYTHING` must go back to `false` | **open — before submission** |

### BLOCKED ON LEO

| Item | Why |
|---|---|
| **Re-shoot anything already filmed** | The UI is unrecognisable from two hours ago |
| **Pixie URL + licence for `forest-hillside.svg`** | Ships in the repo; README credits it as unconfirmed |
| City street art | Placeholder street is drawn; real art drops in behind the actors |
| **Repo description + homepage are empty** | I have no admin on Nathalie's repo — 404. She sets them, or she transfers it |
| DREAD: MathWorks | ~30 seconds, unclaimed at comparable events |
| DREAD: rotate 4 exposed API keys | Never confirmed |
| DREAD: 66 Claude co-author trailers | Public repo, breaks his own standing rule |
| DREAD: video | Not shot |
| Two submissions allowed? | Needs an organiser |

## 2026-09-12, mid-afternoon — run-through and the city verdict

**Full run-through, first real one.** Solver: all 43 elements reachable, no
issues. In-browser: title -> Survival -> flint + high-carbon steel combines,
flint + beeswax fails and offers *why not?*, fallback copy appears when the
endpoint is absent. Production endpoint answered live and correctly.

**The city is rejected.** Leo: "the background hella ugly... i like the forrest
but this is just not it." He is right, and it is the same lesson as the forest:
procedural art loses to composed art. Two things are wrong beyond taste —
the palette (brick orange + sky blue) shares nothing with the indigo UI, and
the UI covers the centre, so the only visible parts of the scene are the two
flat side walls, which is the worst part of the image.

`CityScene.tsx` procedural work is **dropped**, not paused. Waiting on an SVG
backdrop from Leo, same route as `forest-hillside.svg`.

**Open:**
- City backdrop SVG (blocked on Leo)
- `UNLOCK_EVERYTHING` back to `false` before submission
- Pixie URL + licence for `forest-hillside.svg` (blocked on Leo)
- Local failure copy is thin — flint + beeswax gives only "nothing obvious
  happens." The rule table has no clause for inert mineral + wax.

## The city, resolved

Leo supplied a 512x512 neon-street PNG and `CityScene.tsx` is now that image
plus a flat 28% darkening wash — no canvas, no sprites, nothing moving.
`src/art/city.ts` (the hand-drawn walkers, cars and pigeons) is deleted.

Two reasons it works where three procedural attempts did not. Its palette is
the UI's own indigo and violet, so the panels sit inside the picture instead of
on top of a clashing one. And its interest runs vertically down both walls as
neon, which is the only part of a backdrop that stays visible once the UI takes
the centre third — the procedural version spent everything on a vanishing point
that is permanently covered.

Nothing animates. The note stands that detail beats movement, and hand-drawn
sprites over composed art would read in a visibly different hand.

## The system, planned

`GAMEPLAN.md` now holds the whole game: 57 elements, 52 recipes, both realms,
from **three** starting things — Stone, Wood, Plant Fibre. Fire is not a
starter any more; it is the first thing you make, which is the point of the
realm.

The plan is authored as a machine-readable edge list at `plan/graph.txt` and
checked by `scripts/plancheck.ts` in `npm test`. That was not decoration: the
first draft had four unreachable elements because one recipe was left open and
three depended on it, and the checker found them immediately. A second run
failed the starter-reuse assertion with six single-use starters, which was
fixed by *changing the design* — Haber-Bosch for farmland, beeswax-waxed
thread, red ochre as a second dye route — rather than by loosening the test.

Starters used only once: was 14 of 19, now 3 of 11. Wood appears in 9 recipes,
fire in 7.

**Not yet implemented.** This is the plan; `gameData.ts` is untouched, and
every one of the 52 recipes needs a real source before it ships.

## The city, second pass — the light version

The night-neon art is out and `public/big-city.svg` is in: a daylight avenue,
which is what Leo asked for once he saw both. Same reasoning as before — the
left and right thirds carry storefronts, signage and fire escapes, which is the
only part of a backdrop that survives the UI owning the centre.

Bright costs something, and the cost is paid by the HUD rather than the
picture: the strip is opaque so white pixel type never has to sit on a pale
sky. The darkening wash dropped from 28% to 10%, since the whole point of this
one is that it is bright.

**Bug found while fitting it.** "Everyday Objects" is sixteen characters of a
monospaced pixel font — 208px that cannot break — and in the HUD's
`justify-between` row it wrapped to two lines and overlapped "← realms". Fixed
with `shrink-0` and `nowrap` on all three items, flex spacers to keep the title
optically centred, and a one-step-smaller realm name to buy the room. Verified
at a 442px viewport, which is narrower than anything real.

## The bug that was destroying the backdrops

Leo: "the pixels are messed up." He was right, and the cause was not scaling —
it was `image-rendering: pixelated` on an `<img>` whose source is an **SVG**.

Both backdrops are vector files whose `<svg>` tag declares `width="512"
height="512"`. `pixelated` makes Chrome rasterise the vector at that intrinsic
512 and then nearest-neighbour the bitmap up to the window. The detail was
being thrown away *before* the scaling, not protected from it. Every car,
window and shop sign in the city became a 3x3 block of mush.

The forest carried the same line — with a comment calling it harmless
belt-and-braces — and survived only because its shapes are large. Both are
fixed. The canvas overlay keeps `pixelated`, because that one really is a
bitmap I draw a pixel at a time.

Left alone, the paths rasterise at the window's true resolution and the edges
stay hard, because the paths themselves trace squares.

---

# LEDGER

Everything Leo has asked for, in his words, with a status. Nothing leaves this
list silently — an item that turns out to be unnecessary is marked `dropped`
with the reason, not deleted. The **oldest** open item is the one most at risk,
so it is listed first.

## Open

| # | Asked | Status |
| --- | --- | --- |
| 1 | *"we want the scope to be huge"* — Little Alchemy scale | **done.** Rebuilt: 57 elements, 51 recipes, three starters. Played through end to end in the browser, both realms. |
| 2 | `UNLOCK_EVERYTHING` back to `false` | **open — blocks submission.** `src/App.tsx:30`. A dev flag that opens Everyday Objects regardless of progress, so nobody has to replay Survival to look at the other realm. With Survival now fifteen combinations long the gate is reasonable again. Must flip before 09:00. |
| 3 | *"the details are the most important"* — the instant failure copy | **open.** The rule table has nine clauses and a fallback; pairs it has no clause for still get "nothing obvious happens". Thin for a game whose pitch is explaining failure, and the pair count just went from 903 to 1,596. |
| 4 | Backdrop scale — *"more zoomed out"* | **open, awaiting Leo.** The pixelated-SVG bug is fixed; whether it is still too zoomed is his call, and the fix trades filling the window against showing the whole square. |

## Blocked on Leo

| Asked | Status |
| --- | --- |
| Teammates filming the old UI | **blocked.** They need the live link — https://from-scratch-three.vercel.app — and probably a re-shoot. |

## Done

| Asked | Where |
| --- | --- |
| *"lets get the survival thing fixed first"* — forest scene from his SVG, sway, leaves | `ForestScene.tsx` |
| *"occasional shooting stars on the main ui"* | `Starfield.tsx` — retuned after they proved invisible; `scripts/startest.ts` measures the rate |
| *"give reset button that works to start from scratch"* | `ConfirmDialog.tsx` + `App.tsx`; in-theme, focus defaults to cancel, returns to the title screen |
| *"also call items everyday objects instead"* | `StartScreen.tsx`, `Workspace.tsx`, `Inventory.tsx` |
| *"ACCURATE LOOKING pixelated emoji things for every object"* | all 43 have distinct art; `datatest.ts` fails the build if any falls back |
| *"small bugs like this need to be fixed"* — "manganes/e" | `labelFit.ts` + `scripts/labeltest.ts` |
| *"the background hella ugly. maybe we should rethink the city"* | `public/big-city.svg` |
| *"the pixels are messed up"* | `image-rendering: pixelated` on a vector SVG; fixed in both scenes |
| *"make a pretty easy to understand file of every combo to beat the game"* | `WALKTHROUGH.md`, generated |
| *"can you plan the entire system, for both survival and everyday objects"* | `GAMEPLAN.md` + `plan/graph.txt` |
| *"can you also put it on github to launch"* | already live on Vercel from `main`; Pages would lose the `/api` route |
| *"where is the api being used. have u doe a full run through yet"* | one endpoint, `api/adjudicate.ts`; run-through done |
| *"i prefer the light version... big city svg"* | swapped in |
| Pixie credit for both backdrops | `README.md` |
| *"remember the theme. no exceptions"* | swept every screen for non-pixel type, radii and blurs — clean |

## Dropped

| Asked | Why |
| --- | --- |
| Procedural city with walkers, cars, pigeons | Leo rejected it; composed art beat generated art for the third time. `src/art/city.ts` deleted. |
| Chains around locked items | *"acutalltg ignore the chains, that padlock was good enough"* |
| *"maybe even looking like an intendo"* | Read as the centred-panel framing, which is in. Reopen if he meant a console bezel. |


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
