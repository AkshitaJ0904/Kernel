'use client'

import type { HeatmapDay } from '@/types'

interface HeatmapProps {
  weeks: HeatmapDay[][]
  totalContributions?: number
}

function intensityClass(count: number): string {
  if (count === 0) return ''
  if (count === 1) return 'l1'
  if (count <= 3) return 'l2'
  if (count <= 6) return 'l3'
  return 'l4'
}

const cellStyle = (level: string): React.CSSProperties => {
  const base: React.CSSProperties = { width: 11, height: 11, borderRadius: 2, border: '1px solid var(--line-1)', background: 'var(--bg-1)', flexShrink: 0 }
  if (level === 'l1') return { ...base, background: 'rgba(57,255,122,0.18)', borderColor: 'rgba(57,255,122,0.2)' }
  if (level === 'l2') return { ...base, background: 'rgba(57,255,122,0.4)', borderColor: 'rgba(57,255,122,0.4)' }
  if (level === 'l3') return { ...base, background: 'rgba(57,255,122,0.7)', borderColor: 'rgba(57,255,122,0.5)' }
  if (level === 'l4') return { ...base, background: 'var(--accent)', borderColor: 'var(--accent)' }
  return base
}

export default function Heatmap({ weeks, totalContributions = 0 }: HeatmapProps) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 2 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {week.map((day, di) => {
              const level = intensityClass(day.count)
              return <div key={di} style={cellStyle(level)} title={`${day.date}: ${day.count}`} />
            })}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
        {['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].map(m => <span key={m}>{m}</span>)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
        <span>&#9633; = solved problem · merged pr · proposal draft · contest entry</span>
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <span>less</span>
          {['', 'l1', 'l2', 'l3', 'l4'].map((l, i) => <div key={i} style={{ ...cellStyle(l), width: 10, height: 10 }} />)}
          <span>more</span>
        </div>
      </div>
    </div>
  )
}
