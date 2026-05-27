'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import Roadmap from '@/components/dashboard/Roadmap'
import { mapRoadmapSteps } from '@/lib/utils'
import type { Program, Pattern, DashboardData, RoadmapStep } from '@/types'

export default function RoadmapPage() {
  const qc = useQueryClient()
  const dash = qc.getQueryData<DashboardData>(['dashboard'])
  const coverage = dash?.pattern_coverage ?? []

  const { data: programs } = useQuery<Program[]>({
    queryKey: ['warroom', 'programs'],
    queryFn: () => api.get(endpoints.warroom.programs).then(r => r.data.results ?? r.data),
  })

  const { data: roadmapData } = useQuery<{ steps: { id: number; label: string; done: boolean }[] }>({
    queryKey: ['warroom', 'roadmap'],
    queryFn: () => api.get(endpoints.warroom.roadmap).then(r => r.data),
  })

  const { data: patterns } = useQuery<Pattern[]>({
    queryKey: ['arena', 'patterns'],
    queryFn: () => api.get(endpoints.arena.patterns).then(r => r.data.results ?? r.data),
    enabled: coverage.length === 0,
  })

  const nextDeadline = programs?.find(p => p.time_remaining_human && !p.time_remaining_human.startsWith('closed'))
  const roadmapSteps = mapRoadmapSteps(roadmapData?.steps ?? [])

  const dsaSteps: RoadmapStep[] = coverage.length > 0
    ? coverage.slice(0, 4).map((p, i) => ({
        num: String(i + 1).padStart(2, '0'),
        name: `complete ${p.name.toLowerCase()}`,
        sub: `${p.solved} / ${p.total} problems solved`,
        pct: p.pct,
        status: (p.pct === 100 ? 'done' : p.pct > 0 ? 'active' : 'todo') as RoadmapStep['status'],
      }))
    : (patterns ?? []).slice(0, 4).map((p, i) => ({
        num: String(i + 1).padStart(2, '0'),
        name: `complete ${p.display_name.toLowerCase()}`,
        sub: `0 / ${p.problem_count} problems`,
        pct: 0,
        status: 'todo' as const,
      }))

  return (
    <>
      <Topbar crumb="roadmap" />
      <div style={{ padding: '32px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        <span className="eyebrow">// roadmap · gsoc-2026 prep</span>
        <h1 style={{ fontSize: 36, marginTop: 8, marginBottom: 4 }}>
          your roadmap<span style={{ color: 'var(--accent)' }}>/</span>
        </h1>
        {nextDeadline && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--warn)', marginBottom: 32 }}>
            nearest deadline · {nextDeadline.display_name} · {nextDeadline.time_remaining_human}
          </p>
        )}

        <div style={{ maxWidth: 760 }}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', padding: 24, marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16 }}>// gsoc 2026 · primary path</div>
            <Roadmap steps={roadmapSteps} />
          </div>

          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16 }}>// dsa foundation · parallel track</div>
            <Roadmap steps={dsaSteps} />
          </div>
        </div>
      </div>
    </>
  )
}
