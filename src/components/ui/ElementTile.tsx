import type { Sprite } from '../PixelArt'
import { PixelArt } from '../PixelArt'

type ElementTileProps = {
  icon: Sprite
  label: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}

/**
 * Inventory / workspace tile: a pixel icon inside a clean bordered square —
 * the same retro-icon-in-clean-frame pairing as the realm rows on the start
 * screen, just laid out as a grid tile instead of a list row.
 */
export function ElementTile({
  icon,
  label,
  selected = false,
  disabled = false,
  onClick,
}: ElementTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-row border-2 p-3 transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? 'border-brand bg-brand-soft'
          : 'border-hairline bg-white hover:border-brand'
      }`}
    >
      <PixelArt sprite={icon} scale={3} />
      <span className="text-center text-xs leading-tight font-bold text-ink">
        {label}
      </span>
    </button>
  )
}
