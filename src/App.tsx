import { useState } from 'react'
import { SEED_DATA } from './data/seed'
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

/*
 * SEED_DATA stands in for the real recipe graph until verified Survival and
 * Everyday data exist (steps 11 and 15) — swapping it out is the only change
 * this file will need then.
 */
function Game() {
  const [realm, setRealm] = useState<RealmId | null>(null)
  const game = useGameState(SEED_DATA)

  if (realm === null) {
    return <StartScreen onSelectRealm={setRealm} />
  }

  return (
    <Workspace
      realm={realm}
      data={SEED_DATA}
      game={game}
      onBack={() => setRealm(null)}
    />
  )
}

function App() {
  return isStyleguide ? <StyleguidePage /> : <Game />
}

export default App
