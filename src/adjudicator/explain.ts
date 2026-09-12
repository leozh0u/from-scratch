import { PROPERTIES, type Properties } from '../data/properties'

/**
 * The instant answer when two things do not combine.
 *
 * THE POINT
 *
 * Over 98% of the pairs a player can try do nothing, so "nothing happened" is
 * the sentence this game says most often by an enormous margin. It currently
 * takes five to ten seconds to say it, because every failure goes to Gemini.
 *
 * This answers in under a millisecond, offline, deterministically — and says
 * something more useful than a per-pair fact would. Every rule below is about
 * the GRAMMAR of making things: you need a material, something to act on it,
 * and usually energy. A player who picks that up starts predicting instead of
 * flailing, which is the difference between a puzzle and a lottery.
 *
 * WORDING MATTERS, AND IS CONSTRAINED
 *
 * None of these may claim a pair is impossible. The model layer underneath can
 * come back with "that's actually real, just not in this game", which is the
 * best moment the game has — and it would be flatly contradicting the line
 * above it if this had said "these cannot combine". So every line says what
 * does not happen HERE, or what is missing, and never what cannot exist.
 *
 * Pure and exported so the whole table can be exercised without a browser.
 */

export type Failure = {
  /** Shown immediately, in place of a spinner. */
  message: string
  /** Whether it is worth offering the model a look at this pair. */
  worthAsking: boolean
}

const NOTHING_OBVIOUS = 'Nothing obvious happens.'

/**
 * Order matters: the first rule that matches wins, so the specific ones come
 * before the general ones. Each is a plain function of the two tag sets rather
 * than a lookup, which is what lets 43 elements and 400 elements share it.
 */
type Rule = {
  id: string
  when: (a: Properties, b: Properties) => boolean
  message: string
  /** Some failures are dead ends worth explaining; others are just dull. */
  worthAsking?: boolean
}

/** Handy predicate: is one side this and the other side that? */
const pair = <K extends keyof Properties>(
  a: Properties,
  b: Properties,
  key: K,
  one: Properties[K],
  other: Properties[K],
) => (a[key] === one && b[key] === other) || (b[key] === one && a[key] === other)

/** Handy predicate: does either side have this property value? */
const either = <K extends keyof Properties>(
  a: Properties,
  b: Properties,
  key: K,
  value: Properties[K],
) => a[key] === value || b[key] === value

const both = <K extends keyof Properties>(
  a: Properties,
  b: Properties,
  key: K,
  value: Properties[K],
) => a[key] === value && b[key] === value

