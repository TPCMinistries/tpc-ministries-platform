# Requirements — Milestone v2.0 "TPC Alive"

> Defined: 2026-06-10. Research: skipped — the 2026-06-09 full-platform audit (code + live DB + design walkthrough) is the research base; see STATE.md "Platform Reality Baseline". v1.0 requirements archived at `archive-v1.0-REQUIREMENTS.md`.

## v2.0 Requirements

### OPS — Weekly AI Ops Loop

- [ ] **OPS-01**: Lorenzo receives a drafted weekly devotional, generated from his actual teaching/sermon corpus (not generic AI copy), queued for approval before any send
- [ ] **OPS-02**: Lorenzo receives a drafted weekly newsletter assembled from the week's real platform content (teachings, prophecies, events, Kenya updates), queued for approval
- [ ] **OPS-03**: Lorenzo can approve or reject a queued draft in one tap from his phone (Telegram button or magic link) without logging into admin
- [ ] **OPS-04**: Approved content sends via the existing Resend pipeline to the unified subscriber list; nothing ever auto-sends unapproved
- [ ] **OPS-05**: Lorenzo receives a Monday morning ops digest (new subscribers, prayer requests, giving, debrief registrations, AI conversations, signups) on Telegram
- [ ] **OPS-06**: The two subscriber stores are reconciled — public captures (email_subscribers) and member preferences (email_subscriptions) feed one deduplicated send list with unsubscribe honored

### SURF — Shrink the Member Surface

- [ ] **SURF-01**: Member navigation exposes exactly five rooms — Watch, Assess, Pray, Give, Kenya — plus account settings
- [ ] **SURF-02**: All other member routes are hidden behind a feature flag and redirect to the dashboard (no 404s, no dead links); code preserved, not deleted
- [ ] **SURF-03**: Every surface that remains visible is verified working end-to-end against the live schema (a member can complete each room's core action without silent failure)
- [ ] **SURF-04**: Admin nav and dashboard contain no links to hidden member routes

### DOOR — AI Front Door

- [ ] **DOOR-01**: A public visitor who finishes the Ask Prophet Lorenzo preview is offered email capture (not account creation) to continue the conversation
- [ ] **DOOR-02**: A public visitor who completes an assessment provides an email to receive full results, landing in the subscriber list with the assessment saved
- [ ] **DOOR-03**: Every public email capture (AI widget, assessment, footer, debrief, giving) lands in one list with source attribution
- [ ] **DOOR-04**: The notification-permission prompt no longer fires on first landing — it appears only after meaningful engagement (second visit or completed action)

### KENYA — June 27 Debrief Activation (hard date)

- [ ] **KENYA-01**: Each of the 27 delegates receives a personal invite email linking to their delegate portal, with trip media access gated behind login
- [ ] **KENYA-02**: A visitor can register for the June 27 debrief on tpcmin.org and receives a confirmation email with calendar invite (.ics)
- [ ] **KENYA-03**: Registered attendees receive automated reminders at T-7, T-1, and day-of (verify the existing cron against real registrations)
- [ ] **KENYA-04**: The debrief ends with an on-screen CTA into the assessment/email-capture funnel, and conversions are measurable in the DB
- [ ] **KENYA-05**: Admin sees an activation scoreboard in the Kenya Command Center — invites sent, portal logins, debrief registrations, post-event captures

## Future Requirements (deferred)

- Payments decision + end-to-end Stripe verification on /giving (platform processes vs. logbook)
- Post-June-27 security hardening pass (assessment UPDATE policy, bucket listing, check_email_exists, leaked-password protection, USING(true) cleanup)
- LAUNCH-01 mobile perf completion (hero AVIF/WebM, defer AI widget mount)
- Podcast Eps 1 & 2 publication
- Transparent TPC logo asset (fixes nav white-box, mission section, social cards)

## Out of Scope

- Any new member-facing feature — 60 routes exist for 1 member; v2.0 operates what exists
- n8n/Zapier glue — direct integrations only (ecosystem rule)
- Re-design work — v1.0 design system stands; only the fixes above
- Member-data schema changes beyond what OPS/KENYA strictly require — shared DB risk

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| OPS-01 | Phase 13 | Pending |
| OPS-02 | Phase 13 | Pending |
| OPS-03 | Phase 13 | Pending |
| OPS-04 | Phase 13 | Pending |
| OPS-05 | Phase 12 | Pending |
| OPS-06 | Phase 12 | Pending |
| SURF-01 | Phase 10 | Pending |
| SURF-02 | Phase 10 | Pending |
| SURF-03 | Phase 10 | Pending |
| SURF-04 | Phase 10 | Pending |
| DOOR-01 | Phase 12 | Pending |
| DOOR-02 | Phase 12 | Pending |
| DOOR-03 | Phase 10 | Pending |
| DOOR-04 | Phase 10 | Pending |
| KENYA-01 | Phase 11 | Pending |
| KENYA-02 | Phase 11 | Pending |
| KENYA-03 | Phase 11 | Pending |
| KENYA-04 | Phase 11 | Pending |
| KENYA-05 | Phase 11 | Pending |
