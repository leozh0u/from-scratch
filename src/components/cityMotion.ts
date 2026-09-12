/**
 * The small moving parts of the city, as pure functions.
 *
 * Everything here is deterministic in `now`, so the motion can be asserted
 * rather than watched. The forest's sway went the same way, and the shooting
 * stars only got fixed because their rate was measurable: they were in the
 * build for hours at a rate that read as "never".
 */

/** Deterministic hash in [0,1). Same seed, same answer, no RNG state. */
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Where an `objectFit: cover` image actually lands inside its box.
 *
 * The overlay has to agree with the backdrop to the pixel, because a light
 * drawn half a building away from its window is worse than no light at all.
 * `cover` scales by whichever axis needs more and centres the overflow; the
 * vertical bias matches the CSS `object-position`.
 */
export function coverTransform(
  imageSize: number,
  boxW: number,
  boxH: number,
  positionY: number,
): { scale: number; offsetX: number; offsetY: number } {
  const scale = Math.max(boxW / imageSize, boxH / imageSize)
  const drawn = imageSize * scale
  return {
    scale,
    offsetX: (boxW - drawn) / 2,
    offsetY: (boxH - drawn) * positionY,
  }
}

/**
 * Whether a given window is lit at this moment.
 *
 * A city at a distance does not twinkle; someone gets up, once, and a room goes
 * dark for a while. So each window has its own long period and spends most of
 * it in one state, and the ones that do change are a small minority. Anything
 * faster reads as a broken screen.
 */
export function windowLitAt(now: number, seed: number): boolean {
  /*
   * TUNED DOWN AFTER MEASURING IT. The first pass put one window in five on a
   * timer with a period of nine to thirty-five seconds, which across a few
   * hundred detected windows worked out at nearly eight changes a second. That
   * is a twinkle, and a city at this distance does not twinkle: somebody gets
   * up, once, and a room goes dark for a minute.
   *
   * One in eight, on periods of forty to a hundred and forty seconds.
   */
  if (hash(seed * 7.3) > 0.12) return true
  const period = 40_000 + hash(seed * 13.1) * 100_000
  const offset = hash(seed * 17.7) * period
  const t = (now + offset) % period
  // Dark for a short slice of a long cycle.
  return t > period * 0.18
}

export type Bird = { x: number; y: number; flap: number }

/**
 * A bird crossing the sky, or nothing, which is the usual answer.
 *
 * Same shape as the shooting stars and for the same reason: rare enough to be
 * an event, long enough on screen to be followed. A bird that crosses in half a
 * second is a dead pixel.
 */
export function birdAt(
  now: number,
  seed: number,
  width: number,
  skyHeight: number,
): Bird | null {
  /*
   * Measured at three birds on sixteen-to-thirty-eight second periods, the sky
   * had something in it 76% of the time, which is a flock rather than an
   * occasional bird. Longer periods put it near a third.
   *
   * Then pulled back in, because 34-to-80 seconds across two birds left the
   * sky empty long enough that Leo asked where the near bird had gone. The
   * measured target is a sky with something in it roughly half the time: often
   * enough to notice, rare enough that it is still a bird rather than a flock.
   */
  const period = 30_000 + hash(seed * 23.9) * 30_000
  const crossing = 8_000 + hash(seed * 29.3) * 5_000
  const t = (now + hash(seed * 31.7) * period) % period
  if (t > crossing) return null

  const progress = t / crossing
  const leftToRight = hash(seed * 37.1) > 0.5
  const travel = leftToRight ? progress : 1 - progress
  // A shallow arc rather than a straight line: birds do not fly on rails.
  const lane = 0.12 + hash(seed * 41.3) * 0.55
  const arc = Math.sin(progress * Math.PI) * skyHeight * 0.08

  return {
    x: Math.round(-20 + travel * (width + 40)),
    y: Math.round(skyHeight * lane - arc),
    // Two frames, and the wingbeat is the fastest thing on screen by design.
    flap: Math.floor(now / 170 + seed) % 2,
  }
}

/** A bird at this size is a silhouette, and two frames is the whole cycle. */
export const BIRD_FRAMES: string[][] = [
  ['.#...#.', '..###..', '.......'],
  ['.......', '#.....#', '.#####.'],
]

/**
 * A whole-pixel sway, the same shape the forest uses.
 *
 * Never a fraction and never a rotation: a pixel moved half a pixel is a
 * blurred pixel, and a rotated one is resampled off its own grid. The cycle
 * returns to rest, so nothing drifts away from where it started over an hour.
 *
 * Slow on purpose. Clouds at this distance do not scud.
 */
export function swayAt(now: number, seed: number, periodMs: number): -1 | 0 | 1 {
  const phase = (now + hash(seed * 53.7) * periodMs) % periodMs
  const step = phase / periodMs
  if (step < 0.25) return 0
  if (step < 0.5) return 1
  if (step < 0.75) return 0
  return -1
}

/**
 * A bird far enough away to be one pixel.
 *
 * The near birds are a five-pixel sprite with a wingbeat. These are a single
 * pixel high in the sky, crossing slowly, and they exist because a sky with
 * one thing in it reads as a decoration while a sky with two distances in it
 * reads as depth. Rarer than the near ones, or the sky turns into an aviary.
 */
export function farBirdAt(
  now: number,
  seed: number,
  width: number,
  skyHeight: number,
): { x: number; y: number } | null {
  const period = 50_000 + hash(seed * 61.3) * 50_000
  const crossing = 16_000 + hash(seed * 67.1) * 8_000
  const t = (now + hash(seed * 71.9) * period) % period
  if (t > crossing) return null

  const progress = t / crossing
  const leftToRight = hash(seed * 73.3) > 0.5
  const travel = leftToRight ? progress : 1 - progress
  const lane = 0.06 + hash(seed * 79.7) * 0.3

  return {
    x: Math.round(-4 + travel * (width + 8)),
    y: Math.round(skyHeight * lane + Math.sin(progress * Math.PI * 2) * 2),
  }
}

/**
 * A plane, very high and very rare.
 *
 * The rarest thing on screen by a wide margin: roughly one every three
 * minutes, taking half a minute to cross. That is deliberate. Birds are
 * scenery and a plane is an event, and the way you make something feel like an
 * event is to make the player wait for it without being told to.
 *
 * It flies above the birds, straight and level, because a plane at cruising
 * height does not manoeuvre. Returns the head position; the caller draws the
 * contrail behind it from `progress`.
 */
export function planeAt(
  now: number,
  seed: number,
  width: number,
  skyHeight: number,
): { x: number; y: number; leftToRight: boolean; trail: number } | null {
  const period = 150_000 + hash(seed * 83.1) * 120_000
  const crossing = 26_000 + hash(seed * 89.3) * 12_000
  const t = (now + hash(seed * 97.7) * period) % period
  if (t > crossing) return null

  const progress = t / crossing
  const leftToRight = hash(seed * 101.3) > 0.5
  const travel = leftToRight ? progress : 1 - progress
  // Well above the birds: they sit in the lower two thirds of the sky.
  const lane = 0.04 + hash(seed * 103.9) * 0.12

  return {
    x: Math.round(-8 + travel * (width + 16)),
    y: Math.round(skyHeight * lane),
    leftToRight,
    // The contrail grows behind it and thins out again as it leaves.
    trail: Math.max(0, Math.round(Math.sin(progress * Math.PI) * 7)),
  }
}

/** Five pixels of aeroplane: wings, and a body crossing them. */
export const PLANE_ROWS: string[] = ['..#..', '#####', '..#..']
