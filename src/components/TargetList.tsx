import { resolveIcon } from '../data/iconRegistry'
import type { ElementDef } from '../data/types'
import { PixelArt } from './PixelArt'
import { steppedNotch, OUTLINE } from './ui/pixelShape'

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
        /*
         * Found is a warm accent, not a brighter navy. These sit over a forest
         * and against each other, and a slightly lighter blue is not something
         * anyone can pick out at a glance — which defeats the only job this
         * list has.
         */
        const face = found ? '#c96a22' : '#2e2b4f'
        const hi = found ? '#eb9a52' : '#413d69'
        const lo = found ? '#8f4413' : '#211e3c'
        return (
          <li
            key={target.id}
            style={{
              background: OUTLINE,
              clipPath: steppedNotch(3, 2),
              padding: 3,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '6px 10px',
                minWidth: 64,
                background: face,
                boxShadow: `inset 0 3px 0 0 ${hi}, inset 0 -3px 0 0 ${lo}`,
              }}
            >
              <div style={{ height: 22, display: 'flex', alignItems: 'center' }}>
                {found ? (
                  <PixelArt sprite={resolveIcon(target.icon)} scale={2} />
                ) : (
                  <span
                    aria-hidden="true"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 12,
                      color: '#6f6c9a',
                    }}
                  >
                    ?
                  </span>
                )}
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 7,
                  lineHeight: 1.6,
                  textAlign: 'center',
                  textTransform: 'lowercase',
                  color: '#ffffff',
                  textShadow: `2px 2px 0 ${lo}`,
                }}
              >
                {target.name}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
