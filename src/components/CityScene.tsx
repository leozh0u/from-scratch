import { useEffect, useRef } from 'react'
import { useViewport } from '../hooks/useViewport'
import {
  PERSON_FRAMES,
  CAR_FRAMES,
  PIGEON_FRAMES,
  COAT_COLOURS,
  CAR_COLOURS,
  type CitySprite,
} from '../art/city'

/**
 * The Everyday backdrop: a New York street, with the street actually moving.
 *
 * THE SPLIT, AND WHY IT IS THE SAME ONE AS THE FOREST
 *
 * The buildings are a piece of art. Two attempts at generating a forest were
 * worse than the reference they imitated, and there is no reason a city would
 * go differently — a composed image beats a procedural one at being a place.
 *
 * But a painting cannot walk. Pedestrians, traffic and pigeons are the whole
 * difference between a picture of a street and a street, and none of them can
 * live in a static file. So the art is the backdrop and everything that moves
 * is drawn over it.
 *
 * WHERE THE ACTORS GO
 *
 * All of them sit in the bottom third, which is where the pavement and road
 * are in a street-level view, and where no panel sits. The UI owns the middle;
 * the city lives underneath it. That is the same discipline the forest ended up
 * with after the first version put detail everywhere and fought the interface.
 *
 * EVERYTHING MOVES IN WHOLE PIXELS
 *
 * Positions are floored, walk cycles step between two poses on a fixed clock,
 * and nothing is ever rotated or scaled by a fraction. A pedestrian sliding
 * smoothly between two pixel columns is the single clearest way to make hand-
 * drawn sprites look like they were pasted on.
 */

/** Deterministic hash, so the same crowd walks the same street every load. */
function hash(n: number): number {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b)
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35)
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296
}

/**
 * Draw a text sprite to a canvas at whole-pixel coordinates.
 *
 * Runs of one colour are merged into a single fillRect, the same trick
 * PixelArt.tsx uses for SVG — a 16x8 car becomes a couple of dozen rects
 * rather than 128.
 *
 * `overrides` swaps palette entries per instance, which is what lets one
 * person sprite become a crowd in different coats.
 */
function blit(
  ctx: CanvasRenderingContext2D,
  sprite: CitySprite,
  x: number,
  y: number,
  overrides?: Record<string, string>,
  flip = false,
) {
  const palette = overrides ? { ...sprite.palette, ...overrides } : sprite.palette
  const w = sprite.rows[0].length

  sprite.rows.forEach((row, ry) => {
    let rx = 0
    while (rx < row.length) {
      const ch = row[rx]
      let run = 1
      while (rx + run < row.length && row[rx + run] === ch) run++
      const fill = palette[ch]
      if (fill) {
        ctx.fillStyle = fill
        // Flipping is a whole-pixel mirror, not a transform: a scale(-1)
        // resamples on fractional device pixels on some displays.
        const dx = flip ? x + (w - rx - run) : x + rx
        ctx.fillRect(dx, y + ry, run, 1)
      }
      rx += run
    }
  })
}

/**
 * Where a pedestrian is at a given moment.
 *
 * Pure, and exported, so the crowd can be asserted on rather than watched:
 * whole-pixel positions, a two-frame cycle, and everyone eventually wrapping
 * rather than walking off and never coming back.
 */
export function walkerAt(
  now: number,
  seed: number,
  width: number,
): { x: number; frame: number; flip: boolean } {
  // Between about 11 and 20 pixels a second. Slow: a street-level crowd at
  // this scale moves much less than feels right in a spreadsheet.
  const speed = 11 + hash(seed * 17) * 9
  const dir = hash(seed * 29) > 0.5 ? 1 : -1
  const span = width + 40
  const travelled = (now / 1000) * speed + hash(seed * 37) * span
  const along = ((travelled % span) + span) % span
  return {
    x: Math.floor(dir > 0 ? along - 20 : width + 20 - along),
    // Stride tied to distance covered, not to wall-clock: a faster walker
    // takes more steps rather than the same steps faster, which is what stops
    // the crowd looking like it is all moving to one metronome.
    frame: Math.floor(travelled / 7) % 2,
    flip: dir < 0,
  }
}

