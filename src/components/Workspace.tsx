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
import { Card } from './ui/Card'
import { ElementTile } from './ui/ElementTile'
import { ProgressBar } from './ui/ProgressBar'
import { HudBar, EmptySlot } from './ui/HudBar'
import { ForestScene } from './ForestScene'
import { CityScene } from './CityScene'
import { playPress, playDiscovery, playNoMatch } from '../audio/sfx'

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

const REALM_LABEL: Record<RealmId, string> = {
  survival: 'Survival',
  everyday: 'Everyday Objects',
}

export function Workspace({ realm, data, game, onBack, onOpenInventory }: WorkspaceProps) {
  const [slots, setSlots] = useState<Slots>([null, null])
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
  const inventory =
    realm === 'survival'
      ? game.allDiscovered().filter((id) => elementById(id)?.realm === 'survival')
      : game.allDiscovered()

  const discoveredIds = new Set(inventory)
  const targets = data.targets[realm].map(elementById)
  const foundCount = targets.filter((t) => discoveredIds.has(t.id)).length
  // Guard divide-by-zero for a realm with no targets yet (Everyday, pre-step-15).
  const progress = targets.length === 0 ? 0 : (foundCount / targets.length) * 100

  /*
   * The only onboarding this game gets: one line, shown whenever a
   * first-time player is looking at empty slots with nothing discovered yet.
   * It steps aside the moment a slot is filled or a result is showing, and
   * disappears for good after the first real discovery. No tutorial screen,
   * no modal — the empty slots plus this sentence are the whole explanation.
   */
  // "First run" is global: once a player has combined anything, in either
  // realm, they have learned the verb and do not need reminding. Measured
  // against everything they own rather than against the filtered view above,
  // or entering Survival after finishing it would look like a fresh start.
  const totalStarters = data.starters.survival.length + data.starters.everyday.length
  const isFirstRun = game.allDiscovered().length === totalStarters
  const showHint = isFirstRun && !feedback && slots[0] === null && slots[1] === null

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
    void adjudicate(a, b, nameA, nameB).then((deeper) => {
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
        <PixelButton tone="default" unit={3} onClick={onBack}>
          ← realms
        </PixelButton>
        <span className="flex-1" aria-hidden="true" />
        <h1 className="shrink-0 font-display text-[11px] whitespace-nowrap lowercase tracking-wide text-white">
          {REALM_LABEL[realm]}
        </h1>
        <span className="flex-1" aria-hidden="true" />
        <PixelButton tone="default" unit={3} onClick={onOpenInventory}>
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

        <PixelButton
          tone="survival"
          unit={5}
          onClick={handleCombine}
          disabled={!slots[0] || !slots[1]}
        >
          combine
        </PixelButton>

        {/* role="status" so a screen reader announces the result without a page jump */}
        <p
          className="min-h-5 max-w-[34ch] text-center font-display text-[10px] leading-[2] lowercase text-star-mid"
          role="status"
        >
          {showHint && 'pick two things. see what happens.'}
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
      </Card>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
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
