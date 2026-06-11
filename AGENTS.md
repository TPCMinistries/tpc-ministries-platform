# AGENTS.md — TPC Ministries Platform

> For Codex / ChatGPT / any non-Claude agent picking up work here.
> **Start by reading `.planning/HANDOFF-2026-06-11.md`** — it is the active work plan.

## What this is
Public ministry site + member platform for TPC Ministries (Prophet Lorenzo Daughtry-Chambers), live at **tpcmin.org**. Next.js (App Router) + Tailwind + shadcn/ui + Supabase + Stripe + Resend, hosted on Vercel.

## Current state (2026-06-11)
- Milestone **v1.0 shipped** 2026-05-19 (Kenya recap, AI widget, conversion path). Archived in `.planning/MILESTONES.md`.
- Milestone **v2.0 "TPC Alive"** is defined and roadmapped, **not started**. 19 requirements, 4 phases (10–13).
- **Hard date: Kenya Debrief is Saturday June 27** (9 AM PT / 12 PM ET). Phase 11 must be live by ~June 20.

## Planning system (read these, keep them updated)
| File | Purpose |
|------|---------|
| `.planning/HANDOFF-2026-06-11.md` | **The handoff plan — start here** |
| `.planning/ROADMAP.md` | Phases 10–13 with success criteria |
| `.planning/REQUIREMENTS.md` | The 19 v2.0 requirements (OPS/SURF/DOOR/KENYA) |
| `.planning/STATE.md` | Live position + accumulated decisions + reality baseline |
| `.planning/PROJECT.md` | Project charter and key decisions |

After completing work: tick requirements in REQUIREMENTS.md, update STATE.md "Current Position" and "Session Continuity", and check off the phase in ROADMAP.md. Commit docs with code.

## Hard rules
1. **Database safety**: member data is HIGH sensitivity and the Supabase project may be shared with other apps. **Additive migrations only.** Never DROP, TRUNCATE, or DELETE data; never weaken an RLS policy. New tables need RLS from day one.
2. **No deletions of routes/features**: v2.0 hides dark routes behind a feature flag and redirects to dashboard — code stays in the repo.
3. **Email sends from `tpcmin.com`** (the verified Resend domain), not tpcmin.org. Keep this until .org is verified in Resend.
4. **Nothing auto-sends**: any AI-drafted content (devotional, newsletter) must sit in an approval queue until Lorenzo explicitly approves (OPS-04).
5. **No n8n/Zapier glue** — direct integrations only.
6. **origin/main is canonical.** `git fetch` before starting; this repo is worked from two machines. On macOS, `git add` is case-insensitive-silent — verify with `git diff --cached --stat` before committing.
7. **No new member-facing features** — v2.0 operates what exists.
8. Secrets live in `.env.local` and Vercel env — never commit them.

## Database access
- Supabase project: `naulwwnzrznslvhhxfed` (https://naulwwnzrznslvhhxfed.supabase.co)
- Keys in `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- Server-side/background work uses the service-role (admin) client, never the anon client.
- Migrations: SQL files under `supabase/`; apply via Supabase SQL editor or CLI.

## Commands
```bash
npm run dev      # dev server
npm run build    # must pass before pushing
npm run lint
```

## Deploy
Vercel, auto-deploys from `main`. Verify the build locally first.
