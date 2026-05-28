import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CircleDollarSign,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Mail,
  Mic2,
  Play,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: {
    absolute: 'Covenant Partners | TPC Ministries',
  },
  description:
    'Become a Covenant Partner with TPC Ministries and help sustain prophetic ministry, discipleship, missions, and practical equipping for the future ahead.',
}

const partnerBenefits = [
  {
    title: 'Monthly live partner gatherings',
    description: 'Consistent moments for teaching, prayer, alignment, and shared encouragement.',
    icon: CalendarDays,
  },
  {
    title: 'Corporate prophetic ministry and encouragement',
    description: 'Spiritually mature gatherings centered on strengthening the whole community.',
    icon: Mic2,
  },
  {
    title: 'Bi-weekly teachings by email',
    description: 'Ongoing instruction for spiritual growth, wisdom, discernment, and practical maturity.',
    icon: Mail,
  },
  {
    title: 'Practical development sessions',
    description: 'Equipping across life, leadership, business, family, health, education, and purpose.',
    icon: GraduationCap,
  },
  {
    title: 'AI and future-readiness trainings',
    description: 'Special ministry trainings for believers preparing wisely for the future ahead.',
    icon: Sparkles,
  },
  {
    title: 'Quarterly books or e-books',
    description: 'Curated resources to deepen learning, reflection, and disciplined growth.',
    icon: BookOpen,
  },
  {
    title: 'Prophetic ministry opportunities',
    description: 'Designated moments for ministry during partner gatherings as the Lord leads.',
    icon: HeartHandshake,
  },
  {
    title: 'VIP and early event access',
    description: 'Early access for in-person ministry events, gatherings, and special sessions.',
    icon: ShieldCheck,
  },
  {
    title: 'Missions and international opportunities',
    description: 'Early access to mission trip updates and international assignment opportunities.',
    icon: Globe2,
  },
]

const supportAreas = [
  'Prophetic ministry and prayer gatherings',
  'Discipleship and teaching resources',
  'Missions and international outreach',
  'Leadership development',
  'Media and digital ministry',
  'Practical training and future-readiness education',
  'Community events that strengthen the whole person',
]

const motionStories = [
  {
    title: 'Education Outreach',
    description:
      'School children, classroom connection, and practical investment in the next generation through international ministry.',
    src: '/videos/kenya/education-outreach.mp4',
    poster: '/videos/kenya/posters/education-outreach.jpg',
    label: 'Kenya education outreach video from TPC Ministries',
  },
  {
    title: 'Ministry Moments',
    description:
      'Prayer, prophetic encouragement, and pastoral ministry moments from the field as believers are strengthened.',
    src: '/videos/kenya/ministry-moments.mp4',
    poster: '/videos/kenya/posters/ministry-moments.jpg',
    label: 'Kenya ministry moments video from TPC Ministries',
  },
]

const partnershipLevels = [
  {
    name: 'Builder',
    amount: '$25',
    href: '/give?frequency=monthly&amount=25',
    description: 'Help sustain the ongoing work of teaching, prayer, and encouragement.',
  },
  {
    name: 'Steward',
    amount: '$50',
    href: '/give?frequency=monthly&amount=50',
    description: 'Support discipleship resources and monthly partner gatherings.',
  },
  {
    name: 'Kingdom Partner',
    amount: '$100',
    href: '/give?frequency=monthly&amount=100',
    description: 'Help expand ministry, media, and leadership development.',
    featured: true,
  },
  {
    name: 'Vision Partner',
    amount: '$250',
    href: '/give?frequency=monthly&amount=250',
    description: 'Strengthen missions, events, and broader kingdom initiatives.',
  },
  {
    name: 'Legacy Partner',
    amount: 'Custom',
    href: '/give?frequency=monthly',
    description: 'For those called to make a larger monthly commitment to help build long-term impact.',
  },
]

