import { GAME_DATA } from '../src/data/gameData'
import { runSolver } from '../src/solver/solver'
import type { RecipeData } from '../src/data/types'

const data: RecipeData = GAME_DATA

const report = runSolver(data)

console.log('\nElement report')
console.log('─'.repeat(72))
console.log(
  ['id', 'realm', 'depth', 'reach', 'waterL', 'co2kg'].map((h) => h.padEnd(12)).join(''),
)
for (const el of report.elements) {
  console.log(
    [
      el.id,
      el.realm,
      el.depth ?? '—',
      el.reachable ? 'yes' : 'NO',
      el.footprint?.waterL ?? '—',
      el.footprint?.co2kg ?? '—',
    ]
      .map((v) => String(v).padEnd(12))
      .join(''),
  )
}

if (report.issues.length > 0) {
  console.log('\nIssues')
  console.log('─'.repeat(72))
  for (const issue of report.issues) {
    console.log(`${issue.level === 'error' ? '✗' : '⚠'} ${issue.message}`)
  }
} else {
  console.log('\nNo issues.')
}

console.log()

if (!report.ok) {
  console.error('Solver failed: graph has errors (see above).')
  process.exit(1)
}

console.log('Solver passed.')
