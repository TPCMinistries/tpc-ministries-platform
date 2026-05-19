-- Fix assessment tables to match what the live quiz/results code expects.
-- Pre-state (verified 2026-05-19 via Supabase MCP):
--   * `assessment_responses` did NOT exist; live quiz code writes to it.
--   * `member_assessment_results` existed but was missing every column the live
--     code inserts (response_id, primary_result, scores, title, strengths, etc.).
--   * Both tables had 0 rows, so additive changes are safe.
-- See .planning/AUDIT-2026-05-19.md §1.

------------------------------------------------------------
-- 1. assessment_responses (new)
------------------------------------------------------------
create table if not exists public.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  assessment_type text not null,
  email text,
  responses jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assessment_responses_member_id_idx
  on public.assessment_responses (member_id);
create index if not exists assessment_responses_type_completed_idx
  on public.assessment_responses (assessment_type, completed_at desc);

alter table public.assessment_responses enable row level security;

-- INSERT: anyone can submit (public quiz). The UUID acts as the unguessable token.
drop policy if exists assessment_responses_insert_public on public.assessment_responses;
create policy assessment_responses_insert_public
  on public.assessment_responses for insert
  to anon, authenticated
  with check (true);

-- UPDATE: anyone can update a row they have the id for (resume in-progress quiz).
drop policy if exists assessment_responses_update_public on public.assessment_responses;
create policy assessment_responses_update_public
  on public.assessment_responses for update
  to anon, authenticated
  using (true) with check (true);

-- SELECT: members can read their own; otherwise public-by-id is fine for results.
drop policy if exists assessment_responses_select_public on public.assessment_responses;
create policy assessment_responses_select_public
  on public.assessment_responses for select
  to anon, authenticated
  using (true);

------------------------------------------------------------
-- 2. member_assessment_results (add missing columns)
------------------------------------------------------------
alter table public.member_assessment_results
  add column if not exists response_id uuid references public.assessment_responses(id) on delete set null,
  add column if not exists primary_result text,
  add column if not exists secondary_result text,
  add column if not exists tertiary_result text,
  add column if not exists scores jsonb,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists strengths jsonb,
  add column if not exists growth_areas jsonb,
  add column if not exists ministry_recommendations jsonb,
  add column if not exists scripture_references jsonb,
  add column if not exists next_steps jsonb;

create index if not exists member_assessment_results_member_idx
  on public.member_assessment_results (member_id, created_at desc);
create index if not exists member_assessment_results_response_idx
  on public.member_assessment_results (response_id);

-- RLS was already enabled. Make sure the policies match the access pattern.
-- The results page reads by id without auth (UUID is the access token).
drop policy if exists member_assessment_results_insert_public on public.member_assessment_results;
create policy member_assessment_results_insert_public
  on public.member_assessment_results for insert
  to anon, authenticated
  with check (true);

drop policy if exists member_assessment_results_select_public on public.member_assessment_results;
create policy member_assessment_results_select_public
  on public.member_assessment_results for select
  to anon, authenticated
  using (true);

------------------------------------------------------------
-- 3. updated_at trigger on assessment_responses
------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists assessment_responses_set_updated_at on public.assessment_responses;
create trigger assessment_responses_set_updated_at
  before update on public.assessment_responses
  for each row execute function public.set_updated_at();
