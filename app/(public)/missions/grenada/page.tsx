import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Cross, Activity, BookOpen, Laptop, ChevronRight, Calendar, Send } from 'lucide-react'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'

export default function GrenadaMissionPage() {
  const initiatives = [
    {
      title: 'Ministry Initiatives in Grenada',
      description: 'Building strong family-focused ministries, youth programs, and community churches that serve as beacons of hope.',
      icon: Cross,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Medical Initiatives in Grenada',
      description: 'Providing health screenings, wellness programs, and health education to families and communities.',
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Educational Initiatives in Grenada',
      description: 'Supporting youth education, after-school programs, and mentorship opportunities for the next generation.',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Business/Tech/AI Initiatives in Grenada',
      description: 'Empowering families with skills training, technology access, and economic development opportunities.',
      icon: Laptop,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
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
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 to-red-800 px-4 py-20 md:py-32">
        <div className="container relative mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-white/80 text-sm">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/missions" className="hover:text-white">Missions</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Grenada</span>
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 text-8xl md:text-9xl">🇬🇩</div>
            <h1 className="mb-6 font-serif text-5xl font-bold tracking-tight text-white md:text-7xl">
              Grenada
            </h1>
            <p className="mb-8 text-xl text-white/90 md:text-2xl">
              Serving Families and Building Strong Foundations
            </p>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mx-auto max-w-5xl mt-12">
            <ImagePlaceholder aspectRatio="21/9" className="rounded-lg shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-white px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-6 font-serif text-4xl font-bold text-navy">
            Our Work in Grenada
          </h2>
          <div className="space-y-4 text-lg leading-relaxed text-gray-700">
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
              Through our community centers, mentorship programs, and family services, we're helping Grenadian families
              thrive spiritually, emotionally, and economically—building a legacy of faith for generations to come.
            </p>
          </div>
        </div>
      </section>

      {/* Four Initiatives Grid */}
      <section className="bg-gray-50 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center font-serif text-4xl font-bold text-navy">
            Our Initiatives in Grenada
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {initiatives.map((initiative) => (
              <Card key={initiative.title} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`mb-4 rounded-lg p-3 w-14 h-14 flex items-center justify-center ${initiative.bgColor}`}>
                    <initiative.icon className={`h-7 w-7 ${initiative.color}`} />
                  </div>
                  <CardTitle className="text-xl text-navy mb-3">{initiative.title}</CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    {initiative.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Dashboard */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center font-serif text-4xl font-bold text-white">
            Lives Changed
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-3 font-serif text-6xl font-bold text-gold">300+</div>
              <div className="text-lg text-white">Families Served</div>
            </div>
            <div className="text-center">
              <div className="mb-3 font-serif text-6xl font-bold text-gold">5</div>
              <div className="text-lg text-white">Community Centers</div>
            </div>
            <div className="text-center">
              <div className="mb-3 font-serif text-6xl font-bold text-gold">100+</div>
              <div className="text-lg text-white">Youth Mentored</div>
            </div>
            <div className="text-center">
              <div className="mb-3 font-serif text-6xl font-bold text-gold">8+</div>
              <div className="text-lg text-white">Years of Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Updates Section */}
      <section className="bg-white px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center font-serif text-4xl font-bold text-navy">
            Latest Updates from Grenada
          </h2>

          <div className="grid gap-8 md:grid-cols-3 mb-8">
            {updates.map((update) => (
              <Card key={update.title} className="border-gray-200">
                <div className="aspect-video w-full">
                  <ImagePlaceholder aspectRatio="16/9" />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4" />
                    {update.date}
                  </div>
                  <CardTitle className="text-xl text-navy mb-2">{update.title}</CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    {update.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
              View All Updates
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Prayer Requests Section */}
      <section className="bg-gold/10 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-8 text-center font-serif text-4xl font-bold text-navy">
            Pray for Grenada
          </h2>

          <Card className="border-gold">
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {prayerRequests.map((request, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-gold font-bold">•</span>
                    <span className="text-gray-700">{request}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 text-center">
                <Button className="bg-navy hover:bg-navy/90 text-white">
                  Submit Your Prayer
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Ways to Help Section */}
      <section className="bg-white px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-12 text-center font-serif text-4xl font-bold text-navy">
            Ways to Help
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="text-center border-gray-200 hover:border-gold transition-colors">
              <CardHeader>
                <div className="mx-auto mb-4 rounded-full bg-gold/10 p-4 w-16 h-16 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-gold" />
                </div>
                <CardTitle className="text-xl text-navy mb-4">Give to Grenada Missions</CardTitle>
                <Link href="/missions/support?region=grenada">
                  <Button className="w-full bg-navy hover:bg-navy/90 text-white">
                    Give Now
                  </Button>
                </Link>
              </CardHeader>
            </Card>

            <Card className="text-center border-gray-200 hover:border-gold transition-colors">
              <CardHeader>
                <div className="mx-auto mb-4 rounded-full bg-gold/10 p-4 w-16 h-16 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-gold" />
                </div>
                <CardTitle className="text-xl text-navy mb-4">Volunteer/Visit</CardTitle>
                <Button variant="outline" className="w-full border-navy text-navy hover:bg-navy hover:text-white">
                  Learn More
                </Button>
              </CardHeader>
            </Card>

            <Card className="text-center border-gray-200 hover:border-gold transition-colors">
              <CardHeader>
                <div className="mx-auto mb-4 rounded-full bg-gold/10 p-4 w-16 h-16 flex items-center justify-center">
                  <Send className="h-8 w-8 text-gold" />
                </div>
                <CardTitle className="text-xl text-navy mb-4">Partner with Us</CardTitle>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full border-navy text-navy hover:bg-navy hover:text-white">
                    Become a Partner
                  </Button>
                </Link>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="bg-gray-50 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center font-serif text-4xl font-bold text-navy">
            See Our Impact
          </h2>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square">
                <ImagePlaceholder aspectRatio="1/1" className="rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="mb-6 font-serif text-4xl font-bold text-white md:text-5xl">
            Join Us in Serving Families in Grenada
          </h2>
          <p className="mb-8 text-lg text-white/90 md:text-xl">
            Your support enables us to strengthen more families, mentor more youth, and build stronger communities
            across Grenada. Partner with us today.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/missions/support?region=grenada">
              <Button size="lg" className="w-full bg-white text-red-700 hover:bg-gray-100 text-lg sm:w-auto">
                Support Grenada Missions
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-white bg-transparent text-lg text-white hover:bg-white/10 sm:w-auto"
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
