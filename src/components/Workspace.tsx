import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { adjudicate } from '../adjudicator/client'
import type { Reply } from '../adjudicator/outcome'
import { explainFailure, RULE_MESSAGES } from '../adjudicator/explain'
import { resolveIcon } from '../data/iconRegistry'
import type { ElementDef, RealmId, RecipeData, RecipeDef } from '../data/types'
import type { useGameState } from '../hooks/useGameState'
import { DiscoveryCard } from './DiscoveryCard'
import { PixelArt } from './PixelArt'
import { Receipt } from './Receipt'
import { TargetList } from './TargetList'
import { PixelButton } from './ui/PixelButton'
import { BackArrow } from './ui/BackArrow'
import { StatPanel } from './ui/StatPanel'
import { HintButton } from './ui/HintButton'
import { GiveUpButton } from './ui/GiveUpButton'
import { ConfirmDialog } from './ui/ConfirmDialog'
import {
  pickHint,
  hintsEarned,
  pathToTarget,
  nextUnfoundTarget,
  MISSES_PER_HINT,
  hintTexts,
  firstHintText,
  fullHintText,
  NOTHING_IN_REACH,
} from '../solver/hint'
import { modeById, type ModeId } from '../game/modes'
import { readDemoSettings, nextDemoStep, nextHumanTurn, rng } from '../game/demo'
import { minWidthForSide, faceWidthFor } from './ui/legend'
import { Readout } from './ui/Readout'
import { WhyNot } from './WhyNot'
import { RouteCard } from './RouteCard'
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
      deeper?: Reply
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

/**
 * Width of the longest realm name in ems, tracking included. Press Start 2P
 * advances exactly 1em a character; the HUD title adds 0.04em after each one.
 * Derived rather than typed, so renaming a realm cannot leave it stale.
 */
