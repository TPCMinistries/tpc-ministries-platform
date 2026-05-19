# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-18)

**Core value:** A Gen-Z visitor should land on tpcmin.org, engage with the prophet's voice (via story or AI), and convert — while member data stays HIGH-sensitivity protected.
**Current focus:** Milestone v1.0 — Phase 1: Coherence Baseline

## Current Position

Phase: 5 of 9 (Design Sweep — Front Door Pages)
Plan: 0 of 1 in current phase
Status: Phases 1-4 ✓ complete — Kenya category fully done
Last activity: 2026-05-19 — Phase 4 shipped: /kenya-2026/gallery with 50 photos

Progress: [████░░░░░░] 44%

## Performance Metrics

**Velocity:**
- Total plans completed: 2 (01-01, 01-02)
- Average duration: ~25 min per plan
- Total execution time: ~50 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: —
- Trend: —

*Updated after each plan completion*

## Accumulated Context

### Decisions

See PROJECT.md Key Decisions.
Recent decisions affecting current work:

- Phase 2: ARW conversion — dcraw NOT installed; validate `sips` first, then ImageMagick/vips as fallback; do NOT install dcraw
- Phase 2: Target max-side 1600px, under 300 KB per exported JPG; output to `/public/kenya-2026/photos/day-{N}/`
- All phases: No new DB tables this milestone — shared DB with SoG + Boardroom Prayer Room is high-risk
- Phase 1: Two Kenya routes coexist — `/kenya` (planning archive, now closed) + `/kenya-2026` (live recap front door)

### Pending Todos

- Lorenzo to provide day-by-day narrative for Days 1-14 (Phase 3 uses designer captions as placeholder)
- Decide podcast Eps 1 & 2: edit fully or ship raw video? (Deferred to v1.1)
- ARW conversion approach must be validated in Phase 2, plan 02-01 before bulk curation

### Blockers/Concerns

- Phase 2: sips ARW support unverified — plan 02-01 must validate before bulk work; if sips fails, try vipsthumbnail (libvips) or ffmpeg
- Disk: 87 GB free — do NOT bulk-copy raw footage; work from mounted Transcend drive directly
- DB: /db-safe enforced; no DROP/DELETE; shared schema risk with SoG + Boardroom

## Session Continuity

Last session: 2026-05-18
Stopped at: Roadmap and STATE.md created; requirements traceability updated
Resume file: None — run `/gsd:plan-phase 1` to begin
