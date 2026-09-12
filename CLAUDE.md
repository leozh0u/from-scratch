# From Scratch — project context

> This file is the answer to "how do I make sure Claude has the context?"
> Claude Code reads `CLAUDE.md` automatically at the start of every session in
> this repo. Anything written here is context Claude gets for free, without
> anyone pasting it in. Keep it current and you never have to re-explain the
> project.

---

## 1. What the project is

A craft-and-combine game in the Little Alchemy lineage. You pick a **realm**,
start with a handful of base elements, and combine **exactly two at a time** to
discover new ones, working toward a set of named targets.

The twist that makes it more than a clone: **every recipe is real and every
number is sourced.** A recipe is only allowed into the game if the
transformation actually happens in the physical world, a citable source says
what the game claims it says, and the units are right. Recipes also carry an
embodied **footprint** (liters of water, kg of CO2), so finishing a target shows
you what it genuinely cost to make the object.

Two realms exist:

| Realm | Teaches | Targets |
| --- | --- | --- |
| Survival | The verb — how making things works at all | Fire, Candle, Lighter |
| Everyday Objects | The hidden cost of ordinary manufactured objects | Cotton T-Shirt, Aluminum Can, Glass Bottle |

Survival recipes all carry a **zero** footprint on purpose. That is not a
placeholder. Water and CO2 are Everyday's lesson, and inventing fake "time and
effort" numbers dressed up in water/CO2 fields would be worse than zero.

The realms share one graph, not two. Everyday's sewing thread is waxed with
Survival's paraffin, and the aluminum chain cokes crude oil over Survival's
fire. Those are real dependencies, deliberately kept.

**Repository:** `github.com/nrodriguezmendoza/from-scratch` — default branch
`main`.

---

## 2. Running it

```bash
npm install
npm run dev
```

Dev server runs on port 5173 (pinned in `.claude/launch.json`).

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check with `tsc -b`, then build |
| `npm run lint` | Oxlint |
| `npm run solve` | Offline solver check over the recipe graph |

There is a **dev-only styleguide** at `/styleguide` — a gallery of the UI
primitives and sprites. It renders only when `import.meta.env.DEV` is true, so
it is invisible in production. It is the fastest place to eyeball new art
without playing through the game to reach an element.

> **Blocker as of 2026-09-12:** Node is not installed on this machine and
> `node_modules` has never been created here. `node`, `npm`, and `npx` all
> resolve to nothing. Install Node 20+ before expecting any of the above to
> run. Sprites can still be *written* without it, since they are plain text,
> but they cannot be *seen* until the dev server runs.

---

## 3. Architecture

```
src/
  App.tsx                     Realm select vs. workspace, plus the /styleguide gate
  art/sprites.ts              ALL pixel art lives here, as text
  components/
    PixelArt.tsx              Sprite type + the text-to-SVG renderer
    StartScreen.tsx           Realm picker over the parallax pixel scene
    Workspace.tsx             The actual game: inventory, combine, discoveries
    DiscoveryCard.tsx         Full-screen reveal with citations
    TargetList.tsx            Progress against a realm's targets
    StyleguidePage.tsx        Dev-only component gallery
    ui/                       Button, Card, Badge, ProgressBar, ElementTile
  data/
    types.ts                  ElementDef, RecipeDef, Footprint, RecipeData
    gameData.ts               The real, source-pinned game data — what ships
    seed.ts                   Small hand-computable fixture, solver tests only
    iconRegistry.ts           icon key -> sprite lookup
  hooks/
    useGameState.ts           Inventory, discoveries, cross-realm sharing
    useViewport.ts            Viewport size for the scene's scaling
  solver/solver.ts            Reachability and cheapest-path over the graph
scripts/
  propose.ts                  Offline Gemini recipe drafting (never runtime)
  solve.ts                    CLI entry to the solver
  exportBackground.ts         Renders the scene to a static SVG
```

### The two visual layers

`src/index.css` defines a deliberate split, and it is worth not breaking:

- **The scene** is 8-bit. Hard-stop color bands, whole-pixel offsets, no
  smoothing. The Press Start 2P font appears here and nowhere else.
- **The UI panel** on top is clean and modern. Nunito, real corner radii, one
  soft shadow, generous spacing.

