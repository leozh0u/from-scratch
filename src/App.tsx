import { useState } from 'react'
import { GAME_DATA } from './data/gameData'
import type { RealmId } from './data/types'
import { Inventory } from './components/Inventory'
import { Processes } from './components/Processes'
import { StartScreen } from './components/StartScreen'
import { StyleguidePage } from './components/StyleguidePage'
import { Workspace } from './components/Workspace'
import { readMode, readSkipped, writeSkipped, modeById, type ModeId } from './game/modes'
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
  const [showProcesses, setShowProcesses] = useState(false)
  const game = useGameState(GAME_DATA)
  /*
   * How much help the game gives. Lives here rather than in useGameState
   * because it is a preference rather than progress: a reset wipes what you
   * made, not how you like to play.
   */
  const [mode, setMode] = useState<ModeId>(() => readMode())
  /*
   * Skipping the tutorial is its own choice now, not a side effect of a mode.
   * Two different wishes were sharing one control: "let me read the whole
   * graph" and "I have played Survival before". The second is an ordinary
   * thing to want on a second sitting.
   */
  const [skipped, setSkipped] = useState(() => readSkipped())

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
    skipped ||
    modeById(mode).revealAll ||
    GAME_DATA.targets.survival.every((id) => game.isDiscovered(id))

  /*
   * Starting over means starting over: the save is wiped, the tutorial is put
   * back in front of the player, and they land on the title screen. Shared by
   * the inventory's button and the one in the title screen's corner, so the
   * two can never drift apart.
   *
   * THE SKIP GOES WITH IT, and it did not used to.
   *
   * I kept it out on the argument that skipping is a preference rather than
   * progress, so wiping what you made should not put the tutorial back in
   * front of somebody who has already played it. Leo: "once its skipped, the
   * reset doenst reset the skip." He is right and the argument was too clever.
   * "Start over" has one plain meaning, a control that leaves something behind
   * is a control nobody can predict, and re-skipping costs one press of a
   * button that is still sitting there.
   */
  function resetEverything() {
    game.reset()
    writeSkipped(false)
    setSkipped(false)
    setShowInventory(false)
    setRealm(null)
  }

  /*
   * Above the inventory in the stack, because it is opened FROM the inventory
   * and closing it should land back there rather than on the title screen.
   */
  if (showProcesses) {
    return (
      <Processes
        data={GAME_DATA}
        game={game}
        revealAll={modeById(mode).revealAll}
        onBack={() => setShowProcesses(false)}
      />
    )
  }

  if (showInventory) {
    return (
      <Inventory
        data={GAME_DATA}
        game={game}
        revealAll={modeById(mode).revealAll}
        onBack={() => setShowInventory(false)}
        onReset={resetEverything}
        onOpenProcesses={() => setShowProcesses(true)}
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
        skipped={skipped}
        onSkip={() => {
          writeSkipped(true)
          setSkipped(true)
        }}
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
