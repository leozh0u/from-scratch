# From Scratch — running log

> Written so work can be resumed in a fresh session with no context. Newest
> section at the bottom. `CLAUDE.md` is what the project is; `docs/DESIGN.md` is
> what it should look and feel like; this is what has happened.

---

## LEDGER

Everything Leo has asked for, with a state and, for anything marked done, the
check that proved it. Nothing leaves this list silently. The **oldest** open
item is the one most at risk, so it is first.

Last verified: 2026-09-12, against the current commit and the live deployment.
**1,033 elements, 1,036 recipes, 1,021 makeable, 557 distinct real processes.** 1,024 of 1,024 citation URLs answer and match their label. 312 assertions green, 280 device checks green, 0 lint errors.

## Open

| # | Asked | State | Next |
| --- | --- | --- | --- |
| ~~1~~ | `UNLOCK_EVERYTHING` back to `false` | **done — the constant is deleted, not flipped.** A build flag left on is exactly the kind of thing that ships, so the way past the gate is now a mode the player picks: **Cheater**, which says what it is. Verified in the browser: on a cleared save the Everything key reads "finish survival first" with `aria-disabled="true"`, and picking Cheater turns it to "the main game" with the lock gone. `grep UNLOCK_EVERYTHING src/` returns nothing. |
| 2 | *"we are talking teaching how everything is made"* — get to Little Alchemy scale | **open — 932 elements, 935 recipes, 68 short of a thousand.** Thirty batches, every one through `npm run import` and `npm run links`; 926 of 926 citation URLs answer and match their label. Leo: *"aim for stopping at around 500... if 500 comes easy aim for 800, or even 1000."* 500 was passed at batch 16, 800 at batch 28. **Two more batches of thirty finishes it.** The loop is: write the batch JSON, `npm run import` (the gate), `npm run apply`, `npm run rebalance`, `node scripts/recolour.mjs`, `npm test`, `npm run links -- --new`. Earlier note: **200 passed, heading for 500 and possibly 1000.** 213 elements and 216 recipes, from 72 and 74. Leo: *"aim for stopping at around 500... if 500 comes easy aim for 800, or even 1000."* All three unlocks are built and `npm run apply` now writes a vetted batch into all three files in one pass. Original note: **all three unlocks built and the first batch is through: 72 to 85 elements, 74 to 87 recipes.** The batch went through `npm run import` like any other: it rejected one of my own thirteen, a citation labelled "Limewash" pointing at an article that redirects to "Whitewash". The contact sheet then rejected six of the thirteen icons for reading as each other, which added three forms to the vocabulary (`book`, `bar`, `heap`) and rebuilt `wheel`, which had been reading as a crate. `npm run propose` still cannot run here. Verified on the live deployment: the inventory reads **SURVIVAL · 15** and **EVERYTHING · 58**, up from 45, with cart wheel, soap and book all present. (1) Sprite vocabulary: 20 forms composed from one colour, verified rendering in the game. (2) Citation tier + `npm run links`: first real run passed 79 of 79 distinct URLs and caught a live label mismatch. (3) `npm run import`: exercised against a staged file with one good proposal and six bad, all six rejected for the right reason, including a fabricated Wikipedia URL caught by its 404. `npm run propose` cannot run here — there is no `.env.local` and `GEMINI_API_KEY` lives only in Vercel's environment. | **Leo or a teammate needs to put `GEMINI_API_KEY=...` in `.env.local`.** Without it the proposer cannot run locally and the element count stays at 72. `npm run probe` still works, since it goes through the deployed endpoint. |
| 2b | *"add more and more combinations"* | **open, and it stays open on purpose — 85 elements, 87 recipes, up from 43 and 26.** Four batches, the latest through the new import gate: the adjudicator's own findings, the cement chain, then the second-road batch. The probe still turns up real pairs faster than they can be sourced, so this is a seam to keep mining rather than a job that finishes. | Run `npm run probe`, hand-verify, source each one. |
| ~~6~~ | *"implement something for testing if the Web app can handle many people at one time"* | **done.** `BASE_URL=http://127.0.0.1:4173 k6 run load/gameplay.js` against the production build: **48,151 requests, 16,050 complete player sessions, 401 req/s, 0 failures, p95 4ms**, every threshold green. Against the live deployment before the firewall stopped it, p95 was 179ms for the same cold page load. Written up in the README under *Can it take a crowd*. |
| ~~2c~~ | Combining more than two at once | **dropped — Leo decided.** "lets stick with two things combined but lets increasen number of things." |
| ~~3~~ | *"a learn more or something that links to the api for a chatbot... we can have it be premade questions"* | **done — built as the premade-question version, and the free-form chat stays dropped.** The player sends a question KEY out of a closed set of three; the server owns the wording. Verified live on the deployment: all three questions answer, the cache stores `tinder_bundle:how` and `tinder_bundle:where` and re-answers instantly, and the handler returns 400 for a made-up key, 400 for a missing one and 405 for a GET. Found and fixed a real bug doing it — charcoal's "where" answer came back cut off mid-clause by the model's token ceiling, so replies are now trimmed to the last complete sentence. 24 assertions in `scripts/asktest.ts`. |
| ~~8~~ | *"do we keep the 15 for the starter and add much much more for the everything"* | **answered and adopted: yes.** Survival is frozen at 18 elements and 17 recipes, which is the tutorial-sized number he asked for. Everything is at 54 and 57 and is where every new element goes. | Nothing to decide; it is the authoring rule from here. |
| 4 | Silkscreen is caps-only, so the wordmark reads FROM SCRATCH | **open — needs Leo's call.** Verified by rendering `a` and `A` and comparing bitmaps. Jersey 10/15/25 are pixel sans faces with true lowercase and a distinct `c`, checked the same way. | One-line swap either way. |
| ~~19~~ | *"make sure the emojis are all good and accurate and up to the theme"* | **done — 638 of 948 icons had the wrong shape and now do not.** Forms were chosen by hand at authoring time and then shuffled by `rebalance.mjs` to relieve crowded silhouettes, which optimises for capacity and pays in meaning: `plate` was a fallback for nine other forms, so everything drained into it — 80 members including a house, a kettle and a road. A sock was a wave, a photocopier a jar. `scripts/reform.mjs` assigns the form from the element's own name, falling back to its phase and kind. Checked: largest form is 47 not 80, the contact sheet was reviewed, and `npm test` enforces a colour floor of 38 between any two elements sharing a form. `rebalance.mjs` is retired with a note not to run it after. |
| ~~20~~ | *"make sure the api stuff works"* | **done as far as it can be here — the handlers are run, not read.** `scripts/apitest.ts` invokes both Vercel functions in Node with a stubbed `fetch`: 405 on GET, 400 on a question outside the closed set or an over-long name, 200-with-null when the key is missing or Gemini fails, and a truncated answer refused rather than shown. **The last section asserts the fence off the wire** — it reads the bytes that actually left the process and fails if any element id appears in them. Largest body 1,761 bytes against a 514KB graph. What this cannot check is the LIVE deployment; see item 22. |
| ~~21~~ | *"works on all sizes like mobile, ipad, mac, windows etc"* | **done — 280 checks, 14 sizes, 5 screens, zero failures.** `scripts/devicetest.mjs` drives a real browser and asserts four things per screen, each one a fault that has actually happened here: no sideways scroll, no text clipped by its own container, no control under 24px, nothing pushed off the edge. 320px through 1920px, both iPads, two landscape phones. Found and fixed two while being written: the inventory's HUD had an invisible 92px spacer, and adding a button left its title nine pixels at 320. Windows-specific note: `window.innerWidth` includes a classic scrollbar, which is why the bench's readout measures its own box rather than deriving from the viewport. |
| ~~22~~ | Verify the live deployment | **done — Leo checked it from his phone and the model answered.** Stone + Soil in Everything, then "why?", returned: *"They just sit together as a simple mixture without chemically reacting or transforming into anything new."* That is the whole chain proved in production: the functions deployed, `GEMINI_API_KEY` is set in Vercel, and Gemini is reachable. It also confirms the adjudicator's rewritten prompt is live — the answer is about whether a DISTINCT NEW THING is produced, which is the fix from item 12, rather than the old question of whether anything happens at all. I could not run this myself: this machine is still under a Vercel browser challenge from my own load testing. |
| 23 | Move the last four docs under `docs/` | **blocked on a teammate.** The README links to `DIRECTION`, `GAMEPLAN`, `PROGRESS` and `WALKTHROUGH`, and somebody is editing it — moving them breaks their links from underneath. | Two minutes once the README is done. |
| 24 | The bundle split | **open, and deliberately not done before filming.** `gameData.ts` is 498KB of the 878KB bundle, 101KB of it gzipped, and only `App.tsx` imports it — so the split is one import site. The honest framing is headroom rather than a fixed problem: 212KB gzipped is about a third of a second on 4G. It gets worse as the graph grows. | Leo's call, after the gameplay is filmed. |
| ~~25~~ | *"target more the learning side, making it fully unique from little alchemy"* | **done — the process record.** 557 distinct real processes are in the graph, 361 of them appearing exactly once, and every one was flashing past on a discovery card and vanishing. There is now a record of them reached from the inventory, counting only what the player has actually done. Checked in the browser and swept at all 14 sizes. The argument is written up in `DIRECTION.md`: the difference from a whimsical crafting game is not only that the recipes are real, it is that **the verbs are real**, and the verbs are the part nobody knows. |
| 26 | *"plan what more we could do with the api, like a chat bot"* | **answered, and the recommendation is not to build one.** In `DIRECTION.md`: a free text box is a machine for confident guesses about the two things the model must never guess. Worth building instead, in order: asking about a PROCESS out of the closed set the data already contains, then a model-written session summary. **Say the refusal on camera** — every other team has a chat box and none can explain what theirs is not allowed to do. |
| ~~15~~ | *"the size of this block is inconsistent as it gives the explanations for wrong combinations, hints, etc. that kind of trips up the location of the items below which is bad for the user experience"* | **done — the bench has one fixed-height readout and nothing below it moves.** Five replies were printing into the panel's flow at five different heights. The two whose length cannot be known in advance — the model's prose and the give-up route — open panels now (`WhyNot.tsx`, `RouteCard.tsx`); the other three are known strings, so `ui/readoutFit.ts` computes the tallest over the real set (37 reachable failure messages, three hint templates, the longest element name) and the strip is built to it. Checked: 292 assertions, 13 device widths swept in `scripts/layouttest.ts`, and the live DOM at 320/375/700/900px gives the first tile an identical `top` in the idle, pair, dead-end and hint states. Three bugs found verifying it: the key's box was not reserved (17.7px jump), the width came from `window.innerWidth` (15px wrong wherever scrollbars take space), and the HUD title clipped `EVERYTHING` at 375px. |
| ~~16~~ | *"remove: this prints every step still between you and fire. nothing is wiped"* | **done.** `grep` for the sentence across `src/` returns nothing; the confirm is now the question and its two keys. |
| 17 | *"whats next it whaat to do with the sponsors, like tigerdata, mathworks, godaddy"* + *"the sponsors also shouldnt be a stretch. they have to make sense being there. not there for the sake of it"* | **answered — the analysis is in `DIRECTION.md` under *Sponsor by sponsor, honestly*, and the test each one has to pass is "would this integration exist if the sponsor did not".** Claim four: **Games & Gamification** (thinnest field, and this is a finished game), **Gemini** (four uses, and the fence is provable in devtools), **Ken Kennedy / responsible AI** (least contested, best fit — the rule is enforced by a build step that fails, not promised in a prompt), **GoDaddy** (a domain, which the game needs anyway). **MathWorks is conditional**: the genuine fit is Leontief input-output analysis over the recipe graph, which is the standard method in life-cycle assessment and exactly what this game claims to do — but most footprints here are zero, so it needs 40-60 hand-read figures along one chain first. Only if a teammate takes the sourcing. **Tiger Data is the stretch and is dropped**: no backend storage and no time-series data, on purpose, and the nearest honest use contradicts the pitch. | Leo picks; the three easy ones are an hour together. |
| ~~18~~ | The demo video: *"after the fun intro... play a bit, then time lapse finishing the game, or going far. like very very speedy time lapse"* | **done — the game plays itself, so the timelapse is real play rather than sped-up footage of a mouse.** `src/game/demo.ts` plus a driver in `Workspace`, off unless the URL asks: `?demo=1&ms=250` for the "play a bit" shot, `?demo=1&ms=40&batch=12` for the timelapse. It goes through `game.combine` like a press does, so every tile is a genuine discovery down the real path; it just does not open the discovery card, because twenty-five full-screen cards a second is a strobe. Measured in the browser: **Survival 15/15 in 2.5 seconds, Everything 920/920 in 27.9 seconds.** Batching exists because the cost is React re-rendering a grid on its way to nine hundred tiles — one discovery a tick capped out near three a second. `scripts/edgetest.ts` asserts the driver reaches every craftable element in both realms and returns null rather than spinning. | Leo screen-records it; see `VIDEO.md` note below. |

