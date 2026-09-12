import type { RecipeData } from './types'

/*
 * Small hand-computable fixture for testing the SOLVER's own arithmetic —
 * not game content. Real, source-pinned data lives in `gameData.ts` and is
 * what App.tsx and scripts/solve.ts actually run against as of step 11.
 *
 * This file stays because its numbers are hand-traceable on paper (see the
 * comment block below), which real recipe data never is — useful as a
 * regression fixture if the solver's math ever needs re-verifying.
 *
 * Shape is chosen on purpose, not arbitrary:
 *   - `spark` is a shared ancestor reachable two ways (directly, and via
 *     `fire`), which is exactly the double-counting trap step 6's footprint
 *     accumulator has to dedupe against.
 *   - depths form a clean ladder (0, 0, 1, 1, 2, 3) for checking the
 *     topological-sort depth pass in step 5.
 *
 * Hand-computed answers for the eventual solver checks:
 *   naive (double-counts spark)  -> co2kg 0.09, waterL 2
 *   deduped (counts spark once) -> co2kg 0.08, waterL 2
 */
export const SEED_DATA: RecipeData = {
  elements: [
    { id: 'tinder', name: 'Tinder', icon: 'tinder', realm: 'survival', blurb: '', sources: [] },
    { id: 'kindling', name: 'Kindling', icon: 'kindling', realm: 'survival', blurb: '', sources: [] },
    { id: 'flint', name: 'Flint', icon: 'flint', realm: 'survival', blurb: '', sources: [] },
    { id: 'steel', name: 'Steel', icon: 'steel', realm: 'survival', blurb: '', sources: [] },
    {
      id: 'spark',
      name: 'Spark',
      icon: 'spark',
      realm: 'survival',
      // One genuinely real blurb/citation on an otherwise-placeholder graph —
      // proves the discovery card's citation link works against real content,
      // ahead of step 11 giving every node its own.
      blurb: 'Striking hardened steel against flint shears off tiny fragments hot enough to ignite in air — a technique that predates matches by thousands of years.',
      sources: [{ label: 'Fire striker — Wikipedia', url: 'https://en.wikipedia.org/wiki/Fire_striker' }],
    },
    { id: 'tinder_bundle', name: 'Tinder Bundle', icon: 'tinder_bundle', realm: 'survival', blurb: '', sources: [] },
    { id: 'fire', name: 'Fire', icon: 'fire', realm: 'survival', blurb: '', sources: [] },
    { id: 'signal_fire', name: 'Signal Fire', icon: 'signal_fire', realm: 'survival', blurb: '', sources: [] },
  ],
  recipes: [
    {
      inputs: ['flint', 'steel'],
      output: 'spark',
      process: 'striking',
      cost: { waterL: 0, co2kg: 0.01 },
      sources: [],
    },
    {
      inputs: ['kindling', 'tinder'],
      output: 'tinder_bundle',
      process: 'bundling',
      cost: { waterL: 0, co2kg: 0 },
      sources: [],
    },
    {
      inputs: ['spark', 'tinder_bundle'],
      output: 'fire',
      process: 'igniting',
      cost: { waterL: 0, co2kg: 0.02 },
      sources: [],
    },
    {
      inputs: ['fire', 'spark'],
      output: 'signal_fire',
      process: 'stacking',
      cost: { waterL: 2, co2kg: 0.05 },
      sources: [],
    },
  ],
  starters: {
    survival: ['tinder', 'kindling', 'flint', 'steel'],
    everyday: [],
  },
  targets: {
    survival: ['fire', 'signal_fire'],
    everyday: [],
  },
}
