import { useState } from 'react'
import { resolveIcon } from '../data/iconRegistry'
import type { ElementDef, RealmId, RecipeData } from '../data/types'
import type { useGameState } from '../hooks/useGameState'
import { DiscoveryCard } from './DiscoveryCard'
import { ElementTile, TILE_WIDTH } from './ui/ElementTile'
import { PixelButton } from './ui/PixelButton'
import { BackArrow } from './ui/BackArrow'
import { ResetButton } from './ui/ResetButton'
import { HudBar } from './ui/HudBar'
import { playPress } from '../audio/sfx'
import { useViewport } from '../hooks/useViewport'

type InventoryProps = {
  data: RecipeData
  game: ReturnType<typeof useGameState>
  onBack: () => void
  /** Wipes the save AND returns to the title screen — see `confirmReset`. */
  onReset: () => void
  /**
   * Through to the process record.
   *
   * It hangs off the inventory rather than the title screen because the two
   * are the same kind of thing — the inventory is what you have made, this is
   * what you have DONE to make it — and because the title screen is the one
   * place where another button would cost the layout something.
   */
  onOpenProcesses: () => void
  /**
   * Cheater mode: treat every element as found, so the inventory becomes a
   * reference book rather than a record. Never written to the save — turning
   * it off gives back exactly the game that was there.
   */
  revealAll?: boolean
  /**
   * A world's inventory, in place of the two realms. A world shares the
   * thousand-element graph, so the realm split would list all of it under
   * "Everything · 4 of 1,000" for a planet whose whole job is thirteen things.
   * It lists the kit's parts instead, and whatever else was made on the way.
   */
  sections?: { label: string; ids: string[] }[]
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
export function Inventory({
  data,
  game,
  onBack,
  onReset,
  onOpenProcesses,
  revealAll = false,
  sections,
}: InventoryProps) {
  /*
   * The bar's keys step down on a narrow screen, and the back key drops its
   * word below 380px.
   *
   * Without it the two buttons take the whole strip: at 320px they wanted 207
   * of the 252 available and the title was left with nine pixels, so it
   * clipped however it was sized. An arrow on its own is still an unambiguous
   * back control; a screen name nobody can read is not a title.
   */
  const { width: viewportWidth } = useViewport()
  const hudUnit = viewportWidth < 520 ? 2 : 3
  const [selected, setSelected] = useState<ElementDef | null>(null)

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
    revealAll ||
    game.discovered.survival.includes(id) ||
    game.discovered.everyday.includes(id)

  /** What was genuinely made, for the counter, which should not lie. */
  const isReallyFound = (id: string) =>
    game.discovered.survival.includes(id) || game.discovered.everyday.includes(id)

  const byId = new Map(data.elements.map((element) => [element.id, element]))
  const shelves = sections
    ? sections.map((section) => ({
        key: section.label,
        label: section.label,
        entries: section.ids.flatMap((id) => byId.get(id) ?? []),
      }))
    : (['survival', 'everyday'] as RealmId[]).map((realm) => ({
        key: realm,
        label: REALM_LABEL[realm],
        entries: craftable[realm],
      }))

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
    onReset()
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-5 py-8">
      {/* The same opaque HUD strip the workspace uses, so the two screens
        * read as the same machine. */}
      <HudBar className="flex items-center gap-3">
        <PixelButton tone="default" unit={hudUnit} onClick={onBack} aria-label="Back">
          <BackArrow unit={hudUnit} />
          {viewportWidth >= 380 && 'back'}
        </PixelButton>
        {/*
         * SIZED BY THE ROOM IT HAS, NOT BY THE WINDOW.
         *
         * `clamp(9px, 1.9vw, 22px)` is a guess about how much of the viewport
         * the buttons either side will take, and the guess broke the moment a
         * second button arrived: "INVENTORY" lost its last letters on every
         * phone. This wrapper is the flexible element AND the container the
         * type is measured against, which breaks the circularity — its width
         * comes from the row, never from the text inside it.
         *
         * Press Start 2P advances exactly 1em a character and this carries
         * 0.04em of tracking, so nine characters need 9.36 times the font
         * size. Dividing the wrapper's own width by that cannot clip.
         */}
        <div
          className="flex min-w-0 flex-1 justify-center"
          style={{ containerType: 'inline-size' }}
        >
          <h1
            className="overflow-hidden whitespace-nowrap uppercase text-white"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(7px, 100cqw / 9.36, 22px)',
              letterSpacing: '0.04em',
              margin: 0,
            }}
          >
            inventory
          </h1>
        </div>
        {/*
         * A real control where an invisible spacer used to be.
         *
         * There was a 92px `shrink-0` span here to balance the back button,
         * and on a narrow screen it was the only thing on the page overflowing
         * the viewport — an invisible element pushing a horizontal scrollbar
         * onto a phone. This does the same balancing job and is something you
         * can press.
         */}
        <PixelButton
          tone="default"
          unit={hudUnit}
          onClick={() => {
            playPress()
            onOpenProcesses()
          }}
        >
          processes
        </PixelButton>
      </HudBar>

      <div className="flex flex-col gap-8">
        {shelves.map(({ key, label, entries }) => {
          if (entries.length === 0) return null
          const found = entries.filter((e) => isReallyFound(e.id)).length

          return (
            <div key={key} className="flex flex-col gap-3">
              <p className="font-display text-[9px] tracking-widest text-muted uppercase">
                {label} · {found} of {entries.length}
              </p>
              <div
                className="grid justify-items-center gap-3"
                style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${TILE_WIDTH}px, 1fr))` }}
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
        {/* The same in-place confirmation the title screen's corner uses, so
          * the two ways of wiping a save behave identically. A modal here and
          * a drop-down there would be two designs for one decision. */}
        <ResetButton onReset={confirmReset} unit={4} />
      </div>

      {selected &&
        (() => {
          const recipe = recipeFor(selected)
          return recipe ? (
            <DiscoveryCard
              element={selected}
              recipe={recipe}
              heading={revealAll ? 'What it is made of' : 'From your Inventory'}
              /*
               * WALKING THE TREE DOWNWARD.
               *
               * The card names the two things that make this one; clicking
               * either opens ITS card, and so on until you hit something with
               * no recipe, which is a starter. That turns the inventory from a
               * list into the thing a player actually wants at 213 elements:
               * a way to ask "and what makes THAT?" without leaving the panel.
               *
               * Offered only for inputs that are themselves open, so it never
               * becomes a spoiler machine in normal play. In Cheater
               * everything is open, which is the whole point of Cheater.
               */
              openInput={(id) => {
                const next = data.elements.find((e) => e.id === id)
                if (!next || !isFound(next.id)) return
                playPress()
                setSelected(next)
              }}
              inputIsOpen={(id) => isFound(id)}
              nameOf={(id) => data.elements.find((e) => e.id === id)?.name ?? id}
              onClose={() => setSelected(null)}
            />
          ) : null
        })()}
    </main>
  )
}
