import { useMemo, useState } from 'react'
import type { RecipeData } from '../data/types'
import type { useGameState } from '../hooks/useGameState'
import { PixelButton } from './ui/PixelButton'
import { BackArrow } from './ui/BackArrow'
import { HudBar } from './ui/HudBar'
import { Card } from './ui/Card'
import { steppedNotch, OUTLINE } from './ui/pixelShape'
import { playPress } from '../audio/sfx'
import { useViewport } from '../hooks/useViewport'

/**
 * The other half of the game, which was in the data all along.
 *
 * WHY THIS EXISTS
 *
 * Every discovery card already says "via knapping", "via retting", "via
 * calcining" — 557 distinct real industrial processes across the graph, 361 of
 * them appearing exactly once. Most people have never heard of half of them,
 * and until now each one flashed past on a card and was gone.
 *
 * Leo: *"think also about how we could target more the learning side, making
 * it fully unique from little alchemy."* This is the honest answer. The
 * difference between this game and a whimsical one is not only that the
 * recipes are real; it is that the VERBS are real, and the verbs are the part
 * nobody knows. A player leaves knowing that bark becomes rope by retting and
 * limestone becomes quicklime by calcining, and those are facts about the
 * world rather than facts about a game.
 *
 * It counts only what the player has actually done. A list of 557 processes
 * handed over on arrival is a glossary; a list that fills in as you work is a
 * record of what you have learned, and the number at the top is a sentence
 * about the player rather than about the game.
 */
type ProcessesProps = {
  data: RecipeData
  game: ReturnType<typeof useGameState>
  onBack: () => void
  /** Cheater mode: show the whole vocabulary rather than only what was used. */
  revealAll?: boolean
}

export function Processes({ data, game, onBack, revealAll = false }: ProcessesProps) {
  /*
   * The bar's keys step down on a narrow screen, and the back key drops its
   * word below 380px.
   *
   * Without it the two buttons take the whole strip: at 320px they wanted 207
   * of the 252 available and the title was left with nine pixels, so it
   * clipped however it was sized. An arrow on its own is still an unambiguous
   * back control; a screen name nobody can read is not a title.
   */
  const { width: viewportWidth } = useViewport()
  const hudUnit = viewportWidth < 520 ? 2 : 3
  const [query, setQuery] = useState('')

  const { used, total, entries } = useMemo(() => {
    /*
     * One process can make several things — casting makes seventeen — so this
     * is grouped by the verb rather than listed per recipe. The examples are
     * what make an unfamiliar word mean something: "calcining" alone teaches
     * nothing, "calcining — quicklime, cement, plaster" teaches the shape of
     * it in three words.
     */
    const byProcess = new Map<string, { makes: string[]; done: boolean }>()
    const nameOf = new Map(data.elements.map((el) => [el.id, el.name]))

    for (const recipe of data.recipes) {
      const found = revealAll || game.isDiscovered(recipe.output)
      const entry = byProcess.get(recipe.process) ?? { makes: [], done: false }
      entry.makes.push(nameOf.get(recipe.output) ?? recipe.output)
      entry.done = entry.done || found
      byProcess.set(recipe.process, entry)
    }

    const all = [...byProcess.entries()]
      .map(([process, entry]) => ({ process, ...entry }))
      .sort((a, b) => a.process.localeCompare(b.process))

    return {
      used: all.filter((e) => e.done).length,
      total: all.length,
      entries: all.filter((e) => e.done),
    }
  }, [data, game, revealAll])

  const shown = query
    ? entries.filter(
        (e) =>
          e.process.toLowerCase().includes(query.toLowerCase()) ||
          e.makes.some((m) => m.toLowerCase().includes(query.toLowerCase())),
      )
    : entries

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-5 py-8">
      <HudBar className="flex items-center gap-3">
        <PixelButton
          tone="default"
          unit={hudUnit}
          aria-label="Back"
          onClick={() => {
            playPress()
            onBack()
          }}
        >
          <BackArrow unit={hudUnit} />
          {viewportWidth >= 380 && 'back'}
        </PixelButton>
        {/*
         * SIZED BY THE ROOM IT HAS, NOT BY THE WINDOW.
         *
         * `clamp(9px, 1.9vw, 22px)` is a guess about how much of the viewport
         * the buttons either side will take, and the guess broke the moment a
         * second button arrived: "INVENTORY" lost its last letters on every
         * phone. This wrapper is the flexible element AND the container the
         * type is measured against, which breaks the circularity — its width
         * comes from the row, never from the text inside it.
         *
         * Press Start 2P advances exactly 1em a character and this carries
         * 0.04em of tracking, so nine characters need 9.36 times the font
         * size. Dividing the wrapper's own width by that cannot clip.
         */}
        <div
          className="flex min-w-0 flex-1 justify-center"
          style={{ containerType: 'inline-size' }}
        >
          <h1
            className="overflow-hidden whitespace-nowrap uppercase text-white"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(7px, 100cqw / 9.36, 22px)',
              letterSpacing: '0.04em',
              margin: 0,
            }}
          >
            Processes
          </h1>
        </div>
      </HudBar>

      <Card className="flex flex-col items-center gap-2 py-2 text-center">
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            lineHeight: 1.4,
            color: '#ffffff',
            textShadow: '3px 3px 0 #191536',
            margin: 0,
          }}
        >
          {used} of {total}
        </p>
        <p className="font-display text-[9px] tracking-widest text-muted uppercase" style={{ margin: 0 }}>
          real processes used
        </p>
        <p
          className="font-display text-[9px] lowercase text-star-mid"
          style={{ maxWidth: '40ch', lineHeight: 2, margin: 0 }}
        >
          every one of these is a thing people actually do to materials. the
          names are the ones the trade uses.
        </p>
      </Card>

      {entries.length === 0 ? (
        <p className="text-center font-display text-[10px] leading-[2] lowercase text-muted">
          nothing yet. every combine that works adds the process it used.
        </p>
      ) : (
        <>
          {/*
           * A field built the way every other surface here is built: a dark
           * plate cut to a staircase, a sunk face inside it, lit from below.
           * A browser's default input — square corners, a hairline border, a
           * focus ring — is the single most off-theme thing that can appear on
           * a screen like this, and it arrives for free unless it is replaced.
           */}
          <div style={{ background: OUTLINE, clipPath: steppedNotch(3, 2), padding: 3 }}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="search"
              aria-label="Search processes"
              className="w-full"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 10,
                letterSpacing: '0.04em',
                color: '#ded9f5',
                background: '#1e1b38',
                clipPath: steppedNotch(3, 2),
                border: 'none',
                outline: 'none',
                padding: '12px 14px',
                textTransform: 'lowercase',
                boxShadow: 'inset 0 -3px 0 0 #3a3560, inset 0 3px 0 0 #12102a',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            {shown.map((entry) => (
              <Card key={entry.process} unit={3} className="flex flex-col gap-1 py-2">
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 11,
                    color: 'var(--color-brand)',
                    textTransform: 'lowercase',
                    margin: 0,
                  }}
                >
                  {entry.process}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 9,
                    lineHeight: 1.9,
                    color: 'var(--color-muted)',
                    textTransform: 'lowercase',
                    margin: 0,
                  }}
                >
                  {/* Three is enough to show the shape of a verb without the
                    * row becoming a paragraph. */}
                  {entry.makes.slice(0, 3).join(', ')}
                  {entry.makes.length > 3 ? ` and ${entry.makes.length - 3} more` : ''}
                </p>
              </Card>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
