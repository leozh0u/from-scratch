/**
 * The game's sound, synthesised rather than sampled.
 *
 * WHY NOT RECORDINGS FOR THESE
 *
 * A button click has to land in the same frame as the press. A decoded audio
 * buffer has real startup cost the first time it plays, and the one thing a
 * click cannot be is late — a late click feels like lag, which is worse than
 * silence. Synthesis starts the instant it is asked.
 *
 * It is also the more honest choice for this game. An NES made these sounds
 * with two square-wave channels, one triangle and one noise generator, and
 * nothing else. Building them the same way means the palette is period-correct
 * by construction rather than by imitation — the same argument as authoring
 * the art as text instead of exporting PNGs.
 *
 * Richer one-shots — a discovery fanfare, the receipt — are a different
 * problem and belong in ElevenLabs, generated offline and committed. See
 * scripts/generate-audio.mjs. These are the interface; those are the score.
 *
 * EVERYTHING HERE IS BEST-EFFORT. A browser that refuses an AudioContext, a
 * device with no output, an autoplay policy that has not been satisfied yet —
 * all of them end with the game silently not making a noise, never with an
 * error reaching the player.
 */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = false

const STORAGE_KEY = 'from-scratch:muted'

try {
  muted = localStorage.getItem(STORAGE_KEY) === '1'
} catch {
  // Private mode, blocked storage. Default to audible.
}

/**
 * Browsers refuse to start an AudioContext until the user has interacted with
 * the page, and a context created before that starts suspended and stays that
 * way. So this is called lazily from the first real gesture rather than at
 * module load — and resumes an existing suspended one, which is what happens
 * when a tab is backgrounded and comes back.
 */
function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!ctx) {
      ctx = new AudioContext()
      master = ctx.createGain()
      // Down from 0.9. Everything below is mixed relative to this, so the
      // whole interface gets quieter together rather than each sound being
      // retuned individually.
      master.gain.value = muted ? 0 : 0.55
      master.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function setMuted(next: boolean) {
  muted = next
  try {
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  } catch {
    // Not worth failing a mute over.
  }
  if (master && ctx) {
    // A hard cut on a gain node clicks audibly. Ten milliseconds is inaudible
    // as a fade and long enough to avoid the discontinuity.
    master.gain.setTargetAtTime(next ? 0 : 0.55, ctx.currentTime, 0.01)
  }
}

export function isMuted() {
  return muted
}

type ToneSpec = {
  /** Hz at the start of the note. */
  from: number
  /** Hz at the end. Equal to `from` for a flat tone. */
  to?: number
  /** Seconds. These are all very short; a UI sound over ~120ms drags. */
  length: number
  type?: OscillatorType
  gain?: number
  /** Seconds to wait before starting, for building small arpeggios. */
  delay?: number
}

/**
 * One note.
 *
 * The envelope matters more than the waveform. A tone that starts at full
 * volume clicks, because going from silence to full amplitude in one sample IS
 * a click — that was the fault in DREAD's jump sound, which had an instant
 * attack and read as a pop rather than a thud. So every note here ramps up
 * over a couple of milliseconds: fast enough to feel instant, slow enough not
 * to snap.
 *
 * The tail uses setTargetAtTime, an exponential decay, because linear fades
 * sound artificial — natural decay is exponential and the ear knows it.
 */
function tone(spec: ToneSpec) {
  const audioCtx = audio()
  if (!audioCtx || !master) return

  const { from, to = from, length, type = 'square', gain = 0.18, delay = 0 } = spec
  const start = audioCtx.currentTime + delay

  const osc = audioCtx.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(from, start)
  if (to !== from) {
    // Exponential, not linear: pitch is perceived logarithmically, so a linear
    // sweep sounds like it slows down as it falls.
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + length)
  }

  const env = audioCtx.createGain()
  /*
   * A slightly softer attack than the first version, which used 2ms.
   *
   * Leo's note was that the click was "a little too loud/abrupt". Abruptness
   * in a short sound is almost entirely the attack: at 2ms the waveform is
   * effectively a step, and a step has energy across the whole spectrum, which
   * the ear reads as a snap sitting on top of the note. Six milliseconds is
   * still well under the ~20ms where an attack becomes audible as a fade-in,
   * but it rounds the leading edge enough to stop it cracking.
   */
  env.gain.setValueAtTime(0.0001, start)
  env.gain.linearRampToValueAtTime(gain, start + 0.006)
  env.gain.setTargetAtTime(0.0001, start + length * 0.35, length * 0.28)

  /*
   * A gentle low-pass. A raw square wave at these frequencies is genuinely
   * harsh on modern speakers in a way it never was through a CRT's tinny one,
   * and a UI sound that plays hundreds of times per session has to be
   * comfortable rather than merely accurate.
   */
  const filter = audioCtx.createBiquadFilter()
  filter.type = 'lowpass'
  // Brought down from 3600. The upper harmonics of a square wave are what
  // make it read as harsh rather than as bright, and they carry almost none of
  // the pitch information — rolling them off earlier costs nothing audible
  // except the edge.
  filter.frequency.value = 2400
  filter.Q.value = 0.6

  osc.connect(env).connect(filter).connect(master)
  osc.start(start)
  osc.stop(start + length + 0.05)
}

