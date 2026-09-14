# From Scratch

A crafting game where nothing is made up. You start with three things you could
pick up on a walk, combine two at a time, and work your way to a finished
object. Every recipe is a transformation that really happens, and every one of
them has a source you can click.

Finish something and you get a receipt for what it cost to make.

Play it: https://from-scratch-three.vercel.app

---

## The idea

Little Alchemy teaches you that fire plus water makes steam. It doesn't teach
you anything about steam.

We wanted the same loop with real industrial chemistry behind it, starting
lower than you'd expect. The game opens with Stone, Wood and Plant Fibre.
Fire isn't handed to you. It's the first thing you make, by spinning wood
against wood until the dust catches, which is how people actually did it.

Every pair of those three starters does something, so a new player's first
guess works no matter what they try.

| Realm | What it teaches | Targets |
| --- | --- | --- |
| Survival | How making anything works at all | Fire, Charcoal, Lit Torch |
| Everything | The process and work that goes into manufacturing ordinary items  | Cotton T-Shirt, Aluminium Can, Glass Bottle |

They aren't two separate games. Everything can't smelt without Survival's
charcoal or evaporate without its fire, so the aluminium can's receipt traces
twenty-two ancestors back through the ember and the hand drill to a stone and a
stick. Survival comes first because the graph genuinely needs it, not because
we wanted a gate.

There are 1,033 elements and 1,036 recipes, and fourteen of those elements can be
made more than one real way. The receipt records which road you took.

---

## Most things have two roads

- Fire comes from a hand drill in three steps, or a bow drill in six. The hand
  drill is how it was first done and it usually fails. The bow drill takes more
  work to build and works every time. That's the case for building a tool
  before you need one.
- Farmland comes from ammonia and soil (Haber-Bosch, which feeds roughly half
  the people alive) or from a compost heap, which takes a season and no gas
  well.
- Ammonia itself comes from natural gas, or from gasifying old clothes.
- Steel comes straight from pig iron, or the long way through wrought iron and
  the cementation process.
- Cotton comes from a watered field, or from shredded textile waste, which
  skips the 2,340 litres rather than charging a smaller number for it.
- Dye comes from boiled plants, from red ochre, or from bark tannin.

---

## Where the AI is, and where it isn't

Four places, two of them in the running game and two in authoring. What matters
is the second half of each.

**Why not?** A player combines two things and nothing happens, so the model
explains what actually goes on between them. It gets two element names and a
realm. It never sees the recipe list, so it can't recite an answer, and the
client only ever prints its reply as prose.

**Learn more.** Three fixed questions on something you've already found: how is
it made, why does it work, where is it used. The player sends a question key
out of a set of three and the server owns the wording. Open devtools and the
most you can send is `how`, `why` or `where`.

**The probe** (`npm run probe`) asks the live endpoint about pairs the graph has
no recipe for and collects the ones that come back real. About a third of the
recipes in the game were found this way.

**The proposer** (`npm run propose`) drafts whole chains toward a named target
into `data/staging/`, which `src/` cannot import from.

The model can't give you a discovery. That's a property of the code rather than
a promise in a prompt: the endpoints have never seen `gameData.ts`, and no code
path turns model text into an element. Only a lookup in the recipe index does
that. No number in the game comes from a model either. `npm test` fails the
build if a recipe carries a cost without a hand-read source behind it.

Hints don't use the model at all. A hint is a claim about the recipe graph, and
the graph is the one thing the runtime model isn't allowed to know, so the
solver picks and phrases them.

### The part that does the most teaching

Over 99% of the pairs you can try produce nothing, so "that didn't work" is by
far the sentence this game says most. In a game about how things are made,
that's where the teaching has to happen.

It answers instantly from a local rule table built on element properties. A
tool works on a material, so two tools have nothing to work on. Cold metal
keeps its shape. Two reagents need a third thing. Thirty-six rules cover all but
4% of the 533,025 pairs that aren't recipes, and the whole space resolves in
well under a second with no network. We think this beats a per-pair fact,
because it's the grammar of making things. Learn it and you start predicting
instead of guessing.

Pressing "why not?" is what reaches for Gemini, and only for that one pair. The
best answer it gives is "that's actually real, just not in here", and we treat
that as a bug report.

---

## Running it

```bash
npm install
npm run dev
```

The dev server comes up on http://localhost:5173. There's a styleguide at
`/styleguide` that only renders in dev.

