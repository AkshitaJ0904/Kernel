'use client'

import { useQuery } from '@tanstack/react-query'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import Link from 'next/link'

interface Track {
  id: number; name: string; display_name: string; language: string
  description: string; module_count: number; completed_count: number
}

export default function WorkshopPage() {
  const { data: tracks } = useQuery<Track[]>({
    queryKey: ['workshop', 'tracks'],
    queryFn: () => api.get(endpoints.workshop.tracks).then(r => r.data.results ?? r.data),
  })

  return (
    <>
      <Topbar crumb="workshop" />
      <div style={{ padding: 32, maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        <span className="eyebrow">// workshop · language tracks</span>
        <h1 style={{ fontSize: 36, marginTop: 8, marginBottom: 8 }}>
          kernel<span style={{ color: 'var(--accent)' }}>/</span>dev
        </h1>
        <p style={{ fontSize: 15, color: 'var(--fg-2)', marginBottom: 32 }}>engineering as craft. pick a language. build something that breaks. then fix it.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {(tracks ?? []).map((t) => {
            const pct = t.module_count ? Math.round(t.completed_count / t.module_count * 100) : 0
            return (
              <Link key={t.id} href={`/workshop/${t.name}`} className="card" style={{ display: 'block', textDecoration: 'none', border: 0, borderLeft: pct > 0 ? '1px solid var(--accent)' : '1px solid var(--line-2)' }}>
                <span className="eyebrow">// {t.language}</span>
                <h3 style={{ fontSize: 24, margin: '8px 0 8px' }}>{t.display_name}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.5 }}>{t.description}</p>
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>{t.module_count} modules</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: pct > 0 ? 'var(--accent)' : 'var(--fg-3)' }}>{pct}%</span>
                </div>
                <div style={{ height: 3, background: 'var(--bg-1)', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
                  <div style={{ height: '100%', background: 'var(--accent)', width: `${pct}%` }} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
