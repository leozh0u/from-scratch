import { useEffect, useRef } from 'react'
import { LAND_COLS, LAND_ROWS, isLand } from '../art/landMask'

/**
 * The title screen's Earth: real coastlines, projected onto a sphere, drawn
 * one pixel at a time, turning slowly.
 *
 * WHY THIS IS NOT A SPRITE
 *
 * Everything else in the game is hand-authored text art (see PixelArt.tsx),
 * and that is the right format for a flame or a t-shirt. It is the wrong
 * format for this. A globe that turns needs a frame per rotation step, so a
 * sprite version means committing a dozen-plus 64x64 frames — locked
 * resolution, locked frame count, stepping instead of turning, and nobody can
 * meaningfully edit it. Projecting a ~2KB land mask at runtime is smaller,
 * renders at any size, and rotates continuously.
 *
 * WHY CANVAS AND NOT SVG
 *
 * PixelArt renders to SVG because a static sprite becomes a handful of merged
 * <rect> runs and stays crisp for free. This redraws every pixel on every
 * frame of a rotation; as SVG that is thousands of nodes being rebuilt sixty
 * times a second. Canvas draws it at its true pixel size and CSS scales it up
 * with `image-rendering: pixelated`, which is both faster and the same result.
 *
 * PIXEL DISCIPLINE
 *
 * Nothing here interpolates. Shading picks between a small number of discrete
 * colours rather than blending toward one, because a smooth gradient is the
 * single fastest way to make pixel art stop reading as pixel art. The palette
 * below is six colours for the whole planet, and that restraint is the look.
 */

type Palette = {
  oceanLit: string
  oceanDim: string
  landLit: string
  landDim: string
  ice: string
  outline: string
}

const DEFAULT_PALETTE: Palette = {
  oceanLit: '#4a86c8',
  oceanDim: '#2f5e96',
  landLit: '#6cbf43',
  landDim: '#3f7f34',
  ice: '#cfe0ec',
  outline: '#0b0a16',
}

/**
 * Earth's axial tilt. Not decoration — a globe drawn with the poles exactly
 * at top and bottom reads as a beach ball, and this is the difference between
 * "a sphere with continents on it" and "the planet".
 */
const AXIAL_TILT = (23.4 * Math.PI) / 180

/**
 * Where the discrete shading bands fall, as depth toward the viewer.
 *
 * `z` is 1 at the point facing the camera and 0 at the silhouette edge. Below
 * OUTLINE_Z is the rim, which gets a hard dark edge — that one-pixel outline
 * is what separates the planet from the starfield and is the most important
 * colour here. Between that and SHADE_Z is the dim band. It is two bands, not
 * a ramp, on purpose.
 */
const OUTLINE_Z = 0.14
const SHADE_Z = 0.42

/**
 * THE GLOBE TURNS IN WHOLE PIXELS, AND THAT IS WHY IT READS AS TURNING.
 *
 * It used to advance the longitude by a fraction of a radian on every one of
 * sixty frames a second. At a four-minute rotation that is far less than one
 * texel per frame, so what actually changed between frames was a scattered
 * handful of pixels flipping between two shades — which is not slow rotation,
 * it is noise. Leo's note was that it looked like random movement, and it was:
 * the rotation was real and invisible, and the dither was all you could see.
 *
 * A point at the centre of the disc crosses the visible face in half a turn,
 * so one full turn is worth two diameters of travel there. Stepping the
 * longitude in `2 x size` increments therefore moves the front of the world by
 * exactly ONE PIXEL a step, which is the smallest move that is a move at all.
 * Whole coastlines shift together, and the eye reads a sphere turning rather
 * than a texture shimmering.
 *
 * The frame rate falls out of that rather than being chosen: the canvas is
 * only redrawn when the step index changes, which at the default speed is
 * about four times a second. Low frame rate is the point. Sixty smooth frames
 * a second is what a 3D render looks like; four steps a second is what a
 * sprite sheet looks like, and everything else on this screen is a sprite.
 */
export function longitudeSteps(size: number): number {
  return Math.max(8, Math.round(size * 2))
}

/**
 * Latitude beyond which the surface reads as ice.
 *
 * Pushed out from 68 degrees twice, after looking at it drawn each time. The
 * globe is cropped so that only its northern crown is in frame and the axial
 * tilt turns that pole toward the viewer, so anything generous here paints a
 * bright blob across the middle of the picture rather than a cap at its edge.
 * 81 keeps the Arctic reading as ice while leaving it where a cap belongs.
 */
const ICE_LATITUDE = (81 * Math.PI) / 180

type PixelEarthProps = {
  /** Diameter in sprite pixels. The canvas is this size; CSS scales it up. */
  size?: number
  /** CSS pixels per sprite pixel. Integers only — see docs/DESIGN.md. */
  scale?: number
  /**
   * Seconds for one full rotation. 0 freezes it.
   *
   * 32 rather than the 180 it shipped at. The old value was chosen to be
   * unobtrusive and succeeded so completely that the planet appeared static
   * while still repainting sixty times a second — the worst of both, a
   * background that costs a redraw budget and reads as a still image.
   */
  secondsPerTurn?: number
  /** Starting longitude in degrees, so a still frame can be art-directed. */
  startLongitude?: number
  palette?: Partial<Palette>
  className?: string
  style?: React.CSSProperties
}