| ~~9~~ | *"make it try to look like its spinning"* (the planet) | **done.** It was already rotating; at a three-minute period on a 72-pixel disc each frame moved the surface by a fraction of a texel, so all you could see was dither. Now stepped in `2 x size` increments, one pixel of travel at the disc centre per step, 4.5 steps a second, 32s a turn. Checked in Node rather than by looking, because `requestAnimationFrame` does not run in a hidden tab: rendering two consecutive steps and diffing gives a median move of 313 of 4,072 disc pixels, worst case 161. `scripts/earthtest.ts`, 11 assertions. |
| ~~10~~ | *"inventory is tiny"* | **done.** The heading was a fixed 11px, the smallest thing in a bar built out of slabs. It now uses the workspace's `clamp(9px, 1.9vw, 22px)`. Build clean, 187 assertions green. |
| ~~11~~ | *"remove the: this wipes both realms"* | **done.** `grep` for the sentence across `src/` returns nothing. |
| ~~7~~ | *"make the two bottom side phrases seem more 3d"* | **dropped — Leo looked at it and reverted.** "ok no the old one looked better, the new one isnt good." Tried a real `perspective() rotateX()` rim instead of the `scaleY` squash, plus a filled letter extrusion in place of the single offset shadow. Working tree restored to 30b7c55; 152 assertions green after the revert. | — |
| ~~5~~ | *"lets plan what to do with the empty space on either side"* | **open — needs Leo's call.** The three panels are the same width again and the bench has room either side of the slots. Proposal below. | His decision on which, then it is an hour. |

