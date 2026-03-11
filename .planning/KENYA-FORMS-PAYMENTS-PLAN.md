# Kenya Trip — Forms + Payments Build Plan

> Created: 2026-03-10 | Status: IN PROGRESS
> Marketing launch: 2026-03-11 (tomorrow)
> Trip dates: April 22 – May 7, 2026

## Context

Lorenzo's admin team needs structured forms for the Kenya Kingdom Impact Trip. The interest form exists but the Travel Form (detailed logistics), payment plans, and admin-side tracking need to be built. Marketing starts tomorrow — the interest form at `/kenya` must work correctly as the entry point.

## Architecture: Progressive Form Pipeline

```
STAGE 1: Interest Form (/kenya) — EXISTS, needs verification
  ↓ Admin reviews in Command Center → Approves
STAGE 2: Travel Form (/kenya/travel) — BUILD
  ↓ Participant completes detailed travel logistics
STAGE 3: Payment (/kenya/pay) — BUILD
  ↓ Full payment, deposit, or installment plan via Stripe
STAGE 4: Medical + Waiver (/kenya/medical, /kenya/waiver) — FUTURE
  ↓ Closer to trip date
STAGE 5: Packing Checklist — EXISTS in DB, needs form
```

All data flows into `kenya_trip_participants` table — one record per person, progressively enriched. Admin sees completion status per participant in Command Center.

---

## Phase 1: Database Migration (043)
**Priority: CRITICAL — blocks everything**

### New columns on `kenya_trip_participants`:
```sql
-- Identity / Display
honorific VARCHAR(20)           -- Dr., Rev., Min., Esq., etc.
display_first_name VARCHAR(100) -- Name as on Mission Trip ID
display_last_name VARCHAR(100)  -- Name as on Mission Trip ID
legal_full_name VARCHAR(255)    -- Full name as on passport

-- Contact / Organization
mailing_address TEXT
organization VARCHAR(200)
org_title VARCHAR(100)          -- Title at organization

-- Travel Logistics
travel_accommodation_type VARCHAR(50)
  -- 'team_flight', 'team_hotel', 'self_arrange', 'other'
travel_accommodation_other TEXT
travel_date_in DATE
travel_date_out DATE
departure_airport VARCHAR(200)
return_airport VARCHAR(200)

-- Accessibility
special_assistance VARCHAR(50)
  -- 'none', 'wheelchair', 'seating', 'other'
special_assistance_details TEXT
tsa_known_traveler_number VARCHAR(50)
travel_notes TEXT               -- Additional booking notes

-- Payment Plans
payment_type VARCHAR(20) DEFAULT 'full'
  -- 'full', 'deposit', 'installment'
trip_cost DECIMAL(10,2) DEFAULT 3500.00
deposit_amount DECIMAL(10,2) DEFAULT 0
stripe_customer_id VARCHAR(255)
stripe_subscription_id VARCHAR(255)
payment_plan_months INTEGER     -- e.g., 4, 6

-- Form Completion Tracking
interest_form_completed_at TIMESTAMPTZ
travel_form_completed_at TIMESTAMPTZ
medical_form_completed_at TIMESTAMPTZ
waiver_signed_at TIMESTAMPTZ
payment_initiated_at TIMESTAMPTZ
```

