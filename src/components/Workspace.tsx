import { useRef, useState } from 'react'
import { adjudicate } from '../adjudicator/client'
import { explainFailure } from '../adjudicator/explain'
import { resolveIcon } from '../data/iconRegistry'
import type { ElementDef, RealmId, RecipeData, RecipeDef } from '../data/types'
import type { useGameState } from '../hooks/useGameState'
import { DiscoveryCard } from './DiscoveryCard'
import { PixelArt } from './PixelArt'
import { Receipt } from './Receipt'
import { TargetList } from './TargetList'
import { PixelButton } from './ui/PixelButton'
import { BackArrow } from './ui/BackArrow'
import { LearnMore } from './LearnMore'
import { StatPanel } from './ui/StatPanel'
import { HintButton } from './ui/HintButton'
import { GiveUpButton } from './ui/GiveUpButton'
import { ConfirmDialog } from './ui/ConfirmDialog'
import { pickHint, hintsEarned, pathToTarget, nextUnfoundTarget, MISSES_PER_HINT } from '../solver/hint'
import { modeById, type ModeId } from '../game/modes'
import { minWidthForSide, faceWidthFor } from './ui/legend'
import { Card } from './ui/Card'
import { ElementTile, TILE_WIDTH } from './ui/ElementTile'
import { ProgressBar } from './ui/ProgressBar'
import { HudBar, EmptySlot } from './ui/HudBar'
import { ForestScene } from './ForestScene'
import { CityScene } from './CityScene'
import { playPress, playDiscovery, playNoMatch } from '../audio/sfx'
import { useViewport } from '../hooks/useViewport'

type WorkspaceProps = {
  /** How much help the game gives. See game/modes.ts. */
  mode: ModeId
  realm: RealmId
  data: RecipeData
  game: ReturnType<typeof useGameState>
  onBack: () => void
  onOpenInventory: () => void
}

type Slots = [string | null, string | null]

/*
 * A genuine discovery gets the loud full-screen DiscoveryCard, not this inline
 * line — so this feedback type only ever needs the two quiet outcomes.
 * `no-match.explanation` starts undefined while the adjudicator is asked
 * (or the cache/rate-limit/offline fallback resolves), then fills in.
 */
type Feedback =
  | { kind: 'already-known'; name: string }
  | {
      kind: 'no-match'
      /** The instant, local answer. Always present — never a spinner. */
      reason: string
      /** The pair, kept so "why not" can ask about it after the fact. */
      pair: [string, string]
      names: [string, string]
      /** Filled in only once the player actually asks. */
      deeper?: string
      asking?: boolean
    }

type Discovery = { element: ElementDef; recipe: RecipeDef }

/*
 * The display names. The ids stay `survival` and `everyday`, so renaming the
 * realm costs nothing: no save migrates and no recipe moves.
 *
 * "Everyday Objects" described the three targets it shipped with and became
 * wrong the moment the ambition did. The realm is meant to hold everything a
 * person can point at, so it is called that.
 */
const REALM_LABEL: Record<RealmId, string> = {
  survival: 'Survival',
  everyday: 'Everything',
}

