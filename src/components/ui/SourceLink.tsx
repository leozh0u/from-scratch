import { useState } from 'react'
import { steppedNotch, OUTLINE } from './pixelShape'
import { playHover, playPress } from '../../audio/sfx'

/**
 * A citation, made to look like something you click.
 *
 * WHY IT WAS REBUILT
 *
 * It was 8px muted grey text in a thin box, and it read as a caption. That is
 * a problem beyond aesthetics: the citation is the whole claim of this
 * project. "Every number has a source you can click" is worth nothing if
 * nobody can tell the source is clickable, and a judge who does not click one
 * has no reason to believe the numbers at all.
 *
 * So it now carries the three things that say "link" without any hover:
 * brighter type than the text around it, an underline, and a box built the
 * same way as the buttons, with the staircase corners and a hard outline. The
 * glyph is set larger than the label rather than matched to it, because at
 * this size a 8px circled `i` is four grey pixels and reads as dirt.
 */

type SourceLinkProps = {
  label: string
  url: string
  /**
   * How much checking this citation has had. See `SourceTier` in data/types.
   *
   * Shown, rather than assumed, and shown only when it is the WEAKER claim.
   * A badge on every link would be noise; a badge on the ones a human has not
   * personally read is the honest thing, and it is the answer to "how do you
   * know the model did not invent this" — that one has been fetched and
   * title-checked by machine and carries no number, and the unbadged ones
   * were read.
   */
  tier?: 'sourced' | 'referenced'
  /** Sprite-pixel unit. Everything below is a whole multiple of it. */
  unit?: number
}

const FACE = '#312c55'
const FACE_HOVER = '#403a6e'
const EDGE = '#5c5590'
const TEXT = '#cfc8ff'
const TEXT_HOVER = '#ffffff'

export function SourceLink({ label, url, tier = 'sourced', unit = 3 }: SourceLinkProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onPointerEnter={() => {
        setHovered(true)
        playHover()
      }}
      onPointerLeave={() => setHovered(false)}
      onClick={playPress}
      style={{
        display: 'inline-block',
        background: OUTLINE,
        clipPath: steppedNotch(unit, 2),
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: unit * 2,
          margin: unit,
          padding: `${unit * 2}px ${unit * 3}px`,
          background: hovered ? FACE_HOVER : FACE,
          // One bright band along the top and left, the same lighting every
          // other surface in the game uses.
          boxShadow: `inset 0 ${unit}px 0 0 ${EDGE}, inset ${unit}px 0 0 0 ${EDGE}`,
        }}
      >
        {/* Deliberately larger than the label. */}
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: unit * 5,
            lineHeight: 1,
            color: hovered ? TEXT_HOVER : TEXT,
          }}
        >
          ⓘ
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: unit * 3.34,
            lineHeight: 1.7,
            textTransform: 'lowercase',
            color: hovered ? TEXT_HOVER : TEXT,
            // A whole-pixel rule rather than `text-decoration`, which renders
            // as a thin antialiased hairline at this size.
            borderBottom: `${Math.max(1, Math.round(unit / 1.5))}px solid ${hovered ? TEXT_HOVER : TEXT}`,
          }}
        >
          {label}
        </span>
        {tier === 'referenced' && (
          <span
            title="Link checked by machine: the page exists and its title matches. No figure is taken from it."
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: unit * 2.7,
              lineHeight: 1,
              padding: `${unit}px ${unit * 1.5}px`,
              background: '#1d1a38',
              color: '#8d86c4',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            link
          </span>
        )}
      </span>
    </a>
  )
}
