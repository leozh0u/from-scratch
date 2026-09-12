import { resolveIcon } from '../data/iconRegistry'
import type { ElementDef } from '../data/types'
import { PixelArt } from './PixelArt'

type TargetListProps = {
  targets: ElementDef[]
  discoveredIds: Set<string>
}

/**
 * The goal list for a realm. Names stay visible even before discovery — the
 * mystery is in the recipe, not in what you're aiming for — but the icon
 * stays a "?" silhouette until found, so the reveal still lands.
 */
export function TargetList({ targets, discoveredIds }: TargetListProps) {
  return (
    <ul className="flex flex-wrap justify-center gap-3" aria-label="Targets">
      {targets.map((target) => {
        const found = discoveredIds.has(target.id)
        return (
          <li
            key={target.id}
            className={`flex flex-col items-center gap-1 rounded-row border-2 px-3 py-2 ${
              found ? 'border-brand bg-brand-soft' : 'border-hairline bg-white'
            }`}
          >
            <div className="flex size-8 items-center justify-center">
              {found ? (
                <PixelArt sprite={resolveIcon(target.icon)} scale={2} />
              ) : (
                <span className="text-lg text-muted" aria-hidden="true">
                  ?
                </span>
              )}
            </div>
            <span
              className={`text-xs font-bold ${found ? 'text-brand' : 'text-muted'}`}
            >
              {target.name}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
