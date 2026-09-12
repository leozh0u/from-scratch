import { CLOUD, FLAME, GROUND, PINE, SHIRT } from '../art/sprites'
import type { RealmId } from '../data/types'
import type { Sprite } from './PixelArt'
import { useViewport } from '../hooks/useViewport'
import { PixelArt, PixelTile } from './PixelArt'

type Realm = {
  id: RealmId
  name: string
  blurb: string
  icon: Sprite
  badge?: string
  accent: string
  soft: string
}

const REALMS: Realm[] = [
  {
    id: 'survival',
    name: 'Survival',
    blurb: 'Fire, candles, a lighter',
    icon: FLAME,
    badge: 'Tutorial',
    accent: 'var(--color-survival)',
    soft: 'var(--color-survival-soft)',
  },
  {
    id: 'everyday',
    name: 'Everyday Objects',
    blurb: 'The things around you, and what they really cost',
    icon: SHIRT,
    accent: 'var(--color-everyday)',
    soft: 'var(--color-everyday-soft)',
  },
]

type StartScreenProps = {
  onSelectRealm: (realm: RealmId) => void
}

const SKY = `linear-gradient(
  to bottom,
  var(--color-sky-1) 0%, var(--color-sky-1) 20%,
  var(--color-sky-2) 20%, var(--color-sky-2) 38%,
  var(--color-sky-3) 38%, var(--color-sky-3) 54%,
  var(--color-sky-4) 54%, var(--color-sky-4) 70%,
  var(--color-sky-5) 70%, var(--color-sky-5) 86%,
  var(--color-sky-6) 86%, var(--color-sky-6) 100%
)`

/** Base scales, tuned for a desktop viewport and stepped down from there. */
const CLOUDS = [
  { left: '6%', top: '14%', scale: 5 },
  { left: '68%', top: '9%', scale: 7 },
  { left: '38%', top: '26%', scale: 4 },
  { left: '85%', top: '34%', scale: 5 },
]

