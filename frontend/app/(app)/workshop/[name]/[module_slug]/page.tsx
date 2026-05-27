'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import BlinkingCursor from '@/components/ui/BlinkingCursor'

interface ModuleDetail {
  id: number
  title: string
  slug: string
  order: number
  estimated_minutes: number
  content_markdown: string
  user_status: 'not_started' | 'in_progress' | 'completed'
}

interface TrackMeta {
  id: number
  name: string
  display_name: string
  modules: { id: number; title: string; slug: string; order: number }[]
}

const statusColor = (s: string) =>
  s === 'completed' ? 'var(--accent)' : s === 'in_progress' ? 'var(--warn)' : 'var(--fg-4)'

export default function ModulePage({ params }: { params: { name: string; module_slug: string } }) {
  const qc = useQueryClient()

  const { data: mod, isLoading, isError } = useQuery<ModuleDetail>({
    queryKey: ['workshop', 'module', params.name, params.module_slug],
    queryFn: () => api.get(endpoints.workshop.module(params.name, params.module_slug)).then(r => r.data),
  })

  const { data: track } = useQuery<TrackMeta>({
    queryKey: ['workshop', 'track', params.name],
    queryFn: () => api.get(endpoints.workshop.track(params.name)).then(r => r.data),
  })

  const progressMutation = useMutation({
    mutationFn: (newStatus: string) =>
      api.post(endpoints.workshop.progress, { module: mod?.id, status: newStatus }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workshop', 'module', params.name, params.module_slug] })
      qc.invalidateQueries({ queryKey: ['workshop', 'track', params.name] })
    },
  })

  const modules = track?.modules ?? []
  const currentIdx = modules.findIndex(m => m.slug === params.module_slug)
  const prevMod = currentIdx > 0 ? modules[currentIdx - 1] : null
  const nextMod = currentIdx >= 0 && currentIdx < modules.length - 1 ? modules[currentIdx + 1] : null

  return (
    <>
      <Topbar crumb={`workshop / ${params.name} / ${params.module_slug}`} />
      <div style={{ padding: '32px 32px 64px', maxWidth: 860, margin: '0 auto', width: '100%' }}>

        {/* breadcrumb */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/workshop" style={{ color: 'var(--fg-4)', border: 0 }}>workshop</Link>
          <span style={{ color: 'var(--fg-5)' }}>/</span>
          <Link href={`/workshop/${params.name}`} style={{ color: 'var(--fg-4)', border: 0 }}>
            {track?.display_name ?? params.name}
          </Link>
          <span style={{ color: 'var(--fg-5)' }}>/</span>
          <span style={{ color: 'var(--fg-2)' }}>{mod?.title ?? params.module_slug}</span>
        </div>

        {isError ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--danger)' }}>error loading module. try refreshing.</div>
        ) : isLoading ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>
            loading<BlinkingCursor />
          </div>
        ) : mod ? (
          <>
            {/* header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 20, flexWrap: 'wrap' }}>
              <div>
                <span className="eyebrow">
                  // {track?.display_name ?? params.name} · module {String(mod.order).padStart(2, '0')}
                </span>
                <h1 style={{ fontSize: 32, marginTop: 8, marginBottom: 6 }}>
                  {mod.title}<span style={{ color: 'var(--accent)' }}>/</span>
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
                    est. {mod.estimated_minutes}m
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: statusColor(mod.user_status) }}>
                    {mod.user_status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <select
                value={mod.user_status}
                onChange={e => progressMutation.mutate(e.target.value)}
                className="input"
                style={{ width: 'auto', fontSize: 12, padding: '6px 12px', flexShrink: 0 }}
              >
                <option value="not_started">not started</option>
                <option value="in_progress">in progress</option>
                <option value="completed">completed</option>
              </select>
            </div>

            {/* module content */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', padding: '32px 40px', marginBottom: 28 }}>
              {mod.content_markdown ? (
                <article className="md-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {mod.content_markdown}
                  </ReactMarkdown>
                </article>
              ) : (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '24px 0' }}>
                  no content yet — check back later.
                </div>
              )}
            </div>

            {/* prev / next navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              {prevMod ? (
                <Link href={`/workshop/${params.name}/${prevMod.slug}`} className="btn" style={{ fontSize: 12 }}>
                  ← {prevMod.title}
                </Link>
              ) : (
                <Link href={`/workshop/${params.name}`} className="btn" style={{ fontSize: 12 }}>
                  ← back to track
                </Link>
              )}
              {nextMod ? (
                <Link href={`/workshop/${params.name}/${nextMod.slug}`} className="btn btn-primary" style={{ fontSize: 12 }}>
                  {nextMod.title} →
                </Link>
              ) : (
                <Link href={`/workshop/${params.name}`} className="btn" style={{ fontSize: 12, color: 'var(--accent)' }}>
                  track complete →
                </Link>
              )}
            </div>
          </>
        ) : (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>module not found.</div>
        )}
      </div>
    </>
  )
}
