import { useEffect, useRef } from 'react'
import { useViewport } from '../hooks/useViewport'

/**
 * The forest behind the Survival realm.
 *
 * WHY THIS IS DRAWN AND NOT AN IMAGE
 *
 * The obvious move is a pixel-art forest PNG. Two things rule it out. The
 * references to hand are watermarked stock, which cannot ship; and a fixed
 * image is one width, while this sits behind a game that runs at any window
 * size — scaling it either stretches the pixels, which destroys the whole
 * look, or tiles it, which reveals the seam. Drawn from a seed it fills any
 * viewport, is identical on every load so it can be art-directed, and costs a
 * few kilobytes.
 *
 * WHAT THE FIRST VERSION GOT WRONG
 *
 * It drew each tree as a stack of centred rectangles: a plain bar for the
 * trunk, five slabs for the canopy. Rectangles are what a forest is made of at
 * the lowest level and nothing else, so it read as a bar chart in green. A
 * pixel forest is not made of fewer shapes than a painted one — it is made of
 * the same shapes with hard edges. So this one has bark texture, canopy
 * silhouettes built from overlapping noisy lobes, shafts of light between the
 * trunks, undergrowth along the floor, and leaves coming down.
 *
 * HOW THE SWAY WORKS, AND WHY IT IS NOT A TRANSFORM
 *
 * From SLYNYRD's wind study, the technique real pixel artists use: foliage
 * moves in WHOLE PIXELS on a short loop — up-right one, down one, left one,
 * back — at about five frames a second, with each depth layer a beat behind
 * the one behind it. It is never a rotation or a skew. Rotating a sprite
 * resamples the grid and turns every hard edge into grey mush, which is the
 * exact failure this whole visual direction exists to avoid.
 *
 * Trunks do not move at all. A trunk that bends is a rubber tree.
 *
 * LEGIBILITY COMES FIRST
 *
 * This is the room the game is played in, not the subject. It is drawn darker
 * and lower-contrast than a pixel forest normally would be, because white
 * pixel type and saturated controls have to sit on top of it and win.
 */

type Layer = {
  trunk: [string, string, string]
  canopy: [string, string]
  /** Nominal horizontal gap between trunks, in scene pixels. */
  spacing: number
  /** Trunk width. */
  width: number
  /** Fraction of the frame height the tree occupies. */
  height: number
  /** How many 200ms beats this layer lags the one behind it. */
  phase: number
}

/** Four depth bands, back to front. Darker and heavier toward the viewer. */
const LAYERS: Layer[] = [
  {
    trunk: ['#24402f', '#2b4b37', '#1b3325'],
    canopy: ['#2f5a3c', '#274b33'],
    spacing: 21,
    width: 3,
    height: 0.46,
    phase: 0,
  },
  {
    trunk: ['#1d3626', '#24412d', '#16281c'],
    canopy: ['#28502f', '#20412a'],
    spacing: 33,
    width: 5,
    height: 0.62,
    phase: 1,
  },
  {
    trunk: ['#152a1d', '#1b3324', '#0f1f15'],
    canopy: ['#1e3b28', '#172e1f'],
    spacing: 52,
    width: 8,
    height: 0.82,
    phase: 2,
  },
  {
    trunk: ['#0c1911', '#111f16', '#07110b'],
    canopy: ['#122419', '#0d1a12'],
    spacing: 88,
    width: 13,
    height: 1.05,
    phase: 3,
  },
]

/** Hard bands of light, brightest at the horizon — the sun is deep in the
 * wood, not overhead. Never a gradient. */
const SKY = ['#16261b', '#1b2f1f', '#223a22', '#2b4826', '#35562a']

const SHAFT = '#3d6130'
const GROUND_LIT = '#1a3220'
const GROUND = '#0a1610'
const FERN = ['#1d3a24', '#254a2c']
const LEAF = ['#3c6b38', '#4e8043', '#2e5530']

/** Deterministic hash, so the same forest is drawn every time. */
function hash(n: number): number {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b)
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35)
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296
}

/**
 * The sway offset for a layer at a given moment, in whole pixels.
 *
 * Six positions on a loop, exactly as the wind study describes. Exported and
 * pure so the motion can be asserted on rather than squinted at — the one
 * thing that must never happen is a fractional offset, because that is what
 * puts pixels between pixels.
 */
