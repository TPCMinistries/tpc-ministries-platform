import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
    },
    {
      title: 'Medical Initiatives',
      description: 'Providing healthcare access, medical missions, and health education',
      icon: Activity,
      color: 'text-red-600',
    },
    {
      title: 'Educational Initiatives',
      description: 'Building schools, training programs, and educational resources',
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      title: 'Business/Tech/AI Initiatives',
      description: 'Empowering communities through technology, entrepreneurship, and AI solutions',
      icon: Laptop,
      color: 'text-green-600',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Worldwide Kingdom Work</p>
          <h1 className="mb-6 font-display text-display-xl text-white md:text-display-2xl">
            Global Impact
          </h1>
          <p className="mx-auto max-w-2xl text-body-xl text-white/50">
            Transforming communities across nations through strategic partnerships
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Our Partnership Model */}
      <section className="bg-background px-4 py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">How We Work</p>
            <h2 className="mb-6 font-display text-display-lg text-foreground md:text-display-xl">
              Our Partnership Model
            </h2>
            <div className="mx-auto max-w-4xl">
              <p className="mb-6 text-body-lg text-muted-foreground">
                TPC Ministries is proud to partner with <span className="font-semibold text-foreground">The Global Development Institute and Enterprise (GDI)</span> - a leading organization dedicated to sustainable community development and transformation across nations.
              </p>
              <p className="text-body-lg text-muted-foreground">
                Together, we create lasting impact through four key initiatives:
              </p>
            </div>
            <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {initiatives.map((initiative) => (
              <div key={initiative.title} className="rounded-2xl border border-border bg-card p-6 text-center transition-shadow hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
                  <initiative.icon className={`h-8 w-8 ${initiative.color}`} />
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

      {/* Where We Serve */}
      <section className="bg-secondary px-4 py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Where We Serve</p>
            <h2 className="mb-6 font-display text-display-lg text-foreground md:text-display-xl">
              Our Mission Fields
            </h2>
            <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {missions.map((mission) => (
              <div key={mission.id} className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className={`bg-gradient-to-br ${mission.color} p-8 text-center`}>
                  <div className="mb-4 text-7xl">{mission.flag}</div>
                  <h3 className="mb-2 font-display text-display-sm text-white">
                    {mission.country}
                  </h3>
                  <p className="text-body-lg font-semibold text-white/90">{mission.tagline}</p>
                </div>

                <div className="p-6">
                  <p className="mb-6 text-body-md text-muted-foreground">{mission.description}</p>

                  <Link href={mission.href} className="block">
                    <Button className="w-full bg-navy text-white hover:bg-navy-800">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative bg-navy-950 px-4 py-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />
        <div className="container relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Partner With Us</p>
          <h2 className="mb-6 font-display text-display-lg text-white md:text-display-xl">
            Support Our Missions
          </h2>
          <p className="mb-8 text-body-xl text-white/50">
            Your partnership makes it possible to transform lives across nations. Join us in making a lasting impact.
          </p>
          <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/missions/support">
              <Button size="lg" className="h-14 w-full bg-gold px-8 text-body-lg font-bold text-navy hover:bg-gold-300 sm:w-auto">
                Support Missions
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="h-14 w-full border-2 border-white/30 bg-white/10 px-8 text-body-lg font-bold text-white hover:bg-white hover:text-navy sm:w-auto"
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
