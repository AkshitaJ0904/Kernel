import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-0)', padding: '64px 32px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 32, paddingBottom: 48, borderBottom: '1px solid var(--line-2)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 24 }}>
              kernel<span style={{ color: 'var(--accent)' }}>/</span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)', marginTop: 12 }}>compile yourself.</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)', marginTop: 24, maxWidth: 320 }}>
              built in bangalore by engineers who got into gsoc, c4gt, lfx — and remember which parts mattered.
            </p>
          </div>
          {[
            { title: '// pillars', links: [['arena (dsa)', '/arena'], ['workshop (dev)', '/workshop'], ['war room (oss)', '/warroom']] },
            { title: '// programs', links: [['gsoc', '#'], ['c4gt', '#'], ['lfx', '#'], ['esoc', '#'], ['sob', '#'], ['outreachy', '#']] },
            { title: '// company', links: [['about', '#'], ['changelog', '#'], ['blog', '#'], ['careers', '#']] },
            { title: '// connect', links: [['discord', '#'], ['github', '#'], ['twitter', '#'], ['contact', '#']] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h5 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, margin: '0 0 16px' }}>{title}</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-2)', border: 0 }}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          <span>© 2026 kernel labs · made in bangalore</span>
          <span style={{ color: 'var(--fg-5)', whiteSpace: 'nowrap', overflow: 'hidden' }}>// ─────────────────────────────────────────────────────────────────────────────────────</span>
          <span>v0.4.0 · build 9d12fa1</span>
        </div>
      </div>
    </footer>
  )
}
