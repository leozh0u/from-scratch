/**
 * How much of this realm is made.
 *
 * The goal in Everything is to make everything, and a goal you cannot see is
 * not a goal — the three-target bar says nothing about the other sixty-odd.
 * So the bench carries a running count, in the same slab language as
 * everything else rather than as a floating caption.
 *
 * Two sizes of type on purpose: the number you are watching is large, the
 * total it is climbing toward is small. A pair of equal numbers reads as a
 * fraction to be parsed; this reads as a score.
 */
export function MadeCount({ found, total }: { found: number; total: number }) {
  return (
    <span
      className="flex flex-col items-center leading-none"
      aria-label={`${found} of ${total} made`}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          color: '#ffffff',
          textShadow: '2px 2px 0 #100d20',
        }}
      >
        {found}
      </span>
      <span
        aria-hidden="true"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 9,
          marginTop: 6,
          color: 'var(--color-muted)',
          letterSpacing: '0.08em',
        }}
      >
        of {total}
      </span>
    </span>
  )
}
