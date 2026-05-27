import type { Program } from '@/types'

const stripeColor = (color: string) => {
  if (color === 'accent') return 'var(--accent)'
  if (color === 'warn') return 'var(--warn)'
  return 'var(--fg-5)'
}

export default function ProgramsTracker({ programs }: { programs: Program[] }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {programs.map((p) => (
        <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '4px 1fr auto', gap: 14, padding: '12px 16px', background: 'var(--bg-1)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', alignItems: 'center' }}>
          <span style={{ width: 4, background: stripeColor(p.color), borderRadius: 2, alignSelf: 'stretch' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-1)' }}>{p.display_name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{p.description.split('.')[0]}</div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: p.color === 'warn' ? 'var(--warn)' : p.color === 'muted' ? 'var(--fg-3)' : 'var(--accent)', whiteSpace: 'nowrap' }}>
            {p.time_remaining_human}
          </span>
        </div>
      ))}
    </div>
  )
}
