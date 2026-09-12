# From Scratch — visual direction

> Leo has creative control of the UI and the game feel. This file is the
> brief. `CLAUDE.md` describes what the project *is*; this describes what it
> should *feel like*, and why.

---

## 1. The decision that changes everything

The codebase currently commits, explicitly and in writing, to a **two-layer
split**. From `src/index.css`:

> The SCENE is 8-bit… The UI sitting on top of it is clean and modern: Nunito,
> real radii, one soft shadow… Retro backdrop, crisp panel. Don't leak scene
> styling into the panel.

**That is now reversed.** The Figma direction is pixel art *all the way
through*: a dark navy starfield, a large pixel Earth, and chunky pixel buttons
sitting directly on it. There is no "clean modern panel" layer any more.

This is not a small re-skin. `index.css`, every component in `components/ui/`,
and the whole colour system were built around the split, and the comments
defending it have to go with it. Leaving those comments in place while
contradicting them in the CSS is worse than either choice on its own.

**Why reverse it:** the split is a hedge. It reads as "retro theme applied to a
normal web app", and a judge has seen a hundred normal web apps. A game that
commits completely to being a game is the thing nobody else will have. The
existing split also produces the exact failure Leo named — it looks generated,
because a Tailwind card with a soft shadow on a pixel background is what every
template looks like.

---

## 2. The target

From the Figma mock:

- **Ground:** deep navy, near-black, the colour of an NES night sky
  (approximately `#2b2a4a`). Not a gradient — one flat field.
- **Stars:** small white pixel crosses and single pixels, scattered at
  irregular density. Some are plus-shaped (5 pixels), some are single points.
- **Earth:** a large pixel globe, bottom-centre, cropped by the viewport so it
  reads as enormous. Hard-edged continents, three or four greens, two or three
  blues, white ice caps, a hard black outline one pixel wide.
- **Wordmark:** "From Scratch" in Press Start 2P, white, **arced** along the
  curve of the planet, each letter individually rotated.
- **Buttons:** wide, rounded-rect, filled the same navy as the ground with a
  visible lighter border, lowercase Press Start 2P labels in white, stacked
  and centred over the Earth.

Everything in the game inherits from this. One world, one typeface, one
palette.

---

## 3. Principles

### Nothing may look generated

This is the constraint Leo stated most directly and it should be read as a veto,
not a preference. Concretely, that rules out:

- **Off-the-shelf pixel CSS frameworks.** `NES.css` and `RPGUI` are
  instantly recognisable to anyone who has seen a hackathon project. Using them
  announces that the look was downloaded. Hand-roll it.
- **Soft shadows, blurs, smooth gradients, and non-integer radii.** All four
  are the signature of a component library. A pixel UI gets depth from a hard
  offset block of darker colour, not from a blur.
- **Uniform, evenly-spaced decoration.** Scattered stars at even density read
  as a CSS pattern. Irregularity is what reads as drawn.
- **More than about six colours in any one element.** Restraint at this scale
  is what separates pixel art from a downscaled photograph.

The project's existing sprite format is its best defence here: art is authored
as arrays of strings, one character per pixel, in a text file. Nobody who looks
at `src/art/sprites.ts` thinks it was generated, because that is not what
generated art looks like. **Lean into that. Keep everything hand-authored in
that format, including the UI chrome.**

### Buttons must feel like objects

This is the Vestigo lesson, and Leo's own code already says it best
(`vestigo/site/src/globe/drag.js`):

> A drag that stops dead the instant the pointer lifts feels like a control.
> One that carries and slows feels like an object with weight, and it costs
> four lines.

Applied to a button, "weight" means:

- **A real down state that moves.** The button translates down by its own
  shadow offset — 3 or 4 physical pixels — and the dark block behind it
  disappears. That is the entire trick and it is how every console UI from 1985
  onward did it. Do it on `:active` *and* on keyboard `Enter`/`Space`, or
  keyboard users get a dead button.
- **Sound on press.** A short click. Silence makes a button feel like an
  image.
- **No transition on the press.** A press is instantaneous. Easing it is what
  makes a UI feel like a web page. Easing belongs on the *release*, if
  anywhere.
- **Hover is a distinct state, not a dimming.** Brighten the border, nudge up
  one pixel, or invert — never `opacity: 0.8`.

### The background is alive but never distracting

The mock is a static starfield. It should not stay static, but whatever moves
must be slow enough that nobody watches it instead of playing:

- Stars twinkle by **swapping between two or three discrete brightness
  values**, never by fading. Fading is anti-pixel.
- The Earth rotates, or its cloud layer drifts, at a speed measured in minutes
  per revolution.
- Motion pauses or slows during a modal (the discovery card, the receipt), so
  the payoff moment is still.
- **Respect `prefers-reduced-motion`.** A judge may well have it on, and a
  background that ignores it is a bug, not a flourish.

### Pixels must land on pixels

The single most common way a pixel UI looks wrong is sub-pixel positioning.

- `image-rendering: pixelated` on every raster surface.
- Scale factors are **integers only**. A sprite drawn at 3.5× has soft edges
  and the whole illusion collapses.
