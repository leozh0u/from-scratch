import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary'
type ButtonSize = 'md' | 'lg'

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
} & ButtonHTMLAttributes<HTMLButtonElement>

const SIZE: Record<ButtonSize, string> = {
  md: 'px-5 py-3 text-base',
  lg: 'px-7 py-4 text-lg',
}

/*
 * The press feedback (translate down + shadow collapse) is the one bit of
 * tactile weight carried over from the retro direction, done in a clean
 * idiom instead of a pixel notch: a solid drop shadow that shrinks to almost
 * nothing on press, rather than a hard-edged frame.
 */
const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white shadow-[0_4px_0_var(--color-brand-deep)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-brand-deep)]',
  secondary:
    'border-2 border-hairline bg-white text-ink shadow-[0_4px_0_var(--color-hairline)] hover:border-brand hover:text-brand active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-hairline)]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-row font-extrabold transition-all duration-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-none ${SIZE[size]} ${VARIANT[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
