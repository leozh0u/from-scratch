import { useEffect, useRef } from 'react'
import { useViewport } from '../hooks/useViewport'

/**
 * The forest behind the Survival realm.
 *
 * WHY CANVAS AND WHY PROCEDURAL
 *
 * A hand-drawn forest is one fixed image at one fixed width, and this sits
 * behind a game that runs at any window size. Drawn procedurally from seeded
 * positions it fills any viewport, and the seed keeps it identical on every
 * load so it can be art-directed rather than re-rolled into something worse.
 *
 * HOW THE SWAY WORKS, AND WHY IT IS NOT A TRANSFORM
 *
 * From SLYNYRD's wind study, the technique real pixel artists use: a tree
 * sways by having its layers move in WHOLE PIXELS on a short loop — up and
 * right one, down one, left one, back — at about five frames a second, with
 * each layer starting a little later than the one below it.
 *
 * It is emphatically not a rotation or a skew. Rotating a sprite resamples the
 * pixel grid and turns every hard edge into grey mush, which is the exact
 * failure this whole visual direction exists to avoid. So the canopy here is
 * drawn at an integer offset that steps between a handful of values, and
 * trunks do not move at all — a trunk that bends is a rubber tree.
 *
 * LEGIBILITY COMES FIRST
 *
 * This is a backdrop for white text and bright controls, so it is drawn
 * considerably darker than a pixel forest normally would be. The references
 * are lit for a platformer where the forest IS the subject; here it is the
 * room the subject is standing in. Depth is carried by four flat greens that
 * get darker toward the front, which is the opposite of aerial perspective and
 * deliberately so: the near layer has to be dark enough to sit under a UI.
 */

/** Four depth bands, back to front. Darker and larger toward the viewer. */
const LAYERS = [
  { trunk: '#24402f', canopy: '#2f5a3c', spacing: 26, height: 0.42, width: 3, phase: 0 },
  { trunk: '#1d3626', canopy: '#284c33', spacing: 38, height: 0.56, width: 4, phase: 1 },
  { trunk: '#152a1d', canopy: '#1e3b28', spacing: 58, height: 0.74, width: 6, phase: 2 },
  { trunk: '#0d1b13', canopy: '#142a1c', spacing: 96, height: 0.98, width: 9, phase: 3 },
]

/** Hard bands of light between the trunks — no gradient, ever. */
const SKY = ['#1b2d20', '#22381f', '#2b4522', '#355125']

const GROUND = '#0b1710'
const GROUND_LIT = '#12261a'

/** Deterministic hash, so the same forest is drawn every time. */
function hash(n: number): number {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b)
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35)
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296
}

/**
 * The sway offset for a layer at a given moment, in whole pixels.
 *
 * Four positions on a loop — rest, up-right, down, left, rest — exactly as the
 * wind study describes. Exported and pure so the motion can be asserted on
 * rather than squinted at: the one thing that must never happen is a
 * fractional offset, because that is what puts pixels between pixels.
 */
export function swayAt(now: number, phase: number): { dx: number; dy: number } {
  const FRAME_MS = 200
  const STEPS: Array<{ dx: number; dy: number }> = [
    { dx: 0, dy: 0 },
    { dx: 1, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: -1, dy: -1 },
  ]
  const i = Math.floor(now / FRAME_MS + phase) % STEPS.length
  return STEPS[(i + STEPS.length) % STEPS.length]
}

type ForestSceneProps = {
  /** CSS pixels per scene pixel. Integers only. */
  pixelScale?: number
  className?: string
}

export function ForestScene({ pixelScale = 3, className }: ForestSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { width: vw, height: vh } = useViewport()

  // The canvas is sized from the viewport divided by the scale, so one scene
  // pixel is always the same physical size — the same fix the starfield needed
  // after a fixed-size canvas stretched its stars into giant plus signs.
  const width = Math.max(120, Math.ceil(vw / pixelScale))
  const height = Math.max(120, Math.ceil(vh / pixelScale))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const ctx = context

    const horizon = Math.round(height * 0.82)

    function draw(now: number) {
      // Sky: hard vertical bands, brightest toward the horizon, so the light
      // reads as coming from deep in the wood rather than from above.
      const bandHeight = Math.ceil(horizon / SKY.length)
      for (let i = 0; i < SKY.length; i++) {
        ctx.fillStyle = SKY[i]
        ctx.fillRect(0, i * bandHeight, width, bandHeight)
      }

      for (let l = 0; l < LAYERS.length; l++) {
        const layer = LAYERS[l]
        const sway = swayAt(now, layer.phase)
        const trunkTop = Math.round(horizon - height * layer.height)

        // Trees are placed at irregular intervals around a nominal spacing —
        // evenly spaced trunks read as a fence, which is the same failure mode
        // as evenly scattered stars.
        let x = -layer.spacing
        let n = 0
        while (x < width + layer.spacing) {
          const jitter = Math.round((hash(l * 977 + n * 31) - 0.5) * layer.spacing * 0.7)
          const tx = Math.round(x + jitter)
          const lean = Math.round((hash(l * 613 + n * 17) - 0.5) * 2)

          // Trunk. Deliberately does not sway: a trunk that bends is rubber.
          ctx.fillStyle = layer.trunk
          ctx.fillRect(tx, trunkTop, layer.width, horizon - trunkTop)

          /*
           * Canopy, as a stack of horizontal slabs narrowing upward. Each slab
           * is offset by the layer's whole-pixel sway, scaled by how far up the
           * tree it sits — the top moves, the base barely does, which is what
           * a tree in wind actually does and what a uniform offset does not.
           */
          const canopyBottom = trunkTop + Math.round((horizon - trunkTop) * 0.42)
          const canopyTop = trunkTop - Math.round(height * 0.06)
          const slabs = 5 + (l % 2)
          const slabHeight = Math.max(2, Math.round((canopyBottom - canopyTop) / slabs))

          ctx.fillStyle = layer.canopy
          for (let s = 0; s < slabs; s++) {
            const y = canopyBottom - s * slabHeight
            // 1 at the crown, 0 at the base of the canopy.
            const up = s / (slabs - 1 || 1)
            const spread = Math.round(layer.width * (3.2 - up * 1.9))
            const dx = Math.round(sway.dx * up) + lean
            const dy = Math.round(sway.dy * up)
            ctx.fillRect(
              tx + layer.width / 2 - spread + dx,
              y + dy,
              spread * 2,
              slabHeight,
            )
          }

          x += layer.spacing
          n++
        }
      }

      // Ground: two flat bands, the lit one catching the light from the back.
      ctx.fillStyle = GROUND_LIT
      ctx.fillRect(0, horizon, width, Math.max(2, Math.round(height * 0.03)))
      ctx.fillStyle = GROUND
      ctx.fillRect(0, horizon + Math.round(height * 0.03), width, height)
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      draw(0)
      return
    }

    let raf = 0
    let last = -1
    const tick = (now: number) => {
      // The sway steps at 200ms, so redrawing faster than that draws the same
      // picture. Throttling to the animation's own frame rate keeps a full
      // forest redraw off the critical path the rest of the time.
      const frame = Math.floor(now / 200)
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
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      aria-hidden="true"
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        imageRendering: 'pixelated',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
