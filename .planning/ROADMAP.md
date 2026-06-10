# Roadmap: TPC Ministries Platform

> Phases 1–9 are v1.0 (SHIPPED 2026-05-19). See `.planning/MILESTONES.md` for the archived v1.0 phase details and outcomes.
> This document covers v2.0 "TPC Alive" — Phases 10–13.

---

## v2.0 Overview

Operate a fully-built-but-empty platform into a living, agent-operated one. Four pillars: shrink the member surface to five verified rooms, unify email capture with attribution, activate the June 27 Kenya debrief (hard date), then wire the weekly AI ops loop. Every phase delivers a complete, verifiable capability — no horizontal layers.

**Hard date:** Kenya Debrief activation live by ~June 20 (debrief is Saturday June 27, 9 AM PT / 12 PM ET).

---

## Phases

- [ ] **Phase 10: Surface + Capture Foundation** - Shrink member nav to five rooms, flag-hide dark routes, unify email capture list with source attribution, fix notification prompt timing
- [ ] **Phase 11: Kenya Debrief Activation** - Delegate invites, debrief registration + reminders, activation scoreboard — all Kenya activation live by ~June 20
- [ ] **Phase 12: AI Front Door + Ops Foundation** - AI widget and assessment email-capture gates live, subscriber list reconciled, Monday ops digest on Telegram
- [ ] **Phase 13: Weekly AI Ops Loop** - Devotional + newsletter drafted from teaching corpus, one-tap approval via Telegram/magic link, approved content sends via Resend

---

## Phase Details

### Phase 10: Surface + Capture Foundation
**Goal**: The member platform has exactly five visible, working rooms, and every public email capture lands in one unified list with source attribution
**Depends on**: Nothing (first v2.0 phase; must complete before Phase 11 which depends on unified capture)
**Requirements**: SURF-01, SURF-02, SURF-03, SURF-04, DOOR-03, DOOR-04
**Success Criteria** (what must be TRUE):
  1. A logged-in member sees exactly five rooms in the nav (Watch, Assess, Pray, Give, Kenya) plus account settings — no other routes are accessible or linked
  2. A developer navigating to any hidden route is redirected to the dashboard rather than a 404 or a broken page; the route code is present in the codebase, not deleted
  3. A member can complete the core action in each of the five rooms (watch a teaching, submit a prayer, view the Kenya portal, navigate to giving, take an assessment) without hitting a silent failure against the live schema
  4. Admin nav and dashboard contain no links to flag-hidden member routes
  5. An email submitted via the AI widget, assessment form, footer newsletter, debrief page, or giving page lands as a single row in the unified subscriber list with a non-null source field identifying which surface captured it
  6. A new visitor's first page load does not trigger a notification-permission prompt; the prompt appears only after a second visit or a completed action (AI message sent, assessment started, form submitted)
**Plans**: TBD

### Phase 11: Kenya Debrief Activation
**Goal**: All 27 Kenya delegates are personally invited and can access trip media, any visitor can register for the June 27 debrief and receives automated reminders, and every post-debrief capture is measurable
**Depends on**: Phase 10 (unified capture list with attribution must exist before debrief registrations land in it)
**Requirements**: KENYA-01, KENYA-02, KENYA-03, KENYA-04, KENYA-05
**Success Criteria** (what must be TRUE):
  1. Each of the 27 Kenya delegates receives a personal invite email (sent from the verified tpcmin.com domain) containing a link to their delegate portal; clicking the link and logging in grants access to trip media that is not accessible to anonymous visitors
  2. A visitor on tpcmin.org can register for the June 27 debrief and immediately receives a confirmation email containing a .ics calendar invite for 9 AM PT / 12 PM ET
  3. A registered attendee automatically receives reminder emails at T-7 days, T-1 day, and day-of without any manual trigger; a test registration verifies the cron fires against real rows
  4. The debrief page ends with a visible CTA routing into the assessment or email-capture flow, and a row in the DB is created for each post-debrief conversion that identifies it as coming from the debrief surface
  5. An admin viewing the Kenya Command Center sees a live scoreboard showing: invites sent count, delegate portal logins count, debrief registrations count, and post-event email captures count
**Plans**: TBD

### Phase 12: AI Front Door + Ops Foundation
**Goal**: Public visitors convert to email subscribers through the AI widget and assessments, the two subscriber stores are reconciled into one deduplicated send list, and Lorenzo receives a Monday morning ops digest on Telegram
**Depends on**: Phase 10 (unified subscriber list infrastructure), Phase 11 (debrief registrations inflate the list, validating reconciliation before OPS-06 runs)
**Requirements**: DOOR-01, DOOR-02, OPS-05, OPS-06
**Success Criteria** (what must be TRUE):
  1. A visitor who reaches the Ask Prophet Lorenzo message limit is shown an email-capture prompt (not an account-creation prompt); submitting their email allows the conversation to continue and the subscriber row is created with source = 'ai_widget'
  2. A visitor who completes an assessment provides an email to receive full results; their email lands in the subscriber list with source = 'assessment' and their assessment result row is linked to that email
  3. The weekly-newsletter cron draws from one deduplicated send list that merges email_subscribers (public captures) and email_subscriptions (member preferences), with unsubscribe honored from either source — no duplicate sends to the same address
  4. Every Monday morning Lorenzo receives a Telegram message listing new subscribers, prayer requests submitted, debrief registrations, AI conversations started, and any giving activity from the prior week — no manual query required
**Plans**: TBD

### Phase 13: Weekly AI Ops Loop
**Goal**: Lorenzo can run the ministry's weekly content cadence entirely from his phone — AI-drafted devotional and newsletter appear for his review, one tap approves or rejects, and approved content sends to the unified list via Resend with nothing ever auto-sending unapproved
**Depends on**: Phase 12 (reconciled subscriber list must exist before approved content can send; digest validates Telegram delivery before approval flow uses the same channel)
**Requirements**: OPS-01, OPS-02, OPS-03, OPS-04
**Success Criteria** (what must be TRUE):
  1. Each week, Lorenzo receives a drafted devotional on Telegram (or via magic link) generated from his actual teaching and sermon corpus — the draft is identifiably grounded in TPC-specific content, not generic AI output
  2. Each week, Lorenzo receives a drafted newsletter assembled from the week's real platform activity (teachings published, prophecies posted, events, Kenya updates) — not a generic template
  3. Lorenzo can approve or reject either draft with a single button tap from his phone without opening a browser or logging into admin; the approval state is recorded in the DB
  4. An approved devotional or newsletter sends to the unified subscriber list via the existing Resend pipeline; an unapproved draft sits in the queue indefinitely and never sends until explicitly approved
**Plans**: TBD

---

## Progress

**Execution Order:**
Phases execute in numeric order: 10 → 11 → 12 → 13

Phase 10 must complete first (unified capture infrastructure). Phase 11 is hard-date-gated (live by ~June 20). Phase 12 builds on both 10 and 11. Phase 13 builds on 12.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 10. Surface + Capture Foundation | 0/TBD | Not started | - |
| 11. Kenya Debrief Activation | 0/TBD | Not started | - |
| 12. AI Front Door + Ops Foundation | 0/TBD | Not started | - |
| 13. Weekly AI Ops Loop | 0/TBD | Not started | - |
