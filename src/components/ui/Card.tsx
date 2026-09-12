import type { HTMLAttributes } from 'react'

/** The same panel surface as the start screen's realm-select card. */
export function Card({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-panel bg-white shadow-[0_12px_40px_rgba(20,40,60,0.18)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