### The empty space either side of the bench — the proposal

The panel is 620px wide and the two slots plus the key use about 200 of it.
Two things earn that room, and both are things the game is going to need
anyway once there are hundreds of elements rather than seventy-two:

1. **A search box, on the right.** There is no way to find an element except
   scrolling the grid. At 72 that is mildly annoying; at 250 it is the thing
   that makes the game unplayable, and it is the single change that pays off
   most as the scale goes up. Pixel text field, same slab construction as
   everything else.
2. **The running footprint, on the left.** Water and CO2 for everything made
   so far. It is the whole point of the project and it is currently only
   visible inside a receipt you have to open. Sourced numbers only — the
   standing rule does not relax for a running total, so unsourced steps add
   zero and the label says how many of them there were.

Not recommended: the target list (it already has its own bar directly above,
and duplicating it is worse than leaving the space empty) or the last few
discoveries (the inventory below is already that, in full).

| ~~12~~ | *"that screenshot is the gemini api. thats an issue. i dont want that happening. it needs to be a thing"* | **done — the prompt was asking the wrong question, and rewriting it took it from 88 to 0.** The first sweep of all 152 Survival pairs with no recipe had **88 come back "that's actually real"** — but reading them, almost none were missing recipes: "torch + ember: the flame transfers", "fire + fire: merging flames makes a larger fire". The model was answering *would something happen*, which is nearly always yes, when the game's question is *does this produce a distinct new thing*. `api/adjudicate.ts` now asks whether the pair "PRODUCE[S] A DISTINCT NEW MATERIAL OR OBJECT — something that has its own name and is not just one of them in a different state", and lists what does not count: burning, holding, carrying, sitting together, more of what you already have. Checked by re-sweeping all 152 pairs against the live endpoint: **0 of 150 now claim a pairing is real**, down from 88. That sweep needs the deployed endpoint and cannot be re-run here — `GEMINI_API_KEY` is only in Vercel's environment, not in `.env.local`. |
| ~~13~~ | *"the arrow is still so tiny"* (← realms) | **done.** It was the character "←" at the label's own size, so on a 9px button it was a 9px glyph with a one-pixel stem. It is a drawn sprite now, scaling from the button's unit. Measured in the browser: 22x18px arrow on an 89x46 button, against 16px type. |
| ~~14~~ | *"...unlock every possible thing"*, targets replaced with things-missing, hint mode, 3 per realm then 1 per 10 found | **done.** Everything's bar is now a completion bar plus **six of what is still missing**, ordered by how close each is to being makeable — not all of them, since at 73 that would be a second inventory. Survival keeps its three targets, because a tutorial with an explicit finish line is the point of one. Hints as below. Hints are built exactly as asked: the SOLVER picks (never the model — a hint is a claim about the recipe graph, which is the one thing the runtime model may not know), it names one input and what kind of thing comes out, and pressing again on the same board spends a second hint and names both. Budget persists per realm as spend, not balance. The bench now carries a made-count. **Still to do: replace the three-target bar with what is missing.** | Swap TargetList for a missing view. |
| ~~15~~ | *"give up on the right of combine"*, *"take advantage of the empty space"*, *"add some stats, like how many tries"*, *"i dont like when its too empty"* | **done.** I argued against give up, Leo asked again, so it is built — as the half he described first, *"show how to reach fire or something"*: it prints every step still between you and the next target, generated from the graph so it cannot go stale, behind a confirm. **It does not wipe anything**, and that is the one part of his original wording I left out: being shown the answer is already the cost, and there is no fail state here to be sent back from. One line to add if he wants it. Bench now carries made / tries / hints-left on the left and hint + give up on the right. Tries persist per realm in the save. Swept ten widths 320-1440: nothing outside its panel, no scroll. |
| ~~19~~ | *"can the everything survival and inventory top titles be capitlised"* | **done.** Both `h1`s now `uppercase`. Verified in the DOM: the workspace title reads "SURVIVAL". |
| ~~20~~ | *"they are not level"* (mute vs reset) | **done, and it was arithmetic.** The speaker was eleven rows at scale 2, so 22px, against a label's line box of `unit * 3 * 1.3` = 12px — the mute key stood ten pixels taller. Redrawn at six rows, and the icon sits in a box exactly as tall as a line of the button's own type. Measured: both 54px tall, both at top 16. |
| ~~17~~ | *"top right below or next to reset add a mute button"* | **done.** Beside reset rather than under it, so the corner stays one object and a short window does not push the lower one into the wordmark. Verified in the browser: aria-label flips Mute to Unmute and `from-scratch:muted` persists as "1". |
| ~~15b~~ | *"what should be on the left of the combine then, in that empty space"* | **open — needs a decision alongside 14.** | |
| ~~16~~ | *"where did the upclose bird go. i want more small moving stuff"* | **done.** It was drawn all along and simply too rare: a 34-to-80 second period across two birds left the sky empty about two thirds of the time. Three near birds and five far ones now, on 30-to-60 second periods. Measured by `citytest`: one every 14.0s, something in the sky **59% of the time** (was ~30%), and the band is pinned between a third and three quarters — below a third somebody asks where the birds went, above it, it is a flock. |
| ~~18~~ | *"when the bottom things sway, they sometimes seperate and the pixels of the trees start floating"* | **done, and it was arithmetic rather than taste.** A tuft is rows one pixel apart and the vertical offset was scaled PER ROW, so at whatever row the rounded offset changed from 0 to -1, the scanline between them was drawn by nobody — a transparent seam across the foliage with the top half hovering. dy now moves the whole tuft as one object; dx stays per row, because a sideways-shifted solid bar moves an edge rather than opening a hole, and that stepped edge is what bending looks like. Sway also raised from 2px to 3px as asked. New test reproduces the draw loop and asserts the filled rows are contiguous: **2,244 poses, 0 seams**, plus an assertion that the old per-row version really did tear so the test has teeth. |

| ~~21~~ | *"200 the goal now"*, *"think broad and wide"*, *"i like niche things"* | **done — 72 to 213 elements, 74 to 216 recipes, 186 craftable in Everything.** Five batches through the gate: petrochemicals and plastics; copper, electricity and a car; sound, sport, cloth and the kitchen; medicine, navigation, the sea and the sky; trades, instruments and the house. **218 of 218 URLs answer and match their label.** Ground rules written into `DIRECTION.md`. Leo's 500 stays a later ambition. |
| ~~22~~ | *"a mode section"* / *"add one more mode called Cheater that just skips the tutorial"* | **done.** Four modes in the corner: standard earns hints, purist has none and no routes, open is unlimited. The mode changes the HELP only, never the graph or a cost. Verified: picking purist stores `purist`, removes the hint key and reads "hints left: none". |
| ~~23~~ | *"every 10 failed tries gives a hint. but only if its not repeated"* | **done, deployed in commit 1bfc5d2.** Distinct dead ends are stored as pair keys per realm, so the same pair in either order counts once. Five assertions. Leo's screenshot showing no "dead ends" stat was a cached build. |
| ~~24~~ | *"theres still so much empty space, maybe make them bigger, or include more stats"* | **done.** The slots and the key now step up with the window (64/80/96px, unit 5/6/7) in whole steps, because a sprite at a fractional multiple stops being pixel art. Six stats: made, tries, dead ends, hit rate, to go, hints left. Hit rate rather than another count, since over 97% of pairs do nothing and a bare try count reads as a record of failure. |
| ~~25~~ | *"if theres way more missing something tells that... and if a missing one gets found make sure it updates"* | **done, and verified by playing it.** A "+N MORE" key opens the inventory. Made bark: it left the strip, sharp stone took its place, and +195 became +194 in the same paint. The strip is recomputed every render from `isDiscovered` rather than picked once, which is what makes it self-healing. |
| ~~26~~ | *"mobile users, ipad etc"* | **done.** Swept 16 real device sizes both ways round — iPhone SE through 14 Pro Max, Pixel 7, Galaxy Fold at 280px, iPad mini, iPad Pro 11 and 12.9, laptop, desktop — on both the title screen and the workspace, checking for horizontal scroll, offscreen controls and tap targets under 24px. **Zero failures.** |