const RULES: Rule[] = [
  {
    id: 'two-tools',
    when: (a, b) => both(a, b, 'kind', 'tool'),
    message: 'A tool works on a material. Two tools have nothing to work on.',
  },
  {
    id: 'two-finished',
    when: (a, b) => both(a, b, 'stage', 'finished'),
    message: 'Both of these are already finished. Making needs something unfinished.',
  },
  {
    id: 'finished-plus-anything',
    when: (a, b) => either(a, b, 'stage', 'finished') && !either(a, b, 'kind', 'tool'),
    message: 'One of these is already made. Nothing here takes it further.',
  },
  {
    id: 'two-places',
    when: (a, b) => both(a, b, 'kind', 'place'),
    message: 'Two places. Nothing is being grown or dug here.',
  },
  {
    id: 'energy-on-energy',
    when: (a, b) => both(a, b, 'kind', 'energy'),
    message: 'Heat on heat is still just heat. It needs something to act on.',
  },
  {
    id: 'raw-minerals',
    when: (a, b) =>
      both(a, b, 'kind', 'mineral') && both(a, b, 'stage', 'raw'),
    message: 'Two rocks sitting together do nothing. Something has to bring heat or a reagent.',
  },
  {
    id: 'gas-and-gas',
    when: (a, b) => both(a, b, 'phase', 'gas'),
    message: 'Mixing two gases is not a reaction. Reactions need something to start them.',
    worthAsking: true,
  },
  {
    /*
     * Narrowed to actual cloth. It used to fire on the `fibre` PHASE, which
     * also covers bark, tinder and raw plant fibre, so knapping bark against a
     * stone was answered with "cloth and stone do not take to each other" —
     * true of cloth, and nonsense about bark. Raw organic fibre now falls
     * through to `organic-and-mineral`, which says something accurate about it.
     */
    id: 'cloth-and-mineral',
    when: (a, b) => pair(a, b, 'kind', 'textile', 'mineral'),
    message: 'Cloth and stone do not take to each other.',
  },
  {
    id: 'two-fuels',
    when: (a, b) => both(a, b, 'kind', 'fuel'),
    message: 'Two fuels, and nothing to light them.',
    worthAsking: true,
  },
  /*
   * EVERYTHING BELOW THIS LINE EXISTS BECAUSE 73% OF FAILURES FELL THROUGH.
   *
   * Measured across all 1,713 pairs that are not recipes: nine rules covered
   * a quarter of them and the rest got "Nothing obvious happens." In a game
   * where 98% of what you try fails, that sentence was the thing the game said
   * most often, and it teaches nothing.
   *
   * These are still grammar rather than trivia. A player who learns that a
   * tool needs a material, that a reagent needs something to react with, and
   * that fuel needs a flame, starts predicting instead of guessing. That is
   * worth more than 1,700 separate facts and it is the only version of this
   * that scales to Little Alchemy size.
   */
  {
    id: 'tool-on-rock',
    when: (a, b) => pair(a, b, 'kind', 'tool', 'mineral'),
    message: 'Tools shape things softer than themselves. Rock is not one of them.',
    worthAsking: true,
  },
  {
    id: 'tool-on-chemical',
    when: (a, b) => pair(a, b, 'kind', 'tool', 'chemical'),
    message: 'A chemical is not something you cut or press. It wants a reagent, not a tool.',
  },
  {
    id: 'tool-on-fuel',
    when: (a, b) => pair(a, b, 'kind', 'tool', 'fuel'),
    message: 'Fuel is for burning, not for shaping. This one is waiting on a flame.',
  },
  {
    id: 'tool-on-place',
    when: (a, b) => pair(a, b, 'kind', 'tool', 'place'),
    message: 'Ground is worked with what grows in it, not with this.',
  },
  {
    id: 'wrong-tool-for-the-fibre',
    when: (a, b) => pair(a, b, 'kind', 'tool', 'textile'),
    message: 'Not every tool touches cloth. This one has nothing to do to it.',
    worthAsking: true,
  },
  {
    id: 'two-reagents',
    when: (a, b) => both(a, b, 'kind', 'chemical'),
    message: 'Two reagents and nothing to react on. Chemistry needs a third thing here.',
    worthAsking: true,
  },
  {
    id: 'chemical-on-mineral',
    when: (a, b) => pair(a, b, 'kind', 'chemical', 'mineral'),
    message: 'Most rock shrugs off most chemicals. The ones that do dissolve are picky about which.',
    worthAsking: true,
  },
  {
    id: 'chemical-on-fuel',
    when: (a, b) => pair(a, b, 'kind', 'chemical', 'fuel'),
    message: 'A reagent does not refine a fuel. Heat does that, in a column.',
  },
  {
    id: 'chemical-on-metal',
    when: (a, b) => pair(a, b, 'kind', 'chemical', 'metal'),
    message: 'Metal comes out of its ore, not out of a bottle. This one is already reduced.',
    worthAsking: true,
  },
  {
    id: 'dry-organic',
    when: (a, b) => pair(a, b, 'kind', 'organic', 'chemical'),
    message: 'Something living and something reactive, with no heat and no water to carry it.',
    worthAsking: true,
  },
  {
    id: 'cloth-and-metal',
    when: (a, b) => pair(a, b, 'kind', 'textile', 'metal'),
    message: 'Cloth and metal sit side by side without becoming one thing.',
  },
  {
    id: 'cloth-and-fuel',
    when: (a, b) => pair(a, b, 'kind', 'textile', 'fuel'),
    message: 'Fibre and fuel, and nothing to set them off.',
  },
  {
    id: 'organic-and-mineral',
    when: (a, b) => pair(a, b, 'kind', 'organic', 'mineral'),
    message: 'Something grown and something dug up. They need heat between them to matter.',
    worthAsking: true,
  },
  {
    id: 'organic-and-metal',
    when: (a, b) => pair(a, b, 'kind', 'organic', 'metal'),
    message: 'Wood against metal is a workshop, not a recipe. One has to be worked into the other.',
  },
  {
    id: 'two-metals',
    when: (a, b) => both(a, b, 'kind', 'metal'),
    message: 'Two metals alloy only when both are molten. These are cold.',
    worthAsking: true,
  },
  {
    id: 'nothing-to-work-with',
    when: (a, b) => both(a, b, 'kind', 'textile'),
    message: 'Two lots of fibre. Spinning and weaving need a machine, not another handful.',
  },
  {
    id: 'place-and-anything',
    when: (a, b) => either(a, b, 'kind', 'place'),
    message: 'Ground grows things, given water and something to feed it. This is neither.',
  },
  {
    id: 'energy-and-tool',
    when: (a, b) => pair(a, b, 'kind', 'energy', 'tool'),
    message: 'Heat does not improve a tool that is already made. Point it at a material.',
  },
  {
    id: 'tool-with-nothing-to-bite',
    when: (a, b) => pair(a, b, 'kind', 'tool', 'organic'),
    message: 'A tool needs the right material under it. This one finds nothing to bite on here.',
    worthAsking: true,
  },
  {
    id: 'tool-on-finished',
    when: (a, b) => pair(a, b, 'kind', 'tool', 'product'),
    message: 'That one is finished. A tool would only take it apart again.',
  },
  {
    id: 'tool-on-cold-metal',
    when: (a, b) => pair(a, b, 'kind', 'tool', 'metal'),
    message: 'Cold metal keeps its shape. Heat it first and a tool has something to do.',
    worthAsking: true,
  },
  {
    id: 'fibre-on-fibre',
    when: (a, b) => pair(a, b, 'kind', 'organic', 'textile') || both(a, b, 'kind', 'organic'),
    message: 'Two lots of fibre lying together. Something has to twist, comb or weave them.',
    worthAsking: true,
  },
  {
    id: 'reagent-on-cloth',
    when: (a, b) => pair(a, b, 'kind', 'chemical', 'textile'),
    message: 'Cloth takes to a reagent only under the right conditions, and these are not them.',
    worthAsking: true,
  },
  {
    id: 'heat-on-cloth',
    when: (a, b) => pair(a, b, 'kind', 'energy', 'textile'),
    message: 'Heat on cloth scorches it. Scorching is not making.',
  },
  {
    id: 'heat-on-living',
    when: (a, b) => pair(a, b, 'kind', 'energy', 'organic'),
    message: 'Heat chars what grew. That is only useful when the char is the point.',
    worthAsking: true,
  },
  {
    id: 'heat-on-metal',
    when: (a, b) => pair(a, b, 'kind', 'energy', 'metal'),
    message: 'Heat alone softens metal. Shaping it wants something to press or roll it.',
  },
  {
    id: 'heat-on-product',
    when: (a, b) => pair(a, b, 'kind', 'energy', 'product'),
    message: 'Putting a finished thing back in the fire unmakes it rather than making it.',
  },
]



/**
 * Explain a pair that did not combine.
 *
 * Falls back deliberately softly. An untagged element or a pair no rule covers
 * gets the vaguest line in the file — and that is precisely the case most
 * worth handing to the model, because the local layer has nothing to say.
 */
export function explainFailure(idA: string, idB: string): Failure {
  const a = PROPERTIES[idA]
  const b = PROPERTIES[idB]
  if (!a || !b) return { message: NOTHING_OBVIOUS, worthAsking: true }

  for (const rule of RULES) {
    if (rule.when(a, b) || rule.when(b, a)) {
      return { message: rule.message, worthAsking: rule.worthAsking ?? false }
    }
  }

  return { message: NOTHING_OBVIOUS, worthAsking: true }
}

/** Exposed for the test, so the table can be walked rather than guessed at. */
export const RULE_IDS = RULES.map((r) => r.id)
