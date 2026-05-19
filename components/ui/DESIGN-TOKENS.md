# Design Tokens — TPC Ministries

Single source of truth for visual and motion language across the public site.
**Do not duplicate tokens.** If you need a new variant, add it here first.

---

## Color Palette

### Navy (primary)
Defined in `tailwind.config.ts` as `navy` scale + legacy alias `tpc-navy`.

| Token | Hex | Usage |
|---|---|---|
| `bg-navy-950` | (dark base) | Page backgrounds for hero / cinematic sections |
| `bg-navy-900` | — | Surface cards on dark sections |
| `bg-navy` / `bg-navy-DEFAULT` | `#1e3a61` | Primary brand navy |
| `bg-navy-800` | — | Gradient mid-tone |
| `bg-navy/10` | — | Subtle navy washes on light sections |

### Gold (accent)
| Token | Hex | Usage |
|---|---|---|
| `text-gold` / `bg-gold` | `#d4b883` | Primary accent — buttons, badges, hover states |
| `text-gold-text` | `#b89740` | WCAG AA-safe gold for text on white |
| `bg-gold/10` to `bg-gold/30` | — | Subtle gold backgrounds (badges, pills) |
| `border-gold/40` | — | Default gold border |
| `hover:bg-gold-300` | — | Lighter gold on hover |

### Supporting
- `cream` `#FAF5EB` — warm light backgrounds
- `tpc-beige` / `tpc-beige-dark` — legacy beige palette
- `bg-secondary`, `text-muted-foreground`, `border-border` — shadcn semantic tokens

---

## Typography

### Font families
- `font-display` — Display headings (serif). Used for h1/h2 in heroes and section titles.
- `font-serif` — Editorial body / pull-quote serif.
- (default sans) — Body text.

### Sizes (shadcn-style)
| Class | When to use |
|---|---|
| `text-display-2xl` / `text-display-xl` | Page heroes |
| `text-display-lg` | Section openers |
| `text-display-md` | Sub-section titles |
| `text-display-sm` / `text-display-xs` | Card titles, callouts |
| `text-body-xl` | Hero subtitles |
| `text-body-lg` / `text-body-md` | Body copy |
| `text-body-sm` | Tags, badges, micro-copy |

### Uppercase eyebrows
Use `text-body-sm font-semibold uppercase tracking-[0.18em]` (or `0.20em`) — common pattern on hero overlines and section eyebrows.

---

## Motion

### Source
- `components/motion/variants.ts` — variant library (fadeIn, fadeInUp, fadeInScale, fadeInLeft, fadeInRight, stagger)
- `components/motion/scroll-reveal.tsx` — `<ScrollReveal>` wrapper for scroll-triggered reveal
- `components/motion/stagger-children.tsx` — stagger container
- `framer-motion` — base library

### `<ScrollReveal>` — default reveal
```tsx
<ScrollReveal>
  <h1>...</h1>
</ScrollReveal>

<ScrollReveal delay={0.1} variant="fade-up">
  <p>...</p>
</ScrollReveal>
```

Variants: `fade-up` (default), `fade-in`, `fade-scale`, `fade-left`, `fade-right`.

Stagger headlines by giving sequential `delay` values of 0.1, 0.2, 0.3 between sibling reveals.

### Hover transforms
Standard:
- `hover:-translate-y-1` — card lift
- `transition-all duration-300` — default timing
- `transition-transform duration-500 group-hover:scale-105` — image zoom
- `transition-transform group-hover:translate-x-0.5` — arrow nudge

### Reduced motion
`useReducedMotion()` in framer-motion auto-disables motion when the OS preference is set. `ScrollReveal` respects this internally — no extra work needed.

---

## Common Components

### Hero section
```tsx
<section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
  <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
  <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
    <ScrollReveal>
      <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">EYEBROW</p>
    </ScrollReveal>
    <ScrollReveal delay={0.1}>
      <h1 className="mb-6 font-display text-display-xl md:text-display-2xl text-white">Headline</h1>
    </ScrollReveal>
    <ScrollReveal delay={0.2}>
      <p className="mx-auto max-w-2xl text-body-xl text-white/70">Subtitle copy.</p>
    </ScrollReveal>
    <ScrollReveal delay={0.3}>
      <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
    </ScrollReveal>
  </div>
  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
</section>
```

### Pill button (filter / chip)
```tsx
<button className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/70 transition hover:border-gold/50 hover:bg-white/10 hover:text-white">
```

### Card (light surface)
```tsx
<div className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-gold/30 hover:shadow-lg">
```

### Card (dark surface)
```tsx
<div className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:border-gold/30 hover:bg-white/10">
```

### Primary CTA button
```tsx
<Button className="h-12 bg-gold px-6 font-bold text-navy-950 hover:bg-gold-300">
  See the recap <ArrowRight className="ml-2 h-4 w-4" />
</Button>
```

### Outline CTA button
```tsx
<Button variant="outline" className="h-12 border-2 border-white/30 bg-white/5 px-6 text-white hover:border-gold/60 hover:bg-gold/10">
```

---

## Voice / Copy

### Prophet voice principles
- Direct, not corporate — "Hear from God" not "Discover your spiritual journey"
- Short headlines, period-ending: "Walk it with us." "What God did in Kenya."
- Eyebrow before headline (uppercase tracking-[0.18em])
- Avoid platitudes ("transformative", "life-changing") — use concrete verbs
- One Bible verse per page max, attributed inline

### Section eyebrows (uppercase, gold)
Examples already in use: "Our Story" · "From the latest mission" · "Mission complete" · "Listen & Learn" · "What's next" · "Hear the Word of the Lord" · "The Word, Released" · "In the Prophet's Voice"

---

## Don'ts

- ❌ Don't use raw hex values in components — use Tailwind tokens (`text-gold` not `text-[#d4b883]`)
- ❌ Don't add new framer-motion variants — extend `variants.ts` first
- ❌ Don't deviate from the hero pattern without ScrollReveal — keeps the site coherent
- ❌ Don't use stock photography on key pages — Kenya 2026 photos are the canonical mission imagery
- ❌ Don't use emojis in body copy — gold check icons or lucide icons only
- ❌ Don't write "Apply Now" / "Limited spots" copy on Kenya pages — the trip is complete

---

*Last updated: 2026-05-19 — Phase 6 design sweep*
