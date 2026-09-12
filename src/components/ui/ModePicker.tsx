import { useState } from 'react'
import { PixelButton } from './PixelButton'
import { MODES, modeById, writeMode, type ModeId } from '../../game/modes'
import { playPress } from '../../audio/sfx'

/**
 * The mode picker, in the corner beside mute and reset.
 *
 * Closed it is one key showing the current mode, because two of the three
 * players who open this screen will never change it and a row of three
 * permanent buttons in the corner would be the loudest thing on the title
 * screen. Open it is the three, stacked, each with a line saying what it
 * actually does — "purist" means nothing on its own.
 */
export function ModePicker({
  mode,
  onChange,
  unit = 3,
}: {
  mode: ModeId
  onChange: (id: ModeId) => void
  unit?: number
}) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <PixelButton
        tone="default"
        unit={unit}
        side={modeById(mode).label}
        onClick={() => {
          playPress()
          setOpen(true)
        }}
        aria-label={`Mode: ${modeById(mode).label}. Change it.`}
      >
        mode
      </PixelButton>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {MODES.map((m) => (
        <div key={m.id} className="flex flex-col items-end gap-1">
          <PixelButton
            tone={m.id === mode ? 'survival' : 'default'}
            unit={unit}
            aria-pressed={m.id === mode}
            onClick={() => {
              playPress()
              writeMode(m.id)
              onChange(m.id)
              setOpen(false)
            }}
          >
            {m.label}
          </PixelButton>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 8,
              lineHeight: 1.6,
              color: 'var(--color-muted)',
              textTransform: 'lowercase',
              textAlign: 'right',
              maxWidth: 150,
            }}
          >
            {m.blurb}
          </span>
        </div>
      ))}
    </div>
  )
}
