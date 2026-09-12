# From Scratch — how the game has to be built to reach Little Alchemy scale

> Read `CLAUDE.md` for what the project is, `DESIGN.md` for how it should look,
> `PROGRESS.md` for what has happened. This file is the plan for the logic:
> the scope problem, and the specific architecture that solves it.

---

## 1. The number that decides the design

The goal is Little Alchemy scope. That means the element count goes up by an
order of magnitude, and the pair count goes up by **two**:

| Elements | Unordered pairs the game must answer for |
| --- | --- |
| 43 (today) | 903 |
| 150 | 11,325 |
| 300 | 45,150 |
| 580 | 168,490 |

Little Alchemy 2 ships roughly 720 elements and about 5,000 recipes. So
**under 2% of all possible pairs are valid.** Over 98% of the combinations a
player actually attempts produce nothing.

Read that again, because it inverts the usual priority: **the failure case is
not an edge case. It is the game.** A player spends the overwhelming majority
of their time being told "no", and in an educational game, *that* is where all
the teaching has to happen. Discovery is the reward; refusal is the lesson.

That single fact drives every decision below.

---

## 2. The scope/accuracy conflict, stated plainly

Two commitments are currently in direct tension:

- **"Every recipe is real and every number is sourced"** — the pitch, and the
  reason the project is more than a clone. Today: 43 elements, 26 recipes, each
  hand-verified against a citation.
- **Little Alchemy scope** — hundreds of elements.

Nobody can hand-verify several hundred recipes with primary sources before
Sunday 9 AM. Pretending otherwise produces the worst outcome available: a
project whose headline claim is rigour, containing invented facts a judge can
catch.

### The resolution: tiers, stated honestly in the UI

Do not dilute the claim. **Narrow it, and be visibly precise about what is
claimed where.**

| Tier | What it means | How it is guaranteed |
| --- | --- | --- |
| **Sourced** | A primary or named source is cited, a human checked that the source says what we claim, and the units are right. | The existing manual rubric. Unchanged. |
| **Referenced** | The transformation is real and the element links to a reference article that **provably exists**. No numeric claim is made. | Automated: fetch every URL, assert HTTP 200, assert the page title matches the claimed label. A script, and a test. |
| **(nothing else ships)** | — | The solver refuses to build a graph containing an element with no reference. |

This is stronger than the current position, not weaker, because "Referenced" is
**machine-verifiable at any scale** while "Sourced" is not. A judge asking "how
do you know the model didn't make this up?" gets: *the model never ships a
number, and every article it cites is fetched and checked in CI.*

Footprint numbers stay **Sourced-only**. An invented litre count is the one
mistake that would actually destroy the project. Zero remains the correct value
for an unknown — that rule already exists in `CLAUDE.md` and must survive
scaling.

---

## 3. The two-speed response — the core mechanic

Currently a failed combination calls Gemini and the player watches `Hmm…` for
**5 to 10 seconds**. Measured in production. At 43 elements that is annoying;
at 300 elements, where 98% of attempts fail, it makes the game unplayable.

A game must answer in under 100ms. An LLM cannot. So do both.

### Layer 1 — instant, local, deterministic, always right

Every element carries **properties**: physical state (solid / liquid / gas /
plasma / abstract), material class (mineral, metal, organic, textile, fuel,
reagent, tool, machine, product), and whether it is raw, processed, or
finished.

A small hand-written rule table turns any failing pair into an immediate,
honest, *categorical* answer:

- two finished products → "Finished things don't combine. Making needs a
  material and something that acts on it."
- two raw minerals, no energy present → "Two rocks sitting together do nothing.
  Something has to supply heat or a reagent."
- tool + tool → "A tool acts on a material. Two tools have nothing to act on."
- gas + gas without ignition → "Mixing gases isn't a reaction. Reactions need
  energy to start."

This is not a consolation prize for the LLM being slow. **It is better
pedagogy**, because it teaches the *grammar* of manufacturing — that making
things requires a material, a process, and energy — rather than 45,000
disconnected facts. A player learns the rule and starts predicting.

It is also instant, free, offline, deterministic, and testable. This is exactly
the approach Leo already took with the portfolio terminal: a curated knowledge
base with fuzzy matching that feels like an LLM, responds instantly, costs
nothing and never fails.

### Layer 2 — the LLM, on request only

Under the instant answer sits one affordance: **"why not?"**

