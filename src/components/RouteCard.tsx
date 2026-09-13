import { Card } from './ui/Card'
import { Overlay } from './ui/Overlay'
import { PixelButton } from './ui/PixelButton'
import { playPress } from '../audio/sfx'

/**
 * The rest of the way, on its own panel.
 *
 * A route is as long as it is — seven steps deep in places, and longer the
 * further into Everything the player has got — so printing it into the bench
 * moved every tile in the inventory down by however many steps happened to be
 * left. It is also the one thing here nobody reads while doing something else;
 * a panel is the right shape for it.
 *
 * Generated from the recipe graph rather than stored, so it cannot go stale as
 * the graph grows, and it lists only the steps still missing rather than
 * replaying what the player has already done. See solver/hint.ts.
 */
type RouteCardProps = {
  target: string
  steps: string[]
  onClose: () => void
}

export function RouteCard({ target, steps, onClose }: RouteCardProps) {
  return (
    <Overlay onClose={onClose} labelledBy="route-target" className="px-5 py-8">
      <Card unit={5} className="flex w-full max-w-md flex-col items-center gap-4 text-center">
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 9,
            letterSpacing: '0.16em',
            color: 'var(--color-brand)',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          the rest of the way
        </p>

        <h2
          id="route-target"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            lineHeight: 1.6,
            color: '#ffffff',
            textShadow: '2px 2px 0 #100d20',
            textTransform: 'lowercase',
            margin: 0,
          }}
        >
          {target.toLowerCase()}
        </h2>

        {/*
         * Scrolls inside the panel rather than growing it. A deep route can be
         * a dozen steps and the panel has to stay on the screen of the phone
         * it is being read on.
         */}
        <ol
          className="m-0 flex w-full list-none flex-col gap-1 p-0 text-center"
          style={{ maxHeight: '46vh', overflowY: 'auto' }}
        >
          {steps.map((line, i) => (
            <li
              key={line}
              className="font-display text-[9px] leading-[1.9] lowercase"
              /* The last step is the target itself, so it is the one in white. */
              style={{ color: i === steps.length - 1 ? '#ffffff' : '#b9b3e0' }}
            >
              {line}
            </li>
          ))}
        </ol>

        <PixelButton
          tone="default"
          unit={4}
          onClick={() => {
            playPress()
            onClose()
          }}
        >
          got it
        </PixelButton>
      </Card>
    </Overlay>
  )
}
