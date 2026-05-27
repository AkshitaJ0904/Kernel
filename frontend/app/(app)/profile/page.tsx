'use client'

import { useQuery } from '@tanstack/react-query'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import type { User } from '@/types'

export default function ProfilePage() {
  const { data: user } = useQuery<User>({
    queryKey: ['me'],
    queryFn: () => api.get(endpoints.auth.me).then(r => r.data),
  })

  return (
    <>
      <Topbar crumb="profile" />
      <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
        <span className="eyebrow">// profile</span>
        <div style={{ display: 'flex', gap: 24, marginTop: 24, alignItems: 'flex-start' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--line-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 24, flexShrink: 0 }}>
            {user?.username?.slice(0, 2).toUpperCase() ?? 'AK'}
          </div>
          <div>
            <h1 style={{ fontSize: 32 }}>{user?.username ?? 'aarav.k'}</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)', marginTop: 4 }}>
              {user?.college ?? 'iit bombay'} · {user?.graduation_year ?? '2027'} · @{user?.github_username ?? 'aaravk'}
            </p>
            {user?.bio && <p style={{ fontSize: 15, marginTop: 12 }}>{user.bio}</p>}
          </div>
        </div>

        {user?.profile && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--line-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', overflow: 'hidden', marginTop: 32 }}>
            {[
              { l: 'problems solved', v: user.profile.total_solved },
              { l: 'streak', v: `${user.profile.streak_current}d` },
              { l: 'prs merged', v: user.profile.total_prs_merged },
            ].map(({ l, v }) => (
              <div key={l} style={{ background: 'var(--bg-2)', padding: '16px 20px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{l}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, marginTop: 6 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