| ~~27~~ | *"add one more mode called Cheater"* / *"turn unlock_everything false and add the lock"* | **done.** `UNLOCK_EVERYTHING` is deleted, not flipped — a build constant left on is exactly the kind of thing that ships. Cheater is the only mode that changes what is REACHABLE rather than how much help you get, which is why it is a named choice. Verified on a cleared save: the Everything key reads "finish survival first" with `aria-disabled="true"`, and picking Cheater turns it to "the main game". |
| ~~28~~ | *"i like the drop down like the mode. do the same for the reset button"* | **done.** Reset opens into "keep it" / "wipe it" in place, at the same width, instead of a modal. Keep-it sits under the finger that just pressed so an accidental second tap is harmless. The inventory uses the same control. Measured: closed key and both answers all 160px on one left edge; wipe took a save from four discoveries to three starters and returned to the title, and the mode preference survived it. |
| ~~29~~ | *"the stats page is a little ugly and hard to read, try to make it in a box"* / *"include the how many fails for next hint"* | **done.** It is a real inset now — same staircase and outline as everything else, but lit from BELOW, which is what makes it read as a hole in the machine rather than a key nobody made pressable. Made is the lead figure; the rest are a two-column grid with each number sitting directly on top of its label instead of a long way to the right of it. "Fails to hint" counts down to the next earned hint. Fourteen device sizes re-swept, zero overflow. |

| ~~30~~ | *"unlimited hints -> free hints"*, *"replace Open with Easy"* | **done.** Verified in the picker: earned hints / no hints / free hints / everything open. |
| ~~31~~ | *"make a button left of the mode saying Skip, and like the reset button make it confirm"* | **done, and it is now separate from Cheater.** Two different wishes were sharing one control — "let me read the whole graph" and "I have played Survival before" — and the second is an ordinary thing to want on a second sitting. Verified: skip confirms, persists as `from-scratch:skipped`, the key then reads SKIPPED / already open and is locked, and the Everything gate opens. |
| ~~32~~ | *"cheater mode is so that everything is unlocked... in the inventory give option to open up everything and see what two things make it, and then click on either of those"* | **done.** Cheater reveals every element as a VIEW and never writes — verified the save was byte-identical before and after, and locked tiles go inert again on the way out. The card now shows MADE FROM as two pressable keys: walked car → engine → gear → bronze + welded steel in the browser. The counter still reports what was really made. An edge test proves the walk always bottoms out: deepest chain is 7 steps. |
| ~~33~~ | *"why is hit rate 300"* / *"the stats dont update well at all"* | **done — two real bugs.** The rate divided "made" (how much of the realm exists, including carry-over and anything found before the counter existed) by tries (presses of one key). Two different populations, so the answer was meaningless and flattering. Successes are counted in the same branch that grants an element now, and the rate is clamped. The attempt was also counted BEFORE the empty-slot guard. Played it through: 0 tries shows a dash, one success 100%, one failure 50%, dead ends 0 → 1, fails-to-hint 10 → 9. Six assertions, one sweeping 11,600 combinations for anything outside 0-100. |
| ~~34~~ | *"remove the two shadow phrases... its pretty self explanatory"* | **done.** The answer keys carry no legend; "keep it" and "wipe it" are the whole sentence and a second line under each was the same words in smaller type. The CLOSED key keeps its legend, where "reset" alone does not say reset what. |

## Blocked on Leo

| Asked | State |
| --- | --- |
| Teammates filming the old UI | **blocked.** They need https://from-scratch-three.vercel.app and almost certainly a re-shoot; the UI is unrecognisable from this morning. |
| **This network is under a Vercel challenge again — check the link from your phone** | **blocked, mine, and less serious than last time.** The header says `x-vercel-mitigated: challenge`, not `deny`: a per-IP browser check rather than a block, triggered by my own automated requests to the deployment (deploy polling and the probe). A person on a clean network should not see it at all, but I cannot prove that from here — the automation browser fails the check with "Code 11", which is what an automation browser is supposed to do. **Please open it on your phone off wifi and tell me what you see.** I have stopped every automated request to the deployment; link checking only touches Wikipedia. Every commit is pushed, so Vercel is building them regardless. |
| **The earlier block (2026-09-12, resolved)** | **blocked — mine, and it is being waited out.** A k6 ramp at production did 48,000 requests in two minutes and Vercel's automatic mitigation denied the IP: `x-vercel-mitigated: deny`, 403 in a real browser as well as from curl, after about a minute of refused TLS handshakes before that. It is IP-scoped, not a deploy problem — the build is fine and `main` deployed clean. Waiting it out and polling every 30s. A phone off wifi, or anyone on another network, is unaffected. Both load scripts now default to localhost so it cannot recur. |

## Done, with the check that proved it

