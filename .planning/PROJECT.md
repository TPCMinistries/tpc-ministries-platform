# TPC Ministries — GSD Project File

> Initialized: 2026-02-22 | Status: Brownfield | Tier: ANCILLARY

## Overview

**Project:** TPC Ministries Platform
**Path:** ~/tpc-ministries-platform
**Description:** Digital platform for TPC Ministries church. Member management, events, communications.
**Core Value:** Ministry platform serving congregation — member data protection is key

## Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Next.js |
| Styling | Tailwind CSS, shadcn/ui |
| Database | Supabase (Postgres, Auth) |
| Hosting | Vercel |
| Auth | Supabase Auth |

## Database

- **Supabase Project:** TPC Ministries
- **Project ID:** naulwwnzrznslvhhxfed
- **MCP Connection:** `supabase-tpc`
- **Has User Data:** YES — member data (HIGH sensitivity)
- **Shared With:** Streams of Grace, Boardroom Prayer Room

## Ecosystem Position

- **Organization:** TPC Ministries (via IHA)
- **Tier:** ANCILLARY
- **Validated:** Ministry platform live, member management operational
- **Risk Level:** HIGH — member data sensitivity, shared database

## Constraints

1. Shares database with Streams of Grace and Boardroom Prayer Room — schema changes affect all three
2. Member data is HIGH sensitivity — treat with care
3. Must follow Supabase safety rules (no DROP/DELETE without approval)
4. All database changes need RLS policies
5. TypeScript strict mode, no `any` types
6. Use `supabase-tpc` MCP connection for database operations

## Key Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-22 | GSD initialized (brownfield) | Bringing project into structured planning |

## Milestones

None yet. Use `/gsd:new-milestone` to create the first milestone.

## Links

- Ecosystem: ~/CLAUDE.md
- Shared DB projects: Streams of Grace, Boardroom Prayer Room
