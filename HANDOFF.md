# TPC Ministries Platform — Handoff

> **Last updated 2026-05-19** · Milestone v1.0 shipped + 5 critical hotfixes deployed + site audit completed. **Resume from here** in the next session.

---

## 🚀 What's live on tpcmin.org RIGHT NOW

| URL | What |
|---|---|
| `https://tpcmin.org` | Homepage — prophet hero ("digital age" framing), reels, Kenya cinema, AI widget, full design system |
| `https://tpcmin.org/kenya-2026` | Immersive 14-day recap (master reel, day-by-day, locations, vertical reels, cinema film) |
| `https://tpcmin.org/kenya-2026/gallery` | 50-photo masonry gallery with day filter + lightbox |
| `https://tpcmin.org/kenya` | Planning page reframed past-tense, form locked (410) |
| All other public pages | About, Beliefs, Missions, Teachings, Podcast, Prophecy, Ebooks, Assessments, Stories, Contact, Connect, FAQ |
| AI widget | **Persistent on every public page** (bottom-right), 5-message preview → signup gate, post-signup handoff WORKS now |

**Vercel:** project `gdi-727dc440/tpc-ministries-platform`, prod ID `prj_ilIvBXwHyujDAXvta0xP2NIKz0QO`. Last prod deploy was after commit `69c660d` (Suspense fix).

---

## 📋 What just shipped (session 2026-05-19)

### Milestone v1.0 — 9 phases, all live on tpcmin.org
| # | Phase | Commit |
|---|---|---|
| 1 | Coherence baseline (form locked, countdown removed) | `c1546e4` |
| 2 | ARW→JPG pipeline + 50 curated photos | `1f6db1f` |
| 3 | 14-day recap journey with inline photo galleries | `7e28eeb` |
| 4 | `/kenya-2026/gallery` masonry + lightbox | `3beae81` |
| 5 | Design sweep on /about, /beliefs, /missions | `4aa1628` |
| 6 | Design sweep on 9 more pages + design tokens doc | `0ff4f45` |
| 7 | Persistent AI widget + post-signup handoff | `95f238b` |
| 8 | Analytics events + Streams of Grace devotional verified | `d9fd731` |
| 9 | Launch gates — link audit, Lighthouse, SW prod-only | `603f247` |

### Post-launch fixes (this last turn)
| What | Commit |
|---|---|
| Removed Itete Market video refs + restored nav (moved `app/page.tsx` → `app/(public)/page.tsx`) | `fab3e5f` |
| **Positioning reframe**: "3 nations" → "ministry for the digital age — US + global" across 11 files | `8da3cf3` |
| **5 critical audit hotfixes** (see below) | `(audit batch)` + `69c660d` |

### Critical audit hotfixes (from `/tmp/tpc-audit-report.md`)
1. **Auth callback honors `?next=`** — fixes the AI public→member handoff that was silently broken (every signup was landing on /dashboard regardless of `?next=`). `app/api/auth/callback/route.ts`, `lib/auth.ts`, `app/auth/signup/page.tsx`.
2. **Donation thank-you emails** — Stripe webhook now calls `/api/email/send-donation-receipt` after recordDonation and recordRecurringDonation. Best-effort, never blocks Stripe ack.
3. **Devotional sender domain** — `devotional@tpcmin.com` → `devotional@tpcmin.org` (overridable via `RESEND_DEVOTIONAL_FROM`).
4. **Welcome email URL env var** — `NEXT_PUBLIC_URL` → `NEXT_PUBLIC_SITE_URL` (with fallback `https://tpcmin.org`). No more localhost links in production emails.
5. **Kenya forms locked** — `/api/kenya/{travel-form,health-safety-form,kenya-team-signup}` now return HTTP 410 Gone (verified live on prod).

---

## 🚨 Open items for next session — PRIORITY ORDER

> Sourced from `/tmp/tpc-audit-report.md` (full 1,484-word audit). Read that file first.

### 🔴 P0 — Blocking the conversion path

**1. Verify assessment tables exist in Supabase**
- Live quiz code writes to `assessment_responses` + `member_assessment_results`
- Neither table is in `supabase/schema.sql` or any migration file
- If they don't exist, **every assessment submission is silently failing**
- Action: run `mcp__supabase-tpc__list_tables` or check Supabase dashboard, confirm tables + RLS
- If missing: write migration + apply

