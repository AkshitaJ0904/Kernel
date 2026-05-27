'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api, { endpoints } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', email: '', password: '', college: '', graduation_year: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post(endpoints.auth.register, { ...form, graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null })
      router.push('/auth/login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: Record<string, string[]> } })?.response?.data
      setError(msg ? Object.values(msg).flat().join(' · ') : 'registration failed')
    }
    setLoading(false)
  }

  const fields = [
    { key: 'username', label: 'username', type: 'text', placeholder: 'aarav.k' },
    { key: 'email', label: 'email', type: 'email', placeholder: 'aarav@kernel.dev' },
    { key: 'password', label: 'password', type: 'password', placeholder: '••••••••' },
    { key: 'college', label: 'college', type: 'text', placeholder: 'iit bombay' },
    { key: 'graduation_year', label: 'graduation year', type: 'number', placeholder: '2027' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 24, marginBottom: 32 }}>
          kernel<span style={{ color: 'var(--accent)' }}>/</span>
        </div>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>get started</h1>
        <p style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 32 }}>compile yourself. takes 30 seconds.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>{label}</label>
              <input className="input" type={type} value={form[key as keyof typeof form]} onChange={set(key)} placeholder={placeholder} required={key !== 'college' && key !== 'graduation_year'} />
            </div>
          ))}
          {error && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--danger)' }}>{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? 'registering...' : '> create account'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 24, fontFamily: 'var(--font-mono)' }}>
          have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--accent)', border: 0 }}>sign in →</Link>
        </p>
      </div>
    </div>
  )
}
