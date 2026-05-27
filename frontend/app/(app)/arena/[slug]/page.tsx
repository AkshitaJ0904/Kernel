'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import Pill from '@/components/ui/Pill'
import type { ProblemDetail } from '@/types'

export default function ProblemPage({ params }: { params: { slug: string } }) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'solved' | 'attempted' | 'skipped'>('solved')
  const [submitted, setSubmitted] = useState(false)

  const { data: problem } = useQuery<ProblemDetail>({
    queryKey: ['problem', params.slug],
    queryFn: () => api.get(endpoints.arena.problem(params.slug)).then(r => r.data),
  })

  const submitMutation = useMutation({
    mutationFn: () => api.post(endpoints.arena.submit(params.slug), { status, time_taken_seconds: null }),
    onSuccess: () => setSubmitted(true),
  })

  return (
    <>
      <Topbar crumb={`arena / ${params.slug}`} />
      <div style={{ padding: 32, maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        {problem && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* left: problem */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>{problem.pattern?.name ?? problem.pattern_slug}</span>
                <Pill difficulty={problem.difficulty} />
              </div>
              <h1 style={{ fontSize: 28, marginBottom: 16 }}>{problem.title}</h1>
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', padding: 20 }}>
                <p style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{problem.description}</p>
                {problem.constraints && (
                  <div style={{ marginTop: 20 }}>
                    <span className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>constraints</span>
                    <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-2)', whiteSpace: 'pre-wrap' }}>{problem.constraints}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* right: editor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', overflow: 'hidden' }}>
                <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--line-2)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  solution.py
                </div>
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="# write your solution here"
                  style={{ width: '100%', minHeight: 320, background: 'var(--bg-1)', color: 'var(--fg-1)', fontFamily: 'var(--font-mono)', fontSize: 13, border: 0, outline: 'none', padding: 16, resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <select value={status} onChange={e => setStatus(e.target.value as typeof status)} className="input" style={{ width: 'auto', fontSize: 12 }}>
                  <option value="solved">solved</option>
                  <option value="attempted">attempted</option>
                  <option value="skipped">skipped</option>
                </select>
                <button className="btn btn-primary" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || submitted}>
                  {submitted ? '✓ recorded' : submitMutation.isPending ? 'submitting...' : '> submit'}
                </button>
              </div>
              {submitted && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>
                  recorded as {status}. streak updated.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
