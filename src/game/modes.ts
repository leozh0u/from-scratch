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

export type ModeId = 'standard' | 'purist' | 'easy' | 'cheater'

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
   * Every element is already yours.
   *
   * This is the only thing in the game that changes what you HAVE rather than
   * how much help you get. It turns the inventory into a reference book: open
   * anything, see the two things that make it, open either of those, and walk
   * the whole tree down to stone and wood. It lives behind a mode called
   * Cheater because that is what it is, and calling it something gentler would
   * be pretending.
   *
   * IT OPENS THE BENCH TOO, IN BOTH REALMS. Leo: *"make it so cheating mode has
   * everythhing unlocked, for survival and everthing"*, and then *"not only for
   * the inventory"*. Reveal used to stop at the inventory and the process list,
   * which made Cheater a book you could read and not a game you could play from
   * anywhere: you could look up how a t-shirt is made and still not put cotton
   * on the bench.
   *
   * The reveal itself is still a view and writes nothing. Anything you go on to
   * COMBINE is recorded like any other discovery, because it is one — the
   * recipe was real and you ran it. What the mode never does is mark things
   * found that you did not make, so every counter in the game still reports
   * what actually happened.
   */
  revealAll: boolean
}

export const MODES: Mode[] = [
  {
    id: 'standard',
    label: 'standard',
    blurb: 'earn hints',
    hints: true,
    infiniteHints: false,
    giveUp: true,
    revealAll: false,
  },
  {
    id: 'purist',
    label: 'purist',
    blurb: 'no hints',
    hints: false,
    infiniteHints: false,
    giveUp: false,
    revealAll: false,
  },
  {
    id: 'easy',
    label: 'easy',
    blurb: 'free hints',
    hints: true,
    infiniteHints: true,
    giveUp: true,
    revealAll: false,
  },
  {
    id: 'cheater',
    label: 'cheater',
    /*
     * Named plainly on purpose. Somebody who wants to read the whole graph
     * rather than play it should be able to, and calling that door something
     * gentler would be pretending the door was not there.
     */
    blurb: 'open',
    hints: true,
    infiniteHints: true,
    giveUp: true,
    revealAll: true,
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

/**
 * Whether the player has chosen to skip Survival.
 *
 * Stored beside the mode rather than inside the save, because it is a
 * preference rather than progress — but RESET CLEARS IT ANYWAY. See
 * `resetEverything` in App.tsx: "start over" has one plain meaning, and a
 * control that leaves something behind is one nobody can predict.
 */
const SKIP_KEY = 'from-scratch:skipped'

export function readSkipped(): boolean {
  try {
    return localStorage.getItem(SKIP_KEY) === '1'
  } catch {
    return false
  }
}

export function writeSkipped(next: boolean) {
  try {
    localStorage.setItem(SKIP_KEY, next ? '1' : '0')
  } catch {
    // Best effort; the session still honours the choice.
  }
}
