import { useState } from 'react'
import { resolveIcon } from '../data/iconRegistry'
import type { ElementDef, RealmId, RecipeData, RecipeDef } from '../data/types'
import type { useGameState } from '../hooks/useGameState'
import { DiscoveryCard } from './DiscoveryCard'
import { PixelArt } from './PixelArt'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { ElementTile } from './ui/ElementTile'

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

  const inventory = game.inventoryFor(realm)
  const elementById = (id: string) => data.elements.find((el) => el.id === id)!

  function toggleTile(id: string) {
    setFeedback(null)
    setSlots(([a, b]) => {
      if (a === id) return [b, null]
      if (b === id) return [a, null]
      if (a === null) return [id, b]
      if (b === null) return [a, id]
      // Both slots full and a third tile picked: start over with the new pick.
      return [id, null]
    })
  }

  function handleCombine() {
    const [a, b] = slots
    if (!a || !b) return

    const result = game.combine(a, b)
    setSlots([null, null])

    if (result.status === 'discovered') {
      setDiscovery({ element: elementById(result.recipe.output), recipe: result.recipe })
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
                  onClick={() => toggleTile(id)}
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
        <p className="min-h-5 text-sm font-semibold text-ink" role="status">
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
            onClick={() => toggleTile(id)}
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
    </main>
  )
}
