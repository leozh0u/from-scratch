import type { RealmId } from '../data/types'
import { PixelEarth } from './PixelEarth'
import { Starfield } from './Starfield'
import { PixelButton } from './ui/PixelButton'
import { ArcTitle } from './ArcTitle'
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
}

export function StartScreen({
  onSelectRealm,
  onOpenInventory,
  everydayUnlocked,
}: StartScreenProps) {
  const { width } = useViewport()

  /*
   * Integer scale, chosen from the viewport rather than set in CSS.
   *
   * A pixel sprite drawn at 7.5x has soft edges and the whole illusion
   * collapses, so this steps between whole numbers instead of stretching.
   * The globe is meant to be cropped by the bottom of the frame — it should
   * read as enormous and too big for the screen, not as a ball sitting on it.
   */
  const scale = width < 560 ? 7 : width < 900 ? 10 : 13
  /*
   * The buttons get a much larger unit than the layout does.
   *
   * Every dimension inside PixelButton is a multiple of this — outline, bevel,
   * the depth of the extruded base, the corner treads. At a unit of 4 those
   * are all thin lines and the control reads as a styled div. At 7 they are
   * slabs, which is what makes it read as a sprite. "Not pixellated enough"
   * is mostly a question of how coarse the blocks are.
   */
  const unit = width < 560 ? 4 : width < 900 ? 6 : 7

  /*
   * The wordmark gets its own, much larger unit. It is the thing the screen is
   * built around — the planet is what it stands on, not the subject — so it is
   * sized against the viewport rather than kept in step with the buttons.
   * Stepped, not fluid, because a pixel font only renders cleanly at whole
   * multiples of its design size.
   */
  const titleUnit = width < 480 ? 3 : width < 760 ? 5 : width < 1100 ? 7 : 9

  return (
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
      }}
    >
      <Starfield />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: unit * 6,
          paddingBlock: unit * 8,
          width: '100%',
          paddingInline: unit * 4,
        }}
      >
        <ArcTitle text="From Scratch" unit={titleUnit} />


        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: unit * 4,
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
          <PixelButton
            tone="survival"
            unit={unit}
            block
            onClick={() => onSelectRealm('survival')}
          >
            survival
          </PixelButton>

          <PixelButton
            tone="everyday"
            unit={unit}
            block
            locked={!everydayUnlocked}
            onClick={() => everydayUnlocked && onSelectRealm('everyday')}
          >
            everyday objects
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
        <PixelEarth size={EARTH_PIXELS} scale={scale} secondsPerTurn={180} />
      </div>
    </main>
  )
}
