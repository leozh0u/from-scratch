import { PixelButton } from './PixelButton'
import { PixelArt } from '../PixelArt'
import type { Sprite } from '../PixelArt'

/**
 * Give up: show the whole remaining route to the next target.
 *
 * I argued against this and Leo asked for it again, so it is here — but built
 * as the useful half of what he described first, "show how to reach fire or
 * something". It reveals the path and **does not wipe anything**. Being shown
 * the answer is already the cost of asking; deleting what somebody made on top
 * of that is a punishment, and there is no fail state in this game to send a
 * player back from. Adding the wipe is one line if he wants it.
 *
 * A white flag, drawn rather than typed, for the same reason everything else
 * in this UI is drawn.
 */
const FLAG: Sprite = {
  rows: [
    'a..........',
    'abbbbbbb...',
    'abbbbbbbb..',
    'abbbbbbb...',
    'abbbbb.....',
    'a..........',
    'a..........',
    'a..........',
    'aaa........',
  ],
  palette: { a: '#8c86bd', b: '#ffffff' },
}

export function GiveUpButton({
  onClick,
  disabled,
  block,
}: {
  onClick: () => void
  disabled?: boolean
  /** Fills its column, so this key and the other one are the same width. */
  block?: boolean
}) {
  return (
    <PixelButton
      tone="danger"
      unit={3}
      block={block}
      locked={disabled}
      side="show me"
      onClick={onClick}
      icon={<PixelArt sprite={FLAG} scale={2} />}
      aria-label="Give up and show the route"
    >
      give up
    </PixelButton>
  )
}
