# TPC Get Involved — Email Copy

Exported copy for the Get Involved funnel. Edit these to draft changes, but note
the **live source of truth** differs by email:

| Email | Live source | How to change |
|---|---|---|
| `00-confirmation-instant` | `lib/email/templates/lead-confirmation.tsx` | Edit the React template + deploy |
| `01`–`11` (the drips) | DB table `automated_workflows.action_config` | Edit in Admin → Workflows, or update the DB, or re-run `supabase/migrations/seed_get_involved_nurture.sql` |

## The 6 sequences (11 drip emails + 1 instant)

**Instant**
- `00-confirmation-instant` — sent the moment someone submits (LIVE)

**Participate → Newcomer** (every lead)
- `01-newcomer-day02-welcome`
- `02-newcomer-day05-create-account`
- `03-newcomer-day10-next-step`

**Participate → Serve** (interest_tag=serve)
- `04-serve-day03`

**Participate → Missions** (interest_tag=missions)
- `05-missions-day03`

**Participate → October gathering** (interest_tag=october-gathering)
- `06-october-day03`

**Member** (new free account)
- `07-member-day01-welcome`
- `08-member-day04-assessments`
- `09-member-day09-go-deeper`

**Partner** (covenant)
- `10-partner-day01-welcome`
- `11-partner-day07-hub`

## Status
All 11 drip emails are seeded as **inactive drafts**. They will not send until
activated in Admin → Workflows. The daily cron (`/api/admin/workflows/run`,
13:00 UTC) is already authorized in production.

`{first_name}` / `{name}` are filled in per recipient at send time.
