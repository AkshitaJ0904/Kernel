import type { ActivityEntry } from '@/types'
import { timeAgo } from '@/lib/utils'

export default function ActivityLog({ entries }: { entries: ActivityEntry[] }) {
  return (
    <div>
      {entries.map((e) => (
        <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '76px 1fr auto', gap: 12, padding: '10px 20px', borderTop: '1px solid var(--line-1)', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          <span style={{ color: 'var(--accent)' }}>{e.git_hash}</span>
          <span style={{ color: 'var(--fg-1)' }}>{e.title}</span>
          <span style={{ color: 'var(--fg-3)', whiteSpace: 'nowrap' }}>{timeAgo(e.created_at)}</span>
        </div>
      ))}
    </div>
  )
}
