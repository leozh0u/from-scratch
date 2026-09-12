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
  const speed = 42 + hash(seed * 41) * 34
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
    const ROAD_Y = Math.round(height * 0.8)
    const PAVEMENT_Y = Math.round(height * 0.92)

    function draw(now: number) {
      ctx.clearRect(0, 0, width, height)

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
