# TPC Ministries Deployment Guide

## 🚀 Quick Deploy to Vercel (Recommended - Free)

### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Supabase project created

### Steps

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Deploy to Vercel**
- Go to https://vercel.com/new
- Import your GitHub repository
- Vercel will auto-detect Next.js
- Click "Deploy"

3. **Add Environment Variables in Vercel**
Go to Project Settings → Environment Variables and add:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site URL (Required)
NEXT_PUBLIC_URL=https://your-domain.vercel.app

# Email (Optional - Add when ready)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# SMS (Optional - Add when ready)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Stripe (Optional - Skip for now)
# STRIPE_SECRET_KEY=sk_xxxxx
# STRIPE_PUBLISHABLE_KEY=pk_xxxxx
# STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

4. **Redeploy** after adding environment variables

5. **Update Supabase Auth Settings**
- Go to Supabase Dashboard → Authentication → URL Configuration
- Add your Vercel URL to "Site URL"
- Add `https://your-domain.vercel.app/**` to "Redirect URLs"

---

## 🔧 Environment Variables Explained

### Required for Basic Functionality
```env
NEXT_PUBLIC_SUPABASE_URL=          # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Public key, safe to expose
SUPABASE_SERVICE_ROLE_KEY=         # SECRET! Admin access
NEXT_PUBLIC_URL=                   # Your deployed URL
```

### Optional Features
```env
# Email Notifications
RESEND_API_KEY=                    # From resend.com
RESEND_FROM_EMAIL=                 # Verified domain email

# SMS Notifications
TWILIO_ACCOUNT_SID=                # From twilio.com
TWILIO_AUTH_TOKEN=                 # SECRET!
TWILIO_PHONE_NUMBER=               # Your Twilio number

# Payments (Skip for now)
STRIPE_SECRET_KEY=                 # From stripe.com
STRIPE_PUBLISHABLE_KEY=            # Public
STRIPE_WEBHOOK_SECRET=             # For webhooks
```

---

## 🗄️ Database Setup

### 1. Run Member Bookmarks Migration
In Supabase SQL Editor, run:
```sql
-- Copy content from /supabase/migrations/20250106_create_member_bookmarks.sql
```

### 2. Verify All Tables Exist
You should have these tables in Supabase:
- ✅ members
- ✅ seasons
- ✅ teachings
- ✅ content_progress
- ✅ member_seasons
- ✅ member_bookmarks
- ✅ prayer_requests
- ✅ assessments (+ related tables)
- ✅ prophecy_words
- ✅ And more...

If any are missing, create them in Supabase Dashboard.

---

## 🌐 Custom Domain (Optional)

### On Vercel:
1. Go to Project Settings → Domains
2. Add your domain (e.g., tpcministries.com)
3. Follow DNS instructions
4. Update NEXT_PUBLIC_URL to your custom domain

---

## 📧 Email Setup (After Deployment)

### Using Resend (Free tier: 3,000 emails/month)

1. **Sign up:** https://resend.com
2. **Verify domain:**
   - Add DNS records (takes 24-48 hours)
   - Or use resend's domain temporarily

3. **Get API key:** Dashboard → API Keys

4. **Add to Vercel:**
   ```env
   RESEND_API_KEY=re_your_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

5. **Implement in code** (when ready):
   See `/docs/EMAIL_SMS_SETUP.md`

---

## 📱 SMS Setup (Optional)

### Using Twilio

1. **Sign up:** https://twilio.com
2. **Get phone number:** ~$1/month
3. **Add to Vercel:**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```

4. **Implement in code** (when ready):
   See `/docs/EMAIL_SMS_SETUP.md`

---

## ✅ Post-Deployment Checklist

### Immediately After Deploy:
- [ ] Test signup/login flow
- [ ] Test member dashboard
- [ ] Check seasons and content load
- [ ] Verify database connections
- [ ] Test mobile responsiveness

### Within First Week:
- [ ] Add custom domain
- [ ] Set up email notifications
- [ ] Configure Supabase auth emails (customize templates)
- [ ] Test all member features
- [ ] Monitor error logs in Vercel

### Before Public Launch:
- [ ] Add Google Analytics (optional)
- [ ] Set up error monitoring (Sentry - optional)
- [ ] Load real content (teachings, seasons)
- [ ] Create initial admin account
- [ ] Test payment flow (if using Stripe)

---

## 🐛 Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all dependencies are in package.json
- Verify TypeScript has no errors locally

### Database Errors
- Check Supabase connection string
- Verify RLS policies allow public/authenticated access
- Check API keys are correct

### Auth Not Working
- Verify redirect URLs in Supabase
- Check NEXT_PUBLIC_URL matches deployment
- Ensure anon key is correct

### Email Not Sending
- Verify domain is verified
- Check API key is correct
- Look at Resend logs

---

## 💰 Cost Estimate

### Free Tier (Good for starting):
- **Vercel**: Free (100GB bandwidth/month)
- **Supabase**: Free (500MB database, 50K monthly active users)
- **Resend**: Free (3,000 emails/month)
- **Total**: $0/month

### Paid Tier (When you grow):
- **Vercel Pro**: $20/month (better performance)
- **Supabase Pro**: $25/month (8GB database, no limits)
- **Resend**: $20/month (50,000 emails)
- **Twilio**: ~$10-20/month (for SMS)
- **Total**: ~$75-85/month

---

## 📊 Monitoring

### Vercel Dashboard
- View deployment logs
- Check analytics
- Monitor errors

### Supabase Dashboard
- View database stats
- Monitor API usage
- Check auth logs

### Recommended (Optional)
- **Sentry** - Error tracking (free tier available)
- **Google Analytics** - User analytics
- **PostHog** - Product analytics

---

## 🔄 Future Updates

To deploy updates:
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel will auto-deploy!

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Resend Docs**: https://resend.com/docs

**Ready to deploy?** Follow the Quick Deploy steps above!