/** Where a car is. Same shape as a walker but much quicker. */
export function carAt(
  now: number,
  seed: number,
  width: number,
): { x: number; frame: number; flip: boolean } {
  /*
   * Crawling. This is an intersection in traffic, not a motorway — the whole
   * character of a city street at eye level is that the cars are barely
   * moving while the people are not. An earlier pass had them at 42-76 px/s
   * and the street read as a racetrack.
   */
  const speed = 5 + hash(seed * 41) * 7
  const dir = hash(seed * 53) > 0.5 ? 1 : -1
  const span = width + 80
  const travelled = (now / 1000) * speed + hash(seed * 59) * span
  const along = ((travelled % span) + span) % span
  return {
    x: Math.floor(dir > 0 ? along - 40 : width + 40 - along),
    frame: Math.floor(travelled / 3) % 2,
    flip: dir < 0,
  }
}

/**
 * Where a pigeon is.
 *
 * Rises as it crosses, on a shallow arc, because a bird that flies dead level
 * reads as a paper aeroplane. The flap is faster than anything else on screen,
 * which is also true of real pigeons.
 */
export function pigeonAt(
  now: number,
  seed: number,
  width: number,
  height: number,
): { x: number; y: number; frame: number; flip: boolean } {
  const crossMs = 7000 + hash(seed * 13) * 9000
  const dir = hash(seed * 19) > 0.5 ? 1 : -1
  const t = ((now + hash(seed * 23) * crossMs) % crossMs) / crossMs
  const baseY = height * (0.34 + hash(seed * 31) * 0.22)
  return {
    x: Math.floor(dir > 0 ? -10 + t * (width + 20) : width + 10 - t * (width + 20)),
    // A shallow rise plus a slow bob — two sines, both floored to the grid.
    y: Math.floor(baseY - t * height * 0.1 + Math.sin(t * Math.PI * 5 + seed) * 3),
    frame: Math.floor(now / 140 + seed) % 2,
    flip: dir < 0,
  }
}

type CitySceneProps = {
  /** CSS pixels per scene pixel. Integers only. */
  pixelScale?: number
  className?: string
}

/** Set once a street image exists in public/. Until then the actors are drawn
 * over a flat sky so the scene is never blank. */
const BACKDROP = 'city-street.svg'

