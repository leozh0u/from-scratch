import { useEffect, useRef } from 'react'
import { useViewport } from '../hooks/useViewport'

/**
 * The Survival backdrop: Leo's hillside SVG, with a thin layer of life on top.
 *
 * WHY THE ART IS AN ASSET NOW AND NOT PROCEDURAL
 *
 * Two earlier versions drew the whole forest from code, and both were worse
 * than the reference they were imitating. That is not surprising in hindsight:
 * a good pixel background is a piece of art somebody composed, and a generator
 * reproduces the rules of one without the judgement. The honest comparison was
 * Leo's — "it looks worse now" — and it did.
 *
 * The file is a VECTOR of pixel art, which is the ideal case here. Every edge
 * is a path, so it scales to any window with its hard edges perfectly intact —
 * none of the resampling mush that scaling a PNG would cause, and none of the
 * fixed-width problem that ruled out a raster in the first place.
 *
 * WHAT IS STILL DRAWN
 *
 * Only the movement. A static backdrop reads as a screenshot, so this adds the
 * minimum that makes a place feel alive: tufts of foliage along the edges that
 * sway, and the occasional leaf coming down. Deliberately sparse — the
 * backdrop is the room, not the subject, and anything more competes with the
 * game for attention.
 *
 * THE SWAY IS WHOLE PIXELS, NEVER A TRANSFORM
 *
 * From SLYNYRD's wind study: foliage moves by whole-pixel steps on a short
 * loop, each layer a beat behind the last. Rotating or skewing pixel art
 * resamples the grid and turns hard edges into grey mush — which is exactly
 * what the SVG is being used to avoid.
 */

/* Sampled from the SVG so the added foliage belongs to the same picture. */
const CANOPY_DEEP = '#011835'
const CANOPY_DARK = '#063b4f'
const CANOPY_MID = '#0f5a61'
const LEAF_LIGHT = '#70a470'
const LEAF_MID = '#3b826a'

/** Deterministic hash, so the same tufts appear on every load. */
function hash(n: number): number {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b)
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35)
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296
}

/**
 * The sway offset for a layer at a given moment, in whole pixels.
 *
 * Six positions on a slow loop. Exported and pure so the motion can be
 * asserted on rather than squinted at — the one thing that must never happen
 * is a fractional offset, because that is what puts pixels between pixels.
 */
export function swayAt(now: number, phase: number): { dx: number; dy: number } {
  const FRAME_MS = 240
  /*
   * Eight positions rather than six, reaching two pixels at the extremes.
   *
   * One pixel either side is a twitch; the eye reads it as a rendering
   * artefact rather than as wind. Two gives the tips somewhere to travel, and
   * the extra intermediate steps mean it still arrives there gradually instead
   * of snapping between two poses.
   */
  /*
   * Ten positions reaching three pixels, and the dy is now a property of the
   * WHOLE TUFT rather than of a row — see `tuft`, where applying it per row
   * was tearing the foliage in half.
   *
   * Three pixels rather than two because Leo's note was that the sway should
   * be more. At two the tips travel four pixels across a full cycle, which on
   * a 26-pixel-wide bush is a twitch; at three it is a lean.
   */
  const STEPS = [
    { dx: 0, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 2, dy: 0 },
    { dx: 3, dy: -1 },
    { dx: 2, dy: -1 },
    { dx: 0, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: -2, dy: 0 },
    { dx: -3, dy: -1 },
    { dx: -2, dy: -1 },
  ]
  const i = Math.floor(now / FRAME_MS + phase) % STEPS.length
  return STEPS[(i + STEPS.length) % STEPS.length]
}

/**
 * Where a falling leaf is at a given moment, in whole pixels.
 *
 * Falls at a steady rate and drifts side to side on a slow sine — what a real
 * leaf does, which is neither a straight drop nor chaos. Both coordinates are
 * floored so the leaf occupies a cell of the grid rather than sliding between
 * two.
 */
export function leafAt(
  now: number,
  seed: number,
  width: number,
  height: number,
): { x: number; y: number; frame: number } {
  // Long falls and few of them: "occasional" is the brief.
  const fallMs = 14000 + hash(seed * 13) * 16000
  const startX = hash(seed * 29) * width
  const drift = 7 + hash(seed * 41) * 14
  const t = ((now + hash(seed * 7) * fallMs) % fallMs) / fallMs
  return {
    x: Math.floor(startX + Math.sin(t * Math.PI * 3 + seed) * drift),
    // Starts above the frame so it enters rather than appearing.
    y: Math.floor(-6 + t * (height + 12)),
    frame: Math.floor(now / 240 + seed) % 2,
  }
}

