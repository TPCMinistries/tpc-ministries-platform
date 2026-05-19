# Roadmap: TPC Ministries Platform

## Overview

v1.0 transforms tpcmin.org from a pre-trip planning site into a coherent, story-driven ministry platform where the Kenya 2026 recap is the centerpiece and Prophet Lorenzo AI is the primary conversion hook. The journey runs: first close all audit-driven honesty gaps (Phase 1), then build the Kenya photo pipeline (Phase 2), deepen the day-by-day recap (Phase 3), add the standalone gallery (Phase 4), sweep all public pages into the design system (Phases 5-6), wire the AI engagement layer (Phase 7), harden the conversion path (Phase 8), and finally gate the Vercel production deploy behind pass/fail quality checks (Phase 9).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Coherence Baseline** - Close all audit-driven HIGH-severity gaps so the site is internally honest before adding more
- [ ] **Phase 2: Kenya Photo Pipeline** - Validate and script the ARW-to-web-JPG conversion; curate 3-5 photos per day for Days 1-14
- [ ] **Phase 3: Kenya Recap Deepening** - Extend the day-by-day journey to all 14 days with inline photo galleries and designer captions
- [ ] **Phase 4: Kenya Gallery Page** - Standalone `/kenya-2026/gallery` with masonry layout, day filter, and lightbox
- [ ] **Phase 5: Design Sweep — Front Door Pages** - `/about`, `/beliefs`, `/missions` aligned to prophet-voice design system
- [ ] **Phase 6: Design Sweep — Content + Functional Pages** - All remaining public pages aligned; shared design tokens codified
- [ ] **Phase 7: AI Engagement Layer** - Widget persistent across all public pages, post-signup conversation handoff, smoke-test verified
- [ ] **Phase 8: Conversion Path** - SoG devotional CTA, analytics event wiring, single-CTA audit across all public sections
- [ ] **Phase 9: Launch Gates** - Lighthouse, link audit, Vercel preview → production deploy, Service Worker production verify

## Phase Details

### Phase 1: Coherence Baseline
**Goal**: Every public page is internally honest — no countdown timers for a trip that ended 12 days ago, no broken CTAs, no "upcoming" framing on a completed trip
**Depends on**: Nothing (first phase)
**Requirements**: COHERE-01, COHERE-02, COHERE-03, COHERE-04, COHERE-05, COHERE-06
**Success Criteria** (what must be TRUE):
  1. A visitor on `/kenya` sees a disabled application form with clear "trip closed — view the recap" messaging and cannot submit an application
  2. A visitor on any `/kenya/pack-the-mission`, `/kenya/give`, or `/kenya/support/[slug]` page reads dates as past-tense context, not future calls to action
  3. The homepage no longer shows an active countdown timer counting up/down from the trip dates — it shows a "Trip completed" state or the section is removed
  4. Every homepage CTA that previously routed to `/live` or `/prayer` either routes to a working public page or opens the signup flow — no visitor hits a 404 or member-only wall
  5. The navigation and footer contain exactly one canonical "Kenya 2026" entry, and the `/kenya` page stats read as past achievement (or are removed)
**Plans**: TBD

Plans:
- [ ] 01-01: Disable /kenya application form + reframe stale copy on /kenya planning subpages
- [ ] 01-02: Remove/reframe homepage countdown + fix /live and /prayer CTAs + rationalize nav/footer

### Phase 2: Kenya Photo Pipeline
**Goal**: A working script converts selected Sony ARW files to web-ready JPGs without dcraw, validated on at least one photo per day from Days 1-14, so Phase 3 has real photos to embed
**Depends on**: Nothing (can run in parallel with Phase 1, but Phase 3 depends on its output)
**Requirements**: KENYA-01
**Success Criteria** (what must be TRUE):
  1. Running the script on any ARW file from the Transcend drive produces a web-ready JPG (max-side 1600px, under 300 KB) without installing dcraw
  2. At least 3 curated photos exist as exported JPGs for each of Days 1-14 (minimum 42 files), committed to the repo under `/public/kenya-2026/photos/day-{N}/`
  3. The conversion approach is documented in a code comment or README note so a future session can re-run it without re-discovery
**Plans**: TBD

