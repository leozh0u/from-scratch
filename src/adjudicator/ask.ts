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

const CACHE_KEY = 'from-scratch:explanations'
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_PER_WINDOW = 6
const SESSION_CALL_CAP = 30

/**
 * What the card says when it cannot ask.
 *
 * Not an apology and not an error. The element already carries a hand-written
 * sourced blurb directly above this, so nothing is actually missing — the
 * extra answer just is not coming right now.
 */
export const FALLBACK_MESSAGE = 'Nothing more to add right now.'

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
export async function ask(elementId: string, name: string, question: QuestionKey): Promise<string> {
  if (!QUESTION_KEYS.includes(question)) return FALLBACK_MESSAGE

  const key = `${elementId}:${question}`
  const cache = readCache()
  if (cache[key]) return cache[key]

  if (isRateLimited()) return FALLBACK_MESSAGE

  callTimestamps.push(Date.now())
  sessionCallCount++

  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, question }),
    })
    if (!res.ok) return FALLBACK_MESSAGE

    const data = await res.json()
    const message =
      typeof data?.message === 'string' && data.message.length > 0 ? data.message : FALLBACK_MESSAGE

    if (message !== FALLBACK_MESSAGE) {
      cache[key] = message
      writeCache(cache)
    }
    return message
  } catch {
    // Offline, or running the dev server with no functions behind it. The
    // card stays complete either way.
    return FALLBACK_MESSAGE
  }
}
