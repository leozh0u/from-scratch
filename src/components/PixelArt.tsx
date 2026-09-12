/**
 * Sprites are authored as arrays of equal-length strings, one character per
 * pixel, with '.' meaning transparent. Keeping the art as text means a sprite
 * can be edited in place without a drawing tool or a binary asset — which
 * matters at 2am.
 *
 * Rendering merges horizontal runs of the same colour into a single <rect>,
 * so a 16x20 ground tile costs tens of nodes rather than hundreds.
 */

export type Palette = Record<string, string>

export type Sprite = {
  rows: string[]
  palette: Palette
}

type Run = { x: number; y: number; w: number; fill: string }

export function spriteRuns({ rows, palette }: Sprite): Run[] {
  const runs: Run[] = []

  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const char = row[x]
      let width = 1
      while (x + width < row.length && row[x + width] === char) width++

      const fill = palette[char]
      if (fill) runs.push({ x, y, w: width, fill })

      x += width
    }
  })

  return runs
}

export function spriteSize({ rows }: Sprite) {
  return {
    width: Math.max(...rows.map((row) => row.length)),
    height: rows.length,
  }
}

type PixelArtProps = {
  sprite: Sprite
  /** CSS pixels per sprite pixel. */
  scale?: number
  className?: string
  style?: React.CSSProperties
}

export function PixelArt({
  sprite,
  scale = 4,
  className,
  style,
}: PixelArtProps) {
  const { width, height } = spriteSize(sprite)

  return (
    <svg
      width={width * scale}
      height={height * scale}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      className={`pixel-art${className ? ` ${className}` : ''}`}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {spriteRuns(sprite).map((run, i) => (
        <rect
          key={i}
          x={run.x}
          y={run.y}
          width={run.w}
          height={1}
          fill={run.fill}
        />
      ))}
    </svg>
  )
}

type PixelTileProps = {
  sprite: Sprite
  scale?: number
  className?: string
}

/**
 * The same sprite data tiled horizontally to fill any width, via an SVG
 * <pattern>. Used for ground strips, which must span the viewport without
 * stretching a single pixel out of square.
 */
export function PixelTile({ sprite, scale = 4, className }: PixelTileProps) {
  const { width, height } = spriteSize(sprite)
  const id = `tile-${width}x${height}-${Object.values(sprite.palette).join('')}`

  return (
    <svg
      width="100%"
      height={height * scale}
      shapeRendering="crispEdges"
      className={`pixel-art${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          id={id}
          width={width * scale}
          height={height * scale}
          patternUnits="userSpaceOnUse"
        >
          {spriteRuns(sprite).map((run, i) => (
            <rect
              key={i}
              x={run.x * scale}
              y={run.y * scale}
              width={run.w * scale}
              height={scale}
              fill={run.fill}
            />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
