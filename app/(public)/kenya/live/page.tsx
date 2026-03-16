import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Heart, ArrowLeft, Radio, Clock, Calendar, Users, Activity } from 'lucide-react'

export const revalidate = 60 // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: 'Live Trip Updates — Kenya 2026 | TPC Ministries',
  description:
    'Follow along with the Kenya 2026 Kingdom Impact Trip in real time. Live updates, reflections, and impact reports from our team on the ground.',
  keywords: [
    'Kenya mission trip updates',
    'TPC Ministries Kenya',
    'Kenya 2026 live',
    'mission trip blog',
    'Kenya trip updates',
  ],
  openGraph: {
    title: 'Live Trip Updates — Kenya 2026',
    description:
      'Follow along with the Kenya 2026 Kingdom Impact Trip. Live updates from our team on the ground.',
    type: 'website',
    siteName: 'TPC Ministries',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Trip Updates — Kenya 2026',
    description:
      'Follow along with the Kenya 2026 Kingdom Impact Trip. Live updates from our team on the ground.',
  },
}

export default async function KenyaLivePage() {
  const supabase = createAdminClient()

  // Fetch most recent trip
  const { data: trip } = await supabase
    .from('kenya_trips')
    .select('id, name, start_date, end_date')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!trip) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Radio className="h-8 w-8 text-navy/40" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-3">Trip Updates Coming Soon</h1>
          <p className="text-navy/60 mb-8">
            Live updates will appear here once the Kenya trip begins. Check back soon.
          </p>
          <Link
            href="/kenya"
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-800 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Learn About the Trip
          </Link>
        </div>
      </div>
    )
  }

  // Fetch feed posts with author info
  const { data: posts } = await supabase
    .from('kenya_trip_feed')
    .select(
      'id, content, image_url, created_at, kenya_trip_participants(first_name, last_name, service_track)'
    )
    .eq('trip_id', trip.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch shared reflections
  const { data: reflections } = await supabase
    .from('kenya_trip_reflections')
    .select(
      'id, content, prompt, reflection_date, created_at, kenya_trip_participants(first_name, last_name)'
    )
    .eq('trip_id', trip.id)
    .eq('is_shared', true)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch impact stats
  const { data: impactLogs } = await supabase
    .from('kenya_trip_impact_logs')
    .select('people_count, category')
    .eq('trip_id', trip.id)

  const totalPeopleServed = (impactLogs || []).reduce(
    (sum, l) => sum + (l.people_count || 0),
    0
  )
  const totalActivities = (impactLogs || []).length

  // Merge and sort all updates chronologically
  const allUpdates = [
    ...(posts || []).map((p) => ({ ...p, type: 'post' as const })),
    ...(reflections || []).map((r) => ({ ...r, type: 'reflection' as const })),
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const tripStart = new Date(trip.start_date)
  const tripEnd = new Date(trip.end_date)
  const now = new Date()
  const isActive = now >= tripStart && now <= tripEnd
  const isUpcoming = now < tripStart

  // Calculate trip day number if active
  const tripDayNumber = isActive
    ? Math.ceil(
        (now.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24)
      )
    : null
  const totalTripDays = Math.ceil(
    (tripEnd.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-950 via-navy to-navy-800 text-white py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/kenya"
            className="inline-flex items-center gap-2 text-gold-300 hover:text-gold mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Kenya Trip
          </Link>

          <div className="text-center">
            {isActive ? (
              <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-400" />
                </span>
                Live from Kenya
              </div>
            ) : isUpcoming ? (
              <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 text-gold-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Clock className="h-3.5 w-3.5" />
                Coming Soon
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Calendar className="h-3.5 w-3.5" />
                Trip Highlights
              </div>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              {trip.name}
            </h1>
            <p className="text-white/60">
              {new Date(trip.start_date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })}{' '}
              &mdash;{' '}
              {new Date(trip.end_date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>

            {isActive && tripDayNumber && (
              <p className="text-gold font-semibold mt-2">
                Day {tripDayNumber} of {totalTripDays}
              </p>
            )}

            {/* Impact Stats */}
            {(totalPeopleServed > 0 || totalActivities > 0) && (
              <div className="flex justify-center gap-6 md:gap-10 mt-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Users className="h-4 w-4 text-gold/70" />
                    <p className="text-2xl md:text-3xl font-bold text-gold">
                      {totalPeopleServed.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">
                    People Served
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Activity className="h-4 w-4 text-gold/70" />
                    <p className="text-2xl md:text-3xl font-bold text-gold">
                      {totalActivities}
                    </p>
                  </div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">
                    Activities
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Radio className="h-4 w-4 text-gold/70" />
                    <p className="text-2xl md:text-3xl font-bold text-gold">
                      {(posts || []).length}
                    </p>
                  </div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">
                    Updates
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Updates Feed */}
      <section className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {allUpdates.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Radio className="h-10 w-10 text-navy/20" />
            </div>
            <h2 className="text-xl font-bold text-navy mb-2">
              Updates Coming Soon
            </h2>
            <p className="text-navy/50 mb-8 max-w-md mx-auto">
              Follow along as our team shares their journey across Kenya.
              Updates will appear here in real time once the trip begins.
            </p>
            <Link
              href="/kenya"
              className="inline-flex items-center px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-800 transition-colors font-medium"
            >
              Learn About the Trip
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <span>Latest Updates</span>
              {isActive && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                  Live
                </span>
              )}
            </h2>

            {allUpdates.map((update) => {
              const author =
                update.type === 'post'
                  ? (update as Record<string, unknown>)
                      .kenya_trip_participants as {
                      first_name?: string
                      last_name?: string
                      service_track?: string
                    } | null
                  : (update as Record<string, unknown>)
                      .kenya_trip_participants as {
                      first_name?: string
                      last_name?: string
                    } | null

              const initials = `${author?.first_name?.[0] || ''}${author?.last_name?.[0] || ''}`

              return (
                <article
                  key={`${update.type}-${update.id}`}
                  className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-navy/5 hover:shadow-md transition-shadow"
                >
                  {/* Author row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-navy text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy truncate">
                        {author?.first_name} {author?.last_name}
                      </p>
                      <p className="text-xs text-navy/40">
                        {new Date(update.created_at).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                    </div>
                    {update.type === 'reflection' && (
                      <span className="ml-auto text-xs bg-gold-100 text-gold-800 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
                        Reflection
                      </span>
                    )}
                    {update.type === 'post' &&
                      (
                        author as {
                          service_track?: string
                        } | null
                      )?.service_track && (
                        <span className="ml-auto text-xs bg-navy/5 text-navy/60 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
                          {
                            (
                              author as {
                                service_track?: string
                              }
                            ).service_track
                          }
                        </span>
                      )}
                  </div>

                  {/* Reflection prompt */}
                  {update.type === 'reflection' &&
                    (update as Record<string, unknown>).prompt && (
                      <p className="text-xs text-gold-700 italic mb-2 bg-gold-50 rounded-lg px-3 py-2 border border-gold-100">
                        &ldquo;
                        {(update as Record<string, unknown>).prompt as string}
                        &rdquo;
                      </p>
                    )}

                  {/* Content */}
                  <p className="text-sm text-navy/80 whitespace-pre-wrap leading-relaxed">
                    {update.content}
                  </p>

                  {/* Image (for posts with images) */}
                  {update.type === 'post' &&
                    (update as Record<string, unknown>).image_url && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-navy/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            (update as Record<string, unknown>)
                              .image_url as string
                          }
                          alt="Trip update photo"
                          className="w-full h-auto max-h-96 object-cover"
                        />
                      </div>
                    )}
                </article>
              )
            })}
          </div>
        )}

        {/* Support CTA */}
        <div className="mt-12 bg-gradient-to-br from-gold-50 to-gold-100 border border-gold-200 rounded-2xl p-6 md:p-8 text-center">
          <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-6 w-6 text-gold-700" />
          </div>
          <h3 className="text-lg font-bold text-navy mb-2">
            Support the Mission
          </h3>
          <p className="text-sm text-navy/60 mb-5 max-w-md mx-auto">
            Your prayers and generosity make this trip possible. Partner with us
            to serve communities across Kenya.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/kenya/give"
              className="px-5 py-2.5 bg-gold hover:bg-gold-500 text-navy rounded-xl transition-colors font-semibold text-sm"
            >
              Give Now
            </Link>
            <Link
              href="/kenya/pack-the-mission"
              className="px-5 py-2.5 bg-white border border-gold-300 text-navy rounded-xl hover:bg-gold-50 transition-colors font-semibold text-sm"
            >
              Pack the Mission
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
