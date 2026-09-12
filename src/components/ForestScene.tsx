import { useEffect, useRef } from 'react'
import { useViewport } from '../hooks/useViewport'

/**
 * The Survival backdrop: a bright hillside vista.
 *
 * WHAT CHANGED AND WHY
 *
 * The first two versions were a dark forest interior — you were standing among
 * the trunks, in the gloom. Leo's reference is the opposite picture and a much
 * better one: you are looking OUT over a valley. Blue sky, white cloud, grey
 * peaks, a ridge of conifers falling away, and a couple of near-black branches
 * framing the top corners. Bright and open rather than close and dim.
 *
 * That composition also solves a problem the dark version had. Framing
 * branches in the corners are exactly where a UI is not, and the open middle
 * is where the panels sit — so the busiest part of the picture is at the
 * edges and the calm part is under the controls. The dark forest had detail
 * everywhere and fought the interface for attention.
 *
 * EIGHT COLOURS, TAKEN FROM THE REFERENCE
 *
 * Not approximated — sampled. A limited palette is most of what makes pixel
 * art read as pixel art, and the discipline only works if it is actually kept:
 * every pixel drawn here is one of the eight constants below. No blending, no
 * gradients, no alpha.
 *
 * THE SWAY IS WHOLE PIXELS, NEVER A TRANSFORM
 *
 * From SLYNYRD's wind study: foliage moves by whole-pixel steps on a short
 * loop, each depth a beat behind the one behind it. Rotating or skewing a
 * sprite resamples the grid and turns every hard edge into grey mush, which is
 * the failure this whole visual direction exists to avoid. Only the near
 * branches and the tips of the ridge move; the mountains and the ground do
 * not, because they do not.
 */

/* The reference's entire palette. Nothing else may be drawn. */
const SKY = '#85bde2'
const SNOW = '#f7fcfd'
const ROCK = '#cbd0d3'
const LEAF_LIGHT = '#70a470'
const CONIFER_MID = '#3b826a'
const CONIFER_DARK = '#0f5a61'
const CONIFER_DEEP = '#063b4f'
const NEAR_BLACK = '#011835'

/** Deterministic hash, so the same hillside is drawn on every load. */
function hash(n: number): number {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b)
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35)
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296
}

/**
 * The sway offset for a layer at a given moment, in whole pixels.
 *
 * Six positions on a loop. Exported and pure so the motion can be asserted on
 * rather than squinted at — the one thing that must never happen is a
 * fractional offset, because that is what puts pixels between pixels.
 */
