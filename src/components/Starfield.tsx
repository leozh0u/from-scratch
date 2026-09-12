import { useEffect, useRef } from 'react'

/**
 * The night sky behind everything.
 *
 * THREE RULES, ALL FROM DESIGN.md
 *
 * 1. Irregular, not scattered evenly. Stars placed by a plain random walk
 *    across a grid look like a CSS pattern, and a CSS pattern is exactly the
 *    "generated" tell the whole visual direction exists to avoid. These are
 *    placed by a seeded hash with a deliberate density gradient, and they are
 *    identical on every load so the sky can be art-directed rather than
 *    re-rolled into something worse.
 *
 * 2. Twinkling swaps between discrete brightness values. It never fades.
 *    A fade is a sub-pixel alpha ramp, which is the fastest way to stop pixel
 *    art reading as pixel art. A star here is one of three fixed greys and
 *    steps between them.
 *
 * 3. Whole pixels only. Every star sits on an integer cell of the pixel grid,
 *    and the canvas is drawn at true sprite resolution and scaled up by CSS.
 *
 * Drawn to one canvas rather than to hundreds of DOM nodes: a thousand
 * absolutely-positioned divs that each animate is a lot of layout work for
 * something nobody is meant to look at directly.
 */

/** Three fixed brightnesses. Stars step between these; they never blend. */
const BRIGHTNESS = ['#6f6c9a', '#a8a6c8', '#ffffff']

/**
 * Two kinds of star, in roughly this ratio. The plus-shaped ones are what
 * make it read as an 8-bit sky rather than as noise — see the Figma mock,
 * where the big stars are five-pixel crosses.
 */
const CROSS_SHARE = 0.22

type Star = {
  x: number
  y: number
  cross: boolean
  /** Index into BRIGHTNESS this star rests at. */
  base: number
  /** Milliseconds between brightness steps, or 0 for a star that never moves. */
  period: number
  phase: number
}

/**
 * Deterministic hash rather than Math.random.
 *
 * The sky has to be the same on every load — partly so it can be judged and
 * adjusted, and partly because a background that is different in every take
 * is a nuisance to film against.
 */
function hash(n: number): number {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b)
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35)
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296
}

function buildStars(width: number, height: number, count: number): Star[] {
  const stars: Star[] = []

  for (let i = 0; i < count; i++) {
    const x = Math.floor(hash(i * 3 + 1) * width)
    const y0 = hash(i * 3 + 2)

    /*
     * Squaring the vertical position crowds stars toward the top of the
     * frame and thins them out lower down, where the Earth sits. That is
     * partly composition — the planet needs clean sky around its limb to read
     * against — and partly the thing that stops the field looking uniform.
     */
    const y = Math.floor(y0 * y0 * height)

    const roll = hash(i * 3 + 3)
    const cross = roll < CROSS_SHARE
    // Crosses are the bright ones; small stars are mostly dim, which is what
    // gives the field depth without any blending.
    const base = cross ? 2 : roll < 0.55 ? 0 : 1
    // Only some stars twinkle. All of them twinkling is a disco, not a sky.
    const twinkles = hash(i * 7 + 11) < 0.35
    stars.push({
      x,
      y,
      cross,
      base,
      period: twinkles ? 700 + Math.floor(hash(i * 7 + 13) * 2600) : 0,
      phase: Math.floor(hash(i * 7 + 17) * 4000),
    })
  }

  return stars
}

type StarfieldProps = {
  /** Sprite-pixel dimensions of the canvas. CSS scales it to fill. */
  width?: number
  height?: number
  count?: number
  className?: string
  style?: React.CSSProperties
}

export function Starfield({
  width = 240,
  height = 150,
  count = 260,
  className,
  style,
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const ctx = context

    const stars = buildStars(width, height, count)

    function draw(now: number) {
      ctx.clearRect(0, 0, width, height)

      for (const star of stars) {
        let level = star.base
        if (star.period > 0) {
          // Step down one level, then back. Two discrete states, no ramp.
          const t = ((now + star.phase) % (star.period * 2)) / star.period
          if (t >= 1) level = Math.max(0, star.base - 1)
        }

        ctx.fillStyle = BRIGHTNESS[level]

        if (star.cross) {
          // Five pixels in a plus. Drawn as three fillRects rather than five
          // so it stays cheap at this count.
          ctx.fillRect(star.x, star.y - 1, 1, 3)
          ctx.fillRect(star.x - 1, star.y, 3, 1)
        } else {
          ctx.fillRect(star.x, star.y, 1, 1)
        }
      }
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      draw(0)
      return
    }

    let raf = 0
    // Twinkling is the slowest thing on screen and does not need 60fps. This
    // caps it at about 12 redraws a second, which is invisible for a stepped
    // animation and leaves the frame budget to the globe.
    let last = 0
    const tick = (now: number) => {
      if (now - last > 80) {
        draw(now)
        last = now
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [width, height, count])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        imageRendering: 'pixelated',
        ...style,
      }}
    />
  )
}