Plans:
- [ ] 02-01: Validate sips/ImageMagick/vips approach on a sample ARW; write conversion script; batch-curate per-day selects

### Phase 3: Kenya Recap Deepening
**Goal**: A visitor on `/kenya-2026` can scroll through a complete 14-day journey where every day shows real photos alongside the existing video — not a placeholder
**Depends on**: Phase 2 (requires curated JPGs from pipeline)
**Requirements**: KENYA-02, KENYA-03, KENYA-04
**Success Criteria** (what must be TRUE):
  1. A visitor on `/kenya-2026` can scroll from Day 1 through Day 14 without any gap — all 14 days are present, not just Days 11-14
  2. Every day card shows an inline photo gallery of 3-5 real Kenya photos alongside (or below) the existing video embed
  3. Every day card shows a designer-written visual caption that names the location and frames what is visible in one sentence — no fabricated narrative, nothing sourced from AI inference about events that weren't in the footage
**Plans**: TBD

Plans:
- [ ] 03-01: Extend day-by-day data (Days 1-10) + write visual captions for all 14 days
- [ ] 03-02: Build inline photo gallery component per day card; wire photos from Phase 2 output

### Phase 4: Kenya Gallery Page
**Goal**: A visitor can browse all 30-60 curated Kenya photos in one place, filter by day, and open any photo full-screen
**Depends on**: Phase 3 (photos and captions already committed)
**Requirements**: KENYA-05
**Success Criteria** (what must be TRUE):
  1. A visitor can navigate to `/kenya-2026/gallery` and see 30-60 photos in a masonry grid without any broken image placeholders
  2. A visitor can click a day filter (Day 1, Day 2 … Day 14) and the grid updates to show only that day's photos without a full page reload
  3. A visitor can click any photo and it opens in a lightbox that shows the photo full-screen with its designer caption, and they can navigate forward/back without closing
**Plans**: TBD

Plans:
- [ ] 04-01: Build /kenya-2026/gallery page — masonry grid, day filter, lightbox

### Phase 5: Design Sweep — Front Door Pages
**Goal**: `/about`, `/beliefs`, and `/missions` feel like the same site as the Kenya 2026 recap — same voice, same motion, same navy/gold palette — so a visitor who arrived via Kenya stays in a coherent world
**Depends on**: Phase 1 (coherent baseline required before sweeping design)
**Requirements**: DESIGN-01
**Success Criteria** (what must be TRUE):
  1. A visitor on `/about` sees the prophet voice in headlines and body copy, the navy/gold color system, and at least one motion variant (fade-in, parallax, or scroll-triggered reveal) consistent with the Kenya recap page
  2. A visitor on `/beliefs` and `/missions` experiences the same visual language — no leftover default Tailwind gray, no mismatched font sizes, no missing motion
  3. None of the three pages have CTAs that route to 404s or member-only walls (sanity check held over from Phase 1)
**Plans**: TBD

Plans:
- [ ] 05-01: Rebuild /about, /beliefs, /missions to design system

### Phase 6: Design Sweep — Content + Functional Pages
**Goal**: Every remaining public page — teachings, ebooks, podcast, prophecy, assessments, stories, contact, connect, FAQ — is visually and tonally coherent, and shared design tokens are codified so future pages stay aligned without a second sweep
**Depends on**: Phase 5 (tokens and patterns established there)
**Requirements**: DESIGN-02, DESIGN-03, DESIGN-04
**Success Criteria** (what must be TRUE):
  1. A visitor can navigate from `/teachings` through `/podcast` to `/prophecy` and the typography scale, color, and spacing feel consistent — no page looks like it was built separately
  2. A visitor on any of the lighter-rebuild pages (`/assessments`, `/stories`, `/contact`, `/connect`, `/faq`) sees correct typography, color, and at least one motion element — no unstyled fallback
  3. A developer can open `components/ui/` and find a documented file (e.g., `design-tokens.ts` or equivalent) that declares the typography scale, motion preset classes, and color usage — adding a new page requires no design archaeology
**Plans**: TBD

Plans:
- [ ] 06-01: Sweep /teachings, /ebooks, /podcast, /prophecy to design system
- [ ] 06-02: Sweep /assessments, /stories, /contact, /connect, /faq; codify shared design tokens

