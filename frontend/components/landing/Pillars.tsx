export default function Pillars() {
  const pillars = [
    {
      num: '// pillar_01 / arena',
      title: 'kernel', slash: '/', suffix: 'dsa',
      desc: 'Pattern-first DSA. Topic trees that teach recognition, not just solutions. Daily problems calibrated to your level.',
      features: ['2,800+ problems across 24 patterns', 'contest mode · weekly leaderboards', "streak tracking that doesn't punish breaks", 'spaced-repetition for solved problems'],
      stat: 'avg. user solves <b>11 problems / week</b> after 30 days',
    },
    {
      num: '// pillar_02 / workshop',
      title: 'kernel', slash: '/', suffix: 'dev',
      desc: 'Engineering as craft. Pick a language. Pick a system. Build something that breaks. Then fix it.',
      features: ['tracks: rust, go, c++, python, ts', 'systems: dbs, networks, distributed', '18 ship-it projects with code review', 'own your repo · own your portfolio'],
      stat: 'median first <b>real PR shipped</b> in 23 days',
    },
    {
      num: '// pillar_03 / war room',
      title: 'kernel', slash: '/', suffix: 'oss',
      desc: 'Open-source mission control. The unfair advantage your seniors had — written down.',
      features: ['6 programs · gsoc, c4gt, lfx, esoc, sob, outreachy', '312 orgs · filtered by your stack', 'proposal templates from accepted students', 'mentor-list, mailing-list, contributing-md guides'],
      stat: 'cohort \'25 acceptance rate: <b>34%</b> (vs. 22% global)',
    },
  ]

  return (
    <section style={{ padding: '96px 32px', borderBottom: '1px solid var(--line-2)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>// 02 · pillars</span>
        <h2 style={{ fontSize: 56, lineHeight: 1, letterSpacing: '-0.02em', margin: '16px 0 20px', maxWidth: 880 }}>
          three worlds<span style={{ color: 'var(--accent)' }}>/</span> one toolchain.
        </h2>
        <p style={{ fontSize: 17, color: 'var(--fg-2)', maxWidth: 640, lineHeight: 1.55 }}>
          DSA, engineering craft, and open-source prep are the same skill at different timescales. We treat them that way.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, marginTop: 56, borderTop: '1px solid var(--line-2)' }}>
          {pillars.map((p, i) => (
            <div key={p.num} style={{
              padding: '32px 32px 32px 0', paddingLeft: i === 0 ? 0 : 32,
              borderLeft: i === 0 ? 0 : '1px solid var(--line-2)',
              display: 'flex', flexDirection: 'column', minHeight: 420, position: 'relative',
            }}>
              <span style={{ position: 'absolute', top: 32, right: 0, fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--fg-3)' }}>→</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>{p.num}</span>
              <h3 style={{ fontSize: 32, margin: '12px 0 16px', lineHeight: 1.05 }}>
                {p.title}<span style={{ color: 'var(--accent)' }}>{p.slash}</span>{p.suffix}
              </h3>
              <p style={{ fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.55, maxWidth: 360 }}>{p.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-2)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent)' }}>→</span>{f}
                  </li>
                ))}
              </ul>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--line-1)' }}
                dangerouslySetInnerHTML={{ __html: p.stat }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
