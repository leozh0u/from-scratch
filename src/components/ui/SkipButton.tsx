import { useState } from 'react'
import { PixelButton } from './PixelButton'
import { minWidthForSide } from './legend'
import { playPress } from '../../audio/sfx'

/**
 * Skip the tutorial, with the same in-place confirmation reset uses.
 *
 * This used to be a side effect of the Cheater mode, which conflated two
 * different wishes: "let me read the whole graph" and "I have played Survival
 * before, let me past the door". They deserve separate controls, because the
 * second is a perfectly ordinary thing to want on a second sitting and the
 * first is not.
 *
 * Confirmed rather than instant, for the same reason reset is: Survival is
 * fifteen combinations that teach the verb the rest of the game is played
 * with, and skipping it by mis-tapping a corner button is a bad first
 * experience that looks like the game's fault.
 *
 * Once skipped it stays skipped, and it says so — a button that has already
 * done its job and still looks armed is a button people press twice.
 */
export function SkipButton({
  skipped,
  onSkip,
  unit = 3,
}: {
  skipped: boolean
  onSkip: () => void
  unit?: number
}) {
  const [open, setOpen] = useState(false)

  /*
   * The two answers carry no side legend. "Keep it" and "skip it" are already
   * the whole sentence, and a legend under each one only repeats it in smaller
   * type — the legend earns its place on the closed key, where "skip" alone
   * does not say skip WHAT.
   */
  const shared = Math.max(
    minWidthForSide(unit, 'tutorial'),
    minWidthForSide(unit, 'already open'),
  )

  if (skipped) {
    return (
      <PixelButton
        tone="default"
        unit={unit}
        locked
        side="already open"
        style={{ minWidth: shared }}
        aria-label="Survival is already skipped"
      >
        skipped
      </PixelButton>
    )
  }

  if (!open) {
    return (
      <PixelButton
        tone="default"
        unit={unit}
        side="tutorial"
        style={{ minWidth: shared }}
        onClick={() => {
          playPress()
          setOpen(true)
        }}
      >
        skip
      </PixelButton>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {/* The harmless answer first, directly under the finger that just
        * pressed — the same ordering reset uses. */}
      <PixelButton
        tone="default"
        unit={unit}
        style={{ minWidth: shared }}
        onClick={() => {
          playPress()
          setOpen(false)
        }}
      >
        keep it
      </PixelButton>
      <PixelButton
        tone="survival"
        unit={unit}
        style={{ minWidth: shared }}
        onClick={() => {
          playPress()
          setOpen(false)
          onSkip()
        }}
      >
        skip it
      </PixelButton>
    </div>
  )
}
