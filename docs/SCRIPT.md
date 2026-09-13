# What to say: the technical and outcome sections

> The shot list is in `DEMO.md` — this is the argument that goes over it. Leo:
> *"i think we need to explain why we did things, tradeoffs, design choices."*
> Every number below is current and checkable.

## The numbers, so nothing is approximate

- **1,033 elements, 1,036 recipes, 557 distinct real processes**
- **534,061 possible pairs. 0.194% of them do anything** — you are wrong 99.8%
  of the time
- **1,036 of 1,036 recipes carry a citation**, and 1,024 of 1,024 URLs answer
  and match their page title
- 312 assertions, 280 device checks, 48,154 requests at 401/s with zero failures
- bundle 898KB, 228KB gzipped

---

## The elevator pitch, spoken

Roughly 35 seconds. Leo's voice, live register: chained sentences, softeners
left in, no punchline at the end.

> So we asked four people to draw how something they own is made, like a t-shirt
> or a glass bottle, and none of them could get past the first step, and
> honestly I couldn't either. So we made a game out of it, called From Scratch.
> You start with twelve things, stone, water, iron ore, that kind of thing, and
> you put two together and see what comes out, and there are around a thousand
> things you can make, and every one of them is a process that happens in the
> world with a source behind it. The part I like most is that you're wrong about
> 99.8% of the time, and every time you're wrong it tells you why, so being
> wrong is kind of the point. It all runs in your browser, so there's no account
> and nothing to install, you just open the link.

Fifteen-second cut, if someone is walking:

> It's a game about how the things around you are made. You start with twelve
> things and put two together, and there are about a thousand you can find, and
> every one of them is real and sourced. You're wrong 99.8% of the time and it
> tells you why every time.

One sentence, if that is all there is room for:

> It's Little Alchemy, except everything in it is real and sourced.

Two alternatives, same length:

> A game about how the things around you are made, where every recipe is real.

> Twelve raw materials, a thousand everyday things, and every step has a source.

## The one-minute technical, four slides

`stack` then `play` then `gemini` then `tally`.

**TIMED AT LEO'S REAL PACE.** The 265-word version ran 1:30 with him speaking
fast, which puts him near 175 words a minute rather than the 220 I assumed. A
152-word cut after that was too clipped to sound like anyone talking. This one
is about 195 words in full sentences, so roughly 65 seconds. If it needs to be
shorter, drop the developer-tools sentence on slide 3 first.

**1. THE STACK**

> So the whole game runs in the browser. React for the interface, TypeScript
> throughout, Tailwind for the styling, and the entire recipe graph is bundled
> into the page as one import, so once it loads you can play the whole thing
> offline. The only backend is two small functions on Vercel, and they are there
> to hold the Gemini key so it never has to sit in the browser.

**2. HOW IT PLAYS**

> Every press works like this. You put two things together, and if that pair is
> a real process, you get the item and a card showing you what went into making
> it. If it is not, one of 36 rules answers locally in under a millisecond and
> tells you why those two do not react. And the percentages you see there are
> the size of the search space, not your hit rate.

*Never say "you are wrong 99.8% of the time" as a hit rate.* Leo: *"the percent
is bad, because it takes skill to figure out."* Stated as a hit rate it makes
the game sound like dice; stated as the search space it makes finding a chain an
achievement.

**3. FOUR USES OF GEMINI**

> We use Gemini in four ways, and only two of them run while you are playing.
> Learn more is the second one, and instead of a chat box it is three fixed
> questions, so a player can never send it free text. The other two are
> developer tools we ran while building the data. But the recipe list never goes
> to any of them, so Gemini can tell you why two things do not react, and every
> item you make still comes from the game itself.

**4. NUMBERS**

> And then the numbers. There are 2,074 citations behind it and zero unsourced
> recipes, so nothing in this game is invented.

### Held back on purpose, for questions

All true, all cut, and all better as answers than as script.

- **"Does it scale?"** We load tested it to 250 new players a second. It is one
  static bundle on a CDN and two stateless functions, and there are no accounts
  and no database, so a player's progress sits in their own browser. This is the
  only scaling claim here that was measured; do not spend it unprompted.
- **"What else does the model do?"** Two developer tools, a probe that finds
  gaps in the graph and a proposer that drafts recipe chains, and we approve or
  reject every one of those by hand.
- **"How do you know the sources are real?"** Every URL is fetched on every
  build and its page title is checked against the label it is shown under.
- **"What did you use to build it?"** Vite builds it, Oxlint checks it, and
  Playwright and k6 are how we test it.

## Outcome and conclusion — two slides

`close`, then `thanks`. About 45 seconds.

**`close` — WHY WE MADE IT**

