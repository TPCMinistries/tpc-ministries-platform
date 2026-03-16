import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Globe, Users, Award, ArrowRight, BookOpen, Sparkles, Cross } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about TPC Ministries - a prophetic ministry transforming lives through Christ-centered teaching, discipleship, and global missions across Kenya, South Africa, and Grenada.',
  openGraph: {
    title: 'About TPC Ministries',
    description: 'Transforming lives through Christ-centered teaching, discipleship, and global missions.',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section — Cinematic */}
      <section className="relative flex min-h-[60vh] md:min-h-[70vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,184,131,0.06),transparent_60%)]" />

        <div className="container relative mx-auto max-w-5xl px-4 py-20 md:py-32 text-center">
          <p className="mb-6 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Our Story
          </p>
          <h1 className="mb-6 font-display text-display-md sm:text-display-lg md:text-display-xl lg:text-display-2xl text-white">
            About TPC Ministries
          </h1>
          <p className="mx-auto max-w-2xl text-body-xl text-white/50">
            A prophetic ministry transforming lives through Christ-centered
            teaching, discipleship, and global missions
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Mission Section — Editorial */}
      <section className="px-4 py-12 md:py-section">
        <div className="container mx-auto max-w-6xl">
          {/* Big statement */}
          <div className="mb-12 md:mb-20 text-center">
            <h2 className="mx-auto max-w-4xl font-display text-display-md md:text-display-lg text-navy dark:text-white">
              Empowering believers to discover their God-given purpose
            </h2>
          </div>

          {/* Two-column layout */}
          <div className="grid items-start gap-8 lg:gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-6 text-body-xl leading-relaxed text-muted-foreground">
                TPC Ministries exists to awaken purpose and ignite vision in every believer
                through transformative biblical teaching, authentic community,
                in-person gatherings, and practical discipleship.
              </p>
              <p className="text-body-lg leading-relaxed text-muted-foreground/80">
                We believe that every person has a unique role in advancing God&apos;s kingdom,
                and we&apos;re committed to providing the resources, online tools, in-person community,
                and guidance needed to fulfill that calling.
              </p>
            </div>

            {/* Pillars */}
            <div className="space-y-6">
              {[
                { icon: Heart, title: 'Faith-Centered', desc: 'Rooted in biblical truth and powered by the Holy Spirit', color: 'bg-navy' },
                { icon: Globe, title: 'Global Impact', desc: 'Reaching nations through missions and partnerships', color: 'bg-gold' },
                { icon: Users, title: 'Community Driven', desc: 'Building authentic relationships and accountability', color: 'bg-navy' },
              ].map((item) => (
                <div key={item.title} className="group flex items-start gap-5 rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-gold/30 hover:shadow-lg">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-display text-display-xs text-navy dark:text-white">{item.title}</h3>
                    <p className="text-body-md text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section — Full-width cards on dark bg */}
      <section className="bg-navy dark:bg-navy-950 px-4 py-12 md:py-section">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 md:mb-16 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
              What We Stand For
            </p>
            <h2 className="font-display text-display-md md:text-display-lg text-white">
              Our Core Values
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Award,
                title: 'Excellence',
                desc: 'We pursue excellence in all we do, honoring God through quality teaching, thoughtful content, and impactful ministry.',
              },
              {
                icon: Users,
                title: 'Community',
                desc: 'We believe in the power of authentic community — both online and in-person — where believers can grow together and multiply impact.',
              },
              {
                icon: Globe,
                title: 'Global Vision',
                desc: "We're committed to reaching nations and making disciples across cultures, breaking barriers through the love of Christ.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="group rounded-3xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:border-gold/30 hover:bg-white/10"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15">
                  <value.icon className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mb-3 font-display text-display-xs text-white">
                  {value.title}
                </h3>
                <p className="text-body-md leading-relaxed text-white/50">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section — Premium */}
      <section className="px-4 py-12 md:py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10 md:mb-16 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
              Who We Are
            </p>
            <h2 className="font-display text-display-md md:text-display-lg text-navy dark:text-white">
              Our Leadership
            </h2>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-2">
            {/* Lorenzo */}
            <div className="group overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card transition-all duration-300 hover:border-gold/30 hover:shadow-xl">
              <div className="relative h-36 sm:h-48 bg-gradient-to-br from-navy via-navy-800 to-navy-700">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.15),transparent_60%)]" />
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-card bg-gradient-to-br from-navy to-navy-800 text-3xl font-bold text-gold ring-2 ring-gold/20">
                    LD
                  </div>
                </div>
              </div>
              <div className="px-8 pb-8 pt-16 text-center">
                <h3 className="mb-1 font-display text-display-xs text-navy dark:text-white">
                  Prophet Lorenzo Daughtry-Chambers
                </h3>
                <p className="mb-4 text-body-sm font-medium text-gold-600">
                  Founder & Lead Pastor
                </p>
                <p className="text-body-md text-muted-foreground">
                  Passionate about equipping believers to discover and walk in their God-given
                  purpose through prophetic insight and transformative teaching.
                </p>
              </div>
            </div>

            {/* Sarah */}
            <div className="group overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card transition-all duration-300 hover:border-gold/30 hover:shadow-xl">
              <div className="relative h-36 sm:h-48 bg-gradient-to-br from-gold-600 via-gold-500 to-gold-400">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(30,58,97,0.15),transparent_60%)]" />
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-card bg-gradient-to-br from-gold-500 to-gold-600 text-3xl font-bold text-white ring-2 ring-gold/30">
                    SD
                  </div>
                </div>
              </div>
              <div className="px-8 pb-8 pt-16 text-center">
                <h3 className="mb-1 font-display text-display-xs text-navy dark:text-white">
                  Prophetess Sarah Daughtry-Chambers
                </h3>
                <p className="mb-4 text-body-sm font-medium text-gold-600">
                  Co-Founder & Minister
                </p>
                <p className="text-body-md text-muted-foreground">
                  Leading spiritual formation and discipleship initiatives with prophetic wisdom
                  and pastoral care across our community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Reach — Stats bar */}
      <section className="border-y border-border bg-secondary/50 px-4 py-10 md:py-section-sm">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-0 md:divide-x md:divide-border">
            {[
              { label: 'Countries', value: '3' },
              { label: 'Lives Impacted', value: '1,000+' },
              { label: 'Active Members', value: '500+' },
              { label: 'Mission Trips', value: '14-Day' },
            ].map((stat) => (
              <div key={stat.label} className="px-6 text-center">
                <div className="font-display text-display-sm md:text-display-md text-navy dark:text-white">
                  {stat.value}
                </div>
                <div className="mt-1 text-body-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="px-4 py-12 md:py-section">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 md:mb-16 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
              How We Serve
            </p>
            <h2 className="font-display text-display-md md:text-display-lg text-navy dark:text-white">
              What We Offer
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BookOpen, title: 'Biblical Teaching', desc: 'Deep, accessible content for every stage of faith' },
              { icon: Sparkles, title: 'Prophetic Ministry', desc: 'Personal and corporate prophetic words' },
              { icon: Globe, title: 'Global Missions', desc: 'Annual mission trips to Kenya and beyond' },
              { icon: Heart, title: 'Community', desc: 'Groups, events, and connections with believers worldwide' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-gold/30 hover:shadow-lg"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy/10 dark:bg-navy/30">
                  <item.icon className="h-6 w-6 text-navy dark:text-gold" />
                </div>
                <h3 className="mb-2 font-display text-body-lg font-semibold text-navy dark:text-white">
                  {item.title}
                </h3>
                <p className="text-body-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section — Cinematic */}
      <section className="relative overflow-hidden bg-navy-950 px-4 py-16 md:py-section-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />

        <div className="container relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Ready?
          </p>
          <h2 className="mb-6 font-display text-display-md md:text-display-lg text-white">
            Join Us on This Journey
          </h2>
          <p className="mb-10 text-body-xl text-white/50">
            Be part of a community that&apos;s transforming lives and impacting nations
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/signup">
              <Button variant="glow" size="xl">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/partner">
              <Button
                variant="outline"
                size="xl"
                className="border-2 border-gold/30 text-white hover:bg-gold/10"
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