**2. Build `/partner/upgrade` route + fix Stripe membership webhook**
- `/partner` page links to `/partner/upgrade?tier=partner` and `tier=covenant` — those routes 404
- Even if they existed, Stripe webhook has no `metadata.type === 'membership'` branch
- The CHECK constraint on `donations.type` blocks `'membership'`, so Partner subs error inserting
- Action: build `/partner/upgrade/page.tsx` → Stripe checkout → webhook branch that updates `members.tier` + `.role` WITHOUT inserting into donations (or relax constraint)

**3. Prayer-request silent failure**
- `/api/prayer/submit` writes to `prayer_requests` and returns. No email, no SMS, no admin notification
- Users have no confirmation their request was received
- Action: wire confirmation email to submitter + admin notification email

### 🟡 P1 — UX paper cuts

**4. Delete the dead second assessment system**
- `/api/assessments/submit-anonymous` + `submit-member` use different tables (`assessments`, `assessment_questions`) + different calculator
- Dead code, never called from the live quiz pages
- Action: delete both routes + remove unused calculator code

**5. Auto-subscribe new members to daily devotional**
- New members aren't inserted into `email_subscriptions` on signup
- The cron at `/api/cron/daily-devotional` has 0 recipients
- Action: in signup flow or DB trigger, default-subscribe new members (with opt-out)

**6. Results page dead buttons**
- "Download PDF Results" + "Share Results" on every assessment results page have no `onClick`
- Action: hide them OR wire them (PDF generation + Web Share API)

**7. Weekly newsletter cron is dead code**
- `/api/cron/weekly-newsletter` exists but is NOT in `vercel.json` crons
- Action: either delete the route OR add to vercel.json

### 🟢 P2 — Polish + performance

**8. Mobile Lighthouse Performance 75 → 90+**
- A11y 96, BP 100, SEO 100 — only Perf needs work
- Optimizations: hero video to AVIF/WebM, defer AskProphetWidget mount until idle, `loading="eager"` only on first photo per gallery
- Action: ~1 session of media + lazy-load work

**9. Edit + publish podcast Episodes 1 & 2**
- Raw camera MP4s + multi-mic WAVs on Transcend drive at `Day 10/podcasts/`
- Decision: ship raw video first OR mix audio + sync? (defer in audit said "v1.1")
- Action: encode raw MP4s for web, build `/podcast/kenya-debrief-ep1` and `-ep2`

**10. Spiritual-gifts dead reference**
- Results page has undefined `spiritualGiftsResults` reference inside unused `renderSpiritualGiftsResults` function (`results/page.tsx:239`)
- Never called, but a latent crash if it ever is invoked
- Action: delete the unused function

---

## 🎯 v1.1 Milestone (DRAFTED, not committed)

File: `~/tpc-ministries-platform/.planning/v1.1-DRAFT-best-site-ever.md`

**8 themes proposed:**
- A: Foundation hardening (close audit gaps above — P0 + P1 items)
- B: Performance + mobile experience (Lighthouse 90+, PWA polish)
- C: Engagement loops (daily devotional auto-subscribe, live alert sitewide interrupter, push notifications, prayer wall)
- D: AI deepening (personalized daily devotional, prophecy archive search, voice replies via ElevenLabs, conversation memory)
- E: Conversion path tightening (analytics dashboard, A/B test infra, donor receipts)
- F: Content velocity (phone-to-publish for teachings, podcast pipeline, auto-share)
- G: Trust signals (Lorenzo + team photos, testimonial pull-quotes, live giving feed)
- H: Multi-language (Spanish, Swahili, French — stretch)

**Open questions before locking v1.1:**
1. Budget for PostHog / ElevenLabs / additional APIs?
2. Spanish + Swahili — real audience demand or aspirational?
3. Live broadcast cadence — Sunday only, daily, special events?
4. Lorenzo's content cadence — record frequency, AI fill-in for off-weeks?

To start v1.1: `/gsd:new-milestone` and use the draft as input.

---

## 🛠️ How to operate

### Run dev server
```bash
cd ~/tpc-ministries-platform
npm run dev -- -p 3004
```
Why port 3004: previous Service Worker caches lingered on :3000/:3001. The dev-mode SW auto-unregister fix is in `components/pwa/pwa-provider.tsx`, but a fresh port avoids any browser-state issues.

### Deploy
```bash
# Preview (Vercel deployment-protected URL)
vercel deploy --yes

# Production (tpcmin.org)
vercel deploy --prod --yes
```

### Re-curate Kenya photos
```bash
bash scripts/curate-kenya-photos.sh                    # all days, 5 per day
bash scripts/curate-kenya-photos.sh --day 14 --per 8   # specific day
bash scripts/curate-kenya-photos.sh --force            # re-encode all
```

