export interface UserProfile {
  streak_current: number
  streak_longest: number
  streak_last_active: string | null
  total_solved: number
  total_prs_merged: number
  total_proposals_submitted: number
  weekday_only_streak: boolean
}

export interface User {
  id: number
  username: string
  email: string
  college: string
  graduation_year: number | null
  github_username: string
  bio: string
  avatar: string | null
  created_at: string
  profile: UserProfile
}

export interface Pattern {
  name: string
  display_name: string
  order: number
  problem_count: number
}

export interface Problem {
  id: number
  title: string
  slug: string
  difficulty: 'easy' | 'medium' | 'hard'
  pattern_name: string
  pattern_slug: string
  user_status: 'solved' | 'attempted' | 'skipped' | null
  attempt_count: number
}

export interface ProblemDetail extends Problem {
  pattern: Pattern
  description: string
  constraints: string
  examples: { input: string; output: string; explanation?: string }[]
}

export interface Contest {
  id: number
  name: string
  slug: string
  platform: 'leetcode' | 'codeforces' | 'internal'
  starts_at: string
  ends_at: string
  duration_minutes: number
  problem_count: number
  time_remaining_human: string
  is_joined: boolean
}

export interface Program {
  id: number
  name: string
  display_name: string
  stipend_display: string
  stipend_min_usd: number | null
  stipend_max_usd: number | null
  stipend_inr: number | null
  currency: 'USD' | 'INR'
  description: string
  website_url: string
  deadline_opens_at: string | null
  deadline_closes_at: string | null
  slots_count: number | null
  acceptance_rate: number | null
  is_active: boolean
  color: 'accent' | 'warn' | 'muted'
  time_remaining_human: string
  is_tracked: boolean
  org_count: number
}

export interface ActivityEntry {
  id: number
  type: string
  title: string
  metadata: Record<string, unknown>
  git_hash: string
  created_at: string
}

export interface Notification {
  id: number
  type: 'info' | 'warn' | 'unread'
  title: string
  body: string
  read: boolean
  created_at: string
}

export interface Org {
  id: number
  name: string
  display_name: string
  program_name: string
  website_url: string
  repo_url: string
  stack_tags: string[]
  description: string
  is_tracked: boolean
}

export interface Proposal {
  id: number
  program: number
  program_name: string
  org: number | null
  org_display_name: string | null
  title: string
  content: string
  status: 'draft' | 'submitted' | 'accepted' | 'rejected'
  version: number
  mentor_feedback: string
  created_at: string
  updated_at: string
}

export interface RoadmapStepRaw {
  id: number
  label: string
  done: boolean
}

export interface RoadmapStep {
  num: string
  name: string
  sub: string
  pct: number
  status: 'done' | 'active' | 'todo'
}

export interface HeatmapDay {
  date: string
  count: number
}

export interface PatternCoverage {
  name: string
  solved: number
  total: number
  pct: number
}

export interface DashboardData {
  user: User
  stats: {
    problems_solved: number
    streak_current: number
    streak_longest: number
    prs_merged: number
    proposals_submitted: number
    unread_notifications: number
  }
  public_stats: {
    contributors: number
    prs_merged: number
    stipends_earned: number
  }
  daily_queue: Problem[]
  contests: Contest[]
  tracked_programs: Program[]
  notifications: Notification[]
  heatmap: { year: number; weeks: HeatmapDay[][] }
  pattern_coverage: PatternCoverage[]
  recent_activity: ActivityEntry[]
}
