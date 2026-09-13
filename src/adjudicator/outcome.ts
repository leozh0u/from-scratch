/**
 * Why the model did not answer, said out loud.
 *
 * WHY THIS EXISTS
 *
 * Both endpoints used to collapse every possible failure into one soft
 * sentence — rate limited, endpoint missing, server error, offline, malformed
 * reply, all of them "nothing more to add right now." Leo, looking at a panel
 * that said exactly that for the fiftieth time: *"why is it always saiyng
 * notyhing more to add. isnt that for the api."*
 *
 * It is, and that is the problem. A message that covers every failure covers
 * the interesting one too: **you cannot tell an answer from a call that never
 * happened.** On a dev server there is no `/api` at all, so it fails every
 * single time and looks exactly like a model that had nothing to say — which
 * is the worst possible confusion to have in front of a judge, because the
 * demo appears to work and produces nothing.
 *
 * So each failure says which failure it is. None of these is an error dialog
 * and none of them blames the player; the card above still carries its
 * hand-written sourced blurb, so nothing is ever actually missing.
 */
export type Outcome = 'answer' | 'offline' | 'missing' | 'limited' | 'quiet'

/**
 * The shape both clients return.
 *
 * A string alone was not enough once the messages multiplied: the panel styles
 * a non-answer differently, and deciding that by comparing against the text
 * breaks the day a model happens to return the same sentence.
 */
export type Reply = { text: string; outcome: Outcome }

export const isAnswer = (reply: Reply) => reply.outcome === 'answer'

/**
 * Read a failed fetch and say what kind of failure it was.
 *
 * `missing` is the one worth separating. A 404 on `/api/ask` means there are
 * no functions behind this page — always true on `npm run dev`, and in
 * production it means the deploy did not carry them, which somebody needs to
 * notice rather than have smoothed over.
 */
export function classify(status: number | null): Exclude<Outcome, 'answer'> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline'
  if (status === null) return 'offline'
  if (status === 404 || status === 405) return 'missing'
  if (status === 429) return 'limited'
  return 'quiet'
}
