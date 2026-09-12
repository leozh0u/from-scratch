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
 * The Everyday backdrop: a busy intersection, from a pedestrian's eye.
 *
 * ONE-POINT PERSPECTIVE, WHICH IS THE WHOLE THING
 *
 * The first two passes drew flat facades pinned to the left and right edges,
 * and they read as scenery flats either side of a corridor. Leo's reference is
 * a street that RECEDES: every storey line, kerb and window row converging on
 * a vanishing point just above the horizon. That convergence is what puts the
 * viewer on the pavement rather than in front of a backdrop, and it is most of
 * the difference between a picture of a street and standing in one.
 *
 * Everything is drawn far to near, with position and size interpolated toward
 * the vanishing point. A block twice as far is half as tall and half as far
 * from the centre.
 *
 * DETAIL IS THE POINT; MOVEMENT IS NOT
 *
 * An earlier version had a crowd of fourteen and traffic crossing the frame,
 * and the verdict was that it was still bland — because motion is not detail.
 * A busy street looks busy standing still: rows of lit and unlit windows,
 * cornices, awnings, fire escapes, signage, aerials, kerbs, drains.
 *
 * So the moving parts are deliberately few and slow, at the same register as
 * the forest's sway, and the budget goes into what is drawn rather than what
 * is animated.
 *
 * DETAIL BELONGS AT THE FRONT
 *
 * The nearest buildings get individual windows, shopfronts and fire escapes;
 * the far end gets flat silhouettes. That is not a shortcut, it is what depth
 * looks like — spending equal detail at every distance is what made the first
 * version read as a chart.
 *
 * Still a placeholder for composed art. Still seeded, so it is the same street
 * on every load.
 */

/** Deterministic hash, so the same city is drawn every time. */
function hash(n: number): number {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b)
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35)
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Draw a text sprite at whole-pixel coordinates, optionally at integer scale.
 *
 * Runs of one colour merge into one fillRect — the same trick PixelArt uses
 * for SVG. Scale is an integer because a sprite at 1.5x has soft edges, and
 * `flip` is a whole-pixel mirror rather than a transform because scale(-1)
 * resamples on fractional device pixels on some displays.
 */
function blit(
  ctx: CanvasRenderingContext2D,
  sprite: CitySprite,
  x: number,
  y: number,
  opts: { overrides?: Record<string, string>; flip?: boolean; scale?: number } = {},
) {
  const { overrides, flip = false, scale = 1 } = opts
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
        const sx = flip ? w - rx - run : rx
        ctx.fillRect(x + sx * scale, y + ry * scale, run * scale, scale)
      }
      rx += run
    }
  })
}

/**
 * Where a pedestrian is, and how far away.
 *
 * `depth` is 0 at the viewer and 1 at the vanishing point; the scene uses it
 * for both sprite scale and position, so a walker genuinely recedes rather
 * than merely shrinking. Slow on purpose — see the note at the top.
 */
export function walkerAt(
  now: number,
  seed: number,
  width: number,
): { along: number; depth: number; frame: number; flip: boolean } {
  const depth = hash(seed * 71)
  // Nearer walkers cover more ground on screen, which is parallax and is most
  // of what sells the depth.
  const speed = (4 + hash(seed * 17) * 4) * (1 - depth * 0.7)
  const dir = hash(seed * 29) > 0.5 ? 1 : -1
  const span = width + 60
  const travelled = (now / 1000) * speed + hash(seed * 37) * span
  const along = ((travelled % span) + span) % span
  return {
    along: dir > 0 ? along - 30 : width + 30 - along,
    depth,
    // Stride tied to distance covered rather than wall-clock, so a faster
    // walker takes more steps instead of the same steps faster — which stops
    // a crowd looking like it moves to one metronome.
    frame: Math.floor(travelled / 5) % 2,
    flip: dir < 0,
  }
}

/** Where a car is. Barely moving: this is an intersection in traffic. */
export function carAt(
  now: number,
  seed: number,
  width: number,
): { along: number; depth: number; frame: number; flip: boolean } {
  const depth = 0.12 + hash(seed * 83) * 0.42
  const speed = (2.5 + hash(seed * 41) * 3) * (1 - depth * 0.6)
  const dir = hash(seed * 53) > 0.5 ? 1 : -1
  const span = width + 120
  const travelled = (now / 1000) * speed + hash(seed * 59) * span
  const along = ((travelled % span) + span) % span
  return {
    along: dir > 0 ? along - 60 : width + 60 - along,
    depth,
    frame: Math.floor(travelled / 4) % 2,
    flip: dir < 0,
  }
}

