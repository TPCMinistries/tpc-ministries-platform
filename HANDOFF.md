# TPC Ministries Platform — Handoff

> **As of 2026-05-19** · After milestone v1.0 (Kenya 2026 Recap + Gen-Z Engagement Push) shipped to production. This document captures the live state of the site, the work that just landed, and what comes next.

---

## What's live on tpcmin.org

**Production:** `https://tpcmin.org` (Vercel project `tpc-ministries-platform`, team `gdi-727dc440`)

### Public surface — coherent, motion-rich, prophet-voiced
- `/` — homepage with prophet hero, vertical reels, Kenya cinema, live section, devotional (Streams of Grace), ebooks, Kenya planning section, giving CTA, assessments, connect
- `/kenya-2026` — immersive 14-day recap (master reel, day-by-day journey with inline photo galleries, locations, vertical reels, 5:47 cinema film, what's-next)
- `/kenya-2026/gallery` — masonry grid of 50 curated photos with day filter + keyboard-navigable lightbox
- `/kenya` — old planning page now reframed as past-tense recap front door (application form returns HTTP 410)
- `/about`, `/beliefs`, `/missions`, `/teachings`, `/podcast`, `/prophecy`, `/ebooks`, `/assessments`, `/stories`, `/contact`, `/connect`, `/faq` — all swept to new design system (prophet voice, navy/gold, ScrollReveal motion)

### Prophet Lorenzo AI
- Public widget on EVERY public page (bottom-right floating button)
- 5-message preview before signup gate
- Post-signup handoff: conversation persists into `/ask-prophet-lorenzo` member chat
- Backed by `gpt-4o-mini` via `OPENAI_API_KEY`, persona pulled from `ai_config` table

### Analytics (Google Analytics via gtag)
- Events wired in `lib/analytics.ts`: `ai_chat_open`, `ai_chat_message`, `ai_chat_limit_reached`, `ai_chat_handoff_signup`, `kenya_recap_view`, `give_click`
- Set `NEXT_PUBLIC_GA_ID` env var to activate

### Service Worker
- Production-only registration (NODE_ENV gate in `pwa-provider.tsx`)
- Dev-mode auto-unregisters stale SWs and clears caches (prevents the "stale chunks" crash we hit twice this session)

---

## Architecture (one-page summary)

| Layer | Tech | Notes |
|---|---|---|
| Framework | Next.js 14.2 (App Router) | NOT 16 yet — kept on 14 for stability |
| Styling | Tailwind + shadcn/ui | Tokens documented at `components/ui/DESIGN-TOKENS.md` |
| Motion | framer-motion via `<ScrollReveal>` wrapper | Variants in `components/motion/variants.ts` |
| DB | Supabase project `naulwwnzrznslvhhxfed` (TPC Ministries) | SHARED with Streams of Grace + Boardroom Prayer Room — HIGH-sensitivity |
| MCP | `supabase-tpc` (global) or `supabase` (in dir) | Use for read/list ops; `/db-safe` enforced for any DML |
| Auth | Supabase Auth | `/auth/signup?next=…` honors return URL |
| Payments | Stripe | Configured but flows partially wired (see audit) |
| Email | Resend | Templates exist but lifecycle not fully orchestrated |
| SMS | Twilio | Configured, usage limited |
| Hosting | Vercel (team `gdi-727dc440`) | Production deploy: `vercel --prod` |

### Critical file paths
- `app/(public)/layout.tsx` — wraps Navigation, Footer, AskProphetWidget around every public page. **The widget lives here, not on individual pages.**
- `app/(public)/page.tsx` — homepage (was moved here from `app/page.tsx` to fix missing nav)
- `app/(public)/kenya-2026/page.tsx` — recap orchestrator
- `app/(public)/kenya-2026/_components/` — 8 sub-components (hero, stats, master-reel, day-journey, locations, vertical-reels, cinema-film, whats-next)
- `app/(public)/kenya-2026/gallery/page.tsx` — server-renders day folders from `/public/kenya-2026/photos/day-NN/`
- `components/ai/ask-prophet-widget.tsx` — the floating widget
- `app/api/ai/ask-prophet-public/route.ts` — public AI endpoint, 5-msg gate, persona from `ai_config`
- `app/(member)/ask-prophet-lorenzo/page.tsx` — full member chat; reads `?handoff=1` to consume public conversation
- `app/api/public/kenya-trip/route.ts` — POST returns 410 Gone (trip closed)
- `scripts/curate-kenya-photos.sh` — ARW→JPG pipeline (qlmanage→sips, no dcraw needed)
- `lib/analytics.ts` — track() helper, no-ops if no gtag
- `.planning/PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md` — GSD planning state

### Photo + video assets
- `/public/videos/kenya/` — 20 mp4 files (cinema, highlight, 4 day-N, location-specific, 6 reels)
- `/public/kenya-2026/photos/day-NN/` — 50 curated JPGs (Days 1-14)
- Master archive: 3.6 TB Transcend drive at `/Volumes/Transcend/` (Day 01–14 raw, Insta360, DaVinci Resolve project)

---

## What just shipped (milestone v1.0 — 9 phases)

| Phase | What | Commit |
|---|---|---|
| 1 | Coherence baseline — no stale "upcoming trip" copy, form locked, public/member route hygiene | `c1546e4` |
| 2 | ARW→JPG pipeline + 50 curated photos | `1f6db1f` |
| 3 | 14-day journey on `/kenya-2026` with inline photo galleries | `7e28eeb` |
| 4 | Standalone gallery page with masonry + filter + lightbox | `3beae81` |
| 5 | Design sweep on `/about`, `/beliefs`, `/missions` | `4aa1628` |
| 6 | Design sweep on 9 remaining pages + DESIGN-TOKENS.md | `0ff4f45` |
| 7 | Persistent AI widget + post-signup handoff | `95f238b` |
| 8 | Analytics events + Streams of Grace devotional link verified | `d9fd731` |
| 9 | Launch gates — link audit ✓, Lighthouse, SW production-only | `603f247` |
| Fix | "Digital age" positioning across 11 files | `8da3cf3` |
| Fix | Restore nav after `app/page.tsx` move + remove Itete Market | `fab3e5f` |
| Fix | Removed dead `app/(public)/page.tsx` that blocked Vercel build | `ab1cf74` |

---

## Known open items

### From milestone v1.0
- **LAUNCH-01**: Mobile Lighthouse Performance 75/85. A11y 96/95 ✓, Best Practices 100 ✓, SEO 100 ✓. Perf shortfall from media weight (hero video, 50 photos). Optimization candidates: hero video AVIF/WebM, defer AI widget mount, `loading="eager"` only first photo per gallery.

### Surfaced by user post-launch (2026-05-19)
- **Positioning**: "3 nations" framing replaced with "ministry for the digital age" — shipped this session (commit `8da3cf3`)
- **Assessments**: User asked "do they actually work?" — see audit report `/tmp/tpc-audit-report.md`
- **Funnels**: Signup, give, AI handoff, partnership — audit report covers each
- **Nurturing**: Welcome email, devotional, prayer follow-up, donor thank-you, SMS, member lifecycle — audit covers

### Carried into next milestone (v1.1)
- Podcast Eps 1 & 2 from Day 10 (raw camera MP4 + multi-mic WAVs) — not yet edited, deferred from v1.0
- AI-powered daily devotional (member-side) — Streams of Grace covers this externally for now
- Insta360 360° panoramic player — 169 GB available
- Bulk ARW conversion (~2,800 photos) — only top 50 curated so far
- Mobile performance optimizations

---

## How to operate the site

### Run dev
```bash
cd ~/tpc-ministries-platform && npm run dev -- -p 3004
```
Why 3004: previous sessions left service worker registrations on :3000/:3001 that cached broken chunks across rebuilds. The PWA provider auto-unregisters stale SWs in dev now, but using a new port avoids any lingering Chrome state.

### Deploy
```bash
# Preview (shareable Vercel URL, no production impact)
vercel deploy --yes

# Production (replaces tpcmin.org)
vercel deploy --prod --yes
```

### Re-curate Kenya photos
```bash
# Default: 5 photos per day, all days
bash scripts/curate-kenya-photos.sh

# Specific day, more per day, force re-encode
bash scripts/curate-kenya-photos.sh --day 14 --per 8 --force
```

### Add a new public page
1. Create `app/(public)/your-page/page.tsx`
2. It inherits Navigation, Footer, AskProphetWidget automatically via `(public)/layout.tsx`
3. Follow the hero pattern in `components/ui/DESIGN-TOKENS.md`
4. Use `<ScrollReveal>` around eyebrow + h1 + subtitle with delays 0, 0.1, 0.2

### Update Vercel env vars
- Local: `.env.local` (gitignored)
- Vercel: `vercel env ls` to view, `vercel env add VAR_NAME preview` to add
- The session's env-sync script in commit `8da3cf3` history shows the pattern for copying production → preview

---

## Where to find things

| You want... | Look here |
|---|---|
| Day-by-day Kenya content | `app/(public)/kenya-2026/_components/day-journey.tsx` (DAYS array) |
| Gallery photos | `public/kenya-2026/photos/day-NN/` |
| AI persona / system prompt | `app/api/ai/ask-prophet-public/route.ts` (public) + `app/api/ai/prophet-lorenzo/route.ts` (member) |
| AI configuration in DB | `ai_config` table — `ai_name`, `personality_traits`, etc. |
| Nav links | `components/layout/navigation.tsx` (navLinks array, line 13) |
| Footer links | `components/layout/footer.tsx` |
| Design tokens / hero pattern | `components/ui/DESIGN-TOKENS.md` |
| Tailwind config | `tailwind.config.ts` (navy + gold scales) |
| Motion variants | `components/motion/variants.ts` |
| Analytics events | `lib/analytics.ts` |
| Planning state | `.planning/PROJECT.md`, `STATE.md`, `REQUIREMENTS.md`, `ROADMAP.md` |
| Audit report | `/tmp/tpc-audit-report.md` (read-only, regenerate by re-running the audit) |

---

## Things to know that will bite you

1. **The home page is at `app/(public)/page.tsx`** — NOT `app/page.tsx`. Moving it back breaks the nav. The `(public)` route group is what gives it Navigation, Footer, and the AskProphet widget.
2. **Don't add a second `app/page.tsx`** — Vercel build will fail with `ENOENT page_client-reference-manifest.js` (we hit this once, fixed in `ab1cf74`).
3. **Supabase env vars must be set per-environment in Vercel** — Production vars don't auto-apply to Preview. Sync via `vercel env pull --environment=production` then push to preview.
4. **The DB is SHARED** with Streams of Grace + Boardroom Prayer Room. Any schema change affects all three. Treat any DML as a /db-safe operation.
5. **Service Worker can cache stale chunks in dev** — fixed via NODE_ENV guard in `components/pwa/pwa-provider.tsx`, but if you see "Cannot read properties of undefined (reading 'call')" in webpack.js, that's the cache — open Incognito or unregister SW.
6. **Local bash is 3.2** (macOS default) — no associative arrays or `mapfile`. The `curate-kenya-photos.sh` script accommodates this.
7. **The /kenya page is the PLANNING archive**; **/kenya-2026 is the recap** — keep them distinct. Don't merge or redirect.
8. **The 6 Stripe/Resend env vars existed only on Production** until this session — they're now also on Preview.
9. **`pre-existing TypeScript errors`** in `app/(admin)/kenya-command-center/_components/*.tsx` (Set iteration, missing Participant fields, undefined `updateField`) — they're admin-only routes, not blocking public builds, but should be cleaned up.
10. **The Kenya 2026 trip dates are HARDCODED** in many places (April 23 – May 6, 2026). For the next mission, do a `grep -rn "April 23"` sweep.

---

## Next session priorities

See `.planning/STATE.md` "Open Follow-ups" and the audit report at `/tmp/tpc-audit-report.md`.

**My recommended order (post-audit):**
1. Fix any 🚨 BROKEN items from the audit (assessments, funnels, nurturing)
2. Wire missing nurture flows (welcome email, donor thank-you, daily devotional)
3. Performance pass (hero video, image priorities, AI widget defer-mount)
4. Edit + publish podcast Eps 1 & 2 (raw assets on Transcend drive at `Day 10/podcasts/`)
5. New milestone v1.1: AI deepening (personalized daily devotional, prophecy archive search)

---

*Generated 2026-05-19 by Claude at the end of milestone v1.0 deploy session.*