/** A short burst of noise — the transient that makes a click feel physical
 * rather than purely tonal. */
function tick(gain = 0.1, length = 0.02) {
  const audioCtx = audio()
  if (!audioCtx || !master) return

  const frames = Math.max(1, Math.floor(audioCtx.sampleRate * length))
  const buffer = audioCtx.createBuffer(1, frames, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) {
    // Decays across the buffer so the noise is a strike, not a hiss.
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  }

  const src = audioCtx.createBufferSource()
  src.buffer = buffer

  // Band-passed rather than raw: full-spectrum noise reads as static, and the
  // part that sounds like two pieces of plastic meeting is the mid-top.
  const filter = audioCtx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 2200
  filter.Q.value = 0.9

  const env = audioCtx.createGain()
  env.gain.value = gain

  src.connect(env).connect(filter).connect(master)
  src.start()
}

/**
 * THE PRESS.
 *
 * Two layers, which is what separates a button from a beep: a noise transient
 * for the physical strike of the key bottoming out, and a short square tone
 * falling in pitch for the body of it. Falling, because a real key going down
 * is a descending sound — the same shape reversed on release.
 */
export function playPress() {
  // The noise transient is the abrupt part by nature, so it takes the biggest
  // cut — it is there to suggest contact, not to be heard as noise.
  tick(0.04, 0.014)
  tone({ from: 620, to: 380, length: 0.055, gain: 0.11, type: 'triangle' })
}

/** The release. Quieter, shorter and rising — the key coming back up. Without
 * it a button feels like it never let go. */
export function playRelease() {
  tone({ from: 420, to: 600, length: 0.035, gain: 0.05, type: 'triangle' })
}

/** Hover. Very quiet and very high; at this level it registers as texture
 * rather than as a sound, which is what stops it becoming irritating when the
 * pointer crosses a row of controls. */
export function playHover() {
  tone({ from: 1180, length: 0.022, gain: 0.022, type: 'triangle' })
}

/**
 * A locked control.
 *
 * Deliberately unmusical and low: a dull thud with no pitch movement, which is
 * the sound of something not giving. The temptation is a descending "error"
 * whine, and that reads as a malfunction rather than as a locked door.
 */
export function playLocked() {
  tick(0.035, 0.028)
  tone({ from: 150, to: 120, length: 0.12, gain: 0.11, type: 'triangle' })
}

/** A discovery. A rising major arpeggio — the oldest trick in the console
 * sound book, and it still works because a rising interval is read as a reward
 * before anything conscious happens. */
export function playDiscovery() {
  tone({ from: 523, length: 0.08, gain: 0.13 })
  tone({ from: 659, length: 0.08, gain: 0.13, delay: 0.07 })
  tone({ from: 784, length: 0.08, gain: 0.13, delay: 0.14 })
  tone({ from: 1047, length: 0.2, gain: 0.14, delay: 0.21 })
}

/** A combination that does nothing. Two flat low notes — a shrug, not a
 * buzzer. Failure is the main loop of this game (see ARCHITECTURE.md), so it
 * has to be something a player can hear several hundred times. */
export function playNoMatch() {
  tone({ from: 300, length: 0.07, gain: 0.1, type: 'triangle' })
  tone({ from: 240, length: 0.1, gain: 0.1, type: 'triangle', delay: 0.06 })
}

/** Picking an element up. */
export function playSelect() {
  tone({ from: 860, to: 1060, length: 0.03, gain: 0.055, type: 'triangle' })
}
