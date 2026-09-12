import type { VercelRequest, VercelResponse } from '@vercel/node'

/*
 * The second and last runtime LLM call: "learn more" on something you have
 * already made.
 *
 * THE PLAYER CANNOT WRITE THE PROMPT, AND THAT IS THE POINT.
 *
 * A chat box would let anyone type anything and send it to the model, and in
 * a game whose entire claim is that nothing is invented, the thing you least
 * want is a text field that will happily answer "what should I combine next"
 * with a guess. So the request body carries a QUESTION KEY out of a closed
 * set, not a question. The prompt for each key is written here, on the
 * server, and the only free text in the whole exchange is the element's own
 * name — which came out of gameData.ts in the first place.
 *
 * Open devtools and the most you can send is one of three enum values. There
 * is no code path by which arbitrary text reaches Gemini.
 *
 * Same structural guarantee as api/adjudicate.ts: this handler has never seen
 * the recipe list and could not name a real recipe if the model asked it to.
 * The client only ever renders this as prose, and only the recipe index grants
 * an element.
 */

const MODEL = 'gemini-flash-latest'
const MAX_NAME_LENGTH = 60
const MAX_REPLY_LENGTH = 420

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
}

/*
 * THREE QUESTIONS, AND NOT A FOURTH ABOUT COST.
 *
 * "What does this cost to make?" was the obvious fourth and it is exactly the
 * one that cannot be asked. The game's footprint figures are sourced, and a
 * model asked for a number will produce a plausible one that disagrees with
 * them. The receipt already answers cost, out of data a human checked. So the
 * model is asked about mechanism and never about magnitude.
 */
export const QUESTION_KEYS = ['how', 'why', 'where'] as const
export type QuestionKey = (typeof QUESTION_KEYS)[number]

const ASKS: Record<QuestionKey, string> = {
  how: 'How is it actually made or produced in the real world? Describe the process itself.',
  why: 'Why does the process work — what is physically or chemically going on?',
  where: 'Where does it turn up in ordinary life, and what is it used for?',
}

/*
 * The rules are the game's own rules, restated for the model.
 *
 * No other material by name, because naming one is indistinguishable from
 * hinting at a recipe, and this handler does not know which pairs are real so
 * it cannot even hint accurately. No figures, because the numbers this game
 * shows are sourced and an invented one would sit next to them contradicting
 * them. Short, because this is a panel in a game and not an article.
 */
const PROMPT = (name: string, key: QuestionKey) => `In an educational crafting game, a player has just made "${name}" and asked to learn more about it.

${ASKS[key]}

Rules:
- Answer in two or three short sentences, plain language, no lists and no headings.
- Do NOT state any number, quantity, percentage, temperature or date. Not one.
- Do NOT name any other material, object or ingredient. You do not know what else exists in this game, so naming something would read as a hint and would usually be wrong.
- Do NOT suggest what the player should make or try next.
- If you do not know what this is, say so plainly in one sentence rather than guessing.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: null })
    return
  }

  const { name, question } = req.body ?? {}
  if (
    typeof name !== 'string' ||
    name.length === 0 ||
    name.length > MAX_NAME_LENGTH ||
    typeof question !== 'string' ||
    !(QUESTION_KEYS as readonly string[]).includes(question)
  ) {
    res.status(400).json({ message: null })
    return
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    // Misconfigured, not the player's problem. The card falls back to the
    // blurb it already had, which is hand-written and sourced.
    res.status(200).json({ message: null })
    return
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT(name, question as QuestionKey) }] }],
        generationConfig: {
          // Headroom rather than suppression — see the note in adjudicate.ts.
          // This prompt asks for three sentences instead of one, so the
          // ceiling is higher.
          maxOutputTokens: 700,
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
