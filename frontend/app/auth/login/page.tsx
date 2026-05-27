'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('invalid credentials')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 24, marginBottom: 32 }}>
          kernel<span style={{ color: 'var(--accent)' }}>/</span>
        </div>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>sign in</h1>
        <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 32 }}>welcome back. continue where you left off.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="aarav@kernel.dev" required />
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--danger)' }}>{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? 'signing in...' : '> sign in'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 24, fontFamily: 'var(--font-mono)' }}>
          no account?{' '}
          <Link href="/auth/register" style={{ color: 'var(--accent)', border: 0 }}>register →</Link>
        </p>
      </div>
    </div>
  )
}
