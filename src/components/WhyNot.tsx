import { Card } from './ui/Card'
import { Overlay } from './ui/Overlay'
import { PixelButton } from './ui/PixelButton'
import { LearnMore } from './LearnMore'
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
 * A panel also gives the answer the room it deserves. The instant local reason
 * stays on the bench's readout where it costs nothing; this is the thing the
 * player actively asked a question to get, and the three follow-ups sit under
 * it rather than three scroll-lengths away.
 *
 * The fence is unchanged: two names and a realm go out, prose comes back, and
 * nothing here can grant an element. See api/adjudicate.ts.
 */
type WhyNotProps = {
  pair: [string, string]
  names: [string, string]
  /** Undefined while the model is still answering. */
  answer?: string
  onClose: () => void
}

export function WhyNot({ pair, names, answer, onClose }: WhyNotProps) {
  return (
    <Overlay onClose={onClose} labelledBy="whynot-pair">
      <Card unit={5} className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
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
          {names[0].toLowerCase()} + {names[1].toLowerCase()}
        </h2>

        <p
          role="status"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 9,
            lineHeight: 2.1,
            letterSpacing: '0.02em',
            color: answer ? '#ded9f5' : 'var(--color-muted)',
            textTransform: 'lowercase',
            maxWidth: '30ch',
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
         * Either of the two is a door into the same three fixed questions the
         * discovery card uses — the same closed set of keys, the same server
         * wording, no new way for text to reach a model.
         */}
        {answer && (
          <div className="flex w-full flex-col items-center gap-2">
            <p
              className="font-display text-[9px] lowercase text-star-mid"
              style={{ letterSpacing: '0.04em', margin: 0 }}
            >
              want to know more about
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {pair.map((id, i) => (
                <LearnMore key={id} elementId={id} name={names[i]} label={names[i]} unit={3} />
              ))}
            </div>
          </div>
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
