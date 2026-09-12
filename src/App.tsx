import { useState } from 'react'
import { GAME_DATA } from './data/gameData'
import type { RealmId } from './data/types'
import { Inventory } from './components/Inventory'
import { StartScreen } from './components/StartScreen'
import { StyleguidePage } from './components/StyleguidePage'
import { Workspace } from './components/Workspace'
import { readMode, modeById, type ModeId } from './game/modes'
import { useGameState } from './hooks/useGameState'

/*
 * Dev-only route, gated so a stray /styleguide hit in production never
 * renders anything — no router dependency needed for one throwaway path.
 */
const isStyleguide =
  import.meta.env.DEV && window.location.pathname === '/styleguide'

/*
 * EVERYTHING IS LOCKED UNTIL SURVIVAL IS FINISHED, AND THE WAY PAST IT IS A
 * MODE RATHER THAN A FLAG.
 *
 * This was a build constant left on so the realm could be iterated on and
 * filmed without playing through Survival first, and a constant left on is
 * exactly the kind of thing that ships. It is gone. The gate is back, and
 * anyone who wants past it picks the Cheater mode in the corner, which says
 * what it is.
 *
 * Computed from discoveries rather than stored as a flag, so it can never
 * disagree with what the player has actually done and survives any reset for
 * free.
 */

function Game() {
  const [realm, setRealm] = useState<RealmId | null>(null)
  // An overlay, not a third state alongside `realm` — closing it returns to
  // whichever screen was already showing, start or workspace, for free.
  const [showInventory, setShowInventory] = useState(false)
  const game = useGameState(GAME_DATA)
  /*
   * How much help the game gives. Lives here rather than in useGameState
   * because it is a preference rather than progress: a reset wipes what you
   * made, not how you like to play.
   */
  const [mode, setMode] = useState<ModeId>(() => readMode())

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
    modeById(mode).skipTutorial ||
    GAME_DATA.targets.survival.every((id) => game.isDiscovered(id))

  /*
   * Starting over means starting over: the save is wiped and the player lands
   * back on the title screen. Shared by the inventory's button and the one in
   * the title screen's corner, so the two can never drift apart.
   */
  function resetEverything() {
    game.reset()
    setShowInventory(false)
    setRealm(null)
  }

  if (showInventory) {
    return (
      <Inventory
        data={GAME_DATA}
        game={game}
        onBack={() => setShowInventory(false)}
        onReset={resetEverything}
      />
    )
  }

  if (realm === null) {
    return (
      <StartScreen
        onSelectRealm={setRealm}
        onOpenInventory={() => setShowInventory(true)}
        everydayUnlocked={everydayUnlocked}
        onReset={resetEverything}
        mode={mode}
        onChangeMode={setMode}
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
      mode={mode}
    />
  )
}

function App() {
  return isStyleguide ? <StyleguidePage /> : <Game />
}

export default App
