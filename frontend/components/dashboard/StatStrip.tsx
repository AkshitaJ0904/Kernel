interface Stat {
  label: string
  value: string | number
  delta?: string
  accent?: boolean
  warn?: boolean
}

export default function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 1, background: 'var(--line-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', overflow: 'hidden' }}>
      {stats.map(({ label, value, delta, accent, warn }) => (
        <div key={label} style={{ background: 'var(--bg-2)', padding: '16px 20px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{label}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.01em', marginTop: 6, color: accent ? 'var(--accent)' : warn ? 'var(--warn)' : 'var(--fg-1)' }}>
            {value}
          </div>
          {delta && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: warn ? 'var(--warn)' : 'var(--accent)', marginTop: 4 }}>{delta}</div>
          )}
        </div>
      ))}
    </div>
  )
}
