'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import ActivityLog from '@/components/dashboard/ActivityLog'
import BlinkingCursor from '@/components/ui/BlinkingCursor'
import type { ActivityEntry } from '@/types'

interface ActivityPage {
  results: ActivityEntry[]
  next: string | null
  count: number
}

export default function ActivityPage() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<ActivityPage>({
      queryKey: ['activity'],
      queryFn: ({ pageParam }) =>
        api.get(`${endpoints.activity}?page=${pageParam}`).then(r => {
          const d = r.data
          if (Array.isArray(d)) return { results: d, next: null, count: d.length }
          return d
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => lastPage.next ? allPages.length + 1 : undefined,
    })

  const entries = data?.pages.flatMap(p => p.results) ?? []

  return (
    <>
      <Topbar crumb="activity" />
      <div style={{ padding: '32px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        <span className="eyebrow">// activity · commit log</span>
        <h1 style={{ fontSize: 36, marginTop: 8, marginBottom: 24 }}>
          your log<span style={{ color: 'var(--accent)' }}>/</span>
        </h1>

        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '76px 1fr auto', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--line-2)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span>hash</span><span>event</span><span>when</span>
          </div>

          {isError ? (
            <div style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--danger)' }}>
              error loading activity. try refreshing.
            </div>
          ) : isLoading ? (
            <div style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
              loading<BlinkingCursor />
            </div>
          ) : entries.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>
              no activity yet. solve a problem, start a module, open a pr.
            </div>
          ) : (
            <ActivityLog entries={entries} />
          )}
        </div>

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
      </div>
    </>
  )
}