### Add a new public page
1. Create `app/(public)/your-page/page.tsx`
2. It auto-inherits Navigation + Footer + AskProphetWidget via `(public)/layout.tsx`
3. Follow the hero pattern in `components/ui/DESIGN-TOKENS.md`
4. Wrap eyebrow + h1 + subtitle in `<ScrollReveal>` with delays 0, 0.1, 0.2

### Sync Vercel env vars from Production to Preview
```bash
# Pull production env to temp file
vercel env pull /tmp/prod-env --environment=production --yes

# Source it, then push each to preview
source /tmp/prod-env
echo "$VAR_NAME" | vercel env add VAR_NAME preview

# Wipe temp
shred -u /tmp/prod-env
```

---

## ⚠️ Gotchas that WILL bite you

1. **Home page lives at `app/(public)/page.tsx`** — NOT `app/page.tsx`. Moving it back removes Navigation + Footer + AskProphetWidget. The `(public)` route group is what wraps them.
2. **Don't have BOTH `app/page.tsx` and `app/(public)/page.tsx`** — Vercel build will fail with `ENOENT page_client-reference-manifest.js`. Pick one.
3. **`useSearchParams()` in a `'use client'` page needs a `<Suspense>` wrapper** in Next.js 14 — otherwise Vercel build fails on prerender. See `app/auth/signup/page.tsx` for the pattern.
4. **Supabase env vars do NOT auto-replicate Production → Preview** on Vercel. Sync manually (script above).
5. **DB is SHARED** with Streams of Grace + Boardroom Prayer Room (project `naulwwnzrznslvhhxfed`). Schema changes affect all three. `/db-safe` enforced.
6. **Service Worker is production-only** (NODE_ENV guard in `pwa-provider.tsx`). If you see "Cannot read properties of undefined (reading 'call')" in webpack.js, that's the SW cache — open Incognito or DevTools → Application → Unregister.
7. **Bash 3.2 on macOS** — no `declare -A`, no `mapfile`. Scripts in repo accommodate this.
8. **`/kenya` is the PLANNING archive**, `/kenya-2026` is the recap — keep them distinct.
9. **Pre-existing TS errors** in `app/(admin)/kenya-command-center/_components/*.tsx` — admin-only, not blocking public builds, but should be cleaned in v1.1.
10. **Date hardcodes** — "April 23 – May 6, 2026" still appears in multiple files. For next mission, grep + sweep.
11. **The Kenya 2026 trip "complete" framing** — locked in 6 places (homepage, footer, kenya page, kenya/give, pack-the-mission, support/[slug]). Don't accidentally regress.

---

## 📁 Critical file paths

### Routing + layouts
| Path | Purpose |
|---|---|
| `app/(public)/layout.tsx` | Wraps Navigation, Footer, **AskProphetWidget** around every public page |
| `app/(public)/page.tsx` | Homepage |
| `app/(public)/kenya-2026/page.tsx` | Recap orchestrator |
| `app/(public)/kenya-2026/_components/` | 8 sub-components |
| `app/(public)/kenya-2026/gallery/page.tsx` | Server-renders day folders |
| `app/(member)/ask-prophet-lorenzo/page.tsx` | Full member chat — consumes `?handoff=1` |

