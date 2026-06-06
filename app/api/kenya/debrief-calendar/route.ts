import { buildIcs } from '@/lib/kenya-debrief'

export const dynamic = 'force-static'

export async function GET() {
  return new Response(buildIcs(), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="kenya-report-debrief.ics"',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