> We asked four people to draw how something they own is made and none of them
> could, and honestly I couldn't either, so that is the whole reason this
> exists. It's free and there is no account, so a school can just use it, and
> every claim in it is cited, so a teacher can check it rather than take our
> word for it. And we learned as much as anyone building it, because every
> combination had to be checked against a source before it shipped, and I did
> not know that soap comes back to salt and water until we opened the page and
> read it. It's a simplification, I know that, a real t-shirt is a lot more than
> twenty-four steps, but I think it is the first time a lot of people will ever
> ask the question at all.

**`thanks` — THANK YOU**

> Thank you. That's From Scratch, the link is up there, and you can play it on
> your phone right now.

### Do we introduce ourselves?

**Faces and names on the last card, nothing spoken.** No class year, no major,
no "we are sophomore CS students". Judges do not score seniority and saying it
invites the discount, "good, for sophomores" — and it breaks the rule Leo holds
everywhere else, which is that you do the work and do not narrate who you are
while doing it. The card does that job without spending a second of speaking
time on it.

## 1. Why this exists at all — 20 seconds

Follows straight out of the intro, where four people try to draw how something
they own is made and cannot.

**Nobody knows how anything is made, and it is not because the information is
hidden.** It is all published. The problem is that there is no reason to ever
go and look. School does not teach it, and the internet only answers a question
you already had.

So the gap is not information, it is **motivation**. That is what a game is for.

## 2. Why a game, and not an article — 20 seconds

**The failure case is the teaching.** Under one fifth of one percent of pairs
do anything, so a player is wrong 99.8% of the time — and every wrong answer
gets a real reason for why those two materials do not interact.

That is backwards from a reference work, where you look up what you already
wanted to know. Here you are told something true at the exact moment you were
curious, which is the only moment it sticks.

## 3. Why it is frontend-heavy — 30 seconds, and this is the tradeoff question

Start with what actually has to persist: **one player's list of discoveries.**
No multiplayer, no leaderboard, nothing shared. So:

- `localStorage` is the correct store. It beats a round trip on every axis —
  instant, works offline, and cannot leak because it never leaves the machine.
- No accounts means **no personal data at all**: no auth, no password reset, no
  breach surface, no consent banner. A judge opens a link and plays.
- The one thing that genuinely needs a server is the **API key**, which must
  never reach a browser. That is precisely and only what the two functions do.
- And it scales because there is no shared state. **48,154 requests, 401 a
  second, zero failures** — every player is independent of every other.

**The honest tradeoffs, said out loud:**

1. **Your save lives in one browser.** Clear your data and it is gone, and you
   cannot continue on your phone. That is the price of no accounts, and it is
   the right price here because there is no social layer to lose.
2. **The whole graph ships in the bundle** — 498KB of 898KB. Fine today, 228KB
   gzipped; it gets worse as the graph grows. We measured it and chose not to
   fix it yet, because the fix trades an instant start for a two-phase load.

Naming a tradeoff you have measured and declined is stronger than not having
one.

## 4. Why AI — 40 seconds, and the two uses are different

Most projects conflate these. Keep them apart.

**At runtime, it handles the long tail.** A thousand recipes can carry
hand-written explanations. **Half a million failing pairs cannot.** The model
answers "why not" on request, for the pair in front of you.

**In authoring, it proposes.** It drafts candidate chains; a human verifies
every one. A third of the recipes in the game started as something it suggested.

**And then the part that matters.** The claim is that nothing here is invented.
A language model is a machine for producing plausible text, which is the
opposite property. So it is not trusted, it is **fenced**:

- the endpoints have **never seen the recipe graph** and cannot import it —
  they are bundled separately
- **no model output is ever a number.** Footprints come only from sources a
  human read
- no player-typed text reaches a model at all. The "learn more" wire carries
  the string `how`, `why` or `where`
- and every citation is fetched at build time and checked against its page
  title. That gate has rejected real fabrications: 404s, redirects, pairs
  already taken

**Show it rather than say it.** Devtools, press "why?", the request carries two
names and 1,761 bytes against a 514KB graph. There is also a test that reads
the outgoing bytes and fails if a single element id appears in them.

**And say what we did NOT build: a chat box.** A free text field wired to a
model is a machine for confident guesses about the two things it must never
guess — what combines with what, and what anything costs. Every other team has
one; almost none can say what theirs is not allowed to do.

## 5. Design choices worth 10 seconds each

- **Two inputs, not three.** Three would be richer and unplayable: 534,061
  pairs against **183 million** triples.
- **Failure is the main loop, so it has to be free.** A 37-rule local table
  answers in under a millisecond with no network. The model sits behind a
  button, so the wait only ever happens to somebody who asked for it.