### API routes (the ones you'll edit most)
| Path | Notes |
|---|---|
| `app/api/auth/callback/route.ts` | OAuth + email-confirm callback; **honors `?next=`** (fixed this session) |
| `app/api/ai/ask-prophet-public/route.ts` | Public AI, 5-msg gate, persona from `ai_config` |
| `app/api/stripe/webhook/route.ts` | Donation recording + auto-upgrade to Partner + **thank-you email** (wired this session) |
| `app/api/email/send-donation-receipt/route.ts` | The receipt template — now actually called |
| `app/api/notifications/welcome-email/route.ts` | Fires on signup; env var fixed this session |
| `app/api/cron/daily-devotional/route.ts` | Daily cron 10:00 UTC; sender domain fixed this session |
| `app/api/prayer/submit/route.ts` | **CURRENTLY SILENT** — needs follow-up emails (P0 #3) |
| `app/api/public/kenya-trip/route.ts` | Returns 410 Gone |
| `app/api/kenya/{travel-form,health-safety-form,kenya-team-signup}/route.ts` | All return 410 (fixed this session) |

### Components
| Path | Purpose |
|---|---|
| `components/ai/ask-prophet-widget.tsx` | Floating widget |
| `components/layout/navigation.tsx` | Top nav, `navLinks` array at line 13 |
| `components/layout/footer.tsx` | Footer — "digital age" tagline |
| `components/home/*` | Homepage sections (prophet-hero, reels, kenya-cinema, devotional, kenya-section, etc.) |
| `components/ui/DESIGN-TOKENS.md` | **Read this before adding any new public page** |

### Data + scripts
| Path | Purpose |
|---|---|
| `public/kenya-2026/photos/day-NN/` | 50 curated JPGs |
| `public/videos/kenya/` | 20 mp4s (cinema, highlight, 4 day-N, locations, reels — Itete removed) |
| `scripts/curate-kenya-photos.sh` | ARW→JPG pipeline |
| `lib/analytics.ts` | track() helper for events |

### Planning state
| Path | Purpose |
|---|---|
| `.planning/PROJECT.md` | Project context |
| `.planning/REQUIREMENTS.md` | All v1.0 reqs marked status |
| `.planning/ROADMAP.md` | v1.0 phases |
| `.planning/STATE.md` | Current position |
| `.planning/v1.1-DRAFT-best-site-ever.md` | **Next milestone draft — read first** |
| `/tmp/tpc-audit-report.md` | **Full audit, 1,484 words — read first** |

---

## 🎨 Positioning lock (digital age)

**Locked 2026-05-19** — do not regress:

- ❌ "across Kenya, South Africa, and Grenada" (the old framing limited the audience to those 3 nations)
- ✓ "a prophetic ministry for the digital age — based in the US, with mission work in Kenya, South Africa, Grenada, and a growing global online community"
- ❌ "built for the generation that grew up online" (same limitation)
- ✓ "for the digital age" (covers Gen-Z + millennials + anyone scrolling)
- Stat strip "3 nations" → "US + global"

Applied to: homepage hero subtitle, social-proof strip, footer, app/layout.tsx SEO, json-ld, AI system prompt, giving-cta, lead-capture form, live-section, missions/layout + support page, visit page.

---

## 📊 Vercel env vars status

Synced from Production → Preview this session:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `OPENAI_API_KEY`
- `VAPID_PRIVATE_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

May need to add to Vercel later:
- `NEXT_PUBLIC_SITE_URL` (for welcome email URLs — has fallback `https://tpcmin.org` so safe if missing)
- `RESEND_DEVOTIONAL_FROM` (devotional sender override — defaults to `devotional@tpcmin.org`)
- `NEXT_PUBLIC_GA_ID` (Google Analytics — analytics events fire to it; no-op if missing)

---

## 🔑 Session-end commits

```
69c660d  fix(build): wrap signup useSearchParams in Suspense
(audit)  fix(audit): 4 critical pre-launch hotfixes
8da3cf3  feat(positioning): reframe as "digital age" — US + global
fab3e5f  fix: restore site nav on homepage + remove Itete Market
603f247  docs: Phase 9 — launch gates verified; milestone v1.0 substantially complete
d9fd731  feat(analytics): Phase 8 — conversion path
95f238b  feat(ai): Phase 7 — persistent Ask-Prophet widget + post-signup handoff
0ff4f45  feat(design): Phase 6 — design sweep on 9 public pages + tokens doc
4aa1628  feat(design): Phase 5 — design sweep on /about, /beliefs, /missions
ab1cf74  fix(build): remove dead app/(public)/page.tsx
3beae81  feat(kenya): Phase 4 — /kenya-2026/gallery
7e28eeb  feat(kenya): Phase 3 — extend journey to all 14 days + galleries
1f6db1f  feat(kenya): Phase 2 — ARW→JPG pipeline + curated photos
c1546e4  feat(coherence): Phase 1 baseline
```

---

## 🎯 Next session — start here

**Read in this order:**
1. This file (HANDOFF.md)
2. `/tmp/tpc-audit-report.md` (full audit)
3. `.planning/v1.1-DRAFT-best-site-ever.md` (proposed plan)
4. `.planning/STATE.md` (current position)

**Then pick a path:**
- **Path A — Close audit P0s** (recommended): tackle the 3 P0 items above (assessment tables, partner upgrade + Stripe membership, prayer follow-up). 1-2 sessions of work, unlocks revenue.
- **Path B — Performance push**: Lighthouse 75 → 90+ via hero video re-encode, AI widget defer, image priorities. 1 session.
- **Path C — Launch v1.1 milestone**: `/gsd:new-milestone` using the v1.1 draft as input, then proceed to research/planning/execution.

**Quick command to resume orientation:**
```bash
cd ~/tpc-ministries-platform
cat HANDOFF.md
cat /tmp/tpc-audit-report.md
git log --oneline -15
```

---

*Generated 2026-05-19 at the end of the v1.0 launch + audit + hotfix session.*