const LONGEST_REALM_EMS = (
  Math.max(...Object.values(REALM_LABEL).map((label) => label.length)) * 1.04
).toFixed(2)

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
  const [revealed, setRevealed] = useState<{ target: string; steps: string[] } | null>(null)
  /*
   * The route opens a panel rather than printing into the bench. It is as long
   * as it is — seven steps deep in places — so in the bench's flow it moved
   * every tile in the inventory by however many steps were left.
   */
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
    const target = elementById(giveUpTarget).name
    if (steps.length === 0) {
      setRevealed({ target, steps: ['no route from here.'] })
      return
    }
    setRevealed({
      target,
      steps: steps.map(
        (step) =>
          `${elementById(step.inputs[0]).name.toLowerCase()} + ${elementById(step.inputs[1]).name.toLowerCase()} = ${elementById(step.output).name.toLowerCase()}`,
      ),
    })
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

  /*
   * THE READOUT IS BUILT TO THE TALLEST THING IT CAN EVER SAY.
   *
   * Leo: "the size of this block is inconsistent as it gives the explanations
   * for wrong combinations, hints, etc. that kind of trips up the location of
   * the items below which is bad for the user experience."
   *
   * Every message the strip can hold is a known string — the failure table is
   * a fixed list, the hints are three templates, the rest are element names —
   * so the worst case is computable rather than guessable, and the strip is
   * built exactly that tall. It then never changes height again. The model's
   * prose and the give-up route are the two things that are NOT knowable in
   * advance, and both of them open a panel instead. See ui/readoutFit.ts.
   */
  /*
   * The key's box is reserved whether or not the key is there, AND mirrored on
   * the left so the message sits on the strip's centre line — so every
   * character of its label costs the message two. Which is why the strip picks
   * the label rather than being handed one: "why not?" where there is room for
   * it, "why?" or a bare "?" where the alternative is a seven-line strip on a
   * phone. See chooseKey in ui/readoutFit.ts.
   */
  const whyUnit = viewportWidth < 520 ? 2 : 3
  const whyWidthOf = useCallback(
    (label: string) => faceWidthFor(whyUnit, label),
    [whyUnit],
  )

  /*
   * Every message the strip can ever hold. The failure table is a fixed list,
   * the hints are three templates and the rest are element names, so the
   * tallest is computable rather than guessable — which is what lets the strip
   * be built to it once and never move again.
   */
  const readoutCandidates = useMemo(() => {
    const longestName = data.elements.reduce(
      (longest, el) => (el.name.length > longest.length ? el.name : longest),
      '',
    )
    const name = longestName.toLowerCase()
    return [
      ...RULE_MESSAGES,
      ...hintTexts(longestName),
      `already have ${name}.`,
      `${name} + ${name}`,
    ]
  }, [data.elements])

  /*
   * What to assume for one frame before the strip has measured itself: px-5
   * inside max-w-3xl, then the Card's plate and padding, then the strip's own.
   * The observer corrects it if the page's chrome ever changes underneath.
   */
  const readoutEstimate = Math.max(240, Math.min(768, viewportWidth) - 40) - 2 * (4 + 12) - 2 * (3 + 9)

  /*
   * The model's answer opens a panel. Kept separate from `feedback.deeper` so
   * closing the panel does not throw the answer away — pressing the key again
   * reopens it without asking twice.
   */
  const [whyOpen, setWhyOpen] = useState(false)

  /*
   * What the strip says when it has no news: the pair being assembled, by
   * name. The slots show two 11x11 sprites, which at a glance are a shape and
   * a colour — naming them is the one piece of information the bench was not
   * giving, and it means the readout is only ever blank before the player has
   * touched anything.
   */
  const pairPreview = slots[0]
    ? `${elementById(slots[0]).name} + ${slots[1] ? elementById(slots[1]).name : '?'}`
    : ''
  const tries = game.attempts[realm] ?? 0
  const hits = game.successes[realm] ?? 0
  /*
   * Successes over tries, not discoveries over tries.
   *
   * It used to divide "made" by tries and showed 300%, because "made" counts
   * how much of the realm exists — including elements carried over from
   * Survival and anything found before this counter was added — while tries
   * counts presses of one key. A rate needs both halves to count the same
   * events. Clamped anyway, because a rate above 100% on screen is the kind
   * of thing that makes a player distrust every other number beside it.
   *
   * Guarded rather than formatted at zero: 0/0 is NaN, and "NaN%" is a worse
   * first impression than a dash.
   */
  const hitRate = tries === 0 ? '—' : `${Math.min(100, Math.round((hits / tries) * 100))}%`
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

  /*
   * Named `takeHint` and not `useHint`: it is an event handler, not a React
   * hook, and the lint rule that enforces that naming is right to. A function
   * called `useX` is assumed to follow the rules of hooks by every tool that
   * reads this file, and this one is called from a timer.
   */
  function takeHint() {
    if (!rules.hints || hintsLeft <= 0) return
    playPress()
    const found = pickHint(data, new Set(inventory), realm, game.hintsSpent[realm] ?? 0)
    if (!found) {
      // Not charged for. Being told there is nothing to find is not a hint.
      setHint(NOTHING_IN_REACH)
      return
    }
    if (!rules.infiniteHints) game.spendHint(realm)
    const names = found.recipe.inputs.map((id) => elementById(id).name.toLowerCase())
    if (hintDepth === 0) {
      setHintDepth(1)
      setHint(firstHintText(elementById(found.knownInput).name.toLowerCase(), found.shape))
    } else {
      setHint(fullHintText(names[0], names[1]))
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
    const [a, b] = slots
    // Counted AFTER the guard. Pressing a disabled key is not an attempt, and
    // counting it made the hit rate wrong in the player's favour as well as
    // the numbers meaningless.
    if (!a || !b) return
    game.countAttempt(realm)
    setWhyOpen(false)

    const result = game.combine(a, b)
    setSlots([null, null])

    if (result.status === 'discovered') {
      const discoveredElement = elementById(result.recipe.output)
      // A target gets the full receipt (dependency tree, footprint, sources)
      // instead of the lighter discovery card — it's the "level complete"
      // moment, not just a new inventory tile.
      playDiscovery()
      game.countSuccess(realm)
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

  /*
   * THE GAME PLAYING ITSELF, FOR THE CAMERA.
   *
   * Off unless the URL says otherwise, so nothing about a normal session
   * changes. See game/demo.ts for why the timelapse is driven rather than
   * filmed and sped up.
   *
   * It goes through `game.combine` like a press does, so every tile it puts on
   * the shelf is a real discovery down the real path — but it does not open the
   * discovery card, because twenty-five full-screen cards a second is a strobe
   * rather than a shot. The readout names each one instead, and the thing to
   * watch is the grid filling and the counter climbing.
   */
  const demo = useMemo(
    () => readDemoSettings(typeof window === 'undefined' ? '' : window.location.search),
    [],
  )
  const demoMade = useRef(0)
  /*
   * The interval is created once and would otherwise hold the FIRST render's
   * `game` forever — and `combine` closes over the discovered set, so every
   * tick would read an inventory from before anything was made and the driver
   * would make the same element nine hundred times. The ref is refreshed on
   * every render, so the tick always reads the current one.
   */
  const gameRef = useRef(game)
  useEffect(() => {
    gameRef.current = game
  })

  useEffect(() => {
    if (demo.mode !== 'fast') return
    const timer = window.setInterval(() => {
      const current = gameRef.current
      /*
       * The inventory is tracked here rather than re-read from `game` between
       * steps, because state set inside this tick has not landed yet — without
       * it every step in a batch would find the same pair and make it once.
       */
      const held = new Set(current.allDiscovered())
      let last: string | null = null

      for (let i = 0; i < demo.batch; i++) {
        if (demoMade.current >= demo.stop) {
          window.clearInterval(timer)
          break
        }
        const step = nextDemoStep(data, held, realm)
        if (!step) {
          window.clearInterval(timer)
          break
        }
        const [a, b] = step.inputs
        current.countAttempt(realm)
        const result = current.combine(a, b)
        if (result.status !== 'discovered') break
        current.countSuccess(realm)
        held.add(result.recipe.output)
        demoMade.current += 1
        last = result.recipe.output
      }

      if (last) {
        const made = data.elements.find((el) => el.id === last)
        if (made) setFeedback({ kind: 'already-known', name: made.name })
      }
    }, demo.ms)
    return () => window.clearInterval(timer)
  }, [demo.mode, demo.ms, demo.stop, demo.batch, realm, data])

  /*
   * A PERSON PLAYING, AT FOUR TIMES LIFE.
   *
   * Leo: "i want you to mimic real speed time lampse like getting things wrong
   * and right and the aniamtions etc etc."
   *
   * The difference from the mode above is not the speed, it is what gets
   * driven. That one calls `game.combine` and moves the counter; this one
   * presses the same functions the buttons press — `pickTile`, `handleCombine`,
   * `useHint`, `askWhyNot` — so the slots fill, the key depresses, the
   * discovery card arrives and is dismissed, and the readout prints a real
   * reason for a real dead end. Nothing here is a reenactment of play; it IS
   * play, with the delays chosen rather than felt.
   *
   * Written as an async loop with a cancel flag rather than an interval,
   * because a turn is a SEQUENCE of unequal waits — a beat to read a dead end,
   * a longer one to look at a card — and an interval can only do one tempo.
   */
  const actionsRef = useRef({
    pickTile,
    handleCombine,
    takeHint,
    askWhyNot,
    closeCard: () => {},
    hasCard: false,
    hintsLeft: 0,
  })
  useEffect(() => {
    actionsRef.current = {
      pickTile,
      handleCombine,
      takeHint,
      askWhyNot,
      closeCard: () => {
        setDiscovery(null)
        setReceiptElement(null)
        setWhyOpen(false)
      },
      hasCard: discovery !== null || receiptElement !== null,
      hintsLeft: rules.infiniteHints ? Infinity : earned,
    }
  })

  /*
   * ONE DRIVER AT A TIME, AND STRICT MODE MAKES THAT NON-OBVIOUS.
   *
   * React runs every effect twice in development — mount, clean up, mount —
   * to catch exactly this kind of thing, and it caught it. A plain `cancelled`
   * flag is not enough, because the first loop's opening move happens before
   * its first await, so both drivers got a click in. Two drivers alternating
   * picks into two slots means the second pick of one lands as the first pick
   * of the other, the third resets the pair, and combine is pressed on a half
   * empty bench forever: three turns played, zero attempts counted.
   *
   * A run id fixes it in both directions. Each run claims the ref, the loop
   * yields before touching anything, and a run that no longer owns the ref
   * stops without having done a thing.
   */
  const demoRunRef = useRef(0)

  useEffect(() => {
    if (demo.mode !== 'human') return
    const myRun = ++demoRunRef.current
    const alive = () => demoRunRef.current === myRun
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => window.setTimeout(resolve, ms))
    const random = rng(demo.seed)
    const tried = new Set<string>()

    /*
     * SCROLL TO WHAT YOU ARE ABOUT TO CLICK.
     *
     * Leo: "i want to see things moving, not everything needs to be legible,
     * movements quick jittery up and down, things increasing, unlovking,
     * screens poopping up, like an acutal time lapse video."
     *
     * This is where that comes from, and it is not a camera move bolted on
     * top — it is what a player does. At nine hundred elements the grid is
     * twenty thousand pixels tall and the two tiles you want are rarely on the
     * same screen, so the game is already mostly scrolling. Driving it
     * honestly produces the motion.
     *
     * `instant` rather than `smooth` on purpose, twice over: a smooth scroll
     * lands on fractional offsets, which resamples every sprite on the page
     * and undoes the one thing the art is for — and a hard jump is exactly the
     * jitter being asked for.
     */
    function scrollTo(id: string) {
      const tile = document.querySelector(`[data-element="${CSS.escape(id)}"]`)
      if (!tile) return
      const box = tile.getBoundingClientRect()
      const margin = 140
      if (box.top >= margin && box.bottom <= window.innerHeight - margin) return
      const target = window.scrollY + box.top - (window.innerHeight - box.height) / 2
      window.scrollTo({ top: Math.max(0, Math.round(target)), behavior: 'instant' })
    }

    async function play() {
      // Yield once before the opening move, so a run that has already been
      // superseded stops before it touches the board.
      await sleep(0)
      let turns = 0
      let sinceHit = 0
      while (alive() && turns < demo.stop) {
        const act = actionsRef.current
        const held = new Set(gameRef.current.allDiscovered())

        /*
         * Forced after four misses in a row regardless of the dice. A run of
         * failures is what the real game feels like and it is also what makes
         * a clip look broken, and the viewer cannot tell the difference
         * between bad luck and a bug.
         */
        const wantHit = random() < demo.hitRate || sinceHit >= 4
        const turn = nextHumanTurn(data, held, realm, wantHit, random, tried)
        if (turn.kind === 'stuck') break

        const [a, b] = turn.inputs
        tried.add([a, b].sort().join('+'))

        scrollTo(a)
        act.pickTile(a)
        await sleep(demo.ms)
        if (!alive()) return
        scrollTo(b)
        actionsRef.current.pickTile(b)
        await sleep(demo.ms)
        if (!alive()) return
        /*
         * Back to the bench to press the key. The player has to go there to
         * combine, so the clip goes there — and it is what gives the section
         * its rhythm: out to find a tile, back to the middle, out again.
         */
        window.scrollTo({ top: 0, behavior: 'instant' })
        actionsRef.current.handleCombine()
        await sleep(demo.ms)
        if (!alive()) return

        if (turn.kind === 'hit') {
          sinceHit = 0
          // A beat to look at the card, then close it by hand. Never shorter
          // than a few frames: a card that opens and closes inside one frame
          // is not a flash, it is nothing at all.
          await sleep(Math.max(120, demo.ms * 3))
          if (!alive()) return
          if (actionsRef.current.hasCard) {
            actionsRef.current.closeCard()
            await sleep(demo.ms)
          }
        } else {
          sinceHit++
          // Long enough to read the reason, which is the teaching.
          await sleep(demo.ms * 2)
          if (!alive()) return

          /*
           * Every fifth dead end or so, ask the model. This is the one beat in
           * the clip that shows the Gemini integration doing its job, and it
           * has to look like curiosity rather than a feature tour — so it
           * happens on a dead end that has just been read, not on a schedule.
           */
          if (random() < 0.22) {
            actionsRef.current.askWhyNot()
            await sleep(demo.ms * 6)
            if (!alive()) return
            actionsRef.current.closeCard()
            await sleep(demo.ms)
          }
        }

        // And when the misses pile up, spend a hint, which is what the counter
        // on the left has been telling the player to do.
        if (alive() && sinceHit >= 3 && actionsRef.current.hintsLeft > 0 && random() < 0.5) {
          actionsRef.current.takeHint()
          await sleep(demo.ms * 3)
        }

        turns++
      }
    }

    void play()
    return () => {
      /*
       * Invalidate this run by bumping the ref past the id this closure holds.
       * The lint rule warns about reading `.current` in a cleanup because it
       * will have changed by then — which is exactly the point here: if a
       * later run has already claimed the ref, `alive()` is false for this one
       * and there is nothing to do. Comparing rather than assigning is what
       * makes that safe.
       */
      if (demoRunRef.current === myRun) demoRunRef.current = myRun + 1
    }
  }, [demo.mode, demo.ms, demo.stop, demo.hitRate, demo.seed, realm, data])

  /*
   * FRAME BY FRAME, AND THE WHOLE INTERACTION — NOT JUST THE PAYOFF.
   *
   * The first cut of this photographed one frame per discovery, which put 920
   * cards in thirty seconds and was wrong for two reasons Leo named exactly:
   *
   *   "its unrealistic, becasue to use the items below, you need to scroll
   *   down, and click it then go back up and combine."
   *   "theres a lot of flashing... and since theres no vertical movement is
   *   just looks bad on the eyes."
   *
   * Both are the same fault. A discovery is not one moment, it is a sequence —
   * scroll to a tile, click it, scroll to another, click that, come back to
   * the bench, press combine, read the card, dismiss it. Photographing only
   * the last step gives you 920 unrelated full-screen panels cut together at
   * thirty a second, which is a strobe rather than a timelapse.
   *
   * THE ARITHMETIC THAT DECIDES THE DESIGN
   *
   * A full interaction is about fifteen frames once the scrolling moves in
   * steps rather than jumping. Fifteen times 920 is seven and a half minutes.
   * So all 920 interactions do not fit in thirty seconds and no amount of
   * cleverness changes that.
   *
   * Which is what a timelapse has always done about it: photograph every Nth
   * moment. Every discovery here is real and every one of them happens — one
   * in fifteen is FILMED, in full, and the rest go by between exposures, the
   * way the flower keeps opening between frames. The counter still reaches
   * 920 because it still made 920 things.
   */
  const filmRef = useRef({
    /** Where we are in the current interaction. */
    phase: 'plan' as
      | 'plan'
      | 'scrollA'
      | 'pickA'
      | 'scrollB'
      | 'pickB'
      | 'toBench'
      | 'combine'
      | 'card'
      | 'dismiss',
    step: 0,
    from: 0,
    to: 0,
    pair: ['', ''] as [string, string],
    kind: 'hit' as 'hit' | 'miss',
    shown: 0,
    held: new Set<string>(),
  })

  useEffect(() => {
    if (demo.mode !== 'film') return
    const random = rng(demo.seed)
    const film = filmRef.current
    film.phase = 'plan'
    film.step = 0
    film.shown = 0
    film.held = new Set(gameRef.current.allDiscovered())

    const nameOf = (id: string) => data.elements.find((el) => el.id === id)!
    const targets = new Set(Object.values(data.targets).flat())
    const total = new Set(
      data.recipes
        .map((r) => r.output)
        .filter((id) => {
          const el = data.elements.find((e) => e.id === id)
          return el && (realm === 'everyday' || el.realm === 'survival')
        }),
    ).size

    /** How many frames a scroll is spread over. More is smoother and slower. */
    const SCROLL_FRAMES = Math.max(1, demo.batch)
    /** Film one interaction in this many discoveries; the rest happen unseen. */
    const EVERY = Math.max(1, demo.stop === Infinity ? 15 : demo.stop)

    function tileTop(id: string): number {
      const tile = document.querySelector(`[data-element="${CSS.escape(id)}"]`)
      if (!tile) return window.scrollY
      const box = tile.getBoundingClientRect()
      const target = window.scrollY + box.top - (window.innerHeight - box.height) / 2
      const max = document.documentElement.scrollHeight - window.innerHeight
      return Math.max(0, Math.min(max, Math.round(target)))
    }

    /*
     * Stepped, not animated. The browser's own smooth scroll lands on
     * fractional offsets, which resamples every sprite on the page — and each
     * of these steps is a separate exposure anyway, so the smoothness has to
     * come from the number of frames rather than from an easing curve.
     */
    function scrollStep(): boolean {
      film.step++
      const t = film.step / SCROLL_FRAMES
      const y = Math.round(film.from + (film.to - film.from) * Math.min(1, t))
      window.scrollTo({ top: y, behavior: 'instant' })
      return film.step >= SCROLL_FRAMES
    }

    /** Everything that happens between two filmed interactions, unphotographed. */
    function catchUp(n: number) {
      const current = gameRef.current
      for (let i = 0; i < n; i++) {
        const step = nextDemoStep(data, film.held, realm)
        if (!step) return
        current.countAttempt(realm)
        const result = current.combine(step.inputs[0], step.inputs[1])
        if (result.status !== 'discovered') return
        current.countSuccess(realm)
        film.held.add(result.recipe.output)
      }
    }

    const api = {
      /** One FRAME. Returns what this frame shows, for the camera's log. */
      next(): string {
        const current = gameRef.current

        switch (film.phase) {
          case 'plan': {
            setDiscovery(null)
            setReceiptElement(null)
            /*
             * A dead end every seventh filmed interaction. Over 97% of real
             * attempts fail, and a clip where everything works says plainly
             * that nobody is playing — but a clip that is mostly failure is
             * thirty seconds of nothing happening. One in seven is the
             * compromise, and it is the same one the acted driver makes.
             */
            film.kind = film.shown > 0 && film.shown % 7 === 0 ? 'miss' : 'hit'
            if (film.kind === 'hit') {
              const step = nextDemoStep(data, film.held, realm)
              if (!step) return 'done'
              film.pair = [step.inputs[0], step.inputs[1]]
            } else {
              const held = [...film.held]
              const real = new Set(
                data.recipes.map((r) => [r.inputs[0], r.inputs[1]].sort().join('+')),
              )
              let found: [string, string] | null = null
              for (let i = 0; i < 40 && !found; i++) {
                const a = held[Math.floor(random() * held.length)]
                const b = held[Math.floor(random() * held.length)]
                if (!a || !b || a === b) continue
                if (real.has([a, b].sort().join('+'))) continue
                found = [a, b]
              }
              if (!found) return 'skip'
              film.pair = found
            }
            setSlots([null, null])
            setFeedback(null)
            setHint(null)
            film.phase = 'scrollA'
            film.step = 0
            film.from = window.scrollY
            film.to = tileTop(film.pair[0])
            return 'plan'
          }

          case 'scrollA':
            if (scrollStep()) {
              film.phase = 'pickA'
              film.step = 0
            }
            return 'scroll'

          case 'pickA':
            actionsRef.current.pickTile(film.pair[0])
            film.phase = 'scrollB'
            film.step = 0
            film.from = window.scrollY
            film.to = tileTop(film.pair[1])
            return 'pick'

          case 'scrollB':
            if (scrollStep()) {
              film.phase = 'pickB'
              film.step = 0
            }
            return 'scroll'

          case 'pickB':
            actionsRef.current.pickTile(film.pair[1])
            film.phase = 'toBench'
            film.step = 0
            film.from = window.scrollY
            film.to = 0
            return 'pick'

          case 'toBench':
            // Back to the bench, because that is where the key is. This is the
            // journey the first cut left out entirely.
            if (scrollStep()) {
              film.phase = 'combine'
              film.step = 0
            }
            return 'scroll'

          case 'combine': {
            const [a, b] = film.pair
            current.countAttempt(realm)
            if (film.kind === 'miss') {
              current.countMiss(realm, a, b)
              setSlots([null, null])
              setFeedback({
                kind: 'no-match',
                reason: explainFailure(a, b).message,
                pair: [a, b],
                names: [nameOf(a).name, nameOf(b).name],
              })
              film.phase = 'dismiss'
              film.step = 0
              return 'deadend'
            }
            const result = current.combine(a, b)
            setSlots([null, null])
            if (result.status !== 'discovered') {
              film.phase = 'plan'
              return 'skip'
            }
            current.countSuccess(realm)
            film.held.add(result.recipe.output)
            const made = nameOf(result.recipe.output)
            if (targets.has(made.id)) setReceiptElement(made)
            else setDiscovery({ element: made, recipe: result.recipe })
            film.phase = 'card'
            film.step = 0
            return 'discovery'
          }

          case 'card':
            /*
             * Held for three frames, which is a tenth of a second.
             *
             * The card's scrim is a near-black wash over the whole screen, so
             * every discovery is a bright-dark-bright cut. At one frame that
             * is not a flash, it is a tear; at two it still reads as a flicker.
             * At three it reads as a beat — the cut lands, you register it, it
             * goes. This is most of what stops the whole thing strobing.
             */
            film.step++
            if (film.step >= 3) {
              film.phase = 'dismiss'
              film.step = 0
            }
            return 'card'

          case 'dismiss':
            setDiscovery(null)
            setReceiptElement(null)
            setFeedback(null)
            film.shown++
            // And the ones nobody watches. They are as real as the filmed one.
            if (film.kind === 'hit') catchUp(EVERY - 1)
            film.phase = 'plan'
            return 'dismiss'
        }
        return 'skip'
      },
      made: () => film.held.size,
      remaining: () => total - film.held.size,
    }

    ;(window as unknown as { __film?: typeof api }).__film = api
    return () => {
      delete (window as unknown as { __film?: typeof api }).__film
    }
  }, [demo.mode, demo.seed, demo.batch, demo.stop, realm, data])

  function askWhyNot() {
    if (!feedback || feedback.kind !== 'no-match') return
    playPress()
    setWhyOpen(true)
    // Already answered: the panel reopens on what it said before rather than
    // asking the same question twice.
    if (feedback.deeper) return
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
      <HudBar className={`flex items-center ${viewportWidth < 380 ? 'gap-2' : 'gap-3'}`}>
        {/*
         * THE WORD GOES BEFORE THE TITLE DOES.
         *
         * At 320px the two keys take 171 of the bar's 252 and the title is
         * left with 49 — which is a 4.7px pixel font, in the DOM and invisible
         * on the screen. An arrow on its own is still an unambiguous back
         * control; a realm name nobody can read is not a title. So below
         * 380px the key drops its label and the title gets the 39px.
         */}
        <PixelButton
          tone="default"
          unit={hudUnit}
          onClick={onBack}
          aria-label="Back to realms"
        >
          <BackArrow unit={hudUnit} />
          {viewportWidth >= 380 && 'realms'}
        </PixelButton>
        {/*
         * THE TITLE IS SIZED BY THE ROOM IT HAS, NOT BY THE WINDOW.
         *
         * It was `clamp(8px, 1.9vw, 22px)`, and a slope off the viewport is a
         * guess about how much of that viewport the two buttons will take. At
         * 375px they take 171 of it, which leaves 80 for a title that wants
         * 83 — so "everything" lost its last letter to `overflow-hidden` on
         * the single most common phone width. The buttons never yield, so the
         * title has to be told what is actually left.
         *
         * This wrapper is the flexible element and the container the type is
         * measured against, which breaks the circularity: its width comes from
         * the row, never from the text inside it. Press Start 2P advances
         * exactly 1em a character and the title carries 0.04em of tracking, so
         * ten characters need 10.4 times the font size — and dividing the
         * wrapper's own width by 10.4 is a size that cannot clip.
         *
         * TEN because that is "everything", the longer of the two realm names.
         * Both realms get the same size on purpose: the bar should not change
         * height or weight depending on which one you are in.
         */}
        <div
          className="flex min-w-0 flex-1 justify-center"
          style={{ containerType: 'inline-size' }}
        >
          <h1
            className="overflow-hidden whitespace-nowrap uppercase text-white"
            style={{
              fontFamily: 'var(--font-display)',
              /*
               * The floor matters as much as the ceiling: an unfloored size
               * resolved to 4.7px at 320, which is a font built from one-pixel
               * stems rendered at half a pixel. Below the floor the title
               * clips rather than vanishes, and the arrow-only back key above
               * is what keeps it from ever getting there.
               */
              fontSize: `clamp(7px, 100cqw / ${LONGEST_REALM_EMS}, 22px)`,
              letterSpacing: '0.04em',
              margin: 0,
            }}
          >
            {REALM_LABEL[realm]}
          </h1>
        </div>
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
          <div
            /*
             * Pushed to the OUTSIDE of its track, not the inside.
             *
             * It was `sm:justify-end`, which parks it against the middle
             * column — so narrowing the panel bought space on the wrong side
             * and the gap to the combine key did not change. Leo: "the point
             * of making the width of data block smaller was to leave more
             * space between combine and it. move it to the left."
             *
             * Then sixteen pixels back the other way, because flush against
             * the outside was further than he wanted: "move the data block a
             * tiny tiny bit to the right now. tiny bit." The gap to the
             * combine key goes 15px, 54px, 38px across those three.
             */
            className="flex min-w-0 flex-[1_1_140px] justify-center sm:justify-start sm:pl-4"
          >
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
                <HintButton left={hintsLeft} onClick={takeHint} disabled={hintsLeft <= 0} block />
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

        {/*
         * THE BENCH'S DISPLAY — one strip, one height, every state.
         *
         * What used to be here was five things that each appeared and
         * disappeared in the panel's own flow: a hint, a route, a reason, a
         * key to ask the model, and whatever that key opened. The panel was a
         * different height in every one of those states, so the inventory
         * below it moved on almost every press — with the player's hand
         * already travelling toward a tile.
         *
         * Two of the five were never going to fit a fixed strip, because
         * their length is not knowable in advance: the model writes as many
         * sentences as it writes, and a route is as deep as the graph is.
         * Those open panels. The other three are known strings, so the strip
         * is built to the tallest of them and nothing below it ever moves.
         *
         * There is no standing instruction line: it read "pick two things.
         * see what happens." under two empty slots and a key marked COMBINE,
         * which is the same sentence the controls were already saying. The
         * strip is empty until the player touches something, and an empty
         * recess reads as a screen with nothing on it.
         */}
        <Readout
          candidates={readoutCandidates}
          estimatedWidth={readoutEstimate}
          keyWidthOf={whyWidthOf}
          keyUnit={whyUnit}
          tone={
            hint
              ? 'var(--color-brand)'
              : feedback
                ? 'var(--color-star-mid)'
                : 'var(--color-muted)'
          }
          action={(label) =>
            feedback?.kind === 'no-match' ? (
              /*
               * "WHY NOT" — the model, on request.
               *
               * Behind a press rather than in front of every failure. Over 98%
               * of attempts fail, so asking on every one of them put a five to
               * ten second stall in the game's most common interaction. The
               * label does not change while it is asking: the panel it opens
               * is where the waiting is shown, and a key that renames itself
               * inside a fixed slot is a second thing moving.
               */
              <PixelButton tone="default" unit={whyUnit} onClick={askWhyNot}>
                {label}
              </PixelButton>
            ) : null
          }
        >
          {hint ??
            (feedback?.kind === 'already-known'
              ? `already have ${feedback.name}.`
              : feedback?.kind === 'no-match'
                ? feedback.reason
                : pairPreview)}
        </Readout>
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
            elementId={id}
            icon={resolveIcon(elementById(id).icon)}
            label={elementById(id).name}
            selected={slots.includes(id)}
            onClick={() => pickTile(id)}
          />
        ))}
      </div>

      {/*
       * No paragraph under the question. Leo asked for it gone, and it was
       * doing the title's job at a third of the size: "show the route?"
       * against "keep trying" and "show me" is the whole decision.
       */}
      {givingUp && giveUpTarget && (
        <ConfirmDialog
          title="show the route?"
          confirmLabel="show me"
          cancelLabel="keep trying"
          onConfirm={confirmGiveUp}
          onCancel={() => setGivingUp(false)}
        />
      )}

      {revealed && (
        <RouteCard
          target={revealed.target}
          steps={revealed.steps}
          onClose={() => setRevealed(null)}
        />
      )}

      {whyOpen && feedback?.kind === 'no-match' && (
        <WhyNot
          pair={feedback.pair}
          names={feedback.names}
          answer={feedback.deeper}
          onClose={() => setWhyOpen(false)}
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
