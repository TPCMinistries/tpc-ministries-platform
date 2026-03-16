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
} from 'lucide-react'
import { KenyaTripForm } from '@/components/kenya/kenya-trip-form'
import { ExpandableCities } from '@/components/kenya/expandable-sections'

export const metadata: Metadata = {
  title: 'Kenya 2026 Kingdom Impact Trip | TPC Ministries',
  description: 'Join the Kenya 2026 Global Impact Delegation. April 23 – May 6, 2026. 14 days of leadership, ministry, healthcare, and business impact across Nairobi, Kakamega, and Mombasa. $3,500 all-inclusive.',
  keywords: ['Kenya mission trip', 'TPC Ministries', 'Christian missions', 'Africa missions', 'Kingdom Impact Trip', 'Kenya 2026'],
  openGraph: {
    title: 'Kenya 2026 Kingdom Impact Trip',
    description: '14 days of Kingdom impact across Kenya. Apply now — spaces limited.',
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
    title: 'Kenya 2026 Kingdom Impact Trip',
    description: '14 days of Kingdom impact across Kenya. Apply now — spaces limited.',
    images: ['https://tpcmin.org/images/kenya/kenya-flier-2026.png'],
  },
}

const stats = [
  { value: '14', label: 'Days of Impact' },
  { value: '3', label: 'Cities' },
  { value: '4', label: 'Service Tracks' },
  { value: '20+', label: 'Delegates' },
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
    <div className="flex min-h-screen flex-col bg-white">
      {/* ===== HERO — Full photo background ===== */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <Image
          src="/images/kenya/hero-landscape.png"
          alt="Kenya savanna sunset"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

        <div className="relative z-10 container mx-auto max-w-6xl px-4 py-20">
          <p className="text-gold-light tracking-[0.3em] uppercase text-sm mb-4">
            Global Impact Delegation
          </p>
          <h1 className="text-6xl md:text-8xl font-bold mb-2">
            <span className="text-gold">KENYA</span>{' '}
            <span className="text-white">2026</span>
          </h1>
          <div className="w-64 h-1 bg-gold my-6" />
          <h2 className="text-3xl md:text-4xl text-white font-serif mb-6">
            Join the Delegation
          </h2>
          <p className="text-xl text-gold-light/90 max-w-lg mb-4">
            14 days of leadership, ministry, and impact across Kenya with a global delegation.
          </p>

          {/* Track pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="bg-purple-600 text-white text-sm font-bold px-4 py-1.5 rounded-full">MINISTRY</span>
            <span className="bg-red-700 text-white text-sm font-bold px-4 py-1.5 rounded-full">HEALTH</span>
            <span className="bg-teal-700 text-white text-sm font-bold px-4 py-1.5 rounded-full">EDUCATION</span>
            <span className="bg-green-700 text-white text-sm font-bold px-4 py-1.5 rounded-full">BUSINESS</span>
          </div>

          <p className="text-white/70 mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Nairobi &bull; Kakamega &bull; Mombasa
          </p>
          <p className="text-white font-bold text-lg mb-1">APRIL 23 – MAY 6, 2026</p>
          <p className="text-gold text-4xl font-bold mb-8">$3,500</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#apply">
              <Button size="lg" className="w-full sm:w-auto bg-gold hover:bg-gold-light text-navy font-bold text-lg px-8 h-14">
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <Link href="/kenya/give">
              <Button size="lg" className="w-full sm:w-auto bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-navy font-bold text-lg px-8 h-14">
                <Heart className="mr-2 h-5 w-5" />
                Support the Mission
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="bg-navy text-white py-8 border-y border-gold/20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gold mb-1">{stat.value}</div>
                <div className="text-white/60 text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PARTNER LOGOS ===== */}
      <section className="bg-navy-dark py-10 border-t border-gold/20">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <p className="text-white/40 text-sm tracking-widest uppercase mb-6">
            In Partnership With
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            {partners.map((partner) => (
              <div key={partner.name} className="hover:scale-105 transition-transform">
                {partner.image ? (
                  <div className="relative h-[48px] w-[140px] bg-white/15 rounded-lg px-3 py-1.5">
                    <Image
                      src={partner.image}
                      alt={partner.name}
                      fill
                      className="object-contain drop-shadow-md"
                    />
                  </div>
                ) : (
                  <span className="text-white/80 font-serif text-sm md:text-base font-medium tracking-wide bg-white/10 rounded-lg px-4 py-2">
                    {partner.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== THE OPPORTUNITY ===== */}
      <section id="details" className="px-4 py-20 md:py-28 bg-cream">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-gold-dark font-semibold tracking-wider uppercase mb-3">The Opportunity</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy mb-6">
              Transform Lives. Be Transformed.
            </h2>
            <p className="text-xl text-navy/70 leading-relaxed">
              Join a carefully curated delegation of purpose-driven professionals, ministers, and
              servant-leaders for 14 days of meaningful partnership with Kenyan churches and communities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Globe2, title: 'Cultural Immersion', desc: 'Experience authentic Kenyan culture, cuisine, and community. Includes safari adventures and meaningful local connections.' },
              { icon: Users, title: 'Lasting Partnership', desc: 'Build relationships that extend beyond the trip. Connect with local leaders and contribute to sustainable, long-term impact.' },
              { icon: Heart, title: 'Personal Growth', desc: 'Return home with a renewed sense of purpose, expanded worldview, and deeper understanding of your calling.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-8 shadow-sm border border-navy/10 text-center">
                <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon className="h-8 w-8 text-gold-dark" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">{item.title}</h3>
                <p className="text-navy/60">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-navy/10">
            <h3 className="text-2xl font-bold text-navy text-center mb-10">Your Journey</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {timeline.map((item, index) => (
                <div key={item.phase} className="relative">
                  <div className="relative z-10 text-center">
                    <div className="w-14 h-14 bg-gold rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold/25">
                      <span className="text-navy font-bold text-lg">{index + 1}</span>
                    </div>
                    <h4 className="font-bold text-navy mb-1 text-sm">{item.phase}</h4>
                    <p className="text-gold-dark text-xs font-medium mb-2">{item.dates}</p>
                    <p className="text-navy/50 text-xs leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICE TRACKS — Photo Cards ===== */}
      <section className="px-4 py-20 md:py-28 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-gold-dark font-semibold tracking-wider uppercase mb-3">Your Impact</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy mb-6">
              Serve According to Your Gifts
            </h2>
            <p className="text-xl text-navy/60">
              Choose from four service tracks based on your skills, experience, and calling.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tracks.map((track) => (
              <div key={track.name} className="relative rounded-2xl overflow-hidden group h-80">
                <Image
                  src={track.image}
                  alt={track.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className={`${track.bgClass} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                    {track.name.toUpperCase()}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-3">{track.headline}</h3>
                  <ul className="mt-3 space-y-1">
                    {track.items.map((item) => (
                      <li key={item} className="text-white/70 text-sm flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-gold flex-shrink-0" />
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
      <section className="px-4 py-20 md:py-28 bg-navy">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-gold font-semibold tracking-wider uppercase mb-3">Where We Serve</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Three Cities, One Mission
            </h2>
            <p className="text-xl text-white/60 mb-4">
              Experience the diversity of Kenya across urban, coastal, and rural communities.
            </p>
            <p className="text-white/40 text-sm">Click any city to explore</p>
          </div>

          <ExpandableCities />
        </div>
      </section>

      {/* ===== WHAT'S INCLUDED ===== */}
      <section className="px-4 py-20 md:py-28 bg-gradient-to-br from-navy via-navy to-navy-dark text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gold font-semibold tracking-wider uppercase mb-3">All-Inclusive Experience</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Everything You Need for $3,500
              </h2>
              <p className="text-white/60 text-lg mb-8">
                We handle all the logistics so you can focus on what matters most—serving,
                connecting, and growing.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="text-center">
                <Shield className="h-12 w-12 text-gold mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Scholarships Available</h3>
                <p className="text-white/60 mb-6">
                  Don&apos;t let finances hold you back. Limited partial scholarships are available
                  for qualified applicants who demonstrate need and alignment with our mission.
                </p>
                <a href="#apply">
                  <Button className="bg-gold hover:bg-gold-light text-navy font-bold px-8 h-12">
                    Apply for Scholarship
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHO SHOULD APPLY ===== */}
      <section className="px-4 py-20 md:py-28 bg-cream">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-gold-dark font-semibold tracking-wider uppercase mb-3">Ideal Candidates</p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            Is This Trip For You?
          </h2>
          <p className="text-xl text-navy/60 mb-12">
            We&apos;re looking for individuals who embody these qualities:
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['Servant Heart', 'Team Player', 'Spiritually Mature', 'Purpose-Driven', 'Adaptable', 'Committed'].map((quality) => (
              <span
                key={quality}
                className="bg-white px-6 py-3 rounded-full text-navy font-medium shadow-sm border border-navy/10"
              >
                {quality}
              </span>
            ))}
          </div>

          <p className="text-navy/60 max-w-2xl mx-auto">
            Whether you&apos;re a minister, healthcare professional, educator, business leader, or
            simply someone with a heart for service—there&apos;s a place for you on this team.
          </p>
        </div>
      </section>

      {/* ===== SCHOLARSHIP ===== */}
      <section id="scholarship" className="px-4 py-20 md:py-28 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-2 mb-6">
                <GraduationCap className="h-4 w-4 text-gold-dark" />
                <span className="text-gold-dark text-sm font-medium">Financial Assistance</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                Scholarship Opportunities
              </h2>
              <p className="text-lg text-navy/60 mb-6">
                We believe finances should not be a barrier to answering God&apos;s call. Limited partial
                scholarships are available for qualified applicants who demonstrate both financial
                need and strong alignment with our mission values.
              </p>

              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-navy">Priority given to:</h3>
                <ul className="space-y-3">
                  {[
                    'Students and young adults with clear calling',
                    'Emerging leaders in ministry or service',
                    'Medical and education professionals with needed skills',
                    'First-time mission trip participants',
                    'Those filling strategic ministry roles',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-navy/60">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a href="#apply">
                <Button className="bg-gold hover:bg-gold-light text-navy font-semibold px-8 h-12">
                  Apply with Scholarship Request
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>

            <div className="bg-cream rounded-3xl p-8 shadow-lg border border-navy/10">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HandHeart className="h-10 w-10 text-gold-dark" />
                </div>
                <h3 className="text-2xl font-bold text-navy mb-2">How It Works</h3>
              </div>

              <div className="space-y-6">
                {[
                  { step: '1', title: 'Indicate Need in Application', desc: 'Select "Yes" for scholarship on the application form' },
                  { step: '2', title: 'Share Your Story', desc: 'Tell us about your calling and financial situation' },
                  { step: '3', title: 'Prayerful Review', desc: 'Our team reviews applications and awards based on need and fit' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center flex-shrink-0 text-navy font-bold text-sm">{item.step}</div>
                    <div>
                      <h4 className="font-semibold text-navy">{item.title}</h4>
                      <p className="text-navy/50 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-gold/10 rounded-xl border border-gold/20">
                <p className="text-sm text-navy/70">
                  <strong className="text-gold-dark">Note:</strong> Scholarships are partial, not full coverage.
                  All team members contribute financially to demonstrate commitment and shared ownership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== APPLICATION FORM ===== */}
      <section id="apply" className="px-4 py-20 md:py-28 bg-cream">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <p className="text-gold-dark font-semibold tracking-wider uppercase mb-3">Take the First Step</p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Apply for the Kenya Trip
            </h2>
            <p className="text-lg text-navy/60">
              Complete this interest form and our team will contact you within 48 hours.
            </p>
          </div>

          <KenyaTripForm />
        </div>
      </section>

      {/* ===== GIVE / DONATE — Photo Background ===== */}
      <section id="give" className="relative px-4 py-20 md:py-28 text-white overflow-hidden">
        <Image
          src="/images/kenya/donate-bg.png"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

        <div className="relative z-10 container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Heart className="h-4 w-4 text-gold" />
              <span className="text-gold-light text-sm font-medium">Partner With Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Support the Kenya Mission
            </h2>
            <p className="text-xl text-white/70">
              Your generosity makes Kingdom impact possible. Help send teams, fund scholarships,
              and resource communities in Kenya.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Plane, title: 'Sponsor a Participant', desc: 'Help cover travel, lodging, and ministry costs for a team member called to serve.', range: '$500 - $2,500' },
              { icon: Gift, title: 'Fund Ministry Supplies', desc: 'Provide medical supplies, school materials, business resources, or farming equipment.', range: '$50 - $500' },
              { icon: GraduationCap, title: 'Scholarship Fund', desc: 'Contribute to the scholarship fund to help qualified participants who need financial assistance.', range: 'Any Amount' },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
                <div className="w-16 h-16 bg-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-gold" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-white/60 text-sm mb-4">{item.desc}</p>
                <p className="text-gold font-semibold">{item.range}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Give Today</h3>
                <p className="text-white/60 mb-6">
                  100% of your gift designated for Kenya missions goes directly to supporting the trip,
                  team members, and on-ground ministry. TPC Ministries is a registered 501(c)(3)
                  nonprofit—your donation is tax-deductible.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/kenya/give">
                    <Button size="lg" className="w-full sm:w-auto bg-gold hover:bg-gold-light text-navy font-bold px-8 h-14">
                      <CircleDollarSign className="mr-2 h-5 w-5" />
                      Give to Kenya Mission
                    </Button>
                  </Link>
                  <a href="mailto:info@tpcmin.org?subject=Kenya%20Mission%20Giving">
                    <Button size="lg" className="w-full sm:w-auto bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-navy font-bold px-8 h-14">
                      <Mail className="mr-2 h-5 w-5" />
                      Contact Us
                    </Button>
                  </a>
                </div>

                <Link
                  href="/kenya/pack-the-mission"
                  className="mt-6 block bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-gold/30 hover:border-gold hover:bg-gold/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Gift className="h-6 w-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white group-hover:text-gold transition-colors">Pack the Mission</h4>
                      <p className="text-white/50 text-sm">Help us fill the suitcases with supplies for Kenya — pledge items or contribute funds</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white/30 group-hover:text-gold transition-colors flex-shrink-0" />
                  </div>
                </Link>
              </div>
              <div className="text-center">
                <div className="inline-block bg-white/10 rounded-2xl p-6 border border-white/20">
                  <p className="text-white/40 text-sm uppercase tracking-wider mb-2">2026 Missions Goal</p>
                  <p className="text-5xl font-bold text-gold mb-2">$50,000</p>
                  <p className="text-white/60 text-sm">For team support, supplies & scholarships</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-white/40 text-sm">
              Prefer to give by check? Mail to: TPC Ministries, [Address] &bull; Memo: Kenya Mission 2026
            </p>
          </div>
        </div>
      </section>

      {/* ===== PRESS & MEDIA ===== */}
      <section id="press" className="px-4 py-20 md:py-28 bg-white border-t border-navy/10">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-navy/5 rounded-full px-4 py-2 mb-4">
              <Newspaper className="h-4 w-4 text-navy" />
              <span className="text-navy text-sm font-medium">Press & Media</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Download Trip Resources
            </h2>
            <p className="text-lg text-navy/60">
              Access our official trip documentation, promotional materials, and press kit.
            </p>
          </div>

          {/* Overview + Flier */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
            <a
              href="/documents/kenya/overview.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-cream rounded-2xl p-8 border border-navy/10 hover:border-gold hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gold rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="h-7 w-7 text-navy" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-navy mb-1 group-hover:text-gold-dark transition-colors">
                    Trip Overview
                  </h3>
                  <p className="text-navy/50 text-sm mb-3">
                    Full overview — 16 days, 4 tracks, 3 cities, 5 partner organizations, timeline, and vision.
                  </p>
                  <div className="flex items-center gap-2 text-gold-dark font-semibold text-sm">
                    <Download className="h-4 w-4" />
                    View PDF
                  </div>
                </div>
              </div>
            </a>

            <a
              href="/images/kenya/kenya-flier-2026.png"
              download="Kenya-Trip-2026-Flier.png"
              className="group bg-cream rounded-2xl p-8 border border-navy/10 hover:border-gold hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-navy rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <ImageIcon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-navy mb-1 group-hover:text-gold-dark transition-colors">
                    Promotional Flier
                  </h3>
                  <p className="text-navy/50 text-sm mb-3">
                    High-resolution flier for sharing on social media, printing, or distributing.
                  </p>
                  <div className="flex items-center gap-2 text-gold-dark font-semibold text-sm">
                    <Download className="h-4 w-4" />
                    Download Image
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* Track Decks */}
          <div className="max-w-5xl mx-auto">
            <h3 className="text-xl font-bold text-navy text-center mb-6">Service Track Details</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  className="group bg-white rounded-xl p-5 border border-navy/10 hover:border-gold hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className={`${track.color} text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3`}>
                    {track.name.toUpperCase()}
                  </div>
                  <p className="text-navy/50 text-xs mb-4 leading-relaxed">{track.desc}</p>
                  <div className="flex items-center justify-center gap-2 text-gold-dark font-semibold text-sm">
                    <Download className="h-3.5 w-3.5" />
                    View Deck
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-navy/40 text-sm">
              For media inquiries or additional resources, contact{' '}
              <a href="mailto:info@tpcmin.org" className="text-gold-dark hover:underline font-medium">
                info@tpcmin.org
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ===== FAQ / CONTACT ===== */}
      <section className="px-4 py-16 bg-cream border-t border-navy/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-2xl font-bold text-navy mb-4">Questions?</h3>
          <p className="text-navy/60 mb-6">
            We&apos;re here to help you discern if this trip is right for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:info@tpcmin.org">
              <Button className="bg-navy text-white hover:bg-navy-dark font-semibold px-6">
                <Mail className="h-4 w-4 mr-2" />
                info@tpcmin.org
              </Button>
            </a>
            <Link href="/contact">
              <Button className="bg-white border-2 border-navy text-navy hover:bg-navy hover:text-white font-semibold px-6">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="px-4 py-20 bg-gold">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Say Yes to the Call
          </h2>
          <p className="text-xl text-navy/70 mb-8 max-w-2xl mx-auto">
            Don&apos;t miss this opportunity to be part of something greater than yourself.
            Spaces are limited.
          </p>
          <a href="#apply">
            <Button size="lg" className="bg-navy hover:bg-navy-dark text-white font-bold text-lg px-10 h-14 shadow-lg">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}
