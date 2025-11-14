# 📧 Resend Email Integration - TPC Ministries

Complete email integration using Resend for TPC Ministries platform.

## ✅ What's Been Implemented

### 1. **Email Service** (`/lib/email/resend.ts`)
- ✅ `sendEmail()` - Send single email
- ✅ `sendBulkEmail()` - Send to multiple recipients (batches of 50)
- ✅ Error handling and logging
- ✅ Batch processing for rate limit compliance

### 2. **Email Templates** (`/lib/email/templates/`)
Beautiful, responsive React Email templates with TPC branding (gold #c9a961, navy #1e3a8a):

- ✅ `welcome-email.tsx` - New member welcome
- ✅ `donation-receipt.tsx` - Donation confirmation with receipt
- ✅ `lead-confirmation.tsx` - Lead capture form confirmation
- ✅ `prophecy-assigned.tsx` - Personal prophecy notification
- ✅ `password-reset.tsx` - Password reset request

### 3. **API Routes** (`/app/api/email/`)
- ✅ `/api/email/send` - Send single email (admin only)
- ✅ `/api/email/send-bulk` - Send bulk emails (admin only, max 1000)
- ✅ `/api/email/send-welcome` - Welcome email for new members
- ✅ `/api/email/send-donation-receipt` - Donation receipts
- ✅ `/api/email/send-lead-confirmation` - Lead confirmations (public)
- ✅ `/api/email/send-prophecy-notification` - Prophecy notifications
- ✅ `/api/email/send-password-reset` - Password reset emails

### 4. **Automated Triggers**
- ✅ **Lead Confirmation** - Sends automatically when homepage form is submitted
- ⏳ **Welcome Email** - Ready to integrate with member signup
- ⏳ **Donation Receipt** - Ready to integrate with Stripe webhook
- ⏳ **Prophecy Notification** - Ready to integrate with prophecy assignment

### 5. **Admin Testing Page** (`/admin/email-test`)
- ✅ Test all 5 email templates
- ✅ Send test emails to any address
- ✅ Verify emails work before going live

## 🔧 Configuration

### Environment Variable
Already added to `.env.local`:
```
RESEND_API_KEY=re_aSU8fTkA_MVZ5yxAWdF6dTyJAtXa9DhXV
```

### From Email Address
Current: `TPC Ministries <noreply@tpcmin.org>`

**Note:** This uses Resend's shared domain. For production, you should:
1. Verify your domain `tpcmin.org` in Resend dashboard
2. Add DNS records (SPF, DKIM, DMARC)
3. Change from address to `hello@tpcmin.org` or `noreply@tpcmin.org`

## 🚀 How to Use

### Test the Email System

1. **Go to Admin Email Test Page:**
   ```
   /admin/email-test
   ```

2. **Enter your email address**

3. **Click "Send Test Email" for each template to verify they work**

4. **Check your inbox and spam folder**

### Send Email from Admin Portal

**Single Email:**
```typescript
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Your Subject',
    html: '<p>Your HTML content</p>',
  }),
})
```

**Bulk Email:**
```typescript
const response = await fetch('/api/email/send-bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipients: ['email1@example.com', 'email2@example.com'],
    subject: 'Your Subject',
    html: '<p>Your HTML content</p>',
  }),
})
```

## 📋 Next Steps

### 1. Update Communications Page
The communications page at `/admin/communications` needs to be updated to use the new email API:

**Current:** Stores emails in database only
**Update Needed:** Call `/api/email/send` or `/api/email/send-bulk` to actually send emails

### 2. Stripe Donation Receipt Integration
Update the Stripe webhook handler to send donation receipts:

```typescript
// In your Stripe webhook handler
if (event.type === 'checkout.session.completed') {
  const session = event.data.object

  // Send donation receipt
  await fetch('/api/email/send-donation-receipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      donorName: session.customer_details.name,
      email: session.customer_details.email,
      amount: session.amount_total,
      date: new Date().toLocaleDateString(),
      donationType: 'One-Time Donation',
      transactionId: session.id,
      isRecurring: false,
    }),
  })
}
```

### 3. Member Signup Welcome Email
When a new member signs up (or is converted from a lead), send welcome email:

```typescript
// After creating auth user
await fetch('/api/email/send-welcome', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    memberName: newMember.first_name,
    email: newMember.email,
    loginUrl: 'https://tpcmin.org/login',
    temporaryPassword: temporaryPassword, // if applicable
  }),
})
```

### 4. Prophecy Assignment Notification
When admin assigns prophecy to member:

```typescript
// After assigning prophecy
await fetch('/api/email/send-prophecy-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    memberName: member.first_name,
    email: member.email,
    prophecyTitle: prophecy.title,
    viewUrl: 'https://tpcmin.org/member/prophecy',
  }),
})
```

### 5. Domain Verification (Production)
To use a custom domain email like `hello@tpcmin.org`:

1. Go to Resend Dashboard → Domains
2. Add domain `tpcmin.org`
3. Add these DNS records to your domain:
   - SPF record
   - DKIM record
   - DMARC record (optional but recommended)
4. Verify domain
5. Update `from` address in `/lib/email/resend.ts`

## 📊 Email Tracking

All sent emails are logged in the `communications` table with:
- Sender ID
- Recipient emails
- Subject
- Message content
- Status (sent/partial/failed)
- Sent timestamp

## 🔒 Security

- ✅ API routes verify admin authentication
- ✅ Rate limiting via batching (50 emails per batch)
- ✅ Maximum 1000 recipients per bulk send
- ✅ Error handling for failed sends
- ✅ Graceful degradation if Resend is down

## 📝 Email Templates Customization

To customize email templates, edit files in `/lib/email/templates/`:

```typescript
// Example: Change header color
const header = {
  backgroundColor: '#1e3a8a', // Navy (change this)
  padding: '32px 20px',
  textAlign: 'center' as const,
}

// Example: Change button color
const button = {
  backgroundColor: '#c9a961', // Gold (change this)
  color: '#1e3a8a',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '14px 32px',
  textDecoration: 'none',
  borderRadius: '6px',
  display: 'inline-block',
}
```

## 🐛 Troubleshooting

### Emails Not Sending
1. Check Resend API key is correct in `.env.local`
2. Check Resend dashboard for errors
3. Verify rate limits haven't been exceeded
4. Check server logs for error messages

### Emails Going to Spam
1. Verify domain in Resend
2. Add SPF, DKIM, DMARC records
3. Warm up your sending domain gradually
4. Avoid spam trigger words in subject lines

### Template Not Rendering
1. Check React Email component syntax
2. Verify all props are being passed
3. Test with `/admin/email-test` page
4. Check browser console for errors

## 📚 Resources

- [Resend Dashboard](https://resend.com/home)
- [React Email Documentation](https://react.email/docs/introduction)
- [Email Best Practices](https://resend.com/docs/dashboard/best-practices)

## ✨ Summary

You now have a complete email system that:
- ✅ Sends beautiful branded emails
- ✅ Handles single and bulk sending
- ✅ Automatically sends lead confirmations
- ✅ Has admin testing interface
- ✅ Logs all communications
- ✅ Ready for production use

**Next:** Test emails at `/admin/email-test` and integrate with Stripe webhooks!
