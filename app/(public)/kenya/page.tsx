import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Globe,
  Sparkles,
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
  },
}

const timeline = [
  {
    dates: 'April 22–23',
    title: 'Arrival & Orientation',
    description: 'Arrival, welcome, team orientation, rest, shared meals',
  },
  {
    dates: 'April 24–25',
    title: 'Cultural Immersion',
    description: 'Cultural immersion & safari experiences',
  },
  {
    dates: 'April 26',
    title: 'Worship & Rest',
    description: 'Church, worship, prayer, and rest',
  },
  {
    dates: 'April 27 – May 8',
    title: 'Kingdom Service',
    description: 'Kingdom service across Nairobi, Mombasa, and Kakamega',
  },
]

const serviceAreas = [
  {
    title: 'Ministry & Spiritual Care',
    icon: Heart,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    items: [
      'Teaching and preaching',
      'Prayer and prophetic ministry',
      'Church gatherings and pastors\' support',
    ],
  },
  {
    title: 'Education & Youth Development',
    icon: GraduationCap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    items: [
      'Youth mentorship and engagement',
      'Financial literacy and life skills',
      'Leadership development and school/community collaboration',
    ],
  },
  {
    title: 'Medical Missions',
    icon: Stethoscope,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    items: [
      'Medical outreach and clinics',
      'Health education and compassionate care',
      'Ethical service aligned with local systems',
    ],
  },
  {
    title: 'Business & Economic Development',
    icon: Briefcase,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    items: [
      'Entrepreneurship gatherings and capacity building',
      'Mentorship and faith-aligned enterprise',
      'Empowerment and sustainability',
    ],
  },
  {
    title: 'Food Security & Social Enterprise',
    icon: Wheat,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    items: [
      'Farming initiatives and food systems support',
      'Social entrepreneurship and community resilience',
    ],
  },
]

const whoIsThisFor = [
  'Servant-hearted and purpose-driven',
  'Team-oriented and adaptable',
  'Spiritually mature',
  'Ready to prepare and commit',
]

