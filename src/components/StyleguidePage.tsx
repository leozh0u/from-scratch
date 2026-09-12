import { useState } from 'react'
import { FLAME, SHIRT } from '../art/sprites'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { ElementTile } from './ui/ElementTile'
import { ProgressBar } from './ui/ProgressBar'

const SWATCHES: { label: string; var: string }[] = [
  { label: 'brand', var: '--color-brand' },
  { label: 'brand-deep', var: '--color-brand-deep' },
  { label: 'brand-soft', var: '--color-brand-soft' },
  { label: 'ink', var: '--color-ink' },
  { label: 'muted', var: '--color-muted' },
  { label: 'hairline', var: '--color-hairline' },
  { label: 'survival', var: '--color-survival' },
  { label: 'survival-soft', var: '--color-survival-soft' },
  { label: 'everyday', var: '--color-everyday' },
  { label: 'everyday-soft', var: '--color-everyday-soft' },
]

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-extrabold tracking-wide text-muted uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function StyleguidePage() {
  const [selectedTile, setSelectedTile] = useState(0)
  const [progress, setProgress] = useState(40)

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-12">
      <header>
        <h1 className="text-3xl font-extrabold text-ink">Styleguide</h1>
        <p className="mt-1 text-muted">
          UI primitives — the clean panel layer, not the pixel scene. Dev-only,
          not reachable in the production build.
        </p>
      </header>

      <Section title="Colours">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {SWATCHES.map((s) => (
            <div key={s.var} className="flex flex-col gap-2">
              <div
                className="h-14 rounded-row border border-hairline"
                style={{ background: `var(${s.var})` }}
              />
              <span className="text-xs font-semibold text-muted">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="primary" size="lg">
            Primary large
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
        <p className="text-sm text-muted">
          Press and hold one — the shadow should collapse and the button
          should sit down by a few pixels.
        </p>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-3">
          <Badge tone="var(--color-brand)" soft="var(--color-brand-soft)">
            Tutorial
          </Badge>
          <Badge
            tone="var(--color-survival)"
            soft="var(--color-survival-soft)"
          >
            Survival
          </Badge>
          <Badge tone="var(--color-everyday)" soft="var(--color-everyday-soft)">
            Everyday
          </Badge>
        </div>
      </Section>

      <Section title="Progress bar">
        <div className="flex flex-col gap-3">
          <ProgressBar value={progress} />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setProgress((p) => Math.max(0, p - 20))}
            >
              −20
            </Button>
            <Button
              variant="secondary"
              onClick={() => setProgress((p) => Math.min(100, p + 20))}
            >
              +20
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Element tiles">
        <div className="flex gap-4">
          <ElementTile
            icon={FLAME}
            label="Fire"
            selected={selectedTile === 0}
            onClick={() => setSelectedTile(0)}
          />
          <ElementTile
            icon={SHIRT}
            label="T-Shirt"
            selected={selectedTile === 1}
            onClick={() => setSelectedTile(1)}
          />
          <ElementTile icon={FLAME} label="Locked" disabled />
        </div>
      </Section>

      <Section title="Card">
        <Card className="max-w-sm p-6">
          <p className="font-semibold text-ink">
            This is the same panel surface the start screen sits its realm
            menu inside.
          </p>
        </Card>
      </Section>
    </main>
  )
}
