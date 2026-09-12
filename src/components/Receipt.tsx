import { useEffect } from 'react'
import {
  CO2_COMPARISON_SOURCE,
  co2ComparisonText,
  WATER_COMPARISON_SOURCE,
  waterComparisonText,
} from '../data/comparisons'
import { resolveIcon } from '../data/iconRegistry'
import type { ElementDef, RecipeData } from '../data/types'
import type { FootprintDetail } from '../solver/solver'
import { computeFootprintDetail } from '../solver/solver'
import { PixelArt } from './PixelArt'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

type ReceiptProps = {
  element: ElementDef
  data: RecipeData
  /** Which route the player actually took for each multi-route id (see useGameState). */
  routes: Record<string, string | undefined>
  onClose: () => void
}

/** "2,340 L" or "178 g CO₂" — whichever side of a footprint is nonzero. */
function formatFootprint(cost: { waterL: number; co2kg: number }): string {
  if (cost.waterL > 0) return `${cost.waterL.toLocaleString()} L`
  if (cost.co2kg > 0) return `${(cost.co2kg * 1000).toLocaleString()} g CO₂`
  return '0'
}

/**
 * The "level complete" screen for a target — the payoff for every citation
 * and every real number verified into the data. Shows its work rather than
 * asserting a total: the dependency tree, which specific steps carried a
 * real cost, and every source cited anywhere in the chain.
 */
export function Receipt({ element, data, routes, onClose }: ReceiptProps) {
  const detail: FootprintDetail = computeFootprintDetail(data, element.id, routes)
  const { total, ancestors, costSteps, routeComparisons, sources } = detail

  // Ancestors minus the target itself — "what went into this."
  const ingredients = ancestors.filter((a) => a.id !== element.id)

  const hasWater = total.waterL > 0
  const hasCo2 = total.co2kg > 0
  const hasFootprint = hasWater || hasCo2

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-5 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-name"
    >
      <Card className="flex max-h-full w-full max-w-lg flex-col overflow-hidden">
        <div className="flex flex-col items-center gap-3 p-8 pb-6 text-center">
          <p className="text-xs font-extrabold tracking-wide text-brand uppercase">
            Target reached
          </p>
          <PixelArt sprite={resolveIcon(element.icon)} scale={6} />
          <h2 id="receipt-name" className="text-2xl font-extrabold text-ink">
            {element.name}
          </h2>
          {element.blurb && (
            <p className="text-sm leading-snug text-ink">{element.blurb}</p>
          )}
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto border-t border-hairline px-8 py-6">
          {hasFootprint ? (
            <div className="flex flex-col items-center gap-1 text-center">
              {hasWater && (
                <>
                  <p className="text-3xl font-extrabold text-everyday">
                    {total.waterL.toLocaleString()} L
                  </p>
                  <p className="text-sm font-semibold text-muted">
                    of water — {waterComparisonText(total.waterL)} of an adult's
                    recommended drinking water
                  </p>
                </>
              )}
              {hasCo2 && (
                <>
                  <p className="text-3xl font-extrabold text-everyday">
                    {(total.co2kg * 1000).toLocaleString()} g CO₂
                  </p>
                  <p className="text-sm font-semibold text-muted">
                    — {co2ComparisonText(total.co2kg)} of average car driving
                  </p>
                </>
              )}
            </div>
          ) : (
            <p className="text-center text-sm font-semibold text-muted">
              Every step here is real, but we don't have a solid water or CO₂
              figure for this one yet.
            </p>
          )}

          {costSteps.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-extrabold tracking-wide text-muted uppercase">
                Where the numbers come from
              </p>
              <ul className="flex flex-col gap-1.5">
                {costSteps.map((step) => (
                  <li
                    key={step.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="font-semibold text-ink">
                      {step.name} <span className="text-muted">({step.process})</span>
                    </span>
                    <span className="shrink-0 font-bold text-everyday">
                      {step.cost.waterL > 0 && `${step.cost.waterL.toLocaleString()} L`}
                      {step.cost.co2kg > 0 && `${(step.cost.co2kg * 1000).toLocaleString()} g CO₂`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {routeComparisons.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-extrabold tracking-wide text-muted uppercase">
                Same target, a different way
              </p>
              {routeComparisons.map((rc) => {
                // Compared per-dimension, not summed across units — water and
                // CO2 are never meaningfully addable, and today no target has
                // both nonzero at once anyway.
                const waterDiff = rc.chosen.cost.waterL - rc.alternate.cost.waterL
                const co2Diff = rc.chosen.cost.co2kg - rc.alternate.cost.co2kg
                const saved =
                  waterDiff > 0 || co2Diff > 0
                    ? formatFootprint({
                        waterL: Math.max(waterDiff, 0),
                        co2kg: Math.max(co2Diff, 0),
                      })
                    : null
                return (
                  <div
                    key={rc.id}
                    className="flex flex-col gap-2 rounded-row border border-hairline p-3"
                  >
                    <p className="text-sm font-extrabold text-ink">{rc.name}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-ink">
                        This time: {rc.chosen.route ?? rc.chosen.process} (
                        {rc.chosen.process})
                      </span>
                      <span className="font-bold text-everyday">
                        {formatFootprint(rc.chosen.cost)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-muted">
                        Alternative: {rc.alternate.route ?? rc.alternate.process} (
                        {rc.alternate.process})
                      </span>
                      <span className="font-bold text-muted">
                        {formatFootprint(rc.alternate.cost)}
                      </span>
                    </div>
                    {saved && (
                      <p className="text-xs font-bold text-brand">
                        The other route would have saved {saved}. Try it next
                        time.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-xs font-extrabold tracking-wide text-muted uppercase">
              What went into this ({ingredients.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ingredients.map((a) => (
                <span
                  key={a.id}
                  className="rounded-full border border-hairline px-2.5 py-1 text-xs font-bold text-ink"
                >
                  {a.name}
                </span>
              ))}
            </div>
          </div>

          {sources.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-extrabold tracking-wide text-muted uppercase">
                Sources
              </p>
              <div className="flex flex-wrap gap-2">
                {sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-hairline px-3 py-1 text-xs font-bold text-muted transition-colors duration-150 hover:border-brand hover:text-brand"
                  >
                    ⓘ {source.label}
                  </a>
                ))}
                {hasWater && (
                  <a
                    href={WATER_COMPARISON_SOURCE.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-hairline px-3 py-1 text-xs font-bold text-muted transition-colors duration-150 hover:border-brand hover:text-brand"
                  >
                    ⓘ {WATER_COMPARISON_SOURCE.label}
                  </a>
                )}
                {hasCo2 && (
                  <a
                    href={CO2_COMPARISON_SOURCE.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-hairline px-3 py-1 text-xs font-bold text-muted transition-colors duration-150 hover:border-brand hover:text-brand"
                  >
                    ⓘ {CO2_COMPARISON_SOURCE.label}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-hairline p-6">
          <Button onClick={onClose} className="w-full">
            Continue
          </Button>
        </div>
      </Card>
    </div>
  )
}