export function swayAt(now: number, phase: number): { dx: number; dy: number } {
  const FRAME_MS = 200
  const STEPS = [
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

/**
 * Where a falling leaf is at a given moment, in whole pixels.
 *
 * Leaves fall at a steady rate and drift side to side on a slow sine, which is
 * what a real one does — it is not a straight drop and it is not chaotic. Both
 * coordinates are floored, so a leaf occupies a cell of the grid rather than
 * sliding smoothly between two.
 *
 * Pure, and exported, so the drift can be tested without watching it.
 */
export function leafAt(
  now: number,
  seed: number,
  width: number,
  height: number,
): { x: number; y: number; frame: number } {
  const fallMs = 9000 + hash(seed * 13) * 11000
  const startX = hash(seed * 29) * width
  const drift = 6 + hash(seed * 41) * 14
  const t = ((now + hash(seed * 7) * fallMs) % fallMs) / fallMs
  return {
    x: Math.floor(startX + Math.sin(t * Math.PI * 4 + seed) * drift),
    // Starts above the frame so it enters rather than appearing.
    y: Math.floor(-8 + t * (height + 16)),
    // Two-frame flutter, stepped: the leaf turns edge-on and back.
    frame: Math.floor(now / 180 + seed) % 2,
  }
}

type ForestSceneProps = {
  /** CSS pixels per scene pixel. Integers only. */
  pixelScale?: number
  className?: string
}

export function ForestScene({ pixelScale = 3, className }: ForestSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { width: vw, height: vh } = useViewport()

  // Sized from the viewport, so one scene pixel is the same physical size at
  // every window size — the same fix the starfield needed after a fixed-size
  // canvas stretched its stars into giant plus signs.
  const width = Math.max(120, Math.ceil(vw / pixelScale))
  const height = Math.max(120, Math.ceil(vh / pixelScale))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const ctx = context

    const horizon = Math.round(height * 0.86)

    function drawSky() {
      const band = Math.ceil(horizon / SKY.length)
      for (let i = 0; i < SKY.length; i++) {
        ctx.fillStyle = SKY[i]
        ctx.fillRect(0, i * band, width, band)
      }
    }

    /**
     * Shafts of light between the trunks.
     *
     * Hard-edged vertical bands, not a glow — a glow is a blur and a blur is
     * the one thing forbidden here. They narrow toward the floor because that
     * is the direction light actually spreads from a gap in a canopy, and it
     * is also what stops them reading as stripes on wallpaper.
     */
    function drawShafts() {
      ctx.fillStyle = SHAFT
      for (let i = 0; i < 7; i++) {
        const x = Math.round(hash(i * 331) * width)
        const top = Math.round(height * 0.05)
        const bottom = Math.round(horizon * (0.55 + hash(i * 97) * 0.3))
        const wTop = 2 + Math.round(hash(i * 53) * 4)
        for (let y = top; y < bottom; y += 2) {
          // Two-pixel steps so the taper is visibly stepped rather than smooth.
          const t = (y - top) / (bottom - top)
          const w = Math.max(1, Math.round(wTop * (1 - t * 0.75)))
          ctx.fillRect(x + Math.round((wTop - w) / 2), y, w, 2)
        }
      }
    }

    function drawTrunk(layer: Layer, x: number, top: number, seed: number) {
      const h = horizon - top
      const [mid, light, dark] = layer.trunk
      for (let y = 0; y < h; y++) {
        // The trunk narrows slightly with height and wanders by a pixel, so it
        // is not a perfect bar. A straight-sided rectangle is the single
        // biggest tell that a tree was drawn by a loop.
        const taper = Math.round((y / h) * (layer.width * 0.25))
        const wobble = Math.round(Math.sin((y + seed) * 0.12) * (layer.width > 5 ? 1 : 0))
        const w = Math.max(2, layer.width - taper)
        const tx = x + wobble

        ctx.fillStyle = mid
        ctx.fillRect(tx, top + y, w, 1)
        // Light down the left edge, dark down the right: one consistent light
        // source, which is what makes the set look like one hand drew it.
        ctx.fillStyle = light
        ctx.fillRect(tx, top + y, 1, 1)
        ctx.fillStyle = dark
        ctx.fillRect(tx + w - 1, top + y, 1, 1)

        // Bark: short vertical streaks at irregular intervals.
        if (w > 4 && hash(seed * 17 + y) > 0.82) {
          ctx.fillStyle = dark
          ctx.fillRect(tx + 1 + Math.floor(hash(seed + y) * (w - 2)), top + y, 1, 2)
        }
      }
    }

    /**
     * The canopy, as overlapping lobes rather than stacked slabs.
     *
     * Each lobe is an ellipse drawn a row at a time with its width jittered by
     * a pixel or two, which gives the ragged silhouette foliage actually has.
     * A smooth ellipse reads as a balloon; a rectangle reads as a bar chart.
     * The whole mass is offset by the layer's whole-pixel sway, scaled by
     * height so the crown moves and the base barely does.
     */
    function drawCanopy(
      layer: Layer,
      cx: number,
      baseY: number,
      seed: number,
      sway: { dx: number; dy: number },
    ) {
      const spread = layer.width * 3.4
      const lobes = 4 + Math.floor(hash(seed * 11) * 3)

      for (let l = 0; l < lobes; l++) {
        const lx = cx + Math.round((hash(seed * 31 + l) - 0.5) * spread * 1.5)
        const ly = baseY - Math.round(hash(seed * 43 + l) * spread * 1.1)
        const rx = Math.max(3, Math.round(spread * (0.45 + hash(seed * 59 + l) * 0.4)))
        const ry = Math.max(2, Math.round(rx * (0.55 + hash(seed * 71 + l) * 0.3)))

        // Height up the tree, 0 at the canopy base and 1 at the crown.
        const up = Math.min(1, Math.max(0, (baseY - ly) / (spread * 1.1 || 1)))
        const dx = Math.round(sway.dx * up)
        const dy = Math.round(sway.dy * up)

        ctx.fillStyle = layer.canopy[l % 2]
        for (let y = -ry; y <= ry; y++) {
          const k = Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)))
          const jitter = Math.round((hash(seed * 83 + l * 13 + y) - 0.5) * 3)
          const w = Math.max(1, Math.round(rx * k) + jitter)
          ctx.fillRect(lx - w + dx, ly + y + dy, w * 2, 1)
        }
      }
    }

    /** Ferns and grass along the floor, so the ground is not a bare slab. */
    function drawUndergrowth() {
      for (let i = 0; i < Math.ceil(width / 7); i++) {
        const x = Math.round(hash(i * 151) * width)
        const h = 3 + Math.round(hash(i * 173) * 7)
        ctx.fillStyle = FERN[i % 2]
        for (let y = 0; y < h; y++) {
          // A tuft: widest at the base, leaning as it rises.
          const lean = Math.round((y / h) * 2 * (hash(i * 191) > 0.5 ? 1 : -1))
          const w = Math.max(1, Math.round((1 - y / h) * 4))
          ctx.fillRect(x + lean, horizon - y, w, 1)
        }
      }
    }

    function drawLeaves(now: number) {
      for (let i = 0; i < 18; i++) {
        const { x, y, frame } = leafAt(now, i + 1, width, height)
        if (y < -4 || y > height) continue
        ctx.fillStyle = LEAF[i % LEAF.length]
        // Two frames: flat, then edge-on. A leaf turning over as it falls.
        if (frame === 0) {
          ctx.fillRect(x, y, 2, 1)
          ctx.fillRect(x + 1, y + 1, 1, 1)
        } else {
          ctx.fillRect(x, y, 1, 2)
        }
      }
    }

    function draw(now: number) {
      drawSky()
      drawShafts()

      for (const layer of LAYERS) {
        const sway = swayAt(now, layer.phase)
        const top = Math.round(horizon - height * layer.height)
        let x = -layer.spacing
        let n = 0
        while (x < width + layer.spacing) {
          // Irregular spacing: evenly spaced trunks read as a fence, the same
          // failure as evenly scattered stars.
          const jitter = Math.round((hash(layer.spacing * 977 + n * 31) - 0.5) * layer.spacing * 0.8)
          const tx = Math.round(x + jitter)
          const seed = layer.spacing * 613 + n * 17

          drawTrunk(layer, tx, top, seed)
          drawCanopy(
            layer,
            tx + Math.round(layer.width / 2),
            top + Math.round((horizon - top) * 0.3),
            seed,
            sway,
          )

          x += layer.spacing
          n++
        }
      }

      ctx.fillStyle = GROUND_LIT
      ctx.fillRect(0, horizon, width, Math.max(2, Math.round(height * 0.02)))
      ctx.fillStyle = GROUND
      ctx.fillRect(0, horizon + Math.round(height * 0.02), width, height)
      drawUndergrowth()
      drawLeaves(now)
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      draw(0)
      return
    }

    let raf = 0
    let last = -1
    const tick = (now: number) => {
      // The sway steps every 200ms and the leaves flutter every 180ms, so
      // redrawing faster than that draws the same picture twice. Throttling to
      // the animation's own rate keeps a full forest redraw off the critical
      // path the rest of the time.
      const frame = Math.floor(now / 90)
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