/**
 * The projection, as a pure function of longitude.
 *
 * Pulled out of the render loop so it can be checked without a browser. The
 * reason that matters: the animation is driven by `requestAnimationFrame`,
 * which browsers correctly refuse to run in a hidden tab, so "does a step
 * actually move the world" cannot be answered by watching a preview pane that
 * happens to be hidden. It can be answered by rendering two consecutive steps
 * and counting the pixels that differ, which is what scripts/earthtest.ts
 * does.
 *
 * Writes into `out` rather than allocating, because the render loop calls
 * this several times a second and a fresh RGBA buffer per step is garbage
 * for no reason.
 */
export function projectEarth(
  out: Uint8ClampedArray,
  size: number,
  longitude: number,
  colours: Record<keyof Palette, [number, number, number]>,
) {
  const radius = size / 2
  const centre = size / 2
  const sinTilt = Math.sin(AXIAL_TILT)
  const cosTilt = Math.cos(AXIAL_TILT)

  for (let py = 0; py < size; py++) {
    // +0.5 samples the centre of each pixel. Without it the globe is half a
    // pixel off-centre and the silhouette is lopsided at small sizes.
    const ny = (py + 0.5 - centre) / radius

    for (let px = 0; px < size; px++) {
      const nx = (px + 0.5 - centre) / radius
      const i = (py * size + px) * 4
      const r2 = nx * nx + ny * ny

      if (r2 > 1) {
        out[i + 3] = 0 // outside the disc: transparent, not background
        continue
      }

      const nz = Math.sqrt(1 - r2)

      // Un-tilt: rotate the sample point back about the screen x-axis so the
      // mask's own coordinates stay upright while the drawn globe leans.
      const ty = ny * cosTilt - nz * sinTilt
      const tz = ny * sinTilt + nz * cosTilt

      const latitude = Math.asin(Math.max(-1, Math.min(1, -ty)))
      const longitudeAt = Math.atan2(nx, tz) + longitude

      // Mask row 0 is the north pole.
      const row = Math.floor(((Math.PI / 2 - latitude) / Math.PI) * LAND_ROWS)
      const rawCol = Math.floor((longitudeAt / (2 * Math.PI)) * LAND_COLS)
      const col = ((rawCol % LAND_COLS) + LAND_COLS) % LAND_COLS

      const land = isLand(col, Math.min(LAND_ROWS - 1, Math.max(0, row)))
      const polar = Math.abs(latitude) >= ICE_LATITUDE

      let colour: [number, number, number]
      if (nz < OUTLINE_Z) colour = colours.outline
      else if (polar) colour = colours.ice
      else if (land) colour = nz < SHADE_Z ? colours.landDim : colours.landLit
      else colour = nz < SHADE_Z ? colours.oceanDim : colours.oceanLit

      out[i] = colour[0]
      out[i + 1] = colour[1]
      out[i + 2] = colour[2]
      out[i + 3] = 255
    }
  }
}

/** Parse '#rrggbb' once into the byte triple putImageData wants. */
export function toRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

/** The palette as byte triples, defaults filled in. */
export function rgbPalette(overrides?: Partial<Palette>) {
  const colours = { ...DEFAULT_PALETTE, ...overrides }
  return {
    oceanLit: toRgb(colours.oceanLit),
    oceanDim: toRgb(colours.oceanDim),
    landLit: toRgb(colours.landLit),
    landDim: toRgb(colours.landDim),
    ice: toRgb(colours.ice),
    outline: toRgb(colours.outline),
  }
}

export function PixelEarth({
  size = 64,
  scale = 8,
  secondsPerTurn = 32,
  startLongitude = 20,
  palette,
  className,
  style,
}: PixelEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // Kept in a ref rather than state: this changes every frame and re-rendering
  // React sixty times a second to move a globe would be absurd.
  const longitudeRef = useRef((startLongitude * Math.PI) / 180)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    // Narrowed once here; the closures below capture the non-null binding
    // rather than re-checking (or asserting) on every frame.
    const ctx = context

    const image = ctx.createImageData(size, size)
    const COLOURS = rgbPalette(palette)

    function draw(longitude: number) {
      projectEarth(image.data, size, longitude, COLOURS)
      ctx.putImageData(image, 0, 0)
    }

    // A judge may well be running with reduced motion on, and a background
    // that ignores it is a bug rather than a flourish. Draw one good frame.
    const still =
      secondsPerTurn <= 0 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (still) {
      draw(longitudeRef.current)
      return
    }

    let raf = 0
    const steps = longitudeSteps(size)
    const stepRadians = (2 * Math.PI) / steps
    const msPerStep = (secondsPerTurn * 1000) / steps
    const startedAt = performance.now()
    const startLongitudeRad = longitudeRef.current
    let lastStep = -1

    const tick = (now: number) => {
      /*
       * The step index comes from the clock, not from an accumulator.
       *
       * Accumulating elapsed time was what the previous version did, and it
       * drifts: a tab left in the background for a minute comes back either
       * lurching or frozen depending on how the clamp lands. Deriving the
       * step from absolute elapsed time means a backgrounded tab simply
       * resumes at wherever the world would be by now, which is what a planet
       * does.
       */
      const step = Math.floor((now - startedAt) / msPerStep)
      if (step !== lastStep) {
        lastStep = step
        longitudeRef.current = startLongitudeRad + step * stepRadians
        draw(longitudeRef.current)
      }
      raf = requestAnimationFrame(tick)
    }

    // One frame immediately, so the globe is never blank for up to a step.
    draw(longitudeRef.current)

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [size, secondsPerTurn, palette])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{
        width: size * scale,
        height: size * scale,
        imageRendering: 'pixelated',
        display: 'block',
        ...style,
      }}
    />
  )
}
