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
