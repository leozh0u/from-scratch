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

/*
 * WHICH CHAPTER THE PLAYER IS IN. Not recipe data.
 *
 * The structural guarantee is that this handler never learns what combines
 * with what, and a realm name does not tell it. What it does fix is a real
 * confusion: in Survival, the model kept answering "that's actually real"
 * about pairings that ARE real and are deliberately outside a fifteen-step
 * opening chapter. Correct, and it reads as the game admitting it is
 * unfinished. Told which chapter it is in, it can say the true thing instead:
 * real, and not here.
 */
const REALMS = ['survival', 'everyday'] as const
type Realm = (typeof REALMS)[number]

const SCOPE: Record<Realm, string> = {
  survival: `\n\nContext: the player is in the game's short opening chapter, which is only about making fire by hand from stone, wood and plant fibre. Be especially strict here — almost nothing in this chapter makes a genuinely new material, and saying otherwise implies the game is missing something when it is not.`,
  everyday: '',
}

/*
 * THE QUESTION HAD TO CHANGE, AND THIS IS THE WHOLE FIX.
 *
 * The first version asked whether combining the two was "actually a real
 * thing". Swept across all 152 Survival pairings that have no recipe, 88 of
 * them came back "that's actually real" — torch and ember, because the flame
 * transfers; fire and fire, because merging flames makes a larger fire; bark
 * and lit torch, because dry bark burns. Every one of those answers is true
 * and not one of them is a missing recipe. The model was answering "would
 * something happen", which for any two physical objects is almost always yes.
 *
 * The game's question is narrower and it is the one that matters: does
 * combining these PRODUCE A DISTINCT NEW THING — something with its own name
 * that you did not have before. Burning something is not making something.
 * Wetting it is not making something. One thing touching another is not
 * making something.
 *
 * Asked that way the "actually real" answer becomes rare and means what the
 * player thinks it means: this really is a gap, and it should be filled.
 */
const PROMPT = (a: string, b: string, realm: Realm) => `A player in an educational crafting game just tried combining "${a}" and "${b}", and nothing happened — that pairing isn't a recipe in the game.

First decide privately, and be strict about it: is there a real physical, chemical or industrial process by which these two together PRODUCE A DISTINCT NEW MATERIAL OR OBJECT — something that has its own name and is not just one of them in a different state?

These do NOT count as producing a new thing:
- one of them burning, igniting, melting, drying or heating the other
- one of them simply holding, containing, carrying, cutting, cleaning or protecting the other
- the two sitting together, touching, mixing without reacting, or piling up
- more of something you already have

Then respond with exactly ONE short sentence, under 30 words:

- If a real process DOES make a distinct new thing from these two: start with "That's actually real" and name what kind of process it is, without naming the product.
- Otherwise: say in simple terms what actually happens between them, or why nothing does. Do not start with "That's actually real".

Rules: output only that one sentence, nothing else. Never mention any other material, object, or recipe by name — you don't know what else exists in this game, so don't guess or suggest what the player should try instead.${SCOPE[realm]}`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: null })
    return
  }

  const { a, b, realm } = req.body ?? {}
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
  // A closed set, like the question keys in ask.ts, and defaulting to the
  // larger realm so an older client that sends nothing keeps working.
  const chapter: Realm = (REALMS as readonly string[]).includes(realm) ? (realm as Realm) : 'everyday'

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
        contents: [{ parts: [{ text: PROMPT(a, b, chapter) }] }],
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
