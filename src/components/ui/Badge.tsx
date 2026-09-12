import type { ReactNode } from 'react'

type BadgeProps = {
  /** Foreground colour, e.g. `var(--color-survival)`. */
  tone: string
  /** Background colour, e.g. `var(--color-survival-soft)`. */
  soft: string
  children: ReactNode
}

/** Pill label — used for the "Tutorial" tag and, later, difficulty/route tags. */
export function Badge({ tone, soft, children }: BadgeProps) {
  return (
    <span
      className=" px-2 py-0.5 text-[0.65rem] font-extrabold tracking-wide uppercase"
      style={{ background: soft, color: tone }}
    >
      {children}
    </span>
  )
}
