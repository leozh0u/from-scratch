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
import { MadeCount } from './ui/MadeCount'
import { HintButton } from './ui/HintButton'
import { pickHint, hintsEarned } from '../solver/hint'
import { Card } from './ui/Card'
import { ElementTile, TILE_WIDTH } from './ui/ElementTile'
import { ProgressBar } from './ui/ProgressBar'
import { HudBar, EmptySlot } from './ui/HudBar'
import { ForestScene } from './ForestScene'
import { CityScene } from './CityScene'
import { playPress, playDiscovery, playNoMatch } from '../audio/sfx'
import { useViewport } from '../hooks/useViewport'

type WorkspaceProps = {
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

export function Workspace({ realm, data, game, onBack, onOpenInventory }: WorkspaceProps) {
  const [slots, setSlots] = useState<Slots>([null, null])
  const { width: viewportWidth } = useViewport()
  /*
   * The HUD's two buttons plus the realm name have to share one strip. At a
   * 335px viewport the three of them wanted 383px and the title was clipped
   * off the right-hand end, so the buttons step down a unit on a narrow
   * screen rather than the bar silently eating its own contents.
   */
  const hudUnit = viewportWidth < 520 ? 2 : 3

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
  const hintsLeft = hintsEarned(realmFound) - (game.hintsSpent[realm] ?? 0)

  function useHint() {
    if (hintsLeft <= 0) return
    playPress()
    const found = pickHint(data, new Set(inventory), realm, game.hintsSpent[realm] ?? 0)
    if (!found) {
      // Not charged for. Being told there is nothing to find is not a hint.
      setHint('nothing new is within reach from here. make something first.')
      return
    }
    game.spendHint(realm)
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
          className="min-w-0 overflow-hidden whitespace-nowrap lowercase text-white"
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

      {targets.length > 0 && (
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
      <Card className="flex flex-col items-center gap-5 p-6">
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
                className="flex size-16 cursor-pointer items-center justify-center"
                aria-label={`Remove ${elementById(id).name} from slot`}
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                <PixelArt sprite={resolveIcon(elementById(id).icon)} scale={3} />
              </button>
            ) : (
              <EmptySlot key={i} unit={4} size={64} />
            ),
          )}
        </div>

        {/*
          * THE COMBINE ROW: a counter, the key, and a hint.
          *
          * The panel is as wide as the two bars above it and the key used the
          * middle fifth of it. What earns the rest is not decoration: on the
          * left, how much of the realm is made, because the goal is to make
          * everything and a goal you cannot see is not a goal; on the right,
          * the hint, which is the only thing a stuck player wants and which
          * had nowhere to live.
          *
          * They are the same size and the same distance out, so the key stays
          * the centre of the panel rather than being shoved off it.
          */}
        <div className="flex w-full flex-wrap items-center justify-center gap-3">
          {/* basis-0 so the two sides share what is left AFTER the key, and
            * wrap rather than overflow when there is not enough. At 442px the
            * first version pushed the hint key off the panel. */}
          <div className="flex min-w-0 flex-[1_1_72px] justify-end">
            <MadeCount found={realmFound} total={realmTotal} />
          </div>

          <PixelButton
            tone="survival"
            unit={5}
            onClick={handleCombine}
            disabled={!slots[0] || !slots[1]}
          >
            combine
          </PixelButton>

          <div className="flex min-w-0 flex-[1_1_72px] justify-start">
            <HintButton
              left={hintsLeft}
              onClick={useHint}
              disabled={hintsLeft <= 0}
            />
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
        className="grid justify-center gap-3"
        style={{ gridTemplateColumns: `repeat(auto-fill, ${TILE_WIDTH}px)` }}
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
