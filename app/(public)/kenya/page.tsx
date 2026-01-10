import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Heart,
  GraduationCap,
  Stethoscope,
  Briefcase,
  Wheat,
  Package,
  CheckCircle,
  ArrowRight,
  Calendar,
  MapPin,
  Mail,
  Users,
  Mountain,
  Plane,
  ChevronRight
} from 'lucide-react'
import { KenyaTripForm } from '@/components/kenya/kenya-trip-form'

export const metadata: Metadata = {
  title: 'Kenya Kingdom Impact Trip | TPC Ministries',
  description: 'Join TPC Ministries on a transformational mission trip to Kenya in April–May 2026. Serve in ministry, education, medical missions, business development, and more across Nairobi, Mombasa, and Kakamega.',
  keywords: ['Kenya mission trip', 'TPC Ministries', 'Christian missions', 'Africa missions', 'short-term missions', 'Kenya 2026'],
  openGraph: {
    title: 'Kenya Kingdom Impact Trip | TPC Ministries',
    description: 'Join TPC Ministries on a transformational mission trip to Kenya in April–May 2026. Serve alongside local churches and communities.',
    type: 'website',
    images: ['/images/kenya/kenya-flier.png'],
  },
}

const timeline = [
  {
    dates: 'April 22–23',
    title: 'Arrival & Orientation',
    description: 'Welcome reception, team orientation, rest and fellowship',
    icon: Plane,
  },
  {
    dates: 'April 24–25',
    title: 'Cultural Immersion',
    description: 'Safari experiences and cultural exchange',
    icon: Mountain,
  },
  {
    dates: 'April 26',
    title: 'Worship & Rest',
    description: 'Sunday worship, prayer, and spiritual preparation',
    icon: Heart,
  },
  {
    dates: 'April 27 – May 8',
    title: 'Kingdom Service',
    description: 'Ministry across Nairobi, Mombasa, and Kakamega',
    icon: Users,
  },
]

const serviceAreas = [
  {
    title: 'Ministry & Spiritual Care',
    icon: Heart,
    color: '#8B5CF6',
    items: [
      'Teaching and preaching',
      'Prayer and prophetic ministry',
      'Church gatherings and pastoral support',
    ],
  },
  {
    title: 'Education & Youth',
    icon: GraduationCap,
    color: '#3B82F6',
    items: [
      'Youth mentorship and engagement',
      'Financial literacy and life skills',
      'Leadership development',
    ],
  },
  {
    title: 'Medical Missions',
    icon: Stethoscope,
    color: '#EF4444',
    items: [
      'Medical outreach and clinics',
      'Health education',
      'Compassionate care',
    ],
  },
  {
    title: 'Business Development',
    icon: Briefcase,
    color: '#10B981',
    items: [
      'Entrepreneurship training',
      'Business mentorship',
      'Economic empowerment',
    ],
  },
  {
    title: 'Food Security',
    icon: Wheat,
    color: '#F59E0B',
    items: [
      'Farming initiatives',
      'Social entrepreneurship',
      'Community resilience',
    ],
  },
  {
    title: 'Material Support',
    icon: Package,
    color: '#C4A052',
    items: [
      'Clothing distribution',
      'Medical supplies',
      'Educational resources',
    ],
  },
]

const highlights = [
  'High-quality accommodations',
  'Cultural immersion & safari',
  'Kingdom service in 3 cities',
  'Limited scholarships available',
]

const qualifications = [
  'Servant Hearts',
  'Team Players',
  'Spiritually Mature',
  'Purpose-Driven',
  'Adaptable',
]