Clicking it calls Gemini for *this specific pair*, and that is where the
specific, surprising, genuinely educational answer lives — including the best
case in the whole game, *"that's actually real, just not in here"*, which is
already implemented and already works.

Making it opt-in fixes everything at once: no latency on the main loop, the
Gemini bill scales with curiosity rather than with flailing, the existing
rate-limit and cache stay sufficient, and the moment a player asks *why* is the
moment they are actually ready to learn.

### Layer 3 — conversation

Once a player has asked "why not", let them keep going. A short threaded
follow-up, rendered as a Nintendo-era **text box** rather than a chat bubble —
one line at a time, character by character, advance on keypress. Same content,
completely different feel, and it stays inside the world instead of dropping a
ChatGPT panel into an NES game.

**Guardrail, non-negotiable:** the model still never sees the recipe list and
still cannot grant a discovery. That structural guarantee is the project's best
technical answer to a judging question and it must survive every feature added
here.

---

## 4. Getting to hundreds of elements

### The graph is authored offline, never at runtime

`scripts/propose.ts` already does this with Gemini. It needs to scale, and it
needs a verification stage that is automatic rather than purely manual:

1. **Propose** — Gemini drafts chains toward a named target, batched (already
   implemented, already batches to save credit).
2. **Structurally validate** — the existing solver already checks reference
   integrity and reachability. Extend it to reject: duplicate recipes, recipes
   whose inputs can never coexist, cycles, orphans, and any element without a
   reference URL.
3. **Verify references automatically** — fetch every cited URL, assert 200,
   assert the title matches. Cache the results so it is cheap to re-run.
4. **Human rubric** — unchanged, but now applied to *numbers and Sourced-tier
   claims only*, which is a small enough set to actually do.
5. **Hand-copy into `gameData.ts`** — the existing rule that the model never
   writes shipping data stays.

### Content shape at scale

Little Alchemy works because the graph is **wide and shallow near the start and
deep near the end**. Copy that: a large set of base elements, many cheap
early discoveries to establish momentum, and long chains only toward targets.
A graph that is uniformly deep feels like homework.

Realms become chapters rather than the whole game. Survival and Everyday
already share one graph — that cross-linking (Survival's paraffin waxing
Everyday's sewing thread) is the best structural idea in the project and should
be the norm, not the exception.

---

## 5. Art at scale

Several hundred hand-drawn sprites is not achievable before Sunday, and
generated art is vetoed (`DESIGN.md` §3).

**Build a sprite vocabulary instead.** A small set of hand-drawn *forms* —
powder pile, ingot, sheet, vial of liquid, gas wisp, raw lump, coil, tool
silhouette, finished-object silhouette — each authored once in the existing
text format, and each rendered in the palette of the material it depicts.
Hand-drawn shape, data-driven colour.

That gives full coverage, and it gives something better than coverage:
**consistency**. Every liquid looks like a liquid, every metal reads as metal,
and a player can see what kind of thing something is before reading its name —
which reinforces exactly the categorical grammar Layer 1 teaches.

Hand-draw bespoke sprites for the targets and the two or three dozen elements a
demo actually lands on. Everything else uses the vocabulary. Nothing is
generated; the *logic* is procedural, the *art* is hand-authored.

---

## 6. Where this lands the pitch

The one-sentence version worth aiming at:

> An educational crafting game at Little Alchemy scale where nothing is
> invented: recipes are real and traceable, the failures teach you why, and the
> model that explains them is structurally incapable of inventing one.

That is a Machine Learning/AI track submission (see `DESIGN.md` §5) that is
about **using an LLM responsibly at scale**, which is a far more interesting
claim than "we called an API".

---

## 7. Decisions still needed from Leo

1. **How big is "huge"?** 150 elements is achievable and safe. 300 is a stretch
   and starts to risk the accuracy claim. Pick the number before authoring
   starts, because it decides how much of the graph is generated.
2. **The zoom-out.** The "we see the whole Nintendo" idea — is that the cold
   open, the pause screen, or the ending? It is a strong, unique shot and it
   should be placed deliberately rather than appearing everywhere.
3. **Does Layer 1 ever show a wrong-but-instant answer?** The rule table is
   categorical, so it can be right about the category and miss a real reaction
   that does exist. Proposal: word Layer 1 so it is never falsified by Layer 2
   — "nothing happens *here*" rather than "this is impossible" — so
   "that's actually real" remains a delightful reveal rather than a
   contradiction.
