import type { Notification } from '@/types'
import { timeAgo } from '@/lib/utils'

export default function Notifications({ notifications }: { notifications: Notification[] }) {
  return (
    <div>
      {notifications.map((n) => {
        const isUnread = !n.read
        const isWarn = n.type === 'warn'
        return (
          <div key={n.id} style={{ display: 'grid', gridTemplateColumns: '8px 1fr auto', gap: 12, padding: '12px 20px', borderTop: '1px solid var(--line-1)', alignItems: 'flex-start', cursor: 'pointer' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 5, background: isWarn ? 'var(--warn)' : isUnread ? 'var(--accent)' : 'var(--fg-4)' }} />
            <div style={{ fontSize: 13, color: isUnread ? 'var(--fg-1)' : 'var(--fg-2)', lineHeight: 1.5 }}>
              <b style={{ color: isWarn ? 'var(--warn)' : 'var(--accent)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                {n.title}
              </b>
              {' · '}
              {n.body}
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', whiteSpace: 'nowrap' }}>
              {timeAgo(n.created_at)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