export function swayAt(now: number, phase: number): { dx: number; dy: number } {
  const FRAME_MS = 220
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
 * Where a drifting mote is at a given moment, in whole pixels.
 *
 * Falls at a steady rate and drifts side to side on a slow sine, which is what
 * a real leaf does — neither a straight drop nor chaos. Both coordinates are
 * floored so it occupies a cell of the grid rather than sliding between two.
 */
export function leafAt(
  now: number,
  seed: number,
  width: number,
  height: number,
): { x: number; y: number; frame: number } {
  const fallMs = 11000 + hash(seed * 13) * 13000
  const startX = hash(seed * 29) * width
  const drift = 8 + hash(seed * 41) * 16
  const t = ((now + hash(seed * 7) * fallMs) % fallMs) / fallMs
  return {
    x: Math.floor(startX + Math.sin(t * Math.PI * 4 + seed) * drift),
    // Starts above the frame so it enters rather than appearing.
    y: Math.floor(-8 + t * (height + 16)),
    frame: Math.floor(now / 200 + seed) % 2,
  }
}

type ForestSceneProps = {
  /** CSS pixels per scene pixel. Integers only. */
  pixelScale?: number
  className?: string
}

export function ForestScene({ pixelScale = 4, className }: ForestSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { width: vw, height: vh } = useViewport()

  // Sized from the viewport so one scene pixel is always the same physical
  // size — the same fix the starfield needed after a fixed canvas stretched
  // its stars into giant plus signs.
  const width = Math.max(100, Math.ceil(vw / pixelScale))
  const height = Math.max(100, Math.ceil(vh / pixelScale))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const ctx = context

    /** A blobby cloud: overlapping rows of flat white with a grey underside. */
    function drawCloud(cx: number, cy: number, scale: number, seed: number) {
      const lobes = 4 + Math.floor(hash(seed) * 3)
      for (let i = 0; i < lobes; i++) {
        const lx = cx + Math.round((hash(seed + i * 11) - 0.5) * scale * 2.6)
        const ly = cy + Math.round((hash(seed + i * 17) - 0.5) * scale * 0.5)
        const r = Math.max(2, Math.round(scale * (0.5 + hash(seed + i * 23) * 0.6)))
        ctx.fillStyle = SNOW
        for (let y = -r; y <= r; y++) {
          const k = Math.sqrt(Math.max(0, 1 - (y * y) / (r * r)))
          const w = Math.max(1, Math.round(r * k * 1.5))
          ctx.fillRect(lx - w, ly + y, w * 2, 1)
        }
        // One row of grey along the bottom — a flat underside, not a shadow.
        ctx.fillStyle = ROCK
        ctx.fillRect(lx - r, ly + r - 1, r * 2, 1)
      }
    }

    /**
     * A mountain: a jagged peak with snow on the sunlit face.
     *
     * Drawn row by row rather than as a polygon, because a polygon is filled
     * with antialiased edges and the whole point is that the slope should
     * visibly step.
     */
    function drawMountain(peakX: number, peakY: number, baseY: number, halfW: number, seed: number) {
      const h = baseY - peakY
      for (let y = 0; y < h; y++) {
        const t = y / h
        const jag = Math.round((hash(seed + y * 7) - 0.5) * 3)
        const w = Math.round(halfW * t) + jag
        ctx.fillStyle = ROCK
        ctx.fillRect(peakX - w, peakY + y, w * 2, 1)
        // Snow on the upper third, and only on the left face — one light
        // source, consistently applied, is what stops a set of peaks looking
        // like a row of grey triangles.
        if (t < 0.34) {
          ctx.fillStyle = SNOW
          ctx.fillRect(peakX - w, peakY + y, Math.max(1, Math.round(w * 0.9)), 1)
        }
        // The right face falls into shade, which in this palette is the sky
        // colour — exactly what the reference does.
        ctx.fillStyle = SKY
        ctx.fillRect(peakX + Math.round(w * 0.55), peakY + y, Math.round(w * 0.45), 1)
      }
    }

    /**
     * One conifer, as a jagged triangle.
     *
     * The jaggedness is the whole character of a fir at this resolution: each
     * row is the ideal triangle width plus a small random step, with the
     * occasional row pulled in hard to read as a gap between boughs. A clean
     * triangle reads as a traffic cone.
     */
    function drawConifer(
      x: number,
      topY: number,
      h: number,
      colour: string,
      seed: number,
      sway: { dx: number; dy: number },
    ) {
      const halfBase = Math.max(2, Math.round(h * 0.36))
      ctx.fillStyle = colour
      for (let y = 0; y < h; y++) {
        const t = y / h
        const ideal = halfBase * t
        const step = hash(seed + y * 13)
        // A hard notch every so often: the space between one bough and the next.
        const notch = step > 0.86 ? -Math.round(halfBase * 0.28) : 0
        const jag = Math.round((step - 0.5) * 2)
        const w = Math.max(1, Math.round(ideal + jag + notch))
        // The crown sways; the base does not. Scaled by height up the tree.
        const up = 1 - t
        const dx = Math.round(sway.dx * up)
        const dy = Math.round(sway.dy * up)
        ctx.fillRect(x - w + dx, topY + y + dy, w * 2 + 1, 1)
      }
    }

    /**
     * The near branches framing the top corners.
     *
     * These are the darkest thing in the picture and they sit where no UI ever
     * does, which is what lets the middle stay open. They sway a full pixel
     * more than anything else because they are nearest.
     */
    function drawBranch(
      rootX: number,
      rootY: number,
      dir: 1 | -1,
      length: number,
      seed: number,
      sway: { dx: number; dy: number },
    ) {
      ctx.fillStyle = NEAR_BLACK
      for (let i = 0; i < length; i++) {
        const t = i / length
        const bx = rootX + dir * i
        // The bough droops as it goes out, and the far end moves most.
        const by = rootY + Math.round(t * t * length * 0.55) + Math.round(sway.dy * t * 2)
        const sx = Math.round(sway.dx * t * 2)
        // Needle clusters hanging off the bough at irregular intervals.
        const needle = Math.round(3 + hash(seed + i * 19) * (10 * (1 - t * 0.6)))
        ctx.fillRect(bx + sx, by, 2, needle)
        if (hash(seed + i * 29) > 0.55) {
          ctx.fillRect(bx + sx - dir * 2, by + 1, 2, Math.round(needle * 0.7))
        }
      }
    }

    function draw(now: number) {
      const horizon = Math.round(height * 0.62)

      ctx.fillStyle = SKY
      ctx.fillRect(0, 0, width, height)

      // Clouds, high and wide.
      drawCloud(Math.round(width * 0.22), Math.round(height * 0.12), Math.round(height * 0.05), 3)
      drawCloud(Math.round(width * 0.56), Math.round(height * 0.08), Math.round(height * 0.06), 11)
      drawCloud(Math.round(width * 0.85), Math.round(height * 0.15), Math.round(height * 0.045), 19)

      // Peaks. Overlapping, tallest in the middle.
      drawMountain(Math.round(width * 0.34), Math.round(height * 0.22), horizon, Math.round(width * 0.22), 31)
      drawMountain(Math.round(width * 0.62), Math.round(height * 0.16), horizon, Math.round(width * 0.26), 47)
      drawMountain(Math.round(width * 0.86), Math.round(height * 0.27), horizon, Math.round(width * 0.2), 59)

      /*
       * Three ridges of conifers, darkening toward the viewer, each one lower
       * on the left than the right — the hillside falls away to the left, which
       * is what makes it a valley rather than a horizon.
       */
      const ridges = [
        { colour: CONIFER_MID, y: 0.6, h: 0.1, spacing: 5, phase: 0 },
        { colour: CONIFER_DARK, y: 0.72, h: 0.15, spacing: 7, phase: 1 },
        { colour: CONIFER_DEEP, y: 0.85, h: 0.2, spacing: 10, phase: 2 },
      ]
      for (const ridge of ridges) {
        const sway = swayAt(now, ridge.phase)
        const treeH = Math.round(height * ridge.h)
        for (let x = -ridge.spacing; x < width + ridge.spacing; x += ridge.spacing) {
          const seed = Math.round(x * 7 + ridge.y * 1000)
          const slope = Math.round((1 - x / width) * height * 0.06)
          const jitter = Math.round((hash(seed) - 0.5) * ridge.spacing)
          const top = Math.round(height * ridge.y) + slope + Math.round((hash(seed * 3) - 0.5) * treeH * 0.3)
          drawConifer(x + jitter, top, treeH, ridge.colour, seed, sway)
        }
      }

      // The floor the nearest ridge stands on.
      ctx.fillStyle = CONIFER_DEEP
      ctx.fillRect(0, Math.round(height * 0.97), width, height)

      // Framing branches, last so they sit over everything.
      const nearSway = swayAt(now, 3)
      drawBranch(0, Math.round(height * 0.04), 1, Math.round(width * 0.3), 71, nearSway)
      drawBranch(width, Math.round(height * 0.02), -1, Math.round(width * 0.26), 83, nearSway)

      // Motes drifting down through the open middle.
      for (let i = 0; i < 14; i++) {
        const { x, y, frame } = leafAt(now, i + 1, width, height)
        if (y < -4 || y > height) continue
        ctx.fillStyle = i % 3 === 0 ? LEAF_LIGHT : CONIFER_MID
        if (frame === 0) {
          ctx.fillRect(x, y, 2, 1)
        } else {
          ctx.fillRect(x, y, 1, 2)
        }
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
      // The sway steps every 220ms and the motes every 200ms, so redrawing
      // faster draws the same picture twice. Throttling to the animation's own
      // rate keeps a full redraw off the critical path the rest of the time.
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
