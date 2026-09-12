import type { VercelRequest, VercelResponse } from '@vercel/node'

/*
 * Runtime adjudicator — the ONLY place this game calls an LLM at runtime.
 * Everything else (recipe authoring) happens offline via scripts/propose.ts.
 *
 * Deliberately never sees the recipe list, and never can: the two element
 * NAMES are the entire prompt. Even if the model ignored its instructions
 * and tried to name a "real" recipe, there's no code path that turns its
 * text back into a discovery — the client only ever displays this as a
 * message, and only the actual recipeIndex lookup grants an element. That's
 * a structural guarantee, not a prompting one.
 *
 * Rate limiting and response caching both live client-side (src/adjudicator/
 * client.ts) — that's what actually decides whether a request gets sent at
 * all, which is where the credit really gets protected.
 */

const MODEL = 'gemini-flash-latest'
const MAX_NAME_LENGTH = 60
const MAX_REPLY_LENGTH = 300

/** Only the shape this handler actually reads out of Gemini's response. */
type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
}

const PROMPT = (a: string, b: string) => `A player in an educational crafting game just tried combining "${a}" and "${b}", and nothing happened — that pairing isn't a recipe in the game.

First decide privately: is combining these two things, via some real physical, chemical, or industrial process, actually a real thing? Then respond with exactly ONE short sentence, under 30 words:

- If it IS real (just not modeled in this particular game): start with "That's actually real" and briefly say what it does.
- If it is NOT physically meaningful: explain in simple terms why these two things don't interact or combine.

Rules: output only that one sentence, nothing else. Never mention any other material, object, or recipe by name — you don't know what else exists in this game, so don't guess or suggest what the player should try instead.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: null })
    return
  }

  const { a, b } = req.body ?? {}
  if (
    typeof a !== 'string' ||
    typeof b !== 'string' ||
    a.length === 0 ||
    b.length === 0 ||
    a.length > MAX_NAME_LENGTH ||
    b.length > MAX_NAME_LENGTH
  ) {
    res.status(400).json({ message: null })
    return
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    // Misconfigured, not the player's problem — fail quiet, client falls back.
    res.status(200).json({ message: null })
    return
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT(a, b) }] }],
        generationConfig: {
          // This model reasons by default and burns its output budget on
          // hidden "thinking" tokens before writing anything visible. Setting
          // thinkingBudget to 0 does NOT reliably suppress this for a
          // multi-instruction prompt like ours — measured thoughtsTokenCount
          // still ranged from ~75 to ~275 across test pairs even with budget
          // 0. So the real fix is headroom: 500 comfortably covers observed
          // thinking plus a ~30-word answer, rather than relying on thinking
          // being eliminated. (Confirmed via finishReason: MAX_TOKENS
          // truncating live responses at a 120-token ceiling before this fix.)
          maxOutputTokens: 500,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    })

    if (!geminiRes.ok) {
      res.status(200).json({ message: null })
      return
    }

    const data = (await geminiRes.json()) as GeminiResponse
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    const trimmed = typeof text === 'string' ? text.trim() : ''

    if (!trimmed || trimmed.length > MAX_REPLY_LENGTH) {
      res.status(200).json({ message: null })
      return
    }

    res.status(200).json({ message: trimmed })
  } catch {
    res.status(200).json({ message: null })
  }
}
