/**
 * The three questions a player may ask, and the only three.
 *
 * These are keys, not questions. The wording the model actually receives
 * lives in `api/ask.ts` on the server, so the client cannot influence it —
 * what travels over the wire is the string "how", "why" or "where".
 *
 * The two lists are deliberately separate files, because `api/` is bundled by
 * Vercel on its own and importing across that boundary is a good way to find
 * out at deploy time that you could not. `scripts/asktest.ts` asserts they
 * still agree, which is the cheap half of the same guarantee.
 */

export const QUESTION_KEYS = ['how', 'why', 'where'] as const

export type QuestionKey = (typeof QUESTION_KEYS)[number]

/**
 * What the button says. Lower case and blunt, the same register as the rest
 * of the game's labels — "Learn more about how this is produced" is a help
 * centre, and this is a game.
 */
export const QUESTION_LABELS: Record<QuestionKey, string> = {
  how: 'how is it made?',
  why: 'why does it work?',
  where: 'where is it used?',
}
