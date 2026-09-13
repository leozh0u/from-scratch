import { useState } from 'react'
import { Card } from './ui/Card'
import { Overlay } from './ui/Overlay'
import { PixelButton } from './ui/PixelButton'
import { FALLBACK_MESSAGE } from '../adjudicator/ask'
import { QUESTION_KEYS, QUESTION_LABELS } from '../adjudicator/questions'
import { useAsk } from '../adjudicator/useAsk'
import { playPress } from '../audio/sfx'

/**
 * The model's answer, on its own panel.
 *
 * WHY THIS IS NOT INLINE ANY MORE
 *
 * It used to print into the bench, under the slots, along with two more keys
 * and whatever those opened. A model writes two or three sentences and the
 * length is not knowable in advance, so the panel grew by an unpredictable
 * amount every time somebody asked, and the entire inventory below it moved.
 * There is no honest way to reserve space for prose you have not received.
 *
 * WHY SUBJECT FIRST, THEN QUESTION
 *
 * This began as two collapsed "learn more" keys side by side, each opening
 * into its own three questions. Leo: *"those three questions are so hard to
 * see and read."* Two faults, and the size was the smaller one. The real
 * fault was that an opened one lost its own name — three questions appeared
 * under a heading that said "want to know more about" and the thing they were
 * about had gone, with the other element's key still sitting underneath
 * looking like a fourth option.
 *
 * One subject row and one question row fixes both. Which thing you are asking
 * about is always on screen and always selected, the questions are one set
 * rather than two nested ones, and there is room to set them at a size a
 * person can read.
 *
 * The fence is unchanged: two names and a realm go out, prose comes back, and
 * nothing here can grant an element. See api/adjudicate.ts and api/ask.ts.
 */
type WhyNotProps = {
  pair: [string, string]
  names: [string, string]
  /** The local reason, which is instant. Undefined while the model answers. */
  answer?: string
  onClose: () => void
}

export function WhyNot({ pair, names, answer, onClose }: WhyNotProps) {
  /** Which of the two the questions are about. The first, until told otherwise. */
  const [subject, setSubject] = useState(0)
  const { ask, answer: deeper, showing, asking } = useAsk()

  const label = (text: string) => text.toLowerCase()

  return (
    <Overlay onClose={onClose} labelledBy="whynot-pair" className="px-5 py-8">
      <Card unit={5} className="flex w-full max-w-md flex-col items-center gap-4 text-center">
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 9,
            letterSpacing: '0.16em',
            color: 'var(--color-brand)',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          why not
        </p>

        <h2
          id="whynot-pair"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            lineHeight: 1.6,
            color: '#ffffff',
            textShadow: '2px 2px 0 #100d20',
            textTransform: 'lowercase',
            margin: 0,
          }}
        >
          {label(names[0])} + {label(names[1])}
        </h2>

        <p
          role="status"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 10,
            lineHeight: 2,
            letterSpacing: '0.02em',
            color: answer ? '#ded9f5' : 'var(--color-muted)',
            textTransform: 'lowercase',
            maxWidth: '32ch',
            margin: 0,
          }}
        >
          {answer ?? 'asking...'}
        </p>

        {/*
         * AND THEN KEEP GOING.
         *
         * The player has just been told what happens between two things and is
         * more curious than they will be at any other point in the session.
         * The same closed set of three keys the discovery card uses, the same
         * server-owned wording — no new way for text to reach a model.
         */}
        {answer && (
          <>
            <div
              style={{
                width: '100%',
                height: 2,
                background: '#241f4d',
                margin: '2px 0',
              }}
            />

            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 9,
                letterSpacing: '0.1em',
                color: 'var(--color-muted)',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              ask about
            </p>

            {/*
             * The subject stays on screen and stays selected. Two keys that
             * both look pressable, with the chosen one lit, rather than one
             * that has disappeared into whatever it opened.
             */}
            <div className="flex flex-wrap justify-center gap-3">
              {pair.map((id, i) => (
                <PixelButton
                  key={id}
                  tone={subject === i ? 'survival' : 'default'}
                  unit={3}
                  onClick={() => {
                    playPress()
                    setSubject(i)
                    // Carry the question across, so switching subject answers
                    // the same question about the other thing rather than
                    // emptying the panel.
                    if (showing) ask(id, names[i], showing.question)
                  }}
                >
                  {label(names[i])}
                </PixelButton>
              ))}
            </div>

            {/*
             * Full width and set at 9px rather than 6. They were `unit - 1`
             * beside a `unit` subject key, which put a seventeen-character
             * question into a six-pixel font — a face built from one-pixel
             * stems, at the size where the stems stop resolving.
             */}
            <div className="flex w-full flex-col items-stretch gap-2">
              {QUESTION_KEYS.map((question) => (
                <PixelButton
                  key={question}
                  tone={
                    showing?.question === question && showing.elementId === pair[subject]
                      ? 'survival'
                      : 'default'
                  }
                  unit={3}
                  block
                  onClick={() => {
                    playPress()
                    ask(pair[subject], names[subject], question)
                  }}
                >
                  {QUESTION_LABELS[question]}
                </PixelButton>
              ))}
            </div>

            {showing && (
              <p
                role="status"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 10,
                  lineHeight: 2,
                  letterSpacing: '0.02em',
                  color: deeper === FALLBACK_MESSAGE ? 'var(--color-muted)' : '#ded9f5',
                  textTransform: 'lowercase',
                  maxWidth: '32ch',
                  margin: 0,
                }}
              >
                {asking ? 'asking...' : deeper}
              </p>
            )}
          </>
        )}

        <PixelButton
          tone="default"
          unit={4}
          onClick={() => {
            playPress()
            onClose()
          }}
        >
          back
        </PixelButton>
      </Card>
    </Overlay>
  )
}
