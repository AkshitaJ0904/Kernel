'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { Search, Bell } from 'lucide-react'
import api, { endpoints } from '@/lib/api'
import type { Notification } from '@/types'

interface TopbarProps {
  crumb?: string
  streakDays?: number
  unreadCount?: number
}

export default function Topbar({ crumb = 'dashboard', streakDays = 0, unreadCount = 0 }: TopbarProps) {
  const { data: session } = useSession()
  const user = session?.user as Record<string, string> | undefined
  const [notifOpen, setNotifOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get(endpoints.notifications).then(r => r.data.results ?? r.data),
    enabled: notifOpen,
    staleTime: 30_000,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: number) => api.post(endpoints.notificationRead(id), {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  useEffect(() => {
    if (!notifOpen) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  const displayUnread = notifications ? notifications.filter(n => !n.read).length : unreadCount

  return (
    <header style={{ height: 48, borderBottom: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, background: 'var(--bg-0)', position: 'sticky', top: 0, zIndex: 5 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
        <b style={{ color: 'var(--fg-1)', fontWeight: 500 }}>kernel/</b>
        <span style={{ color: 'var(--fg-4)', margin: '0 6px' }}>/</span>
        {crumb}
      </span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', padding: '4px 10px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-2)' }}>
          streak <b style={{ color: 'var(--accent)', fontWeight: 500 }}>{streakDays}d</b>
        </span>
        <button style={{ width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-4)', border: '1px solid transparent', cursor: 'pointer', color: 'var(--fg-2)', background: 'transparent' }}>
          <Search size={14} />
        </button>

        {/* Bell with notification dropdown */}
        <div ref={panelRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            style={{
              width: 28,
              height: 28,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--r-4)',
              border: notifOpen ? '1px solid var(--line-3)' : '1px solid transparent',
              cursor: 'pointer',
              color: notifOpen ? 'var(--fg-1)' : 'var(--fg-2)',
              background: notifOpen ? 'var(--bg-2)' : 'transparent',
              position: 'relative',
            }}
          >
            <Bell size={14} />
            {displayUnread > 0 && (
              <span style={{ position: 'absolute', top: 5, right: 5, width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }} />
            )}
          </button>

          {notifOpen && (
            <div style={{ position: 'absolute', top: 36, right: 0, width: 340, background: 'var(--bg-2)', border: '1px solid var(--line-3)', borderRadius: 'var(--r-4)', boxShadow: 'var(--shadow-popover)', zIndex: 50 }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>notifications</span>
                {displayUnread > 0 && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)' }}>
                    {displayUnread} unread
                  </span>
                )}
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {!notifications ? (
                  <div style={{ padding: 16, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
                    loading...
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
                    all caught up.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && markReadMutation.mutate(n.id)}
                      style={{
                        padding: '12px 16px',
                        borderTop: '1px solid var(--line-1)',
                        cursor: n.read ? 'default' : 'pointer',
                        background: n.read ? 'transparent' : 'rgba(57,255,122,0.04)',
                        transition: 'background var(--dur-2) var(--ease)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: n.read ? 'var(--fg-3)' : 'var(--fg-1)', lineHeight: 1.4 }}>
                          {n.title}
                        </div>
                        {!n.read && (
                          <span style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', flexShrink: 0, marginTop: 4 }} />
                        )}
                      </div>
                      {n.body && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', marginTop: 4, lineHeight: 1.4 }}>
                          {n.body}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--line-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          {user?.username?.slice(0, 2).toUpperCase() || 'AK'}
        </div>
      </div>
    </header>
  )
}
