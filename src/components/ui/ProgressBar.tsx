import { OUTLINE } from './pixelShape'

/**
 * Progress toward a realm's targets.
 *
 * The version this replaces was `rounded-full` with a 300ms width transition —
 * a pill that slid. Two things are wrong with that here. A capsule end cap is
 * a curve, which a pixel grid cannot draw; and a bar that animates smoothly
 * between values is showing intermediate amounts that are not true. You have
 * found two of three things or you have not.
 *
 * So it fills in discrete CELLS, one per target, and snaps. That also makes it
 * readable at a glance without arithmetic: three notches, two lit. A
 * percentage bar makes you divide.
 */

type ProgressBarProps = {
  /** 0-100. Values outside that range are clamped, not rejected. */
  value: number
  /** How many cells to draw. Pass the target count so one cell is one target. */
  cells?: number
  accent?: string
  unit?: number
  className?: string
}

export function ProgressBar({
  value,
  cells = 10,
  accent = '#e8752c',
  unit = 4,
  className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))
  const count = Math.max(1, Math.round(cells))
  // Floor, not round: a cell lights when it is actually earned. Rounding up
  // would show a target as found before it was.
  const lit = Math.floor((pct / 100) * count + 1e-9)

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={className}
      style={{
        display: 'flex',
        gap: unit,
        background: OUTLINE,
        padding: unit,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            height: unit * 4,
            // No transition: a cell is earned or it is not.
            background: i < lit ? accent : '#2a2749',
            boxShadow:
              i < lit
                ? `inset 0 ${unit}px 0 0 rgba(255,255,255,0.28)`
                : `inset 0 ${unit}px 0 0 rgba(0,0,0,0.25)`,
          }}
        />
      ))}
    </div>
  )
}