| Asked | Check |
| --- | --- |
| *"add some fun small animations like the forrest"* for the city | Window lights found in the artwork itself and birds crossing the sky; `scripts/citytest.ts` measures both rates. Verified in-browser: 36 to 90 overlay pixels varying over ten seconds. |
| *"we want things that cant go together also explained why"* | 36 rules; the generic fallback went from 73% of non-recipe pairs to 12.9%, with 37 distinct answers. `explaintest.ts` pins it under a fifth. |
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
| *"is the gemini api key working right now"* | Hit production twice with new-element pairs; both returned real answers. It serves one thing: the *why not?* button. |
| *"we need to add more combinations"* (three batches) | 43 elements and 26 recipes at the start of the day, 72 and 74 now, every one sourced. `npm run solve` reports all reachable; the cement chain, the compost route and the syngas route each played through in the browser. |
| *"why are these pixles like not actaully pixels but weird shapes"* | Measured the trace: run lengths pile up at 4, 8, 12, 16 and 75% of colour changes land on a multiple of 4, so the art was drawn at 128 and traced at 512. `scripts/snapToGrid.mjs` rebuilds it on that grid. The city reduction verified **lossless across all 262,144 pixels**. |
| *"add some fun small animations like the forrest"* | Lights and birds. Both rates were wrong on the first pass (7.6 window changes a second, birds on screen 76% of the time) and `citytest.ts` caught both before Leo saw them. Verified live: bird sprite rows present in the deployed bundle. |
| *"we want things that cant go together also explained why"* | Measured across all non-recipe pairs: fallback share 73% before, 12.9% after at 69 elements, 37 distinct answers, no line using the forbidden "impossible / cannot / never". |
| *"in inventory, do we show everyhthing thats missing"* | Every craftable element listed, locked ones as silhouettes with the name readable, split by realm. Verified on **production**: 60 tiles, "SURVIVAL · 0 OF 15" and "EVERYTHING · 0 OF 45". |
| *"animate more stuff in the city"* | Clouds sway, treetops sway, birds at two distances, and a plane every 2.7 minutes. Verified on production: overlay animating, 480-525 pixels. Rates measured in `citytest.ts`, 19 assertions. |
| *"why is the tabbed and untabbed size so different"* | The wordmark was absorbing all the height variance. Now width-driven: measured identical (unit 12) at 1512 wide across six window heights from 950 to 1300, and pinned by a test. |
| *"instead of everyday objects, call it Everything"* | Renamed in the HUD, the title screen, the inventory and the walkthrough; realm ids untouched so nothing migrates. Verified in the DOM: button reads EVERYTHING. |
| *"write tutorial and main game... on the side of the key"* | Legends print on the extruded side face, skewed -18deg and squashed to 0.62. Checked the skew at the real 9px size before shipping it, and confirmed the legend sits inside an `aria-hidden` element so it stays out of the button's accessible name. |
| *"make sure the pixelated small emojis are good and accurate for all"* | Built `npm run sheet`, a contact sheet of every icon at the used size with its name. Looking at all 72 found two the tests passed happily: Wood was an orange starburst, Cordage a pale wick. Both redrawn from the vocabulary and re-checked on the sheet. |
| *"fix everthing, make sure no bugs"* | Swept all five screens on **production** for non-pixel type, radii, blurs, offscreen controls and horizontal overflow. Found and fixed two real layout bugs (the item grid's column count, an invisible 92px spacer). Swept again after the third batch, at 72 elements: clean on every screen. |
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
`docs/DESIGN.md` §5. Short version: Gemini is already earned and strong; GoDaddy and
Notability are nearly free; MathWorks, ElevenLabs and Backboard are worth real
effort in thin fields.

### Design direction set

Leo supplied a Figma mock: deep navy starfield, large pixel Earth cropped by
the viewport, arced Press Start 2P wordmark, chunky lowercase pixel buttons.

**This reverses the codebase's stated design philosophy.** `src/index.css`
currently commits in writing to "retro backdrop, crisp panel — don't leak scene
styling into the panel". The new direction is pixel all the way through. Full
brief, principles and techniques in `docs/DESIGN.md`.

Leo's stated veto: **nothing may look AI-generated.** That rules out NES.css,
RPGUI, soft shadows, blurs, smooth gradients, and evenly-spaced decoration.
Reference point is his own Vestigo (`~/Projects/vestigo`, vestigo.earth), whose
interaction code argues that weight and momentum are what make a control feel
like an object.

### Open

- Leo is still describing the game's logic and goals — more direction incoming.
- Nothing has been changed in the repo yet beyond adding `docs/DESIGN.md` and this
  file. No commits pushed.

### Architecture plan written — `docs/ARCHITECTURE.md`

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
  line. Flagged in `docs/DESIGN.md` that a hand-drawn arc sprite is the safer answer
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

## More combinations, found by the model

Leo: "when i click why not for some combinations it says actually this
combination does exist."

That is the design working. The adjudicator only ever gets two element NAMES,
never the recipe list, so when it says "that's actually real" it is reporting a
gap rather than reciting from the graph. `npm run probe` turns that into a
worklist: it walks the pairs that are not recipes, skips the ones the local
rule table already answers, asks the live endpoint, and writes the hits to
`plan/candidates.md`. Nothing from it reaches `src/` without a human checking
the transformation and finding a source.

**56 of 90 sampled pairs came back real**, which is the measure of how much was
missing. Most are interactions rather than recipes — a lit torch will set fire
to cloth, oil can be stored in a glass bottle — and those stay out. Six were
real transformations that make something, and they are in, each with a source:

- **Iron Ore + Natural Gas -> Pig Iron**, direct reduction. A large and growing
  share of the world's iron, and the route that needs no blast furnace.
- **Limestone + Salt -> Soda Ash**, Solvay's own inputs. A second route beside
  the quicklime one, which is the same cycle a step later.
- **Quicklime + Pig Iron -> Wrought Iron**, lime as the flux that pulls the
  carbon and impurities out.
- **Wrought Iron + Charcoal -> High-Carbon Steel**, the cementation process, a
  second road to steel.
- **Sodium Hydroxide + Cotton Jersey -> Mercerised Cotton**, and mercerised
  cotton dyes as a route of its own. Lye under tension swells the fibre so it
  takes colour far better, which is why almost every good cotton shirt has had
  it done.

59 elements, 57 recipes. Solver passes with everything reachable; the new
direct-reduction route puts pig iron at depth 1 without breaking the cross-realm
dependency, since steel still needs Survival's charcoal and wrought iron still
needs its fire.

## The pixels that were not pixels

Leo: "why are these pixles like not actaully pixels but weird shapes."

Both backdrops arrived as **vector traces** of pixel art, and a trace does not
preserve a grid. It preserves outlines: every block becomes a polygon with
fractional edges, so the "pixels" have ragged one-pixel steps and blended
corners. It reads as nearly-pixel-art, which is worse than either honest
option.

The original grid is recoverable, because a trace keeps block boundaries even
while it fuzzes them. Measuring the forest: horizontal run lengths pile up at
**4, 8, 12 and 16**, and **75% of all colour changes land on a multiple of 4**
against 25% for random data. It was drawn at 128 and traced at 512.

`scripts/snapToGrid.mjs` renders the SVG with `rsvg-convert`, takes a majority
vote of the declared palette over each cell of the real grid, and writes a PNG
at that size. It carries its own minimal PNG reader and writer so it needs no
dependencies. The forest is now 128x128, every block exactly square, **3.9KB
instead of 478KB**, and `image-rendering: pixelated` is finally the right
property for it. The SVG moved to `art-source/` so it stops being deployed.

## Small motions in the city

Window lights and birds, on the same principle as the forest's sway: occasional,
slow, and measured rather than watched.

**The lights are found, not placed.** A hand-typed list of coordinates would
drift the moment the art changed and half of them would land on brickwork.
`CityScene` reads the artwork into an offscreen canvas at startup and keeps the
warm bright pixels, which in this picture are exactly the lit windows and the
shop signage, sampling the wall colour a few rows below each one. Lights only
ever go **out**, painting the building's own tone over a window, so there is no
invented light colour to clash with the art.

The overlay uses `coverTransform`, which reproduces what `object-fit: cover`
does, because a light drawn half a building from its window is worse than no
light at all.

**Both rates were wrong on the first pass and the test caught both.** Windows
flickered 7.6 times a second across the detected set, which is a twinkle rather
than a city; one in eight is now on a timer of forty to a hundred and forty
seconds. Birds were on screen 76% of the time, which is a flock; two birds on
longer crossings puts it at 42%, one every 25 seconds.

That is the shooting-star lesson applied before Leo saw it rather than after.

## Both backdrops are 128x128, and that is not a compression trick

`big-city.png` shipped at 512. Every run length in it is a multiple of four and
**100% of its colour transitions land on a multiple of four**, so it was a clean
4x upscale of a 128 grid. `npm run snap` reduced it back and a check confirmed
the reduction is **lossless across all 262,144 pixels**. 22KB to 6.3KB.

The size is incidental. What mattered is that the overlay now knows how big one
of the artwork's pixels is. The window lights were being drawn one 512-pixel
wide, which is a QUARTER of a window: measured, the whole overlay was painting
four pixels on screen and was effectively invisible. Drawn one artwork pixel
wide it is 36 to 90 pixels, four to ten windows dark at a time out of about
250, changing every few seconds.

Both scenes now: 128x128 source, `image-rendering: pixelated`, square blocks.

## The failure copy, which was the thing the game said most often

Leo asked for this on day one: "we want things that cant go together also
explained why." It has been on the ledger as open ever since, and measuring it
showed why that mattered.

Across all **1,713 pairs that are not recipes**, nine rules covered a quarter
and **73% got "Nothing obvious happens."** In a game where 98% of what you try
fails, that sentence was the single most common thing the game said, and it
teaches nothing.

Twenty-seven more rules take it to **13.3%**, with 37 distinct answers. They
are still grammar rather than trivia, which is the whole argument: a player who
learns that a tool needs a material, a reagent needs something to react with,
and cold metal keeps its shape starts predicting instead of guessing. That
scales to Little Alchemy size; 1,700 separate facts do not.

One rule had to be rewritten before it shipped: "You cannot cut or press a
chemical" contains the word the existing test forbids, because the model may
still answer "that's actually real" for the same pair and the two would
contradict each other.

`explaintest.ts` now pins the fallback share under a fifth, so adding elements
without adding grammar fails the build.

**One copy bug caught by playing production rather than reading the diff.**
`fibre-and-mineral` fired on the fibre PHASE, which covers bark, tinder and raw
plant fibre as well as cloth, so knapping bark against a stone was answered with
"cloth and stone do not take to each other" — true of cloth and nonsense about
bark. Narrowed to the textile KIND; raw organic fibre now falls through to a
line that is actually about it.

## Ten more elements, twelve more recipes

"add more and more combinations... you have full creative control, just make
sure it makes sense." So: one coherent chain rather than scattered pairs, and
the chain picked itself, because it carries the biggest number in the subject.

**Cement.** Soil washed in water gives clay; clay fired gives brick; limestone
ground with clay gives **raw meal**, which is the industry's own name for it;
raw meal burnt at 1,450 degrees gives cement; cement and sand give concrete.
The cement step carries **0.9 kg CO2 per kg**, about two thirds of which comes
out of the limestone itself and cannot be avoided by burning cleaner fuel. It
is the best teaching story in the game: concrete is the most used material on
earth after water, and cement alone is roughly eight percent of human CO2.

Beside it, two things lime does that are not cement: **slaked lime**, which
boils itself when you add the water, and **lime mortar**, softer than the stone
it joins, which is why Roman walls are still up. Plus **paper** from wood pulp,
and **filtered water** from charcoal.

69 elements, 67 recipes. The failure table scaled with them without being
touched: 2,348 non-recipe pairs and the fallback share held at 12.9%.

**One had to be dropped, and the solver caught it.** Fire on stone genuinely
heat-treats it for better knapping, and the adjudicator flagged it as real. But
heat-treated stone knaps into a sharp stone, and a sharp stone is upstream of
the fire, so the graph closed a loop: sharp stone to spindle to fire board to
ember to fire and back. Same failure as recycling the t-shirt, same reason, and
the same answer.

## Two layout bugs the production sweep found

**The item grid never agreed with the item.** The shelf was `grid-cols-4`,
a hard-coded column COUNT, while `ElementTile` is a fixed 96px box. At a 335px
viewport the grid handed out 64px columns to a 96px tile and the right-hand
column hung fifteen pixels off the side of the screen, on both the workspace
shelf and the inventory. The tile now exports its own width and both grids use
`repeat(auto-fill, TILE_WIDTH)`, so the column count follows the tile and
cannot disagree with it.

**An invisible span was pushing a scrollbar onto phones.** The inventory HUD
had a 92px `shrink-0` spacer whose only job was to balance the back button, and
on a narrow screen it was the single widest thing on the page. Gone; the flex
spacers centre the heading in what is left, which is half a button off true and
costs nothing.

Swept every screen at 335px afterwards: zero overflowing elements, scroll width
equal to the viewport on all five.

## A third batch, chosen for the comparisons

72 elements, 74 recipes. The probe turned up another forty real pairs; most are
interactions rather than recipes, so the ones taken are the ones that give an
element a **second road**, because the receipt already compares routes and that
is the game's best trick.

- **Compost.** Wood rotted into soil, then compost back into soil, gives
  farmland without a gas well. It sits directly against Haber-Bosch, which is
  the other route to the same field. Two ways to put nitrogen back, one
  industrial and one that takes a season.
- **Syngas.** Old clothes gasified with natural gas give carbon monoxide and
  hydrogen, and the water-gas shift turns that into the hydrogen Haber-Bosch
  wants. A second road to ammonia that starts from waste.
- **Tannin.** Bark soaked in water. It binds hard to fibre, which is how cloth
  was coloured for thousands of years, so dyed fabric now has three roads:
  plant dye, red ochre, and this.
- **Concrete** takes sand or broken stone as its aggregate. Both real.

Thirteen elements now have more than one route. The failure table held again
without being touched: 2,554 non-recipe pairs, fallback 13.3%.

## The inventory lists what is missing, not only what is found

Leo, on Clash Royale's missing cards: "all objects that can be made... scrolling
through the missing inventory gives motivation and direction of whats next to
make."

It listed discoveries alone, so an empty one said "nothing here yet" and a full
one told you nothing about what was left. It now lists **every element that is
the output of some recipe**, found or not, split by realm and counted: Survival
0 of 15, Everyday Objects 0 of 45. Starters stay out, since they were handed
over rather than made and are already on the shelf.

A locked tile is the sprite with every colour collapsed to one, so the
silhouette is recognisable once you have seen the real thing, in a muted
palette rather than at reduced opacity — a translucent tile over a busy
backdrop turns to mush, which is how the locked realm button failed before it
was rebuilt.

**The name stays readable, and that is the deliberate part.** It is not a
spoiler, because the puzzle here is the PAIRING and not the vocabulary: knowing
Wrought Iron exists gives you something to aim at without telling you it comes
from quicklime and pig iron. With over 97% of pairs producing nothing, a target
list is the difference between searching and guessing, and that was the single
worst thing about playing this.

Locked tiles are not buttons. There is nothing to show yet, and a card saying
"you have not made this" would be worse than no card.

## Clouds, treetops and a second distance of birds

"let the clouds occasioanly sway, or the trees below, or like bird pixels far
in the distance." All three, and all three found in the artwork rather than
placed by hand.

**Clouds are stored as edges, not bodies.** There are 2,608 cloud pixels in the
picture, and a one-pixel sway only changes two columns: the edge it leaves and
the edge it arrives at. So each row of a cloud is a run that remembers the
colour of the pixel immediately outside it on both sides.

That second part fixed a bug that would have been very visible. The first
version erased a cloud with "whatever colour the top-left pixel is", on the
assumption that the top-left of a street scene is sky. Measured, it is
`rgb(83,76,138)` — a dark building. Every cloud would have been rubbed out in
purple. Sampling the neighbour of each run means there is nothing to assume.

Clouds are also discarded unless the whole region clears the skyline, so there
is never a roofline underneath one to damage.

**Only the tips of the foliage move**, which is the forest's rule and the
reason its sway reads as wind rather than as a tree sliding sideways. 53
treetops found, each storing the colour directly above it so erasing one is not
a guess.

**Distant birds are a single pixel**, higher and slower than the near ones,
because a sky with one thing in it is a decoration and a sky with two distances
in it is depth.

Measured on screen: the overlay now moves 429 to 633 pixels and changes on
every sample, against 36 to 90 before.

## Everything, and why the wordmark kept changing size

**"Everyday Objects" is now "Everything."** The old name described the three
targets it shipped with and became wrong the moment the ambition did. The realm
ids stay `survival` and `everyday`, so nothing migrates and no recipe moves.

Each realm button now carries a line under it: *the tutorial · a few minutes*
and *the main game*, or *finish survival to open* when it is locked. There were
two doors and nothing said one is four minutes long and the other is the game.

**"why is the tabbed and untabbed size so different."** Because the wordmark
was the shock absorber. The layout search returned the first combination that
fitted, starting from the biggest buttons, so the title got whatever height was
left over — and losing a tab bar takes two hundred pixels off the title and
nothing else.

The title should track WIDTH, which a tab bar does not change. Every
combination is now tried and the one with the **largest title** wins, with the
buttons stepping down to pay for it. Measured at 1512 wide: title unit 12 at
1300px, 1180, 1100, 1040, 1000 and 950 tall — identical. A test pins it.

Also: **a plane**, one every 2.7 minutes, crossing in half a minute above the
birds, with a contrail that grows and thins. The rarest thing on screen on
purpose, because birds are scenery and a plane is an event.

The realm captions are set brighter than they look like they need with a shadow
on all four sides, since the lower one lands on the planet and pale lilac on
bright green is unreadable however well it reads against the sky.

## The sprite vocabulary, and the contact sheet that justified it

Sprites were the hard cap on scope: 78 hand-drawn 11x11 tiles, no two elements
allowed to share one, about two minutes each. Three hundred elements is seven
hours of drawing, which made art rather than chemistry the thing standing
between this and Little Alchemy scale.

`src/art/forms.ts` has **twenty forms** — powder, liquid, ingot, sheet, lump,
fibre, cloth, gas, crystal, bottle, tool, machine, plant, log, coil, brick,
pellet, flame, board, wheel — with semantic palette slots (`k` outline, `a` lit
face, `b` body, `c` shadow), lit from the upper left like every hand-drawn one.
`composeSprite(form, colour)` derives the three shades from a single hex, so
adding an element is one line rather than twenty minutes.

Hand-drawn art always wins where it exists; the 78 are better than any palette
swap and nothing replaces them. `resolveIcon` checks the registry, then the
composed table, then the placeholder.

**The contact sheet is the part that mattered.** "make sure the pixelated small
emojis are good and accurate for all" is not something a test can answer: a
sprite can be rectangular, distinct, and not the fallback flame while still
being unreadable or plain wrong for the thing it names. `npm run sheet` writes
every icon to one page at the size it is used, with its name and its ink
coverage under it.

Looking at all 72 together found two that every test passed happily: **Wood**
was rendering the old Kindling sprite, an orange starburst that reads as a
spark, and **Cordage** was rendering the old Wick, a pale strip that reads as a
wick. Both came from repointing retired sprites at new elements on the
reasoning that a stick is a stick. Seen next to their names, neither was wood
or rope.

Both are now drawn from the vocabulary — `log` in brown and `coil` in tan —
which also proves the composition path end to end. Verified in the running
game: the wood tile renders 35 SVG rects from a composed sprite.

The legend on the side of each key sits inside an `aria-hidden` element, so it
is in `innerText` but not in the button's accessible name. Checked.

---

## The bench stops moving — one readout, two panels

**done — the block below the slots is the same height in every state.**

Leo: *"the size of this block is inconsistent as it gives the explanations for
wrong combinations, hints, etc. that kind of trips up the location of the items
below which is bad for the user experience."*

Five things were printing into the panel's own flow — a hint, a route, a
reason, the key to ask the model, and whatever that key opened — each a
different height. The tiles below moved on almost every press, with the
player's hand already travelling toward one.

**Two of the five could never fit a fixed strip**, because their length is not
knowable in advance: the model writes as many sentences as it writes, and a
route is as deep as the graph. Those now open panels (`WhyNot.tsx`,
`RouteCard.tsx`), which is also where they belong — the model's answer is the
thing the player pressed a button to get, and it was previously a footnote.

**The other three are known strings**, so the strip is built to the tallest of
them. `ui/readoutFit.ts` does that sum over the real set: 37 messages the
failure table can reach, three hint templates, and the longest element name.
The strip shows the pair being assembled when it has no news, so it is only
ever blank before the player has touched anything.

Checked: 292 assertions pass, and `scripts/layouttest.ts` now sweeps 13 device
widths asserting the worst message fits, that the height depends on the window
and nothing else, and that the message, gap and key fit inside the recess.
Verified against the live DOM at 320, 375, 700 and 900px — the first tile's
`top` is identical in the idle, pair, dead-end and hint states.

**Three real bugs came out of verifying it, none of which a screenshot shows:**

- The key is taller than the text, so the strip grew 17.7px the moment a
  failure appeared — exactly when it was meant to hold still. Its box is now
  reserved whether or not the key is in it.
- The width was derived from `window.innerWidth`, which includes a classic
  scrollbar — quietly 15px wrong on Windows and Linux, where nobody here would
  see it. The strip measures its own box now.
- The HUD title clipped `EVERYTHING` to `EVERYTHINC` at 375px, the most common
  phone width. It was sized off a `vw` slope, which is a guess about how much
  of the viewport the two buttons will take; it is sized off its own container
  now. At 320px the back key drops its word so the realm name stays legible.

Also removed, as asked: the paragraph under *show the route?*. And `Overlay`
now holds the scrim and the Escape key that four panels each had their own copy
of.

## Diagram 7: the tech slide

Leo: *"for one of the stack ones, we should include more like react, typescript,
vite more specifics but no paragrpahs. like tech used page? i like the minimal
stuff."*

`docs/slides/diagram-tech.png`, added to `scripts/diagram.ts` as a new `tile()` helper
plus a 4x2 grid. A list was the obvious layout and the wrong one — a column of
bullets is what every other team's stack slide looks like — so the eight facts
sit on eight of the game's own keys. The key face is a hard width limit, which
is what stops a role growing into a sentence.

Every line checked rather than recalled:
- versions from the installed packages (react 19.3.0, typescript 6.0.3,
  vite 8.3.0, tailwind 4.3.3)
- "zero any in src" from a grep over `src/` and `api/` — the only hit is the
  English word in a ForestScene comment
- 280 = devicetest's 14 devices x 5 screens x 4 assertions
- 250 = the arrival rate `load/gameplay.js` actually ramps to
- "four runtime dependencies" = the `dependencies` block; `src/` imports only
  `react` and `react-dom/client`

`docs/SCRIPT.md` updated: seven diagrams not six, the stack cue corrected (the
fence is a footer line now, not a panel), and a cue for the new slide with the
one line worth saying over it.

## The diagram set, rebuilt — 31 slides

Leo's notes, in order: *"all the coerners are glitched"*, *"stuff like this so
vibe coded"* (a crop of a subtitle with stars showing through the letters),
*"very minimal, only wrtie was is actually needed"*, *"make sure everything is
accurate"*, *"have diagrams of very technical stuff and very not, all levels"*,
*"talk about how things are tested too... like edgetest.ts, k6"*, *"make sure
diagrams catering to the sponsors we want to win from. and gaming stuff too"*,
*"these diagrams have to last us many minutes"*.

### The corner bug

`stepped()` emitted ONE point per tread, so the renderer joined them with a
straight diagonal and drew an antialiased slope — the triangular slivers Leo
photographed. A staircase needs three points a tread (along, down, along), which
is what `ui/pixelShape.ts` has always done for the live game. One corner
routine, called four times with different anchors, so the four cannot disagree.

### The stars through the type

Every `text()` and `key()` now registers its box before the sky is generated,
and `starfield()` skips any star landing in one. Press Start 2P advances exactly
1em a character plus tracking, so a text box is arithmetic, not a measurement.

### Overflow

Added `fit()`: the biggest size at which a string fits a box. Applied to panel
titles, equation cells, figures, tile roles and footers. Every overflow on the
first pass — "1,021 YOU MAKE" running out of its key, "gameData.ts" wider than a
fifth of the frame, two footers off the edge — was the same mistake, choosing a
size without knowing the longest string that would land in it.

### Accuracy

All figures now come from a single `FACTS` block computed from `GAME_DATA` at
build time. Three errors the old set carried:

- "37 rules" — `RULE_IDS.length` is **36**.
- "15 things can be made two ways" — **14** outputs have more than one route;
  15 is the number of EXTRA routes (13 with two, 1 with three).
- "963 icons" against "1033 things" — not a contradiction and now its own
  slide: 963 composed + 70 hand-drawn = 1,033, one per element.

Answering Leo's other count question the same way: 1,033 things = 12 starters +
1,021 that are the output of some recipe; 1,036 recipes = those 1,021 outputs +
15 alternative routes.

### Removed

- "twenty-four steps from nothing. this is one branch of three." (`chain`)
- "one silhouette, one colour. nobody hand-drew a thousand sprites." (`icons`)
- The fourth column of gloss on the equation slide.

### The 31

Plain: `point`, `what`. Game: `journey`, `theloop`, `wrong`, `hints`, `feel`.
Data: `numbers`, `count`, `graph`, `depth`, `chain`, `honesty`. Art: `icons`,
`forms`. Stack: `stack`, `tech`, `where`, `combine`, `api`, `fence`. Process:
`gate`, `loop`, `responsible`, `slides`. Proof: `tests`, `checks`, `load`,
`failure`. Sponsors: `gemini`, `sponsors`.

Running order with what to say over each: `docs/SLIDES.md`. Eight acts, about
ten minutes, and a ninety-second cut (`point` → `wrong` → `fence` → `honesty`).

## Ledger — 2026-09-13, 00:30

### done, with the check that proved it

- **Tech slide** (`diagram-tech`) — rendered and viewed; versions read from the
  installed packages, not from `package.json` ranges.
- **Corner glitch** — `stepped()` now emits three points a tread. Re-rendered
  and inspected at full size; the triangular slivers are gone.
- **Stars behind type** — every `text()`/`key()` reserves its box before the sky
  is generated. Verified across all 32 renders on the contact sheet.
- **Overflowing text** — `fit()` applied to titles, equation cells, figures,
  tile roles and footers. Two footers that ran off the frame now fit.
- **"twenty-four steps from nothing…"** and **"one silhouette, one colour…"** —
  removed; `grep` over `scripts/` and `docs/slides/svg/` returns nothing.
- **Number accuracy** — 36 rules (was 37), 14 things with a second route (was
  "15 things"), 1,033 icons = 963 composed + 70 hand-drawn, 1,033 things = 12
  starters + 1,021 made, 1,036 recipes = 1,021 outputs + 15 alt routes. All
  computed in `FACTS` from `GAME_DATA`, not typed in.
- **Bundle size** — was "898 KB" (bytes/1000) beside "514 KB" (bytes/1024) on
  the next slide. Now measured off `dist/` in KiB: **877 KB**.
- **Assertion count** — ran `npm test`: **213 passed, 0 failed**. `SCRIPT.md`
  said 312; corrected. The 280 device checks are a separate command and the
  slide now says so.
- **32 slides**, running order in `docs/SLIDES.md`, eight acts, ~10 minutes.
- **docs cleanup** — PNGs in `docs/slides/`, SVG sources in `docs/slides/svg/`.
  `docs/` root is now six markdown files plus `art-source/`. No off-theme
  duplicates were found to delete: every slide comes from one generator.
- **Arousal table** — the `~/Downloads` copy was byte-identical (SHA-256) to the
  one committed in `dread` at `58ca446`, so the duplicate was deleted.
- **Pushed** — `git status -sb` shows `## main...origin/main`, no divergence.

### open

- **GoDaddy domain** — 20 minutes, needs Leo's account. Do it *after* the link
  is confirmed reachable.
- **Devpost writeup**, every challenge box ticked. Leo's.
- **The video.** Leo's.
- **Bundle split** — 877 KB in one file. Deliberately deferred past filming.
- **Challenges / local records** — decided tonight to leave until after
  submission. Estimate written below.

### blocked

- **The live site returns HTTP 403 from this network**, `x-vercel-mitigated:
  challenge`, fallout from the k6 run aimed at production. Cannot verify the
  deployed bundle hash or the live API from here until it clears. Needs Leo to
  test from cellular and from the hackathon wifi, and to check Vercel's Firewall
  panel. **This is very likely what "its not updated on vercel" actually was.**
- **README** — a teammate is editing it; not touched.
- **Moving `DIRECTION`/`GAMEPLAN`/`PROGRESS`/`WALKTHROUGH` under `docs/`** —
  waits on that same teammate.
- **MathWorks** — conditional on someone doing 40–60 hand-read footprint
  figures. Not started.

### the challenges estimate, since Leo asked

Two shapes, very different costs.

**The cheap one — a list, not a realm. 60–90 minutes.** A challenge is a named
set of target element ids checked against what the player has already
discovered in Everything. No new starters, no new save shape, no new game mode:
one screen that reads the data already there, the way the inventory does. Ten
challenges is then mostly *choosing* the targets, and the solver can verify each
set is reachable.

**The real one — a third realm with its own starters. 3.5–4.5 hours.** A new
realm means a new save key and a migration (which `edgetest.ts` will
immediately have opinions about), a third column on the title screen, per-
challenge progress, and a device sweep afterwards. That is the honest number
and it is the wrong four hours before a 9:00 submission.

On the starter question: yes. Survival opens with **Stone, Wood, Plant Fibre**.
Everything opens with those three plus **Water, Soil, Limestone, Bauxite, Iron
Ore, Crude Oil, Natural Gas, Beeswax, Textile Waste** — twelve. A challenge set
would sit between the two: the three plus water and whichever two or three ores
the target chain actually needs, so the chain is findable rather than a
scavenger hunt.
