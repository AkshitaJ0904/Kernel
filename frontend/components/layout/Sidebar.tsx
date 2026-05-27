'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import { Home, Upload, CheckSquare, Activity, Code2, Globe, Play, Clock, Star, User, Settings } from 'lucide-react'
import type { DashboardData } from '@/types'

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user as Record<string, unknown> | undefined
  const qc = useQueryClient()
  const dash = qc.getQueryData<DashboardData>(['dashboard'])

  const displayUsername = typeof user?.username === 'string' ? user.username : 'aarav.k'
  const college = typeof user?.college === 'string' ? user.college : ''
  const gradYear = typeof user?.graduation_year === 'number' ? user.graduation_year : null
  const tagline = [college, gradYear != null ? `'${String(gradYear).slice(-2)}` : ''].filter(Boolean).join(' ')

  const navSections = [
    {
      label: '// home',
      items: [
        { href: '/dashboard', label: 'dashboard', icon: Home },
        { href: '/roadmap', label: 'roadmap', icon: Upload, count: '62%' },
        { href: '/activity', label: 'activity', icon: CheckSquare },
      ],
    },
    {
      label: '// pillars',
      items: [
        { href: '/arena', label: 'arena', icon: Activity, count: dash?.stats?.problems_solved?.toString() },
        { href: '/workshop', label: 'workshop', icon: Code2, count: '7' },
        { href: '/warroom', label: 'war room', icon: Globe, count: dash?.tracked_programs?.length?.toString() },
      ],
    },
    {
      label: '// arena',
      items: [
        { href: '/arena/daily', label: 'daily problem', icon: Play },
        { href: '/arena/contests', label: 'contests', icon: Clock, count: '3' },
        { href: '/arena/patterns', label: 'patterns', icon: Star },
      ],
    },
    {
      label: '// you',
      items: [
        { href: '/profile', label: 'profile', icon: User },
        { href: '/settings', label: 'settings', icon: Settings },
      ],
    },
  ]

  return (
    <aside style={{ background: 'var(--bg-1)', borderRight: '1px solid var(--line-2)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', width: 240, flexShrink: 0 }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 16, color: 'var(--fg-1)', border: 0 }}>
          kernel<span style={{ color: 'var(--accent)' }}>/</span>
        </Link>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)' }}>v0.4</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {navSections.map(({ label, items }) => (
          <div key={label}>
            <div style={{ padding: '14px 12px 6px', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--fg-4)' }}>
              {label}
            </div>
            {items.map(({ href, label: itemLabel, icon: Icon, count }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 12px', margin: '0 6px', borderRadius: 'var(--r-4)',
                    fontFamily: 'var(--font-mono)', fontSize: 13,
                    color: isActive ? 'var(--accent)' : 'var(--fg-2)',
                    background: isActive ? 'var(--accent-glow)' : 'transparent',
                    border: 0, textDecoration: 'none',
                    transition: 'background var(--dur-2) var(--ease), color var(--dur-2) var(--ease)',
                  }}
                >
                  {isActive && <span style={{ color: 'var(--accent)', fontSize: 13 }}>&gt; </span>}
                  <Icon size={14} />
                  {itemLabel}
                  {count && (
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: isActive ? 'var(--accent)' : 'var(--fg-4)' }}>
                      {count}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--line-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-1)', flexShrink: 0 }}>
          {displayUsername.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayUsername}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
            {tagline}
          </div>
        </div>
      </div>
    </aside>
  )
}
