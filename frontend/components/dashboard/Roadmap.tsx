import type { RoadmapStep } from '@/types'

export default function Roadmap({ steps }: { steps: RoadmapStep[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {steps.map((s) => (
        <div key={s.num} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto 40px', gap: 12, alignItems: 'center', padding: '8px 0' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: s.status !== 'todo' ? 'var(--accent)' : 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {s.num}
          </span>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: s.status === 'done' ? 'var(--fg-3)' : 'var(--fg-1)', textDecoration: s.status === 'done' ? 'line-through' : 'none', textDecorationColor: 'var(--fg-5)' }}>
              {s.name}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', marginTop: 4 }}>{s.sub}</div>
          </div>
          <div style={{ width: 96, height: 4, background: 'var(--bg-1)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: s.status === 'todo' ? 'var(--fg-5)' : 'var(--accent)', width: `${s.pct}%` }} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: s.status === 'active' ? 'var(--accent)' : 'var(--fg-3)', textAlign: 'right' }}>
            {s.pct}%
          </span>
        </div>
      ))}
      {steps.length === 0 && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>loading...</div>
      )}
    </div>
  )
}