- **Icons are composed** — 65 shared shapes plus one colour — because nobody
  hand-draws a thousand sprites. The tradeoff is that two things sharing a
  shape rely on colour, so a minimum separation is enforced by the test suite.
- **Everything is measured, not eyeballed.** At this size you cannot see a
  regression: 213 assertions on `npm test`, plus a 280-check sweep of 14 screen sizes, catch what looking
  cannot.

## 6. Design — 40 seconds, and every beat has a picture

> Thirty-two diagrams live in `docs/slides/`, with the full running order and
> what to say over each in `docs/SLIDES.md`. The seven named below are the ones
> this section needs; the rest are for the questions afterwards. All of them are
> generated by `npm run diagram` from the real data, in the game's own
> vocabulary: same stepped corners, same hard bands, same palette, same font, no
> blur and no gradient. The icons in them are the actual sprites, not an
> artist's impression.



**ON SCREEN: `diagram-stack.png`** — as you say why it is frontend-heavy.
Three keys: the browser, the two functions, Gemini. The fence is the green line
along the bottom — *"the model has never seen the recipe list. It cannot: they
are bundled separately."*

**ON SCREEN: `diagram-tech.png`** — the answer to *"what did you use?"*, and the
slide to leave up while a judge reads it. Eight keys, no paragraph: React 19,
TypeScript 6, Vite 8, Tailwind 4 on the top row; Vercel, Gemini Flash,
Playwright, k6 on the bottom. Don't read it out. Say the one line it is really
making: *"four runtime dependencies. The only packages the app imports at
runtime are react and react-dom — everything you are looking at is hand-built,
including the sprites, the layout arithmetic and the star field."* If they want
a second sentence: *"Playwright sweeps fourteen device sizes across five
screens, 280 assertions; k6 ramps to 250 new players a second."*

**ON SCREEN: `diagram-combine.png`** — as you explain the failing case.
The recipe index, the 37-rule table, the model. Say: *"over 99% of presses
never touch the network. The rule table answers in under a millisecond. The
model is behind a button, so the wait only ever reaches somebody who asked for
it."* This is the design decision a judge will remember, because it is a
decision and not a feature.

**ON SCREEN: `diagram-gate.png`** — as you explain how a recipe gets in.
Propose, gate, a human reads it, it ships. Say what the gate has actually
caught: 404s, redirects, pairs already taken.

**ON SCREEN: `diagram-chain.png`** — as you explain the scale of one object.
Soil to t-shirt, eight icons, seven real processes. Say: *"twenty-four steps
from the opening board, and this is one of its three branches. The cotton gin
needs steel, which needs charcoal, which needs fire — made by spinning wood on
wood."*

**ON SCREEN: `diagram-icons.png`** — if anyone asks who drew the art.
Sixty-five silhouettes carry 963 icons, and the trade-off is stated on the
card: two things sharing a shape are told apart by colour, so the test suite
enforces a minimum distance.

**ON SCREEN: `diagram-numbers.png`** — the card to hold on while you move into
the outcome.

---

## 6. Outcome and impact — 30 seconds

**What exists:** 1,033 things, every one real, every one cited. 557 industrial
processes — retting, calcining, knapping, cupellation — most of which nobody
watching has heard of.

**What it does to a person:** you leave knowing verbs. Not "a t-shirt comes
from cotton", but that bark becomes rope by retting and limestone becomes
quicklime by calcining. Those are facts about the world.

**The honest limit, and say it before a judge does:** two things making a third
is not how a factory works. It is a simplification, on purpose, because the
alternative is a textbook nobody opens. The depth is in the citation on every
card and the model behind every failure — that is exactly why both exist.

**Who it is for:** not a chemistry student. Somebody who has never once
wondered how their t-shirt happened, and now has.

**ON SCREEN:** the game itself, at 1,021 made, scrolling the finished grid.

---

## 7. Conclusion — 20 seconds

Come back to the four people from the intro who could not draw how their own
possessions are made.

**They still could not.** That is not a failure of theirs, it is the point:
none of us are ever given a reason to find out. What this does is supply the
reason, and then be **worth trusting when you follow it** — a citation on every
one of a thousand cards, a model that is fenced so it cannot invent the answer,
and a build that fails if either of those stops being true.

**The last line should be the honest one, not the grand one.** Something close
to: *"It is a simplification. It is also the first time most people will ever
ask the question."*

**ON SCREEN:** the title screen, or a slow scroll down the finished inventory.

---

## The two sentences to have memorised

- **"A player is wrong 99.8% of the time, and every wrong answer teaches
  something. That is the design."**
- **"The model never sees the recipe list — it cannot, they are bundled
  separately. Open devtools and watch: two names, 1,761 bytes, against a 514KB
  graph."**
