import { useEffect, useState } from 'react'

export type Viewport = { width: number; height: number }

function read(): Viewport {
  if (typeof window === 'undefined') return { width: 1280, height: 800 }
  return { width: window.innerWidth, height: window.innerHeight }
}

/**
 * Viewport size as state. Sprite scales have to be whole numbers to stay
 * crisp, so they can't be expressed as CSS breakpoints — the scene has to be
 * sized in JS.
 */
export function useViewport(): Viewport {
  const [viewport, setViewport] = useState(read)

  useEffect(() => {
    const onResize = () => setViewport(read())
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    onResize()
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  return viewport
}
