const steps = [
  { n: '01', title: 'read the source', body: 'pick three orgs. read their CONTRIBUTING.md. lurk on the dev mailing list. get a feel for the codebase shape.' },
  { n: '02', title: 'ship one tiny pr', body: "a typo fix counts. the point: prove you can land code in their tree. we'll surface their good-first-issues for you." },
  { n: '03', title: 'draft the proposal', body: 'use templates from accepted students. cut your scope by 40%. run it past a mentor before submitting.' },
  { n: '04', title: 'iterate publicly', body: 'stay active during selection. comment on PRs. reply on the mailing list. the org is watching.' },
]

export default function Method() {
  return (
    <section style={{ padding: '96px 32px', borderBottom: '1px solid var(--line-2)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>// 04 · the method</span>
        <h2 style={{ fontSize: 56, lineHeight: 1, letterSpacing: '-0.02em', margin: '16px 0 20px', maxWidth: 880 }}>
          read<span style={{ color: 'var(--accent)' }}>/</span> ship<span style={{ color: 'var(--accent)' }}>/</span> propose<span style={{ color: 'var(--accent)' }}>/</span> repeat.
        </h2>
        <p style={{ fontSize: 17, color: 'var(--fg-2)', maxWidth: 640, lineHeight: 1.55 }}>
          selection isn&apos;t a lottery. it&apos;s a four-step protocol with a known success rate. run the loop.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginTop: 56, borderTop: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)' }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ padding: '32px 24px 32px 32px', borderLeft: i === 0 ? 0 : '1px solid var(--line-2)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 56, lineHeight: 1, color: 'var(--fg-5)', fontWeight: 700, letterSpacing: '-0.02em' }}>{s.n}</div>
              <h4 style={{ fontSize: 18, margin: '16px 0 10px' }}>{s.title}</h4>
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
