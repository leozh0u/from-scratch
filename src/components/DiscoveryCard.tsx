import { useEffect } from 'react'
import { resolveIcon } from '../data/iconRegistry'
import { dedupeSources } from '../data/sources'
import type { ElementDef, RecipeDef } from '../data/types'
import { PixelArt } from './PixelArt'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

type DiscoveryCardProps = {
  element: ElementDef
  recipe: RecipeDef
  onClose: () => void
  /**
   * Overrides the "New discovery" eyebrow. The Codex reuses this exact card
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discovery-name"
    >
      <Card className="flex w-full max-w-sm flex-col items-center gap-3 p-8 text-center">
        <p className="text-xs font-extrabold tracking-wide text-brand uppercase">
          {heading}
        </p>

        <PixelArt sprite={resolveIcon(element.icon)} scale={6} />

        <h2 id="discovery-name" className="text-2xl font-extrabold text-ink">
          {element.name}
        </h2>

        <p className="text-sm font-semibold text-muted">via {recipe.process}</p>

        {element.blurb && (
          <p className="text-sm leading-snug text-ink">{element.blurb}</p>
        )}

        {sources.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-hairline px-3 py-1 text-xs font-bold text-muted transition-colors duration-150 hover:border-brand hover:text-brand"
              >
                ⓘ {source.label}
              </a>
            ))}
          </div>
        )}

        <Button onClick={onClose} className="mt-2 w-full">
          Continue
        </Button>
      </Card>
    </div>
  )
}