export default function KenyaTripPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-end">
        <Image
          src="/images/kenya/kenya-hero.png"
          alt="Kenya Kingdom Impact Trip - Mount Kilimanjaro and African Savanna"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        <div className="container relative mx-auto max-w-6xl px-4 pb-16 md:pb-24">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-white/70 text-sm">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/missions" className="hover:text-white transition-colors">Missions</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Kenya 2026</span>
          </nav>

          <div className="max-w-3xl">
            <p className="text-amber-400 font-semibold tracking-wider uppercase mb-3">
              April 22/23 – May 8, 2026
            </p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
              Kenya Kingdom<br />Impact Trip
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-400" />
              Nairobi • Mombasa • Kakamega
            </p>
            <p className="text-2xl md:text-3xl font-serif italic text-white/95 mt-6 mb-8">
              "This is more than a trip. It's a Kingdom assignment."
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#apply">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-lg px-8 h-14">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <a href="#details">
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 text-lg px-8 h-14">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trip Highlights Bar */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-2 text-amber-900">
                <CheckCircle className="h-5 w-5 text-amber-600" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trip Flow Timeline */}
      <section id="details" className="px-4 py-20 md:py-28 bg-stone-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-amber-600 font-semibold tracking-wider uppercase mb-3">Your Journey</p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-stone-900 mb-4">
              Trip Flow
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              A thoughtfully planned journey of preparation, immersion, and service
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {timeline.map((item, index) => (
              <div
                key={item.dates}
                className="relative bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition-shadow"
              >
                <div className="absolute -top-3 left-6 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {index + 1}
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-amber-700" />
                </div>
                <p className="text-amber-700 font-semibold text-sm mb-1">{item.dates}</p>
                <h3 className="text-lg font-bold text-stone-900 mb-2">{item.title}</h3>
                <p className="text-stone-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Areas of Service */}
      <section className="px-4 py-20 md:py-28 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-amber-600 font-semibold tracking-wider uppercase mb-3">Service Tracks</p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-stone-900 mb-4">
              Areas of Service & Partnership
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Serve according to your gifts and calling in one of six focus areas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceAreas.map((area) => (
              <div
                key={area.title}
                className="bg-stone-50 rounded-2xl p-6 border border-stone-200 hover:border-amber-300 transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${area.color}15` }}
                >
                  <area.icon className="h-6 w-6" style={{ color: area.color }} />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">{area.title}</h3>
                <ul className="space-y-2">
                  {area.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-stone-600 text-sm">
                      <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="px-4 py-20 md:py-28 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-amber-400 font-semibold tracking-wider uppercase mb-3">Ideal Candidates</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
                Who This Trip Is For
              </h2>
              <p className="text-stone-300 text-lg mb-8">
                We're looking for team members who are ready to serve with excellence and humility alongside our Kenyan partners.
              </p>
              <div className="flex flex-wrap gap-3">
                {qualifications.map((item) => (
                  <span
                    key={item}
                    className="bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-medium border border-amber-500/30"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-3xl p-8 border border-amber-500/30">
              <div className="text-center">
                <div className="w-20 h-20 bg-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Join the Delegation
                </h3>
                <p className="text-stone-300 mb-6">
                  Be part of a team making lasting Kingdom impact across Kenya.
                </p>
                <a href="#apply">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 h-12">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="px-4 py-20 md:py-28 bg-stone-50">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <p className="text-amber-600 font-semibold tracking-wider uppercase mb-3">Get Started</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Apply for the Kenya Trip
            </h2>
            <p className="text-lg text-stone-600">
              Complete this interest form and we'll be in touch with next steps.
            </p>
          </div>

          <KenyaTripForm />
        </div>
      </section>

      {/* Contact */}
      <section className="px-4 py-12 bg-white border-t border-stone-200">
        <div className="container mx-auto max-w-4xl text-center">
          <Mail className="h-8 w-8 text-amber-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-stone-900 mb-2">Questions?</h3>
          <p className="text-stone-600">
            Email us at{' '}
            <a href="mailto:info@tpcmin.org" className="text-amber-600 hover:underline font-medium">
              info@tpcmin.org
            </a>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-4 py-20 overflow-hidden">
        <Image
          src="/images/kenya/kenya-hero.png"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="container relative mx-auto max-w-4xl text-center">
          <p className="text-amber-400 font-semibold mb-4">Say Yes to the Call</p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Join the Delegation?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Take the first step toward your Kingdom assignment in Kenya.
          </p>
          <a href="#apply">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-lg px-10 h-14">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}
