import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  ArrowRight,
  Calendar,
  MapPin,
  Mail,
  Users,
  Star,
  Shield,
  Clock,
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
  CircleDollarSign
} from 'lucide-react'
import { KenyaTripForm } from '@/components/kenya/kenya-trip-form'
import { ExpandableServiceTracks, ExpandableCities } from '@/components/kenya/expandable-sections'

export const metadata: Metadata = {
  title: 'Kenya Kingdom Impact Trip 2026 | TPC Ministries',
  description: 'Join TPC Ministries on a life-changing mission trip to Kenya. April 22 – May 8, 2026. Serve in ministry, education, medical missions, and business development across Nairobi, Mombasa, and Kakamega.',
  keywords: ['Kenya mission trip', 'TPC Ministries', 'Christian missions', 'Africa missions', 'short-term missions', 'Kenya 2026', 'mission trip Kenya'],
  openGraph: {
    title: 'Kenya Kingdom Impact Trip 2026 | TPC Ministries',
    description: 'A life-changing 17-day mission experience in Kenya. Limited spots available.',
    type: 'website',
    images: ['/images/kenya/kenya-flier.png'],
  },
}

const stats = [
  { value: '17', label: 'Days of Impact' },
  { value: '3', label: 'Cities' },
  { value: '6', label: 'Service Tracks' },
  { value: "1000's", label: 'Lives Touched' },
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
  { phase: 'Arrival', dates: 'April 22–23', description: 'Meet in Nairobi for welcome, orientation, and team bonding' },
  { phase: 'Immersion', dates: 'April 24–25', description: 'Cultural experiences and safari adventure' },
  { phase: 'Sabbath', dates: 'April 26', description: 'Worship, rest, and spiritual preparation' },
  { phase: 'Service', dates: 'April 27 – May 8', description: 'Kingdom impact across three cities' },
]

