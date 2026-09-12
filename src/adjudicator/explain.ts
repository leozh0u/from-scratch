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
    id: 'fibre-and-mineral',
    when: (a, b) =>
      (a.phase === 'fibre' && b.kind === 'mineral') ||
      (b.phase === 'fibre' && a.kind === 'mineral'),
    message: 'Cloth and stone do not take to each other.',
  },
  {
    id: 'two-fuels',
    when: (a, b) => both(a, b, 'kind', 'fuel'),
    message: 'Two fuels, and nothing to light them.',
    worthAsking: true,
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
