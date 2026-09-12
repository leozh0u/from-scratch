import { useState } from 'react'
import type { RealmId } from '../data/types'
import { PixelEarth } from './PixelEarth'
import { Starfield } from './Starfield'
import { PixelButton } from './ui/PixelButton'
import { ConfirmDialog } from './ui/ConfirmDialog'
import { ArcTitle } from './ArcTitle'
import { startScreenLayout } from './startLayout'
import { useViewport } from '../hooks/useViewport'

/**
 * The title screen: a planet in space, and two ways into it.
 *
 * This replaces a light-blue parallax meadow with clean white cards on it. The
 * old version followed the codebase's stated split — 8-bit scene, modern panel
 * on top — and that split is the thing being deliberately abandoned. A card
 * with a soft shadow sitting on pixel art is what every template looks like;
 * committing completely to being a game is the part nobody else will have.
 * See DESIGN.md.
 *
 * PROGRESSION
 *
 * Survival is the tutorial and Everyday is the real game, so Everyday stays
 * locked until Survival's targets are done. The locked button is dimmed but
 * fully legible and still says what it is — a lock the player cannot read is
 * not a goal, it is just a wall.
 */

/** Sprite-pixel dimensions of the globe. Scaled up by whole numbers only. */
const EARTH_PIXELS = 72

type StartScreenProps = {
  onSelectRealm: (realm: RealmId) => void
  onOpenInventory: () => void
  /** Survival's targets are all discovered — Everyday is playable. */
  everydayUnlocked: boolean
  /** Wipes both realms. Confirmed first, always. */
  onReset: () => void
}

/** One quiet line under a realm button. Deliberately small: it is a label. */
function RealmCaption({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-center font-display lowercase"
      style={{
        fontSize: 9,
        lineHeight: 1.5,
        letterSpacing: '0.06em',
        /*
         * Brighter than it looks like it needs to be, with a shadow on all
         * four sides. The lower caption lands on the planet, and pale lilac on
         * bright green is unreadable however good it looks against the sky.
         * Four offsets rather than a glow: a blur would be the one thing this
         * whole look cannot have.
         */
        color: '#e6e2ff',
        textShadow:
          '2px 2px 0 #191536, -2px 2px 0 #191536, 2px -2px 0 #191536, -2px -2px 0 #191536',
        margin: 0,
      }}
    >
      {children}
    </p>
  )
}

