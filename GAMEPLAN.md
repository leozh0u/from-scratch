# The game plan — realms, chains, and what finishes when

> `CLAUDE.md` is what the project is. `ARCHITECTURE.md` is how the logic scales.
> `DESIGN.md` is how it looks. **This file is the content**: which realms exist,
> what is in them, where one ends and the next begins, and what ships before
> 9 AM Sunday.

---

## 1. What is wrong with the game as it stands

Not opinion — this is measured, and `WALKTHROUGH.md` shows it.

**Nineteen starting elements, and fourteen of them are used exactly once.**
A starter is supposed to be an ingredient you keep coming back to. Little
Alchemy has four, and earth turns up in a hundred recipes — that reuse *is* the
game. Ours are single-use parts handed out with the recipe already attached.

**Five of the twenty-six recipes are a thing combined with itself.** Cotton
fibre + cotton fibre, crude oil + crude oil. That is the move you reach for when
you have not got a second ingredient to name.

**The starters are not primitive.** A cotton gin is a *machine* — more complex
than almost anything you build with it. High-carbon steel is a manufactured
alloy handed over as though it were a rock. Crude oil and natural gas are
starting materials in the **survival** realm, where a person has their hands and
a forest.

**And there is a real logic bug hiding in that.** Today you strike flint on
high-carbon steel to make the spark that makes fire. You cannot smelt steel
without fire. The game hands you a thing that requires the goal in order to
reach the goal. No judge will catch it in a three-minute demo, and it is exactly
what this project claims not to do.

So the fix is not "fewer starters". It is **start lower and earn more**.

---

## 2. The shape: two realms, and they are a timeline

| | **Survival** | **Industry** |
| --- | --- | --- |
| You are | one person, empty-handed | a civilisation at scale |
| You have | what the ground gives you | mines, wells, farms, factories |
| The lesson | *how making anything works at all* | *what making things actually costs* |
| Footprint | zero, by rule | real, sourced litres and kilograms |
| Ends when | fire stops being luck and becomes a tool you carry | you hold the three ordinary objects and see the receipt |

Survival is prehistory. Industry is now. That is why Survival comes first — not
as gating, but because Industry's chains genuinely consume Survival's fire,
charcoal and steel.

### On the name

**"Items" is a menu word, not a place.** It names the UI, not the world, and it
sits badly next to "Survival", which names a *condition*.

- **"Advanced"** is a difficulty label. It implies Survival is "Basic", which
  makes the first realm sound like a warm-up rather than a story.
- **"Technology"** does not separate them. A bow drill is technology. A lighter
  is technology. The word is true of both realms, so it distinguishes neither.

**Recommendation: `Industry`.** One word, same grammatical weight as Survival,
and it is literally what the realm teaches — industrial chemistry and industrial
footprints. *Survival → Industry* reads as an arc.

Runner-up if you want something grander: **`Civilisation`**. Bigger feeling,
leaves room for a third realm later, slightly less honest about the content.

---

## 3. Survival, rebuilt

**Four primitives. Everything else is earned.**

> **Stone · Wood · Plant Fibre · Ore**

Three acts. Each one is a real thing people did, in the order they did it.

### Act I — fire from nothing

The whole act uses three of the four primitives and no metal at all, because
metal does not exist yet.

| Combine | Gives | Why it is real |
| --- | --- | --- |
| Stone + Stone | **Sharp Stone** | percussion knapping — conchoidal fracture |
| Plant Fibre + Plant Fibre | **Cordage** | reverse-wrap twisting |
| Wood + Sharp Stone | **Fire Board** | carved hearth with a notch |
| Wood + Cordage | **Bow** | the bow of a bow drill |
| Wood + Sharp Stone | **Spindle** | *(alternate output — see note)* |
| Bow + Spindle | **Bow Drill** | the assembled tool |
| Bow Drill + Fire Board | **Ember** | friction dust ignites at ~340 °C |
| Plant Fibre + Sharp Stone | **Tinder Bundle** | shredded dry fibre, a nest |
| Ember + Tinder Bundle | **Flame** | the ember is blown into flame |
| Flame + Wood | ⭐ **Fire** | the first target |

### Act II — fire makes metal

Now fire exists, it can be spent. This is the act that fixes the logic bug: steel
arrives **after** fire, which is the only order it can arrive in.

| Combine | Gives | Why it is real |
| --- | --- | --- |
| Fire + Wood | **Charcoal** | pyrolysis — wood heated without oxygen |
| Ore + Charcoal | **Iron** | bloomery smelting, carbon reduces the oxide |
| Iron + Charcoal | ⭐ **High-Carbon Steel** | carburising — carbon into the iron |

### Act III — fire you can carry

| Combine | Gives | Why it is real |
| --- | --- | --- |
| Stone + Sharp Stone | **Flint** | flint knapped out of chert-bearing rock |
| Flint + High-Carbon Steel | **Spark** | steel shavings ignite in air |
| Spark + Tinder Bundle | **Char Cloth / Ember** | the repeatable catch |
| Flint + Cordage | ⭐ **Flint & Steel** | the kit, wrapped and carried |

