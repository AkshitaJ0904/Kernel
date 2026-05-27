'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import api, { endpoints } from '@/lib/api'
import { mapRoadmapSteps } from '@/lib/utils'
import Topbar from '@/components/layout/Topbar'
import StatStrip from '@/components/dashboard/StatStrip'
import Roadmap from '@/components/dashboard/Roadmap'
import Heatmap from '@/components/dashboard/Heatmap'
import ProblemQueue from '@/components/dashboard/ProblemQueue'
import PatternCoverageGrid from '@/components/dashboard/PatternCoverage'
import ActivityLog from '@/components/dashboard/ActivityLog'
import ProgramsTracker from '@/components/dashboard/ProgramsTracker'
import ContestTicker from '@/components/dashboard/ContestTicker'
import Notifications from '@/components/dashboard/Notifications'
import BlinkingCursor from '@/components/ui/BlinkingCursor'
import type { DashboardData } from '@/types'

function Panel({ title, meta, children, metaAction }: { title: React.ReactNode; meta?: React.ReactNode; children: React.ReactNode; metaAction?: string }) {
  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 20px', borderBottom: '1px solid var(--line-2)' }}>
        <h3 style={{ fontSize: 16 }}>{title}</h3>
        {meta && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>{meta}</span>}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  )
}

export default function DashboardPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get(endpoints.dashboard).then(r => r.data),
  })
  const { data: roadmapData } = useQuery<{ steps: { id: number; label: string; done: boolean }[] }>({
    queryKey: ['warroom', 'roadmap'],
    queryFn: () => api.get(endpoints.warroom.roadmap).then(r => r.data),
  })
  const roadmapSteps = mapRoadmapSteps(roadmapData?.steps ?? [])

  const now = new Date()
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dateStr = `// ${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} · ${days[now.getDay()]} · ist ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

  const username = data?.user?.username ?? 'aarav'
  const stats = data?.stats

  const closestProgram = (data?.tracked_programs ?? [])
    .filter(p => p.deadline_closes_at != null)
    .sort((a, b) => new Date(a.deadline_closes_at!).getTime() - new Date(b.deadline_closes_at!).getTime())[0] ?? null

  const countdownStat = closestProgram
    ? { label: closestProgram.display_name, value: closestProgram.time_remaining_human, delta: 'next deadline', warn: true }
    : { label: 'track a program', value: '—', delta: 'no deadlines', warn: true }

  const totalContributions = data?.heatmap?.weeks?.flat().reduce((sum, d) => sum + d.count, 0) ?? 0
  const lastSeenText = stats?.streak_current ? 'today' : 'last seen 16h ago'

  const statStrip = stats ? [
    { label: 'problems solved', value: stats.problems_solved, delta: '+11 this week', accent: true },
    { label: 'streak', value: `${stats.streak_current}d`, delta: `longest ${stats.streak_longest}d` },
    { label: 'prs merged', value: stats.prs_merged, delta: '+1 this week' },
    countdownStat,
  ] : [
    { label: 'problems solved', value: '342', delta: '+11 this week', accent: true },
    { label: 'streak', value: '12d', delta: 'longest 31d' },
    { label: 'prs merged', value: '3', delta: '+1 this week' },
    countdownStat,
  ]

  return (
    <>
      <Topbar crumb="dashboard" streakDays={stats?.streak_current ?? 12} unreadCount={stats?.unread_notifications ?? 3} />
      <div style={{ padding: '32px 32px 64px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        {/* greeting */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <span className="eyebrow">{dateStr}</span>
            <h1 style={{ fontSize: 36, letterSpacing: '-0.01em', marginTop: 8 }}>
              welcome back<span style={{ color: 'var(--accent)' }}>/</span> {username}<BlinkingCursor />
            </h1>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
            {lastSeenText} · {stats?.unread_notifications ?? 3} unread · 2 deadlines this week
          </span>
        </div>

        <StatStrip stats={statStrip} />

        {/* main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, marginTop: 24 }}>
          {/* left col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Panel title={<>your roadmap <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, color: 'var(--fg-3)', fontSize: 13 }}>// gsoc-2026 prep</span></>} meta="view full">
              <Roadmap steps={roadmapSteps} />
            </Panel>

            <Panel title="your year, in commits" meta={`${isLoading ? '—' : totalContributions} contributions · ${stats?.streak_longest ?? '—'}d longest`}>
              {data?.heatmap ? (
                <Heatmap weeks={data.heatmap.weeks} />
              ) : (
                <div style={{ height: 100, display: 'flex', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
                  loading<BlinkingCursor />
                </div>
              )}
            </Panel>

            {/* 2-col row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 20px', borderBottom: '1px solid var(--line-2)' }}>
                  <h3 style={{ fontSize: 16 }}>today&apos;s queue</h3>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', cursor: 'pointer' }}>shuffle</span>
                </div>
                {data?.daily_queue ? (
                  <ProblemQueue problems={data.daily_queue} />
                ) : (
                  <div style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>loading<BlinkingCursor /></div>
                )}
              </div>
              <Panel title="pattern coverage" meta={`${data?.pattern_coverage?.filter(p => p.pct > 0).length ?? 15} / 24`}>
                {data?.pattern_coverage ? (
                  <PatternCoverageGrid patterns={data.pattern_coverage} />
                ) : (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>loading<BlinkingCursor /></div>
                )}
              </Panel>
            </div>

            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 20px', borderBottom: '1px solid var(--line-2)' }}>
                <h3 style={{ fontSize: 16 }}>recent activity</h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', cursor: 'pointer' }}>view all</span>
              </div>
              {data?.recent_activity ? (
                <ActivityLog entries={data.recent_activity} />
              ) : (
                <div style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>loading<BlinkingCursor /></div>
              )}
            </div>
          </div>

          {/* right col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 20px', borderBottom: '1px solid var(--line-2)' }}>
                <h3 style={{ fontSize: 16 }}>tracking · {data?.tracked_programs?.length ?? 3} programs</h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', cursor: 'pointer' }}>+ add</span>
              </div>
              <div style={{ padding: 20 }}>
                {data?.tracked_programs ? (
                  <ProgramsTracker programs={data.tracked_programs} />
                ) : (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>loading<BlinkingCursor /></div>
                )}
              </div>
            </div>

            <Panel title="upcoming contests" meta="schedule">
              {data?.contests ? (
                <ContestTicker contests={data.contests} />
              ) : (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>loading<BlinkingCursor /></div>
              )}
            </Panel>

            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 20px', borderBottom: '1px solid var(--line-2)' }}>
                <h3 style={{ fontSize: 16 }}>notifications</h3>
                <span
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', cursor: 'pointer' }}
                  onClick={() => api.post(endpoints.notificationsReadAll, {}).then(() => qc.invalidateQueries({ queryKey: ['dashboard'] }))}
                >mark all read</span>
              </div>
              {data?.notifications ? (
                <Notifications notifications={data.notifications} />
              ) : (
                <div style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>loading<BlinkingCursor /></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
