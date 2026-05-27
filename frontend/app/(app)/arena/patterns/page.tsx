'use client'

import { useQuery } from '@tanstack/react-query'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import BlinkingCursor from '@/components/ui/BlinkingCursor'
import type { Pattern } from '@/types'
import Link from 'next/link'

export default function PatternsPage() {
  const { data: patterns, isLoading } = useQuery<Pattern[]>({
    queryKey: ['arena', 'patterns'],
    queryFn: () => api.get(endpoints.arena.patterns).then(r => r.data.results ?? r.data),
  })

  return (
    <>
      <Topbar crumb="arena / patterns" />
      <div style={{ padding: 32, maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        <span className="eyebrow">// arena · pattern library</span>
        <h1 style={{ fontSize: 36, marginTop: 8, marginBottom: 8 }}>
          patterns<span style={{ color: 'var(--accent)' }}>/</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--fg-2)', marginBottom: 32 }}>
          {patterns?.length ?? 24} pattern families. recognise the shape before you write the code.
        </p>

        {isLoading ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>loading<BlinkingCursor /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {(patterns ?? []).map((p, i) => (
              <Link
                key={p.name}
                href={`/arena?pattern__name=${p.name}`}
                className="card"
                style={{ display: 'block', textDecoration: 'none', padding: 20 }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 8 }}>
                  // {String(i + 1).padStart(2, '0')}
                </div>
                <h4 style={{ fontSize: 16, fontFamily: 'var(--font-mono)', marginBottom: 12 }}>{p.display_name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
                    {p.problem_count} problems
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-4)' }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
