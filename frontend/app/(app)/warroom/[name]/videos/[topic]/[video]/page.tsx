'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import api, { endpoints } from '@/lib/api'
import Topbar from '@/components/layout/Topbar'
import BlinkingCursor from '@/components/ui/BlinkingCursor'
import type { VideoPageData, VideoNote } from '@/types'

// ── helpers ────────────────────────────────────────────────────────────
let ytApiPromise: Promise<void> | null = null
function loadYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  const w = window as any
  if (w.YT && w.YT.Player) return Promise.resolve()
  if (ytApiPromise) return ytApiPromise
  ytApiPromise = new Promise<void>(resolve => {
    const prev = w.onYouTubeIframeAPIReady
    w.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve() }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
  return ytApiPromise
}

const ytId = (embed: string) => embed.match(/embed\/([\w-]{11})/)?.[1] ?? null

function fmt(s: number) {
  if (!isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2]
const SAVE_EVERY_MS = 5000

export default function VideoPage({ params }: { params: { name: string; topic: string; video: string } }) {
  const qc = useQueryClient()
  const router = useRouter()

  const { data, isLoading, isError } = useQuery<VideoPageData>({
    queryKey: ['warroom', 'video', params.name, params.topic, params.video],
    queryFn: () => api.get(endpoints.warroom.video(params.name, params.topic, params.video)).then(r => r.data),
  })

  const videoHref = (slug: string) => `/warroom/${params.name}/videos/${params.topic}/${slug}`

  // ── player state ──────────────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState(1)
  const [completed, setCompleted] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [notes, setNotes] = useState<VideoNote[]>([])
  const [noteDraft, setNoteDraft] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)

  const ytRef = useRef<any>(null)
  const videoElRef = useRef<HTMLVideoElement | null>(null)
  const mountRef = useRef<HTMLDivElement | null>(null)
  const timeRef = useRef({ t: 0, d: 0 })
  const lastSentRef = useRef(0)
  const resumeRef = useRef(0)

  const video = data?.video
  const kind: 'youtube' | 'native' | 'iframe' = useMemo(() => {
    if (!video) return 'iframe'
    if (video.is_direct_file) return 'native'
    if (ytId(video.embed_url)) return 'youtube'
    return 'iframe'
  }, [video])

  // seed notes + resume position once data arrives
  useEffect(() => {
    if (!data) return
    setNotes(data.notes ?? [])
    setCompleted(!!data.progress?.completed)
    resumeRef.current = data.progress && !data.progress.completed ? data.progress.position_seconds : 0
  }, [data])

  // ── progress persistence ──────────────────────────────────────────────
  const sendProgress = useCallback((force = false) => {
    const { t, d } = timeRef.current
    if (!video || d <= 0) return
    const now = Date.now()
    if (!force && now - lastSentRef.current < SAVE_EVERY_MS) return
    lastSentRef.current = now
    api.post(endpoints.warroom.videoProgress(video.id), { position: t, duration: d })
      .then(r => {
        if (r.data.completed && !completed) {
          setCompleted(true)
          qc.invalidateQueries({ queryKey: ['warroom', 'contest', params.name] })
        }
        setSavedFlash(true)
        setTimeout(() => setSavedFlash(false), 1200)
      })
      .catch(() => {})
  }, [video, completed, qc, params.name])

  // flush on unmount / tab hide
  useEffect(() => {
    const flush = () => sendProgress(true)
    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', flush)
    return () => {
      flush()
      window.removeEventListener('beforeunload', flush)
      document.removeEventListener('visibilitychange', flush)
    }
  }, [sendProgress])

  const onTick = useCallback((t: number, d: number) => {
    timeRef.current = { t, d }
    setCurrentTime(t)
    if (d && d !== duration) setDuration(d)
    if (playing) sendProgress(false)
  }, [duration, playing, sendProgress])

  // hold the latest callbacks in refs so the player effect can stay stable
  // (depending on these directly would tear down & rebuild the player mid-play)
  const onTickRef = useRef(onTick)
  const sendProgressRef = useRef(sendProgress)
  const nextRef = useRef(data?.next ?? null)
  useEffect(() => { onTickRef.current = onTick }, [onTick])
  useEffect(() => { sendProgressRef.current = sendProgress }, [sendProgress])
  useEffect(() => { nextRef.current = data?.next ?? null }, [data?.next])

  // ── YouTube player ── created ONCE per video, never during playback ──────
  const ytVideoId = kind === 'youtube' && video ? ytId(video.embed_url) : null
  useEffect(() => {
    if (!ytVideoId) return
    let interval: any
    let destroyed = false

    loadYouTubeApi().then(() => {
      if (destroyed || !mountRef.current) return
      const w = window as any
      ytRef.current = new w.YT.Player(mountRef.current, {
        videoId: ytVideoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, origin: window.location.origin },
        events: {
          onReady: (e: any) => {
            if (resumeRef.current > 5) e.target.seekTo(resumeRef.current, true)
            setDuration(e.target.getDuration() || 0)
          },
          onStateChange: (e: any) => {
            const YT = (window as any).YT
            setPlaying(e.data === YT.PlayerState.PLAYING)
            if (e.data === YT.PlayerState.ENDED) {
              sendProgressRef.current(true)
              if (nextRef.current) setCountdown(5)
            }
          },
        },
      })
    })

    interval = setInterval(() => {
      const p = ytRef.current
      if (p && p.getCurrentTime) onTickRef.current(p.getCurrentTime() || 0, p.getDuration() || 0)
    }, 1000)

    return () => {
      destroyed = true
      clearInterval(interval)
      try { ytRef.current?.destroy?.() } catch {}
      ytRef.current = null
    }
  }, [ytVideoId])

  // ── seek / controls ───────────────────────────────────────────────────
  const seekTo = useCallback((t: number, play = true) => {
    if (kind === 'youtube' && ytRef.current?.seekTo) {
      ytRef.current.seekTo(Math.max(0, t), true)
      if (play) ytRef.current.playVideo?.()
    } else if (kind === 'native' && videoElRef.current) {
      videoElRef.current.currentTime = Math.max(0, t)
      if (play) videoElRef.current.play()
    }
    setCurrentTime(Math.max(0, t))
  }, [kind])

  const togglePlay = useCallback(() => {
    if (kind === 'youtube' && ytRef.current) {
      playing ? ytRef.current.pauseVideo() : ytRef.current.playVideo()
    } else if (kind === 'native' && videoElRef.current) {
      playing ? videoElRef.current.pause() : videoElRef.current.play()
    }
  }, [kind, playing])

  const changeRate = useCallback((r: number) => {
    setRate(r)
    if (kind === 'youtube') ytRef.current?.setPlaybackRate?.(r)
    if (kind === 'native' && videoElRef.current) videoElRef.current.playbackRate = r
  }, [kind])

  // keyboard shortcuts (ignored while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay() }
      else if (e.key === 'ArrowRight' || e.key === 'l') seekTo(currentTime + 5)
      else if (e.key === 'ArrowLeft' || e.key === 'j') seekTo(Math.max(0, currentTime - 5))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlay, seekTo, currentTime])

  // autoplay-next countdown
  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) { if (data?.next) router.push(videoHref(data.next.slug)); return }
    const t = setTimeout(() => setCountdown(c => (c === null ? null : c - 1)), 1000)
    return () => clearTimeout(t)
  }, [countdown, data?.next]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── notes ─────────────────────────────────────────────────────────────
  const addNote = useCallback(() => {
    if (!video || !noteDraft.trim()) return
    const ts = Math.floor(timeRef.current.t || currentTime)
    api.post(endpoints.warroom.videoNotes(video.id), { timestamp_seconds: ts, body: noteDraft.trim() })
      .then(r => {
        setNotes(n => [...n, r.data].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds))
        setNoteDraft('')
      })
      .catch(() => {})
  }, [video, noteDraft, currentTime])

  const deleteNote = useCallback((id: number) => {
    api.delete(endpoints.warroom.videoNote(id)).then(() => setNotes(n => n.filter(x => x.id !== id))).catch(() => {})
  }, [])

  const chapters = video?.chapters ?? []
  const activeChapter = useMemo(() => {
    let idx = -1
    chapters.forEach((c, i) => { if (c.timestamp_seconds <= currentTime + 0.5) idx = i })
    return idx
  }, [chapters, currentTime])

  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  return (
    <>
      <Topbar crumb={`war room / ${params.name} / videos`} />
      <div style={{ padding: 32, maxWidth: 1440, width: '100%', margin: '0 auto' }}>
        {isError ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--danger)' }}>error loading video. try refreshing.</div>
        ) : isLoading || !data || !video ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)' }}>loading<BlinkingCursor /></div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <Link href={`/warroom/${params.name}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-4)', textDecoration: 'none' }}>
                ← {params.name} · {video.topic_name}
              </Link>
              {completed && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>✓ completed</span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, marginTop: 16, alignItems: 'start' }}>
              {/* ── player column ── */}
              <main style={{ minWidth: 0 }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: 'var(--bg-1)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', overflow: 'hidden' }}>
                  {kind === 'youtube' ? (
                    <div ref={mountRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                  ) : kind === 'native' ? (
                    <video
                      ref={videoElRef}
                      src={video.embed_url}
                      controls
                      onTimeUpdate={e => onTick(e.currentTarget.currentTime, e.currentTarget.duration || 0)}
                      onLoadedMetadata={e => { if (resumeRef.current > 5) e.currentTarget.currentTime = resumeRef.current; setDuration(e.currentTarget.duration || 0) }}
                      onPlay={() => setPlaying(true)}
                      onPause={() => { setPlaying(false); sendProgress(true) }}
                      onEnded={() => { sendProgress(true); if (data.next) setCountdown(5) }}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                    />
                  ) : (
                    <iframe
                      src={video.embed_url}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                    />
                  )}

                  {/* autoplay-next overlay */}
                  {countdown !== null && data.next && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 5 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>up next in {countdown}s</div>
                      <div style={{ fontSize: 20, color: 'var(--fg-1)' }}>{data.next.title}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button onClick={() => router.push(videoHref(data.next!.slug))} className="btn btn-primary" style={{ fontSize: 12 }}>play now →</button>
                        <button onClick={() => setCountdown(null)} className="btn" style={{ fontSize: 12 }}>cancel</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* progress bar (interactive features for youtube/native) */}
                {kind !== 'iframe' && (
                  <div style={{ marginTop: 10 }}>
                    <div
                      onClick={e => {
                        const r = e.currentTarget.getBoundingClientRect()
                        if (duration > 0) seekTo(((e.clientX - r.left) / r.width) * duration)
                      }}
                      style={{ height: 6, background: 'var(--bg-1)', borderRadius: 3, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                    >
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: 'width 0.25s linear' }} />
                      {/* chapter ticks */}
                      {duration > 0 && chapters.map(c => (
                        <div key={c.id} style={{ position: 'absolute', top: 0, left: `${(c.timestamp_seconds / duration) * 100}%`, width: 2, height: '100%', background: 'var(--bg-3)' }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>
                        {fmt(currentTime)} / {fmt(duration)} {savedFlash && <span style={{ color: 'var(--accent)' }}>· saved</span>}
                      </span>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)' }}>speed</span>
                        {SPEEDS.map(s => (
                          <button key={s} onClick={() => changeRate(s)} className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 6px', color: rate === s ? 'var(--accent)' : 'var(--fg-3)' }}>{s}×</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <h1 style={{ fontSize: 26, marginTop: 18, marginBottom: 8 }}>{video.title}</h1>
                {video.description && (
                  <div className="markdown" style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--fg-2)' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{video.description}</ReactMarkdown>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 28, paddingTop: 18, borderTop: '1px solid var(--line-2)' }}>
                  {data.prev ? <Link href={videoHref(data.prev.slug)} className="btn" style={{ fontSize: 12, maxWidth: '48%' }}>← {data.prev.title}</Link> : <span />}
                  {data.next ? <Link href={videoHref(data.next.slug)} className="btn" style={{ fontSize: 12, maxWidth: '48%', textAlign: 'right' }}>{data.next.title} →</Link> : <span />}
                </div>

                {kind !== 'iframe' && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-5)', marginTop: 16 }}>
                    shortcuts: <span style={{ color: 'var(--fg-4)' }}>k/space</span> play · <span style={{ color: 'var(--fg-4)' }}>j/l</span> ±5s
                  </div>
                )}
              </main>

              {/* ── side rail: chapters · notes · related ── */}
              <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* chapters */}
                {chapters.length > 0 && (
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 10 }}>// chapters</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {chapters.map((c, i) => {
                        const active = i === activeChapter
                        return (
                          <button
                            key={c.id}
                            onClick={() => seekTo(c.timestamp_seconds)}
                            disabled={kind === 'iframe'}
                            className="btn btn-ghost"
                            style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: 12.5, padding: '7px 10px', borderRadius: 'var(--r-4)', borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent', background: active ? 'var(--bg-1)' : 'transparent', color: active ? 'var(--fg-1)' : 'var(--fg-3)', cursor: kind === 'iframe' ? 'default' : 'pointer' }}
                          >
                            <span style={{ color: 'var(--accent)', minWidth: 42 }}>{fmt(c.timestamp_seconds)}</span>
                            <span>{c.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* notes */}
                {kind !== 'iframe' && (
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 10 }}>// my notes</div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                      <input
                        value={noteDraft}
                        onChange={e => setNoteDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addNote() }}
                        placeholder={`note @ ${fmt(currentTime)}…`}
                        className="input"
                        style={{ fontSize: 12, flex: 1 }}
                      />
                      <button onClick={addNote} className="btn btn-primary" style={{ fontSize: 12, padding: '0 12px' }} disabled={!noteDraft.trim()}>+</button>
                    </div>
                    {notes.length === 0 ? (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-5)' }}>jot a note pinned to the current moment — click it later to jump back.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {notes.map(n => (
                          <div key={n.id} className="note-row" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-4)', padding: '8px 10px' }}>
                            <button onClick={() => seekTo(n.timestamp_seconds)} className="btn btn-ghost" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', padding: 0, flexShrink: 0 }}>{fmt(n.timestamp_seconds)}</button>
                            <span style={{ fontSize: 12.5, color: 'var(--fg-2)', flex: 1, lineHeight: 1.4 }}>{n.body}</span>
                            <button onClick={() => deleteNote(n.id)} className="note-del btn btn-ghost" style={{ fontSize: 12, color: 'var(--fg-5)', padding: 0, flexShrink: 0 }}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* related */}
                {data.related.length > 0 && (
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 10 }}>// up next</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {data.related.map(v => (
                        <Link key={v.id} href={videoHref(v.slug)} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-4)', padding: 8, textDecoration: 'none', color: 'inherit' }}>
                          <div style={{ width: 64, height: 40, flexShrink: 0, background: 'var(--bg-1)', borderRadius: 'var(--r-4)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {v.thumbnail_url ? <img src={v.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--fg-5)' }}>▸</span>}
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.4, flex: 1 }}>{v.title}</span>
                          {v.completed && <span style={{ color: 'var(--accent)', fontSize: 12 }}>✓</span>}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .note-del { opacity: 0; transition: opacity 0.15s; }
        .note-row:hover .note-del { opacity: 1; }
      `}</style>
    </>
  )
}
