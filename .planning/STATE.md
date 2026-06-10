# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-10)

**Core value:** A Gen-Z visitor should land on tpcmin.org, engage with the prophet's voice (via story or AI), and convert — while member data stays HIGH-sensitivity protected.
**Current focus:** Milestone v2.0 "TPC Alive" — Phase 10 (Surface + Capture Foundation)

## Current Position

Milestone: v2.0 — TPC Alive (operate, don't build)
Phase: 10 — Surface + Capture Foundation (not started)
Plan: —
Status: Roadmap defined, ready to plan Phase 10

Last activity: 2026-06-10 — Roadmap created; 4 phases derived from 19 requirements

**Hard date:** Kenya Debrief Saturday June 27 — Phase 11 must be live by ~June 20.

**Phase overview (v2.0):**
- Phase 10: Surface + Capture Foundation (SURF-01..04, DOOR-03, DOOR-04)
- Phase 11: Kenya Debrief Activation (KENYA-01..05) — hard date, live by ~June 20
- Phase 12: AI Front Door + Ops Foundation (DOOR-01, DOOR-02, OPS-05, OPS-06)
- Phase 13: Weekly AI Ops Loop (OPS-01..04)

Progress: [ ] 10  [ ] 11  [ ] 12  [ ] 13

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
- v2.0: email capture (not account creation) is the public conversion goal — nobody wants another login; the list feeds the weekly loop

### Platform Reality Baseline (2026-06-09 audit)

- 7 auth users (6 admins, 1 member), 0 sign-ins in 30 days
- All engagement/money tables empty EXCEPT kenya_trip_participants (27), kenya_trip_admin_payments (9, hand-entered)
- email_subscribers was orphaned → now fed by POST /api/public/newsletter (live 2026-06-09)
- Weekly-newsletter cron exists and is enabled upstream; it sends to email_subscriptions (member prefs), NOT email_subscribers — reconcile the two lists in Phase 12 (OPS-06)
- Known security backlog (post-June-27 hardening pass): assessment_responses public-UPDATE-true policy, tpc-media bucket public listing, anon-executable check_email_exists, leaked-password protection off, 44 USING(true) RLS warns on secondary tables

### Pending Todos (carried from v1.0)

- LAUNCH-01: Mobile perf 75/85 — hero AVIF/WebM, defer AI widget mount
- Podcast Eps 1 & 2: edit fully or ship raw? (deferred)
- Lorenzo: real mailing address for give-by-check line (placeholder now points to info@tpcmin.org)
- Payments decision: platform processes vs. logbook (one $10 end-to-end test on /giving decides)

### Blockers/Concerns

- June 27 is immovable; promotion runway needs Phase 11 live by ~June 20
- Mini and laptop both work this repo — single-writer discipline per feedback-multi-session rules
- Disk on mini: don't bulk-copy media; Transcend drive is on the laptop side

## Session Continuity

Last session: 2026-06-10
Stopped at: Roadmap defined for v2.0; next step is `/gsd:plan-phase 10`
Resume file: None
