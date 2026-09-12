import { useEffect, useRef } from 'react'
import { useViewport } from '../hooks/useViewport'
import { coverTransform, windowLitAt, birdAt, farBirdAt, swayAt, BIRD_FRAMES } from './cityMotion'

/**
 * The Everyday Objects backdrop: a city avenue in daylight.
 *
 * WHY THIS REPLACED A PROCEDURAL CITY, AND WHY THAT IS NOT A RETREAT
 *
 * There were two hand-drawn versions before this one — flat facades, then a
 * full one-point perspective with a vanishing point, sloping rooflines, a
 * crossing that widened as it came forward, walkers and cars at three depths.
 * The perspective was correct and it still looked bad, which is the second
 * time on this project that a generated scene lost to a composed one. The
 * forest taught the same lesson. Accept it.
 *
 * Two things were wrong beyond taste, and both are informative:
 *
 * 1. **Both sides carry the picture.** The panels and the item shelf cover the
 *    centre third, so the only part of any backdrop a player ever sees is the
 *    left and right edges. The procedural city spent all its detail on the
 *    vanishing point — dead centre, permanently hidden. This composition puts
 *    storefronts, awnings, signage and fire escapes down both flanks, which is
 *    precisely where the picture survives.
 *
 * 2. **It is bright, and that costs something.** A dark scene would have made
 *    the panels easier; the brief was fun and bright, and readability is the
 *    HUD strip's job, not the backdrop's. The strip is already opaque for
 *    exactly this reason — white pixel type does not survive a pale sky, and
 *    the answer consoles used was to give the status line its own bar rather
 *    than to dim the world behind it.
 *
 * NOTHING MOVES, ON PURPOSE
 *
 * The forest sways because trees sway. A street at night does not, and the
 * standing note is that detail matters more than movement. The previous
 * version had nine walkers, four cars and two pigeons and still read as bland,
 * because motion is not detail. Sprite figures drawn by me on top of this
 * would also be in a visibly different hand from the art, which is the exact
 * seam that makes something look assembled rather than made.
 */

/*
 * The artwork's REAL size. It shipped at 512, but every run length in it is a
 * multiple of four and 100% of its colour transitions land on a multiple of
 * four, so it was a clean 4x upscale of a 128 grid. `npm run snap` reduced it
 * back, verified lossless across all 262,144 pixels.
 *
 * This matters to the overlay more than to the file size: a light has to be
 * drawn one of the ARTWORK's pixels wide. Drawn one 512-pixel wide it was a
 * quarter of a window and effectively invisible.
 */
const IMAGE_SIZE = 128
const OBJECT_POSITION_Y = 0.42

/**
 * Windows found in the artwork itself, with the wall colour beside each one.
 *
 * FOUND, NOT PLACED. A list of coordinates typed by hand would drift the
 * moment the art changed, and half the lights would end up on brickwork. This
 * reads the image and keeps the warm bright pixels, which in this picture are
 * exactly the lit windows and the shop signage.
 *
 * The wall colour is sampled a few rows below each window, so switching a
 * light off means painting the building's own tone over it rather than a
 * guessed grey.
 */
type Window = { x: number; y: number; off: string }

/**
 * A cloud, stored as its EDGES rather than its body.
 *
 * Two problems with keeping the whole region. It is 2,608 pixels in this
 * picture, redrawn every frame for a one-pixel shift. And erasing it needs the
 * colour behind, which the first version took as "whatever the top-left pixel
 * is" — in this image that corner is a dark building, so the clouds would have
 * been rubbed out in purple.
 *
 * A one-pixel sway only changes two columns: the edge it leaves and the edge
 * it arrives at. So each row of the cloud is a run, and each run remembers the
 * colour of the pixel immediately outside it on both sides. Sampled from the
 * artwork, so there is nothing to assume.
 */
type CloudRun = { y: number; x0: number; x1: number; before: string; after: string }
type Cloud = { runs: CloudRun[]; fill: string }

