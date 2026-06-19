// Single source of truth for the Kenya Report & Debrief live virtual event.
// Used by the registration route, the reminder cron, the .ics endpoint, and the page.

export const KENYA_DEBRIEF = {
  title: 'Kenya Report & Debrief',
  // 9:00 AM Pacific = 12:00 PM Eastern = 7:00 PM East Africa = 16:00 UTC.
  startUTC: '2026-06-20T16:00:00Z',
  endUTC: '2026-06-20T17:30:00Z',
  dateLabel: 'Saturday, June 20',
  timesLabel: '9:00 AM Pacific · 12:00 PM Eastern · 7:00 PM East Africa Time',
  zoomUrl:
    'https://us06web.zoom.us/j/86414076794?pwd=omvz9J3xCSa3eGxC5zVGQaCZSuNdAu.1',
  meetingId: '864 1407 6794',
  passcode: '', // embedded in the link; shown if provided
  registerUrl: 'https://tpcmin.org/kenya-debrief',
  icsUrl: 'https://tpcmin.org/api/kenya/debrief-calendar',
  contactEmail: 'info@tpcmin.org',
  // Verified tpcmin.org sending domain (same domain as the newsletter sender).
  fromEmail: 'TPC Ministries <events@tpcmin.org>',
} as const

/** Build a Google Calendar "add event" link. */
export function googleCalendarUrl(): string {
  const fmt = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${KENYA_DEBRIEF.title} — TPC Ministries`,
    dates: `${fmt(KENYA_DEBRIEF.startUTC)}/${fmt(KENYA_DEBRIEF.endUTC)}`,
    details: `The Kenya Global Impact Delegation live virtual debrief.\n\nJoin on Zoom: ${KENYA_DEBRIEF.zoomUrl}\n\nMeeting ID: ${KENYA_DEBRIEF.meetingId}`,
    location: KENYA_DEBRIEF.zoomUrl,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Build a valid iCalendar (.ics) document for the event. */
export function buildIcs(): string {
  const fmt = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const stamp = fmt(KENYA_DEBRIEF.startUTC)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TPC Ministries//Kenya Debrief//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:kenya-report-debrief-2026-06-20@tpcmin.org',
    `DTSTAMP:${stamp}`,
    `DTSTART:${fmt(KENYA_DEBRIEF.startUTC)}`,
    `DTEND:${fmt(KENYA_DEBRIEF.endUTC)}`,
    `SUMMARY:${KENYA_DEBRIEF.title} — TPC Ministries`,
    `DESCRIPTION:The Kenya Global Impact Delegation live virtual debrief.\\n\\nJoin on Zoom: ${KENYA_DEBRIEF.zoomUrl}\\n\\nMeeting ID: ${KENYA_DEBRIEF.meetingId}`,
    `LOCATION:${KENYA_DEBRIEF.zoomUrl}`,
    `URL:${KENYA_DEBRIEF.zoomUrl}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Kenya Report & Debrief starts in 1 hour',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}
