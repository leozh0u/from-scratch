import { WORLDS, type WorldId } from '../data/worlds'
import { readWorldProgress } from '../game/worlds'
import { useViewport } from '../hooks/useViewport'
import { ArcTitle } from './ArcTitle'
import { PixelEarth } from './PixelEarth'
import { Starfield } from './Starfield'
import { BackArrow } from './ui/BackArrow'
import { MuteButton } from './ui/MuteButton'
import { PixelButton } from './ui/PixelButton'
import { PLANET_PIXELS, pickerLayout, pickerRows } from './startLayout'

type WorldsScreenProps = {
  onBack: () => void
  onSelectWorld: (id: WorldId) => void
}

const NAMES = WORLDS.map((world) => world.name)

/**
 * The worlds, as a sky of planets.
 *
 * A room off the title screen and built from nothing else: the same starfield,
 * the same arc wordmark, the same keys. Each world is the title Earth's own
 * renderer in the world's colours, its coastlines turned so it is not Earth
 * again, above a key that says its name and how much of its kit is made.
 *
 * The keys are all one width, so a grid of "Chess" and "Navigation" lines up
 * instead of reading as five buttons that happen to be near each other.
 */
export function WorldsScreen({ onBack, onSelectWorld }: WorldsScreenProps) {
  const { width, height } = useViewport()
  const layout = pickerLayout(width, height, NAMES)
  const cornerUnit = width < 760 ? 2 : 3
  // Read on every render rather than cached: the picker remounts each time a
  // world is left, and the save it reads was written on the way out.
  const progress = Object.fromEntries(WORLDS.map((world) => [world.id, readWorldProgress(world)]))

  const counts = pickerRows(WORLDS.length, layout.columns)
  const rows = counts.map((count, r) => {
    const start = counts.slice(0, r).reduce((sum, n) => sum + n, 0)
    return WORLDS.slice(start, start + count)
  })

  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100dvh',
        // Scrolls rather than clips if a window is too small for any layout.
        // The title screen cannot, because its planet is pinned to the bottom;
        // nothing here is.
        overflowX: 'hidden',
        overflowY: layout.fits ? 'hidden' : 'auto',
        background: 'var(--color-space)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: layout.fits ? 'center' : 'flex-start',
        paddingTop: layout.topInset,
      }}
    >
      <Starfield />

      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
        <PixelButton tone="default" unit={cornerUnit} onClick={onBack} aria-label="Back to the title">
          <BackArrow unit={cornerUnit} />
          title
        </PixelButton>
      </div>
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
        <MuteButton unit={cornerUnit} />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: layout.gap,
          paddingBlock: layout.padBlock,
          width: '100%',
          paddingInline: 16,
        }}
      >
        <ArcTitle text="Worlds" unit={layout.titleUnit} />

        <ul
          aria-label="Worlds"
          style={{ display: 'flex', flexDirection: 'column', gap: layout.gap, margin: 0, padding: 0 }}
        >
          {rows.map((row, r) => (
            <li
              key={r}
              style={{ display: 'flex', justifyContent: 'center', gap: layout.gap, listStyle: 'none' }}
            >
              {row.map((world) => {
                const { found } = progress[world.id]
                const done = found === world.targets.length
                return (
                  <div
                    key={world.id}
                    style={{
                      width: layout.keyWidth,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: layout.unit * 2,
                    }}
                  >
                    {/*
                     * The planet is a picture of the key below it, not a second
                     * control: hidden from the accessibility tree, clickable for
                     * the pointer because a planet is what the eye goes to.
                     */}
                    <div
                      aria-hidden="true"
                      onClick={() => onSelectWorld(world.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <PixelEarth
                        size={PLANET_PIXELS}
                        scale={layout.planetScale}
                        palette={world.planet.palette}
                        mirror={world.planet.mirror}
                        startLongitude={world.planet.startLongitude}
                        secondsPerTurn={world.planet.secondsPerTurn}
                        rim
                      />
                    </div>
                    {/*
                     * A finished planet's key turns the orange a made target
                     * turns in the strip above the bench. Same colour, same
                     * meaning, and nothing new to learn.
                     */}
                    <PixelButton
                      tone={done ? 'survival' : 'default'}
                      unit={layout.unit}
                      block
                      side={done ? 'done' : `${found}/${world.targets.length}`}
                      onClick={() => onSelectWorld(world.id)}
                      aria-label={`${world.name}: ${world.kit}. ${found} of ${world.targets.length} made.`}
                    >
                      {world.name}
                    </PixelButton>
                  </div>
                )
              })}
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
