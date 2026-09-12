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
      /*
       * THE MODE NAME GOES ON THE FACE, "MODE" ON THE SIDE.
       *
       * The other way round is what shipped and it did not fit: the face read
       * "mode" and the side carried the name, so the button was four
       * characters wide and "standard" was clipped to "standarc". A side
       * legend is sized from the button's own width, so a long legend on a
       * short word has nowhere to go.
       *
       * Swapping them fixes it by making the button as wide as the longest
       * thing it has to say, and it reads better anyway — the useful word is
       * which mode you are in, not the word "mode".
       */
      <PixelButton
        tone="default"
        unit={unit}
        side="mode"
        onClick={() => {
          playPress()
          setOpen(true)
        }}
        aria-label={`Mode: ${modeById(mode).label}. Change it.`}
      >
        {modeById(mode).label}
      </PixelButton>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {MODES.map((m) => (
        /*
         * The description rides on the key's own side face, the way the two
         * realm buttons carry theirs — so the list is three objects rather
         * than three objects and three captions, and nothing floats over the
         * artwork behind it.
         */
        <PixelButton
          key={m.id}
          tone={m.id === mode ? 'survival' : 'default'}
          unit={unit}
          side={m.blurb}
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
      ))}
    </div>
  )
}
