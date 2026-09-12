/**
 * How the player wants to play.
 *
 * Three modes, and the reason there are three rather than two is that
 * "cheating" is the wrong frame for a game about how things are actually
 * made. Nobody is competing with anybody. What differs is how much help the
 * game gives, and different people want very different amounts of it — a
 * judge with three minutes wants the answers, somebody settling in for a long
 * evening does not want the temptation.
 *
 * The mode changes the HELP ONLY. It never changes the graph, the recipes, or
 * what an element costs, because those are claims about the world and a claim
 * about the world does not have a difficulty setting.
 */

export type ModeId = 'standard' | 'purist' | 'open'

export type Mode = {
  id: ModeId
  label: string
  /** One line, shown under the name in the picker. */
  blurb: string
  /** Hints available at all. */
  hints: boolean
  /** Hints are unlimited rather than earned. */
  infiniteHints: boolean
  /** The give-up route may be shown. */
  giveUp: boolean
}

export const MODES: Mode[] = [
  {
    id: 'standard',
    label: 'standard',
    blurb: 'hints are earned by playing',
    hints: true,
    infiniteHints: false,
    giveUp: true,
  },
  {
    id: 'purist',
    label: 'purist',
    blurb: 'no hints, no answers, work it out',
    hints: false,
    infiniteHints: false,
    giveUp: false,
  },
  {
    id: 'open',
    label: 'open',
    blurb: 'unlimited hints and routes',
    hints: true,
    infiniteHints: true,
    giveUp: true,
  },
]

export const DEFAULT_MODE: ModeId = 'standard'

const STORAGE_KEY = 'from-scratch:mode'

export function readMode(): ModeId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return MODES.some((m) => m.id === raw) ? (raw as ModeId) : DEFAULT_MODE
  } catch {
    // Blocked or corrupt storage. A missing preference is not worth a crash.
    return DEFAULT_MODE
  }
}

export function writeMode(id: ModeId) {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Best effort; the session still honours the choice.
  }
}

export function modeById(id: ModeId): Mode {
  return MODES.find((m) => m.id === id) ?? MODES[0]
}
