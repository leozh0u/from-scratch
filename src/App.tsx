import { useState } from 'react'
import { GAME_DATA } from './data/gameData'
import type { RealmId } from './data/types'
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

function Game() {
  const [realm, setRealm] = useState<RealmId | null>(null)
  const game = useGameState(GAME_DATA)

  if (realm === null) {
    return <StartScreen onSelectRealm={setRealm} />
  }

  return (
    <Workspace
      realm={realm}
      data={GAME_DATA}
      game={game}
      onBack={() => setRealm(null)}
    />
  )
}

function App() {
  return isStyleguide ? <StyleguidePage /> : <Game />
}

export default App