/**
 * A treetop: the topmost pixel of a column of foliage, and whatever sits
 * directly above it.
 *
 * Only the tips move, which is the forest's rule and the reason its sway reads
 * as wind rather than as the whole tree sliding. Storing the colour above each
 * tip is what lets one be erased without guessing.
 */
type Treetop = { x: number; y: number; leaf: string; above: string }

function findWindows(data: Uint8ClampedArray): Window[] {
  const found: Window[] = []
  const taken = new Set<string>()
  const at = (x: number, y: number) => (y * IMAGE_SIZE + x) * 4

  // Skip the top of the frame: that is sky, and a warm pixel up there is a
  // cloud edge rather than a window.
  for (let y = 10; y < IMAGE_SIZE - 2; y++) {
    for (let x = 1; x < IMAGE_SIZE - 1; x++) {
      const i = at(x, y)
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      // Warm and bright: a lit pane or a sign, never sky or masonry.
      if (!(r > 185 && g > 140 && b < 140 && r - b > 70)) continue
      // Thin them out, or a single lit facade becomes fifty flickering dots.
      const cell = `${x >> 1}:${y >> 1}`
      if (taken.has(cell)) continue
      taken.add(cell)
      const w = at(x, Math.min(IMAGE_SIZE - 1, y + 2))
      found.push({ x, y, off: `rgb(${data[w]},${data[w + 1]},${data[w + 2]})` })
    }
  }
  return found
}

/** Near-white, in the sky: a cloud. */
const isCloud = (r: number, g: number, b: number) => r > 200 && g > 205 && b > 210
/** Green enough to be foliage rather than a painted sign. */
const isLeaf = (r: number, g: number, b: number) => g > r + 14 && g > b + 10 && g > 60

/**
 * Everything the overlay animates, read out of the artwork in one pass.
 *
 * Found rather than placed, for the same reason throughout: a list of
 * coordinates typed by hand drifts the moment the art changes, and half of
 * them end up on brickwork.
 */
function analyse(data: Uint8ClampedArray) {
  const at = (x: number, y: number) => (y * IMAGE_SIZE + x) * 4
  const rgb = (i: number) => `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`

  // The sky is whatever the top-left corner is, which is sky in this picture
  // and in any street scene shot from the pavement.
  const sky = rgb(at(1, 1))

  /* --- the skyline: the first non-sky, non-cloud row in each column --- */
  const skyline = new Int16Array(IMAGE_SIZE)
  for (let x = 0; x < IMAGE_SIZE; x++) {
    skyline[x] = IMAGE_SIZE
    for (let y = 0; y < IMAGE_SIZE; y++) {
      const i = at(x, y)
      if (rgb(i) === sky || isCloud(data[i], data[i + 1], data[i + 2])) continue
      skyline[x] = y
      break
    }
  }

  /* --- clouds, by flood fill, kept only if they clear the skyline --- */
  const clouds: Cloud[] = []
  const seen = new Uint8Array(IMAGE_SIZE * IMAGE_SIZE)
  for (let y = 0; y < IMAGE_SIZE * 0.45; y++) {
    for (let x = 0; x < IMAGE_SIZE; x++) {
      const start = at(x, y)
      if (seen[y * IMAGE_SIZE + x]) continue
      if (!isCloud(data[start], data[start + 1], data[start + 2])) continue

      const pixels: { x: number; y: number }[] = []
      const stack = [[x, y]]
      let clear = true
      while (stack.length && pixels.length < 2000) {
        const [cx, cy] = stack.pop()!
        if (cx < 1 || cy < 0 || cx >= IMAGE_SIZE - 1 || cy >= IMAGE_SIZE) continue
        if (seen[cy * IMAGE_SIZE + cx]) continue
        const i = at(cx, cy)
        if (!isCloud(data[i], data[i + 1], data[i + 2])) continue
        seen[cy * IMAGE_SIZE + cx] = 1
        pixels.push({ x: cx, y: cy })
        if (cy >= skyline[cx]) clear = false
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
      }
      // Single specks are noise, not weather.
      if (!clear || pixels.length <= 14) continue

      // Collapse to one run per row, and sample what sits either side of it.
      const byRow = new Map<number, { min: number; max: number }>()
      for (const p of pixels) {
        const row = byRow.get(p.y)
        if (!row) byRow.set(p.y, { min: p.x, max: p.x })
        else { row.min = Math.min(row.min, p.x); row.max = Math.max(row.max, p.x) }
      }
      const runs: CloudRun[] = []
      for (const [ry, { min, max }] of byRow) {
        runs.push({
          y: ry,
          x0: min,
          x1: max,
          before: rgb(at(min - 1, ry)),
          after: rgb(at(max + 1, ry)),
        })
      }
      clouds.push({ runs, fill: rgb(at(x, y)) })
    }
  }

  /* --- treetops: foliage with something that is not foliage above it --- */
  const treetops: Treetop[] = []
  for (let x = 1; x < IMAGE_SIZE - 1; x++) {
    for (let y = Math.floor(IMAGE_SIZE * 0.35); y < IMAGE_SIZE - 1; y++) {
      const i = at(x, y)
      if (!isLeaf(data[i], data[i + 1], data[i + 2])) continue
      const up = at(x, y - 1)
      if (isLeaf(data[up], data[up + 1], data[up + 2])) continue
      treetops.push({ x, y, leaf: rgb(i), above: rgb(up) })
      break
    }
  }

  return { clouds, treetops }
}

