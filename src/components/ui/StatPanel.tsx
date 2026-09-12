/**
 * The left side of the bench: what you have done so far.
 *
 * The panel is as wide as the two bars above it and the controls used the
 * middle of it, which Leo's note — "i dont like when its too empty" — is
 * about. Numbers are the right thing to put there rather than decoration,
 * because the goal in Everything is now to make everything, and a completion
 * goal with no running tally is a goal you are asked to hold in your head.
 *
 * Laid out as a column of rows rather than a grid: three short lines read
 * faster than a 3x2 arrangement at this size, and pixel type wants the
 * horizontal space more than it wants the vertical.
 */
type Stat = { label: string; value: string; bright?: boolean }

export function StatPanel({ stats }: { stats: Stat[] }) {
  return (
    <dl className="m-0 flex flex-col gap-2">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-baseline justify-between gap-3">
          <dt
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 8,
              letterSpacing: '0.08em',
              textTransform: 'lowercase',
              color: 'var(--color-muted)',
              margin: 0,
            }}
          >
            {stat.label}
          </dt>
          <dd
            style={{
              fontFamily: 'var(--font-display)',
              // The number is the thing being read, so it is the thing that
              // is large. A label and a value at one size is a table.
              fontSize: stat.bright ? 14 : 11,
              lineHeight: 1,
              color: stat.bright ? '#ffffff' : '#b9b3e0',
              textShadow: stat.bright ? '2px 2px 0 #100d20' : 'none',
              margin: 0,
            }}
          >
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
