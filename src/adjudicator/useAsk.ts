import { useCallback, useState } from 'react'
import { ask as askServer } from './ask'
import type { QuestionKey } from './questions'
import type { Reply } from './outcome'

/**
 * Asking the model about something, once.
 *
 * Shared because there are two places that do it — the discovery card, which
 * has one subject, and the "why not?" panel, which has two — and they were
 * about to be two copies of the same cache, the same in-flight flag and the
 * same rule that a repeat question costs nothing.
 *
 * Answers are keyed by SUBJECT AND QUESTION, not by question alone. The panel
 * lets the player switch between two elements, and a cache keyed only by
 * "how" would show them bark's answer under torch's name — which in a game
 * whose whole claim is that nothing is invented is the worst possible bug to
 * have, because it looks exactly like the model making something up.
 */
export type AskState = {
  /** Ask, or re-show a cached answer. Never asks the same thing twice. */
  ask: (elementId: string, name: string, question: QuestionKey) => void
  /** What is on screen: an answer, or the reason there is not one. */
  reply: Reply | undefined
  /** Which subject and question are showing. */
  showing: { elementId: string; question: QuestionKey } | null
  /** True while that one is in flight. */
  asking: boolean
}

export function useAsk(): AskState {
  const [answers, setAnswers] = useState<Record<string, Reply>>({})
  const [showing, setShowing] = useState<{ elementId: string; question: QuestionKey } | null>(null)
  const [inFlight, setInFlight] = useState<string | null>(null)

  const ask = useCallback(
    (elementId: string, name: string, question: QuestionKey) => {
      const key = `${elementId}:${question}`
      setShowing({ elementId, question })
      if (answers[key] !== undefined || inFlight === key) return
      setInFlight(key)
      void askServer(elementId, name, question).then((reply) => {
        setAnswers((prev) => ({ ...prev, [key]: reply }))
        setInFlight((current) => (current === key ? null : current))
      })
    },
    [answers, inFlight],
  )

  const key = showing ? `${showing.elementId}:${showing.question}` : null
  return {
    ask,
    reply: key ? answers[key] : undefined,
    showing,
    asking: key !== null && inFlight === key,
  }
}
