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
  regression: 312 assertions and a sweep of 14 screen sizes catch what looking
  cannot.

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