- Positions snap to the scale grid. If the unit is 4 css pixels, everything
  sits on a multiple of 4.
- Press Start 2P renders correctly only at multiples of its design size.
  Pick a base and use integer multiples of it.

---

## 4. Techniques worth using

**Nine-slice borders via `border-image`.** The standard way to get a chunky
frame that stretches to any size without distorting its corners: the image is
cut into nine regions, the four corners are protected, the edges tile.
`border-image-source` + `border-image-slice` + `border-image-repeat: round`,
with a matching `border-width`. This is how to do panels, dialogs and the
button chrome once, and reuse everywhere.

**Sprites as text, rendered to SVG** — the existing `PixelArt.tsx` approach.
It merges horizontal runs of one colour into single `<rect>` elements, so a
16×20 tile is tens of nodes rather than hundreds. It already works; extend it
rather than replacing it.

**The starfield as a tiled, seeded pattern** rather than hundreds of DOM
nodes. One canvas, drawn once, with a fixed seed so it is identical on every
load and can be art-directed rather than re-rolled.

**Reference material (all CC0, no attribution required):**
- [Kenney Pixel UI Pack](https://kenney.nl/assets/pixel-ui-pack) — 750 assets.
  **Use for reference and for nine-slice frame geometry, not wholesale.**
  Shipping Kenney art unaltered is the "downloaded look" problem again, and
  Kenney's style is widely recognised.
- [Kenney UI Pack](https://kenney.nl/assets/ui-pack) — includes 6 UI sound
  effects, which are genuinely useful for the click.
- [OpenGameArt CC0 collection](https://opengameart.org/content/all-cc0-uploader-kenney)
- [pixelart.css](https://blackmoon87.github.io/pixelart.css/) — read it for
  the frame technique; do not depend on it.

---

## 5. Sponsor routes

**Confirmed from the live Devpost, 2026-09-12.** Two things matter and both
differ from what was assumed:

**There is no Games track.** The three tracks are **Fintech**, **Health**, and
**Machine Learning/AI**. A project picks **at most one track** but **unlimited
challenges**.

→ **From Scratch's track is Machine Learning/AI.** It is the only honest fit,
and it is a genuinely good one: a Gemini authoring pipeline offline plus a
Gemini adjudicator at runtime, with a documented reason the model can never
grant a discovery.

### Live and already earned

| Challenge | Standing |
| --- | --- |
| **[MLH] Best Use of Gemini API** | Already deep. Two distinct uses, one offline and human-verified, one at runtime with a structural injection defence. This is the strongest claim on the board. |

### Cheap and nearly free

| Challenge | What it takes |
| --- | --- |
| **[MLH] Best Domain from GoDaddy Registry** | Register a domain. Minutes. Almost nobody bothers. |
| **Notability "Trust the Process"** | Keep the ideation/wireframe doc in Notability Pro, screenshot it, tag Notability as a tool. The Figma mock and this file are already that work — it just has to live there too. |

### Worth real effort, thin fields

| Challenge | The angle |
| --- | --- |
| **MathWorks** | Model the footprint arithmetic in MATLAB — the water/CO2 accumulation over the recipe DAG — and export a solved table the game reads at runtime. Never call MATLAB live. Historically draws 0–6 teams and has gone **unclaimed** at comparable events. Highest value per hour on this list. |
| **[MLH] Best Use of ElevenLabs** | A pixel game needs sound and currently has none. Chiptune-adjacent one-shots for combine / discover / fail, plus a short narration on the receipt. Also satisfies the "buttons must click" principle above, so it is not bolted on — it is required by the design. |
| **[MLH] Best Use of Backboard** | Long-term memory for the adjudicator: remember what this player has already tried and what they got wrong, and stop repeating itself. Genuine fit, thin field. |

### Plausible, decide later

| Challenge | Honest read |
| --- | --- |
| **[MLH] Best Use of Tiger Data** | Time-series of discoveries — what the world is making, over time. Real but not central. |
| **[MLH] Best Use of Vultr** | Deploy there instead of / alongside Vercel. Trivial, low value. |
| **Capital One Best Financial Hack** | There *is* an angle — the receipt is a true-cost breakdown, and adding real monetary cost beside water and CO2 is defensible. But it is a stretch, and judges flag shoehorning. Only if the money number is as well-sourced as the water one. |

### Not claimable

Persona, Presage, Solana — no honest fit. Do not reach.

**Lilie is not on Devpost.** Leo should ask an organiser how it is judged
before counting on it.

---

## 6. Open questions

1. **Does the arced wordmark need to be real per-letter rotation, or a
   pre-rendered sprite?** Rotation on pixel text destroys the pixel grid
   unless each letter is rotated to a whole number of degrees and snapped.
   A hand-drawn arc sprite is the safer answer and probably the better-looking
   one.
2. **What happens to the two realm accent colours** (`--color-survival`
   orange, `--color-everyday` teal) under a navy ground? They were picked
   against white.
3. **Does the Earth appear on every screen or only the title?** If every
   screen, the inventory grid has to stay legible on top of it.
