# kernel/

> A developer education platform for Indian CS undergrads who want to master DSA, become strong systems engineers, and crack open-source mentorship programs (GSoC, C4GT, LFX, ESoC, Summer of Bitcoin, Outreachy).

## What this is

`kernel/` is a single platform that unifies three worlds:

1. **`kernel/dsa`** — competitive programming arena. Topic trees, pattern recognition cards, contest calendars, streaks.
2. **`kernel/dev`** — engineering workshop. Language tracks (Go, Rust, C++, Python), systems fundamentals, ship-real-projects pedagogy.
3. **`kernel/oss`** — open source war room. Program trackers, org discovery, proposal libraries, contribution starter kits.

Each pillar has its own "world" — but they live under one coherent visual system: dark-first, terminal-native, editorial in its typography, dense in its information.

## Source materials

**No source materials were provided for this design system.** The brand, name (`kernel/`), color system, typography, voice, and every UI kit screen are an original interpretation built from the brief alone. The brief specified:

- Three pillars (DSA / Dev / Open Source) with detailed feature lists per pillar
- Dashboard component inventory (sidebar nav, roadmap panel, contribution heatmap, notification center, etc.)
- Aesthetic direction: dark-first, terminal/editorial hybrid, monospace headings + geometric sans body, **one** accent color (chose electric green), subtle grid lines, ASCII dividers, commit-log timelines, information-dense

If you have an existing brand, codebase, or Figma, attach it via Import and I'll reconcile this system against it.

## Index

| File / folder | What it is |
|---|---|
| `README.md` | This file. Brand, voice, visual foundations, iconography. |
| `SKILL.md` | Cross-compatible skill manifest (works in Claude Code as an Agent Skill). |
| `colors_and_type.css` | All design tokens: colors, type scale, spacing, radii, shadows, semantic vars. |
| `fonts/` | Webfont files (JetBrains Mono, Geist) — currently CDN-linked; see Typography. |
| `assets/` | Logos (`kernel-mark.svg`, `kernel-wordmark.svg`), brand textures, illustrations. |
| `assets/icons/` | Lucide icon set (CDN-linked) — see Iconography. |
| `preview/` | Design-system preview cards rendered in the Design System tab. |
| `ui_kits/landing/` | UI kit: marketing landing page. Hero, pillars, program cards, footer. |
| `ui_kits/dashboard/` | UI kit: signed-in product dashboard. Sidebar, roadmap, heatmap, problem cards, program tracker. |

---

## CONTENT FUNDAMENTALS

### Voice

`kernel/` talks like a senior engineer who's actually been through GSoC, grinded LeetCode, and shipped a Kubernetes operator — not a marketing team trying to look approachable. The voice is:

- **Terse.** Shorter is better. Cut the warm-up.
- **Technical without apology.** "Big-O", "topological sort", "PR etiquette" are first-class words. Don't soften jargon.
- **Direct, not motivational.** Say what works. Don't hype.
- **Slightly dry.** A wry technical sense of humor is welcome — never cute, never clever-for-its-own-sake.
- **Second person, present tense.** "You write proposals. You ship projects." Not "We help you to learn..."

### Casing

- **lowercase by default** in product chrome, navigation, button labels, tags. (`kernel/dsa`, `solve`, `track`, `merged`)
- **Sentence case** for headlines and body copy.
- **UPPERCASE** is reserved for: section eyebrows (`// PILLAR_01`), key statuses (`OPEN`, `CLOSED`, `MERGED`), ASCII-style metadata.
- **Title Case is forbidden** in product UI. It feels marketing-y. Headlines may use it sparingly in long-form editorial.

### Pronouns

