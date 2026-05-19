# Requirements: TPC Ministries Platform

**Defined:** 2026-05-18
**Milestone:** v1.0 — Kenya 2026 Recap + Gen-Z Engagement Push
**Core Value:** A Gen-Z visitor should land on tpcmin.org, engage with the prophet's voice (via story or AI), and convert — while member data stays HIGH-sensitivity protected.

## v1.0 Requirements

Requirements for this milestone. Each maps to one roadmap phase.

### COHERE — Audit-driven coherence fixes

- [ ] **COHERE-01**: `/kenya` application form is disabled post-trip with "trip closed — view the recap" messaging
- [ ] **COHERE-02**: Hardcoded "April 23 – May 6" dates in `/kenya/pack-the-mission`, `/kenya/give`, `/kenya/support/[slug]` reframed as past-tense or contextualized as the closed trip
- [ ] **COHERE-03**: Active countdown timer on homepage `kenya-section` removed or reframed ("Trip completed")
- [ ] **COHERE-04**: Homepage `/live` and `/prayer` CTAs route to existing public alternatives (`/kenya/live`) or signup flow (no public→member 404s)
- [ ] **COHERE-05**: Footer + navigation rationalized — single canonical "Kenya 2026" entry, no duplicate/conflicting paths
- [ ] **COHERE-06**: `/kenya` page stats ("20+ Delegates", "What to Expect") reframed as past-tense achievement or removed

### KENYA — Recap content & polish

- [ ] **KENYA-01**: ARW → web JPG conversion pipeline (script) — curate top 3-5 photos per day across Days 1-14
- [ ] **KENYA-02**: Day-by-day journey on `/kenya-2026` extended from 4 days (11-14) to all 14 days (1-14)
- [ ] **KENYA-03**: Each day card includes inline photo gallery (3-5 photos) alongside the existing video
- [ ] **KENYA-04**: Designer-written visual captions per day (location + 1-sentence framing) — no fabricated narrative, anchored to what's visible in the footage
- [ ] **KENYA-05**: Standalone `/kenya-2026/gallery` page — masonry layout, day-filterable, 30-60 curated photos with lightbox

### DESIGN — Public-page visual + tonal sweep

- [ ] **DESIGN-01**: `/about`, `/beliefs`, `/missions` aligned to new design system (prophet voice, motion variants, navy/gold palette)
- [ ] **DESIGN-02**: `/teachings`, `/ebooks`, `/podcast`, `/prophecy` aligned to new design system
- [ ] **DESIGN-03**: `/assessments`, `/stories`, `/contact`, `/connect`, `/faq` polished to coherent style (lighter rebuild — typography, color, motion only)
- [ ] **DESIGN-04**: Shared design tokens documented in code (`components/ui/`) — typography scale, motion presets, color usage — so future pages stay aligned

### AI — Prophet Lorenzo engagement refinement

- [ ] **AI-01**: Post-signup AI handoff — public chat conversation persists into member chat after signup (user signs up mid-conversation, lands in member chat with prior turns)
- [ ] **AI-02**: Ask-Prophet widget persistent across all public pages (not just homepage), conversation continuity via session storage
- [ ] **AI-03**: Member AI verified as the destination after handoff (smoke test full flow: public chat → signup → member chat)

### CONVERT — Conversion path

- [ ] **CONVERT-01**: Streams of Grace daily devotional surfaced as primary devotional CTA (link/embed from `streamsofgrace.app`, do not rebuild)
- [ ] **CONVERT-02**: Conversion analytics — events for `page_view`, `ai_chat_start`, `ai_chat_message`, `signup`, `give_click`, `apply_click` wired into existing analytics (or PostHog if absent), so the funnel is observable
- [ ] **CONVERT-03**: One unmistakable primary CTA per public section — no choice paralysis (verified by walking each page top-to-bottom)

### LAUNCH — Pre-deploy gates

- [ ] **LAUNCH-01**: Lighthouse mobile: ≥85 performance, ≥95 accessibility on `/`, `/kenya-2026`, top 5 public pages
- [ ] **LAUNCH-02**: Every link in nav + footer returns 200 (no 404s) — automated check
- [ ] **LAUNCH-03**: Vercel preview deploy passes smoke test, then promoted to production on tpcmin.org
- [ ] **LAUNCH-04**: Service Worker verified in production build (registers cleanly, dev-mode auto-unregister still works)

## v1.1 Requirements (Deferred)

### PODCAST — Day 10 Eps 1 & 2

- **PODCAST-01**: Encode raw camera MP4s to web format
- **PODCAST-02**: Multi-mic audio mix synced to video
- **PODCAST-03**: `/podcast` surface with show notes, episode index
- **PODCAST-04**: Audio-only player option

### AI — Deeper capabilities

- **AI-04**: AI-powered personalized daily devotional (member-side)
- **AI-05**: Prophet-voice fine-tuning on full prophecy + teachings corpus

### KENYA — Beyond v1.0

- **KENYA-06**: Insta360 360° panoramic player (169 GB of footage available)
- **KENYA-07**: Bulk ARW conversion of all ~2,800 photos with searchable archive

## Out of Scope

| Feature | Reason |
|---------|--------|
| New tables / schema changes | Existing schema sufficient; DB is shared (Streams of Grace + Boardroom) — schema risk too high for this milestone |
| Insta360 360° player | 169 GB, needs custom player, separate effort |
| Bulk ARW conversion (all 2,800 photos) | Curated 30-60 is enough for v1.0 storytelling |
| Mobile native app | Web-first; reach via PWA is sufficient |
| Tier upgrade flows for member checkout | Not requested for this milestone |
| AI-generated day-by-day narrative for Kenya | Designer (Claude) writes minimal visual captions; full narrative is Lorenzo's voice — deferred until he wants to dictate |
| Rebuilding Streams of Grace devotional inside TPC | SoG already lives at `streamsofgrace.app` with full PWA — link/embed, do not duplicate |
| Lorenzo personally writing daily devotional copy | Use Streams of Grace as-is |

## Traceability

Populated by roadmap creation — 2026-05-18.

| Requirement | Phase | Status |
|-------------|-------|--------|
| COHERE-01 | Phase 1 | Pending |
| COHERE-02 | Phase 1 | Pending |
| COHERE-03 | Phase 1 | Pending |
| COHERE-04 | Phase 1 | Pending |
| COHERE-05 | Phase 1 | Pending |
| COHERE-06 | Phase 1 | Pending |
| KENYA-01 | Phase 2 | Pending |
| KENYA-02 | Phase 3 | Pending |
| KENYA-03 | Phase 3 | Pending |
| KENYA-04 | Phase 3 | Pending |
| KENYA-05 | Phase 4 | Pending |
| DESIGN-01 | Phase 5 | Pending |
| DESIGN-02 | Phase 6 | Pending |
| DESIGN-03 | Phase 6 | Pending |
| DESIGN-04 | Phase 6 | Pending |
| AI-01 | Phase 7 | Pending |
| AI-02 | Phase 7 | Pending |
| AI-03 | Phase 7 | Pending |
| CONVERT-01 | Phase 8 | Pending |
| CONVERT-02 | Phase 8 | Pending |
| CONVERT-03 | Phase 8 | Pending |
| LAUNCH-01 | Phase 9 | Pending |
| LAUNCH-02 | Phase 9 | Pending |
| LAUNCH-03 | Phase 9 | Pending |
| LAUNCH-04 | Phase 9 | Pending |

**Coverage:**
- v1.0 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-18*
*Last updated: 2026-05-18 — Traceability populated after roadmap creation*