/** Where a pigeon is. Rises as it crosses — a bird flying dead level reads as
 * a paper aeroplane. */
export function pigeonAt(
  now: number,
  seed: number,
  width: number,
  height: number,
): { x: number; y: number; frame: number; flip: boolean } {
  const crossMs = 16000 + hash(seed * 13) * 14000
  const dir = hash(seed * 19) > 0.5 ? 1 : -1
  const t = ((now + hash(seed * 23) * crossMs) % crossMs) / crossMs
  const baseY = height * (0.28 + hash(seed * 31) * 0.14)
  return {
    x: Math.floor(dir > 0 ? -10 + t * (width + 20) : width + 10 - t * (width + 20)),
    y: Math.floor(baseY - t * height * 0.06 + Math.sin(t * Math.PI * 5 + seed) * 3),
    frame: Math.floor(now / 160 + seed) % 2,
    flip: dir < 0,
  }
}

type CitySceneProps = {
  pixelScale?: number
  className?: string
}

export function CityScene({ pixelScale = 4, className }: CitySceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { width: vw, height: vh } = useViewport()

  const width = Math.max(120, Math.ceil(vw / pixelScale))
  const height = Math.max(120, Math.ceil(vh / pixelScale))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const ctx = context

    // The vanishing point, slightly above centre: a standing person looks very
    // slightly down a street rather than level along it.
    const VX = Math.round(width * 0.5)
    const VY = Math.round(height * 0.44)

    const SKY = '#8fb6d4'
    const SKY_HAZE = '#c6dae7'
    const ROAD = '#54515f'
    const ROAD_FAR = '#6e6b7d'
    const KERB = '#8b8898'
    const PAVEMENT = '#9b98a6'
    const LIT = '#f7d47f'
    const WARM = '#dca63f'
    const DARK_GLASS = '#2a2433'

    /** Brick and stone, near to far. Cooler and paler with distance — the only
     * aerial perspective available without gradients. */
    const FACADES = [
      { wall: '#7d4237', trim: '#5a2e26', sill: '#9c5c4a' },
      { wall: '#6d5541', trim: '#4d3b2c', sill: '#8a6d52' },
      { wall: '#5c6072', trim: '#454859', sill: '#737891' },
      { wall: '#6b6f84', trim: '#565a6d', sill: '#848aa0' },
      { wall: '#7c8298', trim: '#6b7085', sill: '#939ab0' },
    ]

    /** Screen x of the street edge on one side at a given depth. */
    const edgeAt = (side: -1 | 1, t: number) => VX + side * lerp(width * 0.52, 2, t)
    /** Screen y of the ground at a given depth. */
    const groundAt = (t: number) => lerp(height, VY, t)

    function drawSky() {
      ctx.fillStyle = SKY
      ctx.fillRect(0, 0, width, VY + 4)
      // Light pools at the end of the street, where the buildings stop
      // blocking it — which is where a real one is brightest.
      ctx.fillStyle = SKY_HAZE
      const hazeW = Math.round(width * 0.3)
      ctx.fillRect(VX - hazeW / 2, Math.round(VY - height * 0.18), hazeW, Math.round(height * 0.22))
    }

    function drawGround() {
      /*
       * The road as a trapezoid, drawn a row at a time rather than as a
       * polygon: a filled polygon antialiases its sloping edges, and the whole
       * point is that they should visibly step.
       */
      for (let y = VY; y < height; y++) {
        const t = 1 - (y - VY) / (height - VY)
        const halfRoad = lerp(width * 0.3, 1, t)
        const halfPave = lerp(width * 0.52, 2, t)

        ctx.fillStyle = PAVEMENT
        ctx.fillRect(Math.round(VX - halfPave), y, Math.round(halfPave * 2), 1)
        ctx.fillStyle = KERB
        ctx.fillRect(Math.round(VX - halfRoad - 2), y, Math.round(halfRoad * 2 + 4), 1)
        ctx.fillStyle = t > 0.72 ? ROAD_FAR : ROAD
        ctx.fillRect(Math.round(VX - halfRoad), y, Math.round(halfRoad * 2), 1)
      }

      // Paving joints: lines converging on the vanishing point, which is the
      // cheapest and strongest depth cue on the whole screen.
      ctx.fillStyle = '#8d8a99'
      for (let i = 1; i <= 7; i++) {
        const t = Math.pow(i / 8, 1.6)
        const y = Math.round(groundAt(t))
        const halfPave = lerp(width * 0.52, 2, t)
        const halfRoad = lerp(width * 0.3, 1, t)
        ctx.fillRect(Math.round(VX - halfPave), y, Math.round(halfPave - halfRoad), 1)
        ctx.fillRect(Math.round(VX + halfRoad + 2), y, Math.round(halfPave - halfRoad), 1)
      }

      // Centre line, dashes shortening with distance.
      ctx.fillStyle = '#c9b25f'
      for (let i = 1; i < 12; i++) {
        const t = Math.pow(i / 12, 1.7)
        const y = Math.round(groundAt(t))
        const len = Math.max(1, Math.round(lerp(8, 1, t)))
        if (y > VY + 3) ctx.fillRect(VX - 1, y, 2, len)
      }

      /*
       * The crossing. Bars widen and separate as they come forward, sharing
       * the road's convergence — without that it reads as a ladder lying flat.
       */
      const t = 0.3
      const y = Math.round(groundAt(t))
      const halfRoad = lerp(width * 0.3, 1, t)
      for (let i = -6; i <= 6; i++) {
        const barW = Math.max(2, Math.round(halfRoad * 0.1))
        const x = Math.round(VX + (i / 6) * halfRoad * 0.88)
        ctx.fillStyle = '#cdc9d6'
        ctx.fillRect(x - barW / 2, y, barW, Math.max(2, Math.round(height * 0.03)))
      }

      // Drains at the kerb, near side only.
      ctx.fillStyle = '#3a3744'
      for (const side of [-1, 1] as const) {
        const dy = Math.round(groundAt(0.12))
        const dx = Math.round(VX + side * lerp(width * 0.3, 1, 0.12))
        ctx.fillRect(dx - side * 5, dy, 5, 2)
      }
    }

    /**
     * One building, its face converging toward the vanishing point.
     *
     * Drawn column by column so the roofline and the base both slope — the two
     * edges that carry the perspective. Detail is gated on how near the block
     * is: at the far end a window is under a pixel and a row of them turns
     * into noise.
     */
    function block(side: -1 | 1, near: number, far: number, seed: number, rank: number) {
      const f = FACADES[Math.min(FACADES.length - 1, rank)]
      const storeys = 3 + Math.floor(hash(seed) * 4)
      const roofAt = (t: number) => lerp(VY - height * 0.026 * storeys, VY, t)

      const xNear = edgeAt(side, near)
      const xFar = edgeAt(side, far)
      const step = side > 0 ? -1 : 1
      const from = Math.round(xNear)
      const to = Math.round(xFar)

      for (let x = from; side > 0 ? x >= to : x <= to; x += step) {
        const t = (x - xNear) / (xFar - xNear || 1)
        const top = Math.round(lerp(roofAt(near), roofAt(far), t))
        const base = Math.round(lerp(groundAt(near), groundAt(far), t))
        ctx.fillStyle = f.wall
        ctx.fillRect(x, top, 1, base - top)
        // Cornice along the roofline, and a parapet above it.
        ctx.fillStyle = f.trim
        ctx.fillRect(x, top, 1, 2)
        ctx.fillRect(x, top - 2, 1, 1)
      }

      if (rank <= 2) {
        // Storey bands: horizontal trim between floors, converging.
        ctx.fillStyle = f.trim
        for (let r = 1; r <= storeys; r++) {
          for (let c = 0; c <= 30; c++) {
            const t = lerp(near, far, c / 30)
            const x = Math.round(edgeAt(side, t))
            const y = Math.round(lerp(roofAt(t), groundAt(t), r / (storeys + 1.2)))
            ctx.fillRect(x, y, 1, 1)
          }
        }

        // Windows, with sills, in rows that converge with the facade.
        const cols = rank === 0 ? 7 : 9
        for (let r = 0; r < storeys; r++) {
          for (let c = 0; c < cols; c++) {
            const t = lerp(near, far, (c + 0.5) / cols)
            const x = Math.round(edgeAt(side, t))
            const top = lerp(roofAt(t), groundAt(t), (r + 0.85) / (storeys + 1.2))
            const w = Math.max(1, Math.round(lerp(5, 1, t)))
            const h = Math.max(1, Math.round(lerp(7, 1, t)))
            const roll = hash(seed * 13 + r * 31 + c * 7)
            const left = side > 0 ? x : x - w
            ctx.fillStyle = roll > 0.6 ? (roll > 0.8 ? LIT : WARM) : DARK_GLASS
            ctx.fillRect(left, Math.round(top), w, h)
            if (w > 2) {
              ctx.fillStyle = f.sill
              ctx.fillRect(left - 1, Math.round(top) + h, w + 2, 1)
            }
          }
        }
      }

      /*
       * Nearest block only: shopfronts, awnings and a fire escape. This is the
       * warm glow the reference is built on, and none of it reads beyond the
       * first block.
       */
      if (rank === 0) {
        for (let c = 0; c < 4; c++) {
          const t = lerp(near, far, (c + 0.5) / 4)
          const x = Math.round(edgeAt(side, t))
          const base = groundAt(t)
          const shopH = Math.max(4, Math.round(lerp(30, 6, t)))
          const w = Math.max(3, Math.round(lerp(18, 3, t)))
          const left = side > 0 ? x : x - w
          ctx.fillStyle = '#241f2e'
          ctx.fillRect(left, Math.round(base - shopH), w, shopH)
          ctx.fillStyle = LIT
          ctx.fillRect(left + 1, Math.round(base - shopH) + 3, w - 2, shopH - 6)
          // Awning: alternating bars in whole pixels.
          const bar = Math.max(1, Math.round(w / 4))
          for (let i = 0; i * bar < w; i++) {
            ctx.fillStyle = i % 2 ? '#a8483c' : '#ded8c8'
            ctx.fillRect(left + i * bar, Math.round(base - shopH) - 3, bar, 3)
          }
          // Hanging sign over the door.
          ctx.fillStyle = '#2f2a3a'
          ctx.fillRect(left + Math.round(w / 2), Math.round(base - shopH) - 9, 1, 6)
          ctx.fillStyle = '#c8b45e'
          ctx.fillRect(left + Math.round(w / 2) - 3, Math.round(base - shopH) - 11, 7, 3)
        }

        // Fire escape: rails at each storey with a ladder between them.
        ctx.fillStyle = '#211e29'
        const fx = Math.round(edgeAt(side, lerp(near, far, 0.32)))
        const fTop = roofAt(lerp(near, far, 0.32))
        const fBase = groundAt(lerp(near, far, 0.32)) - 34
        for (let y = fTop + 10; y < fBase; y += 18) {
          ctx.fillRect(side > 0 ? fx : fx - 16, Math.round(y), 16, 2)
        }
        for (let y = fTop + 10; y < fBase; y += 4) {
          ctx.fillRect(side > 0 ? fx + 12 : fx - 13, Math.round(y), 2, 2)
        }

        // Roof aerials, because a skyline without them looks moulded.
        ctx.fillStyle = '#2b2833'
        for (let i = 0; i < 3; i++) {
          const t = lerp(near, far, 0.15 + i * 0.25)
          const x = Math.round(edgeAt(side, t))
          const y = Math.round(roofAt(t))
          const h = 5 + Math.round(hash(seed + i * 19) * 7)
          ctx.fillRect(side > 0 ? x + 4 : x - 6, y - h, 1, h)
          ctx.fillRect(side > 0 ? x + 2 : x - 8, y - h, 5, 1)
        }
      }
    }

    function drawBuildings() {
      /*
       * Far to near, so nearer blocks overlap further ones — a painter's
       * algorithm, the only ordering that works without a z-buffer. The stops
       * are non-linear because depth is not linear on screen: the first block
       * occupies far more of the frame than the fifth.
       */
      const stops = [0.88, 0.7, 0.5, 0.28, 0.06]
      for (let i = stops.length - 1; i >= 0; i--) {
        const far = stops[i]
        const near = i === 0 ? 0 : stops[i - 1]
        block(-1, near, far, 101 + i * 37, i)
        block(1, near, far, 211 + i * 53, i)
      }

      // The far side of the junction, closing the end of the street.
      ctx.fillStyle = '#909aae'
      const capW = Math.round(width * 0.32)
      const capH = Math.round(height * 0.12)
      ctx.fillRect(VX - capW / 2, VY - capH, capW, capH)
      ctx.fillStyle = '#a5aec0'
      for (let x = VX - capW / 2 + 2; x < VX + capW / 2 - 2; x += 4) {
        for (let y = VY - capH + 3; y < VY - 2; y += 4) {
          if (hash(x * 7 + y * 13) > 0.5) ctx.fillRect(x, y, 2, 2)
        }
      }
    }

    function drawFurniture(now: number) {
      /** A pole rising from the pavement. */
      function pole(x: number, groundY: number, hgt: number) {
        ctx.fillStyle = '#23202b'
        ctx.fillRect(x, groundY - hgt, 2, hgt)
      }

      // Signals either side of the crossing, cycling off the clock.
      const phase = Math.floor(now / 5000) % 3
      const lamps = ['#e05242', '#e8bb45', '#55c467']
      for (const side of [-1, 1] as const) {
        const t = 0.26
        const x = Math.round(edgeAt(side, t) - side * 8)
        const groundY = Math.round(groundAt(t))
        const hgt = Math.round(height * 0.24)
        pole(x, groundY, hgt)
        const boxY = groundY - hgt
        ctx.fillStyle = '#171520'
        ctx.fillRect(x - 3, boxY - 2, 8, 16)
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = phase === i ? lamps[i] : '#2f2b3a'
          ctx.fillRect(x - 1, boxY + 1 + i * 4, 4, 3)
        }
      }

      // Lamp posts marching down both pavements, shrinking with distance.
      for (const side of [-1, 1] as const) {
        for (const t of [0.1, 0.34, 0.56, 0.74]) {
          const x = Math.round(edgeAt(side, t) - side * 4)
          const groundY = Math.round(groundAt(t))
          const hgt = Math.round(lerp(height * 0.3, height * 0.05, t))
          pole(x, groundY, hgt)
          ctx.fillStyle = '#f3e3a6'
          ctx.fillRect(x - side * 3, groundY - hgt, 3, 2)
        }
      }

      // Street sign and stop sign, nearest corner only — at any distance they
      // are unreadable shapes and read as litter.
      const sx = Math.round(edgeAt(1, 0.2) - 14)
      const sy = Math.round(groundAt(0.2))
      pole(sx, sy, Math.round(height * 0.22))
      ctx.fillStyle = '#3f7a4a'
      ctx.fillRect(sx - 18, sy - Math.round(height * 0.22), 24, 7)
      ctx.fillStyle = '#dfe6ea'
      ctx.fillRect(sx - 15, sy - Math.round(height * 0.22) + 3, 18, 1)
      ctx.fillStyle = '#b03a32'
      ctx.fillRect(sx - 13, sy - Math.round(height * 0.17), 15, 8)
      ctx.fillStyle = '#e8e2ee'
      ctx.fillRect(sx - 9, sy - Math.round(height * 0.17) + 3, 8, 2)
    }

    function draw(now: number) {
      ctx.clearRect(0, 0, width, height)
      drawSky()
      drawGround()
      drawBuildings()
      drawFurniture(now)

      // Two pigeons, crossing rarely. Any more and they are a flock.
      for (let i = 0; i < 2; i++) {
        const { x, y, frame, flip } = pigeonAt(now, i + 1, width, height)
        blit(ctx, PIGEON_FRAMES[frame], x, y, { flip })
      }

      /*
       * Traffic and crowd, sorted far to near so nearer figures overlap
       * further ones. Both are placed by depth: position interpolates toward
       * the vanishing point and the sprite scale steps 1, 2 or 3 — integers
       * only, because a sprite at 1.5x has soft edges.
       *
       * Deliberately few. Detail is what makes a street feel busy; a crowd
       * streaming past just makes it feel like a screensaver.
       */
      const cars = Array.from({ length: 4 }, (_, i) => ({ i, ...carAt(now, i + 1, width) }))
        .sort((a, b) => b.depth - a.depth)
      for (const c of cars) {
        const scale = c.depth > 0.4 ? 1 : c.depth > 0.22 ? 2 : 3
        const y = Math.round(groundAt(c.depth)) - 8 * scale
        const x = Math.round(lerp(c.along, VX, c.depth * 0.75))
        blit(ctx, CAR_FRAMES[c.frame], x, y, {
          overrides: { b: CAR_COLOURS[c.i % CAR_COLOURS.length] },
          flip: c.flip,
          scale,
        })
      }

      const people = Array.from({ length: 9 }, (_, i) => ({ i, ...walkerAt(now, i + 1, width) }))
        .sort((a, b) => b.depth - a.depth)
      for (const p of people) {
        const scale = p.depth > 0.55 ? 1 : p.depth > 0.3 ? 2 : 3
        const y = Math.round(groundAt(p.depth * 0.92)) - 11 * scale
        const x = Math.round(lerp(p.along, VX, p.depth * 0.8))
        blit(ctx, PERSON_FRAMES[p.frame], x, y, {
          overrides: { c: COAT_COLOURS[p.i % COAT_COLOURS.length] },
          flip: p.flip,
          scale,
        })
      }
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      draw(0)
      return
    }

    let raf = 0
    let last = -1
    const tick = (now: number) => {
      // Nothing here moves faster than a few pixels a second, so redrawing at
      // 60fps draws the same picture many times over. Ten a second is plenty
      // and leaves the frame budget alone.
      const frame = Math.floor(now / 100)
      if (frame !== last) {
        draw(now)
        last = frame
      }
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
