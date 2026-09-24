import { arcTitleWidth, fitArcUnit } from './ArcTitle'

/**
 * How big everything on the title screen is, for a given window.
 *
 * WHY THIS IS A FUNCTION AND NOT A HANDFUL OF TERNARIES IN THE COMPONENT
 *
 * The sizes used to come off viewport WIDTH alone, and that is fine until the
 * phone is turned sideways. At 844x390 — an iPhone in landscape — the width
 * says "plenty of room", so the wordmark and the buttons were drawn at nearly
 * desktop size and all three menu buttons ended up below the fold of a 390px
 * tall screen. `main` clips its overflow so the planet can be cropped, which
 * meant the buttons were not merely awkward, they were unreachable: the game
 * could not be started at all in landscape.
 *
 * Height has to be part of the decision, and once it is, the sizes stop being
 * something you can eyeball. So the layout is computed here and asserted in
 * `scripts/layouttest.ts` against every orientation of a dozen real devices.
 */

export type StartLayout = {
  /** Sprite scale for the planet. */
  scale: number
  /** Unit for the menu buttons. */
  unit: number
  /** Unit for the wordmark. */
  titleUnit: number
  /** Vertical gap between the wordmark and the buttons, and between buttons. */
  gap: number
  /** Top inset reserving room for the reset button in the corner. */
  topInset: number
  /** Vertical padding on the content column, top and bottom. */
  padBlock: number
}

/** The wordmark's own height, in pixels, at a given unit. */
export function arcTitleHeight(text: string, unit: number, spread = 34): number {
  const size = unit * 10
  const glyphs = [...text].filter((c) => c !== ' ').length
  const advance = Math.round(size)
  const chord = advance * glyphs
  const sweep = (spread * Math.PI) / 180
  const radius = chord / (2 * Math.sin(sweep / 2))
  return Math.round(size * 1.25 + radius * (1 - Math.cos(sweep / 2)))
}

/**
 * A PixelButton's outside height at a given unit.
 *
 * CALIBRATED AGAINST THE RENDERED BUTTON, NOT DERIVED FROM ITS SOURCE.
 *
 * The first version added up what PixelButton looked like it should be —
 * type, padding, outline, extruded base — and came out 10px short at unit 5
 * and 8px short at unit 4, which was enough to push the inventory button off
 * the bottom of a landscape phone even after the layout was being fitted.
 * Measured in the browser it is the type box plus a flat fourteen units, at
 * both sizes. Re-measure if PixelButton's own metrics change.
 */
export function menuButtonHeight(unit: number): number {
  return Math.round(unit * 3 * 1.3) + unit * 14
}

const TITLE = 'From Scratch'

/**
 * The realm legends cost no height any more.
 *
 * They were two lines under the buttons and had to be budgeted for. They are
 * now printed on the extruded SIDE of each key, inside the button's own box,
 * so they take no vertical room at all — which is the better answer to the
 * layout problem as well as the better-looking one.
 */
export const CAPTION_HEIGHT = 0

/**
 * The tallest the content can be and still fit, with the buttons reachable.
 * Everything below is fitted into this.
 */
export function startScreenLayout(width: number, height: number): StartLayout {
  /*
   * The corner controls live above the wordmark and it has to clear them.
   *
   * There are four of them now — skip, mode, mute, reset — and below about
   * 460px they cannot fit on one line at any size that is still tappable, so
   * they wrap onto two. Reserving one row's worth on every screen put the
   * second row straight through the middle of "FROM SCRATCH" on a phone.
   *
   * Measured rather than guessed: two rows of a unit-2 key plus the gap is
   * about ninety-six pixels, which is the floor below the wrap point.
   */
  const CORNER_WRAPS_BELOW = 460
  const topInset = Math.max(
    Math.min(78, Math.round(height * 0.12)),
    width < CORNER_WRAPS_BELOW ? 96 : 0,
  )

  /*
   * SEARCHED, NOT THRESHOLDED.
   *
   * The first attempt at this used height thresholds ("short" under 520px) on
   * top of the existing width ones, and a sweep across every size from 320 to
   * 2560 found 194 windows where the content still did not fit - the first at
   * 915x528, which is neither a phone nor a laptop and so was never going to
   * turn up in a list of devices I wrote by hand.
   *
   * Thresholds encode an answer. This asks the question instead: take the
   * biggest buttons the width allows, and if the whole stack does not fit the
   * height, step down and ask again. The first size that fits wins, so the
   * screen is always as large as it can be and never larger.
   */
  const widest = width < 560 ? 4 : width < 900 ? 6 : 7
  const byWidth = fitArcUnit(TITLE, width - 24, 14)

  /*
   * THE WORDMARK KEEPS ITS SIZE; THE BUTTONS GIVE WAY.
   *
   * The first version returned the first combination that fitted, starting
   * from the biggest buttons, so the title got whatever height was left over.
   * That made it the shock absorber for every change in window height: Leo
   * opened the same page with and without a tab bar and the wordmark jumped
   * several steps, because two hundred pixels of height had come off the title
   * and nothing else.
   *
   * The title is what the screen is built around and its size should track the
   * WIDTH, which does not change when a tab bar appears. So every combination
   * is tried and the one with the largest title wins, buttons stepping down to
   * pay for it. Ties go to the bigger buttons.
   */
  let best: StartLayout | null = null
  for (let unit = widest; unit >= 3; unit--) {
    // Tighter gaps on a short screen: vertical room is what runs out, and
    // spacing is the cheapest thing to give up before type size.
    const gap = height < 560 ? unit * 3 : unit * 6
    const padBlock = height < 560 ? unit * 2 : unit * 8
    const buttons =
      menuButtonHeight(unit) * 2 +
      menuButtonHeight(unit - 1) +
      gap * 2 +
      CAPTION_HEIGHT * 2
    const roomForTitle = height - topInset - padBlock * 2 - buttons - gap

    for (let titleUnit = byWidth; titleUnit >= 2; titleUnit--) {
      if (arcTitleHeight(TITLE, titleUnit) > roomForTitle) continue
      if (best && titleUnit <= best.titleUnit) break
      const scale = unit <= 4 ? 7 : unit <= 6 ? 10 : 13
      best = { scale, unit, titleUnit, gap, topInset, padBlock }
      break
    }
  }
  if (best) return best

  /*
   * Nothing fits. Return the smallest everything rather than something
   * arbitrary — on a window this small the planet is not the priority, and the
   * buttons being reachable is.
   */
  const unit = 3
  return { scale: 5, unit, titleUnit: 2, gap: unit * 2, topInset, padBlock: unit * 2 }
}