export function CityScene({ pixelScale = 4, className }: CitySceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const backdropRef = useRef<HTMLImageElement | null>(null)
  const { width: vw, height: vh } = useViewport()

  const width = Math.max(100, Math.ceil(vw / pixelScale))
  const height = Math.max(100, Math.ceil(vh / pixelScale))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const ctx = context

    const WALKERS = 14
    const CARS = 5
    const PIGEONS = 4

    // The pavement and road bands, as fractions of the frame. Everything walks
    // or drives on one of these, so they are the only numbers to change if the
    // backdrop's horizon moves.
    // Tied to drawStreet's kerb: the road band sits above it, the pavement
    // below, so moving the horizon moves everything together.
    const ROAD_Y = Math.round(height * 0.68)
    const PAVEMENT_Y = Math.round(height * 0.79)

    /**
     * A plain street, drawn once per frame behind the actors.
     *
     * NOT trying to be the finished backdrop — a composed piece of pixel art
     * will replace it, and that art will be better, exactly as the forest's
     * was. This exists so the realm is a place rather than a flat blue field
     * while that art is found, and so the pedestrians have a pavement to be
     * standing on.
     *
     * Flat bands and rectangular windows, seeded so the skyline is the same
     * every load.
     */
    /**
     * The street, at eye level, at an intersection.
     *
     * WHAT THIS IS TRYING TO BE
     *
     * Not a skyline seen from above — that was the first pass and it read as a
     * chart of buildings. A pedestrian standing on a corner sees facades
     * flanking them, a crossing in front, and the street furniture that
     * actually makes a place legible as a city: traffic lights, lamp posts,
     * signs, awnings, fire escapes. The detail near the viewer is the point;
     * the distance can be simple.
     *
     * Still a placeholder for composed art, and still seeded so it is the same
     * street every load.
     */
    function drawStreet() {
      const horizon = Math.round(height * 0.58)
      const kerbY = Math.round(height * 0.74)

      // Sky, pale toward the horizon where the haze sits.
      ctx.fillStyle = '#79b0d6'
      ctx.fillRect(0, 0, width, horizon)
      ctx.fillStyle = '#a9cee6'
      ctx.fillRect(0, Math.round(horizon - height * 0.12), width, Math.round(height * 0.12))

      /** Rows of lit and unlit windows across a facade. */
      function windows(x: number, y: number, w: number, h: number, seed: number, lit: string, dark: string) {
        for (let wy = y + 3; wy < y + h - 4; wy += 7) {
          for (let wx = x + 3; wx < x + w - 4; wx += 6) {
            const on = hash(wx * 31 + wy * 17 + seed) > 0.62
            ctx.fillStyle = on ? lit : dark
            ctx.fillRect(wx, wy, 3, 4)
          }
        }
      }

      // Buildings across the far side of the intersection — simple, hazy.
      for (let i = 0; i * 30 < width + 30; i++) {
        const seed = i * 71 + 5
        const w = 20 + Math.round(hash(seed) * 16)
        const x = i * 30 + Math.round((hash(seed * 3) - 0.5) * 10)
        const top = horizon - Math.round(height * (0.14 + hash(seed * 5) * 0.2))
        ctx.fillStyle = '#8ca4bd'
        ctx.fillRect(x, top, w, horizon - top)
        windows(x, top, w, horizon - top, seed, '#cfdceb', '#7890a8')
      }

      /*
       * The two near facades, flanking the view. These are the detailed ones —
       * a pedestrian's eye is a few metres from this brickwork, and it is
       * where awnings, shopfronts and fire escapes live.
       */
      const facades: Array<{ x: number; w: number; brick: string; trim: string }> = [
        { x: 0, w: Math.round(width * 0.2), brick: '#8a4a3c', trim: '#6a362b' },
        { x: Math.round(width * 0.8), w: Math.round(width * 0.2), brick: '#7a5a3c', trim: '#5c422b' },
      ]
      for (const f of facades) {
        ctx.fillStyle = f.brick
        ctx.fillRect(f.x, 0, f.w, kerbY)
        // Storey bands.
        ctx.fillStyle = f.trim
        for (let y = 14; y < kerbY; y += 22) ctx.fillRect(f.x, y, f.w, 2)
        windows(f.x + 2, 4, f.w - 4, kerbY - 30, f.x, '#f2d98a', '#3d2b26')

        // Shopfront at street level: awning, then a lit window under it.
        const shopTop = kerbY - 26
        ctx.fillStyle = '#2e2b3d'
        ctx.fillRect(f.x, shopTop, f.w, 26)
        ctx.fillStyle = '#cfa24a'
        ctx.fillRect(f.x, shopTop, f.w, 4)
        // Awning stripes, in whole pixels.
        ctx.fillStyle = '#a33b3b'
        for (let x = f.x; x < f.x + f.w; x += 8) ctx.fillRect(x, shopTop, 4, 4)
        ctx.fillStyle = '#f2e2a8'
        ctx.fillRect(f.x + 3, shopTop + 8, f.w - 6, 12)

        // Fire escape: a ladder of rails up the facade.
        ctx.fillStyle = '#2a2733'
        const escX = f.x + Math.round(f.w * 0.55)
        for (let y = 16; y < shopTop; y += 22) ctx.fillRect(f.x + 2, y, f.w - 6, 2)
        for (let y = 16; y < shopTop; y += 3) ctx.fillRect(escX, y, 2, 2)
      }

      // Road, kerb, pavement.
      ctx.fillStyle = '#4c4858'
      ctx.fillRect(0, horizon, width, height)
      ctx.fillStyle = '#7d7990'
      ctx.fillRect(0, kerbY, width, 3)
      ctx.fillStyle = '#93909f'
      ctx.fillRect(0, kerbY + 3, width, height)

      /*
       * The crossing. Zebra stripes drawn as whole-pixel bars rather than with
       * a dashed border — the same reason the combine slots stopped being CSS
       * dashes.
       */
      ctx.fillStyle = '#c9c6d4'
      const zebraY = Math.round(height * 0.63)
      for (let x = Math.round(width * 0.3); x < width * 0.7; x += 9) {
        ctx.fillRect(x, zebraY, 5, Math.round(height * 0.09))
      }

      // Centre line.
      ctx.fillStyle = '#c8b45e'
      const laneY = Math.round(height * 0.695)
      for (let x = 0; x < width; x += 14) ctx.fillRect(x, laneY, 7, 1)

      /** A pole with something on top — lamp or signal. */
      function pole(x: number, topY: number) {
        ctx.fillStyle = '#26232e'
        ctx.fillRect(x, topY, 2, kerbY - topY)
        ctx.fillRect(x - 2, kerbY - 2, 6, 3)
      }

      // Traffic signals either side of the crossing. The lit lamp is chosen
      // from the clock, so the junction actually cycles.
      const phase = Math.floor(Date.now() / 4000) % 3
      for (const sx of [Math.round(width * 0.27), Math.round(width * 0.71)]) {
        const top = Math.round(height * 0.4)
        pole(sx, top)
        ctx.fillStyle = '#1b1924'
        ctx.fillRect(sx - 3, top - 14, 8, 16)
        const lamps = ['#d94b3a', '#e0b23c', '#4fb85c']
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = phase === i ? lamps[i] : '#332f3d'
          ctx.fillRect(sx - 1, top - 12 + i * 5, 4, 3)
        }
      }

      // Street lamps, arched over the road.
      for (const lx of [Math.round(width * 0.12), Math.round(width * 0.52), Math.round(width * 0.88)]) {
        const top = Math.round(height * 0.34)
        pole(lx, top)
        ctx.fillStyle = '#26232e'
        ctx.fillRect(lx, top, 9, 2)
        ctx.fillStyle = '#f4e6a8'
        ctx.fillRect(lx + 7, top + 2, 4, 3)
      }

      // Street signs on a shared post, and a stop sign.
      const signX = Math.round(width * 0.62)
      pole(signX, Math.round(height * 0.52))
      ctx.fillStyle = '#3f7a4a'
      ctx.fillRect(signX - 12, Math.round(height * 0.52), 26, 6)
      ctx.fillStyle = '#dfe6ea'
      ctx.fillRect(signX - 9, Math.round(height * 0.52) + 2, 20, 2)
      ctx.fillStyle = '#b03a32'
      ctx.fillRect(signX - 10, Math.round(height * 0.56), 20, 8)
      ctx.fillStyle = '#e8e2ee'
      ctx.fillRect(signX - 6, Math.round(height * 0.585), 12, 2)
    }

    function draw(now: number) {
      ctx.clearRect(0, 0, width, height)
      drawStreet()

      // Pigeons first: they are furthest away and everything else overlaps
      // them.
      for (let i = 0; i < PIGEONS; i++) {
        const { x, y, frame, flip } = pigeonAt(now, i + 1, width, height)
        blit(ctx, PIGEON_FRAMES[frame], x, y, undefined, flip)
      }

      // Traffic, on the road band, two lanes.
      for (let i = 0; i < CARS; i++) {
        const { x, frame, flip } = carAt(now, i + 1, width)
        const lane = i % 2
        blit(
          ctx,
          CAR_FRAMES[frame],
          x,
          ROAD_Y + lane * 9,
          { b: CAR_COLOURS[i % CAR_COLOURS.length] },
          flip,
        )
      }

      // People, on the pavement, in two ranks so the crowd has depth.
      for (let i = 0; i < WALKERS; i++) {
        const { x, frame, flip } = walkerAt(now, i + 1, width)
        const rank = i % 2
        blit(
          ctx,
          PERSON_FRAMES[frame],
          x,
          PAVEMENT_Y + rank * 5,
          { c: COAT_COLOURS[i % COAT_COLOURS.length] },
          flip,
        )
      }
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      draw(0)
      return
    }

    let raf = 0
    const tick = (now: number) => {
      draw(now)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [width, height])

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    >
      {/*
       * A flat sky underneath, so the scene is never empty while the street
       * art is missing — and so the actors always have something to sit on if
       * the image fails to load.
       */}
      <div style={{ position: 'absolute', inset: 0, background: '#7fb4d8' }} />
      <img
        ref={backdropRef}
        src={`${import.meta.env.BASE_URL}${BACKDROP}`}
        alt=""
        onError={(e) => {
          // No street art yet. Hide the broken image rather than showing the
          // browser's placeholder over the whole screen.
          e.currentTarget.style.display = 'none'
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 45%',
          imageRendering: 'pixelated',
        }}
      />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  )
}