const faqs = [
  {
    question: 'Is partnership required to receive ministry?',
    answer:
      'No. The Gospel is free, and prophetic ministry is never for sale. Partnership is an invitation for those who feel aligned with the ministry and want to help sustain the work.',
  },
  {
    question: 'Do partners receive personal prophetic words?',
    answer:
      'Partners will have opportunities for prophetic ministry during designated gatherings and special sessions as the Lord leads. Partnership is not a guarantee of a personal word and should never be understood as payment for prophecy.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Monthly partnership can be changed or canceled at any time.',
  },
  {
    question: 'What does my giving support?',
    answer:
      'Your monthly partnership supports discipleship, prayer gatherings, media, missions, teaching resources, events, leadership development, and practical equipping initiatives.',
  },
  {
    question: 'Are donations tax-deductible?',
    answer:
      'Yes. TPC Ministries is represented on this site as a registered 501(c)(3) organization, and contribution receipts are provided for qualifying gifts.',
  },
]

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-navy-950 px-4 pt-28 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(212,184,131,0.18),transparent_30%),radial-gradient(circle_at_78%_12%,rgba(91,134,171,0.16),transparent_28%),linear-gradient(180deg,#0e1a2e_0%,#152844_58%,#faf5eb_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 py-16 md:py-24 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <p className="mb-5 text-body-sm font-semibold uppercase tracking-[0.18em] text-gold">
              TPC Ministries Covenant Partners
            </p>
            <h1 className="max-w-4xl font-display text-display-md text-balance text-white sm:text-display-lg md:text-display-xl lg:text-display-2xl">
              Become a Covenant Partner
            </h1>
            <p className="mt-6 max-w-2xl text-body-xl text-gold-100">
              Helping believers grow spiritually, practically, and prophetically for the future ahead.
            </p>
            <p className="mt-6 max-w-2xl text-body-lg text-navy-100">
              TPC Ministries is entering a new season of prophetic ministry, discipleship, missions,
              leadership development, and practical equipping. Covenant Partners help sustain this work
              while receiving ongoing teaching, connection, and opportunities for growth.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl" variant="gold">
                <Link href="/give?frequency=monthly">
                  Become a Monthly Partner
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="border-white/25 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                <Link href="#message">
                  <Play className="h-5 w-5" />
                  Watch the Message
                </Link>
              </Button>
            </div>
          </div>

          <div id="message" className="rounded-lg border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur">
            <div className="overflow-hidden rounded-md border border-gold/20 bg-navy-900/80">
              <video
                className="aspect-video w-full bg-navy-950 object-cover"
                controls
                preload="metadata"
                poster="/videos/kenya/posters/highlight-video.jpg"
                aria-label="Kenya ministry field highlight from TPC Ministries"
              >
                <source src="/videos/kenya/highlight-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="border-t border-white/10 bg-navy-950/90 px-5 py-4">
                <p className="text-body-sm font-medium uppercase tracking-[0.16em] text-gold">
                  Field highlight
                </p>
                <p className="mt-1 text-body-sm text-navy-200">
                  A glimpse of the ministry, missions, and kingdom work Covenant Partners help sustain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.18em] text-gold-text">
              Why Partnership Matters
            </p>
            <h2 className="mt-3 font-display text-display-md text-navy">From Receiving to Building</h2>
          </div>
          <div className="space-y-6 text-body-lg text-muted-foreground">
            <p>
              Many people are looking for encouragement, clarity, and spiritual direction in uncertain
              times. But this next season is not only about receiving moments from God - it is about
              stewarding them well. Covenant Partnership is for those who feel aligned with this
              assignment and want to help build what God is establishing through this ministry.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <blockquote className="rounded-lg border border-gold/30 bg-card p-5 text-body-md text-navy shadow-sm">
                <p>&ldquo;It is more blessed to give than to receive.&rdquo;</p>
                <cite className="mt-3 block not-italic text-body-sm font-semibold text-gold-text">
                  Acts 20:35
                </cite>
              </blockquote>
              <blockquote className="rounded-lg border border-gold/30 bg-card p-5 text-body-md text-navy shadow-sm">
                <p>&ldquo;Believe in the Lord your God, so shall ye be established; believe His prophets, so shall ye prosper.&rdquo;</p>
                <cite className="mt-3 block not-italic text-body-sm font-semibold text-gold-text">
                  2 Chronicles 20:20
                </cite>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="text-body-sm font-semibold uppercase tracking-[0.18em] text-gold-text">
                Ministry In Motion
              </p>
              <h2 className="mt-3 font-display text-display-md text-navy">
                The work partners help make possible
              </h2>
            </div>
            <p className="text-body-lg text-muted-foreground">
              These field moments reflect the spiritual and practical assignment Covenant Partners help
              sustain: prophetic ministry, education outreach, missions, and whole-person equipping.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {motionStories.map((story) => (
              <article
                key={story.title}
                className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
              >
                <video
                  className="aspect-video w-full bg-navy-950 object-cover"
                  controls
                  preload="metadata"
                  poster={story.poster}
                  aria-label={story.label}
                >
                  <source src={story.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="p-6">
                  <h3 className="font-display text-display-xs text-navy">{story.title}</h3>
                  <p className="mt-3 text-body-md text-muted-foreground">{story.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-body-sm font-semibold uppercase tracking-[0.18em] text-gold-text">
              What Partners Receive
            </p>
            <h2 className="mt-3 font-display text-display-md text-navy">
              Ongoing teaching, community, and equipping
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partnerBenefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <article key={benefit.title} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-navy text-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-body-xl text-navy">{benefit.title}</h3>
                  <p className="mt-3 text-body-md text-muted-foreground">{benefit.description}</p>
                </article>
              )
            })}
          </div>
          <div className="mt-8 rounded-lg border border-gold/40 bg-gold/10 p-5 text-body-md text-navy">
            <strong>Prophetic ministry is never for sale.</strong> Partnership is not payment for prophecy.
            It is a way to help sustain the work of the ministry while staying connected to ongoing
            teaching, community, and equipping.
          </div>
        </div>
      </section>

      <section className="px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-body-sm font-semibold uppercase tracking-[0.18em] text-gold-text">
                What Partnership Supports
              </p>
              <h2 className="mt-3 font-display text-display-md text-navy">
                What Your Partnership Helps Build
              </h2>
              <p className="mt-5 text-body-lg text-muted-foreground">
                Your monthly partnership helps create stable ground for ministry work that strengthens
                believers spiritually, practically, and prophetically.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {supportAreas.map((area) => (
                <div key={area} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
                  <Check className="mt-1 h-5 w-5 flex-shrink-0 text-gold-text" />
                  <p className="text-body-md font-medium text-navy">{area}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy-950 px-4 py-section-sm text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-body-sm font-semibold uppercase tracking-[0.18em] text-gold">
              Partnership Levels
            </p>
            <h2 className="mt-3 font-display text-display-md text-white">Choose a monthly rhythm</h2>
            <p className="mt-5 text-body-lg text-navy-200">
              Every level points toward the same work: building a spiritually mature, future-ready
              community of believers.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {partnershipLevels.map((level) => (
              <article
                key={level.name}
                className={`flex rounded-lg border p-5 ${
                  level.featured
                    ? 'border-gold bg-gold text-navy-950 shadow-[0_0_34px_rgba(212,184,131,0.26)]'
                    : 'border-white/15 bg-white/8'
                }`}
              >
                <div className="flex min-h-[260px] w-full flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-body-xl">{level.name}</h3>
                    <CircleDollarSign className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <p className="mt-5 font-display text-display-sm">
                    {level.amount}
                    {level.amount !== 'Custom' && (
                      <span className="text-body-md font-normal opacity-75">/month</span>
                    )}
                  </p>
                  <p className={`mt-4 text-body-sm ${level.featured ? 'text-navy-900' : 'text-navy-200'}`}>
                    {level.description}
                  </p>
                  <Button
                    asChild
                    variant={level.featured ? 'default' : 'outline'}
                    className={`mt-auto w-full ${
                      level.featured
                        ? 'bg-navy text-white hover:bg-navy-800'
                        : 'border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <Link href={level.href}>Partner Monthly</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
            <Landmark className="h-9 w-9 text-gold-text" />
            <h2 className="mt-5 font-display text-display-md text-navy">A Personal Invitation</h2>
            <p className="mt-5 text-body-lg text-muted-foreground">
              I believe God is gathering builders in this hour - people who want to grow spiritually,
              mature practically, and help sustain what heaven is establishing in the earth. If this
              ministry has strengthened your life, brought clarity, or helped you discern the season you
              are in, I invite you to prayerfully consider becoming a Covenant Partner.
            </p>
            <p className="mt-6 text-body-md font-semibold text-navy">
              Prophet Lorenzo / Prophet Chambers
            </p>
          </div>
          <div className="rounded-lg border border-dashed border-gold/40 bg-cream p-8">
            <p className="text-body-sm font-semibold uppercase tracking-[0.18em] text-gold-text">
              Testimonies
            </p>
            <h3 className="mt-3 font-display text-display-sm text-navy">Partner stories can live here next</h3>
            <p className="mt-4 text-body-md text-muted-foreground">
              This section is reserved for future testimony cards from partners whose lives have been
              strengthened through teaching, prayer, missions, community, and practical equipping.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-cream px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-body-sm font-semibold uppercase tracking-[0.18em] text-gold-text">FAQ</p>
          <h2 className="mt-3 font-display text-display-md text-navy">Common questions</h2>
          <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-card">
            {faqs.map((faq) => (
              <details key={faq.question} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-display text-body-lg text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400">
                  {faq.question}
                  <span className="text-gold-text transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-body-md text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-lg bg-navy p-8 text-center text-white shadow-xl md:p-12">
          <Users className="mx-auto h-10 w-10 text-gold" />
          <h2 className="mt-5 font-display text-display-md text-white">
            Help Us Build What God Is Establishing
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-body-lg text-navy-100">
            If you feel aligned with this assignment, we invite you to become a monthly Covenant Partner today.
          </p>
          <Button asChild size="xl" variant="gold" className="mt-8">
            <Link href="/give?frequency=monthly">
              Become a Covenant Partner
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