const TREES = [
  { left: '2%', scale: 7 },
  { left: '10%', scale: 5 },
  { left: '16%', scale: 6 },
  { left: '83%', scale: 6 },
  { left: '91%', scale: 8 },
]

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export function StartScreen({ onSelectRealm }: StartScreenProps) {
  const { width, height } = useViewport()

  /*
   * Sprite scales must be whole numbers — a fractional scale puts rect edges on
   * half pixels and the art picks up seams. Ground height is driven by viewport
   * *height* so the scene keeps the same share of the screen on a short laptop
   * and a tall phone alike, then capped by width so sprites don't crowd.
   */
  const groundScale = Math.min(
    clamp(Math.round((height * 0.12) / GROUND.rows.length), 3, 6),
    width < 480 ? 4 : 6,
  )
  const step = (base: number) =>
    Math.max(2, Math.round((base * groundScale) / 6))

  const groundHeight = GROUND.rows.length * groundScale
  /** Trees sink into the grass cap so they don't look pasted on top. */
  const treeLine = groundHeight - 4 * groundScale

  /*
   * Only the ground is reserved, not the treetops: the trees sit at the far
   * edges where the centred panel never reaches.
   */
  const reserve = Math.min(groundHeight, Math.round(height * 0.3))

  /*
   * Sized against BOTH axes. A `vw`-only clamp renders a full-size wordmark in
   * a short, wide window and pushes the panel through the treeline.
   */
  const fit = (byWidth: number, byHeight: number, min: number, max: number) =>
    clamp(Math.min(width * byWidth, height * byHeight), min, max)

  const titleSize = fit(0.042, 0.062, 15, 34)

  /*
   * Three height tiers, not two. `tiny` exists for a phone held in landscape
   * (844x390) and for a short desktop window — at that height the full-size
   * panel is taller than the sky and pushes the page into a scroll.
   */
  const tiny = height < 520
  const short = height < 600

  const pad = tiny ? 14 : short ? 20 : 40
  const cardPad = tiny ? 18 : short ? 24 : 36
  const listGap = tiny ? 8 : 12
  const listTop = tiny ? 14 : short ? 20 : 28
  const iconSize = tiny ? 36 : 44
  const rowPadY = tiny ? 8 : 14

  return (
    <main
      className="relative flex min-h-dvh flex-col overflow-hidden"
      style={{ background: SKY }}
    >
      {CLOUDS.map((cloud) => (
        <PixelArt
          key={cloud.left}
          sprite={CLOUD}
          scale={step(cloud.scale)}
          className="pointer-events-none absolute"
          style={{ left: cloud.left, top: cloud.top }}
        />
      ))}

      {TREES.map((tree) => (
        <PixelArt
          key={tree.left}
          sprite={PINE}
          scale={step(tree.scale)}
          className="pointer-events-none absolute"
          style={{ left: tree.left, bottom: treeLine }}
        />
      ))}

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{ height: groundHeight }}
      >
        <PixelTile sprite={GROUND} scale={groundScale} />
      </div>

      <div
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-5"
        /* Equal pads keep the panel centred on the sky region above the ground */
        style={{ paddingTop: pad, paddingBottom: reserve + pad }}
      >
        <div
          className="w-full max-w-lg rounded-panel bg-white shadow-[0_12px_40px_rgba(20,40,60,0.18)]"
          style={{ padding: cardPad }}
        >
          <header
            className="flex flex-col items-center text-center"
            style={{ gap: tiny ? 6 : 12 }}
          >
            {/* The one place Press Start 2P appears — it's the wordmark, not UI */}
            <h1
              className="wordmark-outline font-display text-brand leading-[1.35]"
              style={{ fontSize: titleSize }}
            >
              From Scratch
            </h1>
            <p
              className="font-semibold text-muted"
              style={{ fontSize: tiny ? 13 : 17 }}
            >
              Find out how things are really made
            </p>
          </header>

          <nav aria-label="Choose a realm">
            <ul
              className="flex flex-col"
              style={{ marginTop: listTop, gap: listGap }}
            >
              {REALMS.map((realm) => (
                <li key={realm.id}>
                  <button
                    type="button"
                    data-realm={realm.id}
                    onClick={() => onSelectRealm(realm.id)}
                    className="group flex w-full cursor-pointer items-center gap-4 rounded-row border-2 border-hairline bg-white px-4 text-left transition-colors duration-150 hover:border-(--accent) hover:bg-(--soft) focus-visible:border-(--accent) focus-visible:bg-(--soft) focus-visible:outline-none"
                    style={
                      {
                        '--accent': realm.accent,
                        '--soft': realm.soft,
                        paddingTop: rowPadY,
                        paddingBottom: rowPadY,
                      } as React.CSSProperties
                    }
                  >
                    {/* Pixel icons are the one retro note inside the clean panel */}
                    <span
                      className="flex shrink-0 items-center justify-center rounded-row"
                      style={{
                        background: realm.soft,
                        width: iconSize,
                        height: iconSize,
                      }}
                    >
                      <PixelArt sprite={realm.icon} scale={2} />
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex flex-wrap items-center gap-2">
                        <span
                          className="font-extrabold text-ink"
                          style={{ fontSize: tiny ? 15 : 18 }}
                        >
                          {realm.name}
                        </span>
                        {realm.badge && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[0.65rem] font-extrabold tracking-wide uppercase"
                            style={{
                              background: realm.soft,
                              color: realm.accent,
                            }}
                          >
                            {realm.badge}
                          </span>
                        )}
                      </span>
                      {/* Dropped on a landscape phone, where the panel has no room */}
                      {!tiny && (
                        <span className="text-sm font-semibold text-muted">
                          {realm.blurb}
                        </span>
                      )}
                    </span>

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5 shrink-0 text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-(--accent)"
                      aria-hidden="true"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </main>
  )
}
