# Kenya Trip - Personal Fundraising System Plan

## Current State
- Members can apply via `/kenya-trip`
- Application creates `kenya_trip_participants` record with `pending` status
- Admin reviews in Kenya Command Center
- Approved participants can upload documents

## What's Needed

### 1. Auto-Population on Application ✓
Already working - when someone applies, their record is created with:
- Personal info from their member profile
- Service track selection
- Emergency contacts
- Medical info

### 2. Personal Fundraising Pages (NEW)

**Goal:** Each participant gets a shareable link like:
```
tpcmin.org/kenya/support/john-smith
```

Where supporters can donate specifically to help that person reach their goal.

---

## Implementation Plan

### Phase 1: Database Setup

**Add to `kenya_trip_participants`:**
```sql
ALTER TABLE kenya_trip_participants ADD COLUMN
  fundraising_slug VARCHAR(100) UNIQUE,
  fundraising_page_enabled BOOLEAN DEFAULT true,
  fundraising_story TEXT,
  fundraising_photo_url TEXT,
  personal_message TEXT;
```

**New table `kenya_trip_donations`:**
```sql
CREATE TABLE kenya_trip_donations (
  id UUID PRIMARY KEY,
  participant_id UUID REFERENCES kenya_trip_participants(id),
  trip_id UUID REFERENCES kenya_trips(id),

  -- Donor info
  donor_name VARCHAR(200),
  donor_email VARCHAR(255),
  donor_phone VARCHAR(20),
  is_anonymous BOOLEAN DEFAULT false,

  -- Payment
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded

  -- Meta
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Phase 2: Public Fundraising Page

**Route:** `app/(public)/kenya/support/[slug]/page.tsx`

**Features:**
- Participant's name & photo
- Their "why I'm going" story
- Fundraising goal & progress bar
- Recent donors (with permission)
- Donate button → Stripe Checkout

**Design:**
```
┌─────────────────────────────────────────┐
│  [Photo]  Kenya Kingdom Impact 2025     │
│                                         │
│  Help John Smith reach his goal!        │
│                                         │
│  ████████████░░░░░░  $1,200 / $3,000   │
│                     40% funded          │
│                                         │
│  "I feel called to serve in Kenya..."   │
│                                         │
│  [ $50 ] [ $100 ] [ $250 ] [ Other ]   │
│                                         │
│  [    Donate Now - Support John    ]    │
│                                         │
│  Recent Supporters:                     │
│  • Sarah M. - $100 - "Go get 'em!"     │
│  • Anonymous - $50                      │
│  • David K. - $250 - "Proud of you"    │
└─────────────────────────────────────────┘
```

### Phase 3: Stripe Integration

**Checkout Flow:**
1. Supporter clicks "Donate"
2. Create Stripe Checkout Session with metadata:
   - `participant_id`
   - `trip_id`
   - `donor_name`
   - `donor_email`
3. Redirect to Stripe
4. Webhook receives `checkout.session.completed`
5. Create `kenya_trip_donations` record
6. Update participant's `amount_raised`
7. Send confirmation email to donor
8. Notify participant of new donation

**API Routes:**
- `POST /api/kenya/donate` - Create checkout session
- `POST /api/webhooks/kenya-donations` - Handle Stripe webhooks

### Phase 4: Participant Dashboard Updates

**Add to `/kenya-trip` My Status tab:**

```
┌─────────────────────────────────────────┐
│  My Fundraising                         │
│                                         │
│  ████████████░░░░░░  $1,200 / $3,000   │
│                                         │
│  Share your fundraising page:           │
│  ┌─────────────────────────────────┐   │
│  │ tpcmin.org/kenya/support/jsmith │ 📋│
│  └─────────────────────────────────┘   │
│                                         │
│  [ Edit My Story ] [ View My Page ]    │
│                                         │
│  Recent Donations:                      │
│  • Sarah M. - $100 - Jan 20            │
│  • Anonymous - $50 - Jan 18            │
└─────────────────────────────────────────┘
```

**Fundraising Resources Section:**
- Sample email templates
- Social media graphics
- Tips for reaching goal
- Letter templates

### Phase 5: Admin Features

**Kenya Command Center additions:**
- Fundraising dashboard showing all participants
- Total raised vs total goal
- Export donor list
- Send thank you emails
- Adjust individual goals

---

## Files to Create

| File | Purpose |
|------|---------|
| `app/(public)/kenya/support/[slug]/page.tsx` | Public fundraising page |
| `app/api/kenya/donate/route.ts` | Create Stripe checkout |
| `app/api/webhooks/kenya-donations/route.ts` | Handle Stripe webhooks |
| `components/kenya/fundraising-card.tsx` | Reusable fundraising display |
| `components/kenya/donation-form.tsx` | Donation amount selector |

## Files to Modify

| File | Change |
|------|--------|
| `app/(member)/kenya-trip/page.tsx` | Add fundraising section to dashboard |
| `app/(admin)/kenya-command-center/page.tsx` | Add fundraising overview |

---

## Enrollment Checklist (Admin Side)

When someone applies, admin needs to:

1. **Review Application** → Approve/Decline/Waitlist
2. **Set Fundraising Goal** → Default $3,000 or custom
3. **Generate Slug** → Auto from name or custom
4. **Enable Fundraising Page** → Toggle on when ready

Participant then:
1. Writes their story
2. Uploads a photo
3. Shares their link
4. Tracks donations in dashboard

---

## Timeline Estimate

| Phase | Effort |
|-------|--------|
| Database setup | 15 min |
| Public fundraising page | 1-2 hrs |
| Stripe integration | 1 hr |
| Participant dashboard | 1 hr |
| Admin features | 30 min |
| **Total** | ~4-5 hrs |

---

## Questions to Decide

1. **Default fundraising goal?** (Suggest: $3,000 per person)
2. **Minimum donation amount?** (Suggest: $10)
3. **Show donor names publicly?** (With permission checkbox)
4. **Processing fees?** (Absorb or pass to donor?)
5. **Tax receipts?** (TPC is 501c3 - auto-send?)

---

Ready to implement when you approve!
