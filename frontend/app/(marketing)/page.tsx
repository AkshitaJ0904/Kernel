import type { Program } from '@/types'
import Hero from '@/components/landing/Hero'
import Pillars from '@/components/landing/Pillars'
import Programs from '@/components/landing/Programs'
import Method from '@/components/landing/Method'
import SignalTerminal from '@/components/landing/SignalTerminal'
import Testimonials from '@/components/landing/Testimonials'
import BlinkingCursor from '@/components/ui/BlinkingCursor'
import Link from 'next/link'

export default async function LandingPage() {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  let stats: { contributors: number; prs_merged: number; stipends_earned: number } | undefined
  let programs: Program[] | undefined

  try {
    const [statsRes, progsRes] = await Promise.all([
      fetch(`${API}/api/v1/public/stats/`, { next: { revalidate: 300 } }),
      fetch(`${API}/api/v1/warroom/programs/`, { next: { revalidate: 300 } }),
    ])
    if (statsRes.ok) stats = await statsRes.json()
    if (progsRes.ok) {
      const d = await progsRes.json()
      programs = d.results ?? d
    }
  } catch {
    // fallback to component defaults on error
  }

  return (
    <>
      <Hero stats={stats} />
      <Pillars />
      <Programs programs={programs} />
      <Method />
      <SignalTerminal />
      <Testimonials />

      {/* CTA strip */}
      <section style={{
        background: 'var(--bg-0)',
        backgroundImage: 'linear-gradient(to right, rgba(57,255,122,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(57,255,122,0.05) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        padding: '96px 32px',
        borderBottom: '1px solid var(--line-2)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 64, lineHeight: 1, letterSpacing: '-0.02em' }}>
          start now<BlinkingCursor />
        </h2>
        <p style={{ fontSize: 16, color: 'var(--fg-2)', marginTop: 16 }}>
          open the terminal. type <code>kernel init</code>. ship something today.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
          <Link href="/auth/register" className="btn btn-primary" style={{ fontSize: 14, padding: '12px 18px' }}>&gt; start free</Link>
          <button className="btn" style={{ fontSize: 14, padding: '12px 18px' }}>talk to a mentor</button>
        </div>
      </section>
    </>
  )
}
