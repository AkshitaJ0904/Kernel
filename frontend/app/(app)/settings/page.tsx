'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { signOut } from 'next-auth/react'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import type { User } from '@/types'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const qc = useQueryClient()
  const { data: me, isLoading } = useQuery<User>({
    queryKey: ['me'],
    queryFn: () => api.get(endpoints.auth.me).then(r => r.data),
  })

  const [college, setCollege] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [github, setGithub] = useState('')
  const [bio, setBio] = useState('')
  const [weekdayOnly, setWeekdayOnly] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (me) {
      setCollege(me.college ?? '')
      setGradYear(me.graduation_year?.toString() ?? '')
      setGithub(me.github_username ?? '')
      setBio(me.bio ?? '')
      setWeekdayOnly(me.profile.weekday_only_streak)
    }
  }, [me])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      await api.patch(endpoints.auth.me, {
        college,
        graduation_year: gradYear.trim() ? parseInt(gradYear, 10) : null,
        github_username: github,
        bio,
      })
      await qc.invalidateQueries({ queryKey: ['me'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('save failed — check your connection and try again')
    } finally {
      setSaving(false)
    }
  }

  async function handleStreakToggle(val: boolean) {
    setWeekdayOnly(val)
    try {
      await api.patch(endpoints.auth.me, { weekday_only_streak: val })
      qc.invalidateQueries({ queryKey: ['me'] })
    } catch {
      setWeekdayOnly(!val)
    }
  }

  return (
    <>
      <Topbar crumb="settings" />
      <div style={{ padding: 32, maxWidth: 560, margin: '0 auto' }}>
        <span className="eyebrow">// settings</span>
        <h1 style={{ fontSize: 28, marginTop: 8, marginBottom: 32 }}>
          settings<span style={{ color: 'var(--accent)' }}>/</span>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* profile */}
          <div style={{ padding: 20, background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)' }}>
            <h4 style={{ fontSize: 16, marginBottom: 20 }}>account</h4>
            {isLoading ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>loading...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="college">
                  <input className="input" value={college} onChange={e => setCollege(e.target.value)} placeholder="iit bombay" />
                </Field>
                <Field label="graduation year">
                  <input className="input" type="number" value={gradYear} onChange={e => setGradYear(e.target.value)} placeholder="2027" min={2020} max={2035} />
                </Field>
                <Field label="github username">
                  <input className="input" value={github} onChange={e => setGithub(e.target.value)} placeholder="your-handle" />
                </Field>
                <Field label="bio">
                  <textarea className="input" value={bio} onChange={e => setBio(e.target.value)} placeholder="building in public..." style={{ minHeight: 72, resize: 'vertical' }} />
                </Field>
                {error && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--danger)' }}>{error}</div>
                )}
                <button
                  className={`btn${!saved ? ' btn-primary' : ''}`}
                  style={{ fontSize: 12, alignSelf: 'flex-start' }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'saving...' : saved ? 'saved ✓' : '> save changes'}
                </button>
              </div>
            )}
          </div>

          {/* streak preferences */}
          <div style={{ padding: 20, background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)' }}>
            <h4 style={{ fontSize: 16, marginBottom: 8 }}>streak preferences</h4>
            <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 16, lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
              weekday-only mode skips saturday and sunday — streak never resets over the weekend.
            </p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-2)', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={weekdayOnly}
                onChange={e => handleStreakToggle(e.target.checked)}
                style={{ accentColor: 'var(--accent)', width: 14, height: 14, cursor: 'pointer' }}
              />
              weekday-only streak mode
              <span style={{ marginLeft: 4, fontSize: 11, color: weekdayOnly ? 'var(--accent)' : 'var(--fg-4)' }}>
                [{weekdayOnly ? 'on' : 'off'}]
              </span>
            </label>
          </div>

          {/* danger zone */}
          <div style={{ padding: 20, background: 'var(--bg-2)', border: '1px solid var(--danger-glow)', borderRadius: 'var(--r-4)' }}>
            <h4 style={{ fontSize: 16, marginBottom: 8, color: 'var(--danger)' }}>danger zone</h4>
            <button className="btn" style={{ fontSize: 12 }} onClick={() => signOut({ callbackUrl: '/' })}>
              sign out →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
