-- Get Involved nurture sequences
-- Applied to project naulwwnzrznslvhhxfed on 2026-06-19.
--
-- 1) Widen automated_workflows.trigger_type CHECK to match the trigger types the
--    workflow engine (app/api/admin/workflows/run/route.ts) actually supports,
--    and add the new `lead_nurture` type used by the Get Involved funnel.
-- 2) Seed 6 nurture sequences (11 timed emails) across the 3 Get Involved paths.
--    All seeded INACTIVE (is_active = false) — review the copy in
--    Admin -> Workflows, then toggle each one on to start sending.

ALTER TABLE public.automated_workflows
  DROP CONSTRAINT IF EXISTS automated_workflows_trigger_type_check;

ALTER TABLE public.automated_workflows
  ADD CONSTRAINT automated_workflows_trigger_type_check
  CHECK ((trigger_type)::text = ANY (ARRAY[
    'birthday','anniversary','new_member','inactive','milestone',
    'prayer_answered','schedule','partner_welcome','partner_hub_reminder',
    'partner_gathering_reminder','payment_attention','lead_nurture'
  ]::text[]));

INSERT INTO automated_workflows (name, description, trigger_type, action_type, is_active, trigger_config, action_config) VALUES

-- PARTICIPATE / Newcomer (every lead) -----------------------------------------
('Newcomer · Day 2 · Welcome', $$Get Involved nurture: warm welcome to every new lead 2 days after signup.$$, 'lead_nurture', 'email', false,
 '{"days_after":2}'::jsonb,
 jsonb_build_object('subject', $$Welcome to TPC, {first_name} 🙏$$, 'message', $$Hi {first_name},

We're so glad you reached out. TPC Ministries exists to help you grow — through prophetic teaching, prayer, and a community walking it out together.

A great place to start:

• Daily devotional: https://www.streamsofgrace.app
• Teachings & messages: https://tpcmin.org/teachings
• Discover your gifts: https://tpcmin.org/assessments

We'll keep you posted on what's ahead. If you ever want to talk or need prayer, just reply to this email.

Blessings,
TPC Ministries$$)),

('Newcomer · Day 5 · Create your free account', $$Get Involved nurture: soft conversion to a free member account.$$, 'lead_nurture', 'email', false,
 '{"days_after":5}'::jsonb,
 jsonb_build_object('subject', $${first_name}, unlock your full TPC experience$$, 'message', $$Hi {first_name},

Want the full experience? Create a free member account and you'll get your own dashboard — daily check-ins, a prayer journal, teachings, assessments, and personal prophecy.

Create your free account: https://tpcmin.org/auth/signup

It takes less than a minute.

Blessings,
TPC Ministries$$)),

('Newcomer · Day 10 · Take a next step', $$Get Involved nurture: present the three paths (member / partner / missions).$$, 'lead_nurture', 'email', false,
 '{"days_after":10}'::jsonb,
 jsonb_build_object('subject', $$What's your next step with TPC?$$, 'message', $$Hi {first_name},

It's been a little while since you connected — we'd love to help you take a next step:

• Become a member (free): https://tpcmin.org/auth/signup
• Partner with the ministry: https://tpcmin.org/partners
• Explore missions (Kenya 2026): https://tpcmin.org/kenya-2026

Wherever you are, we're glad you're here. Reply anytime — we read every message.

Blessings,
TPC Ministries$$)),

-- PARTICIPATE / Serve ---------------------------------------------------------
('Serve · Day 3 · How serving works', $$Get Involved nurture for leads who chose "serve / volunteer".$$, 'lead_nurture', 'email', false,
 '{"days_after":3,"interest_tag":"serve"}'::jsonb,
 jsonb_build_object('subject', $${first_name}, ready to serve? Here's how$$, 'message', $$Hi {first_name},

You said you'd love to serve — that means a lot. Serving is one of the best ways to grow and to make a real difference.

Here's how it works: as ministry teams and opportunities open up (worship, prayer, outreach, missions support, and more), we'll reach out to match you with a team.

To help us place you well, just reply and let us know what you're drawn to and your general availability.

Thank you for your heart to serve.

Blessings,
TPC Ministries$$)),

