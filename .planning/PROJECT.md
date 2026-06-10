# TPC Ministries — GSD Project File

> Initialized: 2026-02-22 | Status: Brownfield | Tier: ANCILLARY

## Overview

**Project:** TPC Ministries Platform
**Path:** ~/tpc-ministries-platform
**Description:** Public-facing ministry website + member platform for TPC Ministries (Prophet Lorenzo Daughtry-Chambers). Combines story-led public site (teachings, prophecy, missions, Kenya 2026 recap, AI engagement) with member management and content tools.
**Core Value:** A Gen-Z visitor should land on tpcmin.org, engage with the prophet's voice (via story or AI), and convert — while member data stays HIGH-sensitivity protected.

## Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Next.js |
| Styling | Tailwind CSS, shadcn/ui |
| Database | Supabase (Postgres, Auth) |
| Hosting | Vercel |
| Auth | Supabase Auth |

## Database

- **Supabase Project:** TPC Ministries
- **Project ID:** naulwwnzrznslvhhxfed
- **MCP Connection:** `supabase-tpc`
- **Has User Data:** YES — member data (HIGH sensitivity)
- **Shared With:** Streams of Grace, Boardroom Prayer Room

## Ecosystem Position

- **Organization:** TPC Ministries (via IHA)
- **Tier:** ANCILLARY
- **Validated:** Ministry platform live, member management operational
- **Risk Level:** HIGH — member data sensitivity, shared database

## Constraints

1. Shares database with Streams of Grace and Boardroom Prayer Room — schema changes affect all three
2. Member data is HIGH sensitivity — treat with care
3. Must follow Supabase safety rules (no DROP/DELETE without approval)
4. All database changes need RLS policies
5. TypeScript strict mode, no `any` types
6. Use `supabase-tpc` MCP connection for database operations

## Key Decisions

| Date | Decision | Rationale | Outcome |
|------|----------|-----------|---------|
| 2026-02-22 | GSD initialized (brownfield) | Bringing project into structured planning | ✓ Good |
| 2026-05-18 | Two Kenya routes: `/kenya` (planning archive) + `/kenya-2026` (recap) | Preserve historical planning info while making post-trip story the front door | — Pending |
| 2026-05-18 | Prophet Lorenzo public AI = 5-message preview → signup gate | Hook Gen-Z visitor with conversation, convert before unlimited access | — Pending |
| 2026-05-18 | Service Worker registers in production only | Dev-mode SW caches stale chunks across port changes (caused crash) | ✓ Good |
| 2026-06-09 | origin/main is the single canonical line; mini reconciled (89/242 fork archived as snapshot branches) | Vercel prod deploys from GitHub main; two-machine drift nearly lost work | ✓ Good |
| 2026-06-10 | v2.0 = operate, don't build: shrink surface instead of activating 60 dark routes | 7 users / 6 admins / empty tables — surface area is maintenance + security tax, not value | — Pending |
| 2026-06-10 | Email capture (not account creation) is the public conversion goal | Nobody wants another login; the list feeds the weekly loop and future cohorts | — Pending |
| 2026-06-10 | Weekly content cadence is run by a scheduled agent with human one-tap approval | The cadence machinery existed but starved (newsletter cron disabled for lack of content) | — Pending |

## Current Milestone: v2.0 — TPC Alive

**Started:** 2026-06-10
**Hard date:** Kenya Debrief, Saturday June 27 (9 AM PT / 12 PM ET / 7 PM EAT) — activation work must be live by ~June 20 for promotion runway.

**Goal:** Convert a fully-built-but-empty platform into a living, agent-operated one. The platform's reality on 2026-06-09: 7 auth users (6 admins), zero sign-ins in 30 days, every engagement/money table empty except Kenya trip ops (27 participants). v2.0 is about operating, not feature-building: a weekly AI ops loop that runs the content cadence with one-tap approval, a member surface shrunk to the five rooms that matter, the AI + assessments as the public front door into an email list, and the June 27 debrief converting the 27 Kenya delegates into the first real member cohort.

**Four pillars:**
1. **Weekly AI ops loop** — devotional + newsletter drafted from Lorenzo's actual teaching corpus, queued for one-tap approval (Telegram/magic link), Monday metrics digest; re-enable the weekly-newsletter cron only when fed.
2. **Shrink the member surface** — five living rooms (Watch / Assess / Pray / Give / Kenya); flag-hide the ~50 dark routes that keep silently breaking; everything visible verified working against live schema.
3. **AI front door** — Ask Prophet Lorenzo + assessments convert anonymous visitors to emails (not forced accounts); single subscriber list with source attribution.
4. **June 27 debrief activation** — personal invites to all 27 delegates, trip media gated behind delegate login, registration + reminders through the platform, activation scoreboard in Command Center.

**Explicitly NOT in this milestone:** new member features, the payments-processing decision (separate call: platform processes vs. logbook), full RLS/security cleanup (scheduled as hardening pass after June 27 — voice-upload hole already closed 2026-06-09).

## Milestones

### v1.0 — Kenya 2026 Recap + Gen-Z Engagement Push (SHIPPED 2026-05-19)
- 24/25 reqs ✓ (LAUNCH-01 perf partial). See `.planning/MILESTONES.md`

### v2.0 — TPC Alive (in progress, 2026-06-10 → )
- See "Current Milestone" section above
- Phases: see `.planning/ROADMAP.md` (continues at Phase 10)

## Links

- Ecosystem: ~/CLAUDE.md
- Shared DB projects: Streams of Grace, Boardroom Prayer Room
- Mini repo path: ~/ORGANIZED/01_PROJECTS/ACTIVE/tpc-ministries-platform (laptop: ~/tpc-ministries-platform)

---
*Last updated: 2026-06-10 — milestone v2.0 "TPC Alive" started*