- Address the user as **you**.
- The platform is **kernel/** (lowercase, with trailing slash). Never "Kernel" or "the platform".
- Use **we** sparingly — only when speaking from the team's voice in editorial copy. Most of the time the platform is invisible.

### Emoji

**No emoji.** None. Not in product, not in marketing, not in error states. We use ASCII glyphs (`>`, `*`, `//`, `→`, `±`, `█`) and Lucide icons instead. This is non-negotiable — it's part of why the product feels different.

### Numbers, code, and metadata

- Numbers always Latin numerals: `12 problems`, `7 days`, `$6,600`.
- Money in stipends: `$3,000–$6,600` (en-dash, no space).
- Code snippets, commands, file paths, identifiers, repos, usernames: monospace (`JetBrains Mono`).
- Time deltas in compact form: `7d`, `2h 14m`, `42s`.
- Difficulty: `easy` / `medium` / `hard`. Not "Beginner / Intermediate / Advanced".

### Examples

| Don't write | Write |
|---|---|
| "Welcome to your dashboard! 🎉" | `welcome back, $USER` |
| "Apply for Google Summer of Code today!" | `gsoc 2026 — applications open in 14d` |
| "You've successfully solved 5 problems this week — great job!" | `5 solved this week. streak: 12d.` |
| "Click here to start learning Rust" | `start: rust/00 — hello, ownership` |
| "Our awesome community has helped 1000+ students" | `1,247 contributors. 312 merged PRs. 84 stipends earned.` |

The vibe is: a `man` page, a commit log, and a well-edited technical magazine had a child.

---

## VISUAL FOUNDATIONS

### Color philosophy

Dark-first. **One accent: electric green** (`#39FF7A`, the kind of green you see in a properly-themed terminal — slightly more saturated than `#00FF00`, slightly less acid than neon). Amber (`#FFB347`) is permitted **only** for time-sensitive states: deadline countdowns, contest-soon pills, expiring stipends. Red (`#FF5C5C`) is reserved for destructive/error states. Everything else is grayscale.

The background is not pure black. We use `#0A0B0D` (near-black with a faint blue undertone) as the base — pure black feels cheap on OLEDs and creates harsh edges. Surfaces step up in 3-4% lightness increments.

Imagery, when used, is monochromatic or duotone — green-on-black or grayscale with high grain. Never warm-toned hero shots. Never stock photography of people in offices.

### Typography

- **Display / headings:** `JetBrains Mono` (700, 500). Monospace gives every heading a code-editor weight. Tracking is tight (`-0.01em`) at large sizes.
- **Body / UI:** `Geist` (400, 500, 600) — sharp geometric sans, designed for interfaces. Replaces the Inter cliché. Tracking is normal at body sizes, slightly negative (`-0.005em`) at headlines.
- **Mono inline:** `JetBrains Mono` 400 for code, paths, identifiers, metadata.
- **No serifs.** Editorial feel comes from typographic rhythm and rule-line dividers, not from a Fraunces revival.

> **Substitution flag:** No font files were provided. Both JetBrains Mono and Geist are loaded from Google Fonts CDN. If the brand has licensed cuts, drop the `.woff2` files in `fonts/` and update `colors_and_type.css`.

Type scale is a modular 1.25 (major third) starting at 14px, with display sizes that break the scale (48, 64, 96) for editorial moments.

### Spacing & layout

- **4px base unit.** All spacing is a multiple of 4. The scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128`.
- **Information-dense.** Default padding inside a card is `16px`, not `24-32px`. Default row height for list items is `40px`.
- **Subtle grid lines everywhere.** A 1px line at `rgba(255,255,255,0.06)` separates sections, defines card edges, and runs as faint vertical column rules through long-form layouts.
- **ASCII dividers** between major sections: `// ───────────────────────────────`. Used in editorial / long-form copy, not in dense UI.
- Layouts are wide and dense — 1280–1440px max content width on the dashboard, 1200px on landing. We do not center 600px columns of marketing copy.

### Backgrounds

- **No gradients.** Dark surfaces, with optional 1px noise texture at 4% opacity for grain.
- **No hand-drawn illustrations.**
- **Optional grid background** on landing hero — 1px lines at 32px intervals, `rgba(255,255,255,0.04)`. Like graph paper for code.
- Imagery, when present, is full-bleed monochrome or duotone — never floating mid-page with whitespace around it.

### Borders, radii, shadows

- **Border radius:** `0px` for editorial / hero blocks, `4px` for cards and inputs, `2px` for chips and pills, `999px` for avatars and the rare circular badge. **We do NOT use 12px+ rounded corners.** Sharpness is part of the brand.
- **Borders:** 1px, `rgba(255,255,255,0.08)` default, `rgba(57,255,122,0.4)` on focus, `rgba(255,255,255,0.16)` on hover.
- **Shadows:** Almost none. We rely on borders and surface elevation (background lightness step) instead. The exception: a single soft inner glow on focused inputs (`inset 0 0 0 1px var(--accent)`).

### States

- **Hover:** Border lightens to `rgba(255,255,255,0.16)`. Optional 1px green underline on links. Background lifts +2% on cards (`#11141A` → `#161A21`). No scale transforms.
- **Active / press:** Background lifts another +2%. Borders go solid green for primary actions.
- **Focus:** 1px green inner ring, no outer glow.
- **Disabled:** Foreground at 30% opacity. No greyed-out backgrounds — we want the structure visible.
- **Loading:** A blinking block cursor `█` or a 1-char spinner cycle (`|`, `/`, `-`, `\`) — never a circular spinner gif.

### Animation

- **Fast and mechanical.** Default duration `120ms`, easing `cubic-bezier(0.2, 0, 0, 1)`.
- **Hover transitions:** border-color, background-color, opacity. Never transform, never scale.
- **Page transitions:** none. The product loads instantly, like switching files in an editor.
- **One playful exception:** the blinking cursor (`█`) in headlines and empty states. 530ms on, 530ms off, no easing — a hard square wave, like a real terminal cursor.
- **No bouncy springs. No fades over 200ms. No parallax.**

### Transparency, blur, glass

- **No glassmorphism.** No backdrop-filter blur on surfaces. We are not iOS.
- Transparency is used only for: borders, hover overlays, and the dimmed state of disabled elements.

### Cards

A `kernel/` card is:
- Background `#11141A` (one step up from page bg)
- 1px border `rgba(255,255,255,0.08)`
- 4px radius
- 16px padding
- A 12px monospace eyebrow line at top (`// program_01`, `// arrays/two_pointer`)
- Optional accent: 1px left border in green when "active" or "in progress"
- No shadow.

### What we DO NOT do

- Purple/blue SaaS gradients
- Glassmorphism, backdrop blur, frosted panels
- Emoji
- 12px+ rounded corners
- Drop shadows on cards
- Scale-on-hover, bouncy springs, parallax
- Marketing-team adjectives ("amazing", "awesome", "powerful", "delightful")
- Stock photography of teams, offices, handshakes
- Inter / Roboto / system fonts
- Title Case in product UI

---

## ICONOGRAPHY

### System

We use **Lucide** as the icon set — sharp geometric strokes, designed to feel like vector schematics rather than friendly icons. Lucide is loaded via CDN (`https://unpkg.com/lucide@latest/dist/umd/lucide.js`); SVGs are rendered inline so we can color them with `currentColor`.

> **Substitution flag:** Lucide is the closest match to the brief's "terminal/editorial" aesthetic out of CDN-available sets. If you want a custom icon language (rectangular, ASCII-derived, etc.), this is the place to swap.

### Sizing & weight

- Default size: **16px** in dense UI (sidebar, table rows, chips).
- **20px** in card headers, buttons, primary nav.
- **24px** in section headers and feature blocks.
- Stroke weight is **always 1.5px** at 16-20px sizes. Never use Lucide's filled variants.

### Color

Icons inherit `currentColor`. They take the same color as adjacent text. The accent green is reserved for icons indicating active / live / unlocked state (a green play arrow, a green dot for "online"). Status icons use semantic colors (amber clock for "deadline", red for "blocked").

### ASCII glyphs as icons

A `kernel/` signature: we use ASCII characters as inline iconography in editorial copy and dense lists.

| Glyph | Meaning |
|---|---|
| `>` | call-to-action, "next", command prompt |
| `→` | navigation, "leads to" |
| `±` | range, ± stipend |
| `//` | comment, eyebrow, metadata |
| `█` | cursor, progress fill |
| `▓ ▒ ░` | progress states (filled / partial / empty) |
| `*` | required, important |
| `[ ]` / `[x]` | checkbox states |
| `┌─┐ │ └─┘` | ASCII box-drawing for callouts |

### Emoji

**Not used.** Anywhere. Ever.

### Logos

- `assets/kernel-mark.svg` — square mark, just `k/` in JetBrains Mono Bold inside a 1px-bordered square.
- `assets/kernel-wordmark.svg` — full `kernel/` wordmark, monospace.

Logos are colorless — they take `currentColor`. Never apply gradients. Never rotate, skew, or distort.
