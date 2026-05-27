const testimonials = [
  {
    quote: '"I\'d grinded leetcode for 2 years and still couldn\'t write a real PR. kernel/ made me read source code. the proposal templates were the unlock — apache accepted me on the third try."',
    initials: 'AK', name: 'aarav kulkarni', meta: '@aaravk · iit bombay · gsoc \'25 · apache',
  },
  {
    quote: '"the roadmap told me to ship before applying. I had three open PRs to beckn before I even submitted. got picked. stipend funded my last semester."',
    initials: 'PS', name: 'priya s.', meta: '@priyas · nit trichy · c4gt \'25 · beckn',
  },
  {
    quote: '"DSA grind without contest mode is just busywork. the streak counter, the contest leaderboard, and friends shipping in the same channel — that\'s the difference."',
    initials: 'RM', name: 'rohit m.', meta: '@rohitm · iiit hyderabad · ms goldman \'26',
  },
]

export default function Testimonials() {
  return (
    <section style={{ padding: '96px 32px', borderBottom: '1px solid var(--line-2)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>// 06 · alumni</span>
        <h2 style={{ fontSize: 56, lineHeight: 1, letterSpacing: '-0.02em', margin: '16px 0 0', maxWidth: 880 }}>
          hear it from<span style={{ color: 'var(--accent)' }}>/</span> the cohort.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 56 }}>
          {testimonials.map(({ quote, initials, name, meta }) => (
            <div key={name} style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', padding: 24, display: 'flex', flexDirection: 'column', minHeight: 240 }}>
              <p style={{ fontSize: 16, color: 'var(--fg-1)', lineHeight: 1.5, flex: 1 }}>{quote}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line-1)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--line-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-1)' }}>{name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>{meta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
