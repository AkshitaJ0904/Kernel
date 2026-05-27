import type { Contest } from '@/types'

export default function ContestTicker({ contests }: { contests: Contest[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {contests.map((c) => {
        const urgent = c.time_remaining_human.startsWith('3d') || c.time_remaining_human.startsWith('1d') || c.time_remaining_human.startsWith('2d')
        return (
          <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, padding: '12px 16px', background: 'var(--bg-1)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-1)' }}>{c.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>
                {c.platform} · {c.duration_minutes}m · {c.problem_count} problems
              </div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: urgent ? 'var(--warn)' : 'var(--accent)', whiteSpace: 'nowrap' }}>
              {c.time_remaining_human}
            </span>
          </div>
        )
      })}
    </div>
  )
}
