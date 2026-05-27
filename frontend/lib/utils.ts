import { formatDistanceToNow, parseISO } from 'date-fns'
import type { RoadmapStep, RoadmapStepRaw } from '@/types'

export function timeAgo(isoString: string): string {
  return formatDistanceToNow(parseISO(isoString), { addSuffix: false })
    .replace('about ', '')
    .replace(' minutes', 'm')
    .replace(' minute', 'm')
    .replace(' hours', 'h')
    .replace(' hour', 'h')
    .replace(' days', 'd')
    .replace(' day', 'd')
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

const ROADMAP_SUBS: Record<number, string> = {
  1: 'select orgs to track from war room',
  2: 'merged pr to a target organization',
  3: 'draft project proposal in war room',
  4: 'mentor has reviewed your proposal',
  5: 'submitted on program portal',
}

export function mapRoadmapSteps(raw: RoadmapStepRaw[]): RoadmapStep[] {
  const firstActive = raw.find(s => !s.done)
  return raw.map(s => ({
    num: String(s.id).padStart(2, '0'),
    name: s.label.toLowerCase(),
    sub: ROADMAP_SUBS[s.id] ?? s.label.toLowerCase(),
    pct: s.done ? 100 : 0,
    status: (s.done ? 'done' : s.id === firstActive?.id ? 'active' : 'todo') as RoadmapStep['status'],
  }))
}

export function difficultyColor(diff: string): string {
  if (diff === 'easy') return 'var(--diff-easy)'
  if (diff === 'medium') return 'var(--diff-med)'
  return 'var(--diff-hard)'
}
