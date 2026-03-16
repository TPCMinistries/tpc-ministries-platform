import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Gift,
  Compass,
  Eye,
  Heart,
  Crown,
  TreePine,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

export default function AssessmentsHubPage() {
  const assessments = [
    {
      id: '1',
      slug: 'spiritual-gifts',
      title: 'Spiritual Gifts Assessment',
      description: 'Discover your God-given abilities to serve the body of Christ and advance His kingdom',
      icon: Gift,
      duration: '15 minutes',
      badge: 'Most Popular',
    },
    {
      id: '2',
      slug: 'seasonal',
      title: 'Seasonal Assessment',
      description: 'Understand your current spiritual season and receive tailored guidance for your journey',
      icon: Compass,
      duration: '10 minutes',
      badge: 'Start Here',
    },
    {
      id: '3',
      slug: 'prophetic-expression',
      title: 'Prophetic Expression Assessment',
      description: 'Discover how God uniquely speaks through you and learn to steward your prophetic expression',
      icon: Eye,
      duration: '12 minutes',
    },
    {
      id: '4',
      slug: 'ministry-calling',
      title: 'Ministry Calling Assessment',
      description: 'Find your specific calling and get matched with ministry opportunities that fit your design',
      icon: Heart,
      duration: '15 minutes',
    },
    {
      id: '5',
      slug: 'redemptive-gifts',
      title: 'Redemptive Gifts Assessment',
      description: 'Discover how you process the world and relate to others based on Romans 12 framework',
      icon: Crown,
      duration: '18 minutes',
      note: 'Based on Romans 12:6-8 framework',
    },
    {
      id: '6',
      slug: 'spiritual-maturity',
      title: 'Spiritual Maturity Assessment',
      description: 'Evaluate your spiritual growth and receive a personalized development plan for your next steps',
      icon: TreePine,
      duration: '12 minutes',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,184,131,0.06),transparent_60%)]" />

        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gold/15">
            <Sparkles className="h-10 w-10 text-gold" />
          </div>
          <p className="mb-6 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Know Your Design
          </p>
          <h1 className="mb-6 font-display text-display-xl md:text-display-2xl text-white">
            Discover Your Spiritual Design
          </h1>
          <p className="mx-auto max-w-2xl text-body-xl text-white/50">
            Take free, biblically-based assessments to understand how God uniquely created you for His purposes
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-body-sm text-white/90">
            {['100% Free', 'Biblically Grounded', 'Personalized Results', 'No Account Required'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-gold" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Why Take Assessments */}
      <section className="px-4 py-section">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
              Purpose
            </p>
            <h2 className="font-display text-display-md md:text-display-lg text-navy dark:text-white">
              Why Take These Assessments?
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Gift,
                title: 'Know Your Design',
                desc: 'God created you with unique gifts, abilities, and perspectives. Understanding these helps you walk confidently in your calling and serve effectively in His kingdom.',
              },
              {
                icon: Compass,
                title: 'Find Your Path',
                desc: "Whether you're new in faith or seasoned in ministry, these assessments provide clarity on where you are and where God is leading you next in your spiritual journey.",
              },
              {
                icon: Heart,
                title: 'Serve with Purpose',
                desc: "Discover where and how you're called to serve. Get matched with ministry opportunities that align with your God-given design and see greater fruit in your labor.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-gold/30 hover:shadow-lg"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy/10 dark:bg-navy/30">
                  <item.icon className="h-8 w-8 text-navy dark:text-gold" />
                </div>
                <h3 className="mb-3 font-display text-display-xs text-navy dark:text-white">{item.title}</h3>
                <p className="text-body-md text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Grid */}
      <section className="bg-navy dark:bg-navy-950 px-4 py-section">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Assessments
            </p>
            <h2 className="mb-4 font-display text-display-md md:text-display-lg text-white">
              Choose Your Assessment
            </h2>
            <p className="mx-auto max-w-2xl text-body-lg text-white/50">
              Each assessment is designed to reveal different aspects of how God created you. Take one or take them all.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assessments.map((assessment) => {
              const Icon = assessment.icon
              return (
                <div
                  key={assessment.id}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:border-gold/30 hover:bg-white/10"
                >
                  {assessment.badge && (
                    <div className="absolute right-4 top-4 rounded-full bg-gold px-3 py-1 text-body-sm font-medium text-navy-950">
                      {assessment.badge}
                    </div>
                  )}

                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15">
                    <Icon className="h-7 w-7 text-gold" />
                  </div>

                  <h3 className="mb-3 font-display text-display-xs text-white">
                    {assessment.title}
                  </h3>
                  <p className="mb-4 min-h-[3rem] text-body-md text-white/50">
                    {assessment.description}
                  </p>

                  {assessment.note && (
                    <p className="mb-4 text-body-sm italic text-white/30">
                      {assessment.note}
                    </p>
                  )}

                  <div className="mb-6 flex items-center gap-2 text-body-sm text-white/40">
                    <Clock className="h-4 w-4" />
                    <span>{assessment.duration}</span>
                  </div>

                  <Link href={`/assessments/${assessment.slug}`}>
                    <Button variant="glow" className="w-full">
                      Start Assessment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-section">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
              Simple Process
            </p>
            <h2 className="font-display text-display-md md:text-display-lg text-navy dark:text-white">
              How It Works
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '1', title: 'Choose an Assessment', desc: 'Select the assessment that resonates with where you are in your journey' },
              { step: '2', title: 'Answer Honestly', desc: 'Take your time with each question. There are no wrong answers\u2014be authentic' },
              { step: '3', title: 'Get Your Results', desc: 'Receive personalized insights, biblical foundation, and practical next steps' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy font-display text-display-xs text-white dark:bg-gold dark:text-navy-950">
                  {item.step}
                </div>
                <h3 className="mb-2 font-display text-display-xs text-navy dark:text-white">{item.title}</h3>
                <p className="text-body-md text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Biblical Foundation */}
      <section className="border-y border-border bg-secondary/50 px-4 py-section">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
            Scripture
          </p>
          <h2 className="mb-8 font-display text-display-md text-navy dark:text-white">
            Biblical Foundation
          </h2>
          <p className="mb-6 text-body-xl italic text-gold">
            &ldquo;Now there are varieties of gifts, but the same Spirit; and there are varieties of service, but the same Lord&rdquo; &mdash; 1 Corinthians 12:4-5
          </p>
          <p className="mx-auto max-w-3xl text-body-lg text-muted-foreground">
            These assessments are designed to help you understand how God has uniquely created and called you. Whether you&apos;re just beginning your spiritual journey or have been walking with God for years, understanding your design helps you serve more effectively and walk more confidently in your calling.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-navy-950 px-4 py-section-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />

        <div className="container relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Get Started
          </p>
          <h2 className="mb-6 font-display text-display-md md:text-display-lg text-white">
            Save Your Results
          </h2>
          <p className="mb-10 text-body-xl text-white/50">
            All assessments are completely free. Create an account to save your results and get personalized recommendations.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/signup">
              <Button variant="glow" size="xl">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                variant="outline"
                size="xl"
                className="border-2 border-gold/30 text-white hover:bg-gold/10"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
