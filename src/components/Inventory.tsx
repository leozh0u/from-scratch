import { useState } from 'react'
import { resolveIcon } from '../data/iconRegistry'
import type { ElementDef, RealmId, RecipeData } from '../data/types'
import type { useGameState } from '../hooks/useGameState'
import { DiscoveryCard } from './DiscoveryCard'
import { Card } from './ui/Card'
import { ElementTile } from './ui/ElementTile'
import { PixelButton } from './ui/PixelButton'
import { ConfirmDialog } from './ui/ConfirmDialog'
import { HudBar } from './ui/HudBar'
import { playPress } from '../audio/sfx'

type InventoryProps = {
  data: RecipeData
  game: ReturnType<typeof useGameState>
  onBack: () => void
  /** Wipes the save AND returns to the title screen — see `confirmReset`. */
  onReset: () => void
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
export function Inventory({ data, game, onBack, onReset }: InventoryProps) {
  const [selected, setSelected] = useState<ElementDef | null>(null)
  const [confirming, setConfirming] = useState(false)

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

  /*
   * Reset is two things, and it was only doing one.
   *
   * Wiping the save is the easy half. The other half is that the player is
   * standing in the inventory looking at a grid that has just emptied, in a
   * realm they have no progress in — which is a confusing place to be put.
   * "Start from scratch" means going back to the beginning, so `onReset`
   * clears the save AND returns to the title screen.
   */
  function confirmReset() {
    setConfirming(false)
    onReset()
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-5 py-8">
      {/* The same opaque HUD strip the workspace uses, so the two screens
        * read as the same machine. */}
      <HudBar className="flex items-center gap-3">
        <PixelButton tone="default" unit={3} onClick={onBack}>
          ← back
        </PixelButton>
        <span className="flex-1" aria-hidden="true" />
        <h1 className="shrink-0 font-display text-[11px] whitespace-nowrap lowercase tracking-wide text-white">
          inventory
        </h1>
        <span className="flex-1" aria-hidden="true" />
        {/* Balances the back button so the heading sits optically centred. */}
        <span className="shrink-0" style={{ width: 92 }} aria-hidden="true" />
      </HudBar>

      {crafted.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-display text-[10px] leading-loose lowercase text-muted">
            nothing here yet. combine two things in a realm.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {(['survival', 'everyday'] as RealmId[]).map((realm) => {
            const entries = crafted.filter((c) => c.realm === realm)
            if (entries.length === 0) return null

            return (
              <div key={realm} className="flex flex-col gap-3">
                <p className="font-display text-[9px] tracking-widest text-muted uppercase">
                  {REALM_LABEL[realm]} · {entries.length} found
                </p>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {entries.map(({ element }) => (
                    <ElementTile
                      key={element.id}
                      icon={resolveIcon(element.icon)}
                      label={element.name}
                      onClick={() => { playPress(); setSelected(element) }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div
        className="mt-4 flex flex-col items-center gap-3 pt-6"
        style={{ borderTop: '4px solid var(--color-hairline)' }}
      >
        <p className="font-display text-[9px] leading-loose lowercase text-muted">
          this wipes both realms.
        </p>
        <PixelButton tone="danger" unit={4} onClick={() => setConfirming(true)}>
          start over
        </PixelButton>
      </div>

      {confirming && (
        <ConfirmDialog
          title="start over?"
          confirmLabel="wipe it"
          cancelLabel="keep it"
          onConfirm={confirmReset}
          onCancel={() => setConfirming(false)}
        />
      )}

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
