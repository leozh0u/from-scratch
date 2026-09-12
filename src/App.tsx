import { StartScreen } from './components/StartScreen'
import { StyleguidePage } from './components/StyleguidePage'

/*
 * Dev-only route, gated so a stray /styleguide hit in production never
 * renders anything — no router dependency needed for one throwaway path.
 */
const isStyleguide =
  import.meta.env.DEV && window.location.pathname === '/styleguide'

function App() {
  return isStyleguide ? <StyleguidePage /> : <StartScreen />
}

export default App
