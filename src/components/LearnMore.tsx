import { useState } from 'react'
import { QUESTION_KEYS, QUESTION_LABELS, type QuestionKey } from '../adjudicator/questions'
import { useAsk } from '../adjudicator/useAsk'
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
  /*
   * The cache, the in-flight flag and the rule that a repeat question costs
   * nothing all live in `useAsk` now, shared with the "why not?" panel. This
   * file had its own copy of all three, and two caches of the same answers is
   * how they end up disagreeing.
   */
  const { ask, reply, showing, asking } = useAsk()

  function onAsk(question: QuestionKey) {
    playPress()
    ask(elementId, name, question)
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



  return (
    <div className="flex w-full flex-col items-center gap-2">
      {/*
       * Full width, at the panel's own unit rather than one below it.
       *
       * Leo: "those three questions are so hard to see and read." They were
       * `unit - 1`, which puts a seventeen-character question into a six-pixel
       * font — a face built from one-pixel stems, at the size where the stems
       * stop resolving. Stacked rather than wrapped, so the three read as one
       * set of choices instead of two-and-a-bit rows.
       */}
      <div className="flex w-full flex-col items-stretch gap-2">
        {QUESTION_KEYS.map((key) => (
          <PixelButton
            key={key}
            tone={showing?.question === key ? 'survival' : 'default'}
            unit={unit}
            block
            disabled={asking}
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
            fontSize: 10,
            lineHeight: 2,
            letterSpacing: '0.02em',
            // Off the outcome, not off the text — see adjudicator/outcome.ts.
            color: reply && reply.outcome !== 'answer' ? 'var(--color-muted)' : '#ded9f5',
            textTransform: 'lowercase',
            maxWidth: '32ch',
            margin: 0,
            textAlign: 'center',
          }}
        >
          {asking ? 'asking...' : reply?.text}
        </p>
      )}
    </div>
  )
}
