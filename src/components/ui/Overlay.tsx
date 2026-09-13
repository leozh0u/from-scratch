import { useEffect, type ReactNode } from 'react'

/**
 * The scrim every full-screen panel in the game sits on.
 *
 * A flat wash, not a translucent tint over a blur. A blur or an alpha ramp is
 * the one thing this look cannot survive, and a solid dark scrim is simply
 * what a console does: the world stops and the box is all there is.
 *
 * Extracted because there were four copies of it — discovery, receipt,
 * confirm, and now the two panels the bench opens — each with its own
 * Escape handler, and a fifth copy is how one of them ends up not closing on
 * Escape.
 */
export const SCRIM = 'rgba(9, 7, 20, 0.82)'

type OverlayProps = {
  onClose: () => void
  /** id of the element naming this panel, for screen readers. */
  labelledBy?: string
  /** Extra classes on the positioning layer — padding, mostly. */
  className?: string
  children: ReactNode
}

export function Overlay({ onClose, labelledBy, className = 'px-5', children }: OverlayProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      style={{ background: SCRIM }}
    >
      {children}
    </div>
  )
}
