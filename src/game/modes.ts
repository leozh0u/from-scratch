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

export type ModeId = 'standard' | 'purist' | 'open' | 'cheater'

export type Mode = {
  id: ModeId
  label: string
  /**
   * What the mode does, printed on the extruded SIDE of its key rather than
   * as a caption under it — the same place the two realm buttons carry their
   * legends. Leo: "just say no hints in the bottom... by bottom i mean the
   * side, like shadow." Kept to two words so it fits without forcing the
   * corner buttons absurdly wide.
   */
  blurb: string
  /** Hints available at all. */
  hints: boolean
  /** Hints are unlimited rather than earned. */
  infiniteHints: boolean
  /** The give-up route may be shown. */
  giveUp: boolean
  /**
   * Everything is open from the start, without finishing Survival.
   *
   * This is the ONLY thing in the game that changes what is reachable rather
   * than how much help you get, which is why it lives behind a mode called
   * Cheater rather than behind a build flag. A flag is invisible and ships by
   * accident; a mode is a thing the player chose, with a name that tells them
   * what they chose.
   */
  skipTutorial: boolean
}

export const MODES: Mode[] = [
  {
    id: 'standard',
    label: 'standard',
    blurb: 'earned hints',
    hints: true,
    infiniteHints: false,
    giveUp: true,
    skipTutorial: false,
  },
  {
    id: 'purist',
    label: 'purist',
    blurb: 'no hints',
    hints: false,
    infiniteHints: false,
    giveUp: false,
    skipTutorial: false,
  },
  {
    id: 'open',
    label: 'open',
    blurb: 'unlimited hints',
    hints: true,
    infiniteHints: true,
    giveUp: true,
    skipTutorial: false,
  },
  {
    id: 'cheater',
    label: 'cheater',
    /*
     * Named plainly on purpose. The lock exists because Survival teaches the
     * verb and fifteen combinations is a short price for it — but a judge with
     * three minutes, or somebody who has already finished it once, should not
     * have to pay it again. Calling the door "cheater" lets them through
     * without pretending the door was not there.
     */
    blurb: 'skip tutorial',
    hints: true,
    infiniteHints: true,
    giveUp: true,
    skipTutorial: true,
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
