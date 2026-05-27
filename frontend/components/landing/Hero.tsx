import Link from 'next/link'
import BlinkingCursor from '@/components/ui/BlinkingCursor'

interface HeroProps {
  stats?: { contributors: number; prs_merged: number; stipends_earned: number }
}

export default function Hero({ stats }: HeroProps) {
  return (
    <section style={{
      background: 'var(--bg-0)',
      backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
      borderBottom: '1px solid var(--line-2)',
      padding: '120px 32px 96px',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
          // for cs undergrads in india · gsoc cohort &apos;26 in prep
        </span>
        <h1 style={{ fontSize: 96, lineHeight: 0.95, letterSpacing: '-0.02em', margin: '24px 0 0', maxWidth: 1100 }}>
          compile<br/>yourself<span style={{ color: 'var(--accent)' }}>.</span><BlinkingCursor />
        </h1>
        <p style={{ fontSize: 20, color: 'var(--fg-2)', marginTop: 32, maxWidth: 720, lineHeight: 1.5 }}>
          DSA practice, language tracks, and open-source program prep — under one toolchain. Built by engineers who got into{' '}
          <b style={{ color: 'var(--fg-1)', fontWeight: 500 }}>GSoC, C4GT, LFX, ESoC</b>{' '}
          and remember which parts of the journey actually moved the needle.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 40, alignItems: 'center' }}>
          <Link href="/auth/register" className="btn btn-primary" style={{ fontSize: 14, padding: '12px 18px' }}>&gt; start free</Link>
          <Link href="/warroom" className="btn" style={{ fontSize: 14, padding: '12px 18px' }}>browse programs</Link>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', marginLeft: 12 }}>no credit card. takes 30s.</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 80, borderTop: '1px solid var(--line-2)' }}>
          {[
            { v: stats?.contributors?.toLocaleString() ?? '1,247', l: 'contributors', accent: true },
            { v: stats?.prs_merged?.toLocaleString() ?? '312', l: 'prs merged' },
            { v: stats?.stipends_earned?.toLocaleString() ?? '84', l: 'stipends earned' },
            { v: '$0.48m', l: "paid out '25" },
          ].map(({ v, l, accent }, i) => (
            <div key={l} style={{ padding: '28px 0', borderLeft: i === 0 ? 0 : '1px solid var(--line-2)', paddingLeft: i === 0 ? 0 : 24 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: accent ? 'var(--accent)' : 'var(--fg-1)' }}>{v}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
