import { useState } from 'react'
import { resolveIcon } from '../data/iconRegistry'
import type { ElementDef, RealmId, RecipeData } from '../data/types'
import type { useGameState } from '../hooks/useGameState'
import { DiscoveryCard } from './DiscoveryCard'
import { ElementTile, TILE_WIDTH } from './ui/ElementTile'
import { PixelButton } from './ui/PixelButton'
import { BackArrow } from './ui/BackArrow'
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
  everyday: 'Everything',
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

  /*
   * EVERYTHING THAT CAN BE MADE, NOT ONLY WHAT HAS BEEN MADE.
   *
   * This used to list discoveries alone, so an empty inventory said "nothing
   * here yet" and a full one told you nothing about what was left. With 72
   * elements and over 97% of pairs producing nothing, the hardest thing about
   * the game is not knowing what you are aiming at.
   *
   * Now it lists every element that is the output of some recipe, found or
   * not, split by realm and counted. Scrolling it is the closest thing the
   * game has to a map.
   *
   * Starters are excluded on purpose: they were handed to you, not made, and
   * they are already sitting on the shelf in the realm.
   */
  const craftable: Record<RealmId, ElementDef[]> = { survival: [], everyday: [] }
  {
    const madeSomewhere = new Set(data.recipes.map((r) => r.output))
    for (const element of data.elements) {
      if (starterIds.has(element.id)) continue
      if (!madeSomewhere.has(element.id)) continue
      craftable[element.realm].push(element)
    }
  }

  const isFound = (id: string) =>
    game.discovered.survival.includes(id) || game.discovered.everyday.includes(id)

  const foundCount = (realm: RealmId) => craftable[realm].filter((e) => isFound(e.id)).length

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
          <BackArrow unit={3} />
          back
        </PixelButton>
        <span className="flex-1" aria-hidden="true" />
        {/*
          * Sized like the workspace's realm title, not at a fixed 11px.
          *
          * It was the smallest thing in a bar built out of slabs, which made
          * the name of the screen read as a caption on the back button. The
          * same clamp the workspace uses keeps it the largest thing in the
          * bar on a laptop and still clear of the button on a phone.
          */}
        <h1
          className="min-w-0 overflow-hidden whitespace-nowrap uppercase text-white"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(9px, 1.9vw, 22px)',
            letterSpacing: '0.04em',
          }}
        >
          inventory
        </h1>
        <span className="flex-1" aria-hidden="true" />
        {/*
         * No fixed-width spacer here to balance the back button.
         *
         * There was one, 92px and `shrink-0`, and on a narrow screen it was the
         * only thing on the page overflowing the viewport - an invisible span
         * pushing a horizontal scrollbar onto a phone. The two flex spacers
         * centre the heading in what is left, which is half a button off true
         * and costs nothing.
         */}
      </HudBar>

      <div className="flex flex-col gap-8">
        {(['survival', 'everyday'] as RealmId[]).map((realm) => {
          const entries = craftable[realm]
          if (entries.length === 0) return null
          const found = foundCount(realm)

          return (
            <div key={realm} className="flex flex-col gap-3">
              <p className="font-display text-[9px] tracking-widest text-muted uppercase">
                {REALM_LABEL[realm]} · {found} of {entries.length}
              </p>
              <div
                className="grid justify-center gap-3"
                style={{ gridTemplateColumns: `repeat(auto-fill, ${TILE_WIDTH}px)` }}
              >
                {entries.map((element) => {
                  const found = isFound(element.id)
                  return (
                    <ElementTile
                      key={element.id}
                      icon={resolveIcon(element.icon)}
                      label={element.name}
                      locked={!found}
                      // A locked tile is not a button. There is nothing to
                      // show yet, and a card that said "you have not made
                      // this" would be a worse answer than no card.
                      onClick={found ? () => { playPress(); setSelected(element) } : undefined}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div
        className="mt-4 flex flex-col items-center gap-3 pt-6"
        style={{ borderTop: '4px solid var(--color-hairline)' }}
      >
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
