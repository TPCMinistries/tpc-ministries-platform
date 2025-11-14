import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Globe, Heart, Cross, Activity, BookOpen, Laptop } from 'lucide-react'

export default function MissionsPage() {
  const missions = [
    {
      id: 'kenya',
      country: 'Kenya',
      flag: '🇰🇪',
      tagline: 'Empowering Communities',
      description:
        'Through education, faith-based programs, and community development, we\'re transforming lives across Kenya',
      color: 'from-green-600 to-green-800',
      href: '/missions/kenya',
    },
    {
      id: 'south-africa',
      country: 'South Africa',
      flag: '🇿🇦',
      tagline: 'Building Churches',
      description:
        'Planting churches, training leaders, and establishing strong faith communities throughout South Africa',
      color: 'from-blue-600 to-blue-800',
      href: '/missions/south-africa',
    },
    {
      id: 'grenada',
      country: 'Grenada',
      flag: '🇬🇩',
      tagline: 'Serving Families',
      description:
        'Strengthening families, providing support, and building a strong foundation of faith in Grenada',
      color: 'from-red-600 to-red-800',
      href: '/missions/grenada',
    },
  ]

  const initiatives = [
    {
      title: 'Ministry Initiatives',
      description: 'Planting churches, training leaders, and strengthening faith communities',
      icon: Cross,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Medical Initiatives',
      description: 'Providing healthcare access, medical missions, and health education',
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Educational Initiatives',
      description: 'Building schools, training programs, and educational resources',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Business/Tech/AI Initiatives',
      description: 'Empowering communities through technology, entrepreneurship, and AI solutions',
      icon: Laptop,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy/95 to-navy/90 px-4 py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container relative mx-auto">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 font-serif text-5xl font-bold tracking-tight text-white md:text-7xl">
              Global Impact
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-gold md:text-2xl">
              Transforming communities across nations through strategic partnerships
            </p>
          </div>
        </div>
      </section>

      {/* Our Partnership Model */}
      <section className="bg-white px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-6 text-center font-serif text-4xl font-bold text-navy md:text-5xl">
            Our Partnership Model
          </h2>
          <div className="mb-12 text-center max-w-4xl mx-auto">
            <p className="text-lg text-slate-700 mb-6">
              TPC Ministries is proud to partner with <span className="font-semibold text-navy">The Global Development Institute and Enterprise (GDI)</span> - a leading organization dedicated to sustainable community development and transformation across nations.
            </p>
            <p className="text-lg text-slate-700">
              Together, we create lasting impact through four key initiatives:
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {initiatives.map((initiative) => (
              <Card key={initiative.title} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className={`mx-auto mb-4 rounded-lg p-4 w-16 h-16 flex items-center justify-center ${initiative.bgColor}`}>
                    <initiative.icon className={`h-8 w-8 ${initiative.color}`} />
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

      {/* Where We Serve */}
      <section className="bg-gray-50 px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center font-serif text-4xl font-bold text-navy md:text-5xl">
            Our Mission Fields
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {missions.map((mission) => (
              <Card key={mission.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className={`bg-gradient-to-br ${mission.color} p-8 text-center`}>
                  <div className="mb-4 text-7xl">{mission.flag}</div>
                  <h3 className="font-serif text-3xl font-bold text-white mb-2">
                    {mission.country}
                  </h3>
                  <p className="text-white/90 text-lg font-semibold">{mission.tagline}</p>
                </div>

                <CardContent className="p-6">
                  <p className="mb-6 text-gray-700">{mission.description}</p>

                  <Link href={mission.href} className="block">
                    <Button className="w-full bg-navy text-white hover:bg-navy/90">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-gold to-gold-dark px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="mb-6 font-serif text-4xl font-bold text-white md:text-5xl">
            Support Our Missions
          </h2>
          <p className="mb-8 text-lg text-white/90 md:text-xl">
            Your partnership makes it possible to transform lives across nations. Join us in making a lasting impact.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/missions/support">
              <Button size="lg" className="w-full bg-navy text-lg text-white hover:bg-navy/90 sm:w-auto">
                Support Missions
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-white bg-transparent text-lg text-white hover:bg-white/10 sm:w-auto"
              >
                Partner With Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