export function Workspace({ realm, data, game, mode, onBack, onOpenInventory }: WorkspaceProps) {
  const [slots, setSlots] = useState<Slots>([null, null])
  const { width: viewportWidth } = useViewport()
  /*
   * The HUD's two buttons plus the realm name have to share one strip. At a
   * 335px viewport the three of them wanted 383px and the title was clipped
   * off the right-hand end, so the buttons step down a unit on a narrow
   * screen rather than the bar silently eating its own contents.
   */
  const hudUnit = viewportWidth < 520 ? 2 : 3

  /*
   * THE BENCH GROWS WITH THE WINDOW.
   *
   * Leo, twice: "theres still so much empty space", "maybe make them bigger".
   * The slots were a fixed 64px and the key a fixed unit 5, so on a laptop
   * they sat in the middle of a 620px panel looking like a phone layout that
   * had been stretched. Three steps rather than a continuous scale, because a
   * sprite drawn at a fractional multiple stops being pixel art — the icon
   * scale has to stay a whole number, and so does the slot it sits in.
   */
  const benchStep = viewportWidth >= 900 ? 2 : viewportWidth >= 560 ? 1 : 0
  const slotSize = [64, 80, 96][benchStep]
  const slotScale = [3, 4, 5][benchStep]
  const combineUnit = [5, 6, 7][benchStep]

  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [discovery, setDiscovery] = useState<Discovery | null>(null)
  const [receiptElement, setReceiptElement] = useState<ElementDef | null>(null)
  // Bumped on every combine attempt so a slow adjudicator response can't
  // clobber the feedback from a newer attempt the player has already moved past.
  const attemptRef = useRef(0)

  // Membership across every realm's target list, not just the current one —
  // a discovery's own recipe can land it in a different realm than the one
  // being viewed (cross-realm carryover).
  const allTargetIds = new Set(Object.values(data.targets).flat())

  const elementById = (id: string) => data.elements.find((el) => el.id === id)!

  /*
   * WHAT THE PLAYER CAN SEE HERE — AND IT IS NOT EVERYTHING THEY OWN.
   *
   * This used to be `game.allDiscovered()`, every element from every realm, on
   * the grounds that the graph is shared and an element found in one realm has
   * to stay usable in another. That reasoning is right but it only runs one
   * way. Everyday genuinely needs Survival's output — its sewing thread is
   * waxed with Survival's paraffin, and its aluminium chain cokes crude oil
   * over Survival's fire. Survival needs nothing at all from Everyday.
   *
   * So the tutorial realm was opening with twenty-six tiles, ten of which were
   * bauxite, manganese, silica sand and soda ash from a realm the player has
   * not unlocked and cannot use here. The first thing anyone sees in this game
   * was a wall of irrelevant minerals.
   *
   * Survival shows only Survival. Everyday shows everything, because there it
   * is true.
   */
  const shown =
    realm === 'survival'
      ? game.allDiscovered().filter((id) => elementById(id)?.realm === 'survival')
      : game.allDiscovered()

  /*
   * THE SHELF CAN NEVER BE EMPTY.
   *
   * A save written by an older build can name elements this build has retired.
   * `elementById` returns undefined for those, the filter drops them, and the
   * player is left looking at a realm with nothing in it and no way to do
   * anything - which is exactly what happened after the rebuild from three
   * starters, to anyone who had played the previous version.
   *
   * `useGameState` prunes unknown ids on load, so this should never fire. It is
   * here anyway because the failure is total: not a wrong tile, an unplayable
   * game, and the cost of the guard is one comparison.
   */
  const inventory = shown.length > 0 ? shown : [...data.starters[realm]]

  /*
   * HOW MUCH OF THIS REALM IS MADE.
   *
   * Counted against everything CRAFTABLE, not everything that exists: the
   * starters were never made, so counting them would start the player at
   * nine of sixty-seven and make the first real discovery look like no
   * progress at all.
   */
  const craftableIds = data.recipes
    .map((r) => r.output)
    .filter((id) => {
      const el = elementById(id)
      return el && (realm === 'everyday' || el.realm === 'survival')
    })
  const realmTotal = new Set(craftableIds).size
  const realmFound = [...new Set(craftableIds)].filter((id) => game.isDiscovered(id)).length

  /*
   * A handful of what is still missing, for the Everything bar.
   *
   * Ordered by how close it is to being makeable — both inputs held first,
   * then one, then none — so the strip reads as "next" rather than as a
   * random sample of the far end of the graph. Capped at six: the whole list
   * is one press away in the inventory, and a bar that tries to be the
   * inventory is a worse inventory.
   */
  const MISSING_SHOWN = 6
  const missingAll = (() => {
    const held = new Set(inventory)
    const byOutput = new Map(data.recipes.map((r) => [r.output, r]))
    return [...new Set(craftableIds)]
      .filter((id) => !game.isDiscovered(id))
      .map((id) => {
        const recipe = byOutput.get(id)
        const ready = recipe ? recipe.inputs.filter((i) => held.has(i)).length : 0
        return { element: elementById(id), ready }
      })
      .sort((a, b) => b.ready - a.ready || a.element.name.localeCompare(b.element.name))
  })()
  /*
   * Recomputed every render from `game.isDiscovered`, which is what makes the
   * strip self-healing: find one of the six and it drops out on the next paint
   * and the seventh takes its place, with no bookkeeping and nothing to go
   * stale. That is worth stating because the obvious implementation — pick six
   * once and remember them — looks identical until the moment it matters.
   */
  const stillMissing = missingAll.slice(0, MISSING_SHOWN).map((entry) => entry.element)
  const missingBeyond = Math.max(0, missingAll.length - MISSING_SHOWN)

  /*
   * Hints: earned by playing, spent one at a time, and chosen by the SOLVER
   * rather than by the model. See solver/hint.ts — the one thing the runtime
   * model is never allowed to know is the recipe graph, and a hint is a claim
   * about exactly that.
   */
  const [hint, setHint] = useState<string | null>(null)
  /*
   * HINTS ESCALATE RATHER THAN BEING ALL OR NOTHING.
   *
   * A "give up" button that reveals the answer and wipes your progress was
   * considered and is the wrong shape for this game: there is no fail state
   * to give up FROM, and punishing somebody for asking for help by deleting
   * what they made is a strange thing to do. What a stuck player actually
   * wants is more help, not a reset.
   *
   * So the same key gives more each time it is pressed on the same board.
   * First press names one of the two and what kind of thing comes out; press
   * again without having touched anything and it names both, which is the
   * answer. Two hints for a solve, no reset, and the player chooses how much
   * they want to be told.
   */
  const [hintDepth, setHintDepth] = useState(0)

  /*
   * GIVE UP SHOWS THE ROUTE AND WIPES NOTHING.
   *
   * I argued against this and Leo asked again, so it is built — as the useful
   * half of what he described first, "show how to reach fire or something".
   * Being shown the answer is already the cost of asking for it; deleting
   * what somebody made on top of that is a punishment, and there is no fail
   * state in this game to send a player back from.
   *
   * The route is generated from the recipe graph rather than stored, so it
   * cannot go stale as the graph grows, and it lists only the steps still
   * missing rather than replaying what the player has already done.
   */
  const [givingUp, setGivingUp] = useState(false)
  const [revealed, setRevealed] = useState<string[] | null>(null)
  const giveUpTarget = nextUnfoundTarget(data, new Set(inventory), realm)

  function confirmGiveUp() {
    setGivingUp(false)
    if (!giveUpTarget) return
    const steps = pathToTarget(data, new Set(inventory), giveUpTarget)
    /*
     * An empty route means the target cannot be reached from here at all,
     * which should be impossible — `scripts/edgetest.ts` asserts every realm
     * is completable from its own starters — but showing an empty list would
     * read as the feature being broken rather than as an impossible position.
     */
    if (steps.length === 0) {
      setRevealed(['no route from here.'])
      return
    }
    setRevealed(
      steps.map(
        (step) =>
          `${elementById(step.inputs[0]).name.toLowerCase()} + ${elementById(step.inputs[1]).name.toLowerCase()} = ${elementById(step.output).name.toLowerCase()}`,
      ),
    )
  }
  /*
   * The mode changes only how much help is available, never the graph. Open
   * gives an unlimited budget rather than a large one, because a big number
   * that still counts down is a worse version of unlimited; purist removes
   * the key entirely rather than showing a dead one, since a control that
   * exists only to be refused is a nag.
   */
  const rules = modeById(mode)
  /*
   * One width for the hint and give-up keys. Taken from the widest legend
   * either of them can carry rather than picked, so a longer message widens
   * both instead of breaking the pair.
   */
  const helpWidth = Math.max(
    // What either key's side legend can ever need...
    minWidthForSide(3, 'unlimited'),
    minWidthForSide(3, 'find more'),
    // ...and what either key's own face needs, which for "give up" with a
    // flag beside it is the wider of the two.
    faceWidthFor(3, 'hint', 18),
    faceWidthFor(3, 'give up', 18),
  ) + 4
  const tries = game.attempts[realm] ?? 0
  // Guarded rather than formatted: 0/0 is NaN, and "NaN%" on the bench is a
  // worse first impression than a dash.
  const hitRate = tries === 0 ? '—' : `${Math.round((realmFound / tries) * 100)}%`
  /*
   * Dead ends remaining until the next hint is earned. Unlimited and none are
   * their own answers rather than a countdown to something that will not
   * arrive or has already arrived.
   */
  const deadEnds = (game.misses[realm] ?? []).length
  const nextHintIn = !rules.hints
    ? '—'
    : rules.infiniteHints
      ? '—'
      // Just the number. "10 fails" wrapped to two lines in its cell and the
      // label underneath already says what it counts.
      : String(MISSES_PER_HINT - (deadEnds % MISSES_PER_HINT))
  const earned =
    hintsEarned(realmFound, (game.misses[realm] ?? []).length) - (game.hintsSpent[realm] ?? 0)
  const hintsLeft = rules.infiniteHints ? Infinity : earned

  function useHint() {
    if (!rules.hints || hintsLeft <= 0) return
    playPress()
    const found = pickHint(data, new Set(inventory), realm, game.hintsSpent[realm] ?? 0)
    if (!found) {
      // Not charged for. Being told there is nothing to find is not a hint.
      setHint('nothing new is within reach from here. make something first.')
      return
    }
    if (!rules.infiniteHints) game.spendHint(realm)
    const names = found.recipe.inputs.map((id) => elementById(id).name.toLowerCase())
    if (hintDepth === 0) {
      setHintDepth(1)
      setHint(`${elementById(found.knownInput).name.toLowerCase()} goes with something you already have, and makes ${found.shape}.`)
    } else {
      setHint(`${names[0]} and ${names[1]}.`)
    }
  }

  const discoveredIds = new Set(inventory)
  const targets = data.targets[realm].map(elementById)
  const foundCount = targets.filter((t) => discoveredIds.has(t.id)).length
  // Guard divide-by-zero for a realm with no targets yet (Everyday, pre-step-15).
  const progress = targets.length === 0 ? 0 : (foundCount / targets.length) * 100


  /*
   * Picking from the inventory always fills the next empty slot — it never
   * toggles off an already-placed id. Some real recipes combine an element
   * with itself (cotton fiber + cotton fiber -> wick; crude oil + crude oil
   * -> paraffin), which a toggle-based "click again to remove" model makes
   * impossible: the second click would deselect slot A instead of filling
   * slot B. Clearing a slot is a separate action (clicking the slot itself).
   */
  function pickTile(id: string) {
    attemptRef.current++
    setFeedback(null)
    // A hint is about the board as it was when it was asked for. Picking a
    // tile is the player acting on it, so it has served its purpose — and the
    // escalation resets with it, or the next first press would jump straight
    // to the answer.
    setHint(null)
    setHintDepth(0)
    setSlots(([a, b]) => {
      if (a === null) return [id, b]
      if (b === null) return [a, id]
      // Both slots full and a third tile picked: start over with the new pick.
      return [id, null]
    })
  }

  function clearSlot(index: 0 | 1) {
    attemptRef.current++
    setFeedback(null)
    setSlots((prev) => {
      const next: Slots = [...prev]
      next[index] = null
      return next
    })
  }

  function handleCombine() {
    game.countAttempt(realm)
    const [a, b] = slots
    if (!a || !b) return

    const result = game.combine(a, b)
    setSlots([null, null])

    if (result.status === 'discovered') {
      const discoveredElement = elementById(result.recipe.output)
      // A target gets the full receipt (dependency tree, footprint, sources)
      // instead of the lighter discovery card — it's the "level complete"
      // moment, not just a new inventory tile.
      playDiscovery()
      if (allTargetIds.has(discoveredElement.id)) {
        setReceiptElement(discoveredElement)
      } else {
        setDiscovery({ element: discoveredElement, recipe: result.recipe })
      }
    } else if (result.status === 'already-known') {
      setFeedback({ kind: 'already-known', name: elementById(result.recipe.output).name })
    } else {
      /*
       * INSTANT FIRST, MODEL ONLY IF ASKED.
       *
       * This used to call Gemini on every failure and show "Hmm…" for the
       * five to ten seconds it took to answer. Over 98% of attempts fail, so
       * that was the game's most common interaction and it had a multi-second
       * stall in it.
       *
       * The local rule table answers now, in well under a millisecond, and the
       * model sits behind a "why not?" the player can press. That fixes the
       * stall, scales the Gemini bill with curiosity rather than with
       * flailing, and puts the model exactly where it is worth waiting for —
       * the moment somebody actually wants to know.
       */
      playNoMatch()
      ++attemptRef.current
      // Only distinct dead ends count toward a hint — see hintsEarned.
      game.countMiss(realm, a, b)
      const { message } = explainFailure(a, b)
      setFeedback({
        kind: 'no-match',
        reason: message,
        pair: [a, b],
        names: [elementById(a).name, elementById(b).name],
      })
    }
  }

  function askWhyNot() {
    if (!feedback || feedback.kind !== 'no-match' || feedback.deeper) return
    playPress()
    const attempt = ++attemptRef.current
    setFeedback({ ...feedback, asking: true })
    const [a, b] = feedback.pair
    const [nameA, nameB] = feedback.names
    void adjudicate(a, b, nameA, nameB, realm).then((deeper) => {
      // A newer attempt has already started — this response is stale.
      if (attemptRef.current !== attempt) return
      setFeedback((current) =>
        current && current.kind === 'no-match'
          ? { ...current, deeper, asking: false }
          : current,
      )
    })
  }

  return (
    <>
      {/* The room the game is played in. Fixed and behind everything, so the
       * UI scrolls over it rather than with it. */}
      {realm === 'survival' ? <ForestScene /> : <CityScene />}
      <main className="relative z-[1] mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-5 py-8">
      {/*
       * A solid HUD strip, not floating text.
       *
       * The backdrop is now a bright sky, and white pixel type on pale blue is
       * unreadable no matter how hard the drop shadow works. Consoles solved
       * this the same way: the status line lives on its own opaque bar across
       * the top, separate from the world behind it. It also gives the screen a
       * top edge, which the floating version never had.
       */}
      {/*
       * THE TITLE MUST NOT WRAP, AND IT IS NOT ALLOWED TO SHRINK THE SIDES.
       *
       * "Everyday Objects" is sixteen characters of a monospaced pixel font,
       * and at 13px that is 208px of unbreakable width. In a `justify-between`
       * row with no constraints it wrapped to two lines and overlapped "←
       * realms" — a status bar is one line by definition, and a two-line one
       * reads as a layout fault rather than a long title.
       *
       * The flex-1 spacers either side of the title keep it optically centred
       * whatever the two buttons weigh, and `nowrap` forbids the wrap outright.
       *
       * Both actions are real PixelButtons rather than bare text. They were
       * 11px labels with no box around them, which read as tiny next to the
       * slabs everything else in the game is built from, and gave a tap target
       * the height of the type. A small unit keeps them inside the strip.
       */}
      <HudBar className="flex items-center gap-3">
        <PixelButton tone="default" unit={hudUnit} onClick={onBack}>
          <BackArrow unit={hudUnit} />
          realms
        </PixelButton>
        <span className="flex-1" aria-hidden="true" />
        <h1
          /*
           * The title yields, the buttons never do.
           *
           * All three were `shrink-0`, so when the row wanted more width than
           * the bar had, the overflow came off the right-hand end and it was
           * the INVENTORY button that got cut in half. A clipped label is
           * untidy; a clipped control is broken, and on a phone it is the only
           * way into the inventory.
           */
          className="min-w-0 overflow-hidden whitespace-nowrap uppercase text-white"
          style={{
            fontFamily: 'var(--font-display)',
            /*
             * Scales with the window instead of sitting at one size.
             *
             * It is the name of where you are and it was set smaller than the
             * two buttons either side of it, which is backwards. The ceiling
             * is what it looks like on a laptop; the floor is what keeps
             * "everyday objects" - sixteen characters of a monospaced pixel
             * font, and unbreakable - from colliding with the buttons on a
             * narrow window. 1.9vw is the widest slope that still clears them
             * at 440px, measured rather than guessed.
             */
            fontSize: 'clamp(8px, 1.9vw, 22px)',
            letterSpacing: '0.04em',
          }}
        >
          {REALM_LABEL[realm]}
        </h1>
        <span className="flex-1" aria-hidden="true" />
        <PixelButton tone="default" unit={hudUnit} onClick={onOpenInventory}>
          inventory
        </PixelButton>
      </HudBar>

      {/*
       * TWO REALMS, TWO KINDS OF GOAL.
       *
       * Survival keeps its three targets, because it is the tutorial and a
       * tutorial with an explicit finish line is the point of one: fire,
       * charcoal, lit torch, and you are done.
       *
       * Everything does not. Leo: "the point of everyting is not to get the
       * cotton t shrit, but to unlock every possible thing." Three named
       * targets out of seventy-three actively misrepresent that — a player
       * who makes all three is told they have finished a realm they have
       * barely started. So it shows how much is left and some of what is
       * left, which is the goal it actually has.
       */}
      {realm === 'survival' && targets.length > 0 && (
        <HudBar className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <ProgressBar value={progress} cells={targets.length} />
            <span className="shrink-0 font-display text-[11px] text-star-mid">
              {foundCount}/{targets.length}
            </span>
          </div>
          <TargetList targets={targets} discoveredIds={discoveredIds} />
        </HudBar>
      )}

      {realm === 'everyday' && (
        <HudBar className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <ProgressBar value={(realmFound / Math.max(1, realmTotal)) * 100} cells={12} />
            <span className="shrink-0 font-display text-[11px] whitespace-nowrap text-star-mid">
              {realmFound}/{realmTotal}
            </span>
          </div>
          {stillMissing.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-display text-[9px] tracking-widest text-muted uppercase">
                still missing
              </p>
              {/*
                * Silhouettes with their names, the same treatment the
                * inventory gives a locked element — and not a spoiler by this
                * game's own standard, because the puzzle here is the PAIRING
                * and not the vocabulary. Knowing that slag cement exists is
                * something to aim at; it does not tell you it comes from slag
                * and cement.
                */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {stillMissing.map((element) => (
                  <ElementTile
                    key={element.id}
                    icon={resolveIcon(element.icon)}
                    label={element.name}
                    locked
                    unit={3}
                  />
                ))}
                {missingBeyond > 0 && (
                  /*
                   * Six is a window onto a much longer list and the strip has
                   * to say so, or a player who makes those six believes they
                   * are nearly done. It is a button because the full list
                   * already exists one press away, and a count that cannot be
                   * opened is a tease.
                   */
                  <PixelButton
                    tone="default"
                    unit={3}
                    onClick={onOpenInventory}
                    aria-label={`${missingBeyond} more still missing. Open the inventory.`}
                  >
                    +{missingBeyond} more
                  </PixelButton>
                )}
              </div>
            </div>
          )}
        </HudBar>
      )}

      {/*
       * The key sits UNDER the two slots, not beside them, and the panel is
       * the same width as the two bars above it.
       *
       * A row was tried and it is wrong here: three panels stacked down the
       * page read as one object when their edges line up, and the moment one
       * of them hugs its contents it reads as a different kind of thing that
       * happens to be nearby. The stack also puts the key directly below what
       * it acts on, which is the whole sentence the bench is saying.
       *
       * What the row was actually fixing was the height, and the height was
       * the standing hint line and the blank row held open for it. Those are
       * gone, which is the part that needed to go.
       */}
      <Card className="flex flex-col items-center gap-4 p-6">
        {/*
         * ONE ROW OF THREE COLUMNS, NOT TWO ROWS.
         *
         * Leo: "im mainly referring to the top left and top right empty
         * space. no need to go further down than it was with just the
         * combine." Exactly right — the previous version put the slots on
         * their own row and the three columns underneath, so the corners
         * beside the slots stayed empty and the panel grew taller to hold
         * stats it could have held beside what was already there.
         *
         * The sides now run the full height of the middle column and centre
         * against it, so the panel is no taller than slots-plus-key ever were
         * and the corners are doing work.
         */}
        <div className="flex w-full flex-wrap items-center justify-center gap-3">
          <div className="flex min-w-0 flex-[1_1_140px] justify-center sm:justify-end">
            <StatPanel
              stats={[
                { label: 'made', value: `${realmFound}/${realmTotal}`, lead: true },
                { label: 'tries', value: String(game.attempts[realm] ?? 0) },
                { label: 'dead ends', value: String((game.misses[realm] ?? []).length) },
                /*
                 * A hit rate rather than another raw count. Over 97% of pairs
                 * in this game do nothing, so a player striking one in five is
                 * doing extremely well and has no way to know it — a bare
                 * "tries" number reads as a record of failure instead of a
                 * record of exploring.
                 */
                { label: 'hit rate', value: hitRate },
                {
                  label: 'hints',
                  value: !rules.hints ? 'none' : rules.infiniteHints ? '\u221e' : String(Math.max(0, earned)),
                },
                /*
                 * How many more dead ends earn the next one. Leo asked for it
                 * and it is the stat that changes behaviour: "four more" is a
                 * reason to keep trying things, where a bare count of failures
                 * is only a record of them.
                 */
                { label: 'fails to hint', value: nextHintIn },
              ]}
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              {slots.map((id, i) =>
                id ? (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      playPress()
                      clearSlot(i as 0 | 1)
                    }}
                    className="flex cursor-pointer items-center justify-center"
                    aria-label={`Remove ${elementById(id).name} from slot`}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      width: slotSize,
                      height: slotSize,
                    }}
                  >
                    <PixelArt sprite={resolveIcon(elementById(id).icon)} scale={slotScale} />
                  </button>
                ) : (
                  <EmptySlot key={i} unit={4} size={slotSize} />
                ),
              )}
            </div>

            <PixelButton
              tone="survival"
              unit={combineUnit}
              onClick={handleCombine}
              disabled={!slots[0] || !slots[1]}
            >
              combine
            </PixelButton>
          </div>

          {/*
            * Centred in its half, like the stats are in theirs, and the two
            * keys share one width. They were left-aligned and each sized by
            * its own label, so "hint" and "give up" made a ragged pair hanging
            * off the side of the panel while the stats sat as a tidy block on
            * the other. A pair of controls that do the same kind of job should
            * look like a pair.
            */}
          <div className="flex min-w-0 flex-[1_1_140px] flex-col items-center gap-2">
            {/*
              * A column of a fixed width with both keys filling it, rather
              * than two keys each given a computed minimum. The computation
              * was close — 129 against an intrinsic 132 — and close is a
              * ragged pair. Letting them stretch to one width is exact and
              * cannot drift when a label changes.
              */}
            <div
              className="flex flex-col gap-2"
              style={{ width: helpWidth, maxWidth: '100%' }}
            >
              {rules.hints && (
                <HintButton left={hintsLeft} onClick={useHint} disabled={hintsLeft <= 0} block />
              )}
              {rules.giveUp && (
                <GiveUpButton onClick={() => setGivingUp(true)} disabled={!giveUpTarget} block />
              )}
            </div>
            {!rules.hints && (
              <span
                className="font-display text-[9px] leading-[1.8] lowercase text-muted"
                style={{ maxWidth: 130 }}
              >
                purist. no hints, no routes.
              </span>
            )}
          </div>
        </div>

        {hint && (
          <p
            role="status"
            className="max-w-[34ch] text-center font-display text-[10px] leading-[2] lowercase text-brand"
          >
            {hint}
          </p>
        )}

        {revealed && (
          <div className="flex w-full flex-col items-center gap-2 pt-1">
            <p className="font-display text-[9px] tracking-widest text-muted uppercase">
              the rest of the way
            </p>
            <ol className="m-0 flex list-none flex-col gap-1 p-0 text-center">
              {revealed.map((line, i) => (
                <li
                  key={line}
                  className="font-display text-[9px] leading-[1.9] lowercase"
                  style={{ color: i === revealed.length - 1 ? '#ffffff' : '#b9b3e0' }}
                >
                  {line}
                </li>
              ))}
            </ol>
            <PixelButton tone="default" unit={3} onClick={() => setRevealed(null)}>
              hide
            </PixelButton>
          </div>
        )}

        {/*
         * No standing instruction line.
         *
         * It read "pick two things. see what happens." under two empty slots
         * and a key marked COMBINE, which is the same sentence the controls
         * were already saying. It also held a blank line open for itself for
         * the whole rest of the game, which is why the bench had a strip of
         * nothing along the bottom of it.
         */}
        <p
          className="max-w-[34ch] text-center font-display text-[10px] leading-[2] lowercase text-star-mid empty:hidden"
          role="status"
        >
          {feedback?.kind === 'already-known' && `already have ${feedback.name}.`}
          {feedback?.kind === 'no-match' && (feedback.deeper ?? feedback.reason)}
        </p>

        {/*
         * "WHY NOT" — the model, on request.
         *
         * Shown only after a failure, and only until it has been answered.
         * Putting Gemini behind a press rather than in front of every failure
         * is what removes the five-to-ten-second stall from the game's most
         * common interaction, and it means the wait only ever happens to
         * someone who has actively asked for it.
         */}
        {feedback?.kind === 'no-match' && !feedback.deeper && (
          <PixelButton
            tone="default"
            unit={3}
            disabled={feedback.asking}
            onClick={askWhyNot}
          >
            {feedback.asking ? 'asking...' : 'why not?'}
          </PixelButton>
        )}

        {/*
          * AND THEN KEEP GOING.
          *
          * "Why not" answers once and stops, which wastes the moment: the
          * player has just been told what happens between two things and is
          * more curious than they will be at any other point in the session.
          * So once the answer has landed, either of the two is a door into
          * the same three fixed questions the discovery card uses.
          *
          * It reuses api/ask.ts exactly — no new prompt surface, no new way
          * for text to reach a model, the same closed set of three keys. More
          * of the model, through the same fence.
          */}
        {feedback?.kind === 'no-match' && feedback.deeper && (
          <div className="flex w-full flex-col items-center gap-2">
            <p
              className="font-display text-[9px] lowercase text-star-mid"
              style={{ letterSpacing: '0.04em' }}
            >
              want to know more about
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {feedback.pair.map((id, i) => (
                <LearnMore
                  key={id}
                  elementId={id}
                  name={feedback.names[i]}
                  label={feedback.names[i]}
                  unit={3}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      <div
        /*
         * Columns follow the tile, not a number I picked. `grid-cols-4` gave
         * out 64px columns to a 96px tile, so on a narrow screen the last
         * column hung off the side of the screen.
         */
        className="grid justify-items-center gap-3"
        /*
         * TRACKS THAT FILL THE ROW, NOT TRACKS CENTRED IN IT.
         *
         * `repeat(auto-fill, 96px)` with `justify-center` lays three fixed
         * tracks in a 402px row and dumps the 90px of leftover in two lumps at
         * the ends — so the tiles started 45px inside the status bars above
         * them and stopped 45px short of the other side, which is the uneven
         * margin Leo spotted. Measured: bars 20 to 422, first tile at 65.
         *
         * `minmax(96px, 1fr)` shares that leftover across the tracks instead,
         * so the grid's own edges are the row's edges and the tiles sit on the
         * same margins as everything above them. The tile itself stays a fixed
         * size and centres in its track, because every tile being identical is
         * an invariant worth more than the last few pixels of alignment.
         */
        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${TILE_WIDTH}px, 1fr))` }}
      >
        {inventory.map((id) => (
          <ElementTile
            key={id}
            icon={resolveIcon(elementById(id).icon)}
            label={elementById(id).name}
            selected={slots.includes(id)}
            onClick={() => pickTile(id)}
          />
        ))}
      </div>

      {givingUp && giveUpTarget && (
        <ConfirmDialog
          title="show the route?"
          body={`this prints every step still between you and ${elementById(giveUpTarget).name.toLowerCase()}. nothing is wiped.`}
          confirmLabel="show me"
          cancelLabel="keep trying"
          onConfirm={confirmGiveUp}
          onCancel={() => setGivingUp(false)}
        />
      )}

      {discovery && (
        <DiscoveryCard
          element={discovery.element}
          recipe={discovery.recipe}
          onClose={() => setDiscovery(null)}
        />
      )}

      {receiptElement && (
        <Receipt
          element={receiptElement}
          data={data}
          routes={game.routes}
          onClose={() => setReceiptElement(null)}
        />
      )}
      </main>
    </>
  )
}