| Command | What it does |
| --- | --- |
| `npm test` | Type-check, 315 assertions, production build |
| `npm run solve` | Reachability and cost report over the recipe graph |
| `npm run walkthrough` | Regenerate WALKTHROUGH.md from the data |
| `npm run probe` | Ask the live endpoint which missing pairs are real |
| `npm run sheet` | Every sprite on one page at the size it's used |
| `npm run links` | Fetch every citation and check it still exists |
| `npm run import` | Throw out every draft that's provably wrong |
| `npm run apply` | Write a vetted batch into all three data files |
| `npm run preview` | Serve the production build on :4173 |
| `npm run load` | k6 load test against that preview |

`GAMEPLAN.md` is the design and `plan/graph.txt` is that design in a form
`npm test` can check. `PROGRESS.md` is the running log, with the ledger at the
top. `DIRECTION.md` is the standing answer to what to work on next.

---

## The tests

315 assertions, because a project whose whole claim is rigour ought to be able
to prove it. The ones worth knowing about are the ones that caught something
real.

**The footprint accumulator doesn't double-count.** The graph is a DAG where a
node can be reached by several paths, so a naive walk counts shared ancestors
twice. `seed.ts` is a small fixture you can work out by hand, and its header
states both answers. The tests assert the right one (0.08) and also that it
isn't the wrong one (0.09).

**The solver refuses a cyclic graph**, and it has earned that twice. Letting you
recycle a finished t-shirt back into cotton closes a loop, and so does
heat-treating stone for better knapping. Both are real processes. Neither can
exist here, because the accumulator walks ancestors and a cycle either recurses
forever or quietly skips the step it was meant to skip.

**No local explanation may say a pair is impossible.** The model can come back
with "that's actually real", and the two would contradict each other on screen.
A test walks every pair looking for "impossible", "cannot" and "never", and it
caught a rule on the way in.

**The failure table has to keep up with the element count.** The fallback share
is pinned under a fifth, so adding elements without adding grammar fails the
build. This has already bitten us once, when one batch pushed it from 13% to
38%.

**Every element has its own art.** No sprite may be shared and none may fall
back to the flame. One run of this found twenty-four missing sprites.

**The title screen fits on every device, both ways round.** Written after the
sizes were computed from viewport width alone, which pushed all three menu
buttons below the fold of a phone held sideways, on a screen that clips its
overflow. You couldn't start the game in landscape at all.

**Motion is rare enough to be an event.** The shooting stars shipped at a rate
that read as "never". The city's window lights were measured at 7.6 changes a
second, which is a twinkle rather than a city. Both are measured now instead of
eyeballed.

**The pixel staircase is symmetric.** Mirror the corner polygon about its
centreline and the points have to come out unchanged. Written after a bug where
a panel's left corners stepped and its right corners came out square.

---

## How we know nothing here is invented

At seventy-two elements, a human read every source. That doesn't scale past a
few hundred, and the failure it guards against is the one that would sink this
project. Ask a model for a citation and it will hand you a real-looking URL to
an article that has never existed. By eye you cannot tell it from a good one.

So a citation now says how much checking it has actually had.

**Sourced** means a person opened the page, confirmed it says what the game
claims, and confirmed the units. 151 citations are this.

**Referenced** means `npm run links` fetched the URL, got an answer, and
confirmed the page title still matches the label printed beside it. That proves
the article exists and nothing more, which is why the game marks it on the card
instead of hiding it. 1,923 citations are this, across 1,024 distinct URLs, and
every one of them is fetched and title-matched on each build.

A footprint figure may only ever rest on a Sourced citation. "This page exists"
is no evidence for "this costs 2,340 litres", and `npm test` fails the build if
a recipe with a non-zero cost has nothing hand-read behind it. That rule doesn't
bend as the element count grows.

### The gate between a model and the game

`npm run propose` writes draft chains to `data/staging/`, which is gitignored
and which `src/` cannot import. `npm run import` then throws away everything
provably wrong before a human opens a single citation: a URL that 404s, a label
that leads to a different article, an id that already exists, an input that
doesn't, a pair another recipe already owns, a chain that closes a loop, a
placeholder verb like "making" where the real process word belongs.

What it won't do is write to `gameData.ts`. Judgement about whether a
transformation really happens stays human, and every survivor it prints is
marked `referenced` with a zero footprint, so nothing coming through this route
can quietly turn into a claim about a number.

We ran it against a staged file with one good proposal and six bad ones. All six
were rejected, each for the right reason, including a fabricated Wikipedia URL
caught by its 404 and a real URL sitting under a label belonging to a different
article.

The link checker caught a live mismatch on its first run too, a citation
labelled "Mercerised cotton" pointing at a page titled "Mercerisation". That's a
redirect rather than a broken link, and it's why the matcher compares word
prefixes. English does that to nearly every process in this game.

