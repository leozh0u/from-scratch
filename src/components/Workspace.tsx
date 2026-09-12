import { useState } from 'react'
import { resolveIcon } from '../data/iconRegistry'
import type { ElementDef, RealmId, RecipeData, RecipeDef } from '../data/types'
import type { useGameState } from '../hooks/useGameState'
import { DiscoveryCard } from './DiscoveryCard'
import { PixelArt } from './PixelArt'
import { Receipt } from './Receipt'
import { TargetList } from './TargetList'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { ElementTile } from './ui/ElementTile'
import { ProgressBar } from './ui/ProgressBar'

type WorkspaceProps = {
  realm: RealmId
  data: RecipeData
  game: ReturnType<typeof useGameState>
  onBack: () => void
}

type Slots = [string | null, string | null]

/*
 * A genuine discovery gets the loud full-screen DiscoveryCard, not this inline
 * line — so this feedback type only ever needs the two quiet outcomes.
 */
type Feedback = { kind: 'already-known'; name: string } | { kind: 'no-match' }

type Discovery = { element: ElementDef; recipe: RecipeDef }

const REALM_LABEL: Record<RealmId, string> = {
  survival: 'Survival',
  everyday: 'Everyday Objects',
}

export function Workspace({ realm, data, game, onBack }: WorkspaceProps) {
  const [slots, setSlots] = useState<Slots>([null, null])
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [discovery, setDiscovery] = useState<Discovery | null>(null)
  const [receiptElement, setReceiptElement] = useState<ElementDef | null>(null)

  // Membership across every realm's target list, not just the current one —
  // a discovery's own recipe can land it in a different realm than the one
  // being viewed (cross-realm carryover).
  const allTargetIds = new Set(Object.values(data.targets).flat())

  // Global, not realm-scoped — an element discovered in one realm has to stay
  // selectable in another (cross-realm carryover; see useGameState).
  const inventory = game.allDiscovered()
  const elementById = (id: string) => data.elements.find((el) => el.id === id)!

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
  // "First run" is global too — once a player has combined anything, in
  // either realm, they've learned the verb and don't need reminding again.
  const totalStarters = data.starters.survival.length + data.starters.everyday.length
  const isFirstRun = inventory.length === totalStarters
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
    setFeedback(null)
    setSlots(([a, b]) => {
      if (a === null) return [id, b]
      if (b === null) return [a, id]
      // Both slots full and a third tile picked: start over with the new pick.
      return [id, null]
    })
  }

  function clearSlot(index: 0 | 1) {
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
      if (allTargetIds.has(discoveredElement.id)) {
        setReceiptElement(discoveredElement)
      } else {
        setDiscovery({ element: discoveredElement, recipe: result.recipe })
      }
    } else if (result.status === 'already-known') {
      setFeedback({ kind: 'already-known', name: elementById(result.recipe.output).name })
    } else {
      setFeedback({ kind: 'no-match' })
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-5 py-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer text-sm font-extrabold text-muted hover:text-ink"
        >
          ← Realms
        </button>
        <h1 className="text-lg font-extrabold text-ink">{REALM_LABEL[realm]}</h1>
        {/* Empty spacer balances the back link so the title stays centred */}
        <span className="w-16" aria-hidden="true" />
      </div>

      {targets.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <ProgressBar value={progress} accent="var(--color-brand)" />
            <span className="shrink-0 text-sm font-extrabold text-muted">
              {foundCount}/{targets.length}
            </span>
          </div>
          <TargetList targets={targets} discoveredIds={discoveredIds} />
        </div>
      )}

      <Card className="flex flex-col items-center gap-5 p-6">
        <div className="flex items-center gap-4">
          {slots.map((id, i) => (
            <div
              key={i}
              className="flex size-16 items-center justify-center rounded-row border-2 border-dashed border-hairline"
            >
              {id ? (
                <button
                  type="button"
                  onClick={() => clearSlot(i as 0 | 1)}
                  className="flex cursor-pointer flex-col items-center"
                  aria-label={`Remove ${elementById(id).name} from slot`}
                >
                  <PixelArt sprite={resolveIcon(elementById(id).icon)} scale={3} />
                </button>
              ) : (
                <span className="text-2xl text-muted" aria-hidden="true">
                  ?
                </span>
              )}
            </div>
          ))}
        </div>

        <Button onClick={handleCombine} disabled={!slots[0] || !slots[1]}>
          Combine
        </Button>

        {/* role="status" so a screen reader announces the result without a page jump */}
        <p className="min-h-5 text-sm font-semibold text-muted" role="status">
          {showHint && 'Tap two elements below, then hit Combine.'}
          {feedback?.kind === 'already-known' && `You already have ${feedback.name}.`}
          {feedback?.kind === 'no-match' && 'Nothing happens.'}
        </p>
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
          onClose={() => setReceiptElement(null)}
        />
      )}
    </main>
  )
}
