/*
 * Generic, source-pinned unit conversions for turning a raw footprint number
 * into something a player can actually feel — applied the same way to every
 * target, rather than a bespoke comparison hand-picked per target (which
 * would need its own citation each time, and would tempt picking whichever
 * comparison sounds most dramatic instead of whichever is most accurate).
 */

/** EFSA adult total water intake guideline. */
export const LITERS_PER_DAY_DRINKING_WATER = 2.5
export const WATER_COMPARISON_SOURCE = {
  label: 'Drinking water — Wikipedia',
  url: 'https://en.wikipedia.org/wiki/Drinking_water',
}

/** EPA estimate for a typical passenger vehicle. */
export const CO2_KG_PER_MILE_DRIVEN = 0.4
export const CO2_COMPARISON_SOURCE = {
  label: 'Greenhouse Gas Emissions from a Typical Passenger Vehicle — EPA',
  url: 'https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle',
}

const DAYS_PER_YEAR = 365.25

/** e.g. "about 3 years" or "about 12 days" of an adult's recommended drinking water. */
export function waterComparisonText(waterL: number): string {
  const days = waterL / LITERS_PER_DAY_DRINKING_WATER
  if (days >= 365) {
    const years = days / DAYS_PER_YEAR
    // One decimal for precision, unless it rounds to a clean whole number —
    // "about 3.0 years" reads worse than "about 3 years" for no real gain.
    const rounded = years < 10 ? years.toFixed(1).replace(/\.0$/, '') : Math.round(years).toString()
    return `about ${rounded} year${years >= 1.05 ? 's' : ''}`
  }
  return `about ${Math.max(1, Math.round(days))} day${days >= 1.5 ? 's' : ''}`
}

/** e.g. "about 0.4 miles" of average car driving. */
export function co2ComparisonText(co2kg: number): string {
  const miles = co2kg / CO2_KG_PER_MILE_DRIVEN
  const rounded = miles < 10 ? miles.toFixed(1) : Math.round(miles).toString()
  return `about ${rounded} mile${miles >= 1.05 ? 's' : ''}`
}
