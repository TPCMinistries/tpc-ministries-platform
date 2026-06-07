// Branded HTML emails for the Kenya Report & Debrief sequence.
// One shared shell; one builder per stage. Each returns { subject, html }.

import { KENYA_DEBRIEF, googleCalendarUrl } from '@/lib/kenya-debrief'

type Stage = 'confirmation' | 't7' | 't1' | 'day_of'

function shell(opts: {
  preheader: string
  heading: string
  bodyHtml: string
  showCountdownNote?: string
}): string {
  const { preheader, heading, bodyHtml, showCountdownNote } = opts
  return `
  <div style="background:#0a1322;padding:0;margin:0;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</span>
    <div style="max-width:600px;margin:0 auto;background:#0e1a2e;font-family:Arial,Helvetica,sans-serif;">
      <div style="padding:32px 28px;text-align:center;background:linear-gradient(135deg,#1e3a61,#0e1a2e);">
        <p style="margin:0;color:#d4b883;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Global Impact Delegation · Live Virtual Debrief</p>
        <h1 style="margin:12px 0 0;color:#ffffff;font-family:Georgia,serif;font-size:38px;line-height:1;">Kenya</h1>
        <p style="margin:6px 0 0;color:#ffffff;font-size:15px;letter-spacing:5px;text-transform:uppercase;">Report &amp; Debrief</p>
      </div>
      <div style="padding:32px 28px;color:#e7ecf5;">
        <h2 style="margin:0 0 16px;color:#ffffff;font-family:Georgia,serif;font-size:24px;">${heading}</h2>
        ${showCountdownNote ? `<p style="margin:0 0 18px;color:#d4b883;font-weight:bold;font-size:15px;">${showCountdownNote}</p>` : ''}
        ${bodyHtml}
        <div style="margin:28px 0;padding:20px;border-left:3px solid #d4b883;background:rgba(212,184,131,0.08);">
          <p style="margin:0;color:#d4b883;font-size:13px;text-transform:uppercase;letter-spacing:1px;">${KENYA_DEBRIEF.dateLabel}</p>
          <p style="margin:8px 0 0;color:#ffffff;font-size:15px;">${KENYA_DEBRIEF.timesLabel}</p>
        </div>
        <div style="text-align:center;margin:28px 0;">
          <a href="${KENYA_DEBRIEF.zoomUrl}" style="display:inline-block;background:#d4b883;color:#0e1a2e;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;">Join on Zoom →</a>
        </div>
        <p style="margin:0 0 6px;text-align:center;color:#9fb0cc;font-size:13px;">Meeting ID: ${KENYA_DEBRIEF.meetingId}</p>
        <p style="margin:0 0 20px;text-align:center;font-size:13px;">
          <a href="${googleCalendarUrl()}" style="color:#d4b883;">Add to Google Calendar</a>
          &nbsp;·&nbsp;
          <a href="${KENYA_DEBRIEF.icsUrl}" style="color:#d4b883;">Add to Apple / Outlook</a>
        </p>
        <p style="margin:20px 0 0;color:#c4cee0;font-size:14px;line-height:1.6;">
          Questions? Reply to this email or reach us at
          <a href="mailto:${KENYA_DEBRIEF.contactEmail}" style="color:#d4b883;">${KENYA_DEBRIEF.contactEmail}</a>.
        </p>
        <p style="margin:18px 0 0;color:#c4cee0;font-size:14px;">In partnership with the Institute for Human Advancement,<br/><strong style="color:#ffffff;">TPC Ministries</strong></p>
      </div>
      <div style="text-align:center;padding:16px;background:#0a1322;color:#6b7a96;font-size:12px;">
        &copy; ${new Date().getFullYear()} TPC Ministries · <a href="https://tpcmin.org" style="color:#9fb0cc;">tpcmin.org</a>
      </div>
    </div>
  </div>`
}

export function buildDebriefEmail(stage: Stage, firstName: string): { subject: string; html: string } {
  const name = firstName || 'friend'

  switch (stage) {
    case 'confirmation':
      return {
        subject: "You're registered — Kenya Report & Debrief (Sat, June 27)",
        html: shell({
          preheader: 'Your spot is reserved. Here is your Zoom link and the date.',
          heading: `You're in, ${name}.`,
          bodyHtml: `
            <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#e7ecf5;">
              Your spot is reserved. The delegation is home &mdash; come hear what we did,
              what God did, and what comes next.
            </p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#c4cee0;">
              We'll send a reminder as the day gets close. Can't make it live?
              Stay registered &mdash; we'll send you the full recording afterward.
            </p>`,
        }),
      }

    case 't7':
      return {
        subject: 'One week out — Kenya Report & Debrief',
        html: shell({
          preheader: 'One week until the Kenya Report & Debrief. Save your link.',
          heading: `One week to go, ${name}.`,
          showCountdownNote: 'The live debrief is one week away.',
          bodyHtml: `
            <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#e7ecf5;">
              In seven days, the full delegation gathers live to walk you through 14 days,
              3 cities, and 4 service tracks across Kenya &mdash; and what comes next.
            </p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#c4cee0;">
              Add it to your calendar now so it's locked in. Your Zoom link is below.
            </p>`,
        }),
      }

    case 't1':
      return {
        subject: 'Tomorrow — Kenya Report & Debrief',
        html: shell({
          preheader: 'The Kenya Report & Debrief is tomorrow. Here is your link.',
          heading: `It's tomorrow, ${name}.`,
          showCountdownNote: 'The live debrief is tomorrow, Saturday, June 27.',
          bodyHtml: `
            <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#e7ecf5;">
              Tomorrow the delegation tells the whole story &mdash; live. Here's everything
              you need to join. We'd save the link somewhere easy to find.
            </p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#c4cee0;">
              Can't make it live? No problem &mdash; stay registered and we'll send the recording.
            </p>`,
        }),
      }

    case 'day_of':
      return {
        subject: 'Today — Kenya Report & Debrief is live',
        html: shell({
          preheader: 'The Kenya Report & Debrief is today. Join with the link below.',
          heading: `Today's the day, ${name}.`,
          showCountdownNote: 'The live debrief is TODAY.',
          bodyHtml: `
            <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#e7ecf5;">
              The delegation goes live today. Tap the button below a few minutes early to
              get settled in. We can't wait to share what God did.
            </p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#c4cee0;">
              See you in the room.
            </p>`,
        }),
      }
  }
}
