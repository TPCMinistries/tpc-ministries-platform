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

## Current Milestone: v1.0 — Kenya 2026 Recap + Gen-Z Engagement Push

**Started:** 2026-05-18
**Goal:** Land a coherent, story-driven public site where the Kenya 2026 recap is the centerpiece, all public pages align visually and tonally to the new prophet-voice + motion system, and Prophet Lorenzo AI is the primary engagement hook — so a Gen-Z visitor stays >60s and converts to signup, give, or apply.

**Target features:**
- Full Kenya 2026 recap with real day-by-day photos + Lorenzo's narrative
- Kenya podcast (Eps 1 & 2 from Day 10) published in some form
- Stale "upcoming trip" copy purged everywhere (forms disabled, dates contextualized)
- Public-route hygiene: no homepage CTAs lead to 404/member-only routes
- Design sweep on all public pages (about, beliefs, missions, teachings, podcast, ebooks, assessments, prophecy, stories, contact)
- Prophet Lorenzo AI surfaces refined (post-signup handoff to full member chat)
- Pre-launch QA + Vercel deploy

**Asset inventory:** 3.6 TB Transcend drive with Day 1–14 raw footage (~2.1 TB), ~2,800+ Sony ARW photos, 61 web-ready JPGs, podcast Eps 1 & 2 (raw), Insta360 panoramics (169 GB), DaVinci Resolve project file.

## Milestones

### v1.0 — Kenya 2026 Recap + Gen-Z Engagement Push (in progress, 2026-05-18 → )
- See "Current Milestone" section above
- Phases: see `.planning/ROADMAP.md`

## Links

- Ecosystem: ~/CLAUDE.md
- Shared DB projects: Streams of Grace, Boardroom Prayer Room
