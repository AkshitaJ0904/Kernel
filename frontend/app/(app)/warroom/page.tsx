'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import BlinkingCursor from '@/components/ui/BlinkingCursor'
import type { Program, Org, Proposal } from '@/types'

const stripeColor = (color: string) => {
  if (color === 'accent') return 'var(--accent)'
  if (color === 'warn') return 'var(--warn)'
  return 'var(--fg-5)'
}

const statusColor = (s: string) => {
  if (s === 'accepted') return 'var(--accent)'
  if (s === 'submitted') return 'var(--info)'
  if (s === 'rejected') return 'var(--danger)'
  return 'var(--fg-3)'
}

type ModalMode = null | 'create' | { type: 'edit'; proposal: Proposal }

interface FormState {
  program_id: string
  org_id: string
  title: string
  content: string
}

export default function WarRoomPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'programs' | 'proposals'>('programs')
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalMode>(null)
  const [form, setForm] = useState<FormState>({ program_id: '', org_id: '', title: '', content: '' })

  const { data: programs, isLoading: programsLoading, isError: programsError } = useQuery<Program[]>({
    queryKey: ['warroom', 'programs'],
    queryFn: () => api.get(endpoints.warroom.programs).then(r => r.data.results ?? r.data),
  })

  const { data: proposals, isLoading: proposalsLoading, isError: proposalsError } = useQuery<Proposal[]>({
    queryKey: ['warroom', 'proposals'],
    queryFn: () => api.get(endpoints.warroom.proposals).then(r => r.data.results ?? r.data),
    enabled: tab === 'proposals',
  })

  const { data: expandedOrgs, isLoading: orgsLoading } = useQuery<Org[]>({
    queryKey: ['warroom', 'orgs', expandedProgram],
    queryFn: () =>
      api.get(`${endpoints.warroom.orgs}?programs__name=${expandedProgram}`).then(r => r.data.results ?? r.data),
    enabled: !!expandedProgram,
  })

  const { data: modalOrgs } = useQuery<Org[]>({
    queryKey: ['warroom', 'orgs', 'modal', form.program_id],
    queryFn: () => {
      const prog = programs?.find(p => p.id === Number(form.program_id))
      return api.get(`${endpoints.warroom.orgs}?programs__name=${prog?.name}`).then(r => r.data.results ?? r.data)
    },
    enabled: !!form.program_id && modal !== null,
  })

  const trackMutation = useMutation({
    mutationFn: (program_slug: string) => api.post(endpoints.warroom.tracking, { program_slug }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['warroom', 'programs'] }),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      api.post(endpoints.warroom.proposals, {
        program: Number(form.program_id),
        org: form.org_id ? Number(form.org_id) : null,
        title: form.title,
        content: form.content,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warroom', 'proposals'] })
      setModal(null)
      setForm({ program_id: '', org_id: '', title: '', content: '' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ pk, data }: { pk: number; data: Record<string, unknown> }) =>
      api.patch(endpoints.warroom.proposal(pk), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warroom', 'proposals'] })
      setModal(null)
    },
  })

  const openCreate = () => {
    setForm({ program_id: '', org_id: '', title: '', content: '' })
    setModal('create')
  }

  const openEdit = (p: Proposal) => {
    setForm({ program_id: String(p.program), org_id: String(p.org ?? ''), title: p.title, content: p.content })
    setModal({ type: 'edit', proposal: p })
  }

  const handleSave = () => {
    if (modal === 'create') {
      createMutation.mutate()
    } else if (modal && typeof modal === 'object') {
      updateMutation.mutate({
        pk: modal.proposal.id,
        data: { title: form.title, content: form.content, org: form.org_id ? Number(form.org_id) : null },
      })
    }
  }

  const handleSubmitProposal = (p: Proposal) => {
    updateMutation.mutate({ pk: p.id, data: { status: 'submitted' } })
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <Topbar crumb="war room" />
      <div style={{ padding: 32, maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        <span className="eyebrow">// war room · program tracker</span>
        <h1 style={{ fontSize: 36, marginTop: 8, marginBottom: 8 }}>
          six programs<span style={{ color: 'var(--accent)' }}>/</span> one tracker.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--fg-2)', marginBottom: 24, maxWidth: 560 }}>
          deadlines, slot counts, and org filters — for every program that matters.
        </p>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, borderBottom: '1px solid var(--line-2)' }}>
          {(['programs', 'proposals'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="btn btn-ghost"
              style={{
                fontSize: 13,
                borderRadius: 0,
                paddingBottom: 10,
                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                color: tab === t ? 'var(--fg-1)' : 'var(--fg-3)',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Programs tab ── */}
        {tab === 'programs' && (
          <>
            {programsError ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--danger)' }}>
                error loading programs. try refreshing.
              </div>
            ) : programsLoading ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>
                loading<BlinkingCursor />
              </div>
            ) : !programs?.length ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)', padding: '40px 0', textAlign: 'center' }}>
                no programs available yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {programs.map((p, i) => (
                  <div key={p.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 4, background: stripeColor(p.color) }} />
                    <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div>
                          <span className="eyebrow">// program_0{i + 1}</span>
                          <h4 style={{ fontSize: 20, margin: '8px 0 0' }}>{p.display_name}</h4>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', whiteSpace: 'nowrap', paddingTop: 4 }}>
                          {p.stipend_display}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, marginTop: 12, lineHeight: 1.5 }}>{p.description}</p>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--warn)', marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 6, height: 6, background: 'var(--warn)', borderRadius: '50%', display: 'inline-block' }} />
                        {p.time_remaining_human}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line-1)' }}>
                        {[
                          { v: p.org_count, l: 'orgs' },
                          { v: p.slots_count ?? '~', l: 'slots' },
                          { v: p.acceptance_rate ? `${p.acceptance_rate}%` : '—', l: 'accept' },
                        ].map(({ v, l }) => (
                          <div key={l}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600 }}>{v}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 2 }}>{l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <button
                          onClick={() => trackMutation.mutate(p.name)}
                          className={`btn ${p.is_tracked ? '' : 'btn-primary'}`}
                          style={{ flex: 1, fontSize: 12 }}
                        >
                          {p.is_tracked ? '✓ tracking' : '+ track'}
                        </button>
                        <button
                          onClick={() => setExpandedProgram(expandedProgram === p.name ? null : p.name)}
                          className="btn"
                          style={{ fontSize: 12, padding: '8px 12px' }}
                        >
                          {expandedProgram === p.name ? '↑ orgs' : '↓ orgs'}
                        </button>
                        <Link
                          href={`/warroom/${p.name}`}
                          className="btn"
                          style={{ fontSize: 12, padding: '8px 12px', display: 'flex', alignItems: 'center' }}
                        >
                          enter →
                        </Link>
                      </div>

                      {/* Expandable org list */}
                      {expandedProgram === p.name && (
                        <div style={{ marginTop: 16, borderTop: '1px solid var(--line-2)', paddingTop: 16 }}>
                          {orgsLoading ? (
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
                              loading orgs<BlinkingCursor />
                            </div>
                          ) : expandedOrgs?.length ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto' }}>
                              {expandedOrgs.map(org => (
                                <div key={org.id} style={{ background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-4)', padding: '10px 14px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-1)' }}>
                                      {org.display_name}
                                    </div>
                                    {org.website_url && (
                                      <a href={org.website_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', border: 0 }}>↗</a>
                                    )}
                                  </div>
                                  {org.stack_tags?.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                                      {org.stack_tags.map(tag => (
                                        <span key={tag} className="pill">{tag}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
                              no orgs found for this program.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Proposals tab ── */}
        {tab === 'proposals' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>your proposals</div>
              <button onClick={openCreate} className="btn btn-primary" style={{ fontSize: 12 }}>+ new proposal</button>
            </div>

            {proposalsError ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--danger)' }}>
                error loading proposals. try refreshing.
              </div>
            ) : proposalsLoading ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>
                loading<BlinkingCursor />
              </div>
            ) : !proposals?.length ? (
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)', marginBottom: 16 }}>no proposals yet.</div>
                <button onClick={openCreate} className="btn btn-primary" style={{ fontSize: 12 }}>start your first draft →</button>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 90px 50px auto', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--line-2)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <span>title</span><span>program</span><span>status</span><span>ver</span><span></span>
                </div>
                {proposals.map(p => (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 90px 50px auto', gap: 12, padding: '12px 20px', borderTop: '1px solid var(--line-1)', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-1)' }}>{p.title}</div>
                      {p.org_display_name && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', marginTop: 3 }}>{p.org_display_name}</div>
                      )}
                      {p.mentor_feedback && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--warn)', marginTop: 4 }}>
                          feedback: {p.mentor_feedback.slice(0, 60)}{p.mentor_feedback.length > 60 ? '…' : ''}
                        </div>
                      )}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>{p.program_name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: statusColor(p.status) }}>{p.status}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-4)' }}>v{p.version}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(p)} className="btn" style={{ fontSize: 11, padding: '4px 10px' }}>edit</button>
                      {p.status === 'draft' && (
                        <button
                          onClick={() => handleSubmitProposal(p)}
                          className="btn btn-primary"
                          style={{ fontSize: 11, padding: '4px 10px' }}
                          disabled={updateMutation.isPending}
                        >
                          submit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {modal !== null && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setModal(null)}
        >
          <div
            style={{ background: 'var(--bg-2)', border: '1px solid var(--line-3)', borderRadius: 'var(--r-4)', padding: 32, width: 560, maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h4 style={{ fontSize: 16 }}>{modal === 'create' ? 'new proposal' : 'edit proposal'}</h4>
              <button onClick={() => setModal(null)} className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 8px' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {modal === 'create' && (
                <>
                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      program
                    </label>
                    <select
                      value={form.program_id}
                      onChange={e => setForm(f => ({ ...f, program_id: e.target.value, org_id: '' }))}
                      className="input"
                    >
                      <option value="">select program</option>
                      {programs?.map(p => (
                        <option key={p.id} value={p.id}>{p.display_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      org <span style={{ color: 'var(--fg-5)' }}>(optional)</span>
                    </label>
                    <select
                      value={form.org_id}
                      onChange={e => setForm(f => ({ ...f, org_id: e.target.value }))}
                      className="input"
                      disabled={!form.program_id}
                    >
                      <option value="">select org</option>
                      {modalOrgs?.map(o => (
                        <option key={o.id} value={o.id}>{o.display_name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  title
                </label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="input"
                  placeholder="proposal title"
                />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  content <span style={{ color: 'var(--fg-5)' }}>(markdown)</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="input"
                  placeholder="write your proposal here..."
                  rows={9}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => setModal(null)} className="btn" style={{ fontSize: 12 }}>cancel</button>
                <button
                  onClick={handleSave}
                  className="btn btn-primary"
                  style={{ fontSize: 12 }}
                  disabled={isSaving || !form.title || (modal === 'create' && !form.program_id)}
                >
                  {isSaving ? 'saving…' : modal === 'create' ? 'create draft' : 'save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
