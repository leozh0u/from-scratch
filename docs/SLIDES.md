# The running order

Leo: *"these diagrams should last us to the end of the thing. as soon as the
demo ends, these diagrams have to last us many minutes."*

30 slides, eight acts, in `docs/slides/diagram-*.png`. At roughly twenty seconds each
that is about ten minutes of material — so this is a menu, not a script. Take
the acts the room wants and skip the rest; every slide stands alone.

Regenerate them all with `npm run diagram`. Every figure on every slide is read
out of `gameData.ts` at build time, so nothing here can drift from the game.

---

## Act 1 — why, in plain words (2 slides)

**`point`** — We asked four people to draw how something they own is made. None
could. *Open with this whatever else you cut.*

**`play`** — The flowchart. Twelve things, put two together, and the branch:
0.2% of the time a new thing and a card showing what it took; 99.8% of the time
nothing, one of 36 rules saying why, and the option to ask. Both paths return to
the same key.

## Act 2 — the game (4 slides)

**`journey`** — Title, Survival's eighteen things, Everything's 1,015, a
discovery card, the inventory.

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

## Act 5 — the stack (5 slides)

**`stack`** — The whole system in sixteen named parts. React 19, TypeScript 6,
Tailwind 4 and the 514KB graph in the browser; `api/adjudicate.ts`,
`api/ask.ts`, the edge cache, the key and GoDaddy DNS on Vercel; then
`gemini-flash-latest`, no free text, no numbers out. Vite, Oxlint, Playwright
and k6 on the shelf underneath, build-time only.

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

Three slides: 40 seconds on the stack, then 25 each. About 230 words, which is 90 seconds at a
normal speaking pace — do not rush it, the numbers are the point and they need
air. Every figure is checked; see `PROGRESS.md`.

**`stack` — 0:00**

> Everything you just saw runs in the browser. React 19, TypeScript, Tailwind,
> and the whole recipe graph as a 514-kilobyte import — the save is in
> localStorage, so nothing about you leaves the machine.
>
> Four runtime dependencies in total — react and react-dom are the only packages
> the app imports when it runs. No router, no state library, no UI kit.
>
> Behind it, two serverless functions: `api/adjudicate.ts` and `api/ask.ts`.
> They're stateless, there's no database, and the only thing they hold is the
> Gemini key. Vite, Oxlint, Playwright and k6 are build-time only — none of that
> ships.

**`combine` — 0:40**

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

---

## Crib sheet: every part on the stack slide

For the question after the question. One or two sentences each — enough to
answer without bluffing, short enough to say.

### The three columns

**The browser** is where the game actually runs. **Vercel** is the host: it
serves the files and runs the two functions. **Google** is Gemini, and it is
outside the system on purpose.

### In the browser

**React 19.3** — the UI library. You describe what the screen should look like
for a given state and React works out the DOM changes. One page, no router;
screens are state, not URLs.

**TypeScript 6.0** — JavaScript with types that are checked before anything
runs. `tsc -b` is the first thing `npm test` does, so a wrong shape fails the
build rather than the demo.

**Tailwind 4.3** — CSS as utility classes written in the markup instead of a
separate stylesheet. The pixel-specific parts — the stepped corners, the
four-sided bevels — are hand-written CSS, because Tailwind has no vocabulary for
them.

**4 canvas scenes** — four components that draw to a `<canvas>` rather than to
DOM nodes. `Starfield.tsx` (the sky, seeded so it is identical every load),
`PixelEarth.tsx` (the globe, rotating in whole-pixel steps), and `CityScene.tsx`
and `ForestScene.tsx`, one backdrop per realm. Canvas because a thousand
animating divs is a lot of layout work for something nobody looks at directly.

**The graph, 514KB** — every element and recipe as one plain TypeScript object,
imported and bundled into the page. Not fetched, not a database: once the page
has loaded, the game works offline.

**localStorage 6 keys** — the browser's own key/value store, per device, never
sent anywhere. `:discovered` is the save; `:mode`, `:skipped` and `:muted` are
settings; `:adjudications` and `:explanations` cache answers already fetched, so
the same question never costs a second call.

### On Vercel

**`api/adjudicate.ts`** — the *why not?* endpoint. Two element names and a
realm go in; one sentence about why they do not react comes back.

**`api/ask.ts`** — the *learn more* endpoint. An element name and one of three
question keys go in; a short paragraph comes back.

**`@vercel/node 13`** — the adapter that lets a plain `async (req, res)`
function be a serverless function. It is also why `apitest.ts` can run both
handlers in Node with a stubbed `fetch`.

**Edge cache** — Vercel's CDN. The static files are copied to servers near the
player, so the page loads from a nearby machine rather than from one origin.
The functions are not cached; they only wake when somebody asks.

**`GEMINI_API_KEY`** — the secret, held as an environment variable on the
server. It is the entire reason the two functions exist: a key in the bundle is
a key anyone can read.

**GoDaddy DNS** — the domain, pointed at Vercel. A judge types a name instead of
a `vercel.app` subdomain.

### At Google

**`gemini-flash-latest`** — the model. The fast, cheap tier, which is the right
one for a sentence a player is waiting on.

**500 / 1,200 tokens** — the output caps for adjudicate and ask. A token is
roughly three quarters of a word; the cap bounds both the cost and how long
anyone waits.

**3 question keys** — `how`, `why`, `where`. A closed set: the request carries
the key, the server owns the wording.

**2 realm values** — `survival` or `everyday`, and anything else is rejected.

**No free text** — the player cannot type anything that reaches the model. Open
devtools and the most you can send is one enum value.

**No numbers out** — the prompt forbids any number, quantity, percentage,
temperature or date. A number from a model is an unsourced fact, and the whole
claim is that nothing here is invented.

### On the shelf (build time only)

**Vite 8.3** — the dev server and the bundler that produces the one static file.
**Oxlint 1.82** — the linter, written in Rust, fast enough to run on every save.
**tsx** — runs a TypeScript file directly in Node with no build step, which is
how all 33 scripts in `scripts/` work. **Playwright** — a headless browser,
driven by code: the 14-device sweep, the PNG rasterising of these slides, the
video capture. **k6** — the load tester, scripted in JavaScript, that ramps to
250 new players a second.

### The two arrows

**1,761 bytes** is the largest request that has ever gone to Google, measured
off the wire by `apitest.ts`. **The prompt** is written entirely by the server;
the browser contributes two names and an enum key, and nothing else.
