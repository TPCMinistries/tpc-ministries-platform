import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, Cross, Activity, BookOpen, Laptop, ChevronRight, Calendar, Send } from 'lucide-react'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'

export default function GrenadaMissionPage() {
  const initiatives = [
    {
      title: 'Ministry Initiatives in Grenada',
      description: 'Building strong family-focused ministries, youth programs, and community churches that serve as beacons of hope.',
      icon: Cross,
      color: 'text-purple-600',
    },
    {
      title: 'Medical Initiatives in Grenada',
      description: 'Providing health screenings, wellness programs, and health education to families and communities.',
      icon: Activity,
      color: 'text-red-600',
    },
    {
      title: 'Educational Initiatives in Grenada',
      description: 'Supporting youth education, after-school programs, and mentorship opportunities for the next generation.',
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      title: 'Business/Tech/AI Initiatives in Grenada',
      description: 'Empowering families with skills training, technology access, and economic development opportunities.',
      icon: Laptop,
      color: 'text-green-600',
    },
  ]

  const updates = [
    {
      date: 'March 18, 2025',
      title: 'Youth Mentorship Program Launches',
      description: 'We launched a new youth mentorship program serving 50 young people with life skills and spiritual guidance.',
    },
    {
      date: 'March 1, 2025',
      title: 'Community Center Opens Doors',
      description: 'Our 5th community center opened, providing a safe space for families to gather, worship, and find support.',
    },
    {
      date: 'February 20, 2025',
      title: 'Family Support Program Reaches Milestone',
      description: 'We celebrated serving our 300th family through comprehensive support programs and resources.',
    },
  ]

  const prayerRequests = [
    'Pray for the families we serve as they navigate life challenges and grow in faith',
    'Lift up our youth mentors and the young people in our programs',
    'Ask God to provide resources for expanding our community centers',
    'Pray for unity and spiritual growth in Grenadian churches',
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="container relative mx-auto max-w-5xl px-4 py-32">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-body-sm text-white/50">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/missions" className="transition-colors hover:text-white">Missions</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gold">Grenada</span>
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 text-8xl md:text-9xl">🇬🇩</div>
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Caribbean</p>
            <h1 className="mb-6 font-display text-display-xl text-white md:text-display-2xl">
              Grenada
            </h1>
            <p className="mx-auto max-w-2xl text-body-xl text-white/50">
              Serving Families and Building Strong Foundations
            </p>
            <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          {/* Hero Image Placeholder */}
          <div className="mx-auto mt-12 max-w-5xl">
            <ImagePlaceholder aspectRatio="21/9" className="rounded-2xl shadow-2xl" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Our Story Section */}
      <section className="bg-background px-4 py-section">
        <div className="container mx-auto max-w-4xl">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Our Story</p>
          <h2 className="mb-6 font-display text-display-md text-foreground md:text-display-lg">
            Our Work in Grenada
          </h2>
          <div className="space-y-4 text-body-lg leading-relaxed text-muted-foreground">
            <p>
              TPC Ministries has been serving families in Grenada with a focus on strengthening family units, supporting
              children and youth, and building strong faith foundations that impact entire communities.
            </p>
            <p>
              We work in partnership with local churches and The Global Development Institute and Enterprise to provide
              comprehensive family support, youth mentorship, and community development programs. Our approach emphasizes
              the family as the cornerstone of strong communities and vibrant churches.
            </p>
            <p>
              Through our community centers, mentorship programs, and family services, we&apos;re helping Grenadian families
              thrive spiritually, emotionally, and economically—building a legacy of faith for generations to come.
            </p>
          </div>
        </div>
      </section>

      {/* Four Initiatives Grid */}
      <section className="bg-secondary px-4 py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">What We Do</p>
            <h2 className="mb-6 font-display text-display-md text-foreground md:text-display-lg">
              Our Initiatives in Grenada
            </h2>
            <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {initiatives.map((initiative) => (
              <div key={initiative.title} className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                  <initiative.icon className={`h-7 w-7 ${initiative.color}`} />
                </div>
                <h3 className="mb-3 font-display text-display-xs text-foreground">{initiative.title}</h3>
                <p className="text-body-md text-muted-foreground">
                  {initiative.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Dashboard */}
      <section className="bg-navy dark:bg-navy-950 px-4 py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">By the Numbers</p>
            <h2 className="mb-6 font-display text-display-md text-white md:text-display-lg">
              Lives Changed
            </h2>
            <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: '300+', label: 'Families Served' },
              { value: '5', label: 'Community Centers' },
              { value: '100+', label: 'Youth Mentored' },
              { value: '8+', label: 'Years of Service' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-3 font-display text-display-xl text-gold">{stat.value}</div>
                <div className="text-body-lg text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Updates Section */}
      <section className="bg-background px-4 py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Stay Informed</p>
            <h2 className="mb-6 font-display text-display-md text-foreground md:text-display-lg">
              Latest Updates from Grenada
            </h2>
            <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          <div className="mb-8 grid gap-8 md:grid-cols-3">
            {updates.map((update) => (
              <div key={update.title} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="aspect-video w-full">
                  <ImagePlaceholder aspectRatio="16/9" />
                </div>
                <div className="p-6">
                  <div className="mb-2 flex items-center gap-2 text-body-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {update.date}
                  </div>
                  <h3 className="mb-2 font-display text-display-xs text-foreground">{update.title}</h3>
                  <p className="text-body-md text-muted-foreground">
                    {update.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" className="border-2 border-border text-foreground hover:bg-navy hover:text-white">
              View All Updates
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Prayer Requests Section */}
      <section className="bg-secondary px-4 py-section">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Intercession</p>
            <h2 className="mb-6 font-display text-display-md text-foreground">
              Pray for Grenada
            </h2>
            <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          <div className="rounded-3xl border border-gold/20 bg-card p-8">
            <ul className="space-y-4">
              {prayerRequests.map((request, index) => (
                <li key={index} className="flex gap-3">
                  <span className="mt-0.5 text-gold">&#x2022;</span>
                  <span className="text-body-md text-muted-foreground">{request}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 text-center">
              <Button className="bg-navy text-white hover:bg-navy-800">
                Submit Your Prayer
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Help Section */}
      <section className="bg-background px-4 py-section">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Get Involved</p>
            <h2 className="mb-6 font-display text-display-md text-foreground">
              Ways to Help
            </h2>
            <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 text-center transition-colors hover:border-gold">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
                <Heart className="h-8 w-8 text-gold" />
              </div>
              <h3 className="mb-4 font-display text-display-xs text-foreground">Give to Grenada Missions</h3>
              <Link href="/missions/support?region=grenada">
                <Button className="w-full bg-navy text-white hover:bg-navy-800">
                  Give Now
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-center transition-colors hover:border-gold">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
                <Calendar className="h-8 w-8 text-gold" />
              </div>
              <h3 className="mb-4 font-display text-display-xs text-foreground">Volunteer/Visit</h3>
              <Button variant="outline" className="w-full border-2 border-border text-foreground hover:bg-navy hover:text-white">
                Learn More
              </Button>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-center transition-colors hover:border-gold">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
                <Send className="h-8 w-8 text-gold" />
              </div>
              <h3 className="mb-4 font-display text-display-xs text-foreground">Partner with Us</h3>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full border-2 border-border text-foreground hover:bg-navy hover:text-white">
                  Become a Partner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="bg-secondary px-4 py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Gallery</p>
            <h2 className="mb-6 font-display text-display-md text-foreground">
              See Our Impact
            </h2>
            <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square">
                <ImagePlaceholder aspectRatio="1/1" className="rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative bg-navy-950 px-4 py-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />
        <div className="container relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Join the Mission</p>
          <h2 className="mb-6 font-display text-display-lg text-white md:text-display-xl">
            Join Us in Serving Families in Grenada
          </h2>
          <p className="mb-8 text-body-xl text-white/50">
            Your support enables us to strengthen more families, mentor more youth, and build stronger communities
            across Grenada. Partner with us today.
          </p>
          <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/missions/support?region=grenada">
              <Button size="lg" className="h-14 w-full bg-gold px-8 text-body-lg font-bold text-navy hover:bg-gold-300 sm:w-auto">
                Support Grenada Missions
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="h-14 w-full border-2 border-white/30 bg-white/10 px-8 text-body-lg font-bold text-white hover:bg-white hover:text-navy sm:w-auto"
              >
                Become a Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
