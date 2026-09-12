import { useEffect, useRef } from 'react'
import { Card } from './Card'
import { PixelButton } from './PixelButton'
import { playPress } from '../../audio/sfx'

/**
 * A confirm box, built out of the game's own parts.
 *
 * WHY THIS EXISTS
 *
 * Reset used `window.confirm`. A native dialog cannot be styled at all — it
 * arrives as a system-font sheet pinned to the top of the browser window, with
 * the page's URL printed above it. In a game whose standing rule is that
 * everything is 8-bit with no exceptions, it is the single most off-theme
 * thing that can appear on screen, and it appears at the exact moment the
 * player is being asked to trust the game with their progress.
 *
 * It is also a real interaction problem: `window.confirm` blocks the main
 * thread, so the audio and the starfield freeze behind it.
 *
 * The scrim is a flat wash rather than a translucent tint, for the same reason
 * the discovery card's is — a blur or an alpha ramp is the thing this look
 * cannot survive. The world stops and the box is all there is, which is what a
 * console does.
 */

type ConfirmDialogProps = {
  title: string
  /** Optional. Most confirmations do not need one: see the note below. */
  body?: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel = 'cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null)

  /*
   * Focus lands on CANCEL, not confirm.
   *
   * This dialog's confirm destroys every discovery in the game. Focusing the
   * destructive option means a stray Enter — from the keypress that opened the
   * dialog, most likely — wipes the save. Native confirms default to cancel
   * for exactly this reason.
   */
  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{ background: 'rgba(9, 7, 20, 0.82)' }}
    >
      <Card unit={5} className="flex w-full max-w-md flex-col items-center gap-6 py-4 text-center">
        {/*
         * THE QUESTION CARRIES IT, NOT A PARAGRAPH.
         *
         * This had a line of explanation under the title saying every
         * discovery would be wiped and it could not be undone. It went,
         * because it was doing the title's job at a third of the size, and a
         * pixel font set as body copy is hard work to read for something
         * nobody wants to read twice. "start over?" against "keep it" and
         * "wipe it" is the entire decision, and the two labels say the
         * consequence better than a sentence about it.
         */}
        <h2
          id="confirm-title"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            lineHeight: 1.5,
            letterSpacing: '0.04em',
            color: '#ffffff',
            textTransform: 'lowercase',
            // A hard offset, the same one the buttons carry, so the heading
            // sits on the panel rather than floating over it.
            textShadow: '3px 3px 0 #191536',
            margin: 0,
          }}
        >
          {title}
        </h2>
        {body && (
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 9,
              lineHeight: 2,
              color: 'var(--color-muted)',
              textTransform: 'lowercase',
              margin: 0,
            }}
          >
            {body}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-5">
          <PixelButton
            ref={cancelRef}
            tone="default"
            unit={4}
            onClick={() => {
              playPress()
              onCancel()
            }}
          >
            {cancelLabel}
          </PixelButton>
          <PixelButton
            tone="danger"
            unit={4}
            onClick={() => {
              playPress()
              onConfirm()
            }}
          >
            {confirmLabel}
          </PixelButton>
        </div>
      </Card>
    </div>
  )
}
