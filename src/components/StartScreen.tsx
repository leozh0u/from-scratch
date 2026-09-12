import type { RealmId } from '../data/types'
import { PixelEarth } from './PixelEarth'
import { Starfield } from './Starfield'
import { PixelButton } from './ui/PixelButton'
import { MuteButton } from './ui/MuteButton'
import { ResetButton } from './ui/ResetButton'
import { SkipButton } from './ui/SkipButton'
import { ModePicker } from './ui/ModePicker'
import type { ModeId } from '../game/modes'
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
  /** Whether Survival has been skipped, and how to skip it. */
  skipped: boolean
  onSkip: () => void
  /** How much help the game gives. See game/modes.ts. */
  mode: ModeId
  onChangeMode: (id: ModeId) => void
  onSelectRealm: (realm: RealmId) => void
  onOpenInventory: () => void
  /** Survival's targets are all discovered — Everyday is playable. */
  everydayUnlocked: boolean
  /** Wipes both realms. Confirmed first, always. */
  onReset: () => void
}

export function StartScreen({
  skipped,
  onSkip,
  mode,
  onChangeMode,
  onSelectRealm,
  onOpenInventory,
  everydayUnlocked,
  onReset,
}: StartScreenProps) {
  const { width, height } = useViewport()

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
        {/* Mute sits beside reset rather than under it: a row of two keeps
          * the corner one object, and stacking would push the lower one into
          * the wordmark on a short window. */}
        {/* Wraps, and wraps to the RIGHT, so on a 280px foldable the mode key
          * drops onto its own line under the other two rather than off the
          * side of the screen. */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            gap: 8,
            maxWidth: '70vw',
          }}
        >
          <SkipButton skipped={skipped} onSkip={onSkip} unit={3} />
          <ModePicker mode={mode} onChange={onChangeMode} unit={3} />
          <MuteButton unit={3} />
          <ResetButton onReset={onReset} unit={3} />
        </div>
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
            * The legend goes on the SIDE of the key, not under it.
            *
            * There were two doors and nothing said one is four minutes long
            * and the other is the game. A caption below the button said it,
            * but it floated, and on a tall window the lower one landed on the
            * planet. Printed on the extruded face it reads as part of the
            * object and cannot collide with anything.
            */}
          <PixelButton
            tone="survival"
            unit={unit}
            block
            side="the tutorial"
            onClick={() => onSelectRealm('survival')}
          >
            survival
          </PixelButton>

          <PixelButton
            tone="everyday"
            unit={unit}
            block
            locked={!everydayUnlocked}
            side={everydayUnlocked ? 'the main game' : 'finish survival first'}
            onClick={() => everydayUnlocked && onSelectRealm('everyday')}
          >
            everything
          </PixelButton>

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
        <PixelEarth size={EARTH_PIXELS} scale={scale} secondsPerTurn={32} />
      </div>
    </main>

    </>
  )
}
