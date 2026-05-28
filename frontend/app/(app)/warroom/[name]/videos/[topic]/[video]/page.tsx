'use client'

import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import BlinkingCursor from '@/components/ui/BlinkingCursor'
import type { VideoPageData } from '@/types'

export default function VideoPage({ params }: { params: { name: string; topic: string; video: string } }) {
  const { data, isLoading, isError } = useQuery<VideoPageData>({
    queryKey: ['warroom', 'video', params.name, params.topic, params.video],
    queryFn: () => api.get(endpoints.warroom.video(params.name, params.topic, params.video)).then(r => r.data),
  })

  const videoHref = (slug: string) => `/warroom/${params.name}/videos/${params.topic}/${slug}`

  return (
    <>
      <Topbar crumb={`war room / ${params.name} / videos`} />
      <div style={{ padding: 32, maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        {isError ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--danger)' }}>error loading video. try refreshing.</div>
        ) : isLoading ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>loading<BlinkingCursor /></div>
        ) : !data ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>video not found.</div>
        ) : (
          <>
            <Link href={`/warroom/${params.name}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-4)', textDecoration: 'none' }}>
              ← {params.name} · {data.video.topic_name}
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: data.related.length ? '1fr 320px' : '1fr', gap: 32, marginTop: 16, alignItems: 'start' }}>
              <main style={{ minWidth: 0 }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: 'var(--bg-1)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', overflow: 'hidden' }}>
                  <iframe
                    src={data.video.embed_url}
                    title={data.video.title}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                  />
                </div>

                <h1 style={{ fontSize: 26, marginTop: 20, marginBottom: 8 }}>{data.video.title}</h1>
                {data.video.description && (
                  <div className="markdown" style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--fg-2)' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.video.description}</ReactMarkdown>
                  </div>
                )}

                {/* prev / next */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--line-2)' }}>
                  {data.prev ? (
                    <Link href={videoHref(data.prev.slug)} className="btn" style={{ fontSize: 12, maxWidth: '48%' }}>
                      ← {data.prev.title}
                    </Link>
                  ) : <span />}
                  {data.next ? (
                    <Link href={videoHref(data.next.slug)} className="btn" style={{ fontSize: 12, maxWidth: '48%', textAlign: 'right' }}>
                      {data.next.title} →
                    </Link>
                  ) : <span />}
                </div>
              </main>

              {/* related */}
              {data.related.length > 0 && (
                <aside>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 12 }}>// related</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.related.map(v => (
                      <Link
                        key={v.id}
                        href={videoHref(v.slug)}
                        style={{ display: 'flex', gap: 12, background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-4)', padding: 10, textDecoration: 'none', color: 'inherit' }}
                      >
                        <div style={{ width: 72, height: 44, flexShrink: 0, background: 'var(--bg-1)', borderRadius: 'var(--r-4)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {v.thumbnail_url
                            ? <img src={v.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--fg-5)' }}>▸</span>}
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.4 }}>{v.title}</span>
                      </Link>
                    ))}
                  </div>
                </aside>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