-- PARTICIPATE / Missions ------------------------------------------------------
('Missions · Day 3 · Kenya & the nations', $$Get Involved nurture for leads who chose "future mission trips".$$, 'lead_nurture', 'email', false,
 '{"days_after":3,"interest_tag":"missions"}'::jsonb,
 jsonb_build_object('subject', $${first_name}, a heart for the nations 🌍$$, 'message', $$Hi {first_name},

We're thrilled you're interested in missions! God is doing remarkable things through TPC across Kenya, South Africa, Grenada, and beyond.

Our next major focus is Kenya 2026. See the vision, the team, and how to take part:

• Kenya 2026: https://tpcmin.org/kenya-2026
• Support the mission: https://tpcmin.org/missions/support

Whether you go, give, or pray — there's a place for you. Reply anytime with questions.

Blessings,
TPC Ministries$$)),

-- PARTICIPATE / October gathering ---------------------------------------------
('October · Day 3 · Save the date', $$Get Involved nurture for leads who chose "the October gathering".$$, 'lead_nurture', 'email', false,
 '{"days_after":3,"interest_tag":"october-gathering"}'::jsonb,
 jsonb_build_object('subject', $$Save the date — we'll see you in October, {first_name}$$, 'message', $$Hi {first_name},

Thank you for signing up for our October gathering — we can't wait to have you there!

We're putting the final details together now. Keep an eye on your inbox: we'll send the date, time, and location (plus how to join online) as soon as they're confirmed.

In the meantime, you can stay connected here: https://tpcmin.org/calendar

See you soon,
TPC Ministries$$)),

-- MEMBER onboarding (free signup) ---------------------------------------------
('Member · Day 1 · Welcome to your dashboard', $$Onboarding drip for new free-tier members.$$, 'new_member', 'email', false,
 '{"days_after":1}'::jsonb,
 jsonb_build_object('subject', $$Welcome to TPC, {first_name} — here's your tour$$, 'message', $$Hi {first_name},

Welcome to the TPC family! Your member dashboard is ready. Here's what you can do today:

• Daily check-in & devotional
• Submit prayer requests and journal
• Watch teachings and sermons
• Receive personal prophecy

Jump in: https://tpcmin.org/dashboard

We're glad you're here.

Blessings,
TPC Ministries$$)),

('Member · Day 4 · Discover your gifts', $$Onboarding drip: nudge new members to take assessments.$$, 'new_member', 'email', false,
 '{"days_after":4}'::jsonb,
 jsonb_build_object('subject', $${first_name}, discover how God has wired you$$, 'message', $$Hi {first_name},

Have you taken your spiritual assessments yet? They're a powerful way to understand your gifts, your prophetic expression, and your current season — and your results personalize your TPC experience.

Start here: https://tpcmin.org/assessments

Blessings,
TPC Ministries$$)),

('Member · Day 9 · Go deeper', $$Onboarding drip: groups + soft partner invite.$$, 'new_member', 'email', false,
 '{"days_after":9}'::jsonb,
 jsonb_build_object('subject', $$Ready to go deeper, {first_name}?$$, 'message', $$Hi {first_name},

You've had a week to settle in — here are two great next steps:

• Join a group or season: https://tpcmin.org/groups
• Become a Covenant Partner and help sustain the ministry: https://tpcmin.org/partners

Thank you for being part of TPC.

Blessings,
TPC Ministries$$)),

-- PARTNER onboarding (covenant) -----------------------------------------------
('Partner · Day 1 · Welcome, Covenant Partner', $$Onboarding for new partner/covenant members (uses Covenant Partner email template).$$, 'partner_welcome', 'email', false,
 '{"days_after":1,"partner_email_kind":"welcome"}'::jsonb,
 jsonb_build_object('template','covenant-partner','ctaText',$$Open your Partner Hub$$,'ctaUrl',$$https://tpcmin.org/partner-hub$$,'subject', $$Welcome, Covenant Partner 🤝$$, 'message', $$Thank you for becoming a Covenant Partner, {first_name}. Your partnership sustains prophetic ministry, discipleship, and missions around the world.

Here's what's now available to you:

• Monthly live partner gatherings
• Bi-weekly teachings by email
• Practical development & future-readiness trainings
• Quarterly books and resources

Start in your Partner Hub below.$$)),

('Partner · Day 7 · Your Partner Hub', $$Onboarding: remind new partners to explore the Partner Hub.$$, 'partner_hub_reminder', 'email', false,
 '{"days_after":7,"partner_email_kind":"resource"}'::jsonb,
 jsonb_build_object('template','covenant-partner','ctaText',$$Visit Partner Hub$$,'ctaUrl',$$https://tpcmin.org/partner-hub$$,'subject', $${first_name}, have you explored your Partner Hub?$$, 'message', $$It's been a week since you joined as a Covenant Partner. Make sure you've explored everything waiting for you — gatherings, teachings, and resources are all in one place.

We're grateful to be on this journey with you.$$));