export function StartScreen({
  onSelectRealm,
  onOpenInventory,
  everydayUnlocked,
  onReset,
}: StartScreenProps) {
  const { width, height } = useViewport()
  const [confirming, setConfirming] = useState(false)

  /*
   * Every size on this screen comes from one place, and it reads BOTH axes.
   *
   * It used to read width alone, which is correct until a phone is turned
   * sideways: at 844x390 the width says there is plenty of room, so the
   * wordmark and the buttons were drawn near desktop size and all three menu
   * buttons fell below a 390px fold. This screen clips its overflow so the
   * planet can be cropped, so they were not awkward, they were unreachable.
   *
   * See `startLayout.ts`; `scripts/layouttest.ts` asserts it fits on every
   * orientation of a dozen real devices.
   */
  const { scale, unit, titleUnit, gap, topInset, padBlock } = startScreenLayout(width, height)

  return (
    <>
    <main
      style={{
        position: 'relative',
        minHeight: '100dvh',
        overflow: 'hidden',
        background: 'var(--color-space)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // The wordmark and the buttons are the screen. Centring them means
        // they land in the same place at every window size instead of
        // drifting with the top of the viewport.
        justifyContent: 'center',
        /*
         * Room for the reset button in the corner.
         *
         * The wordmark is sized to fit the window's width, which stops it
         * running off the edge but not from sliding under a control pinned to
         * the top right - on a narrow window the tail of "Scratch" ended up
         * behind it. Reserving the button's own height at the top is the fix
         * that does not depend on the title's width at all.
         */
        paddingTop: topInset,
      }}
    >
      <Starfield />

      {/*
       * Reset, parked in the top right rather than buried in the inventory.
       *
       * It was only reachable two screens deep, which is the wrong place for
       * the one control a player wants when they have lost the thread or when
       * somebody else is about to try the game. Small and quiet, as it wipes
       * everything, but findable without hunting: same slab, same staircase
       * corners, one size down from the menu.
       */}
      <div
        style={{
          position: 'absolute',
          // A fixed inset rather than a multiple of `unit`: the unit shrinks
          // with the viewport and at the small end it put the button flush
          // against the top edge of the window.
          top: 16,
          right: 16,
          zIndex: 2,
        }}
      >
        <PixelButton tone="danger" unit={3} onClick={() => setConfirming(true)}>
          reset
        </PixelButton>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap,
          paddingBlock: padBlock,
          width: '100%',
          paddingInline: unit * 4,
        }}
      >
        <ArcTitle text="From Scratch" unit={titleUnit} />


        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap,
            width: '100%',
            /*
             * The width cap lives HERE, not on the column.
             *
             * It was on the column, and the column ignored it: the arced
             * wordmark is wider than any sensible button, and a flex item does
             * not shrink below its content, so the title forced the column
             * open and the full-width buttons followed it out. Capping the
             * stack lets the title be as wide as it needs while the buttons
             * stay the size they should be.
             */
            maxWidth: 560,
            alignItems: 'stretch',
          }}
        >
          {/*
            * A line under each door, because there were two of them and
            * nothing said one is four minutes long and the other is the game.
            * A player choosing blind between equal-looking buttons is the
            * cheapest kind of confusion to remove.
            */}
          <div className="flex flex-col items-stretch gap-1">
            <PixelButton
              tone="survival"
              unit={unit}
              block
              onClick={() => onSelectRealm('survival')}
            >
              survival
            </PixelButton>
            <RealmCaption>the tutorial · a few minutes</RealmCaption>
          </div>

          <div className="flex flex-col items-stretch gap-1">
            <PixelButton
              tone="everyday"
              unit={unit}
              block
              locked={!everydayUnlocked}
              onClick={() => everydayUnlocked && onSelectRealm('everyday')}
            >
              everything
            </PixelButton>
            <RealmCaption>
              {everydayUnlocked ? 'the main game' : 'finish survival to open'}
            </RealmCaption>
          </div>

        </div>

        <PixelButton
          tone="default"
          unit={unit - 1}
          onClick={onOpenInventory}
          style={{ marginTop: unit * 2 }}
        >
          inventory
        </PixelButton>
      </div>

      {/*
       * THE PLANET IS A BACKDROP, AND ITS HORIZON IS PINNED BY PERCENTAGE.
       *
       * Two earlier versions of this were wrong in opposite directions. Pinned
       * to the bottom of the viewport by a fixed pixel offset, it pulled away
       * from the buttons as the window grew, leaving a widening field of empty
       * navy. Put in flow underneath the content, it shoved the composition
       * around instead.
       *
       * Anchoring its top edge to a PERCENTAGE of the viewport height fixes
       * both: the horizon sits in the same place in the frame on a laptop and
       * on a large display, and the content stays centred independently of it.
       *
       * It sits behind everything — the wordmark and the buttons are the
       * screen, and this is the thing they are standing on.
       */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '64%',
          transform: 'translateX(-50%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <PixelEarth size={EARTH_PIXELS} scale={scale} secondsPerTurn={180} />
      </div>
    </main>

    {confirming && (
      <ConfirmDialog
        title="start over?"
        confirmLabel="wipe it"
        cancelLabel="keep it"
        onConfirm={() => {
          setConfirming(false)
          onReset()
        }}
        onCancel={() => setConfirming(false)}
      />
    )}
    </>
  )
}
