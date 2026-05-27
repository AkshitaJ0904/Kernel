'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import BlinkingCursor from '@/components/ui/BlinkingCursor'
import type { Contest } from '@/types'

const platformColor = (p: string) => {
  if (p === 'leetcode') return '#FFA116'
  if (p === 'codeforces') return '#3B8BEB'
  return 'var(--accent)'
}

export default function ContestsPage() {
  const qc = useQueryClient()
  const { data: contests, isLoading } = useQuery<Contest[]>({
    queryKey: ['arena', 'contests'],
    queryFn: () => api.get(endpoints.arena.contests).then(r => r.data.results ?? r.data),
  })

  const joinMutation = useMutation({
    mutationFn: (slug: string) => api.post(endpoints.arena.joinContest(slug), {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['arena', 'contests'] }),
  })

  return (
    <>
      <Topbar crumb="arena / contests" />
      <div style={{ padding: 32, maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        <span className="eyebrow">// arena · upcoming contests</span>
        <h1 style={{ fontSize: 36, marginTop: 8, marginBottom: 24 }}>
          contests<span style={{ color: 'var(--accent)' }}>/</span>
        </h1>

        {isLoading ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>loading<BlinkingCursor /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(contests ?? []).map(c => (
              <div key={c.id} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 24, alignItems: 'center', padding: '20px 24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: platformColor(c.platform), textTransform: 'uppercase', letterSpacing: '0.12em', border: `1px solid ${platformColor(c.platform)}30`, padding: '2px 8px', borderRadius: 'var(--r-2)' }}>
                      {c.platform}
                    </span>
                    {c.is_joined && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', border: '1px solid var(--accent-line)', padding: '2px 8px', borderRadius: 'var(--r-2)' }}>
                        registered
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.name}</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>duration</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--fg-1)' }}>{c.duration_minutes}m</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>problems</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--fg-1)' }}>{c.problem_count}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--warn)' }}>{c.time_remaining_human}</span>
                  <button
                    className={`btn ${c.is_joined ? '' : 'btn-primary'}`}
                    style={{ fontSize: 12 }}
                    onClick={() => !c.is_joined && joinMutation.mutate(c.slug)}
                    disabled={c.is_joined || joinMutation.isPending}
                  >
                    {c.is_joined ? '✓ registered' : '+ register'}
                  </button>
                </div>
              </div>
            ))}
            {!contests?.length && !isLoading && (
              <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>
                no upcoming contests.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
