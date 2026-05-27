---
name: kernel-design-system
description: Brand, voice, and component conventions for kernel/ — a developer-education platform for Indian CS undergrads (DSA + engineering + open-source mentorship prep). Use when designing or coding any kernel/ surface — marketing pages, the signed-in product, decks, docs, or emails.
---

# kernel/ — Design System Skill

You are designing for **kernel/**, a developer-education platform that unifies three pillars under one toolchain:

- **kernel/dsa** — pattern-first DSA practice (the arena)
- **kernel/dev** — engineering craft, language tracks, ship-it projects (the workshop)
- **kernel/oss** — open-source mentorship program prep: GSoC, C4GT, LFX, ESoC, Summer of Bitcoin, Outreachy (the war room)

The audience is CS undergrads in India aiming for paid open-source programs and serious engineering careers. They are technical, time-poor, and allergic to marketing fluff.

## Always read first

Before producing any kernel/ artifact:

1. **`README.md`** — full brand, voice rules, content fundamentals, visual foundations, iconography.
2. **`colors_and_type.css`** — every token. Import it; never invent colors, fonts, or spacing values.
3. **`preview/*.html`** — the canonical specimens for components. Match these exactly.
4. **`ui_kits/landing/index.html`** and **`ui_kits/dashboard/index.html`** — full assemblies showing how components compose. Steal patterns from these before inventing new ones.

If you skip this step the output will look generic and off-brand. The terminal/editorial hybrid is easy to get wrong.

## The non-negotiables

These are the things that make a surface feel like kernel/. If you violate any of them, it's wrong.

- **Dark-first.** `--bg-0` is `#0A0B0D`. Light mode exists but is the exception.
- **One accent.** Electric green `--accent: #39FF7A`. No other accent colors. Semantic colors (warn/danger/info) only when they carry meaning, never for decoration.
- **No gradients on surfaces.** Subtle radial glow under the accent is allowed. Background gradients on hero sections, cards, or buttons are not.
- **Mono for structure, sans for prose.** JetBrains Mono for headings, labels, numbers, code, paths, timestamps, nav. Geist (or the body var) for paragraphs and longer reading. Never mix the wrong one.
- **Sharp radii.** 2/4/8px. Never above 12px. No fully-rounded "pill" buttons except for status pills and tags.
- **Hairline borders, not shadows.** 1px lines from `--line-1..4`. Shadows are reserved for floating elements (modals, dropdowns).
- **Grid lines and ASCII dividers, not decorative shapes.** Section breaks: `// ─────────────`, faint dotted grids, hairline rules. No blobs, no waves, no abstract shapes.
- **Slash as ornament.** The `/` in `kernel/` is the brand. Use it in headings (`compile yourself/`), product names (`kernel/dsa`), and as a visual rhythm device. Always color it `--accent`.
- **Lowercase everything user-facing.** Even brand names of programs in body copy: `gsoc`, `c4gt`, `lfx`, `apache nuttx`. UPPERCASE is reserved for tracking-spaced eyebrows (`// PILLAR_01`).

## Voice

Write like a senior engineer who shipped through GSoC three years ago and remembers what actually mattered.

- Terse. Cut the warm-up. "Compile yourself." not "Welcome to your developer journey!"
- Technical without apology. "Topological sort", "PR etiquette", "mailing list" are first-class words.
- Direct, not motivational. Say what works. Never hype.
- Slightly dry. Wry technical humor welcome; never cute.
- Numbers concrete and specific: `312 PRs merged`, not `hundreds of contributions`.
- Code-aware copy: `> start free`, `kernel init`, `git log --since=1.week`. Embed terminal idioms in CTAs and empty states.

## Layout & rhythm

- **Information density is a feature**, not a bug. Cards pack stats, deadlines, and meta in one view. Don't over-pad.
- **Stats use mono, big and tabular.** `342` not `342`. Pair with tiny uppercase tracked label.
- **Section eyebrows** read like comments: `// 03 · programs`. Use `--accent` for the eyebrow when the section is highlighted, `--fg-3` otherwise.
- **Hero copy** uses the cursor block: `<span class="cur"></span>` (blinking █). Use sparingly — once per page max.
- **Borders for structure.** Stat strips, pillar grids, method steps separate cells with hairlines, not gaps.

## Component patterns to reuse

- Stat strip with hairline-divided cells (`hero .stat-strip` in landing, `.stats` in dashboard).
- Pillar/feature grid with column borders + arrow pointer (`pillar-grid` in landing).
- Program card with colored stripe top, monospace stipend, deadline pill, footer mini-stats.
- Roadmap as numbered list with progress bars + done states (strikethrough + `--fg-3`).
- Heatmap (53×7 grid) for any contribution/activity-over-time visualization.
- Commit-log style activity feed: `<hash> · <message> · <when>` in mono, hash in `--accent`.
- Terminal block for code, empty states, and "show the work" moments.

## Tweaks

If the user toggles Tweaks, expose: accent color (curated 3 swatches: electric green default, ember orange `#FF8B3D`, electric blue `#4DA8FF`), density (compact/comfortable), and pillar-color override per pillar. Do not expose a free color picker.

## What to refuse

- Adding decorative SVG illustrations (blobs, waves, abstract shapes). Use placeholders or real product UI instead.
- Emoji in user-facing copy. The brand has none. ASCII glyphs (`▸ → ✓ ▢ █ /`) only.
- Inventing new fonts. JetBrains Mono + Geist (with body fallback) only.
- Marketing tropes: "Empower your journey", "Unlock your potential", "Built with ❤️". These are bannable.

## Output checklist

Before delivering any kernel/ artifact, verify:

- [ ] Imports `colors_and_type.css` — no inline color hex except as documented exceptions.
- [ ] Headings/labels/numbers use mono. Body prose uses sans.
- [ ] Exactly one accent color used (electric green) — semantic colors only where meaningful.
- [ ] At least one slash `/` flourish on a heading or brand mark.
- [ ] No decorative gradients, no blobs, no rounded-pill buttons (except status pills).
- [ ] Copy is lowercase, terse, technical, free of motivational filler.
- [ ] If it's a long page, at least one ASCII rule or grid-line section break.
