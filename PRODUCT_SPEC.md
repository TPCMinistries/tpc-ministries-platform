# PRODUCT SPEC: TPC Ministries Platform
## Digital Platform for Ministry Operations
### Version 1.0 | January 2026

---

## 1. PRODUCT OVERVIEW

### Vision
A digital home for TPC Ministries where members connect, grow, and serve together.

### Mission
Provide the tools for modern ministry: member management, event coordination, spiritual tracking, and communication - all in one place.

### Ministry Context
TPC Ministries is a faith community led by Lorenzo Daughtry-Chambers. The platform serves:
- Regular members
- Ministry leaders
- Event attendees
- Online community

### Tagline
"Connected in Faith. Empowered to Serve."

---

## 2. TARGET USERS

### Primary: Ministry Members
- Regular attendees
- Want to stay connected
- Track their spiritual journey
- Find ways to serve

### Secondary: Ministry Leaders
- Event organizers
- Small group leaders
- Prayer team
- Need coordination tools

### Tertiary: Visitors
- First-time attendees
- Seekers exploring faith
- Online-only participants

---

## 3. CORE FEATURES

### MVP (85% Complete)

#### 3.1 Member Portal
- Profile management
- Personal dashboard
- Membership status
- Communication preferences

#### 3.2 Event Calendar
- Ministry events
- Registration
- Reminders
- Virtual event links

#### 3.3 Prophecy Tracker
- Personal prophecies received
- Date and speaker
- Private notes
- Fulfillment tracking

#### 3.4 Prayer Requests
- Submit requests
- Privacy levels (public, leaders, private)
- Prayer response tracking
- Answered prayer celebration

#### 3.5 Teaching Resources
- Sermon archive
- Bible studies
- Downloadable resources
- Search functionality

### Phase 2

#### 3.6 Small Groups
- Group directory
- Join/leave
- Group communication
- Attendance tracking

#### 3.7 Volunteer Management
- Service opportunities
- Signup/scheduling
- Hour tracking
- Appreciation

#### 3.8 Giving
- Online donations
- Recurring giving
- Giving history
- Tax receipts

---

## 4. UNIQUE FEATURES

### Prophecy System
Unique to TPC - tracking prophetic words:

```
Member receives prophecy
  → Records date, speaker, content
  → Tags themes (career, family, ministry)
  → Reviews periodically
  → Marks fulfillment status
  → Shares testimony (optional)
```

### Prayer Processing (n8n)
Automated prayer request handling:

```
Request submitted
  → n8n categorizes
  → Routes to prayer team
  → Tracks responses
  → Follows up with requester
  → Celebrates answers
```

---

## 5. TECHNICAL ARCHITECTURE

### Stack
- **Frontend:** Next.js 14, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** tpc-ministries-platform (Supabase, ISOLATED)
- **Auth:** Supabase Auth
- **Hosting:** Vercel

### ⚠️ DATA PROTECTION
Member data is PROTECTED:
- Spiritual information is sensitive
- Prophecy records are personal
- Prayer requests may be vulnerable
- Financial data (giving) requires security

### n8n Workflows Connected
- Prayer Request Processor (active)
- Weekly Ministry Digest (active)

---

## 6. SUCCESS METRICS

### Engagement
- Monthly active members
- Event registrations
- Prayer request submissions
- Resource downloads

### Spiritual
- Prophecies recorded
- Testimonies shared
- Small group participation
- Volunteer hours

### Targets (Month 1)
- 100 registered members
- 50% monthly active
- 20+ prayer requests/week
- 10+ prophecies recorded

---

## 7. CURRENT STATUS

### What's Built ✅ (85%)
- Authentication
- Member profiles
- Event calendar
- Prophecy tracker
- Prayer requests
- Basic admin

### What's Missing ❌
- Final testing
- Production deployment
- Member data migration
- Training for ministry team

---

## 8. ROADMAP

### Week 1 (QUICK WIN)
- [ ] Final testing
- [ ] Deploy to Vercel
- [ ] Create admin accounts
- [ ] Soft launch to leaders

### Week 2
- [ ] Member invitations
- [ ] Data migration (if any)
- [ ] Training sessions
- [ ] Public launch

### Month 1
- [ ] 100 members onboarded
- [ ] All features active
- [ ] Feedback collected
- [ ] Iterations

