// Beautiful HTML Email Templates for TPC Ministries

const baseStyles = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
  .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 40px 30px; text-align: center; }
  .header img { max-width: 150px; margin-bottom: 20px; }
  .header h1 { color: #d4af37; margin: 0; font-size: 28px; font-weight: 600; }
  .header p { color: #ffffff; margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
  .content { padding: 40px 30px; }
  .content h2 { color: #1e3a5f; margin: 0 0 20px; font-size: 24px; }
  .content p { color: #555555; line-height: 1.8; margin: 0 0 20px; font-size: 16px; }
  .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); color: #1e3a5f !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
  .button:hover { background: linear-gradient(135deg, #b8962e 0%, #9a7d26 100%); }
  .highlight-box { background: linear-gradient(135deg, #f8f4e8 0%, #fff9e6 100%); border-left: 4px solid #d4af37; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
  .highlight-box p { margin: 0; color: #1e3a5f; }
  .scripture { font-style: italic; color: #1e3a5f; background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
  .scripture-ref { display: block; margin-top: 10px; font-style: normal; font-weight: 600; color: #d4af37; }
  .footer { background-color: #1e3a5f; padding: 30px; text-align: center; }
  .footer p { color: #ffffff; margin: 5px 0; font-size: 14px; opacity: 0.8; }
  .footer a { color: #d4af37; text-decoration: none; }
  .social-links { margin: 20px 0; }
  .social-links a { display: inline-block; margin: 0 10px; }
  .divider { height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent); margin: 30px 0; }
`

export const emailTemplates = {
  // Birthday Greeting
  birthday: (firstName: string, specialMessage?: string) => `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>Happy Birthday, ${firstName}!</h1>
      <p>Celebrating another year of God's faithfulness</p>
    </div>
    <div class="content">
      <div style="text-align: center; font-size: 60px; margin: 20px 0;">🎂🎉✨</div>
      <p>Dear ${firstName},</p>
      <p>On this special day, we want you to know how much you mean to our TPC family. Your presence in our community is a blessing, and we celebrate the unique gift that you are!</p>

      <div class="scripture">
        "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."
        <span class="scripture-ref">— Jeremiah 29:11</span>
      </div>

      ${specialMessage ? `<div class="highlight-box"><p>${specialMessage}</p></div>` : ''}

      <p>May this new year of life be filled with:</p>
      <ul style="color: #555;">
        <li>Deeper encounters with God's presence</li>
        <li>Breakthrough in every area of your life</li>
        <li>Joy that overflows to everyone around you</li>
        <li>Divine connections and opportunities</li>
      </ul>

      <p style="text-align: center;">
        <a href="https://tpcministries.org/birthday-blessing" class="button">Receive Your Birthday Blessing</a>
      </p>

      <p>With love and prayers,<br><strong>Prophet Lorenzo & The TPC Family</strong></p>
    </div>
    <div class="footer">
      <p>TPC Ministries International</p>
      <p><a href="https://tpcministries.org">www.tpcministries.org</a></p>
    </div>
  </div>
</body>
</html>
`,

  // Welcome New Member
  welcome: (firstName: string, tier: string) => `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to the Family!</h1>
      <p>Your prophetic journey begins now</p>
    </div>
    <div class="content">
      <h2>Hello ${firstName}!</h2>
      <p>We are absolutely thrilled to welcome you to TPC Ministries! You've just joined a community of believers who are passionate about hearing God's voice and walking in their divine purpose.</p>

      <div class="highlight-box">
        <p><strong>Your Membership:</strong> ${tier === 'covenant' ? 'Covenant Partner' : tier === 'partner' ? 'Partner' : 'Member'}</p>
      </div>

      <p>Here's what you can start exploring right away:</p>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 10px 0;"><strong>📖 Daily Devotionals</strong> - Fresh word every morning</p>
        <p style="margin: 10px 0;"><strong>🎧 Prophetic Words</strong> - Timely messages from Prophet Lorenzo</p>
        <p style="margin: 10px 0;"><strong>🤖 Ask Prophet Lorenzo AI</strong> - Get prophetic guidance 24/7</p>
        <p style="margin: 10px 0;"><strong>📚 PLANT Learning</strong> - Grow in your spiritual gifts</p>
        <p style="margin: 10px 0;"><strong>🙏 Prayer Requests</strong> - We're here to stand with you</p>
      </div>

      <div class="scripture">
        "Before I formed you in the womb I knew you; before you were born I set you apart."
        <span class="scripture-ref">— Jeremiah 1:5</span>
      </div>

      <p style="text-align: center;">
        <a href="https://tpcministries.org/dashboard" class="button">Start Your Journey</a>
      </p>

      <p>Welcome home,<br><strong>Prophet Lorenzo & The TPC Team</strong></p>
    </div>
    <div class="footer">
      <p>TPC Ministries International</p>
      <p>Questions? Reply to this email or visit <a href="https://tpcministries.org/support">our support page</a></p>
    </div>
  </div>
</body>
</html>
`,

  // Re-engagement (Inactive Member)
  reengagement: (firstName: string, daysInactive: number) => `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>We Miss You, ${firstName}</h1>
      <p>Your seat at the table is still here</p>
    </div>
    <div class="content">
      <p>Dear ${firstName},</p>
      <p>It's been a while since we've seen you, and we wanted you to know that you're missed! Life gets busy, we understand. But we also know that God has been doing some amazing things, and we don't want you to miss out.</p>

      <div class="highlight-box">
        <p><strong>Here's what's been happening:</strong></p>
        <ul style="margin: 10px 0 0; padding-left: 20px;">
          <li>New prophetic words released</li>
          <li>Fresh teachings in the library</li>
          <li>Community members sharing powerful testimonies</li>
          <li>Upcoming events and gatherings</li>
        </ul>
      </div>

      <div class="scripture">
        "Come to me, all you who are weary and burdened, and I will give you rest."
        <span class="scripture-ref">— Matthew 11:28</span>
      </div>

      <p>Whatever season you're in, know that you belong here. No judgment, just love and support.</p>

      <p style="text-align: center;">
        <a href="https://tpcministries.org/dashboard" class="button">Come Back Home</a>
      </p>

      <p>We're praying for you,<br><strong>The TPC Family</strong></p>
    </div>
    <div class="footer">
      <p>TPC Ministries International</p>
      <p>Need to talk? <a href="https://tpcministries.org/contact">Reach out anytime</a></p>
    </div>
  </div>
</body>
</html>
`,

  // Prayer Answered
  prayerAnswered: (firstName: string, prayerTitle: string) => `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #2d5a87 0%, #1e8449 100%);">
      <h1>Praise Report!</h1>
      <p>God has answered your prayer</p>
    </div>
    <div class="content">
      <div style="text-align: center; font-size: 60px; margin: 20px 0;">🙌✨🎉</div>
      <h2>Hallelujah, ${firstName}!</h2>
      <p>We're celebrating with you! Your prayer has been marked as answered:</p>

      <div class="highlight-box" style="border-left-color: #1e8449;">
        <p><strong>"${prayerTitle}"</strong></p>
      </div>

      <p>God is faithful! We encourage you to share your testimony with the community so others can be encouraged and their faith strengthened.</p>

      <div class="scripture">
        "Give thanks to the Lord, for he is good; his love endures forever."
        <span class="scripture-ref">— Psalm 107:1</span>
      </div>

      <p style="text-align: center;">
        <a href="https://tpcministries.org/testimonies/new" class="button" style="background: linear-gradient(135deg, #1e8449 0%, #186a3b 100%); color: white !important;">Share Your Testimony</a>
      </p>

      <p>Rejoicing with you,<br><strong>The TPC Prayer Team</strong></p>
    </div>
    <div class="footer">
      <p>TPC Ministries International</p>
      <p>"The prayer of a righteous person is powerful and effective." — James 5:16</p>
    </div>
  </div>
</body>
</html>
`,

  // Membership Anniversary
  anniversary: (firstName: string, years: number) => `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>${years} Year${years > 1 ? 's' : ''} Together!</h1>
      <p>Celebrating your journey with TPC</p>
    </div>
    <div class="content">
      <div style="text-align: center; font-size: 60px; margin: 20px 0;">🎊💛🌟</div>
      <h2>Happy Anniversary, ${firstName}!</h2>
      <p>Can you believe it's been ${years} year${years > 1 ? 's' : ''} since you joined our family? Time flies when you're walking in purpose!</p>

      <div class="highlight-box">
        <p><strong>Look how far you've come!</strong></p>
        <p style="margin-top: 10px;">Over this time, you've been part of countless prophetic words, teachings, prayers, and community moments. Every step has been part of your divine journey.</p>
      </div>

      <div class="scripture">
        "Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus."
        <span class="scripture-ref">— Philippians 1:6</span>
      </div>

      <p>Thank you for being part of this family. Here's to many more years of growth, breakthrough, and prophetic encounters!</p>

      <p style="text-align: center;">
        <a href="https://tpcministries.org/dashboard" class="button">Continue Your Journey</a>
      </p>

      <p>With gratitude,<br><strong>Prophet Lorenzo & The TPC Family</strong></p>
    </div>
    <div class="footer">
      <p>TPC Ministries International</p>
      <p><a href="https://tpcministries.org">www.tpcministries.org</a></p>
    </div>
  </div>
</body>
</html>
`,

  // Weekly Digest
  weeklyDigest: (firstName: string, stats: { devotionalsRead: number; prayersSubmitted: number; teachingsWatched: number }, highlights: string[]) => `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Weekly Spiritual Recap</h1>
      <p>See how God moved this week</p>
    </div>
    <div class="content">
      <h2>Hey ${firstName}!</h2>
      <p>Here's a look at your spiritual journey this week:</p>

      <div style="display: flex; justify-content: space-around; text-align: center; margin: 30px 0;">
        <div style="flex: 1;">
          <div style="font-size: 36px; color: #d4af37; font-weight: bold;">${stats.devotionalsRead}</div>
          <div style="color: #666; font-size: 14px;">Devotionals</div>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 36px; color: #d4af37; font-weight: bold;">${stats.prayersSubmitted}</div>
          <div style="color: #666; font-size: 14px;">Prayers</div>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 36px; color: #d4af37; font-weight: bold;">${stats.teachingsWatched}</div>
          <div style="color: #666; font-size: 14px;">Teachings</div>
        </div>
      </div>

      <div class="divider"></div>

      <h3 style="color: #1e3a5f;">This Week's Highlights</h3>
      ${highlights.map(h => `<p style="padding: 10px; background: #f8f9fa; border-radius: 6px; margin: 10px 0;">✨ ${h}</p>`).join('')}

      <div class="divider"></div>

      <div class="scripture">
        "But grow in the grace and knowledge of our Lord and Savior Jesus Christ."
        <span class="scripture-ref">— 2 Peter 3:18</span>
      </div>

      <p style="text-align: center;">
        <a href="https://tpcministries.org/dashboard" class="button">Continue Growing</a>
      </p>
    </div>
    <div class="footer">
      <p>TPC Ministries International</p>
      <p><a href="https://tpcministries.org/settings/notifications">Manage email preferences</a></p>
    </div>
  </div>
</body>
</html>
`,

  // Prophetic Word Release
  propheticWord: (firstName: string, wordTitle: string, excerpt: string) => `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #4a1e5f 0%, #1e3a5f 100%);">
      <h1>New Prophetic Word</h1>
      <p>A timely message for the body of Christ</p>
    </div>
    <div class="content">
      <h2>${firstName}, there's a word for you</h2>
      <p>Prophet Lorenzo has released a new prophetic word that we believe will speak directly to what you're walking through:</p>

      <div class="highlight-box" style="border-left-color: #4a1e5f;">
        <p style="font-size: 18px; font-weight: 600; color: #4a1e5f;">"${wordTitle}"</p>
        <p style="margin-top: 15px; font-style: italic;">"${excerpt}..."</p>
      </div>

      <div class="scripture">
        "Surely the Sovereign Lord does nothing without revealing his plan to his servants the prophets."
        <span class="scripture-ref">— Amos 3:7</span>
      </div>

      <p style="text-align: center;">
        <a href="https://tpcministries.org/prophecy" class="button" style="background: linear-gradient(135deg, #4a1e5f 0%, #3d1850 100%); color: white !important;">Listen to Full Word</a>
      </p>

      <p>Be blessed,<br><strong>TPC Ministries</strong></p>
    </div>
    <div class="footer">
      <p>TPC Ministries International</p>
      <p>"My sheep hear my voice" — John 10:27</p>
    </div>
  </div>
</body>
</html>
`,

  // Event Invitation
  eventInvitation: (firstName: string, eventName: string, eventDate: string, eventDescription: string) => `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>You're Invited!</h1>
      <p>${eventName}</p>
    </div>
    <div class="content">
      <h2>${firstName}, join us!</h2>
      <p>We have a special gathering coming up and we'd love for you to be there:</p>

      <div style="background: linear-gradient(135deg, #f8f4e8 0%, #fff9e6 100%); padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center;">
        <h3 style="color: #1e3a5f; margin: 0 0 10px;">${eventName}</h3>
        <p style="color: #d4af37; font-size: 18px; font-weight: 600; margin: 0;">${eventDate}</p>
      </div>

      <p>${eventDescription}</p>

      <div class="scripture">
        "For where two or three gather in my name, there am I with them."
        <span class="scripture-ref">— Matthew 18:20</span>
      </div>

      <p style="text-align: center;">
        <a href="https://tpcministries.org/events" class="button">RSVP Now</a>
      </p>

      <p>See you there!<br><strong>The TPC Team</strong></p>
    </div>
    <div class="footer">
      <p>TPC Ministries International</p>
      <p><a href="https://tpcministries.org/events">View All Events</a></p>
    </div>
  </div>
</body>
</html>
`
}

// Helper function to send email using the template
export async function sendTemplatedEmail(
  to: string,
  subject: string,
  templateName: keyof typeof emailTemplates,
  templateData: any
): Promise<boolean> {
  try {
    const template = emailTemplates[templateName]
    if (!template) {
      console.error(`Template ${templateName} not found`)
      return false
    }

    const html = typeof template === 'function' ? template(...Object.values(templateData)) : template

    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        html,
        text: html.replace(/<[^>]*>/g, '') // Strip HTML for plain text version
      })
    })

    return response.ok
  } catch (error) {
    console.error('Error sending templated email:', error)
    return false
  }
}
