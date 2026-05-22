# TPC Ministries Platform — Handoff

> **Last updated 2026-05-22 (session 6 — Kenya archive + impact page + advisor cleanup)** · v1.0 audit punch list 100% closed across 6 sessions. **35 local commits ready to ship, gated on the force-push from your terminal.** Supabase advisor: 175 → 69 lints (-60%), ERROR-level 8 → 1 (intentional). Resume from here.

## 🚀 First thing to do in the next session

```
cd ~/tpc-ministries-platform && git push --force-with-lease origin main
```

This pushes 35 commits (the entire audit closeout + Stripe catalog + RLS lockdowns + video compression + Kenya archive + `/kenya-2026/impact` page). The DB migrations are already applied to live via MCP; the push just gets the code in sync. My session hook hard-blocks force-push to main; only your terminal can do it.

Once it lands, verify in Vercel deploy logs that the build succeeds, then continue from one of the open threads below.

---

---

## ⚡ Session 6 highlights (2026-05-22 — Kenya archive + advisor cleanup)

Kenya 2026 retired post-trip + the `/kenya-2026/impact` aggregate page shipped + the function-EXECUTE lockdown actually took effect.

**Phase A — Retire Kenya 2026 funnels** (`4cafcee`)
- `next.config.mjs`: 10 permanent 308 redirects from `/kenya/{give, health-safety, live, pack-the-mission, partner-info, pay, support, support/:slug, team, travel}` → `/kenya-2026` (or `/giving` for the donate route). Search engines + cached bookmarks land on the recap instead of dead funnels.
- `/api/kenya/pack-the-mission/pledge` returns HTTP 410 Gone.
- Dropped 2 SECURITY DEFINER views (`kenya_trip_fundraising_public`, `kenya_supply_pledge_stats`) — closed 2 of the 3 ERROR-level advisor items.
- Added ARCHIVE comments to all 42 `kenya_*` tables with PII guidance for participant data.
- `/admin/kenya-command-center` shows a read-only archive banner so admins know the trip is complete + data is canonical historical record.