type ForestSceneProps = {
  /** CSS pixels per overlay pixel. Integers only. */
  pixelScale?: number
  className?: string
}

export function ForestScene({ pixelScale = 4, className }: ForestSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { width: vw, height: vh } = useViewport()

  // The overlay is sized from the viewport so one drawn pixel is always the
  // same physical size — the fix the starfield needed after a fixed canvas
  // stretched its stars into giant plus signs.
  const width = Math.max(100, Math.ceil(vw / pixelScale))
  const height = Math.max(100, Math.ceil(vh / pixelScale))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const ctx = context

    /**
     * A tuft of foliage: overlapping rows narrowing upward, with a jittered
     * edge so it is ragged rather than an arch. The whole tuft is offset by a
     * whole-pixel sway scaled by how high up the row sits, so the tips move
     * and the base does not — which is what foliage in wind actually does.
     */
    function tuft(
      x: number,
      baseY: number,
      w: number,
      h: number,
      colour: string,
      seed: number,
      sway: { dx: number; dy: number },
      upward: boolean,
    ) {
      ctx.fillStyle = colour

      /*
       * THE BASE IS DRAWN PAST THE EDGE, SO IT CANNOT COME OFF IT.
       *
       * A tuft anchored exactly on the frame edge detaches the moment the sway
       * moves it a pixel the wrong way — which is what "the bottom ones
       * sometimes start floating" is. Overshooting by the sway's full
       * amplitude means the root is always outside the visible area and the
       * thing stays rooted no matter which pose it is in.
       */
      const ROOT_OVERSHOOT = 3

      /*
       * THE VERTICAL OFFSET BELONGS TO THE WHOLE TUFT, NOT TO A ROW.
       *
       * This is the bug Leo saw as "the pixels of the trees start floating",
       * and it was arithmetic rather than taste. Rows sit one pixel apart. If
       * row k shifts up by one and row k-1 does not, the scanline between them
       * is drawn by nobody — a one-pixel transparent seam straight across the
       * foliage, with the top half apparently hovering above the bottom. A
       * per-row vertical offset cannot avoid that: any row where the rounded
       * offset changes is a tear, and scaling it by height guarantees such a
       * row exists.
       *
       * Horizontal is different and stays per row. Each row is a solid bar, so
       * shifting it sideways moves an edge rather than opening a hole, and
       * that stepped edge is exactly what bending looks like.
       *
       * So dy moves the tuft as one object. The root overshoot below is what
       * lets it: three pixels of the base are drawn past the frame edge, so a
       * tuft that rises a pixel is still rooted outside the picture.
       */
      const tuftDy = sway.dy

      for (let i = -ROOT_OVERSHOOT; i < h; i++) {
        const t = Math.max(0, i) / h
        const jag = Math.round((hash(seed + i * 17) - 0.5) * 3)
        const halfW = Math.max(1, Math.round(w * (1 - t * 0.75)) + jag)
        /*
         * The bottom fifth does not bend at all. Scaling by height alone still
         * shifts the second and third rows once the amplitude reaches two
         * pixels, and a stem that slides at its base reads as sliding rather
         * than bending.
         */
        const anchored = t < 0.2 ? 0 : (t - 0.2) / 0.8
        const dx = Math.round(sway.dx * anchored)
        const y = upward ? baseY - i : baseY + i
        ctx.fillRect(x - halfW + dx, y + tuftDy, halfW * 2, 1)
      }
    }

    function draw(now: number) {
      ctx.clearRect(0, 0, width, height)

      /*
       * Bushes along the bottom edge and boughs along the top, in the SVG's
       * own darkest greens so they read as part of it. They sit at the edges
       * on purpose: that is where the UI is not, so the movement is visible in
       * peripheral vision without ever crossing a panel.
       */
      const lowSway = swayAt(now, 0)
      for (let i = 0; i < Math.ceil(width / 26); i++) {
        const x = Math.round(hash(i * 151) * width)
        const w = 6 + Math.round(hash(i * 173) * 7)
        const h = 5 + Math.round(hash(i * 191) * 8)
        tuft(x, height - 1, w, h, i % 2 ? CANOPY_DARK : CANOPY_DEEP, i * 31, lowSway, true)
      }

      /*
       * Boughs along the top edge only where the art is already dark — the
       * outer thirds. A first pass ran them the full width and they hung dark
       * blobs across the bright sky in the middle of the composition, which is
       * the one part of the picture worth keeping clear.
       */
      const highSway = swayAt(now, 2)
      for (let i = 0; i < Math.ceil(width / 30); i++) {
        const x = Math.round(hash(i * 211 + 7) * width)
        if (x > width * 0.24 && x < width * 0.76) continue
        const w = 5 + Math.round(hash(i * 233) * 6)
        const h = 4 + Math.round(hash(i * 251) * 7)
        tuft(x, 0, w, h, i % 2 ? CANOPY_DEEP : CANOPY_MID, i * 47, highSway, false)
      }

      /*
       * Fronds along the left and right edges, on their own phases.
       *
       * Motion only along the top and bottom left the middle two thirds of the
       * frame completely still, so the scene read as a picture with a moving
       * border. The sides are still outside where any panel sits, so this adds
       * life across the whole height without crossing the UI.
       */
      const sideSway = swayAt(now, 4)
      for (let i = 0; i < Math.ceil(height / 22); i++) {
        const y = Math.round(hash(i * 271 + 3) * height)
        const w = 4 + Math.round(hash(i * 293) * 5)
        const h = 5 + Math.round(hash(i * 311) * 9)
        const onLeft = i % 2 === 0
        // Drawn as an upward tuft rooted past the side edge, then nudged in.
        tuft(
          onLeft ? -2 : width + 2,
          y,
          w,
          h,
          i % 3 === 0 ? CANOPY_MID : CANOPY_DARK,
          i * 53,
          sideSway,
          true,
        )
      }

      // Occasional leaves. Eight in the air at once across the whole screen.
      for (let i = 0; i < 8; i++) {
        const { x, y, frame } = leafAt(now, i + 1, width, height)
        if (y < -4 || y > height) continue
        ctx.fillStyle = i % 2 ? LEAF_LIGHT : LEAF_MID
        // Two frames: flat, then edge-on — a leaf turning over as it falls.
        if (frame === 0) {
          ctx.fillRect(x, y, 2, 1)
          ctx.fillRect(x + 1, y + 1, 1, 1)
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
      // The sway steps every 260ms and leaves flutter every 240ms, so redrawing
      // faster than this draws the same picture twice.
      const frame = Math.floor(now / 110)
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
      <img
        src={`${import.meta.env.BASE_URL}forest-hillside.png`}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          /*
           * `cover` rather than `contain`, so the art always fills the frame
           * and is cropped instead of letterboxed. The source is square and
           * most windows are wide, so the crop takes it off the top and
           * bottom — which is the right place, because the composition's
           * interest is the band across the middle.
           */
          objectFit: 'cover',
          /*
           * Biased toward the top third, where the sky, the peaks and the
           * bright canopy are. `center` puts the dark forest floor behind the
           * panels and the picture reads as murky; this keeps the open, bright
           * band of the composition under the UI on any aspect ratio.
           */
          objectPosition: 'center 32%',
          /*
           * `pixelated`, and now it is finally correct.
           *
           * The backdrop used to be the SVG Leo supplied, and this property was
           * removed from it because forcing nearest-neighbour on a vector makes
           * Chrome rasterise at the intrinsic size and blow that up. Both true.
           *
           * The deeper problem was the file. A trace of pixel art keeps the
           * outlines and loses the grid: every block became a polygon with
           * fractional edges, so the "pixels" had ragged one-pixel steps and
           * blended corners. Measuring the trace recovered the original: runs
           * pile up at 4, 8, 12 and 16, and 75% of colour changes land on a
           * multiple of 4, so it was drawn at 128 and traced at 512.
           *
           * `scripts/snapToGrid.mjs` votes the palette over each cell of that
           * grid and writes a 128x128 PNG. Square blocks, 3.9KB instead of
           * 478KB, and nearest-neighbour is exactly what a bitmap wants.
           */
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
