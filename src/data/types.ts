export type RealmId = 'survival' | 'everyday'

export type Source = {
  label: string
  url: string
}

export type ElementDef = {
  id: string
  name: string
  /** Sprite key into src/art/sprites.ts — kept as a string so data stays JSON-able. */
  icon: string
  realm: RealmId
  /** Shown on the codex entry once discovered. */
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
}
