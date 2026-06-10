# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-10)

**Core value:** A Gen-Z visitor should land on tpcmin.org, engage with the prophet's voice (via story or AI), and convert — while member data stays HIGH-sensitivity protected.
**Current focus:** Milestone v2.0 "TPC Alive" — defining requirements

## Current Position

Milestone: v2.0 — TPC Alive (operate, don't build)
Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-06-10 — Milestone v2.0 started; v1.0 archived to MILESTONES.md

**Hard date:** Kenya Debrief Saturday June 27 — delegate activation (KENYA reqs) must be live by ~June 20.

## Performance Metrics

**Velocity (v1.0):** 9 phases shipped 2026-05-18 → 05-19.

*Updated after each plan completion*

## Accumulated Context

### Decisions

See PROJECT.md Key Decisions. Recent decisions affecting current work:

- 2026-06-09: origin/main is canonical; on the mini always `git fetch` before work; verify `git diff --cached --stat` before committing (case-sensitivity silently drops misspelled paths)
- All phases: No destructive DB changes — shared DB with SoG + Boardroom Prayer Room; /db-safe enforced
- v2.0: flag-hide dark routes rather than delete; code preserved for future milestones
- Email domain: Kenya invite emails send from verified tpcmin.com (not .org) — keep consistent until .org sending domain is verified in Resend

### Platform Reality Baseline (2026-06-09 audit)

- 7 auth users (6 admins, 1 member), 0 sign-ins in 30 days
- All engagement/money tables empty EXCEPT kenya_trip_participants (27), kenya_trip_admin_payments (9, hand-entered)
- email_subscribers was orphaned → now fed by POST /api/public/newsletter (live 2026-06-09)
- Weekly-newsletter cron exists and is enabled upstream; it sends to email_subscriptions (member prefs), NOT email_subscribers — reconcile the two lists in the OPS phase
- Known security backlog (post-June-27 hardening pass): assessment_responses public-UPDATE-true policy, tpc-media bucket public listing, anon-executable check_email_exists, leaked-password protection off, 44 USING(true) RLS warns on secondary tables

### Pending Todos (carried from v1.0)

- LAUNCH-01: Mobile perf 75/85 — hero AVIF/WebM, defer AI widget mount
- Podcast Eps 1 & 2: edit fully or ship raw? (deferred)
- Lorenzo: real mailing address for give-by-check line (placeholder now points to info@tpcmin.org)
- Payments decision: platform processes vs. logbook (one $10 end-to-end test on /giving decides)

### Blockers/Concerns

- June 27 is immovable; promotion runway needs activation live by ~June 20
- Mini and laptop both work this repo — single-writer discipline per feedback-multi-session rules
- Disk on mini: don't bulk-copy media; Transcend drive is on the laptop side

## Session Continuity

Last session: 2026-06-10
Stopped at: Milestone v2.0 initialized; requirements being defined
Resume file: None
