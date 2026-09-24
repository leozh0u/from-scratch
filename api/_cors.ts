import type { VercelRequest, VercelResponse } from '@vercel/node'

/*
 * WHO ELSE MAY CALL THESE, AND IT IS ONE ORIGIN.
 *
 * The game is also built from Leo's fork and served on GitHub Pages, which
 * serves files and cannot hold a Gemini key. That copy calls these functions
 * across origins instead, so they allow exactly that one. The fence does not
 * move: the same closed set of inputs arrives either way. And a CORS rule only
 * constrains browsers, so anything that could call these without one always
 * could; this adds no caller that did not already exist.
 *
 * The leading underscore keeps Vercel from serving this file as a route.
 */
const ALLOWED = new Set(['https://leozh0u.github.io'])

/** True when the request was a preflight and has been answered. */
export function cors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers?.origin
  if (typeof origin === 'string' && ALLOWED.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Methods', 'POST')
    res.setHeader('Access-Control-Allow-Headers', 'content-type')
    res.setHeader('Access-Control-Max-Age', '86400')
  }
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }
  return false
}