Retro backdrop, crisp panel. Do not leak scene styling into the panel.

### How sprites actually work

Art is authored as an array of equal-length strings, one character per pixel,
with `.` meaning transparent. A `palette` maps each character to a hex color.
The renderer merges horizontal runs of the same color into single `<rect>`
elements, so a 16x20 tile costs tens of SVG nodes rather than hundreds.

```ts
export const FLAME: Sprite = {
  rows: [
    '....r....',
    '...rrr...',
    '..rrorr..',
  ],
  palette: { r: '#d9452b', o: '#f08a29', y: '#ffd24a' },
}
```

Keeping art as text means any sprite can be edited in place, in a normal text
editor, with no drawing tool and no binary asset. That is the whole reason for
the format.

### The data pipeline, and where the rubric lives

`scripts/propose.ts` asks Gemini for candidate recipe chains and writes them to
`data/staging/`. Nothing in `src/` ever imports from there, and **`data/staging`
is gitignored**. A draft only becomes real when a human applies the verification
rubric — is the transformation real, does the source say what we claim, is the
unit right — and hand-copies it into `gameData.ts`. The model proposes; it
never ships.

---

## 4. Current assignment: sprite art

**Branch: `sprite-art`.**

Every element in the game is supposed to have its own pixel icon. Almost none
do yet. This was deliberately deferred, and it is now the open work.

### Scope — two files, both purely additive

1. **`src/art/sprites.ts`** — add new exported `Sprite` constants.
2. **`src/data/iconRegistry.ts`** — add one line per element mapping its icon
   key to the new sprite. The existing pattern is `fire: FLAME`.

Nothing else. The recipe data, the solver, the hooks, and the game logic are
someone else's active work, and editing them invites a merge conflict for no
benefit. You do not need to understand the game logic to do any of this.

### The actual state of the art

`iconRegistry.ts` has exactly two entries, and one of them is dead:

- `fire: FLAME` — real, and genuinely used by the Fire element.
- `shirt: SHIRT` — **no element uses the icon key `shirt`.** The T-shirt
  element's key is `cotton_t_shirt`. `SHIRT` is reached directly by
  `StartScreen.tsx` as the Everyday realm icon and by the styleguide, so it is
  not unused art, but that registry line resolves for nobody. Pointing
  `cotton_t_shirt` at `SHIRT` is a reasonable free win.

So of **42 elements, exactly 1 has real art.** The other 41 render as the same
orange flame, which is why the inventory currently looks like a wall of
identical tiles.

`CLOUD`, `PINE`, and `GROUND` also live in `sprites.ts` but are scene
decoration, not element icons. Leave them alone.

### Conventions to follow

Read from the five sprites that already exist:

- **Rows must all be the same length.** The renderer takes the max width, and
  ragged rows produce silent misalignment.
- **One character per color, `.` for transparent.** Characters are arbitrary;
  the existing art uses mnemonic ones and case to mean shade, like `g` for the
  lit green and `G`/`k` for progressively darker greens in `PINE`.
- **Light from above-left.** `PINE`'s comment says this explicitly, and it is
  what stops the tree reading as a flat triangle. Follow it so the set looks
  like one hand drew it.
- **Three shades per material is usually enough.** `FLAME` uses three, `SHIRT`
  uses two. Restraint reads as more deliberate than a wide palette at this size.
- **Sample colors from `src/index.css`** where a material already has one.
  Terrain, sky, and the two realm accents (`--color-survival` `#e07a34`,
  `--color-everyday` `#14919b`) are already defined. Reusing them is what makes
  a new sprite look native.

**On canvas size:** existing element icons are not uniform. `FLAME` is 9x11 and
`SHIRT` is 11x10. Sprites render inline at their natural size with no fixed box
(`ElementTile` just centers them), so mismatched dimensions make the inventory
grid look ragged. **Recommend picking one canvas — 11x11 is a good fit for both
existing icons — and drawing every element inside it.** Worth confirming with
the repo owner before drawing all 41, since it is a one-line decision that is
expensive to redo.

Element icons are rendered at three scales: **2** in the target list, **3** in
inventory tiles, and **6** in the full-screen discovery card. Check new art at
scale 2, since that is where detail collapses first.

