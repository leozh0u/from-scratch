/**
 * The Everyday Objects backdrop: a city avenue in daylight.
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
 * 1. **Both sides carry the picture.** The panels and the item shelf cover the
 *    centre third, so the only part of any backdrop a player ever sees is the
 *    left and right edges. The procedural city spent all its detail on the
 *    vanishing point — dead centre, permanently hidden. This composition puts
 *    storefronts, awnings, signage and fire escapes down both flanks, which is
 *    precisely where the picture survives.
 *
 * 2. **It is bright, and that costs something.** A dark scene would have made
 *    the panels easier; the brief was fun and bright, and readability is the
 *    HUD strip's job, not the backdrop's. The strip is already opaque for
 *    exactly this reason — white pixel type does not survive a pale sky, and
 *    the answer consoles used was to give the status line its own bar rather
 *    than to dim the world behind it.
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
        src={`${import.meta.env.BASE_URL}big-city.svg`}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          /*
           * The source is 512x512 and windows are wide, so `cover` scales to
           * the width and crops the height — roughly a 3x upscale on a laptop,
           * which for pixel art is a feature as long as nothing smooths it.
           */
          objectFit: 'cover',
          /*
           * Held slightly above centre. The moon and the upper sky are the
           * least useful part of the frame under a UI, and the wet road at the
           * very bottom is the second least; the band worth keeping is the one
           * where the neon signs and the lit shopfronts are.
           */
          /*
           * Held above centre. The source is square and the window is wide, so
           * `cover` crops the height; the band worth keeping is the avenue and
           * the storefronts, not the top of the sky.
           */
          objectPosition: 'center 42%',
          /*
           * NO `image-rendering: pixelated` HERE, AND THAT IS THE WHOLE POINT.
           *
           * The reflex with pixel art is to force nearest-neighbour so hard
           * edges survive scaling. For a *bitmap* that is right. For this it
           * was catastrophic: the file is an SVG whose <svg> tag declares
           * width="512" height="512", so `pixelated` makes Chrome rasterise
           * the vector at 512 and then blow that bitmap up nearest-neighbour.
           * Every car, window and shop sign in the art turned into a 3x3 block
           * of mush — the detail was being thrown away before the scaling even
           * happened.
           *
           * Left alone, the paths rasterise at the window's real resolution.
           * The art traces pixel blocks, so the edges are still hard squares —
           * they are just drawn accurately instead of being reconstructed from
           * a quarter-size thumbnail.
           */
        }}
      />
      {/*
       * A very light flat wash, not a gradient.
       *
       * Only enough to seat the picture behind the interface — the previous
       * night scene took 28% and this takes 10%, because the whole point of
       * this one is that it is bright. A uniform darkening also keeps every
       * pixel boundary exactly where it was; a gradient would lay a smooth
       * ramp across the art, which is the same sin as blurring it.
       */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#131033',
          opacity: 0.1,
        }}
      />
    </div>
  )
}