type CitySceneProps = { className?: string }

export function CityScene({ className }: CitySceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const windowsRef = useRef<Window[] | null>(null)
  const cloudsRef = useRef<Cloud[]>([])
  const treetopsRef = useRef<Treetop[]>([])
  const { width, height } = useViewport()

  /*
   * Read the artwork once and remember where its lights are. Drawing the image
   * into an offscreen canvas is the only way to ask it that question, and it
   * costs one decode at startup.
   */
  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.src = `${import.meta.env.BASE_URL}big-city.png`
    img.decode().then(() => {
      if (cancelled) return
      const off = document.createElement('canvas')
      off.width = IMAGE_SIZE
      off.height = IMAGE_SIZE
      const ctx = off.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      ctx.drawImage(img, 0, 0, IMAGE_SIZE, IMAGE_SIZE)
      const pixels = ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE).data
      windowsRef.current = findWindows(pixels)
      const { clouds, treetops } = analyse(pixels)
      cloudsRef.current = clouds
      treetopsRef.current = treetops
    }).catch(() => {
      // No windows found means no flicker. The backdrop is still the backdrop.
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    // Narrowed once: `ctx` inside `draw` is a closure over the checked value.
    const ctx = context

    const { scale, offsetX, offsetY } = coverTransform(IMAGE_SIZE, width, height, OBJECT_POSITION_Y)
    // Whole pixels: a light drawn at a fractional offset is a blurred smear.
    const block = Math.max(1, Math.round(scale))
    const skyHeight = offsetY + IMAGE_SIZE * scale * 0.34

    function draw(now: number) {
      ctx.clearRect(0, 0, width, height)

      /*
       * Lights go OUT, never on. Painting the building's own colour over a
       * window that is already lit in the art needs no invented light colour
       * and cannot clash with it, which is the failure mode of drawing
       * anything by hand on top of someone else's picture.
       */
      const windows = windowsRef.current
      if (windows) {
        for (let i = 0; i < windows.length; i++) {
          if (windowLitAt(now, i + 1)) continue
          const w = windows[i]
          ctx.fillStyle = w.off
          ctx.fillRect(
            Math.round(offsetX + w.x * scale),
            Math.round(offsetY + w.y * scale),
            block,
            block,
          )
        }
      }

      /*
       * Clouds sway a whole pixel and come back. Painting sky over the old
       * position is only safe because `analyse` threw away any cloud that
       * touches the skyline, so there is never a roofline underneath.
       */
      const clouds = cloudsRef.current
      for (let c = 0; c < clouds.length; c++) {
        const dx = swayAt(now, c + 1, 26_000)
        if (dx === 0) continue
        const cloud = clouds[c]
        const paint = (px: number, py: number, colour: string) => {
          ctx.fillStyle = colour
          ctx.fillRect(
            Math.round(offsetX + px * scale),
            Math.round(offsetY + py * scale),
            block,
            block,
          )
        }
        for (const run of cloud.runs) {
          if (dx === 1) {
            // Leaves the left edge, arrives one past the right.
            paint(run.x0, run.y, run.before)
            paint(run.x1 + 1, run.y, cloud.fill)
          } else {
            paint(run.x1, run.y, run.after)
            paint(run.x0 - 1, run.y, cloud.fill)
          }
        }
      }

      /*
       * Only the tips of the foliage move, which is the forest's rule: a whole
       * tree sliding sideways reads as a bug, a moving canopy reads as wind.
       * The colour above each tip was stored when it was found, so erasing one
       * is not a guess.
       */
      const treetops = treetopsRef.current
      for (let t = 0; t < treetops.length; t++) {
        const dx = swayAt(now, t * 3 + 1, 6_400)
        if (dx === 0) continue
        const tip = treetops[t]
        ctx.fillStyle = tip.above
        ctx.fillRect(
          Math.round(offsetX + tip.x * scale),
          Math.round(offsetY + tip.y * scale),
          block,
          block,
        )
        ctx.fillStyle = tip.leaf
        ctx.fillRect(
          Math.round(offsetX + (tip.x + dx) * scale),
          Math.round(offsetY + tip.y * scale),
          block,
          block,
        )
      }

      // Distant birds: one pixel, high up, slower than the near ones.
      ctx.fillStyle = '#4a5170'
      for (let seed = 1; seed <= 3; seed++) {
        const far = farBirdAt(now, seed, width, skyHeight)
        if (!far) continue
        ctx.fillRect(far.x, far.y, block, block)
      }

      // Birds, in the sky and nowhere else.
      ctx.fillStyle = '#3b3f5c'
      for (let seed = 1; seed <= 2; seed++) {
        const bird = birdAt(now, seed, width, skyHeight)
        if (!bird) continue
        const rows = BIRD_FRAMES[bird.flap]
        for (let ry = 0; ry < rows.length; ry++) {
          for (let rx = 0; rx < rows[ry].length; rx++) {
            if (rows[ry][rx] !== '#') continue
            ctx.fillRect(bird.x + rx * block, bird.y + ry * block, block, block)
          }
        }
      }
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw(0)
      return
    }

    let raf = 0
    let last = 0
    const tick = (now: number) => {
      // Nothing here needs 60fps: the wingbeat is the fastest thing and it
      // changes six times a second.
      if (now - last > 90) {
        draw(now)
        last = now
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
        src={`${import.meta.env.BASE_URL}big-city.png`}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `center ${OBJECT_POSITION_Y * 100}%`,
          /*
           * `pixelated` IS RIGHT HERE, AND WAS WRONG A COMMIT AGO.
           *
           * Leo gave two files, "Big City.svg" and "Big City.png", and the SVG
           * looked like the obvious choice: vector, scales cleanly. It is
           * actually a lossy trace of the PNG. Rasterised side by side at 512
           * and compared pixel by pixel, SIXTY PERCENT of them differ. Five
           * sampled points matched, which is why the first check passed it.
           *
           * The PNG is the artwork. It is a bitmap, so nearest-neighbour is
           * exactly what it wants: at roughly 3x on a laptop every source pixel
           * becomes a clean 3x3 block instead of a bilinear smear.
           */
          imageRendering: 'pixelated',
        }}
      />

      {/* The lights and the birds, on the art's own grid. */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/*
       * A very light flat wash, not a gradient. Only enough to seat the picture
       * behind the interface. A uniform darkening keeps every pixel boundary
       * exactly where it was; a gradient would lay a smooth ramp across the
       * art, which is the same sin as blurring it.
       */}
      <div style={{ position: 'absolute', inset: 0, background: '#131033', opacity: 0.1 }} />
    </div>
  )
}