export default function KenyaTripPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-700 via-green-800 to-green-900 px-4 py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

        <div className="container relative mx-auto max-w-5xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-white/70 text-sm">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <Link href="/missions" className="hover:text-white">Missions</Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span className="text-white" aria-current="page">Kenya Trip 2026</span>
          </nav>

          <div className="text-center">
            <div className="mb-6 text-7xl md:text-8xl" role="img" aria-label="Kenya flag">🇰🇪</div>
            <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              Kenya Kingdom Impact Trip
            </h1>
            <p className="mb-2 text-xl text-gold font-medium md:text-2xl">
              April 22/23 – May 8, 2026
            </p>
            <div className="mb-6 flex items-center justify-center gap-2 text-white/80">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>Nairobi • Mombasa • Kakamega</span>
            </div>
            <p className="mb-4 text-2xl font-serif text-white md:text-3xl italic">
              This is more than a trip. It's a Kingdom assignment.
            </p>
            <p className="mb-8 text-lg text-white/90 max-w-2xl mx-auto">
              A journey of faith, service, and partnership alongside local churches and communities.
            </p>
            <a href="#apply">
              <Button size="lg" className="bg-gold hover:bg-gold/90 text-navy text-lg px-8">
                Apply / Learn More
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Trip Timeline */}
      <section className="px-4 py-16 md:py-24 bg-white" aria-labelledby="timeline-heading">
        <div className="container mx-auto max-w-4xl">
          <h2 id="timeline-heading" className="mb-4 text-center font-serif text-3xl font-bold text-navy md:text-4xl">
            Trip Flow
          </h2>
          <p className="mb-12 text-center text-gray-600">
            A thoughtfully planned journey of preparation, immersion, and service
          </p>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-green-200 -translate-x-1/2" aria-hidden="true"></div>

            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div
                  key={item.dates}
                  className={`relative flex items-start gap-6 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-green-600 rounded-full border-4 border-white shadow -translate-x-1/2 z-10" aria-hidden="true"></div>

                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <Card className="border-green-200 hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2 text-green-700 font-semibold">
                          <Calendar className="h-4 w-4" aria-hidden="true" />
                          <time>{item.dates}</time>
                        </div>
                        <h3 className="text-lg font-bold text-navy mb-1">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Areas of Service */}
      <section className="px-4 py-16 md:py-24 bg-gray-50" aria-labelledby="service-heading">
        <div className="container mx-auto max-w-6xl">
          <h2 id="service-heading" className="mb-4 text-center font-serif text-3xl font-bold text-navy md:text-4xl">
            Areas of Service & Partnership
          </h2>
          <p className="mb-12 text-center text-gray-600 max-w-2xl mx-auto">
            Serve according to your gifts and calling in one of five focus areas
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {serviceAreas.map((area) => (
              <Card key={area.title} className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className={`mb-3 w-12 h-12 rounded-lg ${area.bgColor} flex items-center justify-center`}>
                    <area.icon className={`h-6 w-6 ${area.color}`} aria-hidden="true" />
                  </div>
                  <CardTitle className="text-lg text-navy">{area.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {area.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}

            {/* Material Support Card */}
            <Card className="hover:shadow-lg transition-shadow h-full bg-gradient-to-br from-gold/10 to-amber-50 border-gold/30">
              <CardHeader>
                <div className="mb-3 w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center">
                  <Package className="h-6 w-6 text-gold" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg text-navy">Material Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Clothing, medical supplies, and educational resources distributed with dignity in coordination with local leadership.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Scholarships */}
      <section className="px-4 py-16 bg-gradient-to-br from-navy to-navy-800" aria-labelledby="scholarship-heading">
        <div className="container mx-auto max-w-4xl text-center">
          <Sparkles className="h-12 w-12 text-gold mx-auto mb-4" aria-hidden="true" />
          <h2 id="scholarship-heading" className="mb-4 font-serif text-3xl font-bold text-white md:text-4xl">
            Scholarships Available
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Limited partial scholarships are available for participants who demonstrate need and alignment with the mission.
          </p>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="px-4 py-16 md:py-24 bg-white" aria-labelledby="who-heading">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 id="who-heading" className="mb-6 font-serif text-3xl font-bold text-navy md:text-4xl">
                Who This Trip Is For
              </h2>
              <p className="mb-6 text-gray-600">
                We're looking for team members who are ready to serve with excellence and humility.
              </p>
              <ul className="space-y-4">
                {whoIsThisFor.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
                    </div>
                    <span className="text-navy font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-gold/10 rounded-xl p-8">
              <Globe className="h-16 w-16 text-green-700 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-navy text-center mb-2">
                Join the Delegation
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Be part of a team making lasting Kingdom impact across Kenya.
              </p>
              <a href="#apply" className="block">
                <Button className="w-full bg-navy hover:bg-navy/90">
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="px-4 py-16 md:py-24 bg-gray-50" aria-labelledby="apply-heading">
        <div className="container mx-auto max-w-2xl">
          <h2 id="apply-heading" className="mb-4 text-center font-serif text-3xl font-bold text-navy md:text-4xl">
            Apply for the Kenya Trip
          </h2>
          <p className="mb-8 text-center text-gray-600">
            Complete this interest form and we'll be in touch with next steps.
          </p>

          <KenyaTripForm />
        </div>
      </section>

      {/* Contact */}
      <section className="px-4 py-12 bg-white border-t" aria-labelledby="contact-heading">
        <div className="container mx-auto max-w-4xl text-center">
          <Mail className="h-8 w-8 text-navy mx-auto mb-3" aria-hidden="true" />
          <h3 id="contact-heading" className="text-xl font-bold text-navy mb-2">Questions?</h3>
          <p className="text-gray-600">
            Email us at{' '}
            <a href="mailto:info@tpcmin.org" className="text-gold hover:underline font-medium">
              info@tpcmin.org
            </a>
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 py-16 bg-gradient-to-br from-green-700 to-green-900" aria-labelledby="cta-heading">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 id="cta-heading" className="mb-4 font-serif text-3xl font-bold text-white md:text-4xl">
            Ready to join the delegation?
          </h2>
          <p className="mb-8 text-xl text-white/90">
            Take the first step toward your Kingdom assignment in Kenya.
          </p>
          <a href="#apply">
            <Button size="lg" className="bg-gold hover:bg-gold/90 text-navy text-lg px-8">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}
