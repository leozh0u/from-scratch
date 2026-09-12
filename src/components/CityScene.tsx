/**
 * The Industry realm's backdrop: a neon street at night.
 *
 * WHY THIS REPLACED A PROCEDURAL CITY, AND WHY THAT IS NOT A RETREAT
 *
 * There were two hand-drawn versions before this one — flat facades, then a
 * full one-point perspective with a vanishing point, sloping rooflines, a
 * crossing that widened as it came forward, walkers and cars at three depths.
 * The perspective was correct and it still looked bad, which is the second
 * time on this project that a generated scene lost to a composed one. The
 * forest taught the same lesson. Accept it.
 *
 * Two things were wrong beyond taste, and both are informative:
 *
 * 1. **The palette shared nothing with the UI.** Brick orange and daylight
 *    blue behind indigo panels. This art is deep indigo and violet with pink
 *    signage — the same family the interface is already built from, so the
 *    panels sit *in* the picture rather than on top of it.
 *
 * 2. **The UI owns the middle of the screen.** The panels and the item shelf
 *    cover the centre third, so the only part of any backdrop a player ever
 *    sees is the left and right edges. The procedural city spent all its
 *    detail on the vanishing point — dead centre, permanently hidden. This
 *    composition runs its neon vertically down both walls, which is precisely
 *    where the picture is still visible.
 *
 * NOTHING MOVES, ON PURPOSE
 *
 * The forest sways because trees sway. A street at night does not, and the
 * standing note is that detail matters more than movement. The previous
 * version had nine walkers, four cars and two pigeons and still read as bland,
 * because motion is not detail. Sprite figures drawn by me on top of this
 * would also be in a visibly different hand from the art, which is the exact
 * seam that makes something look assembled rather than made.
 */

type CitySceneProps = { className?: string }

export function CityScene({ className }: CitySceneProps) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    >
      <img
        src={`${import.meta.env.BASE_URL}neon-city.png`}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          /*
           * The source is 512x512 and windows are wide, so `cover` scales to
           * the width and crops the height. At a typical laptop size that is
           * roughly a 3x upscale — which for pixel art is a feature, not a
           * cost, as long as nothing smooths it.
           */
          objectFit: 'cover',
          /*
           * Held slightly above centre. The moon and the upper sky are the
           * least useful part of the frame under a UI, and the wet road at the
           * very bottom is the second least; the band worth keeping is the one
           * where the neon signs and the lit shopfronts are.
           */
          objectPosition: 'center 38%',
          /*
           * Without this the browser resamples with bilinear filtering and a
           * 3x upscale turns every hard pixel edge into a soft gradient — the
           * one thing this entire visual direction cannot survive.
           */
          imageRendering: 'pixelated',
        }}
      />
      {/*
       * A flat wash, not a gradient.
       *
       * The art is bright where the neon is, and white pixel type on a magenta
       * sign is unreadable. A uniform darkening keeps every pixel boundary
       * exactly where it was — a gradient would introduce a smooth ramp across
       * the picture, which is the same sin as the blur above.
       */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0b0a18',
          opacity: 0.28,
        }}
      />
    </div>
  )
}
