import { useState } from 'react'
import { ask, FALLBACK_MESSAGE } from '../adjudicator/ask'
import { QUESTION_KEYS, QUESTION_LABELS, type QuestionKey } from '../adjudicator/questions'
import { PixelButton } from './ui/PixelButton'
import { playPress } from '../audio/sfx'

/**
 * "Learn more" on something you have already made.
 *
 * WHY THIS IS THREE BUTTONS AND NOT A TEXT BOX
 *
 * A chat box was the obvious version and it is the wrong one here. The whole
 * claim of this game is that nothing in it is invented — every recipe is a
 * real transformation and every figure has a source — and a free text field
 * wired to a model is a machine for producing confident guesses about exactly
 * the two things it must never guess about: what combines with what, and how
 * much anything costs.
 *
 * Three fixed questions keep the feature and remove the failure. The player
 * sends a key, the server owns the wording, and the rules that wording
 * carries are the game's own rules: no other material by name, no figures,
 * two or three sentences. See api/ask.ts.
 *
 * It is also collapsed until asked for, which matters more than it sounds.
 * The panel already carries a hand-written sourced blurb; the model's answer
 * is the optional extra, and putting it behind a press is what keeps a
 * five-second wait off the path of someone who just wants to carry on
 * playing.
 */

type LearnMoreProps = {
  elementId: string
  name: string
  /**
   * What the closed button says. Defaults to "learn more", which is right on a
   * discovery card where the subject is obvious. After a failed combine there
   * are TWO of these side by side, and two buttons both saying "learn more"
   * do not say which thing they are about — so there they carry the element's
   * own name instead.
   */
  label?: string
  unit?: number
}

export function LearnMore({ elementId, name, label, unit = 3 }: LearnMoreProps) {
  const [open, setOpen] = useState(false)
  const [asking, setAsking] = useState<QuestionKey | null>(null)
  /** Answers are kept per question, so switching back and forth costs nothing. */
  const [answers, setAnswers] = useState<Partial<Record<QuestionKey, string>>>({})
  const [showing, setShowing] = useState<QuestionKey | null>(null)

  async function onAsk(question: QuestionKey) {
    playPress()
    if (answers[question]) {
      setShowing(question)
      return
    }
    setAsking(question)
    setShowing(question)
    const message = await ask(elementId, name, question)
    setAnswers((prev) => ({ ...prev, [question]: message }))
    setAsking(null)
  }

  if (!open) {
    return (
      <PixelButton
        tone="default"
        unit={unit}
        onClick={() => {
          playPress()
          setOpen(true)
        }}
      >
        {label ?? 'learn more'}
      </PixelButton>
    )
  }

  const answer = showing ? answers[showing] : undefined

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        {QUESTION_KEYS.map((key) => (
          <PixelButton
            key={key}
            tone={showing === key ? 'survival' : 'default'}
            unit={unit - 1}
            disabled={asking !== null}
            onClick={() => onAsk(key)}
          >
            {QUESTION_LABELS[key]}
          </PixelButton>
        ))}
      </div>

      {showing && (
        <p
          /*
           * role="status" so the answer is announced when it lands rather
           * than silently replacing the panel's height under a screen reader.
           */
          role="status"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 9,
            lineHeight: 2.1,
            letterSpacing: '0.02em',
            color: answer === FALLBACK_MESSAGE ? 'var(--color-muted)' : '#ded9f5',
            textTransform: 'lowercase',
            maxWidth: '30ch',
            margin: 0,
            textAlign: 'center',
          }}
        >
          {asking === showing ? 'asking...' : answer}
        </p>
      )}
    </div>
  )
}
