import Link from 'next/link'
import type { Problem } from '@/types'
import Pill from '@/components/ui/Pill'

export default function ProblemQueue({ problems }: { problems: Problem[] }) {
  return (
    <div>
      {problems.map((p) => {
        const done = p.user_status === 'solved'
        return (
          <Link key={p.id} href={`/arena/${p.slug}`} style={{ display: 'grid', gridTemplateColumns: 'auto 80px 1fr 100px 80px auto', gap: 14, padding: '10px 16px', borderTop: '1px solid var(--line-1)', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
            className="queue-row"
          >
            <span style={{ width: 14, height: 14, border: done ? 0 : '1px solid var(--line-3)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, background: done ? 'var(--accent)' : 'transparent', color: done ? 'var(--bg-0)' : 'var(--accent)' }}>
              {done ? '✓' : ''}
            </span>
            <span style={{ color: 'var(--fg-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{p.pattern_slug}</span>
            <span style={{ color: done ? 'var(--fg-3)' : 'var(--fg-1)', fontSize: 13 }}>{p.title}</span>
            <Pill difficulty={p.difficulty} />
            <span style={{ color: 'var(--fg-3)', textAlign: 'right', fontSize: 11 }}>{p.attempt_count > 0 ? `${p.attempt_count}${p.attempt_count === 1 ? 'st' : p.attempt_count === 2 ? 'nd' : p.attempt_count === 3 ? 'rd' : 'th'} time` : 'new'}</span>
            <span style={{ color: done ? 'var(--fg-3)' : 'var(--fg-2)' }}>→</span>
          </Link>
        )
      })}
    </div>
  )
}
