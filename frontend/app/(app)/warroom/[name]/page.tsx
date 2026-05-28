'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import BlinkingCursor from '@/components/ui/BlinkingCursor'
import type { ContestDetail } from '@/types'

type SectionKey = 'about' | 'flow' | 'timeline' | 'stipend' | 'faq'

const SECTION_LABELS: Record<SectionKey, string> = {
  about: 'about',
  flow: 'contest flow',
  timeline: 'timeline',
  stipend: 'stipend',
  faq: 'faq',
}

function Md({ children }: { children: string }) {
  if (!children?.trim()) return null
  return (
    <div className="markdown" style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--fg-2)' }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}

function fmtDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function eventRange(start: string | null, end: string | null) {
  const s = fmtDate(start)
  const e = fmtDate(end)
  if (s && e && s !== e) return `${s} – ${e}`
  return s || e || ''
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 16 }}>
      {children}
    </div>
  )
}

export default function ContestDetailPage({ params }: { params: { name: string } }) {
  const { data, isLoading, isError } = useQuery<ContestDetail>({
    queryKey: ['warroom', 'contest', params.name],
    queryFn: () => api.get(endpoints.warroom.contest(params.name)).then(r => r.data),
  })

  const [videosOpen, setVideosOpen] = useState(true)
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({})
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeTimeline, setActiveTimeline] = useState(0)
  const [activeSection, setActiveSection] = useState<SectionKey>('about')
  const [showTop, setShowTop] = useState(false)

  const sectionRefs = useRef<Partial<Record<SectionKey, HTMLElement | null>>>({})

  // which content sections actually have data → drives the TOC
  const sections = useMemo<SectionKey[]>(() => {
    if (!data) return []
    const out: SectionKey[] = ['about']
    if (data.flow_steps?.length) out.push('flow')
    if (data.timelines?.length) out.push('timeline')
    if (data.stipend_tiers?.length || data.stipend_phases?.length || data.stipend_display) out.push('stipend')
    if (data.faqs?.length) out.push('faq')
    return out
  }, [data])

  // scroll-spy: highlight the section currently in view
  useEffect(() => {
    if (!data) return
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio - a.intersectionRatio))
        if (visible[0]) setActiveSection(visible[0].target.getAttribute('data-section') as SectionKey)
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    sections.forEach(key => {
      const el = sectionRefs.current[key]
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [data, sections])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToSection = useCallback((key: SectionKey) => {
    sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const setRef = (key: SectionKey) => (el: HTMLElement | null) => { sectionRefs.current[key] = el }

  return (
    <>
      <Topbar crumb={`war room / ${params.name}`} />
      <div style={{ padding: 32, maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        {isError ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--danger)' }}>error loading contest. try refreshing.</div>
        ) : isLoading ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>loading<BlinkingCursor /></div>
        ) : !data ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>contest not found.</div>
        ) : (
          <>
            <Link href="/warroom" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-4)', textDecoration: 'none' }}>← war room</Link>
            <h1 style={{ fontSize: 36, marginTop: 8, marginBottom: 8 }}>
              {data.display_name}<span style={{ color: 'var(--accent)' }}>/</span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--fg-2)', marginBottom: 24, maxWidth: 640 }}>{data.description}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32, alignItems: 'start' }}>
              {/* ── Sidebar / table of contents ── */}
              <aside style={{ position: 'sticky', top: 24, background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', padding: 12 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.14em', padding: '6px 12px 10px' }}>
                  overview
                </div>
                {sections.map(key => {
                  const active = activeSection === key
                  return (
                    <button
                      key={key}
                      onClick={() => scrollToSection(key)}
                      className="btn btn-ghost"
                      style={{
                        width: '100%', justifyContent: 'flex-start', textAlign: 'left',
                        fontFamily: 'var(--font-mono)', fontSize: 13, borderRadius: 'var(--r-4)',
                        padding: '8px 12px', marginBottom: 2, transition: 'color 0.15s, background 0.15s',
                        color: active ? 'var(--fg-1)' : 'var(--fg-3)',
                        background: active ? 'var(--bg-1)' : 'transparent',
                        borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                      }}
                    >
                      {SECTION_LABELS[key]}
                    </button>
                  )
                })}

                {/* Videos — nested dropdown */}
                {data.video_topics?.length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--line-1)' }}>
                    <button
                      onClick={() => setVideosOpen(o => !o)}
                      className="btn btn-ghost"
                      style={{ width: '100%', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', borderRadius: 'var(--r-4)', padding: '8px 12px', color: 'var(--fg-3)' }}
                    >
                      <span>videos</span>
                      <span style={{ color: 'var(--fg-4)', transition: 'transform 0.2s', transform: videosOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
                    </button>
                    {videosOpen && data.video_topics.map(topic => {
                      const isOpen = openTopics[topic.slug] ?? true
                      const total = topic.videos.length
                      const done = topic.videos.filter(v => v.completed).length
                      const ringPct = total ? Math.round((done / total) * 100) : 0
                      return (
                        <div key={topic.id} style={{ marginLeft: 8, borderLeft: '1px solid var(--line-1)', paddingLeft: 8 }}>
                          <button
                            onClick={() => setOpenTopics(s => ({ ...s, [topic.slug]: !isOpen }))}
                            className="btn btn-ghost"
                            style={{ width: '100%', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 12, borderRadius: 'var(--r-4)', padding: '6px 10px', color: 'var(--fg-3)' }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {/* progress ring */}
                              <span
                                title={`${done}/${total} done`}
                                style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, background: `conic-gradient(var(--accent) ${ringPct * 3.6}deg, var(--line-2) 0deg)`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--bg-2)' }} />
                              </span>
                              {topic.name}
                            </span>
                            <span style={{ color: 'var(--fg-4)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
                          </button>
                          {isOpen && topic.videos.map(v => (
                            <Link
                              key={v.id}
                              href={`/warroom/${data.name}/videos/${topic.slug}/${v.slug}`}
                              className="toc-video"
                              style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: v.completed ? 'var(--fg-3)' : 'var(--fg-4)', textDecoration: 'none', padding: '5px 10px 5px 18px', borderRadius: 'var(--r-4)' }}
                            >
                              <span>{v.completed ? '✓' : '▸'} {v.title}</span>
                            </Link>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )}
              </aside>

              {/* ── Main content · single scrollable document ── */}
              <main style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 48 }}>
                {/* About */}
                <section ref={setRef('about')} data-section="about" style={{ scrollMarginTop: 24 }}>
                  <SectionHeader>// about</SectionHeader>
                  {data.overview?.description_long && <Md>{data.overview.description_long}</Md>}
                  {data.overview?.objective && (
                    <div style={{ marginTop: 24 }}>
                      <h4 style={{ fontSize: 15, marginBottom: 8 }}>objective</h4>
                      <Md>{data.overview.objective}</Md>
                    </div>
                  )}
                  {data.overview?.eligibility && (
                    <div style={{ marginTop: 24 }}>
                      <h4 style={{ fontSize: 15, marginBottom: 8 }}>eligibility</h4>
                      <Md>{data.overview.eligibility}</Md>
                    </div>
                  )}
                  {data.overview?.prerequisites && (
                    <div style={{ marginTop: 24 }}>
                      <h4 style={{ fontSize: 15, marginBottom: 8 }}>prerequisites</h4>
                      <Md>{data.overview.prerequisites}</Md>
                    </div>
                  )}
                  {data.overview?.registration_process && (
                    <div style={{ marginTop: 24 }}>
                      <h4 style={{ fontSize: 15, marginBottom: 8 }}>registration process</h4>
                      <Md>{data.overview.registration_process}</Md>
                    </div>
                  )}
                  {(data.website_url || data.links?.length > 0) && (
                    <div style={{ marginTop: 24 }}>
                      <h4 style={{ fontSize: 15, marginBottom: 8 }}>important links</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {data.website_url && (
                          <a href={data.website_url} target="_blank" rel="noopener noreferrer" className="btn" style={{ fontSize: 12 }}>official site ↗</a>
                        )}
                        {data.links?.map(l => (
                          <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="btn" style={{ fontSize: 12 }}>{l.label} ↗</a>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* Contest flow */}
                {sections.includes('flow') && (
                  <section ref={setRef('flow')} data-section="flow" style={{ scrollMarginTop: 24 }}>
                    <SectionHeader>// contest flow</SectionHeader>
                    <div>
                      {data.flow_steps.map((step, i) => (
                        <div key={step.id} className="flow-step" style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 16 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="flow-bullet" style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--accent)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, flexShrink: 0, transition: 'background 0.15s, color 0.15s' }}>
                              {i + 1}
                            </div>
                            {i < data.flow_steps.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--line-2)', minHeight: 24 }} />}
                          </div>
                          <div style={{ paddingBottom: 24 }}>
                            <h4 style={{ fontSize: 15, marginBottom: 4 }}>{step.title}</h4>
                            <Md>{step.description}</Md>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Timeline */}
                {sections.includes('timeline') && (
                  <section ref={setRef('timeline')} data-section="timeline" style={{ scrollMarginTop: 24 }}>
                    <SectionHeader>// timeline</SectionHeader>
                    {data.timelines.length > 1 && (
                      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                        {data.timelines.map((t, i) => (
                          <button
                            key={t.id}
                            onClick={() => setActiveTimeline(i)}
                            className={`btn ${activeTimeline === i ? 'btn-primary' : ''}`}
                            style={{ fontSize: 12 }}
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <div style={{ borderLeft: '2px solid var(--line-2)', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {(data.timelines[activeTimeline]?.events ?? []).map(ev => (
                        <div key={ev.id} className="tl-event" style={{ position: 'relative', transition: 'transform 0.15s' }}>
                          <div className="tl-dot" style={{ position: 'absolute', left: -31, top: 4, width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--bg-1)', transition: 'transform 0.15s, box-shadow 0.15s' }} />
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--warn)', marginBottom: 4 }}>{eventRange(ev.start_date, ev.end_date)}</div>
                          <h4 style={{ fontSize: 15, marginBottom: 4 }}>{ev.title}</h4>
                          {ev.description && <p style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6 }}>{ev.description}</p>}
                          {ev.link_url && <a href={ev.link_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-4)' }}>details ↗</a>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Stipend */}
                {sections.includes('stipend') && (
                  <section ref={setRef('stipend')} data-section="stipend" style={{ scrollMarginTop: 24 }}>
                    <SectionHeader>// stipend</SectionHeader>
                    {data.stipend_display && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: 'var(--accent)', marginBottom: 24 }}>{data.stipend_display}</div>
                    )}
                    {data.stipend_tiers?.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
                        {data.stipend_tiers.map(t => (
                          <div key={t.id} className="card hover-lift" style={{ padding: 16, transition: 'transform 0.15s, border-color 0.15s' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t.region || 'global'}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--fg-1)', marginTop: 6 }}>
                              {t.currency === 'INR' ? '₹' : '$'}{t.amount.toLocaleString()}
                            </div>
                            {t.note && <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 6 }}>{t.note}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                    {data.stipend_phases?.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: 15, marginBottom: 12 }}>payment phases</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {data.stipend_phases.map(p => (
                            <div key={p.id} style={{ background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-4)', padding: '12px 16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-1)' }}>{p.name}</span>
                                {p.timing && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-4)' }}>{p.timing}</span>}
                              </div>
                              {p.note && <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 4 }}>{p.note}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* FAQ */}
                {sections.includes('faq') && (
                  <section ref={setRef('faq')} data-section="faq" style={{ scrollMarginTop: 24 }}>
                    <SectionHeader>// faq</SectionHeader>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {data.faqs.map(f => {
                        const open = openFaq === f.id
                        return (
                          <div key={f.id} style={{ background: 'var(--bg-2)', border: `1px solid ${open ? 'var(--line-3)' : 'var(--line-2)'}`, borderRadius: 'var(--r-4)', overflow: 'hidden', transition: 'border-color 0.15s' }}>
                            <button
                              onClick={() => setOpenFaq(open ? null : f.id)}
                              className="btn btn-ghost"
                              style={{ width: '100%', justifyContent: 'space-between', textAlign: 'left', fontSize: 14, padding: '14px 16px', borderRadius: 0 }}
                            >
                              <span>{f.question}</span>
                              <span style={{ color: 'var(--fg-4)', transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'rotate(0deg)', fontSize: 18, lineHeight: 1 }}>+</span>
                            </button>
                            <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.22s ease' }}>
                              <div style={{ overflow: 'hidden' }}>
                                <div style={{ padding: '0 16px 16px' }}>
                                  <Md>{f.answer}</Md>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}
              </main>
            </div>
          </>
        )}
      </div>

      {/* back to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="btn"
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, fontSize: 12, padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
        >
          ↑ top
        </button>
      )}

      <style jsx>{`
        .toc-video:hover { color: var(--fg-2); background: var(--bg-1); }
        .flow-step:hover .flow-bullet { background: var(--accent); color: var(--bg-1); }
        .tl-event:hover { transform: translateX(3px); }
        .tl-event:hover .tl-dot { transform: scale(1.35); box-shadow: 0 0 0 4px rgba(0,0,0,0.25); }
        .hover-lift:hover { transform: translateY(-2px); border-color: var(--line-3); }
      `}</style>
    </>
  )
}