---

## Can it take a crowd

The honest answer is that there's very little here to take a crowd with, and
that's on purpose.

There's no database, no accounts and no session state. The whole thing is static
files on a CDN plus two serverless functions, `api/adjudicate.ts` and
`api/ask.ts`, whose only job is to keep the Gemini key off the client. Neither
remembers anything between invocations.

A player is one page load and then silence. The recipe graph, the solver, the
sprites and your progress all live in the tab once the page is up. Combining two
elements is a lookup in a Map on your own machine. No request goes out, nothing
is written anywhere else, and that holds whether you play for a minute or an
hour. The server does no work per move, and two people playing at once never
touch the same thing, because there isn't a shared thing to touch.

Progress lives in `localStorage`, which is why there are no accounts. It's
per-browser, it never leaves the machine, and the game asks for no personal
information, so there's nothing to sign in to. The cost is that progress doesn't
follow you to another device. For a game about making a t-shirt out of soil,
that felt like the right trade.

The one shared resource is the Gemini quota, and it's protected on the client
where it can actually be protected. Every answer is cached in `localStorage`
forever, and a session is capped at 20 calls, five a minute. A thousand players
at once are bounded by that cap rather than by the function.

### The load test

`load/gameplay.js` models arrivals rather than a fixed pool of users, because
the load here is new players showing up, not existing players doing work. It
ramps to 250 new players a second, and it reads the hashed bundle name out of
`index.html` at setup so it can't end up measuring 404s after a rebuild.

Against the production build on `npm run preview`: 48,151 requests, 16,050
complete player sessions, 401 requests a second, zero failures, and a p95 of 4ms
for a full cold page load. Against the live deployment before we stopped the run,
p95 was 179ms for the same thing.

We stopped it because it worked. Pointed at production, the ramp did 48,000
requests in two minutes and Vercel's automatic mitigation denied the whole IP.
Nothing was wrong with the project. The platform did exactly what it should.
Both scripts default to localhost now, and the reason is written at the top of
each file.

`load/adjudicate.js` splits the serverless function in two. The cold path sends
a body the handler rejects at its own validation step, so it never reaches
Gemini and costs nothing, and it can be run at any volume. That's the one that
answers whether the function survives concurrency. The live path is capped at 20
calls and has to be asked for by name, because that one spends money.

---

## Sources

The headline number is real. Chapagain and Hoekstra et al. 2006, *The Water
Footprint of Cotton Consumption*, Table 9. For a 250g t-shirt: 1,230 L blue
water (irrigation) plus 1,110 L green (rainfall) plus 380 L dilution, which
comes to 2,720 L. That's where the commonly quoted "about 2,700 litres" figure
comes from, and the game splits it across the steps the same way the source
does.

Glass: FEVE's life-cycle assessment gives about 0.9 kg CO₂ per kg of container
glass. At one 500ml bottle of 300g that's 0.27 kg, charged to the melt, because
the melt is where the energy goes.

Aluminium: the carbon anode is consumed by the reaction itself, roughly 1.5
tonnes of CO₂ per tonne of metal from the anode alone. We don't claim the
electricity, because it varies by grid by more than a factor of ten.

Cement: about 0.9 kg CO₂ per kg, two thirds of it out of the limestone rather
than the fuel. Concrete is the most used material on earth after water, and
cement on its own is roughly eight percent of human CO₂.

Only eight recipes carry a non-zero cost, and that's deliberate. A step with no
hand-read figure behind it gets zero rather than a guess. Every element links to
its own reference in-game.

---

## Built with

React 19, TypeScript and Vite, styled with Tailwind and linted with Oxlint,
deployed on Vercel from `main`. Load testing is k6.

The pixel art isn't image files. Sprites are written as arrays of strings, one
character per pixel, and a renderer merges horizontal runs of the same colour
into `<rect>` elements. Every icon in the game is editable in a text editor, and
an 11x11 tile costs tens of SVG nodes rather than hundreds. The scene backdrops
are the only bitmaps.

`npm run diagram` draws the stack and the authoring gate into `docs/`, in the
game's own palette and font.

---

## Credits

- Backdrop art: `public/forest-hillside.png` and `public/big-city.png`, both
  from Pixie. Both arrived as vector traces and both were snapped back onto
  their real 128x128 grid with `npm run snap`. The city reduction was verified
  lossless across all 262,144 pixels.
- Type: Press Start 2P, and Silkscreen for the wordmark.
- Sound is synthesised at runtime rather than sampled.
