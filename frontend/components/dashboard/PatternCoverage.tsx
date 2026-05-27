import type { PatternCoverage } from '@/types'

export default function PatternCoverageGrid({ patterns }: { patterns: PatternCoverage[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 24px' }}>
      {patterns.map((p) => (
        <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, padding: '6px 0', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-2)' }}>{p.name}</span>
          <div style={{ width: 80, height: 4, background: 'var(--bg-1)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--accent)', width: `${p.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
