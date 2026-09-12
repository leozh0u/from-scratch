import { useEffect } from 'react'
import { resolveIcon } from '../data/iconRegistry'
import { dedupeSources } from '../data/sources'
import type { ElementDef, RecipeDef } from '../data/types'
import { PixelArt } from './PixelArt'
import { PixelButton } from './ui/PixelButton'
import { playPress, playHover } from '../audio/sfx'
import { Card } from './ui/Card'

type DiscoveryCardProps = {
  element: ElementDef
  recipe: RecipeDef
  onClose: () => void
  /**
   * Overrides the "New discovery" eyebrow. The Inventory reuses this exact card
   * to reopen something found long ago — telling the player it's "new" at
   * that point would just be wrong.
   */
  heading?: string
}

/**
 * Full-screen celebration on a genuine new discovery — the loud moment the
 * inline status line (already-known / no-match) deliberately isn't. Sources
 * come from both the recipe (the process/cost claim) and the element (the
 * blurb), deduped by URL since step 15's real data may cite the same source
 * for both.
 */
export function DiscoveryCard({ element, recipe, onClose, heading = 'New discovery' }: DiscoveryCardProps) {
  const sources = dedupeSources(recipe.sources, element.sources)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discovery-name"
      style={{
        /*
         * A flat wash, not a translucent tint over a blur. The old backdrop
         * was `bg-ink/50`, and once `ink` became white for the dark theme that
         * turned into a white veil over the whole screen. A solid dark scrim
         * at high opacity is also simply what a console does — the world stops
         * and the box is all there is.
         */
        background: 'rgba(9, 7, 20, 0.82)',
      }}
    >
      <Card
        unit={5}
        className="flex w-full max-w-sm flex-col items-center gap-3 text-center"
      >
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
          {heading}
        </p>

        <PixelArt sprite={resolveIcon(element.icon)} scale={6} />

        <h2
          id="discovery-name"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            lineHeight: 1.4,
            color: '#ffffff',
            textShadow: '3px 3px 0 #100d20',
            textTransform: 'lowercase',
            margin: 0,
          }}
        >
          {element.name}
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 9,
            lineHeight: 1.8,
            color: 'var(--color-muted)',
            textTransform: 'lowercase',
            margin: 0,
          }}
        >
          via {recipe.process}
        </p>

        {element.blurb && (
          /*
           * Pixel face here too. No exceptions to the theme.
           *
           * Press Start 2P was not designed for running text, so this buys the
           * legibility back with spacing instead of with a different typeface:
           * a generous line height and a measure capped well short of the
           * panel width. Long prose in a pixel font fails when the lines are
           * long and tight, not because the letters are wrong.
           */
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 10,
              lineHeight: 2.1,
              letterSpacing: '0.02em',
              color: '#ded9f5',
              textTransform: 'lowercase',
              maxWidth: '30ch',
              margin: 0,
            }}
          >
            {element.blurb}
          </p>
        )}

        {sources.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                onPointerEnter={playHover}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 8,
                  lineHeight: 1.8,
                  textTransform: 'lowercase',
                  color: 'var(--color-muted)',
                  border: '3px solid var(--color-hairline)',
                  background: 'var(--color-panel-deep)',
                  padding: '5px 10px',
                  textDecoration: 'none',
                }}
              >
                ⓘ {source.label}
              </a>
            ))}
          </div>
        )}

        <PixelButton
          tone="survival"
          unit={5}
          block
          onClick={() => {
            playPress()
            onClose()
          }}
          style={{ marginTop: 8 }}
        >
          continue
        </PixelButton>
      </Card>
    </div>
  )
}