/** Everything the screen stacks vertically, for the fit assertion. */
export function startScreenContentHeight(layout: StartLayout): number {
  return (
    layout.topInset +
    layout.padBlock * 2 +
    arcTitleHeight(TITLE, layout.titleUnit) +
    layout.gap +
    menuButtonHeight(layout.unit) * 2 +
    menuButtonHeight(layout.unit - 1) +
    layout.gap * 2 +
    CAPTION_HEIGHT * 2
  )
}

/** Re-exported so callers need only this module. */
export { arcTitleWidth }

/*
 * THE WORLDS PICKER, SIZED THE SAME WAY AS THE TITLE.
 *
 * Searched rather than stepped by breakpoints, for the reason the title is: a
 * width threshold does not know how tall the window is, and a phone held
 * sideways has plenty of one and almost none of the other. Five planets, each
 * over its own key, laid out five across, three and two, or two, two and one,
 * never four and an orphan.
 *
 * If nothing fits, the smallest layout is returned and the picker scrolls.
 * Unlike the title it can: there is nothing pinned to the bottom of it.
 */
export type PickerLayout = {
  unit: number
  titleUnit: number
  columns: number
  /** Screen pixels per planet pixel. */
  planetScale: number
  /** Width of every key, so the grid lines up whatever the name. */
  keyWidth: number
  gap: number
  topInset: number
  padBlock: number
  fits: boolean
}

export const PLANET_PIXELS = 24
const PICKER_TITLE = 'Planets'

/** A PixelButton's width for a label: 3u font, 0.08em tracking, 5u padding each side. */
export function keyWidthFor(label: string, unit: number): number {
  return Math.ceil(label.length * unit * 3 * 1.08 + unit * 10)
}

export function pickerRows(count: number, columns: number): number[] {
  if (columns >= count) return [count]
  if (columns === 3) return [3, count - 3]
  return [2, 2, count - 4]
}

export function pickerContentHeight(layout: PickerLayout, count: number): number {
  const rows = pickerRows(count, layout.columns).length
  const cell = PLANET_PIXELS * layout.planetScale + layout.unit * 2 + menuButtonHeight(layout.unit)
  return (
    layout.topInset +
    layout.padBlock * 2 +
    arcTitleHeight(PICKER_TITLE, layout.titleUnit) +
    layout.gap +
    rows * cell +
    (rows - 1) * layout.gap
  )
}

export function pickerLayout(width: number, height: number, names: string[]): PickerLayout {
  const topInset = Math.max(64, Math.min(78, Math.round(height * 0.12)))
  const longest = names.reduce((a, b) => (b.length > a.length ? b : a), '')
  // Never bigger than the title screen's own wordmark, so the picker reads as
  // a room off the title rather than a louder one.
  const titleCap = startScreenLayout(width, height).titleUnit
  const byWidth = Math.min(titleCap, fitArcUnit(PICKER_TITLE, width - 24, 14))
  let fallback: PickerLayout | null = null

  for (let unit = width < 560 ? 4 : 5; unit >= 3; unit--) {
    const keyWidth = keyWidthFor(longest, unit)
    const gap = height < 560 ? unit * 3 : unit * 5
    const padBlock = height < 560 ? unit * 2 : unit * 5
    for (const columns of [5, 3, 2]) {
      if (columns * keyWidth + (columns - 1) * gap > width - 32) continue
      for (let planetScale = 4; planetScale >= 2; planetScale--) {
        if (PLANET_PIXELS * planetScale > keyWidth) continue
        for (let titleUnit = byWidth; titleUnit >= 2; titleUnit--) {
          const layout = { unit, titleUnit, columns, planetScale, keyWidth, gap, topInset, padBlock, fits: true }
          if (pickerContentHeight(layout, names.length) <= height) return layout
        }
      }
      fallback ??= { unit, titleUnit: 2, columns, planetScale: 2, keyWidth, gap, topInset, padBlock, fits: false }
    }
  }
  return (
    fallback ?? {
      unit: 3,
      titleUnit: 2,
      columns: 2,
      planetScale: 2,
      keyWidth: keyWidthFor(longest, 3),
      gap: 9,
      topInset,
      padBlock: 6,
      fits: false,
    }
  )
}
