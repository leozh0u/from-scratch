type ProgressBarProps = {
  /** 0–100. Values outside that range are clamped, not rejected. */
  value: number
  accent?: string
  className?: string
}

export function ProgressBar({
  value,
  accent = 'var(--color-brand)',
  className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-3 w-full overflow-hidden rounded-full bg-hairline ${className}`}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%`, background: accent }}
      />
    </div>
  )
}
