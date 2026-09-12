/**
 * "Learn more" cannot become a chat box by accident.
 *
 * The feature's whole safety argument is structural rather than a matter of
 * prompting: the player sends a KEY out of a closed set, the server owns the
 * wording, and the handler rejects anything else. That argument only holds
 * while three things stay true, and all three are one careless edit away from
 * not being true, so they are asserted here.
 *
 *   1. The two question lists — one in `src/` for the buttons, one in `api/`
 *      for the prompts — still agree. They are separate files because Vercel
 *      bundles `api/` on its own, which makes drift possible.
 *   2. Every key the UI can send is one the handler accepts, and nothing else
 *      is.
 *   3. The prompt still carries the rules that make an answer safe to print
 *      next to sourced data: no figures, no other materials by name, no
 *      suggestions about what to make next.
 */
import { readFileSync } from 'node:fs'
import { QUESTION_KEYS, QUESTION_LABELS } from '../src/adjudicator/questions'
import { toWholeSentences } from '../api/ask'

let pass = 0, fail = 0
const ok = (l: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  ok    ${l}${d ? '  — ' + d : ''}`) }
  else { fail++; console.log(`  FAIL  ${l}${d ? '  — ' + d : ''}`) }
}

const handler = readFileSync(new URL('../api/ask.ts', import.meta.url), 'utf8')
/*
 * Comments stripped for the import check below. The file TALKS about the
 * recipe list at length, explaining why it does not have one, and a naive
 * grep reads that prose as the thing it is denying.
 */
const handlerCode = handler.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const client = readFileSync(new URL('../src/adjudicator/ask.ts', import.meta.url), 'utf8')

console.log('\n=== the question list is closed at both ends ===')
{
  const declared = handler.match(/export const QUESTION_KEYS = \[([^\]]+)\]/)
  ok('the handler declares its own list', declared !== null)
  const serverKeys = (declared?.[1] ?? '')
    .split(',')
    .map((s) => s.trim().replace(/^'|'$/g, ''))
    .filter(Boolean)

  ok('and it matches the one the buttons use',
     serverKeys.join('|') === [...QUESTION_KEYS].join('|'),
     `${serverKeys.join(', ')} vs ${[...QUESTION_KEYS].join(', ')}`)

  ok('every key has a prompt behind it',
     serverKeys.every((k) => new RegExp(`^\\s*${k}:`, 'm').test(handler)),
     `${serverKeys.length} prompts`)

  ok('and a button label in front of it',
     QUESTION_KEYS.every((k) => typeof QUESTION_LABELS[k] === 'string' && QUESTION_LABELS[k].length > 0))

  /*
   * The handler must reject anything not in the list. Checked by reading the
   * guard rather than by running it, because running it would need a Vercel
   * request object — and the guard is one line, so reading it is honest.
   */
  ok('the handler rejects a question it does not know',
     /QUESTION_KEYS as readonly string\[\]\)\.includes\(question\)/.test(handler))
  ok('and rejects a missing or overlong name',
     /typeof name !== 'string'/.test(handler) && /name\.length > MAX_NAME_LENGTH/.test(handler))
}

console.log('\n=== nothing the player types can reach the model ===')
{
  /*
   * The body sent from the client is `{ name, question }` and nothing else.
   * `name` comes out of gameData.ts, `question` is one of three literals.
   * There is no parameter anywhere in the client that carries player text.
   */
  ok('the client sends only a name and a key',
     /JSON\.stringify\(\{ name, question \}\)/.test(client))
  ok('and takes a typed key, not a string',
     /question: QuestionKey/.test(client))
  ok('and re-checks the key before sending',
     /QUESTION_KEYS\.includes\(question\)/.test(client))
}

console.log('\n=== the prompt keeps the rules the game is built on ===')
{
  ok('no number may appear in an answer',
     /Do NOT state any number/.test(handler),
     'sourced figures must not be contradicted')
  ok('no other material may be named',
     /Do NOT name any other material/.test(handler),
     'naming one is indistinguishable from hinting a recipe')
  ok('and no suggestion of what to make next',
     /Do NOT suggest what the player should make/.test(handler))
  ok('not knowing is an allowed answer',
     /If you do not know/.test(handler))
  ok('the handler never sees the recipe list',
     !/gameData|RecipeDef|\bfrom '\.\.\/src/.test(handlerCode),
     'no import reaches the game data')
  ok('and fails quiet rather than erroring at the player',
     (handler.match(/message: null/g) ?? []).length >= 4)
}

console.log('\n=== a cut-off answer never reaches the panel ===')
{
  /*
   * Live, charcoal's "where" answer came back ending "it helps purify and
   * freshen" — the model's own token ceiling, mid-clause. Two whole sentences
   * are a fine answer; three and a fragment look like a broken feature.
   */
  ok('a truncated tail is dropped',
     toWholeSentences('It is burned to cook. It is used for art. Additionally it helps purify and freshen')
       === 'It is burned to cook. It is used for art.')
  ok('a complete answer is left alone',
     toWholeSentences('It is burned to cook. It is used for drawing. It also filters.')
       === 'It is burned to cook. It is used for drawing. It also filters.')
  ok('question and exclamation marks end a sentence too',
     toWholeSentences('So why does the process work at all? Because the air is kept out')
       === 'So why does the process work at all?')
  ok('no complete sentence means no answer at all',
     toWholeSentences('the process begins when the wood is') === null)
  ok('and neither does a stub',
     toWholeSentences('Charcoal.') === null,
     'shorter than twenty characters is not an answer')
}

console.log('\n=== the credit cannot be burned by holding the button ===')
{
  ok('answers are cached per element and question',
     /`\$\{elementId\}:\$\{question\}`/.test(client))
  ok('there is a rolling per-minute cap', /RATE_LIMIT_MAX_PER_WINDOW/.test(client))
  ok('and a hard session cap', /SESSION_CALL_CAP/.test(client))
  ok('a fallback is never cached',
     /if \(message !== FALLBACK_MESSAGE\)/.test(client),
     'or one outage would be permanent for that element')
}

console.log(`\n${pass} passed, ${fail} failed\n`)
if (fail > 0) process.exit(1)
