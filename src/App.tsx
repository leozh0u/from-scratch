import { useState } from 'react'
import { GAME_DATA } from './data/gameData'
import type { RealmId } from './data/types'
import { Inventory } from './components/Inventory'
import { StartScreen } from './components/StartScreen'
import { StyleguidePage } from './components/StyleguidePage'
import { Workspace } from './components/Workspace'
import { useGameState } from './hooks/useGameState'

/*
 * Dev-only route, gated so a stray /styleguide hit in production never
 * renders anything — no router dependency needed for one throwaway path.
 */
const isStyleguide =
  import.meta.env.DEV && window.location.pathname === '/styleguide'

/**
 * TEMPORARY: both realms open, regardless of progress.
 *
 * The gate itself is intact just below — Everyday is meant to stay locked
 * until Survival's targets are done, and the recipe graph genuinely requires
 * that order (Everyday's aluminium chain cokes crude oil over Survival's
 * fire). This only short-circuits the check.
 *
 * It is on because the realm needs to be iterated on and filmed, and playing
 * through Survival before every look at it is minutes an hour that nobody
 * has. Set it back to false before submitting — the progression is part of
 * the design, not scaffolding.
 */
const UNLOCK_EVERYTHING = true

function Game() {
  const [realm, setRealm] = useState<RealmId | null>(null)
  // An overlay, not a third state alongside `realm` — closing it returns to
  // whichever screen was already showing, start or workspace, for free.
  const [showInventory, setShowInventory] = useState(false)
  const game = useGameState(GAME_DATA)

  /*
   * Survival is the tutorial; Everyday is the real game. Locking Everyday
   * until Survival's targets are done is what makes Survival a tutorial
   * rather than a menu option people skip — and it is why Survival starts
   * with a deliberately small inventory.
   *
   * Computed from discoveries rather than stored as a flag, so it can never
   * disagree with what the player has actually done and survives any reset
   * for free.
   */
  const everydayUnlocked =
    UNLOCK_EVERYTHING ||
    GAME_DATA.targets.survival.every((id) => game.isDiscovered(id))

  if (showInventory) {
    return <Inventory data={GAME_DATA} game={game} onBack={() => setShowInventory(false)} />
  }

  if (realm === null) {
    return (
      <StartScreen
        onSelectRealm={setRealm}
        onOpenInventory={() => setShowInventory(true)}
        everydayUnlocked={everydayUnlocked}
      />
    )
  }

  return (
    <Workspace
      realm={realm}
      data={GAME_DATA}
      game={game}
      onBack={() => setRealm(null)}
      onOpenInventory={() => setShowInventory(true)}
    />
  )
}

function App() {
  return isStyleguide ? <StyleguidePage /> : <Game />
}

export default App
