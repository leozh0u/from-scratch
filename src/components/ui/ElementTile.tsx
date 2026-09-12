import { useState } from 'react'
import type { Sprite } from '../PixelArt'
import { PixelArt } from '../PixelArt'
import { steppedNotch, OUTLINE } from './pixelShape'
import { playSelect, playHover } from '../../audio/sfx'

/**
 * One element in the tray.
 *
 * The version this replaces was a white rounded square with a hairline border
 * and a colour transition on hover — a pixel icon sitting inside a piece of
 * modern UI, which is the pairing the whole visual direction is against.
 *
 * It is now a small pressable slab built from the same parts as the buttons:
 * staircase corners, a hard outline, a lifted face over a darker base, and a
 * real press that travels. There are dozens of these on screen at once, so the
 * unit is smaller and the extrusion shallower than a button's — but it is the
 * same object, and it clicks like one.
 */

type ElementTileProps = {
  icon: Sprite
  label: string
  selected?: boolean
  disabled?: boolean
  unit?: number
  onClick?: () => void
}

/*
 * Deepened from the first pass. These labels are white pixel type at a small
 * size sitting over a forest, and Press Start 2P has a one-pixel stem with no
 * bold weight to fall back on — so all the contrast has to come from the
 * surface behind it. A mid-navy face was not dark enough and the words read as
 * grey mush.
 */
const FACE = '#262246'
const FACE_HOVER = '#332e5c'
const HI = '#474070'
const LO = '#171430'
const BASE = '#1d1b36'

/** Selected is a warm accent rather than a brighter navy: on a grid of forty
 * tiles a slightly lighter blue is not findable at a glance. */
const SELECTED_FACE = '#c96a22'
const SELECTED_HI = '#eb9a52'
const SELECTED_LO = '#8f4413'
const SELECTED_BASE = '#5e2c0b'

export function ElementTile({
  icon,
  label,
  selected = false,
  disabled = false,
  unit = 4,
  onClick,
}: ElementTileProps) {
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)

  const down = pressed && !disabled
  const depth = unit * 3
  const face = selected ? SELECTED_FACE : FACE
  const hi = selected ? SELECTED_HI : HI
  const lo = selected ? SELECTED_LO : LO
  const base = selected ? SELECTED_BASE : BASE

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      onPointerDown={() => {
        if (disabled) return
        setPressed(true)
        playSelect()
      }}
      onPointerUp={() => setPressed(false)}
      onPointerEnter={() => {
        setHovered(true)
        if (!disabled) playHover()
      }}
      onPointerLeave={() => {
        setHovered(false)
        setPressed(false)
      }}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          setPressed(true)
          playSelect()
        }
      }}
      onKeyUp={() => setPressed(false)}
      onBlur={() => {
        setPressed(false)
        setHovered(false)
      }}
      style={{
        position: 'relative',
        background: 'none',
        border: 'none',
        padding: 0,
        paddingBottom: depth,
        margin: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* The base the tile sits on — hidden while pressed, so the face lands
       * in exactly the space it vacates. */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: depth,
          bottom: 0,
          background: OUTLINE,
          clipPath: steppedNotch(unit, 3),
          display: down ? 'none' : 'block',
        }}
      >
        <span
          style={{
            position: 'absolute',
            inset: unit,
            background: base,
            display: 'block',
          }}
        />
      </span>

      <span
        style={{
          position: 'relative',
          display: 'block',
          background: OUTLINE,
          clipPath: steppedNotch(unit, 3),
          // No transition. A press is instantaneous.
          transform: down ? `translateY(${depth}px)` : 'none',
        }}
      >
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            /*
             * EVERY TILE IS THE SAME SIZE, AND THAT HAS TO BE ENFORCED.
             *
             * With `minWidth` alone, "high-carbon steel" wrapped to three
             * lines and grew a tile half again as tall as its neighbours, so
             * the grid went ragged and that one element read as a different
             * kind of thing. Names are data and cannot be shortened to suit
             * the layout, so the box is fixed instead and the label is made to
             * fit inside it.
             */
            gap: unit,
            margin: unit,
            padding: `${unit * 2}px ${unit}px`,
            width: unit * 24,
            height: unit * 26,
            boxSizing: 'border-box',
            background: hovered && !disabled && !selected ? FACE_HOVER : face,
            /*
             * A bevel on ALL FOUR sides, not just top and bottom.
             *
             * The reference sheet's buttons are lit from the upper left: a
             * bright band down the top AND the left edge, a dark band down the
             * bottom AND the right. Two bands alone read as a stripe; four
             * read as a raised block, which is the whole difference between a
             * coloured rectangle and something that looks pressable.
             *
             * Hard-edged insets with zero blur — the same two rows of lighter
             * pixels a sprite artist would draw along the lip.
             */
            boxShadow: down
              ? `inset 0 ${unit}px 0 0 ${lo}, inset ${unit}px 0 0 0 ${lo}`
              : [
                  `inset 0 ${unit}px 0 0 ${hi}`,
                  `inset ${unit}px 0 0 0 ${hi}`,
                  `inset 0 -${unit}px 0 0 ${lo}`,
                  `inset -${unit}px 0 0 0 ${lo}`,
                ].join(', '),
          }}
        >
          {/* A fixed row for the icon, so sprites of different heights do
            * not shift the label up and down between tiles. */}
          <span
            style={{
              height: unit * 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PixelArt sprite={icon} scale={3} />
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              /*
               * Was unit*2, which came out at six pixels and was genuinely
               * unreadable. A pixel font does not degrade gracefully — below
               * about nine pixels the strokes start landing on half-pixels and
               * the letterforms dissolve. This is the floor, not a preference.
               */
              /*
               * Long names step down one size rather than wrapping to a third
               * line. Two lines is what the box has room for; a pixel font
               * below about eight pixels dissolves, so this is the one step of
               * headroom available and the box is sized to fit the rest.
               */
              fontSize: label.length > 13 ? unit * 2 : unit * 2.5,
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textAlign: 'center',
              color: '#ffffff',
              // Near-black, not the face's own shadow tone: the label needs to
              // separate from the surface, not blend into it.
              textShadow: `2px 2px 0 ${OUTLINE}`,
              textTransform: 'lowercase',
              wordBreak: 'break-word',
            }}
          >
            {label}
          </span>
        </span>
      </span>
    </button>
  )
}
