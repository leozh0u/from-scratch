import { steppedNotch, OUTLINE } from './pixelShape'

/**
 * The left side of the bench: what you have done so far.
 *
 * REBUILT AS A PANEL RATHER THAN A LIST.
 *
 * Leo: "the stats page is a little ugly and hard to read, try to make it maybe
 * in a box or something." It was six rows of label-left, value-right with
 * nothing holding them together, floating on the card, and at this type size
 * that is a column of grey words with numbers a long way from them — the eye
 * has to travel to pair each one up.
 *
 * It is a real inset now: the same staircase silhouette and hard outline as
 * every other surface, sunk rather than raised, because a readout is a hole in
 * the machine and not a control on it. Inside, each stat is its own small
 * block with the number above its label, so the number and the word it belongs
 * to are touching. Two columns, so the block is wide rather than tall and sits
 * beside the slots instead of below them.
 */
export type Stat = {
  label: string
  value: string
  /** The one stat the panel exists for. Larger, white, spans both columns. */
  lead?: boolean
}

const FACE = '#1e1b38'
const EDGE = '#3a3560'

export function StatPanel({ stats, unit = 3 }: { stats: Stat[]; unit?: number }) {
  const lead = stats.find((s) => s.lead)
  const rest = stats.filter((s) => !s.lead)

  return (
    <div
      style={{
        background: OUTLINE,
        clipPath: steppedNotch(unit, 2),
        padding: unit,
      }}
    >
      <div
        style={{
          background: FACE,
          clipPath: steppedNotch(unit, 2),
          padding: unit * 3,
          /*
           * Lit from BELOW, unlike every button in the game. That inversion is
           * the whole reason it reads as recessed rather than as another key
           * somebody forgot to make pressable.
           */
          boxShadow: `inset 0 -${unit}px 0 0 ${EDGE}, inset 0 ${unit}px 0 0 #12102a`,
        }}
      >
        {lead && (
          <div
            className="flex flex-col items-center"
            style={{ marginBottom: unit * 3 }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                lineHeight: 1,
                color: '#ffffff',
                textShadow: '2px 2px 0 #100d20',
              }}
            >
              {lead.value}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 8,
                marginTop: unit * 2,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-muted)',
              }}
            >
              {lead.label}
            </span>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: `${unit * 3}px ${unit * 4}px`,
          }}
        >
          {rest.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 11,
                  lineHeight: 1,
                  color: '#ddd8ff',
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 7,
                  marginTop: unit * 1.5,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