### New table: `kenya_trip_payments` (installment tracking)
```sql
CREATE TABLE kenya_trip_payments (
  id UUID PRIMARY KEY,
  participant_id UUID REFERENCES kenya_trip_participants(id),
  trip_id UUID REFERENCES kenya_trips(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_number INTEGER,        -- 1 of 4, 2 of 4, etc.
  total_payments INTEGER,
  due_date DATE,
  status VARCHAR(20),            -- pending, paid, overdue, failed
  stripe_payment_intent_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Phase 2: Fix Interest Form Pipeline
**Priority: CRITICAL — marketing starts tomorrow**

### Issues to fix:
1. `kenya_trip_applications` table doesn't exist — form falls back to `contact_submissions` silently
2. Current form submits to a separate table, NOT `kenya_trip_participants`
3. Service tracks don't match admin's list (missing "All Ministries")

### Solution:
- Create `kenya_trip_applications` table OR route interest form directly into `kenya_trip_participants` with `application_status: 'pending'`
- **Decision: Route to `kenya_trip_participants` directly** — avoids duplicate tables, data is immediately in Command Center
- Update API route to use `createAdminClient()` (public form, no auth context)
- Add "All Ministries" track option

---

## Phase 3: Travel Form
**Priority: HIGH — send to approved participants**

### Page: `/kenya/travel` (public, token-gated)
- Greeting header explaining the form purpose + trip overview
- Pre-filled with name/email from their interest form submission
- File upload for passport photo page (Supabase Storage)
- Auto-saves to `kenya_trip_participants` record

### Fields (from admin's spec):
1. First Name (as on Mission Trip ID)
2. Last Name (as on Mission Trip ID)
3. Special titles (Dr., Esq., Minister, Reverend, etc.)
4. Ministry of Interest (Ministry, Health, Education, Business, All Ministries)
5. Email
6. Cell Phone
7. Mailing Address
8. Organization
9. Title (at org)
10. Location
11. Travel Accommodation Type (radio/select)
    - Team books flight (round-trip)
    - Team books accommodations
    - Self-arrange everything
    - Other (text field)
12. Travel Dates: In / Out
13. Full Legal Name (as on passport)
14. Date of Birth
15. Passport photo page upload
16. Departure Airport (or "n/a")
17. Return Airport (or "n/a")
18. Special assistance needs (radio)
    - No additional needs
    - Wheelchair required
    - Seating needs (describe in other)
    - Other
19. TSA / Known Traveler Number (or "n/a")
20. Additional travel/booking notes
21. Organizer note about ground transportation (display only)

### API: `POST /api/kenya/travel-form`
- Accepts form data + file upload
- Updates existing `kenya_trip_participants` record
- Sets `travel_form_completed_at`
- Sends confirmation email + admin notification

---

## Phase 4: Payment System
**Priority: HIGH — needed for committed participants**

### Page: `/kenya/pay` (or `/kenya/pay/[slug]`)
- Shows participant's trip cost (after any scholarship)
- Payment options:
  1. **Pay in Full** — single Stripe checkout
  2. **Deposit ($500)** — Stripe checkout, balance tracked
  3. **4-Month Plan** — Stripe subscription ($875/mo)
  4. **6-Month Plan** — Stripe subscription ($583/mo)
  5. **Custom** — for scholarship recipients
- Progress bar showing amount paid vs. total
- Payment history table

### API Routes:
- `POST /api/kenya/payment/checkout` — full or deposit payment
- `POST /api/kenya/payment/plan` — create installment subscription
- Webhook handles `invoice.paid` events for installment tracking

---

## Phase 5: Command Center Updates
**Priority: MEDIUM — admin team needs this**

### New features:
1. **Completion Tracker Column** — shows per-participant: Interest ✓ | Travel ✓ | Payment ✓ | Medical ✗ | Waiver ✗
2. **Travel Info Tab** — view/edit all travel logistics per participant
3. **Payment Tab** — payment status, plan details, payment history per participant
4. **Export to CSV** — download participant roster as spreadsheet (replaces Google Sheets tracker)
5. **Bulk email/link sender** — send travel form link to all approved participants

---

## Phase 6: Medical + Waiver Forms (FUTURE)
- Medical form: allergies, medications, conditions, dietary, vaccination records
- Emergency contact form (can bundle with medical)
- Digital waiver/liability release with e-signature
- Packing checklist acknowledgment

---

## File Inventory (Expected)

### New Files:
- `supabase/migrations/043_kenya_travel_payments.sql`
- `app/(public)/kenya/travel/page.tsx`
- `components/kenya/travel-form.tsx`
- `app/(public)/kenya/pay/page.tsx` (or `[slug]`)
- `components/kenya/payment-options.tsx`
- `app/api/kenya/travel-form/route.ts`
- `app/api/kenya/payment/checkout/route.ts`
- `app/api/kenya/payment/plan/route.ts`

### Modified Files:
- `app/api/public/kenya-trip/route.ts` — fix to use participants table + adminClient
- `components/kenya/kenya-trip-form.tsx` — add "All Ministries" track
- `app/(admin)/kenya-command-center/page.tsx` — travel tab, payment tab, completion tracker, CSV export
- `app/(admin)/kenya-command-center/participant/[id]/page.tsx` — travel + payment sections

---

## Execution Order

```
1. Migration 043 (DB)          ← do first, unblocks everything
2. Fix interest form + API     ← CRITICAL for tomorrow's marketing
3. Travel Form page + API      ← send to approved participants
4. Payment system              ← Stripe plans + installments
5. Command Center updates      ← admin visibility
6. Medical + Waiver            ← future phase
```

## Open Questions
- [ ] Is Stripe fully configured in production? (STRIPE_SECRET_KEY, webhook secret)
- [ ] Is Resend configured for transactional emails?
- [ ] Should travel form be gated by a unique token/link per participant, or open?
- [ ] Payment plan deadlines — when is final payment due?
- [ ] Scholarship application process — separate form or part of interest form?
