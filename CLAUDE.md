# CLAUDE.md - TPC Ministries Platform

## Project Identity
**Name:** TPC Ministries Platform
**Type:** Ministry Management Platform
**Classification:** 🟡 ANCILLARY
**Location:** ~/tpc-ministries-platform

## Supabase Database (DEDICATED)
| Field | Value |
|-------|-------|
| **Project Name** | tpc-ministries-platform |
| **Project ID** | `naulwwnzrznslvhhxfed` |
| **URL** | `https://naulwwnzrznslvhhxfed.supabase.co` |
| **MCP Server** | `supabase` (when in this directory) |
| **MCP Server (global)** | `supabase-tpc` (from home directory) |

### How to Access Database
- **From ~/tpc-ministries-platform**: Use `mcp__supabase__*` tools
- **From home (~/)**: Use `mcp__supabase-tpc__*` tools

### Database Tables (16)
- `members` - Member profiles and tiers
- `donations` - Giving records (Stripe)
- `teachings` - Sermon/teaching content
- `teaching_progress` - Watch history
- `prayer_requests` - Prayer submissions
- `prayer_supporters` - Prayer tracking
- `events` - Event management
- `event_registrations` - Event signups
- `prophecies` - Public + personal prophecy system
- `assessments` - Spiritual assessments
- `assessment_results` - Assessment answers
- `resources` - Downloads/ebooks
- `messages` - Two-way messaging
- `notifications` - In-app notifications
- `journal_entries` - Member journals
- `audit_log` - Admin audit trail

### Schema File
Run `supabase/schema.sql` in Supabase SQL Editor to create all tables.

## What This Is
Digital platform for TPC Ministries - member management, prophecy system, content library, communications. 85% complete, needs deployment.

## Purpose
- Member management (Free, Partner, Covenant tiers)
- Unique prophecy system (public hub + personal vault)
- Teaching content library
- Prayer request management
- Event coordination
- Donation processing

## Tech Stack
- Next.js 14+
- Supabase (Postgres, Auth, Storage)
- Tailwind CSS + shadcn/ui
- Stripe (donations)
- Resend (email)
- Twilio (SMS)

## Key Features
- [x] Member profiles and tiers
- [x] Prophecy submission and management
- [x] Content library
- [x] Admin dashboard
- [ ] Email/SMS integration
- [ ] Production deployment

## Geographic Reach
Kenya, South Africa, Grenada, United States

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run linter
```

## Environment Variables
`.env.local` contains:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Stripe, Resend, Twilio keys (when configured)

## Priority
Deploy to production and connect tpcmin.org domain.

## Recommended Skills
- `/db-safe` - Member data is PROTECTED
- `/content faith` - Ministry content creation
- `/design` - UI improvements
- `/deploy` - Before production push