export default function KenyaTripPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero Section - Clean gradient, no image overlay issues */}
      <section className="relative bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

        <div className="container relative mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Calendar className="h-4 w-4 text-amber-300" />
                <span className="text-amber-200 text-sm font-medium">April 22 – May 8, 2026</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Answer the Call to
                <span className="block text-amber-300">Kenya</span>
              </h1>

              <p className="text-xl md:text-2xl text-amber-100/90 mb-4 leading-relaxed">
                This is more than a trip.
                <span className="block font-semibold text-white">It's a Kingdom assignment.</span>
              </p>

              <div className="mb-8">
                <p className="text-lg text-amber-200/80 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Nairobi • Mombasa • Kakamega
                </p>
                <p className="text-amber-200/60 text-sm mt-1 ml-7">
                  Team meets in Nairobi (NBO) to begin the journey
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a href="#apply">
                  <Button size="lg" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-lg px-8 h-14 shadow-lg shadow-amber-500/25">
                    Apply Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <Link href="/kenya/give">
                  <Button size="lg" className="w-full sm:w-auto bg-transparent border-2 border-white/30 text-white hover:bg-white/10 text-lg px-8 h-14">
                    <Heart className="mr-2 h-5 w-5" />
                    Support the Mission
                  </Button>
                </Link>
              </div>

              <p className="text-amber-200/70 text-sm">
                <Clock className="h-4 w-4 inline mr-1" />
                Limited spots available • Scholarships offered
              </p>
            </div>

            {/* Trip Flier Preview */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-transparent rounded-3xl blur-2xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <Image
                    src="/images/kenya/kenya-flier.png"
                    alt="Kenya Kingdom Impact Trip 2026 Flier"
                    width={400}
                    height={600}
                    className="rounded-xl shadow-2xl w-full"
                  />
                  <a
                    href="/images/kenya/kenya-flier.png"
                    download="Kenya-Trip-2026-Flier.png"
                    className="mt-4 flex items-center justify-center gap-2 text-amber-200 hover:text-white transition-colors text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Download Trip Flier
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-stone-900 text-white py-8 border-y border-amber-500/20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-1">{stat.value}</div>
                <div className="text-stone-400 text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Trip Section */}
      <section id="details" className="px-4 py-20 md:py-28 bg-stone-50">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-amber-600 font-semibold tracking-wider uppercase mb-3">The Opportunity</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 mb-6">
              Transform Lives. Be Transformed.
            </h2>
            <p className="text-xl text-stone-600 leading-relaxed">
              Join a carefully curated delegation of purpose-driven professionals, ministers, and
              servant-leaders for 17 days of meaningful partnership with Kenyan churches and communities.
            </p>
          </div>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe2 className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Cultural Immersion</h3>
              <p className="text-stone-600">
                Experience authentic Kenyan culture, cuisine, and community. Includes safari
                adventures and meaningful local connections.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Lasting Partnership</h3>
              <p className="text-stone-600">
                Build relationships that extend beyond the trip. Connect with local leaders
                and contribute to sustainable, long-term impact.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Personal Growth</h3>
              <p className="text-stone-600">
                Return home with a renewed sense of purpose, expanded worldview, and
                deeper understanding of your calling.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-200">
            <h3 className="text-2xl font-bold text-stone-900 text-center mb-10">Your Journey</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {timeline.map((item, index) => (
                <div key={item.phase} className="relative">
                  {index < timeline.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-amber-200 -translate-x-1/2 z-0"></div>
                  )}
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/25">
                      <span className="text-white font-bold text-xl">{index + 1}</span>
                    </div>
                    <h4 className="font-bold text-stone-900 mb-1">{item.phase}</h4>
                    <p className="text-amber-600 text-sm font-medium mb-2">{item.dates}</p>
                    <p className="text-stone-500 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service Tracks */}
      <section className="px-4 py-20 md:py-28 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-amber-600 font-semibold tracking-wider uppercase mb-3">Your Impact</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 mb-6">
              Serve According to Your Gifts
            </h2>
            <p className="text-xl text-stone-600 mb-4">
              Choose from six service tracks based on your skills, experience, and calling.
            </p>
            <p className="text-stone-500 text-sm">Click any track to learn more</p>
          </div>

          <ExpandableServiceTracks />
        </div>
      </section>

      {/* Cities Section */}
      <section className="px-4 py-20 md:py-28 bg-gradient-to-br from-stone-900 to-stone-800">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-amber-400 font-semibold tracking-wider uppercase mb-3">Where We Serve</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Three Cities, One Mission
            </h2>
            <p className="text-xl text-stone-300 mb-4">
              Experience the diversity of Kenya across urban, coastal, and rural communities.
            </p>
            <p className="text-stone-500 text-sm">Click any city to explore</p>
          </div>

          <ExpandableCities />
        </div>
      </section>

      {/* What's Included */}
      <section className="px-4 py-20 md:py-28 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-amber-400 font-semibold tracking-wider uppercase mb-3">All-Inclusive Experience</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Everything You Need for a Life-Changing Trip
              </h2>
              <p className="text-stone-300 text-lg mb-8">
                We handle all the logistics so you can focus on what matters most—serving,
                connecting, and growing.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-stone-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="text-center">
                <Shield className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Scholarships Available</h3>
                <p className="text-stone-300 mb-6">
                  Don't let finances hold you back. Limited partial scholarships are available
                  for qualified applicants who demonstrate need and alignment with our mission.
                </p>
                <a href="#apply">
                  <Button className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-8 h-12">
                    Apply for Scholarship
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Apply */}
      <section className="px-4 py-20 md:py-28 bg-stone-50">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-amber-600 font-semibold tracking-wider uppercase mb-3">Ideal Candidates</p>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">
            Is This Trip For You?
          </h2>
          <p className="text-xl text-stone-600 mb-12">
            We're looking for individuals who embody these qualities:
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['Servant Heart', 'Team Player', 'Spiritually Mature', 'Purpose-Driven', 'Adaptable', 'Committed'].map((quality) => (
              <span
                key={quality}
                className="bg-white px-6 py-3 rounded-full text-stone-700 font-medium shadow-sm border border-stone-200"
              >
                {quality}
              </span>
            ))}
          </div>

          <p className="text-stone-600 max-w-2xl mx-auto">
            Whether you're a minister, healthcare professional, educator, business leader, or
            simply someone with a heart for service—there's a place for you on this team.
          </p>
        </div>
      </section>

      {/* Scholarship Section */}
      <section id="scholarship" className="px-4 py-20 md:py-28 bg-gradient-to-br from-amber-50 to-stone-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-100 rounded-full px-4 py-2 mb-6">
                <GraduationCap className="h-4 w-4 text-amber-700" />
                <span className="text-amber-700 text-sm font-medium">Financial Assistance</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">
                Scholarship Opportunities
              </h2>
              <p className="text-lg text-stone-600 mb-6">
                We believe finances should not be a barrier to answering God's call. Limited partial
                scholarships are available for qualified applicants who demonstrate both financial
                need and strong alignment with our mission values.
              </p>

              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-stone-900">Priority given to:</h3>
                <ul className="space-y-3">
                  {[
                    'Students and young adults with clear calling',
                    'Emerging leaders in ministry or service',
                    'Medical and education professionals with needed skills',
                    'First-time mission trip participants',
                    'Those filling strategic ministry roles',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="text-stone-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a href="#apply">
                <Button className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold px-8 h-12">
                  Apply with Scholarship Request
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-stone-200">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HandHeart className="h-10 w-10 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-2">How It Works</h3>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Indicate Need in Application</h4>
                    <p className="text-stone-600 text-sm">Select "Yes" for scholarship on the application form</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Share Your Story</h4>
                    <p className="text-stone-600 text-sm">Tell us about your calling and financial situation</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Prayerful Review</h4>
                    <p className="text-stone-600 text-sm">Our team reviews applications and awards based on need and fit</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm text-stone-700">
                  <strong className="text-amber-700">Note:</strong> Scholarships are partial, not full coverage.
                  All team members contribute financially to demonstrate commitment and shared ownership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="px-4 py-20 md:py-28 bg-white">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <p className="text-amber-600 font-semibold tracking-wider uppercase mb-3">Take the First Step</p>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Apply for the Kenya Trip
            </h2>
            <p className="text-lg text-stone-600">
              Complete this interest form and our team will contact you within 48 hours.
            </p>
          </div>

          <KenyaTripForm />
        </div>
      </section>

      {/* Support the Mission */}
      <section id="give" className="px-4 py-20 md:py-28 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Heart className="h-4 w-4 text-amber-300" />
              <span className="text-amber-200 text-sm font-medium">Partner With Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Support the Kenya Mission
            </h2>
            <p className="text-xl text-stone-300">
              Your generosity makes Kingdom impact possible. Help send teams, fund scholarships,
              and resource communities in Kenya.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plane className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sponsor a Participant</h3>
              <p className="text-stone-300 text-sm mb-4">
                Help cover travel, lodging, and ministry costs for a team member called to serve.
              </p>
              <p className="text-amber-400 font-semibold">$500 - $2,500</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fund Ministry Supplies</h3>
              <p className="text-stone-300 text-sm mb-4">
                Provide medical supplies, school materials, business resources, or farming equipment.
              </p>
              <p className="text-amber-400 font-semibold">$50 - $500</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Scholarship Fund</h3>
              <p className="text-stone-300 text-sm mb-4">
                Contribute to the scholarship fund to help qualified participants who need financial assistance.
              </p>
              <p className="text-amber-400 font-semibold">Any Amount</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Give Today</h3>
                <p className="text-stone-300 mb-6">
                  100% of your gift designated for Kenya missions goes directly to supporting the trip,
                  team members, and on-ground ministry. TPC Ministries is a registered 501(c)(3)
                  nonprofit—your donation is tax-deductible.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/kenya/give">
                    <Button size="lg" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-8 h-14">
                      <CircleDollarSign className="mr-2 h-5 w-5" />
                      Give to Kenya Mission
                    </Button>
                  </Link>
                  <a href="mailto:info@tpcmin.org?subject=Kenya%20Mission%20Giving">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 px-8 h-14">
                      <Mail className="mr-2 h-5 w-5" />
                      Contact Us
                    </Button>
                  </a>
                </div>
              </div>
              <div className="text-center">
                <div className="inline-block bg-white/10 rounded-2xl p-6 border border-white/20">
                  <p className="text-stone-400 text-sm uppercase tracking-wider mb-2">2026 Missions Goal</p>
                  <p className="text-5xl font-bold text-amber-400 mb-2">$50,000</p>
                  <p className="text-stone-300 text-sm">For team support, supplies & scholarships</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-stone-400 text-sm">
              Prefer to give by check? Mail to: TPC Ministries, [Address] • Memo: Kenya Mission 2026
            </p>
          </div>
        </div>
      </section>

      {/* Press & Media Downloads */}
      <section id="press" className="px-4 py-20 md:py-28 bg-white border-t border-stone-200">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100 rounded-full px-4 py-2 mb-4">
              <Newspaper className="h-4 w-4 text-amber-700" />
              <span className="text-amber-700 text-sm font-medium">Press & Media</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Download Trip Resources
            </h2>
            <p className="text-lg text-stone-600">
              Access our official trip documentation, promotional materials, and press kit.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Full Trip Guide PDF */}
            <a
              href="/images/kenya/Kenya-Kingdom-Impact-Trip-2026.pdf"
              download="Kenya-Kingdom-Impact-Trip-2026.pdf"
              className="group bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-8 border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">
                    Complete Trip Guide
                  </h3>
                  <p className="text-stone-600 text-sm mb-4">
                    19-page comprehensive guide with full trip details, service tracks, timeline, logistics, and more.
                  </p>
                  <div className="flex items-center gap-2 text-amber-600 font-semibold">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </div>
                </div>
              </div>
            </a>

            {/* Trip Flier */}
            <a
              href="/images/kenya/kenya-flier.png"
              download="Kenya-Trip-2026-Flier.png"
              className="group bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-8 border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-stone-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">
                    Promotional Flier
                  </h3>
                  <p className="text-stone-600 text-sm mb-4">
                    High-resolution promotional flier for sharing on social media, printing, or distributing.
                  </p>
                  <div className="flex items-center gap-2 text-amber-600 font-semibold">
                    <Download className="h-4 w-4" />
                    Download Image
                  </div>
                </div>
              </div>
            </a>
          </div>

          <div className="mt-12 text-center">
            <p className="text-stone-500 text-sm">
              For media inquiries or additional resources, contact{' '}
              <a href="mailto:info@tpcmin.org" className="text-amber-600 hover:underline font-medium">
                info@tpcmin.org
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Preview / Contact */}
      <section className="px-4 py-16 bg-stone-100 border-t border-stone-200">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-2xl font-bold text-stone-900 mb-4">Questions?</h3>
          <p className="text-stone-600 mb-6">
            We're here to help you discern if this trip is right for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:info@tpcmin.org">
              <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-200">
                <Mail className="h-4 w-4 mr-2" />
                info@tpcmin.org
              </Button>
            </a>
            <Link href="/contact">
              <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-200">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 bg-gradient-to-r from-amber-600 to-amber-500">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Say Yes to the Call
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Don't miss this opportunity to be part of something greater than yourself.
            Spaces are limited.
          </p>
          <a href="#apply">
            <Button size="lg" className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-lg px-10 h-14 shadow-lg">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}
