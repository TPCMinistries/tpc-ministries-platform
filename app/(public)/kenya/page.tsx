import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  ArrowRight,
  MapPin,
  Mail,
  Users,
  Shield,
  Globe2,
  Download,
  FileText,
  ImageIcon,
  Newspaper,
  GraduationCap,
  Heart,
  HandHeart,
  Plane,
  Gift,
  CircleDollarSign,
  CreditCard,
} from 'lucide-react'
import { ExpandableCities } from '@/components/kenya/expandable-sections'

export const metadata: Metadata = {
  title: 'Kenya 2026 Kingdom Impact Trip | TPC Ministries',
  description: 'Kenya 2026 (April 23 – May 6) is complete. 14 days of ministry across Kenya. See the full recap and join the next mission list.',
  keywords: ['Kenya mission trip', 'TPC Ministries', 'Christian missions', 'Africa missions', 'Kingdom Impact Trip', 'Kenya 2026'],
  openGraph: {
    title: 'Kenya 2026 Kingdom Impact Trip — Recap',
    description: '14 days of Kingdom impact across Kenya. The trip is complete — see the recap.',
    type: 'website',
    siteName: 'TPC Ministries',
    images: [
      {
        url: 'https://tpcmin.org/images/kenya/kenya-flier-2026.png',
        width: 1200,
        height: 630,
        alt: 'Kenya 2026 Kingdom Impact Trip - TPC Ministries',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kenya 2026 Kingdom Impact Trip — Recap',
    description: 'The 14-day mission to Kenya is complete. See the recap.',
    images: ['https://tpcmin.org/images/kenya/kenya-flier-2026.png'],
  },
}

const stats = [
  { value: '14', label: 'Days completed' },
  { value: '2026', label: 'The year' },
  { value: 'Kenya', label: 'The nation' },
  { value: '✓', label: 'Mission accomplished' },
]

const tracks = [
  {
    name: 'Ministry & Spiritual Care',
    bgClass: 'bg-purple-600',
    image: '/images/kenya/tracks/ministry.png',
    headline: 'Strengthen churches and raise leaders',
    items: [
      'Pastoral conferences and leadership training',
      'Prayer, worship, and prophetic ministry',
      'Church planting and strengthening support',
      'Community evangelism and outreach',
    ],
  },
  {
    name: 'Health & Wellness',
    bgClass: 'bg-red-700',
    image: '/images/kenya/tracks/medical.png',
    headline: 'Heal bodies and transform communities',
    items: [
      'Healthcare workforce development',
      'Community health outreach clinics',
      'Medical leadership roundtables',
      'Health education and prevention programs',
    ],
  },
  {
    name: 'Education & Technology',
    bgClass: 'bg-teal-700',
    image: '/images/kenya/tracks/education.png',
    headline: 'Equip the next generation with skills and access',
    items: [
      'Digital literacy and technology training',
      'Teacher development and school partnerships',
      'Youth mentorship and career readiness',
      'STEM workshops and computer labs',
    ],
  },
  {
    name: 'Business & Economic Empowerment',
    bgClass: 'bg-green-700',
    image: '/images/kenya/tracks/business.png',
    headline: 'Where capital meets opportunity',
    items: [
      'Investor pitch sessions with Kenyan companies',
      'Entrepreneurship and scaling strategies',
      'Cross-border partnership and market entry',
      'Business conferences in Nairobi and Mombasa',
    ],
  },
]

const included = [
  'Round-trip international flights',
  'Quality accommodations throughout',
  'All meals and ground transportation',
  'Safari and cultural experiences',
  'Ministry supplies and materials',
  'Travel insurance coverage',
  'Pre-trip training and preparation',
  '24/7 on-ground support team',
]

const timeline = [
  { phase: 'Arrival & Orientation', dates: 'April 23', description: 'Arrive in Nairobi, welcome reception, team orientation, and cultural briefing' },
  { phase: 'Nairobi Business Conference', dates: 'April 24', description: 'Full-day investor conference — pitch sessions, partnerships, and deal flow' },
  { phase: 'Travel & Transition', dates: 'April 25', description: 'Travel to western Kenya with cultural immersion and team preparation' },
  { phase: 'Kakamega Service', dates: 'April 26–30', description: 'Rural community impact — all four tracks active across villages and schools' },
  { phase: 'Mombasa Service', dates: 'May 1–4', description: 'Coastal ministry — business conference, health clinics, education, and church ministry' },
  { phase: 'Wrap-Up & Departure', dates: 'May 5–6', description: 'Reflection, celebration, safari experience, and departure' },
]

const partners: Array<{ name: string; image?: string }> = [
  { name: 'TPC Ministries', image: '/images/kenya/partners/tpc.png' },
  { name: 'Institute for Human Advancement', image: '/images/kenya/partners/iha.png' },
  { name: 'Rise Church Global' },
  { name: 'Uplift Communities', image: '/images/kenya/partners/uplift.png' },
  { name: 'Kenya Diaspora Alliance', image: '/images/kenya/partners/kda.png' },
]

export default function KenyaTripPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ===== POST-TRIP RECAP BANNER ===== */}
      <Link
        href="/kenya-2026"
        className="group relative block bg-gradient-to-r from-gold/90 via-gold to-gold/90 px-4 py-3 text-center text-sm font-semibold text-navy-950 transition hover:from-gold hover:to-gold sm:text-base"
      >
        <span className="inline-flex items-center gap-2">
          The Kenya 2026 trip is complete.
          <span className="underline decoration-navy-950/50 underline-offset-2">See the full recap →</span>
        </span>
      </Link>

      {/* ===== HERO — Full photo background ===== */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden">
        <Image
          src="/images/kenya/hero-landscape.png"
          alt="Kenya savanna sunset"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/50 to-navy-950/90" />

        <div className="container relative z-10 mx-auto max-w-5xl px-4 py-20">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.3em] text-gold">
            Global Impact Delegation
          </p>
          <h1 className="mb-2 font-display text-display-2xl md:text-[7rem]">
            <span className="text-gold">KENYA</span>{' '}
            <span className="text-white">2026</span>
          </h1>
          <div className="mx-auto my-6 h-1 w-64 bg-gradient-to-r from-gold via-gold to-gold/50" />
          <h2 className="mb-6 font-display text-display-lg text-white">
            Join the Delegation
          </h2>
          <p className="mb-4 max-w-lg text-body-xl text-gold-200/90">
            14 days of leadership, ministry, and impact across Kenya with a global delegation.
          </p>

          {/* Track pills */}
          <div className="mb-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-purple-600 px-4 py-1.5 text-body-sm font-bold text-white">MINISTRY</span>
            <span className="rounded-full bg-red-700 px-4 py-1.5 text-body-sm font-bold text-white">HEALTH</span>
            <span className="rounded-full bg-teal-700 px-4 py-1.5 text-body-sm font-bold text-white">EDUCATION</span>
            <span className="rounded-full bg-green-700 px-4 py-1.5 text-body-sm font-bold text-white">BUSINESS</span>
          </div>

          <p className="mb-2 flex items-center gap-2 text-white/70">
            <MapPin className="h-4 w-4" />
            Nairobi &bull; Kakamega &bull; Mombasa
          </p>
          <p className="mb-1 text-body-lg font-bold text-white">APRIL 23 – MAY 6, 2026 · COMPLETE</p>
          <p className="mb-8 font-display text-display-md text-gold">Mission accomplished</p>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Link href="/kenya-2026">
              <Button size="lg" className="h-14 w-full bg-gold px-8 text-body-lg font-bold text-navy hover:bg-gold-300 sm:w-auto">
                See the recap
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/kenya/pay">
              <Button size="lg" className="h-14 w-full border-2 border-gold bg-gold/20 px-8 text-body-lg font-bold text-gold backdrop-blur-sm hover:bg-gold hover:text-navy sm:w-auto">
                <CreditCard className="mr-2 h-5 w-5" />
                Make a final payment
              </Button>
            </Link>
            <Link href="/kenya/give">
              <Button size="lg" className="h-14 w-full border-2 border-white/30 bg-white/10 px-8 text-body-lg font-bold text-white backdrop-blur-sm hover:bg-white hover:text-navy sm:w-auto">
                <Heart className="mr-2 h-5 w-5" />
                Support the Mission
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy-950 to-transparent" />
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="border-y border-gold/20 bg-navy-950 py-8 text-white">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-1 font-display text-display-md text-gold">{stat.value}</div>
                <div className="text-body-sm uppercase tracking-wider text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PARTNER LOGOS ===== */}
      <section className="border-t border-gold/10 bg-navy-950 py-10">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <p className="mb-6 text-body-sm uppercase tracking-[0.2em] text-white/40">
            In Partnership With
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {partners.map((partner) => (
              <div key={partner.name} className="transition-transform hover:scale-105">
                {partner.image ? (
                  <div className="relative h-[48px] w-[140px] rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                    <Image
                      src={partner.image}
                      alt={partner.name}
                      fill
                      className="object-contain drop-shadow-md"
                    />
                  </div>
                ) : (
                  <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-body-sm font-medium tracking-wide text-white/80 md:text-body-md">
                    {partner.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== THE OPPORTUNITY ===== */}
      <section id="details" className="bg-background px-4 py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">The Opportunity</p>
            <h2 className="mb-6 font-display text-display-lg md:text-display-xl text-foreground">
              Transform Lives. Be Transformed.
            </h2>
            <p className="text-body-xl text-muted-foreground">
              Join a carefully curated delegation of purpose-driven professionals, ministers, and
              servant-leaders for 14 days of meaningful partnership with Kenyan churches and communities.
            </p>
            <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          <div className="mb-16 grid gap-8 md:grid-cols-3">
            {[
              { icon: Globe2, title: 'Cultural Immersion', desc: 'Experience authentic Kenyan culture, cuisine, and community. Includes safari adventures and meaningful local connections.' },
              { icon: Users, title: 'Lasting Partnership', desc: 'Build relationships that extend beyond the trip. Connect with local leaders and contribute to sustainable, long-term impact.' },
              { icon: Heart, title: 'Personal Growth', desc: 'Return home with a renewed sense of purpose, expanded worldview, and deeper understanding of your calling.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-shadow hover:shadow-md">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
                  <item.icon className="h-8 w-8 text-gold-600" />
                </div>
                <h3 className="mb-3 font-display text-display-xs text-foreground">{item.title}</h3>
                <p className="text-body-md text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm md:p-12">
            <h3 className="mb-10 text-center font-display text-display-sm text-foreground">Your Journey</h3>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {timeline.map((item, index) => (
                <div key={item.phase} className="relative">
                  <div className="relative z-10 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold shadow-lg shadow-gold/25">
                      <span className="font-display text-body-lg font-bold text-navy">{index + 1}</span>
                    </div>
                    <h4 className="mb-1 text-body-sm font-bold text-foreground">{item.phase}</h4>
                    <p className="mb-2 text-body-xs font-medium text-gold-600">{item.dates}</p>
                    <p className="text-body-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICE TRACKS — Photo Cards ===== */}
      <section className="bg-card px-4 py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Your Impact</p>
            <h2 className="mb-6 font-display text-display-lg md:text-display-xl text-foreground">
              Serve According to Your Gifts
            </h2>
            <p className="text-body-xl text-muted-foreground">
              Choose from four service tracks based on your skills, experience, and calling.
            </p>
            <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {tracks.map((track) => (
              <div key={track.name} className="group relative h-80 overflow-hidden rounded-3xl">
                <Image
                  src={track.image}
                  alt={track.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className={`${track.bgClass} rounded-full px-3 py-1 text-body-xs font-bold text-white`}>
                    {track.name.toUpperCase()}
                  </span>
                  <h3 className="mt-3 font-display text-display-xs text-white">{track.headline}</h3>
                  <ul className="mt-3 space-y-1">
                    {track.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-body-sm text-white/70">
                        <CheckCircle className="h-3 w-3 flex-shrink-0 text-gold" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CITIES ===== */}
      <section className="bg-navy dark:bg-navy-950 px-4 py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Where We Serve</p>
            <h2 className="mb-6 font-display text-display-lg md:text-display-xl text-white">
              Three Cities, One Mission
            </h2>
            <p className="mb-4 text-body-xl text-white/50">
              Experience the diversity of Kenya across urban, coastal, and rural communities.
            </p>
            <p className="text-body-sm text-white/30">Click any city to explore</p>
          </div>

          <ExpandableCities />
        </div>
      </section>

      {/* ===== WHAT'S INCLUDED ===== */}
      <section className="bg-navy-950 px-4 py-section text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.08),transparent_60%)]" />
        <div className="container mx-auto max-w-5xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">All-Inclusive Experience</p>
              <h2 className="mb-6 font-display text-display-md md:text-display-lg text-white">
                Everything You Need for $3,500
              </h2>
              <p className="mb-8 text-body-lg text-white/50">
                We handle all the logistics so you can focus on what matters most—serving,
                connecting, and growing.
              </p>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                    <span className="text-body-md text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <div className="text-center">
                <Shield className="mx-auto mb-4 h-12 w-12 text-gold" />
                <h3 className="mb-4 font-display text-display-xs text-white">Scholarships Available</h3>
                <p className="mb-6 text-body-md text-white/50">
                  Don&apos;t let finances hold you back. Limited partial scholarships are available
                  for qualified applicants who demonstrate need and alignment with our mission.
                </p>
                <a href="#apply">
                  <Button className="h-12 bg-gold px-8 font-bold text-navy hover:bg-gold-300">
                    Apply for Scholarship
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHO SHOULD APPLY ===== */}
      <section className="bg-secondary px-4 py-section">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Ideal Candidates</p>
          <h2 className="mb-6 font-display text-display-md md:text-display-lg text-foreground">
            Is This Trip For You?
          </h2>
          <p className="mb-12 text-body-xl text-muted-foreground">
            We&apos;re looking for individuals who embody these qualities:
          </p>

          <div className="mb-12 flex flex-wrap justify-center gap-4">
            {['Servant Heart', 'Team Player', 'Spiritually Mature', 'Purpose-Driven', 'Adaptable', 'Committed'].map((quality) => (
              <span
                key={quality}
                className="rounded-full border border-border bg-card px-6 py-3 font-medium text-foreground shadow-sm"
              >
                {quality}
              </span>
            ))}
          </div>

          <p className="mx-auto max-w-2xl text-body-md text-muted-foreground">
            Whether you&apos;re a minister, healthcare professional, educator, business leader, or
            simply someone with a heart for service—there&apos;s a place for you on this team.
          </p>
        </div>
      </section>

      {/* ===== SCHOLARSHIP ===== */}
      <section id="scholarship" className="bg-background px-4 py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-2">
                <GraduationCap className="h-4 w-4 text-gold-600" />
                <span className="text-body-sm font-medium text-gold-600">Financial Assistance</span>
              </div>
              <h2 className="mb-6 font-display text-display-md md:text-display-lg text-foreground">
                Scholarship Opportunities
              </h2>
              <p className="mb-6 text-body-lg text-muted-foreground">
                We believe finances should not be a barrier to answering God&apos;s call. Limited partial
                scholarships are available for qualified applicants who demonstrate both financial
                need and strong alignment with our mission values.
              </p>

              <div className="mb-8 space-y-4">
                <h3 className="font-semibold text-foreground">Priority given to:</h3>
                <ul className="space-y-3">
                  {[
                    'Students and young adults with clear calling',
                    'Emerging leaders in ministry or service',
                    'Medical and education professionals with needed skills',
                    'First-time mission trip participants',
                    'Those filling strategic ministry roles',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                      <span className="text-body-md text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a href="#apply">
                <Button className="h-12 bg-gold px-8 font-semibold text-navy hover:bg-gold-300">
                  Apply with Scholarship Request
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>

            <div className="rounded-3xl border border-border bg-secondary p-8 shadow-lg">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gold/10">
                  <HandHeart className="h-10 w-10 text-gold-600" />
                </div>
                <h3 className="font-display text-display-xs text-foreground">How It Works</h3>
              </div>

              <div className="space-y-6">
                {[
                  { step: '1', title: 'Indicate Need in Application', desc: 'Select "Yes" for scholarship on the application form' },
                  { step: '2', title: 'Share Your Story', desc: 'Tell us about your calling and financial situation' },
                  { step: '3', title: 'Prayerful Review', desc: 'Our team reviews applications and awards based on need and fit' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold text-body-sm font-bold text-navy">{item.step}</div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-body-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl border border-gold/20 bg-gold/10 p-4">
                <p className="text-body-sm text-muted-foreground">
                  <strong className="text-gold-600">Note:</strong> Scholarships are partial, not full coverage.
                  All team members contribute financially to demonstrate commitment and shared ownership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== APPLICATION CLOSED ===== */}
      <section id="apply" className="bg-secondary px-4 py-section">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Kenya 2026 · Closed</p>
            <h2 className="mb-4 font-display text-display-md md:text-display-lg text-foreground">
              The trip is complete.
            </h2>
            <p className="text-body-lg text-muted-foreground">
              Applications for Kenya 2026 are now closed. The team is back. See the full recap of what happened on the ground.
            </p>
            <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/kenya-2026">
              <Button size="lg" className="h-12 bg-gold px-6 font-bold text-navy-950 hover:bg-gold-300">
                See the Kenya 2026 recap
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/connect">
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-2 border-gold/40 bg-transparent px-6 text-foreground hover:border-gold hover:bg-gold/10"
              >
                Join the list for the next mission
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== GIVE / DONATE — Photo Background ===== */}
      <section id="give" className="relative overflow-hidden px-4 py-section text-white">
        <Image
          src="/images/kenya/donate-bg.png"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/70 to-navy-950/90" />

        <div className="container relative z-10 mx-auto max-w-5xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <Heart className="h-4 w-4 text-gold" />
              <span className="text-body-sm font-medium text-gold">Partner With Us</span>
            </div>
            <h2 className="mb-6 font-display text-display-lg md:text-display-xl text-white">
              Support the Kenya Mission
            </h2>
            <p className="text-body-xl text-white/50">
              Your generosity makes Kingdom impact possible. Help send teams, fund scholarships,
              and resource communities in Kenya.
            </p>
          </div>

          <div className="mb-12 grid gap-8 md:grid-cols-3">
            {[
              { icon: Plane, title: 'Sponsor a Participant', desc: 'Help cover travel, lodging, and ministry costs for a team member called to serve.', range: '$500 - $2,500' },
              { icon: Gift, title: 'Fund Ministry Supplies', desc: 'Provide medical supplies, school materials, business resources, or farming equipment.', range: '$50 - $500' },
              { icon: GraduationCap, title: 'Scholarship Fund', desc: 'Contribute to the scholarship fund to help qualified participants who need financial assistance.', range: 'Any Amount' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/20">
                  <item.icon className="h-8 w-8 text-gold" />
                </div>
                <h3 className="mb-3 font-display text-display-xs text-white">{item.title}</h3>
                <p className="mb-4 text-body-sm text-white/50">{item.desc}</p>
                <p className="font-semibold text-gold">{item.range}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm md:p-12">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-4 font-display text-display-xs text-white">Give Today</h3>
                <p className="mb-6 text-body-md text-white/50">
                  100% of your gift designated for Kenya missions goes directly to supporting the trip,
                  team members, and on-ground ministry. TPC Ministries is a registered 501(c)(3)
                  nonprofit—your donation is tax-deductible.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/kenya/give">
                    <Button size="lg" className="h-14 w-full bg-gold px-8 font-bold text-navy hover:bg-gold-300 sm:w-auto">
                      <CircleDollarSign className="mr-2 h-5 w-5" />
                      Give to Kenya Mission
                    </Button>
                  </Link>
                  <a href="mailto:info@tpcmin.org?subject=Kenya%20Mission%20Giving">
                    <Button size="lg" className="h-14 w-full border-2 border-white/30 bg-white/10 px-8 font-bold text-white backdrop-blur-sm hover:bg-white hover:text-navy sm:w-auto">
                      <Mail className="mr-2 h-5 w-5" />
                      Contact Us
                    </Button>
                  </a>
                </div>

                <Link
                  href="/kenya/pack-the-mission"
                  className="group mt-6 block rounded-2xl border border-gold/30 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-gold hover:bg-gold/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gold/20">
                      <Gift className="h-6 w-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white transition-colors group-hover:text-gold">Pack the Mission</h4>
                      <p className="text-body-sm text-white/40">Help us fill the suitcases with supplies for Kenya — pledge items or contribute funds</p>
                    </div>
                    <ArrowRight className="h-5 w-5 flex-shrink-0 text-white/30 transition-colors group-hover:text-gold" />
                  </div>
                </Link>
              </div>
              <div className="text-center">
                <div className="inline-block rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="mb-2 text-body-sm uppercase tracking-wider text-white/40">2026 Missions Goal</p>
                  <p className="mb-2 font-display text-display-lg text-gold">$50,000</p>
                  <p className="text-body-sm text-white/50">For team support, supplies & scholarships</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-body-sm text-white/30">
              Prefer to give by check? Mail to: TPC Ministries, [Address] &bull; Memo: Kenya Mission 2026
            </p>
          </div>
        </div>
      </section>

      {/* ===== PRESS & MEDIA ===== */}
      <section id="press" className="border-t border-border bg-background px-4 py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2">
              <Newspaper className="h-4 w-4 text-foreground" />
              <span className="text-body-sm font-medium text-foreground">Press & Media</span>
            </div>
            <h2 className="mb-4 font-display text-display-md md:text-display-lg text-foreground">
              Download Trip Resources
            </h2>
            <p className="text-body-lg text-muted-foreground">
              Access our official trip documentation, promotional materials, and press kit.
            </p>
          </div>

          {/* Overview + Flier */}
          <div className="mx-auto mb-8 grid max-w-5xl gap-6 md:grid-cols-2">
            <a
              href="/documents/kenya/overview.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-border bg-secondary p-8 transition-all duration-300 hover:border-gold hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gold transition-transform group-hover:scale-105">
                  <FileText className="h-7 w-7 text-navy" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-body-lg font-bold text-foreground transition-colors group-hover:text-gold-600">
                    Trip Overview
                  </h3>
                  <p className="mb-3 text-body-sm text-muted-foreground">
                    Full overview — 16 days, 4 tracks, 3 cities, 5 partner organizations, timeline, and vision.
                  </p>
                  <div className="flex items-center gap-2 text-body-sm font-semibold text-gold-600">
                    <Download className="h-4 w-4" />
                    View PDF
                  </div>
                </div>
              </div>
            </a>

            <a
              href="/images/kenya/kenya-flier-2026.png"
              download="Kenya-Trip-2026-Flier.png"
              className="group rounded-2xl border border-border bg-secondary p-8 transition-all duration-300 hover:border-gold hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-navy transition-transform group-hover:scale-105">
                  <ImageIcon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-body-lg font-bold text-foreground transition-colors group-hover:text-gold-600">
                    Promotional Flier
                  </h3>
                  <p className="mb-3 text-body-sm text-muted-foreground">
                    High-resolution flier for sharing on social media, printing, or distributing.
                  </p>
                  <div className="flex items-center gap-2 text-body-sm font-semibold text-gold-600">
                    <Download className="h-4 w-4" />
                    Download Image
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* Track Decks */}
          <div className="mx-auto max-w-5xl">
            <h3 className="mb-6 text-center font-display text-display-xs text-foreground">Service Track Details</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: 'Ministry', color: 'bg-purple-600', file: 'ministry-track.pdf', desc: 'Pastors conferences, revivals, crusades, and prophetic ministry' },
                { name: 'Health & Wellness', color: 'bg-red-700', file: 'health-wellness-track.pdf', desc: 'Medical camps, telemedicine, doctor training — led by Dr. Michele Griffith' },
                { name: 'Education & Tech', color: 'bg-teal-700', file: 'education-technology-track.pdf', desc: 'School partnerships, AI literacy, orphan sponsorship — led by IHA' },
                { name: 'Business', color: 'bg-green-700', file: 'business-empowerment-track.pdf', desc: 'Investment conferences in Nairobi & Mombasa — led by Uplift Communities' },
              ].map((track) => (
                <a
                  key={track.name}
                  href={`/documents/kenya/${track.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-border bg-card p-5 text-center transition-all duration-300 hover:border-gold hover:shadow-lg"
                >
                  <div className={`${track.color} mb-3 inline-block rounded-full px-3 py-1 text-body-xs font-bold text-white`}>
                    {track.name.toUpperCase()}
                  </div>
                  <p className="mb-4 text-body-xs leading-relaxed text-muted-foreground">{track.desc}</p>
                  <div className="flex items-center justify-center gap-2 text-body-sm font-semibold text-gold-600">
                    <Download className="h-3.5 w-3.5" />
                    View Deck
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-body-sm text-muted-foreground">
              For media inquiries or additional resources, contact{' '}
              <a href="mailto:info@tpcmin.org" className="font-medium text-gold-600 hover:underline">
                info@tpcmin.org
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ===== FAQ / CONTACT ===== */}
      <section className="border-t border-border bg-secondary px-4 py-section-sm">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="mb-4 font-display text-display-sm text-foreground">Questions?</h3>
          <p className="mb-6 text-body-md text-muted-foreground">
            We&apos;re here to help you discern if this trip is right for you.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a href="mailto:info@tpcmin.org">
              <Button className="bg-navy px-6 font-semibold text-white hover:bg-navy-800">
                <Mail className="mr-2 h-4 w-4" />
                info@tpcmin.org
              </Button>
            </a>
            <Link href="/contact">
              <Button variant="outline" className="border-2 border-border px-6 font-semibold text-foreground hover:bg-navy hover:text-white">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative bg-navy-950 px-4 py-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />
        <div className="container relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Mission Complete</p>
          <h2 className="mb-4 font-display text-display-lg md:text-display-xl text-white">
            See what God did.
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-body-xl text-white/50">
            Fourteen days on the ground in Kenya. Every moment captured. Watch the full recap and step into what comes next.
          </p>
          <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/kenya-2026">
              <Button size="lg" className="h-14 bg-gold px-10 text-body-lg font-bold text-navy shadow-lg hover:bg-gold-300">
                Watch the recap
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/kenya/give">
              <Button size="lg" className="h-14 border-2 border-gold bg-gold/20 px-10 text-body-lg font-bold text-gold hover:bg-gold hover:text-navy">
                <Heart className="mr-2 h-5 w-5" />
                Support the work
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
