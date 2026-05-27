'use client'

import { useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import Pill from '@/components/ui/Pill'
import type { Problem, Pattern } from '@/types'
import Link from 'next/link'

interface ProblemPage {
  results: Problem[]
  next: string | null
  count: number
}

export default function ArenaPage() {
  const searchParams = useSearchParams()
  const [difficulty, setDifficulty] = useState<string>(searchParams.get('difficulty') ?? '')
  const [pattern, setPattern] = useState<string>(searchParams.get('pattern__name') ?? '')

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<ProblemPage>({
    queryKey: ['arena', 'problems', { difficulty, pattern }],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams()
      if (difficulty) params.set('difficulty', difficulty)
      if (pattern) params.set('pattern__name', pattern)
      params.set('page', String(pageParam))
      return api.get(`${endpoints.arena.problems}?${params}`).then(r => {
        const d = r.data
        if (Array.isArray(d)) return { results: d, next: null, count: d.length }
        return d
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => lastPage.next ? allPages.length + 1 : undefined,
  })

  const { data: patterns } = useQuery<Pattern[]>({
    queryKey: ['arena', 'patterns'],
    queryFn: () => api.get(endpoints.arena.patterns).then(r => r.data.results ?? r.data),
  })

  const problems = data?.pages.flatMap(p => p.results) ?? []

  return (
    <>
      <Topbar crumb="arena" />
      <div style={{ padding: '32px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        <span className="eyebrow">// arena · problem set</span>
        <h1 style={{ fontSize: 36, marginTop: 8, marginBottom: 24 }}>
          problems<span style={{ color: 'var(--accent)' }}>/</span>
        </h1>

        {/* filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {(['', 'easy', 'medium', 'hard'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`btn ${difficulty === d ? 'btn-primary' : ''}`}
              style={{ padding: '4px 12px', fontSize: 12 }}
            >
              {d || 'all'}
            </button>
          ))}
          <select
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            className="input"
            style={{ width: 'auto', fontSize: 12, padding: '4px 12px' }}
          >
            <option value="">all patterns</option>
            {patterns?.map(p => (
              <option key={p.name} value={p.name}>{p.display_name}</option>
            ))}
          </select>
        </div>

        {/* problem list */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 80px 1fr 100px 80px auto', gap: 14, padding: '10px 16px', borderBottom: '1px solid var(--line-2)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span></span><span>pattern</span><span>title</span><span>difficulty</span><span>attempts</span><span></span>
          </div>

          {isError ? (
            <div style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--danger)' }}>
              error loading problems. try refreshing.
            </div>
          ) : isLoading ? (
            <div style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
              loading problems...
            </div>
          ) : problems.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>
              no problems match your filters.
            </div>
          ) : (
            problems.map(p => {
              const done = p.user_status === 'solved'
              return (
                <Link
                  key={p.id}
                  href={`/arena/${p.slug}`}
                  style={{ display: 'grid', gridTemplateColumns: 'auto 80px 1fr 100px 80px auto', gap: 14, padding: '10px 16px', borderTop: '1px solid var(--line-1)', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, textDecoration: 'none', color: 'inherit' }}
                >
                  <span style={{ width: 14, height: 14, border: done ? 0 : '1px solid var(--line-3)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, background: done ? 'var(--accent)' : 'transparent', color: done ? 'var(--bg-0)' : 'var(--fg-4)' }}>
                    {done ? '✓' : ''}
                  </span>
                  <span style={{ color: 'var(--fg-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{p.pattern_slug}</span>
                  <span style={{ color: done ? 'var(--fg-3)' : 'var(--fg-1)' }}>{p.title}</span>
                  <Pill difficulty={p.difficulty} />
                  <span style={{ color: 'var(--fg-3)', textAlign: 'right', fontSize: 11 }}>{p.attempt_count || '—'}</span>
                  <span style={{ color: 'var(--fg-4)' }}>→</span>
                </Link>
              )
            })
          )}
        </div>

        {/* pagination */}
        {hasNextPage && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={() => fetchNextPage()}
              className="btn"
              style={{ fontSize: 12 }}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'loading…' : 'load more'}
            </button>
          </div>
        )}
        {!isLoading && !hasNextPage && problems.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)' }}>
            {problems.length} problems
          </div>
        )}
      </div>
    </>
  )
}
