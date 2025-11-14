// Email service configuration
// To use: Install resend with `npm install resend`
// Add RESEND_API_KEY and RESEND_FROM_EMAIL to .env.local

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // Check if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('Email not sent: RESEND_API_KEY not configured')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    // Dynamically import Resend to avoid errors if not installed
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@tpcministries.com',
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

// Email Templates
export const EmailTemplates = {
  welcome: (name: string, dashboardUrl: string) => ({
    subject: 'Welcome to TPC Ministries!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; background: #1e3a8a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to TPC Ministries!</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>We're thrilled to have you join our community! TPC Ministries is committed to helping you grow in your faith journey through transformative teachings, assessments, and community.</p>

              <h3>Here's what you can do now:</h3>
              <ul>
                <li><strong>Explore Seasons</strong> - Join spiritual growth seasons tailored to your journey</li>
                <li><strong>Access Teachings</strong> - Watch, listen, and engage with powerful content</li>
                <li><strong>Take Assessments</strong> - Discover your spiritual gifts and calling</li>
                <li><strong>Connect in Prayer</strong> - Share requests and pray for others</li>
              </ul>

              <div style="text-align: center;">
                <a href="${dashboardUrl}" class="button">Go to Your Dashboard</a>
              </div>

              <p>If you have any questions, feel free to reach out to us at any time.</p>

              <p>Blessings,<br><strong>The TPC Ministries Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} TPC Ministries. All rights reserved.</p>
              <p>Transforming Lives Through Christ</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  seasonComplete: (name: string, seasonName: string, seasonColor: string, dashboardUrl: string) => ({
    subject: `🎉 Congratulations on completing ${seasonName}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${seasonColor}; color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .badge { background: ${seasonColor}; color: white; padding: 20px; border-radius: 50%; width: 100px; height: 100px; margin: 20px auto; display: flex; align-items: center; justify-content: center; font-size: 48px; }
            .button { display: inline-block; background: ${seasonColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Season Complete!</h1>
            </div>
            <div class="content">
              <div class="badge">✓</div>

              <p>Congratulations, ${name}!</p>
              <p>You've successfully completed the <strong>${seasonName}</strong> season! This is a significant milestone in your spiritual journey.</p>

              <h3>Your Achievement:</h3>
              <p>By completing this season, you've demonstrated commitment to your spiritual growth and taken important steps in your faith journey.</p>

              <h3>What's Next?</h3>
              <ul>
                <li>Explore more seasons to continue your growth</li>
                <li>Review the content you've completed</li>
                <li>Share your journey with the community</li>
                <li>Take related assessments to deepen your understanding</li>
              </ul>

              <div style="text-align: center;">
                <a href="${dashboardUrl}" class="button">Explore More Seasons</a>
              </div>

              <p>Keep growing, keep learning, and keep shining your light!</p>

              <p>Blessings,<br><strong>The TPC Ministries Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} TPC Ministries. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  weeklyDigest: (name: string, stats: {
    contentWatched: number
    prayersReceived: number
    seasonsActive: number
    progressThisWeek: number
  }, dashboardUrl: string) => ({
    subject: 'Your Weekly Spiritual Growth Report',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .stat-card { background: #f9fafb; padding: 20px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #1e3a8a; }
            .stat-number { font-size: 32px; font-weight: bold; color: #1e3a8a; }
            .button { display: inline-block; background: #1e3a8a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Your Weekly Progress</h1>
              <p>Keep up the great work, ${name}!</p>
            </div>
            <div class="content">
              <p>Here's a summary of your spiritual growth this week:</p>

              <div class="stat-card">
                <div class="stat-number">${stats.contentWatched}</div>
                <div>Teachings Completed</div>
              </div>

              <div class="stat-card">
                <div class="stat-number">${stats.seasonsActive}</div>
                <div>Active Seasons</div>
              </div>

              <div class="stat-card">
                <div class="stat-number">${stats.prayersReceived}</div>
                <div>Prayers Received</div>
              </div>

              <div class="stat-card">
                <div class="stat-number">${stats.progressThisWeek}%</div>
                <div>Overall Progress This Week</div>
              </div>

              <h3>Keep Going!</h3>
              <p>Your consistent engagement is making a difference. Continue your journey and discover what God has in store for you.</p>

              <div style="text-align: center;">
                <a href="${dashboardUrl}" class="button">View Full Dashboard</a>
              </div>

              <p>Blessings,<br><strong>The TPC Ministries Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} TPC Ministries. All rights reserved.</p>
              <p><a href="${dashboardUrl}/settings" style="color: #6b7280;">Manage email preferences</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  prayerUpdate: (name: string, prayerTitle: string, prayerUrl: string) => ({
    subject: 'Someone prayed for your request 🙏',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .prayer-card { background: #faf5ff; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed; margin: 20px 0; }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🙏 Prayer Update</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Good news! A member of our community just prayed for your request:</p>

              <div class="prayer-card">
                <strong>${prayerTitle}</strong>
              </div>

              <p>You are not alone in your journey. Our community is standing with you in prayer.</p>

              <div style="text-align: center;">
                <a href="${prayerUrl}" class="button">View Prayer Request</a>
              </div>

              <p>Continue to trust and have faith. We're here for you.</p>

              <p>Blessings,<br><strong>The TPC Ministries Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} TPC Ministries. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
}
