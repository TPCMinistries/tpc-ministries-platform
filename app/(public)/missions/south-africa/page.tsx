import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, Cross, Activity, BookOpen, Laptop, ChevronRight, Calendar, Send } from 'lucide-react'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'

export default function SouthAfricaMissionPage() {
  const initiatives = [
    {
      title: 'Ministry Initiatives in South Africa',
      description: 'Planting churches throughout urban and rural areas, developing strong pastoral leadership, and building sustainable ministries.',
      icon: Cross,
      color: 'text-purple-600',
    },
    {
      title: 'Medical Initiatives in South Africa',
      description: 'Partnering with local health workers to provide medical care, HIV/AIDS awareness, and community health programs.',
      icon: Activity,
      color: 'text-red-600',
    },
    {
      title: 'Educational Initiatives in South Africa',
      description: 'Supporting Bible schools, leadership training programs, and educational opportunities for pastors and church leaders.',
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      title: 'Business/Tech/AI Initiatives in South Africa',
      description: 'Creating economic opportunities, entrepreneurship training, and business development in underserved communities.',
      icon: Laptop,
      color: 'text-green-600',
    },
  ]

  const updates = [
    {
      date: 'March 20, 2025',
      title: '3 New Churches Planted in Eastern Cape',
      description: 'Our church planting team successfully launched 3 new congregations, with trained local pastors leading each community.',
    },
    {
      date: 'March 5, 2025',
      title: 'Leadership Training Graduates 25 Pastors',
      description: '25 pastors completed our intensive 6-month leadership program, equipped to shepherd growing congregations.',
    },
    {
      date: 'February 15, 2025',
      title: 'Women\'s Empowerment Program Reaches 100+',
      description: 'Our women\'s ministry training has empowered over 100 women to step into leadership roles in their churches.',
    },
  ]

  const prayerRequests = [
    'Pray for our church planting efforts in new communities across South Africa',
    'Lift up our leadership training graduates as they shepherd their congregations',
    'Ask God for provision and wisdom for our ministry partners across the nation',
    'Pray for unity and revival across South African churches',
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
            <span className="text-gold">South Africa</span>
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 text-8xl md:text-9xl">🇿🇦</div>
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Southern Africa</p>
            <h1 className="mb-6 font-display text-display-xl text-white md:text-display-2xl">
              South Africa
            </h1>
            <p className="mx-auto max-w-2xl text-body-xl text-white/50">
              Building Churches and Training Leaders
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
            Our Work in South Africa
          </h2>
          <div className="space-y-4 text-body-lg leading-relaxed text-muted-foreground">
            <p>
              TPC Ministries has been actively serving communities across South Africa, focusing on church planting,
              leadership development, and building strong, sustainable faith communities that transform entire regions.
            </p>
            <p>
              We work closely with indigenous leaders and The Global Development Institute and Enterprise to raise up
              pastors and church planters who can effectively shepherd their own communities. Our approach emphasizes
              multiplication—training leaders who will train others, planting churches that will plant more churches.
            </p>
            <p>
              Through strategic partnerships and a commitment to excellence in ministry, we&apos;re seeing the Gospel take
              root and flourish across South Africa, with growing congregations and emerging leaders ready to advance
              God&apos;s kingdom.
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
              Our Initiatives in South Africa
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
              { value: '15', label: 'Churches Planted' },
              { value: '45', label: 'Leaders Trained' },
              { value: '300+', label: 'Families Served' },
              { value: '10+', label: 'Years of Service' },
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
              Latest Updates from South Africa
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
              Pray for South Africa
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
              <h3 className="mb-4 font-display text-display-xs text-foreground">Give to South Africa Missions</h3>
              <Link href="/missions/support?region=south-africa">
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
            Join Us in Building the Church in South Africa
          </h2>
          <p className="mb-8 text-body-xl text-white/50">
            Your support enables us to plant more churches, train more leaders, and reach more communities
            with the Gospel across South Africa. Partner with us today.
          </p>
          <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/missions/support?region=south-africa">
              <Button size="lg" className="h-14 w-full bg-gold px-8 text-body-lg font-bold text-navy hover:bg-gold-300 sm:w-auto">
                Support South Africa Missions
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