### Phase 7: AI Engagement Layer
**Goal**: The Ask-Prophet widget follows a visitor across all public pages, their conversation persists if they sign up mid-chat, and the full public-to-member handoff flow works end-to-end
**Depends on**: Phase 1 (signup CTA routes must be clean first)
**Requirements**: AI-01, AI-02, AI-03
**Success Criteria** (what must be TRUE):
  1. A visitor can open the Ask-Prophet widget on any public page — not just the homepage — and their conversation history persists as they navigate between pages within the same session
  2. A visitor who starts a conversation, hits the 5-message limit, and signs up lands in the member chat interface with their prior turns visible — no blank slate, no lost context
  3. A tester walking the full flow (public chat → hit gate → sign up → member chat) can confirm the prior conversation appears in member chat on the first try with no manual intervention
**Plans**: TBD

Plans:
- [ ] 07-01: Make Ask-Prophet widget persistent across all public pages with session storage continuity
- [ ] 07-02: Build post-signup AI handoff (persist conversation to member chat); smoke-test full flow

### Phase 8: Conversion Path
**Goal**: Every public page has one unmistakable primary action, the Streams of Grace devotional is surfaced as the devotional CTA (not rebuilt), and the funnel is observable via analytics events
**Depends on**: Phases 5, 6, 7 (design + AI must be in place before the CTA audit is meaningful)
**Requirements**: CONVERT-01, CONVERT-02, CONVERT-03
**Success Criteria** (what must be TRUE):
  1. A visitor on `/teachings`, `/podcast`, or any content page sees a Streams of Grace devotional link or embed that routes correctly to `streamsofgrace.app` — no TPC rebuild of that content
  2. After interacting with the site, a developer can open PostHog (or the wired analytics tool) and see distinct event counts for `page_view`, `ai_chat_start`, `ai_chat_message`, `signup`, `give_click`, and `apply_click` — the funnel is observable
  3. Walking each public page top-to-bottom, there is exactly one primary CTA button or prominent link per section — no section offers two equal-weight conversion actions side by side
**Plans**: TBD

Plans:
- [ ] 08-01: Surface SoG devotional CTA; wire analytics events; run single-CTA audit across all public pages

### Phase 9: Launch Gates
**Goal**: tpcmin.org is live on production with Lighthouse scores that pass the defined thresholds, zero nav/footer 404s, and a verified Service Worker
**Depends on**: All prior phases (Phases 1-8 complete)
**Requirements**: LAUNCH-01, LAUNCH-02, LAUNCH-03, LAUNCH-04
**Success Criteria** (what must be TRUE):
  1. Running Lighthouse mobile on `/`, `/kenya-2026`, and the top 5 public pages each shows Performance >= 85 and Accessibility >= 95 — no page fails either threshold
  2. An automated link check against the production URL reports zero 404s in the nav and footer
  3. A smoke test on the Vercel preview URL passes (key user flows work: homepage → Kenya recap, AI widget, signup), and the deploy is then promoted so `tpcmin.org` serves the new build
  4. Visiting `tpcmin.org` in a production browser (not localhost) shows the Service Worker registering cleanly in DevTools, and visiting localhost shows the dev-mode auto-unregister working — no stale cache issues in either environment
**Plans**: TBD

Plans:
- [ ] 09-01: Lighthouse audit + fix; automated link check; Vercel preview smoke test + production promote; SW verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

Note: Phase 2 has no dependency on Phase 1 and can run concurrently if working across two sessions, but Phase 3 requires Phase 2 output.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Coherence Baseline | 0/2 | Not started | - |
| 2. Kenya Photo Pipeline | 0/1 | Not started | - |
| 3. Kenya Recap Deepening | 0/2 | Not started | - |
| 4. Kenya Gallery Page | 0/1 | Not started | - |
| 5. Design Sweep — Front Door Pages | 0/1 | Not started | - |
| 6. Design Sweep — Content + Functional Pages | 0/2 | Not started | - |
| 7. AI Engagement Layer | 0/2 | Not started | - |
| 8. Conversion Path | 0/1 | Not started | - |
| 9. Launch Gates | 0/1 | Not started | - |
