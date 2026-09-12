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
  onOpenCodex: () => void
  /** Survival's targets are all discovered — Everyday is playable. */
  everydayUnlocked: boolean
}

export function StartScreen({
  onSelectRealm,
  onOpenCodex,
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
  const unit = width < 560 ? 3 : 4

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
      }}
    >
      <Starfield />

      {/*
       * The globe is positioned from the bottom and centred, so the viewport
       * crops its lower half no matter the window size. Everything else
       * stacks above it in normal flow and simply overlaps.
       */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          /*
           * How deep the planet sits is the one number that decides this
           * screen, and it was tuned by looking at it. Sinking it by half its
           * diameter matches the mock most literally but puts bright green
           * land directly behind the small type, which no drop shadow rescues.
           * Three quarters keeps the horizon below the buttons, so every word
           * on the screen sits on flat navy, and the planet still reads as
           * something far too large for the window.
           */
          bottom: `-${Math.round(EARTH_PIXELS * scale * 0.74)}px`,
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      >
        <PixelEarth size={EARTH_PIXELS} scale={scale} secondsPerTurn={180} />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: unit * 5,
          paddingTop: unit * 7,
          paddingBottom: unit * 8,
          width: '100%',
          maxWidth: 560,
          paddingInline: unit * 4,
        }}
      >
        <ArcTitle text="From Scratch" unit={unit} />

        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: unit * 2.5,
            lineHeight: 1.9,
            color: 'var(--color-star-mid)',
            textAlign: 'center',
            margin: 0,
            textTransform: 'lowercase',
            // A hard one-pixel drop shadow, not a blur. This is how console
            // UIs kept text legible over a busy background, and it is the
            // only kind of shadow this design allows.
            textShadow: '2px 2px 0 var(--color-space-deep)',
          }}
        >
          find out how things are really made
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: unit * 4,
            width: '100%',
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
            {everydayUnlocked ? 'items' : 'items — locked'}
          </PixelButton>

          {!everydayUnlocked && (
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: unit * 2,
                lineHeight: 1.9,
                color: 'var(--color-star-mid)',
                textAlign: 'center',
                margin: 0,
                textTransform: 'lowercase',
                textShadow: '2px 2px 0 var(--color-space-deep)',
              }}
            >
              finish survival first
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenCodex}
          style={{
            background: 'none',
            border: 'none',
            padding: unit * 2,
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: unit * 2.25,
            color: 'var(--color-star-mid)',
            textTransform: 'lowercase',
            letterSpacing: '0.04em',
            textShadow: '2px 2px 0 var(--color-space-deep)',
          }}
        >
          view your codex
        </button>
      </div>
    </main>
  )
}
