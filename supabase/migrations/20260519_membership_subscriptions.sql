-- Membership subscription support.
-- The live partner page hardcodes tier slugs ('partner' | 'covenant') and the
-- membership_tiers table is empty. Adding tier_slug lets us record memberships
-- without forcing a tier_id FK against an unpopulated lookup table.
-- See .planning/AUDIT-2026-05-19.md §2c, §2d.

alter table public.member_subscriptions
  add column if not exists tier_slug text,
  add column if not exists billing_cycle text,
  add column if not exists user_id uuid,
  add column if not exists stripe_customer_id text,
  add column if not exists canceled_at timestamptz;

create index if not exists member_subscriptions_member_idx
  on public.member_subscriptions (member_id);
create index if not exists member_subscriptions_stripe_sub_idx
  on public.member_subscriptions (stripe_subscription_id);

-- Re-enable RLS (currently disabled) so client-side reads don't blow open.
alter table public.member_subscriptions enable row level security;

drop policy if exists member_subscriptions_select_own on public.member_subscriptions;
create policy member_subscriptions_select_own
  on public.member_subscriptions for select
  to authenticated
  using (
    member_id in (select id from public.members where user_id = auth.uid())
    or user_id = auth.uid()
  );

-- Server-side admin writes via service role bypass RLS, so no insert/update
-- policy is needed for the webhook handler. Add a safety net for admins only.
drop policy if exists member_subscriptions_admin_all on public.member_subscriptions;
create policy member_subscriptions_admin_all
  on public.member_subscriptions for all
  to authenticated
  using (
    exists (select 1 from public.members m
            where m.user_id = auth.uid() and m.role in ('admin','owner'))
  )
  with check (
    exists (select 1 from public.members m
            where m.user_id = auth.uid() and m.role in ('admin','owner'))
  );