### When Survival ends

**When you can make fire on purpose, twice.** Act I is fire by luck and
sweat — a bow drill takes minutes and often fails. Act III is a kit in your
pocket that works every time. That is the whole arc of the realm in one
sentence, and it is the moment Industry becomes possible, because Industry needs
fire, charcoal and steel and you now have all three.

**Targets: Fire · High-Carbon Steel · Flint & Steel.**

**Size:** 4 starters, ~19 elements, ~17 recipes. Today it is 8 starters and 9
recipes. Reuse goes up sharply — Wood appears in six recipes, Plant Fibre in
four, Sharp Stone in three, Charcoal in two.

**Play time:** three to four minutes. It is the tutorial, and it has to stay
one.

> **Note on the two-outputs-from-one-pair problem.** `Wood + Sharp Stone`
> appears twice above, which the engine cannot do — a pair has one output. Fix
> by splitting: `Wood + Sharp Stone → Spindle`, and `Spindle + Sharp Stone →
> Fire Board`. Carving the board from an already-shaped stick is just as true
> and it removes the collision.

---

## 4. Industry, rebuilt

Industry may legitimately start from mined and pumped materials — that is what
industry *is*. But the same two rules apply: **no machine is a starter, and
nothing is used only once.**

### What stops being a starter

| Was a starter | Becomes | Why |
| --- | --- | --- |
| **Cotton Gin** | Steel + Wood → Cotton Gin | It is a machine. Building it is the point. |
| **Soda Ash** | Salt + Limestone → Soda Ash | The **Solvay process** — one of the most important industrial reactions there is, and we were skipping it. |
| **Dye** | Plant Fibre + Water → Dye | Natural dyeing, and it re-uses a Survival primitive. |
| **Textile Waste** | Cotton T-Shirt + Water → Textile Waste | Closes the loop. A footprint game that lets you **recycle your own finished shirt** back into the chain is the best single idea in this document. |

### Starters that stay

**Water · Air · Farmland · Bauxite · Salt · Limestone · Silica Sand · Crude Oil**

Eight, all genuinely extracted rather than manufactured. Plus **Fire**,
**Charcoal**, **Steel** and **Cordage** carried in from Survival.

### The chains

| Chain | Target | Teaches |
| --- | --- | --- |
| Cotton | ⭐ **Cotton T-Shirt** | 2,720 L of water in one shirt |
| Aluminium | ⭐ **Aluminium Can** | smelting is where the CO₂ goes |
| Glass | ⭐ **Glass Bottle** | 0.27 kg CO₂, charged to the melt |
| **Recycling loop** | Textile Waste → back to yarn | the same shirt for a fraction of the cost |

### The candle and the lighter move here

They are in Survival today and they do not belong there. A candle needs refined
paraffin; a lighter needs butane and a pressed steel case. Both are industrial
objects, and crude oil and natural gas — currently *survival starters*, which is
absurd — come with them.

| Combine | Gives |
| --- | --- |
| Crude Oil + Fire | Paraffin Wax |
| Cordage + Cordage | Wick |
| Paraffin Wax + Wick | Candle |
| Crude Oil + Air | Natural Gas → Butane |
| Butane + Steel | Lighter |

---

## 5. Stretch chains, if there is time

Ranked by *teaching value per recipe*, which is the only ranking that matters
here. Each needs a real source before it ships; none of them ship without one.

1. **Paper** — Wood + Water → Pulp → Paper. Everyone has held it, nobody knows
   it is 10 L of water a sheet.
2. **Concrete** — Limestone + Fire → Quicklime → Cement → Concrete. Cement is
   ~8% of global CO₂ and that number shocks people.
3. **PET Bottle** — Crude Oil → Ethylene → PET. Pairs directly against the glass
   bottle, so the receipt becomes a *comparison*.
4. **Bread** — Farmland + Water → Wheat → Flour → Bread. The gentlest chain in
   the game, good for a first-time player.
5. **Smartphone** — the biggest footprint story there is, and far too big to do
   honestly tonight.

---

## 6. What actually ships before 9 AM

Written as a commitment, not a wish.

| | Work | Status |
| --- | --- | --- |
| **Must** | Survival rebuilt to 4 primitives, sourced | in progress |
| **Must** | Rename Items → Industry everywhere | pending |
| **Must** | `UNLOCK_EVERYTHING` back to `false` | **open — cannot submit without this** |
| **Must** | City backdrop swapped for the night-neon art | blocked on the SVG |
| **Should** | Machines-not-starters: cotton gin, soda ash, dye | pending |
| **Should** | Textile-waste recycling loop | pending |
| **Should** | Candle + lighter moved into Industry | pending |
| **Could** | Paper chain | stretch |
| **Could** | Concrete chain | stretch |
| **Won't** | Smartphone, bread, PET | out of scope tonight, and said so on purpose |

Every element added needs a sprite, and sprites are the quiet cost — nineteen
new elements is nineteen new pieces of art. That is the real limit on how far
section 5 gets.
