# The running order

Leo: *"these diagrams should last us to the end of the thing. as soon as the
demo ends, these diagrams have to last us many minutes."*

31 slides, eight acts, in `docs/slides/diagram-*.png`. At roughly twenty seconds each
that is about ten minutes of material — so this is a menu, not a script. Take
the acts the room wants and skip the rest; every slide stands alone.

Regenerate them all with `npm run diagram`. Every figure on every slide is read
out of `gameData.ts` at build time, so nothing here can drift from the game.

---

## Act 1 — why, in plain words (2 slides)

**`point`** — We asked four people to draw how something they own is made. None
could. *Open with this whatever else you cut.*

**`what`** — You start with twelve things, you put two together, you find out
what it took. No account, no install.

## Act 2 — the game (5 slides)

**`journey`** — Title, Survival's eighteen things, Everything's 1,015, a
discovery card, the inventory.

**`theloop`** — Try, nothing, *why not?*, try again knowing more. Being wrong is
the content, not the punishment.

**`wrong`** — 99.8% of pairs make nothing, and a player is told why every single
time: 36 rules answer instantly, one key asks Gemini.

**`hints`** — Three to start, one per ten found, one per ten dead ends. A hint
names one input, never the answer — and it comes from the solver, never the
model, because a hint is a claim about the graph.

**`feel`** — No blur, no gradient, integer scales, stepped corners. *Say: the
corner on this slide is the corner in the game; the same function draws both.*

## Act 3 — the data (6 slides)

**`numbers`** — 1,033 things, 1,036 recipes, 557 processes, 24 deep. 534,061
possible pairs, 0.19% of them real.

**`count`** — The slide that answers "why don't those add up?": 1,033 = 12
starters + 1,021 you make. 1,036 recipes = 1,021 outputs + 15 alternative
routes. 1,033 icons = 963 composed + 70 hand-drawn.

**`graph`** — Two in, one out, never a loop. Sand and soda ash make batch, lime
and heat make furnace, together they make glass.

**`depth`** — Every one of the 1,033 is reachable from twelve starters. The peak
is 129 things at depth 13; the deepest is 24.

**`chain`** — Soil to t-shirt, four real processes, depth 14 of 24.

**`honesty`** — The slide to volunteer rather than wait to be asked. 151
citations were read by a human, 1,923 are machine-checked. Eight recipes carry a
footprint; 1,028 say zero, because a number needs a page somebody read.

## Act 4 — the art (2 slides)

**`icons`** — 65 forms, 963 composed icons, 70 hand-drawn.

**`forms`** — The whole shape library on one screen.

## Act 5 — the stack (6 slides)

**`stack`** — The browser holds the game, two stateless functions hold the key,
Gemini gets two names.

**`tech`** — React 19, TypeScript 6, Vite 8, Tailwind 4, Vercel, Gemini Flash,
Playwright, k6. Four runtime dependencies.

**`where`** — A GoDaddy domain, Vercel's edge, one static bundle.

**`combine`** — The index, then 36 rules in under a millisecond, then the model
only if you ask.

**`api`** — The exact contract. Two endpoints, a closed enum, no free text.

**`fence`** — 514KB stays, 1,761 bytes go. *The strongest single slide here.*

## Act 6 — how it was made (4 slides)

**`gate`** — Propose, fetch every citation, a human reads it, it ships.

**`loop`** — The same thing end to end, ending at `gameData.ts` edited by hand.

**`responsible`** — Four rules the build enforces, not four rules we promise.

**`slides`** — These slides are generated from the same data the game ships.

## Act 7 — proof (4 slides)

**`tests`** — Named files, not a claim: `datatest.ts`, `edgetest.ts`,
`apitest.ts`, `devicetest.mjs`.

**`checks`** — 14 scripts, 1,024 URLs fetched, 280 layout checks, 250 players a
second.

**`load`** — The k6 ramp, and the honest story: we aimed it at production once
and Vercel's mitigation denied our whole IP. It runs against a local preview
now.

**`failure`** — 405, 400, and 200-with-null for everything else. Nothing throws.

## Act 8 — sponsors (2 slides)

**`gemini`** — Four uses: the adjudicator and learn-more at play time, the probe
and the proposer on a laptop. None has seen the recipe list.

**`sponsors`** — What we claimed and what we deliberately did not, against one
test: would this integration exist if the sponsor did not?

---

## If you only get ninety seconds

`point` → `wrong` → `fence` → `honesty`.

Why it exists, what the game actually is, the architectural claim, and the limit
we volunteer before anyone finds it.

---

## The 90-second stack block

Four slides, roughly 22 seconds each. About 230 words, which is 90 seconds at a
normal speaking pace — do not rush it, the numbers are the point and they need
air. Every figure is checked; see `PROGRESS.md`.

**`stack` — 0:00**

> The whole game is in the browser. All 1,036 recipes, the save, everything —
> one static bundle. Once it's loaded you could turn the wifi off and keep
> playing.
>
> There are two serverless functions behind it. They're stateless, there's no
> database, and the only thing they hold is the API key.

**`tech` — 0:22**

> React 19, TypeScript, Vite, Tailwind. Four runtime dependencies — react and
> react-dom are the only packages the app imports when it runs. No router, no
> state library, no UI kit. Every sprite, every corner, the star field behind
> it, all hand-built.

**`combine` — 0:44**

> So when you press combine: first a map lookup. If it's a recipe, you get the
> thing. If it isn't, a table of 36 rules answers in under a millisecond and
> tells you why not — not "nothing happened", an actual reason.
>
> The model only runs if you press *why?*. 99.8% of presses never leave the
> browser.

**`fence` — 1:06**

> This is the part I'd defend hardest. The graph is 514 kilobytes and it never
> leaves. What goes to Gemini is 1,761 bytes — two names and one question out of
> a closed list.
>
> The model has never seen the recipe list, and it can't: they're bundled
> separately. It couldn't tell you a real recipe if you asked it to.

**If you get interrupted**, the one to finish on is `fence`. The other three are
description; that one is an argument.
