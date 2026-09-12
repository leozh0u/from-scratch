/*
 * Client side of the adjudicator: decides whether a request is even worth
 * sending, before it's sent. This is where the credit actually gets
 * protected — the serverless function has no memory between invocations, so
 * any rate limiting or caching that matters has to live here.
 *
 * Two independent guards, both checked before the network call:
 *   1. Cache — the same failing pair should never be re-asked. A player who
 *      tries "Flint + Dye" twice gets the identical message instantly the
 *      second time, at zero cost, forever (persisted, not just per-session).
 *   2. Rate limit — a rolling per-minute cap plus a hard per-session cap,
 *      so rapid mashing (a judge, a curious kid, anyone) can't burn through
 *      a small prepaid balance in seconds. Once limited, it falls back to
 *      the same generic message a network failure would produce — the
 *      player never sees an error, just a slightly less specific answer.
 */

const CACHE_KEY = 'from-scratch:adjudications'
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_PER_WINDOW = 5
const SESSION_CALL_CAP = 20

/*
 * What the game says when it cannot ask the model — offline, rate-limited, or
 * no key configured.
 *
 * This was "Nothing happens — at least not in a way anyone's figured out yet."
 * Leo's note was that it reads as AI, and it does: the hedge, the em-dash
 * qualifier, the vague appeal to nobody-knows. It is a sentence that carefully
 * avoids committing to anything.
 *
 * A game says the short, concrete thing. "They just sit there" is an
 * observation a person would make, and it is honest about what actually
 * happened, which is nothing.
 */
export const FALLBACK_MESSAGE = 'They just sit there.'

/**
 * Order-independent, matching how recipes themselves are looked up — and
 * scoped by realm, because the same pairing gets a different answer in the
 * tutorial than in the main game. Without the realm in the key, whichever
 * chapter you asked in first would answer for both forever.
 */
function pairKey(a: string, b: string, realm: string): string {
  return `${realm}:${[a, b].sort().join('+')}`
}

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
    // Best-effort — a failed write just means this pair gets re-asked once.
  }
}

// In-memory, not persisted: a fresh page load gets a fresh rolling window,
// which is fine — the session cap (also in-memory) is the real backstop.
let callTimestamps: number[] = []
let sessionCallCount = 0

function isRateLimited(): boolean {
  const now = Date.now()
  callTimestamps = callTimestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  return callTimestamps.length >= RATE_LIMIT_MAX_PER_WINDOW || sessionCallCount >= SESSION_CALL_CAP
}

/**
 * Explains why `idA + idB` didn't combine. Never throws, never returns
 * empty — always resolves to something displayable, whether that came from
 * the cache, a fresh call, or the offline fallback.
 */
export async function adjudicate(
  idA: string,
  idB: string,
  nameA: string,
  nameB: string,
  realm: string,
): Promise<string> {
  const key = pairKey(idA, idB, realm)
  const cache = readCache()
  if (cache[key]) return cache[key]

  if (isRateLimited()) return FALLBACK_MESSAGE

  callTimestamps.push(Date.now())
  sessionCallCount++

  try {
    const res = await fetch('/api/adjudicate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ a: nameA, b: nameB, realm }),
    })

    if (!res.ok) return FALLBACK_MESSAGE

    const data = await res.json()
    const message = typeof data?.message === 'string' && data.message.length > 0
      ? data.message
      : FALLBACK_MESSAGE

    cache[key] = message
    writeCache(cache)
    return message
  } catch {
    // Offline, DNS failure, the endpoint doesn't exist in local dev — all
    // the same to the player. The game stays fully playable either way.
    return FALLBACK_MESSAGE
  }
}