**Phase B — `/kenya-2026/impact` aggregate page** (`4cafcee`)
- Storytelling-led page: hero ("Kingdom imprint") → big-number grid → 5 service-track cards → 2 conference spotlights → "Kenya was the first, not the last" CTA → links to `/giving` + `/connect` for the next mission.
- Stats locked from kenya_trip_* queries (no live DB fetch since trip is past): 14 servants, 5 service tracks (ministry/healthcare/education/business/media), 14 days, 28 conference sessions, 2 conferences (Nairobi Apr 24 + Mombasa May 3), 4 mission bases, 27 applications, 21 waitlist, 8 supply funds.
- **No PII** — participant-quote section is a documented TODO awaiting consent re-confirmation with the 23 alumni.
- Linked from `KenyaWhatsNext` on the main `/kenya-2026` recap (also fixed that component's stale `/kenya/give` link → `/giving`).

**Phase C — Mission-Trips infrastructure scoped for v1.1** (`bec9a9f`)
- Added Theme I to `.planning/v1.1-DRAFT-best-site-ever.md` (~6-8h scope): `/missions` public hub, trip-agnostic `/admin/trips/[trip-id]` admin reusing existing `kenya_trip_*` tables (they already have `trip_id` FKs — name stays for now to avoid massive churn), templated public trip pages, per-trip impact pages.
- Kenya being a regular rhythm = good ROI for this infrastructure investment.

**Advisor cleanup — function EXECUTE actually revoked** (`f73546d` + `16d9206`)
- First attempt revoked from `anon, authenticated` directly — didn't take effect (both inherit EXECUTE via `PUBLIC` role membership). `has_function_privilege()` showed unchanged.
- Fix: revoke from `PUBLIC`, grant explicit EXECUTE to `service_role`. Re-granted to `authenticated` on 3 RLS helpers (`is_admin`, `is_tpc_admin`, `current_user_has_role`) so Kenya admin + member staff-update policies still evaluate.
- Net: 23 SECURITY DEFINER functions locked to service_role; `check_email_exists` (signup form RPC) stays public.

**Advisor scoreboard across the journey:**

| | Start of audit | End of session 6 |
|---|---|---|
| Total lints | 175 | 69 |
| ERROR-level | 8 | 1 (intentional — `conversation_participants`) |
| `function_search_path_mutable` | 61 | 0 |
| `anon_security_definer_function_executable` | 24 | 1 (check_email_exists, intentional) |
| `authenticated_security_definer_function_executable` | 24 | 4 (3 RLS helpers + check_email_exists, intentional) |
| `rls_disabled_in_public` | 11 | 1 (intentional) |

## ⚡ Session 5 highlights (2026-05-21 — shipping the audit)

Final pre-push hardening + the actual ship of everything from sessions 1–4:

1. **Compressed timeline-2.mp4** (122 MB → 15 MB) so it fits under GitHub's 100 MB hard limit. Re-encoded at h.264 CRF 32 + 720px width + AAC 96k. **Stripped the original 122 MB blob from git history via `git filter-repo --strip-blobs-bigger-than 100M`.** Backup tag at `backup/pre-filter-repo-2026-05-20`.
2. **Compressed 6 more referenced videos** (day-11/13/12/cinema/reel-033/video-03) from 272 MB → 143 MB (~129 MB saved). Deleted 5 unreferenced .mp4s (v5, teaser-01, teaser-02, video-01, video-02). Total repo size: 549 MB → 228 MB. All remaining videos under GitHub's 50 MB warning threshold.
3. **Revoked EXECUTE on 23 SECURITY DEFINER functions** from PUBLIC role (anon + authenticated inherit via PUBLIC). 48 advisor warnings (24× anon + 24× authenticated) reduce to ~3 (just check_email_exists, which is needed for the signup form). The first revoke attempt used `FROM anon, authenticated` which didn't take — both inherited via PUBLIC. Fixed in follow-up migration. Re-granted EXECUTE to authenticated on 3 RLS helpers (is_admin, is_tpc_admin, current_user_has_role) so Kenya admin policies + member staff-update policy keep evaluating.
4. **Audit-closeout commits + Stripe + RLS work from sessions 1–4 still pending push** (origin/main is at the pre-audit `6f1feda`; my local has 30+ rewritten-history commits ready). Once pushed, all DB migrations already applied via MCP take effect site-wide.

**Open advisor follow-ups** (not security-critical):
- `auth_leaked_password_protection` (1) — toggle HIBP password check in Supabase Auth dashboard
- `public_bucket_allows_listing` (1) — Ebooks + tpc-media intentionally public; bucket listing flag is low risk but can be tightened in Storage settings
- `rls_policy_always_true: 44` — mostly intentional public-read on reference tables, would need per-policy review
- `rls_enabled_no_policy: 17` — RLS-on but no policies = service-role only; defensive by default, usually OK

## ⚡ Session 4 highlights (2026-05-20, later)

After session 3, knocked out the non-Stripe punch list:
1. **Personal prophecy view fixed at schema level** — page was querying `prophecy_type`, `user_id`, `status` (none exist on the prophecies table). Rewrote queries to use `type`, `recipient_id` (FK → members.id, so the page now looks up member.id first), and `published=true`. Added 4 missing UI columns (themes, audio_url, video_url, is_featured) as nullable so the rich UI can render once content exists.
2. **Weekly newsletter cron wired up** — the substantial `/api/cron/weekly-newsletter` (AI summary, batched send, campaign logging) was sitting cold. Added to `vercel.json` on Sundays 14:00 UTC, plus fixed its sender domain bug (`newsletter@tpcmin.com` → `.org`, with `RESEND_NEWSLETTER_FROM` env override).
3. **Pinned `search_path` on 61 SECURITY DEFINER functions** to `pg_catalog,public` — preempts schema-shadowing attacks. Largest remaining WARN category cleared.
4. **Preconnect hints** for Supabase + Stripe.js added in the root layout — saves DNS+TLS on first auth/donation hit.

Supabase advisor state: **175 → 114 lints (-35%)**, ERRORs unchanged at 3 (all intentional). WARN `function_search_path_mutable: 61 → 0`.

## ⚡ Session 3 highlights (2026-05-20)

Building on the audit closeout, this session:
1. **Created proper Stripe products + prices** for Partner ($50/mo, $500/yr) + Covenant Partner ($150/mo, $1500/yr) in the unified PC LLC test account `acct_1PaRTgIwAPnWjXPH`. Test-mode price IDs (`price_1TYz9f…`, `price_1TYzAS…`, `price_1TYzBX…`, `price_1TYzDb…`) are documented in `lib/membership/tiers.ts`. Live-mode prices need to be created when going to live mode; checkout reads them from env vars `STRIPE_PRICE_TPC_PARTNER_{MONTHLY,ANNUAL}` and `STRIPE_PRICE_TPC_COVENANT_{MONTHLY,ANNUAL}`. Falls back to inline `price_data` if env vars unset, so dev/preview never breaks.
2. **Plugged a P0 SECURITY DEFINER view leak.** `kenya_trip_participant_status` granted SELECT (and INSERT/UPDATE/DELETE!) to anon, ran SECURITY DEFINER, exposing email/phone/passport/payment fields for 23 trip participants to anyone with the publishable anon key. Migration `20260519_security_definer_views` converted 5 sensitive views to INVOKER + revoked all client grants; kept the 2 in-use public views (`kenya_supply_pledge_stats`, `kenya_trip_fundraising_public`) as DEFINER but SELECT-only.
3. **Performance pass** — `AskProphetWidget` is now lazy-loaded via `next/dynamic` + `requestIdleCallback` (framer-motion + chat state off the LCP path); below-fold videos switched from `preload="metadata"` to `preload="none"` (saves 5–6 metadata fetches on every public page).
4. **Deleted 326 lines of dead assessment-results code** (renderSpiritualGiftsResults, renderSeasonalResults, oldMockData, GiftResult interface). All unreferenced; the page renders from the live `result` object.

**Supabase advisor state:** ERROR-level lints 8 → 3. The 3 remaining are intentional:
- `kenya_supply_pledge_stats` + `kenya_trip_fundraising_public` use SECURITY DEFINER as their column-filter (the underlying `kenya_trip_participants` doesn't have public-read RLS, so DEFINER is how anon sees only the safe columns)
- `conversation_participants` is intentionally RLS-disabled per its table comment ("access controlled at application level")

## ⚡ Audit closeout (prior session, 2026-05-19)

The original `/tmp/tpc-audit-report.md` punch list (now at `.planning/AUDIT-2026-05-19.md`) is **fully closed**. Status of every item:

| # | Item | Status | Commit |
|---|---|---|---|
| 1 | Auth callback honors `?next=` | ✅ | `f8413ed` |
| 2 | Donation thank-you email wired | ✅ | `f8413ed` + `af82332` (the webhook insert it depended on was also broken — fixed) |
| 3 | `/partner/upgrade` route exists | ✅ | `4dcf301` |
| 4 | Membership Stripe webhook routes correctly | ✅ | `4dcf301` |
| 5 | Assessment tables (`assessment_responses`, `member_assessment_results`) exist with correct columns + RLS | ✅ | `4dcf301` (created table that didn't exist + added 12 missing columns) |
| 6 | Prayer-request confirmation + admin notification emails | ✅ | `4dcf301` |
| 7 | Devotional sender domain + auto-subscribe | ✅ | `f8413ed` (domain) + DB trigger `auto_subscribe_new_member` already wired (audit was wrong about this) |
| 8 | Welcome email URL env var (and 11 other call sites) | ✅ | `af82332` (centralized in `lib/base-url.ts`) |
| 9 | Delete dead assessments dual-system | ✅ | `6ed18a0` (removed all 9 `/api/assessments/*` routes — zero callers) |
| 10 | Kenya forms locked at 410 | ✅ | `f8413ed` |
| bonus | Dead PDF + Share buttons on results page | ✅ | `af82332` (PDF removed, Share wired to navigator.share + clipboard fallback) |

### Newly-discovered schema-drift bombs (NOT in original audit) — also fixed

- **`donations` webhook was inserting columns that don't exist.** The table is `(member_id, amount, currency, stripe_payment_intent_id, donation_type [one_time|recurring], designation, is_anonymous, status [succeeded|pending|failed], fund_id, is_recurring)` — completely different from what the webhook wrote (`type`, `frequency`, `user_id`, `donor_email`, `donor_name`, `stripe_session_id`, `status='completed'`, `notes`). **Every donation that came through was silently failing the insert.** Webhook rewritten in `af82332`. Donor name/email stays in Stripe (canonical for receipts) — passed in-process to the receipt email.
- **`assessment_responses` table did not exist** and `member_assessment_results` was missing 12 columns the code inserted. Created/extended in `4dcf301`.
- **`NEXT_PUBLIC_URL` was referenced in 12 places** but never set in prod. robots/sitemap/RSS fell back to wrong domain (`tpcministries.com`); two notification routes fell back to `localhost:3000`. Centralized in `lib/base-url.ts` in `af82332`.
- **11 PII-bearing tables had RLS disabled.** Supabase advisor `rls_disabled_in_public` is now 0 (excluding `conversation_participants`, which is intentionally app-level-controlled per its table comment). Coverage:
  - `donations` — own member + admin
  - `admin_notes` — admin only
  - `member_subscriptions` — own member + admin (also added `tier_slug`, `billing_cycle`, etc.)
  - `membership_tiers`, `seasons` — public read + admin all
  - `member_seasons` — own member + admin
  - `prophecies` — published-only public SELECT + admin all
  - `documents`, `prayer_responses`, `prayer_supporters` — admin only (unused in app code)

### Migrations applied (TPC ministries DB `naulwwnzrznslvhhxfed`)

1. `20260519_fix_assessment_tables` — created `assessment_responses`, added 12 columns to `member_assessment_results`, permissive UUID-token RLS
2. `20260519_membership_subscriptions` — added `tier_slug`/`billing_cycle`/`user_id`/`stripe_customer_id`/`canceled_at` to `member_subscriptions`, RLS
3. `20260519_donations_rls_lockdown` — donations: own + admin
4. `20260519_safe_rls_lockdown` — admin_notes, membership_tiers, seasons, member_seasons
5. `20260519_pii_rls_lockdown` — prophecies, documents, prayer_responses, prayer_supporters

### Code additions worth knowing

- **`lib/membership/tiers.ts`** — single source of truth for membership tier slugs + prices (partner $50/$500, covenant $150/$1500). Used by both `/api/stripe/create-checkout` and `/partner/upgrade`.
- **`lib/base-url.ts`** — `getBaseUrl()` returns `NEXT_PUBLIC_SITE_URL || NEXT_PUBLIC_URL || 'https://tpcmin.org'`. Use this for any URL building going forward; do not reference `NEXT_PUBLIC_URL` directly.
- **`app/(public)/partner/upgrade/page.tsx`** — Partner/Covenant flow: tier-aware, auth-gated with `?next=` redirect, monthly/annual selector.
- **`app/api/stripe/webhook/route.ts`** — now routes `metadata.type==='membership'` to a dedicated `handleMembershipCheckout` that upgrades tier + records subscription. Recurring invoices for memberships go to `recordMembershipInvoice` (no donations insert). Cancellation downgrades back to free.

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

### 🔴 P0 — Validate rewrites against real Stripe + go live

**1. End-to-end Stripe test mode validation**
The donation + membership webhook handlers were rewritten in sessions 2 + 3. Code is type-checked and the catalog products exist, but the full webhook → DB → email loop has not been driven by a real charge yet:
- Trigger a test donation via `/giving` (use Stripe CLI `stripe trigger checkout.session.completed` with the test event payload, or just complete a $1 test checkout) → confirm `donations` insert succeeds with `donation_type='one_time'|'recurring'`, `designation='general|missions|leadership'`, `status='succeeded'`; receipt email fires; giver auto-upgrades to partner role
- Trigger a test membership via `/partner/upgrade?tier=partner` → confirm `member_subscriptions` row lands, `members.role` upgrades, redirect to `/member/account?tab=membership&success=true`
- Trigger a test monthly renewal (`stripe trigger invoice.payment_succeeded`) → confirm `current_period_end` updates without a duplicate donations row
- Test cancellation (`stripe trigger customer.subscription.deleted`) → confirm tier downgrades to free

**2. Create live-mode Stripe products + set env vars in Vercel**
Today's products are in test mode. To go live:
- Create matching live-mode Partner + Covenant Partner products in `acct_1PaRTgIwAPnWjXPH`
- Set `STRIPE_PRICE_TPC_PARTNER_MONTHLY` / `_ANNUAL` and `STRIPE_PRICE_TPC_COVENANT_MONTHLY` / `_ANNUAL` env vars in Vercel (one set per env)
- Verify `STRIPE_WEBHOOK_SECRET` is configured for the live webhook endpoint

### 🟡 P1 — Remaining cleanup

**3. Performance push to Lighthouse 90+** (currently 75; sessions 3+4 should get it to ~85)
Bigger wins still on the table: re-encode hero video to AVIF/WebM (offline ffmpeg work), defer below-fold sections via dynamic imports + IntersectionObserver, prefetch likely-next-pages.

**4. Set `ADMIN_EMAIL` env var in Vercel** (currently falls back to `info@tpcmin.org`)
Prayer-request admin notifications + contact form submissions route here.

**5. Enable Supabase auth leaked-password protection** (1 advisor WARN, UI click in Supabase dashboard, no migration)
Auth → Settings → Password Strength → toggle HIBP check.

**6. Review storage bucket public-listing** (1 advisor WARN, `public_bucket_allows_listing`)
Some bucket is set to allow listing; review whether intentional.

### 🟢 P2 — Polish

**7. Edit + publish podcast Episodes 1 & 2**
Raw camera MP4s + multi-mic WAVs on Transcend drive at `Day 10/podcasts/`.

**8. Address WARN-level advisor lints** (low priority)
- 61× `function_search_path_mutable` (defensive against schema injection)
- 24× `anon_security_definer_function_executable` / 24× `authenticated_*` (audit which SECURITY DEFINER functions need to be callable by clients)
- 17× `rls_enabled_no_policy` (tables RLS-on with no policies = effectively service-role-only; usually intentional)
- 1× `public_bucket_allows_listing` (storage bucket setting; review)
- 1× `auth_leaked_password_protection` (enable HIBP check in Supabase Auth settings)

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

## 🔑 Commits worth knowing

Session 6 (2026-05-22 — Kenya archive + advisor cleanup):
```
815bbf3  chore: park upload-kenya-videos.mjs for future CDN migration
bec9a9f  docs: add Theme I (Mission-Trips infrastructure) to v1.1 draft
4cafcee  feat(missions): archive Kenya 2026 + ship /kenya-2026/impact aggregate page
16d9206  fix(security): actually revoke function EXECUTE — from PUBLIC, not anon/authenticated
f73546d  fix(security): revoke EXECUTE from anon+authenticated on 23 SECURITY DEFINER funcs
```

Session 5 (2026-05-21, pre-ship hardening):
```
16d9206  fix(security): actually revoke function EXECUTE — REVOKE from PUBLIC
f73546d  fix(security): revoke EXECUTE from anon+authenticated on 23 SECURITY DEFINER funcs
ea580d2  fix(media): compress 6 referenced videos + remove 5 unused; repo 549MB → 228MB
c14e5ea  fix(media): compress timeline-2.mp4 (122MB → 15MB) for GitHub push limit
```
(Note: SHAs from `b9f12dc` onward were rewritten by `git filter-repo`. The post-filter SHAs starting at `c14e5ea` are what shipped.)

Session 4 (2026-05-20):
```
b9f12dc  fix(misc): prophecy schema drift, weekly newsletter cron, DB hardening, preconnect
```

Session 3 (2026-05-20):
```
d642ed5  fix(security+cleanup): plug SECURITY DEFINER view leak + delete 326 dead lines
b034c2e  feat(stripe+perf): catalog price IDs for memberships + defer AI widget
```

Audit closeout (2026-05-19):
```
6ed18a0  fix(audit): close RLS gap + delete dead assessments dual-system
af82332  fix(audit): kill base-URL drift, fix donations webhook schema, harden RLS
4dcf301  fix(audit): close 3 P0s — assessment tables, membership funnel, prayer follow-ups
236654c  docs: handoff update + persist pre-launch audit report
```

v1.0 launch session (2026-05-19, earlier):
```
69c660d  fix(build): wrap signup useSearchParams in Suspense
f8413ed  fix(audit): 4 critical pre-launch hotfixes
8da3cf3  feat(positioning): reframe as "digital age" — US + global
fab3e5f  fix: restore site nav on homepage + remove Itete Market
603f247  docs: Phase 9 — launch gates verified
d9fd731  feat(analytics): Phase 8 — conversion path
95f238b  feat(ai): Phase 7 — persistent Ask-Prophet widget
0ff4f45  feat(design): Phase 6 — design sweep + tokens
4aa1628  feat(design): Phase 5 — sweep on /about, /beliefs, /missions
3beae81  feat(kenya): Phase 4 — /kenya-2026/gallery
7e28eeb  feat(kenya): Phase 3 — 14-day journey
1f6db1f  feat(kenya): Phase 2 — ARW pipeline + photos
c1546e4  feat(coherence): Phase 1 baseline
```

---

## 🎯 Next session — start here

**Read in this order:**
1. This file (HANDOFF.md) — top section is current state
2. `.planning/AUDIT-2026-05-19.md` — full original audit (every item is now closed)
3. `.planning/v1.1-DRAFT-best-site-ever.md` — proposed v1.1 themes

**Suggested first move — verify the rewrites against real Stripe:**
The webhook + checkout flows were significantly rewritten. They type-check but haven't been exercised yet. Spend 30 min with Stripe CLI test mode hitting `/giving` (donation flow) and `/partner/upgrade?tier=partner` (membership flow), confirm DB inserts succeed + emails fire + tier upgrades land. After that's green, move on to:

- **Path A — Performance push**: Lighthouse Perf 75 → 90+ (hero video re-encode, AI widget defer, image priorities).
- **Path B — Launch v1.1 milestone**: `/gsd:new-milestone` using the v1.1 draft.
- **Path C — Tackle the 8 SECURITY DEFINER views** flagged by the Supabase advisor.

**Quick command to resume orientation:**
```bash
cd ~/tpc-ministries-platform
cat HANDOFF.md | head -150
cat .planning/AUDIT-2026-05-19.md
git log --oneline -15
```

---

*Updated 2026-05-19 at the end of the audit closeout session. Original v1.0 launch session intact above.*
