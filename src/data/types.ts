export type RealmId = 'survival' | 'everyday'

/**
 * How much a citation is actually worth, stated rather than implied.
 *
 * The project's claim is that nothing is invented, and the honest way to keep
 * that claim at three hundred elements is to say which kind of checking each
 * citation has had — not to imply that every one had the strongest kind.
 *
 * `sourced` means a human opened the page, confirmed it says what the game
 * claims, and confirmed the units. It does not scale: nobody reads six hundred
 * articles in a night.
 *
 * `referenced` means the transformation is real and the article provably
 * EXISTS — `npm run links` fetches every URL, asserts it answers, and asserts
 * the page title still matches the label shown in the game. That is weaker
 * than a human reading it and it is machine-checkable at any size, which is
 * the trade being made deliberately.
 *
 * The rule that does NOT bend: a footprint number may only ever come from a
 * `sourced` citation. A referenced article is allowed to support "this
 * transformation happens"; it is never allowed to support "it costs 2,340
 * litres". See `scripts/datatest.ts`, which fails the build on that.
 */
export type SourceTier = 'sourced' | 'referenced'

export type Source = {
  label: string
  url: string
  /**
   * Defaults to `sourced` when absent, because every citation written before
   * this existed was hand-checked. New bulk-imported ones must say
   * `referenced` explicitly — the default is the strong claim, so forgetting
   * to set it cannot silently downgrade an old one, and an import that forgets
   * to set it fails the link check instead.
   */
  tier?: SourceTier
}

export type ElementDef = {
  id: string
  name: string
  /** Sprite key into src/art/sprites.ts — kept as a string so data stays JSON-able. */
  icon: string
  realm: RealmId
  /** Shown on the inventory entry once discovered. */
  blurb: string
  sources: Source[]
}

export type Footprint = {
  waterL: number
  co2kg: number
}

export type RecipeDef = {
  /** Exactly two input element ids, order-independent. */
  inputs: [string, string]
  output: string
  /**
   * Display-only flavor text ("spinning", "smelting"). Never read by game
   * logic — carries educational content without adding UI surface.
   */
  process: string
  cost: Footprint
  /** Set when a node has more than one real production route. */
  route?: string
  sources: Source[]
}

export type RecipeData = {
  elements: ElementDef[]
  recipes: RecipeDef[]
  /** Element ids each realm starts with, before any combining. */
  starters: Record<RealmId, string[]>
  /** The elements a realm's progress bar and target list track completion against. */
  targets: Record<RealmId, string[]>
}
