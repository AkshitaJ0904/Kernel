'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import Pill from '@/components/ui/Pill'
import BlinkingCursor from '@/components/ui/BlinkingCursor'
import type { Problem } from '@/types'
import Link from 'next/link'

export default function DailyPage() {
  const qc = useQueryClient()
  const { data: problems, isLoading } = useQuery<Problem[]>({
    queryKey: ['arena', 'daily'],
    queryFn: () => api.get(endpoints.arena.daily).then(r => r.data),
  })

  const today = new Date()
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <>
      <Topbar crumb="arena / daily" />
      <div style={{ padding: 32, maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        <span className="eyebrow">// arena · daily queue · {dateStr}</span>
        <h1 style={{ fontSize: 36, marginTop: 8, marginBottom: 8 }}>
          today&apos;s 5<span style={{ color: 'var(--accent)' }}>/</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 24, fontFamily: 'var(--font-mono)' }}>
          your personalised queue. refreshes at midnight ist.
        </p>

        {isLoading ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>loading<BlinkingCursor /></div>
        ) : (
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 80px 1fr 100px auto', gap: 14, padding: '10px 16px', borderBottom: '1px solid var(--line-2)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <span></span><span>pattern</span><span>title</span><span>difficulty</span><span></span>
            </div>
            {problems?.map((p, i) => {
              const done = p.user_status === 'solved'
              return (
                <Link key={p.id} href={`/arena/${p.slug}`} style={{ display: 'grid', gridTemplateColumns: 'auto 80px 1fr 100px auto', gap: 14, padding: '12px 16px', borderTop: '1px solid var(--line-1)', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, textDecoration: 'none', color: 'inherit' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', width: 16 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ color: 'var(--fg-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{p.pattern_slug}</span>
                  <span style={{ color: done ? 'var(--fg-3)' : 'var(--fg-1)', textDecoration: done ? 'line-through' : 'none' }}>{p.title}</span>
                  <Pill difficulty={p.difficulty} />
                  <span style={{ color: done ? 'var(--accent)' : 'var(--fg-4)' }}>{done ? '✓' : '→'}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
