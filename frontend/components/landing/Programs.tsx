import type { Program } from '@/types'

interface ProgramsProps {
  programs?: Program[]
}

const STATIC_PROGRAMS = [
  { id: 1, name: 'gsoc', display_name: 'google summer of code', stipend_display: '$3,000–$6,600', description: '12-week paid open-source mentorship with ~200 orgs. the flagship.', time_remaining_human: 'opens in 14d 03h', slots_count: 1572, acceptance_rate: 23, org_count: 184, color: 'accent' as const, is_active: true, is_tracked: false, currency: 'USD' as const, stipend_min_usd: 3000, stipend_max_usd: 6600, stipend_inr: null, website_url: '', deadline_opens_at: null, deadline_closes_at: null },
  { id: 2, name: 'c4gt', display_name: 'code for govtech', stipend_display: '₹70,000', description: 'india-only. build for dpi: aadhaar, ondc, diksha, beckn.', time_remaining_human: 'closes in 6d 14h', slots_count: 120, acceptance_rate: 31, org_count: 42, color: 'warn' as const, is_active: true, is_tracked: false, currency: 'INR' as const, stipend_min_usd: null, stipend_max_usd: null, stipend_inr: 70000, website_url: '', deadline_opens_at: null, deadline_closes_at: null },
  { id: 3, name: 'lfx', display_name: 'lfx mentorship', stipend_display: '$3,000', description: 'linux foundation projects. kubernetes, envoy, opentelemetry.', time_remaining_human: "spring '26 cohort", slots_count: 280, acceptance_rate: 12, org_count: 93, color: 'accent' as const, is_active: true, is_tracked: false, currency: 'USD' as const, stipend_min_usd: 3000, stipend_max_usd: 3000, stipend_inr: null, website_url: '', deadline_opens_at: null, deadline_closes_at: null },
  { id: 4, name: 'sob', display_name: 'summer of bitcoin', stipend_display: '$3,000', description: 'bitcoin core, lightning, layer-2. heavy systems, light dependencies.', time_remaining_human: 'opens in 31d', slots_count: 40, acceptance_rate: 12, org_count: 14, color: 'accent' as const, is_active: true, is_tracked: false, currency: 'USD' as const, stipend_min_usd: 3000, stipend_max_usd: 3000, stipend_inr: null, website_url: '', deadline_opens_at: null, deadline_closes_at: null },
  { id: 5, name: 'esoc', display_name: 'esoc — ethereum', stipend_display: '$3,000–$5,000', description: 'ethereum ecosystem — clients, l2s, devtools, research.', time_remaining_human: 'closes in 9d', slots_count: 60, acceptance_rate: 19, org_count: 28, color: 'warn' as const, is_active: true, is_tracked: false, currency: 'USD' as const, stipend_min_usd: 3000, stipend_max_usd: 5000, stipend_inr: null, website_url: '', deadline_opens_at: null, deadline_closes_at: null },
  { id: 6, name: 'outreachy', display_name: 'outreachy', stipend_display: '$7,000', description: 'for underrepresented contributors. 13-week internships.', time_remaining_human: "may '26 cohort", slots_count: 80, acceptance_rate: null, org_count: 50, color: 'muted' as const, is_active: true, is_tracked: false, currency: 'USD' as const, stipend_min_usd: 7000, stipend_max_usd: 7000, stipend_inr: null, website_url: '', deadline_opens_at: null, deadline_closes_at: null },
]

const stripeColor = (color: string) => {
  if (color === 'accent') return 'var(--accent)'
  if (color === 'warn') return 'var(--warn)'
  return 'var(--fg-5)'
}

export default function Programs({ programs }: ProgramsProps) {
  const list = programs?.length ? programs : STATIC_PROGRAMS

  return (
    <section style={{ padding: '96px 32px', borderBottom: '1px solid var(--line-2)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>// 03 · programs / war room</span>
        <h2 style={{ fontSize: 56, lineHeight: 1, letterSpacing: '-0.02em', margin: '16px 0 20px', maxWidth: 880 }}>
          six programs<span style={{ color: 'var(--accent)' }}>/</span> one tracker.
        </h2>
        <p style={{ fontSize: 17, color: 'var(--fg-2)', maxWidth: 640, lineHeight: 1.55 }}>
          deadlines, slot counts, accepted-proposal libraries, and org filters — for every program that matters in india.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 56 }}>
          {list.slice(0, 6).map((prog, i) => (
            <div key={prog.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 4, background: stripeColor(prog.color) }} />
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <span className="eyebrow">// program_0{i + 1}</span>
                    <h4 style={{ fontSize: 22, margin: '8px 0 0', lineHeight: 1.1 }}>{prog.display_name}</h4>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', whiteSpace: 'nowrap', paddingTop: 4 }}>{prog.stipend_display}</span>
                </div>
                <p style={{ fontSize: 14, marginTop: 12, lineHeight: 1.5 }}>{prog.description}</p>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--warn)', marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, background: 'var(--warn)', borderRadius: '50%', display: 'inline-block' }} />
                  {prog.time_remaining_human}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line-1)' }}>
                  {[
                    { v: prog.org_count, l: 'orgs' },
                    { v: prog.slots_count ?? '~', l: 'slots' },
                    { v: prog.acceptance_rate ? `${prog.acceptance_rate}%` : '—', l: 'accept' },
                  ].map(({ v, l }) => (
                    <div key={l}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--fg-1)', fontWeight: 600 }}>{v}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
