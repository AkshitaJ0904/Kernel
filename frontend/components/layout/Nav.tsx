'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Nav() {
  const { data: session } = useSession()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: 'var(--bg-0)',
      borderBottom: '1px solid var(--line-2)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 32 }}>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em', color: 'var(--fg-1)', border: 0 }}>
          kernel<span style={{ color: 'var(--accent)' }}>/</span>
        </Link>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', border: '1px solid var(--line-2)', padding: '4px 10px', borderRadius: 'var(--r-2)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', display: 'inline-block' }} />
          v0.4 · 1,247 online
        </span>
        <div style={{ display: 'flex', gap: 4, marginLeft: 24 }}>
          {['arena', 'workshop', 'war room', 'contributors', 'changelog'].map((link) => (
            <Link key={link} href={link === 'arena' ? '/arena' : link === 'workshop' ? '/workshop' : link === 'war room' ? '/warroom' : '#'}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-2)', padding: '6px 12px', borderRadius: 'var(--r-4)', border: 0 }}
              className="nav-link"
            >
              {link}
            </Link>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          {session ? (
            <>
              <Link href="/dashboard" className="btn">dashboard</Link>
              <button className="btn btn-ghost" onClick={() => signOut()}>sign out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-ghost" style={{ border: 0 }}>sign in</Link>
              <Link href="/auth/register" className="btn btn-primary">&gt; start free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
