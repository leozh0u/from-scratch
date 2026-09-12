import { useState } from 'react'
import { PixelButton } from './PixelButton'
import { minWidthForSide } from './legend'
import { playPress } from '../../audio/sfx'

/**
 * Reset, opening into its own confirmation rather than a dialog.
 *
 * It used to throw a modal over the whole screen, which is a lot of ceremony
 * for a button in a corner — and the modal had to restate what the button
 * already said. Leo liked how the mode picker opens in place, so this does the
 * same: press it and the two answers appear under it, at the same width, in
 * the same slab language.
 *
 * The destructive answer is still the one you have to reach for. "Keep it"
 * comes first and sits directly under the finger that just pressed, so the
 * accidental second tap is the harmless one.
 */
const OPTIONS = [
  { id: 'keep', label: 'keep it', blurb: 'nothing happens', tone: 'default' as const },
  { id: 'wipe', label: 'wipe it', blurb: 'both realms go', tone: 'danger' as const },
]

export function ResetButton({ onReset, unit = 3 }: { onReset: () => void; unit?: number }) {
  const [open, setOpen] = useState(false)

  // One width for both answers and for the closed key, so the corner does not
  // change shape as it opens. Taken from the widest legend rather than picked.
  const shared = Math.max(
    minWidthForSide(unit, 'start over'),
    ...OPTIONS.map((o) => minWidthForSide(unit, o.blurb)),
  )

  if (!open) {
    return (
      <PixelButton
        tone="danger"
        unit={unit}
        side="start over"
        style={{ minWidth: shared }}
        onClick={() => {
          playPress()
          setOpen(true)
        }}
      >
        reset
      </PixelButton>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {OPTIONS.map((o) => (
        <PixelButton
          key={o.id}
          tone={o.tone}
          unit={unit}
          side={o.blurb}
          style={{ minWidth: shared }}
          onClick={() => {
            playPress()
            setOpen(false)
            if (o.id === 'wipe') onReset()
          }}
        >
          {o.label}
        </PixelButton>
      ))}
    </div>
  )
}