### The worklist — 41 keys

The icon key is identical to the element id in every case, so the key you add to
the registry is just the id below.

**Survival — 15 remaining** (`fire` is done)

| Key | Name | Role |
| --- | --- | --- |
| `tinder` | Tinder | starter |
| `kindling` | Kindling | starter |
| `flint` | Flint | starter |
| `high_carbon_steel` | High-Carbon Steel | starter |
| `cotton_fiber` | Cotton Fiber | starter |
| `beeswax` | Beeswax | starter |
| `crude_oil` | Crude Oil | starter |
| `natural_gas` | Natural Gas | starter |
| `spark` | Spark | crafted |
| `glowing_tinder` | Glowing Tinder | crafted |
| `wick` | Wick | crafted |
| `paraffin` | Paraffin Wax | crafted |
| `butane` | Butane | crafted |
| `candle` | Candle | **TARGET** |
| `lighter` | Lighter | **TARGET** |

**Everyday, cotton t-shirt chain — 11**

| Key | Name | Role |
| --- | --- | --- |
| `farmland` | Farmland | starter |
| `water` | Water | starter |
| `cotton_gin` | Cotton Gin | starter |
| `dye` | Dye | starter |
| `raw_cotton` | Raw Cotton | crafted |
| `ginned_cotton` | Ginned Cotton | crafted |
| `cotton_yarn` | Cotton Yarn | crafted |
| `cotton_jersey` | Cotton Jersey | crafted |
| `dyed_cotton_fabric` | Dyed Cotton Fabric | crafted |
| `sewing_thread` | Sewing Thread | crafted |
| `cotton_t_shirt` | Cotton T-Shirt | **TARGET** (can reuse `SHIRT`) |

**Everyday, aluminum can chain — 9**

| Key | Name | Role |
| --- | --- | --- |
| `salt` | Salt | starter |
| `bauxite` | Bauxite | starter |
| `manganese` | Manganese | starter |
| `sodium_hydroxide` | Sodium Hydroxide | crafted |
| `alumina` | Alumina | crafted |
| `petroleum_coke` | Petroleum Coke | crafted |
| `molten_aluminum` | Molten Aluminum | crafted |
| `aluminum_sheet` | Aluminum Sheet | crafted |
| `aluminum_can` | Aluminum Can | **TARGET** |

**Everyday, glass bottle chain — 6**

| Key | Name | Role |
| --- | --- | --- |
| `silica_sand` | Silica Sand | starter |
| `soda_ash` | Soda Ash | starter |
| `limestone` | Limestone | starter |
| `sodium_silicate` | Sodium Silicate | crafted |
| `molten_glass` | Molten Glass | crafted |
| `glass_bottle` | Glass Bottle | **TARGET** |

### Suggested order

Targets first — `candle`, `lighter`, `aluminum_can`, `glass_bottle` — because
those are the four icons a demo actually lands on. Then the starters, which are
the first thing a player sees on entering a realm. Crafted intermediates last;
they flash past in a chain and matter least.

A useful sanity check: several of these are visually near-identical at 11x11
(`alumina` and `soda_ash` are both white powders, `raw_cotton` and
`ginned_cotton` differ only by seeds). Decide how to distinguish them
deliberately rather than discovering the collision at scale 2.

---

## 5. Open questions for the repo owner

1. **Canvas size.** Fix every element icon at 11x11, or let them vary? Affects
   all 41 and is expensive to redo.
2. **`data/staging` is gitignored.** If research output is meant to be handed
   over as a JSON file in that shape, it needs a tracked location, because a
   file written to `data/staging/` will never appear in a commit.
3. **The dead `shirt` registry key.** Repoint it to `cotton_t_shirt`, or drop
   the line and leave `SHIRT` as scene-only art?

---

## 6. Conventions for Claude in this repo

- Comments in this codebase explain **why**, not what, and several record
  decisions that were corrected against sources. Match that register. Do not
  add narration comments.
- Never invent a number or a citation. Zero is the correct value for an unknown
  footprint. A missing source is better than a plausible-looking wrong one.
- `src/` must never import from `data/staging/`.
- `gameData.ts` is edited by hand after human verification, never generated.
