/*
 * Client side of "learn more".
 *
 * Same two guards as the adjudicator, for the same reason: the serverless
 * function has no memory between invocations, so anything that decides
 * whether a request is worth sending has to live here.
 *
 * The difference is what gets sent. The adjudicator sends two element names;
 * this sends one name and a question KEY out of a closed set. There is
 * deliberately no function in this file that accepts a string of the player's
 * own — the type system will not let a free-form question through, and
 * neither will the handler.
 */

import { QUESTION_KEYS, type QuestionKey } from './questions'
import { API_ORIGIN, classify, type Outcome, type Reply } from './outcome'

const CACHE_KEY = 'from-scratch:explanations'
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_PER_WINDOW = 6
const SESSION_CALL_CAP = 30

/**
 * What the card says when it cannot ask, by reason.
 *
 * None of these is an apology and none is an error dialog. The element already
 * carries a hand-written sourced blurb directly above this, so nothing is ever
 * actually missing — but WHICH of these appears is information, and collapsing
 * them into one sentence threw it away. See adjudicator/outcome.ts.
 */
export const ASK_MESSAGES: Record<Outcome, string> = {
  answer: '',
  quiet: 'Nothing more to add right now.',
  limited: "That's enough questions for one session.",
  offline: 'No connection, so this one will have to wait.',
  missing: 'No answer service behind this page.',
}

/** Kept for callers that only want the neutral line. */
export const FALLBACK_MESSAGE = ASK_MESSAGES.quiet

function readCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeCache(cache: Record<string, string>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Best-effort. A failed write means this one gets asked again.
  }
}

let callTimestamps: number[] = []
let sessionCallCount = 0

function isRateLimited(): boolean {
  const now = Date.now()
  callTimestamps = callTimestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  return callTimestamps.length >= RATE_LIMIT_MAX_PER_WINDOW || sessionCallCount >= SESSION_CALL_CAP
}

/**
 * Asks one of the three fixed questions about an element the player has
 * already discovered. Never throws; always resolves to something displayable.
 *
 * Cached forever per element and question, so the same card reopened from the
 * inventory answers instantly and for free.
 */
export async function ask(
  elementId: string,
  name: string,
  question: QuestionKey,
): Promise<Reply> {
  const no = (outcome: Exclude<Outcome, 'answer'>): Reply => ({
    text: ASK_MESSAGES[outcome],
    outcome,
  })

  if (!QUESTION_KEYS.includes(question)) return no('quiet')

  const key = `${elementId}:${question}`
  const cache = readCache()
  if (cache[key]) return { text: cache[key], outcome: 'answer' }

  if (isRateLimited()) return no('limited')

  callTimestamps.push(Date.now())
  sessionCallCount++

  try {
    const res = await fetch(`${API_ORIGIN}/api/ask`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, question }),
    })
    if (!res.ok) return no(classify(res.status))

    const data = await res.json()
    const message = typeof data?.message === 'string' ? data.message.trim() : ''
    // An empty or malformed body is the model having declined, not the
    // service being absent — the request did reach it.
    if (!message) return no('quiet')

    cache[key] = message
    writeCache(cache)
    return { text: message, outcome: 'answer' }
  } catch {
    /*
     * A thrown fetch is the network, not the server: offline, DNS, or a dev
     * server that closed the connection. `classify(null)` reads
     * `navigator.onLine` to tell those apart where the browser knows.
     */
    return no(classify(null))
  }
}
