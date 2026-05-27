'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import BlinkingCursor from '@/components/ui/BlinkingCursor'
import Link from 'next/link'

interface Module {
  id: number
  title: string
  slug: string
  order: number
  estimated_minutes: number
  user_status: 'not_started' | 'in_progress' | 'completed'
}

interface Project {
  id: number
  title: string
  slug: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  repo_template_url: string
  user_status: 'not_started' | 'in_progress' | 'completed'
}

interface TrackDetail {
  id: number
  name: string
  display_name: string
  language: string
  description: string
  module_count: number
  completed_count: number
  modules: Module[]
  projects: Project[]
}

const statusColor = (s: string) => {
  if (s === 'completed') return 'var(--accent)'
  if (s === 'in_progress') return 'var(--warn)'
  return 'var(--fg-4)'
}

const statusLabel = (s: string) => {
  if (s === 'completed') return '[x]'
  if (s === 'in_progress') return '[~]'
  return '[ ]'
}

const diffColors: Record<string, string> = {
  easy: 'var(--diff-easy)',
  medium: 'var(--diff-med)',
  hard: 'var(--diff-hard)',
}

export default function TrackPage({ params }: { params: { name: string } }) {
  const qc = useQueryClient()

  const { data: track, isLoading, isError } = useQuery<TrackDetail>({
    queryKey: ['workshop', 'track', params.name],
    queryFn: () => api.get(endpoints.workshop.track(params.name)).then(r => r.data),
  })

  const progressMutation = useMutation({
    mutationFn: ({ module, status }: { module: number; status: string }) =>
      api.post(endpoints.workshop.progress, { module, status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workshop', 'track', params.name] }),
  })

  const pct = track ? Math.round((track.completed_count / (track.module_count || 1)) * 100) : 0

  return (
    <>
      <Topbar crumb={`workshop / ${params.name}`} />
      <div style={{ padding: 32, maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        {isError ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--danger)' }}>error loading track. try refreshing.</div>
        ) : isLoading ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>loading<BlinkingCursor /></div>
        ) : track ? (
          <>
            <span className="eyebrow">// workshop · {track.language}</span>
            <h1 style={{ fontSize: 36, marginTop: 8, marginBottom: 8 }}>
              {track.display_name}<span style={{ color: 'var(--accent)' }}>/</span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--fg-2)', marginBottom: 8 }}>{track.description}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{ flex: 1, maxWidth: 320, height: 4, background: 'var(--bg-1)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--accent)', width: `${pct}%`, transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: pct > 0 ? 'var(--accent)' : 'var(--fg-3)' }}>
                {track.completed_count} / {track.module_count} modules · {pct}%
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: track.projects?.length ? '1fr 360px' : '1fr', gap: 24 }}>
              {/* modules */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 12 }}>// modules</div>
                <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)' }}>
                  {track.modules?.map((m, i) => (
                    <Link key={m.id} href={`/workshop/${params.name}/${m.slug}`} style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 16, padding: '14px 20px', borderTop: i === 0 ? 0 : '1px solid var(--line-1)', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: statusColor(m.user_status) }}>
                        {statusLabel(m.user_status)}
                      </span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: m.user_status === 'completed' ? 'var(--fg-3)' : 'var(--fg-1)', textDecoration: m.user_status === 'completed' ? 'line-through' : 'none', textDecorationColor: 'var(--fg-5)' }}>
                          {String(i + 1).padStart(2, '0')} · {m.title}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', marginTop: 3 }}>
                          est. {m.estimated_minutes}m
                        </div>
                      </div>
                      <select
                        value={m.user_status}
                        onClick={e => e.stopPropagation()}
                        onChange={e => progressMutation.mutate({ module: m.id, status: e.target.value })}
                        className="input"
                        style={{ width: 'auto', fontSize: 11, padding: '4px 8px' }}
                      >
                        <option value="not_started">not started</option>
                        <option value="in_progress">in progress</option>
                        <option value="completed">completed</option>
                      </select>
                    </Link>
                  ))}
                  {!track.modules?.length && (
                    <div style={{ padding: 24, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>no modules yet.</div>
                  )}
                </div>
              </div>

              {/* projects */}
              {track.projects?.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 12 }}>// projects</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {track.projects.map(p => (
                      <div key={p.id} className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <h4 style={{ fontSize: 15, fontFamily: 'var(--font-mono)' }}>{p.title}</h4>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: diffColors[p.difficulty] }}>{p.difficulty}</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--fg-2)', marginBottom: 12 }}>{p.description}</p>
                        {p.repo_template_url && (
                          <a href={p.repo_template_url} target="_blank" rel="noopener noreferrer" className="btn" style={{ fontSize: 11, padding: '4px 12px' }}>
                            use template →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>track not found.</div>
        )}
      </div>
    </>
  )
}
