import { useState } from 'react'
import { resolveIcon } from '../data/iconRegistry'
import type { ElementDef, RealmId, RecipeData } from '../data/types'
import type { useGameState } from '../hooks/useGameState'
import { DiscoveryCard } from './DiscoveryCard'
import { Card } from './ui/Card'
import { ElementTile } from './ui/ElementTile'
import { Button } from './ui/Button'

type InventoryProps = {
  data: RecipeData
  game: ReturnType<typeof useGameState>
  onBack: () => void
}

const REALM_LABEL: Record<RealmId, string> = {
  survival: 'Survival',
  everyday: 'Everyday Objects',
}

/**
 * The permanent record of everything a player has actually crafted — the
 * point being that the "I had no idea that's what goes into this" moment
 * shouldn't only exist for the ten seconds a discovery card is on screen.
 * Starters are excluded on purpose: they were handed to you, not made.
 *
 * Tiles are deliberately bare (icon + name only) — tapping one reopens the
 * same DiscoveryCard shown at the moment of discovery, rather than
 * duplicating its layout inline for every entry.
 */
export function Inventory({ data, game, onBack }: InventoryProps) {
  const [selected, setSelected] = useState<ElementDef | null>(null)

  const starterIds = new Set([...data.starters.survival, ...data.starters.everyday])
  const elementById = new Map(data.elements.map((el) => [el.id, el]))

  const crafted: { realm: RealmId; element: ElementDef }[] = []
  for (const realm of ['survival', 'everyday'] as RealmId[]) {
    for (const id of game.discovered[realm]) {
      if (starterIds.has(id)) continue
      const element = elementById.get(id)
      if (element) crafted.push({ realm, element })
    }
  }

  function recipeFor(element: ElementDef) {
    const options = data.recipes.filter((r) => r.output === element.id)
    if (options.length <= 1) return options[0]
    const takenRoute = game.routes[element.id]
    return options.find((r) => r.route === takenRoute) ?? options[0]
  }

  function handleReset() {
    const confirmed = window.confirm(
      'Reset all progress? Every discovery in both realms will be cleared — this cannot be undone.',
    )
    if (confirmed) game.reset()
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-5 py-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer text-sm font-extrabold text-muted hover:text-ink"
        >
          ← Back
        </button>
        <h1 className="text-lg font-extrabold text-ink">Inventory</h1>
        <span className="w-12" aria-hidden="true" />
      </div>

      {crafted.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm font-semibold text-muted">
            Nothing here yet — combine two elements in a realm to start
            filling this in.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {(['survival', 'everyday'] as RealmId[]).map((realm) => {
            const entries = crafted.filter((c) => c.realm === realm)
            if (entries.length === 0) return null

            return (
              <div key={realm} className="flex flex-col gap-3">
                <p className="text-xs font-extrabold tracking-wide text-muted uppercase">
                  {REALM_LABEL[realm]} · {entries.length} discovered
                </p>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {entries.map(({ element }) => (
                    <ElementTile
                      key={element.id}
                      icon={resolveIcon(element.icon)}
                      label={element.name}
                      onClick={() => setSelected(element)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4 flex flex-col items-center gap-2 border-t border-hairline pt-6">
        <p className="text-xs font-semibold text-muted">
          Starting over clears every discovery in both realms.
        </p>
        <Button variant="secondary" onClick={handleReset}>
          Reset progress
        </Button>
      </div>

      {selected &&
        (() => {
          const recipe = recipeFor(selected)
          return recipe ? (
            <DiscoveryCard
              element={selected}
              recipe={recipe}
              heading="From your Inventory"
              onClose={() => setSelected(null)}
            />
          ) : null
        })()}
    </main>
  )
}
