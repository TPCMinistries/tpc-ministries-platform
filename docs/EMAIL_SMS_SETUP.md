# Email & SMS Setup Guide for TPC Ministries

## 📧 EMAIL SETUP OPTIONS

### Option 1: Resend (Recommended - Easiest)
**Why:** Simple, generous free tier, great deliverability

1. **Sign up:** https://resend.com
2. **Free tier:** 3,000 emails/month, 100 emails/day
3. **Add to `.env.local`:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourchurch.com
```

4. **Install package:**
```bash
npm install resend
```

5. **Create `/lib/email.ts`:**
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject,
      html,
    })
    return { success: true, data }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error }
  }
}
```

6. **Verify domain:** Follow Resend's domain verification (add DNS records)

---

### Option 2: SendGrid (Alternative)
**Why:** Industry standard, reliable

1. **Sign up:** https://sendgrid.com
2. **Free tier:** 100 emails/day forever
3. **Add to `.env.local`:**
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourchurch.com
```

4. **Install:**
```bash
npm install @sendgrid/mail
```

5. **Create `/lib/email.ts`:**
```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    await sgMail.send({
      from: process.env.SENDGRID_FROM_EMAIL!,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error }
  }
}
```

---

### Option 3: Supabase Auth Emails (For auth only)
**Why:** Built-in, no extra service needed for auth emails

Supabase already handles:
- ✅ Welcome emails
- ✅ Password reset emails
- ✅ Email verification
- ✅ Magic link emails

**Configure in Supabase Dashboard:**
1. Go to Authentication → Email Templates
2. Customize templates with your branding
3. Add custom SMTP (optional) in Settings → Email Settings

**For non-auth emails, still use Resend/SendGrid**

---

## 📱 SMS SETUP OPTIONS

### Option 1: Twilio (Recommended)
**Why:** Most reliable, widely used

1. **Sign up:** https://twilio.com
2. **Free trial:** $15 credit (buy phone number ~$1/month, $0.0079/SMS)
3. **Add to `.env.local`:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

4. **Install:**
```bash
npm install twilio
```

5. **Create `/lib/sms.ts`:**
```typescript
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendSMS({
  to,
  message,
}: {
  to: string
  message: string
}) {
  try {
    const result = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
      body: message,
    })
    return { success: true, sid: result.sid }
  } catch (error) {
    console.error('SMS error:', error)
    return { success: false, error }
  }
}
```

---

### Option 2: MessageBird (Alternative)
**Why:** Slightly cheaper in some regions

1. **Sign up:** https://messagebird.com
2. **Pricing:** ~$0.007/SMS
3. **Similar setup to Twilio**

---

## 🚀 EXAMPLE USE CASES

### Welcome Email (when user signs up)
```typescript
// In your signup API route or Supabase trigger
import { sendEmail } from '@/lib/email'

await sendEmail({
  to: user.email,
  subject: 'Welcome to TPC Ministries!',
  html: `
    <h1>Welcome ${user.first_name}!</h1>
    <p>We're excited to have you join our community.</p>
    <a href="${process.env.NEXT_PUBLIC_URL}/member/dashboard">
      Get Started
    </a>
  `
})
```

### Prayer Request Notification
```typescript
// When someone prays for a request
await sendEmail({
  to: requestAuthor.email,
  subject: 'Someone prayed for your request',
  html: `
    <p>Good news! Someone just prayed for your request:</p>
    <p><strong>${prayerRequest.title}</strong></p>
  `
})
```

### Season Completion Email
```typescript
// When user completes a season
await sendEmail({
  to: member.email,
  subject: '🎉 Congratulations on completing your season!',
  html: `
    <h1>Season Complete!</h1>
    <p>You've completed the ${season.name} season.</p>
    <a href="${url}/member/seasons">Explore More Seasons</a>
  `
})
```

### SMS Notification (urgent prayer)
```typescript
// For urgent prayer requests (if member has SMS enabled)
await sendSMS({
  to: member.phone_number,
  message: `TPC Ministries: Urgent prayer request from ${author.name}. View: ${url}/member/prayer`
})
```

---

## 🎯 RECOMMENDED NOTIFICATIONS TO IMPLEMENT

### Email (Priority Order):
1. ✅ Welcome email (signup)
2. ✅ Password reset (Supabase handles)
3. ✅ Season completion
4. ✅ New content in subscribed season
5. ✅ Prayer request update (someone prayed)
6. ✅ Weekly digest (progress summary)
7. Assessment results ready
8. New prophecy posted
9. Subscription renewal reminder

### SMS (Optional):
1. Urgent prayer requests only
2. Event reminders (if you add events)
3. 2FA codes (Supabase can handle)

---

## 💡 IMPLEMENTATION TIPS

### Use Supabase Database Functions (Recommended)
Create triggers that automatically send emails when certain actions happen:

```sql
-- Example: Send email when prayer request is created
CREATE OR REPLACE FUNCTION notify_prayer_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Call your API route to send email
  PERFORM net.http_post(
    url := 'https://yourapp.com/api/notifications/prayer-request',
    headers := '{"Content-Type": "application/json"}',
    body := json_build_object('prayer_id', NEW.id)::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prayer_request_created
  AFTER INSERT ON prayer_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_prayer_request();
```

### Or Use Edge Functions (Supabase)
```typescript
// supabase/functions/send-welcome-email/index.ts
import { sendEmail } from './email.ts'

Deno.serve(async (req) => {
  const { email, name } = await req.json()

  await sendEmail({
    to: email,
    subject: 'Welcome!',
    html: `<h1>Welcome ${name}!</h1>`
  })

  return new Response('OK')
})
```

---

## 📊 COST ESTIMATES (Monthly)

### For 1,000 active members:
- **Resend:** FREE (3,000 emails/month limit)
- **SendGrid:** FREE (100/day limit = 3,000/month)
- **Twilio SMS:** ~$8-15 (if 1,000-2,000 texts/month)

### For 10,000 active members:
- **Resend:** $20/month (up to 50,000 emails)
- **SendGrid:** $20/month (up to 100,000 emails)
- **Twilio SMS:** $80-150/month (10,000-20,000 texts)

**Recommendation:** Start with Resend for email (free tier), add Twilio SMS only if needed later.

---

## 🔐 SECURITY NOTES

1. Never commit API keys to git
2. Use environment variables (`.env.local`)
3. Add `.env.local` to `.gitignore`
4. Rate limit notification endpoints
5. Add unsubscribe links to all marketing emails (required by law)

---

## ✅ QUICK START CHECKLIST

- [ ] Choose email provider (Resend recommended)
- [ ] Sign up and get API key
- [ ] Add API key to `.env.local`
- [ ] Install npm package
- [ ] Create `/lib/email.ts` helper
- [ ] Test with simple welcome email
- [ ] Add to signup flow
- [ ] Implement other notifications gradually

**Need help implementing?** Let me know which notifications you want first!
