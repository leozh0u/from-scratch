# The demo, in order

> The shot list for the normal-speed recording. Written down because Leo asked
> not to miss anything, and because a list held in someone's head at 2am is a
> list with holes in it.

**The two that must not be missed**, because they are the only two nobody else
has: the **fence** (devtools open, watch the request carry two names) and the
**citation on every discovery card**. Everything else is a good game; those two
are the claim.

## 1. Title screen — 15 seconds

Rotating planet, starfield, parallax. Hand-drawn, no asset packs.
**Two realms** — Survival is the tutorial, Everything is the main game and is
locked until Survival is finished. **Mode** picker: standard, purist (no hints
at all), easy (free hints), cheater (everything open). **Skip tutorial**, with a
confirm. **Mute**. **Reset**, with a confirm. Inventory is reachable from here.

## 2. Survival — the verb, and the fence

Pick two tiles; they land in the slots and the readout names the pair.
**Combine.**

**A discovery card**: sprite, name, "via <process>", a hand-written blurb, and
**the citations** — say out loud that every one of a thousand has one.
**Learn more** → three fixed questions → a real answer from Gemini.

**Now fail on purpose.** The readout prints an instant local reason from a
37-rule table with no network involved — 98% of attempts fail, so that had to be
free. Then **"why?"** → the model, on request: the pair, its answer, then pick a
subject and ask how, why or where.

**Hint**: three to start, one more per ten found and one per ten distinct dead
ends. Press it twice on the same board and it escalates from naming one input to
naming both. **Give up** → confirm → the whole remaining route, and nothing is
wiped.

**The stats block**: made, tries, dead ends, hit rate, hints, fails to next hint.

**Reach a target** and the Receipt opens instead of a card: dependency tree,
footprint, sources.

## 3. Everything — the scale

Completion bar against **1,004 elements**. The **still missing** strip with
"+N more", which refills itself as things are found. The city scene.
**Scroll the grid** — that is the shot that makes the number real.

## 4. Inventory

Everything craftable, found in colour and unfound as a silhouette with its name
still readable, counted per realm. In **cheater mode** the tree is browsable:
open anything and see the two things that make it, then click either of those.

## 5. Technical — 30 seconds

**Devtools, network tab, press "why?".** The payload is two names and a realm.
The endpoint has never seen `gameData.ts` and cannot import it.

Then: `npm run import` rejecting a fabricated URL by its 404. `npm run links` —
**998 of 998** answer and match their label. `npm test` — 297 assertions.
The k6 run: 401 requests a second, zero failures. And the two diagrams in
`docs/`.
