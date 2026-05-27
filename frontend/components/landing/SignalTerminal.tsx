import Link from 'next/link'
import BlinkingCursor from '@/components/ui/BlinkingCursor'

export default function SignalTerminal() {
  return (
    <section style={{ padding: '96px 32px', borderBottom: '1px solid var(--line-2)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>// 05 · signal</span>
        <h2 style={{ fontSize: 56, lineHeight: 1, letterSpacing: '-0.02em', margin: '16px 0 0', maxWidth: 880 }}>
          your year<span style={{ color: 'var(--accent)' }}>/</span> in commits.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', marginTop: 56 }}>
          <div>
            <h3 style={{ fontSize: 36, lineHeight: 1.05 }}>track everything<span style={{ color: 'var(--accent)' }}>/</span> show the work.</h3>
            <p style={{ fontSize: 15, color: 'var(--fg-2)', marginTop: 16, lineHeight: 1.55 }}>
              every solved problem, every PR, every proposal draft is a line in your commit log. profile pages are reverse-chronological — recruiters and mentors see what you&apos;ve shipped, not what you claim.
            </p>
            <p style={{ fontSize: 15, color: 'var(--fg-2)', marginTop: 12, lineHeight: 1.55 }}>
              streaks count weekdays. breaks don&apos;t punish. quality &gt; quantity.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <Link href="/auth/register" className="btn btn-primary">&gt; see a profile</Link>
              <button className="btn">read the methodology</button>
            </div>
          </div>
          <div style={{ background: '#050608', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', padding: '18px 22px', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6 }}>
            <div><span style={{ color: 'var(--accent)' }}>$</span> git log --oneline --author=aarav.k --since=1.week</div>
            {[
              { hash: 'a3f1c2e', msg: 'solved · arrays/two-pointer/3sum' },
              { hash: 'b8e2440', msg: 'started · rust/04-lifetimes' },
              { hash: '9d12fa1', msg: 'opened pr · apache/airflow#41281' },
              { hash: 'e0b7c3a', msg: 'draft · gsoc proposal — apache nuttx' },
              { hash: 'c45a190', msg: 'streak +1 · 12 days' },
              { hash: 'f117b0b', msg: 'solved · graphs/topo/course-schedule-ii' },
              { hash: '42aabbc', msg: 'contest · weekly #420 · rank 184/12k' },
            ].map(({ hash, msg }) => (
              <div key={hash} style={{ color: 'var(--fg-2)' }}>
                <span style={{ color: 'var(--accent)' }}>{hash}</span> {msg}
              </div>
            ))}
            <div style={{ color: 'var(--fg-4)' }}>─ 7 commits · 12d streak · 31d longest <BlinkingCursor /></div>
          </div>
        </div>
      </div>
    </section>
  )
}
