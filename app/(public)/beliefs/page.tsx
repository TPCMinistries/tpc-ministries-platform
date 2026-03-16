'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Book,
  Cross,
  Heart,
  Users,
  Sparkles,
  Globe,
  Shield,
  ArrowRight,
  ChevronDown
} from 'lucide-react'
import { useState } from 'react'

interface BeliefSection {
  id: string
  title: string
  icon: React.ReactNode
  summary: string
  details: string[]
  scriptures: string[]
}

const beliefs: BeliefSection[] = [
  {
    id: 'scripture',
    title: 'The Holy Scriptures',
    icon: <Book className="h-8 w-8" />,
    summary: 'We believe the Bible is the inspired, infallible Word of God and the supreme authority in all matters of faith and conduct.',
    details: [
      'The Bible is divinely inspired by God through the Holy Spirit',
      'Scripture is without error in its original manuscripts',
      'The Bible is the final authority for faith, doctrine, and practice',
      'Both Old and New Testaments are equally inspired'
    ],
    scriptures: ['2 Timothy 3:16-17', '2 Peter 1:20-21', 'Psalm 119:105']
  },
  {
    id: 'god',
    title: 'The Triune God',
    icon: <Sparkles className="h-8 w-8" />,
    summary: 'We believe in one God, eternally existing in three persons: Father, Son, and Holy Spirit\u2014equal in power and glory.',
    details: [
      'God is eternal, all-powerful, all-knowing, and ever-present',
      'The Father is the source of all creation and the one who sent the Son',
      'The Son, Jesus Christ, is fully God and fully man',
      'The Holy Spirit is a divine person who convicts, regenerates, and empowers believers'
    ],
    scriptures: ['Matthew 28:19', 'John 1:1-3', '2 Corinthians 13:14']
  },
  {
    id: 'jesus',
    title: 'Jesus Christ',
    icon: <Cross className="h-8 w-8" />,
    summary: 'We believe Jesus Christ is the Son of God who came in human flesh, died for our sins, rose bodily from the dead, and is coming again.',
    details: [
      'Born of a virgin, Jesus lived a sinless life',
      'He died on the cross as a substitutionary sacrifice for our sins',
      'He rose bodily from the dead on the third day',
      'He ascended to heaven and sits at the right hand of the Father',
      'He will return personally and visibly to establish His kingdom'
    ],
    scriptures: ['John 3:16', 'Romans 5:8', '1 Corinthians 15:3-4', 'Acts 1:11']
  },
  {
    id: 'salvation',
    title: 'Salvation',
    icon: <Heart className="h-8 w-8" />,
    summary: 'We believe salvation is a gift of God received through faith in Jesus Christ alone, not by works, but resulting in a transformed life.',
    details: [
      'All people are sinners in need of salvation',
      'Salvation is by grace alone through faith alone in Christ alone',
      'Repentance and faith are necessary for salvation',
      'Believers are justified, adopted as children, and given eternal life',
      'True faith produces good works as evidence of salvation'
    ],
    scriptures: ['Ephesians 2:8-9', 'Romans 10:9-10', 'John 14:6', 'Titus 3:5']
  },
  {
    id: 'holy-spirit',
    title: 'The Holy Spirit',
    icon: <Sparkles className="h-8 w-8" />,
    summary: 'We believe the Holy Spirit indwells every believer, empowering them for godly living and equipping them with gifts for ministry.',
    details: [
      'The Holy Spirit convicts the world of sin, righteousness, and judgment',
      'He regenerates, indwells, and seals every believer at salvation',
      'He produces spiritual fruit in the lives of believers',
      'He gives spiritual gifts to every believer for the edification of the body',
      'We believe in the present-day operation of all spiritual gifts'
    ],
    scriptures: ['John 16:8-11', 'Galatians 5:22-23', '1 Corinthians 12:4-11']
  },
  {
    id: 'church',
    title: 'The Church',
    icon: <Users className="h-8 w-8" />,
    summary: 'We believe the Church is the body of Christ, composed of all believers, called to worship God, make disciples, and demonstrate His love.',
    details: [
      'The universal Church includes all believers throughout history',
      'The local church is a visible expression of the body of Christ',
      'Believers are called to gather regularly for worship, teaching, and fellowship',
      'The Church is commissioned to make disciples of all nations',
      'Water baptism and communion are ordinances given to the Church'
    ],
    scriptures: ['Matthew 16:18', 'Ephesians 4:11-16', 'Hebrews 10:24-25', 'Matthew 28:19-20']
  },
  {
    id: 'future',
    title: 'Future Things',
    icon: <Globe className="h-8 w-8" />,
    summary: 'We believe in the personal, visible return of Jesus Christ, the bodily resurrection of believers, and eternal life with God.',
    details: [
      'Jesus Christ will return personally and visibly',
      'There will be a bodily resurrection of both the saved and the lost',
      'Believers will spend eternity in the presence of God',
      'Unbelievers will face eternal separation from God',
      'God will create new heavens and a new earth'
    ],
    scriptures: ['1 Thessalonians 4:16-17', 'Revelation 21:1-4', 'John 14:2-3']
  }
]

export default function BeliefsPage() {
  const [expandedBelief, setExpandedBelief] = useState<string | null>(null)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />

        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <p className="mb-6 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Our Foundation
          </p>
          <h1 className="mb-6 font-display text-display-xl md:text-display-2xl text-white">
            Statement of Faith
          </h1>
          <p className="mx-auto max-w-2xl text-body-xl text-white/50">
            The foundational beliefs that guide our ministry and unite us as a community of faith.
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Introduction */}
      <section className="border-b border-border bg-secondary/50 px-4 py-section-sm">
        <div className="container mx-auto max-w-4xl text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-gold" />
          <h2 className="mb-4 font-display text-display-sm text-navy dark:text-white">
            Grounded in Scripture, United in Christ
          </h2>
          <p className="text-body-lg leading-relaxed text-muted-foreground">
            At TPC Ministries, we hold firmly to the historic Christian faith as revealed in the Holy Scriptures.
            These beliefs are not mere traditions but living truths that shape how we worship,
            serve, and engage with the world around us. We invite you to explore what we believe and why it matters.
          </p>
        </div>
      </section>

      {/* Beliefs Grid */}
      <section className="px-4 py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="space-y-6">
            {beliefs.map((belief) => (
              <div
                key={belief.id}
                className={`cursor-pointer rounded-3xl border bg-card p-6 transition-all duration-300 ${
                  expandedBelief === belief.id ? 'border-gold/30 shadow-xl' : 'border-border hover:border-gold/20 hover:shadow-md'
                }`}
                onClick={() => setExpandedBelief(expandedBelief === belief.id ? null : belief.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-xl p-3 transition-colors ${
                    expandedBelief === belief.id ? 'bg-gold text-navy-950' : 'bg-navy/10 text-navy dark:bg-white/5 dark:text-gold'
                  }`}>
                    {belief.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="mb-2 font-display text-display-xs text-navy dark:text-white">{belief.title}</h3>
                        <p className="text-body-md text-muted-foreground">{belief.summary}</p>
                      </div>
                      <ChevronDown className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform ${
                        expandedBelief === belief.id ? 'rotate-180 text-gold' : ''
                      }`} />
                    </div>

                    {expandedBelief === belief.id && (
                      <div className="mt-6 border-t border-border pt-6">
                        <h4 className="mb-3 font-display text-body-md font-semibold text-navy dark:text-white">What We Believe:</h4>
                        <ul className="mb-6 space-y-2">
                          {belief.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-body-md text-muted-foreground">
                              <span className="mt-1 text-gold">&bull;</span>
                              {detail}
                            </li>
                          ))}
                        </ul>

                        <h4 className="mb-3 font-display text-body-md font-semibold text-navy dark:text-white">Scripture References:</h4>
                        <div className="flex flex-wrap gap-2">
                          {belief.scriptures.map((scripture, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-navy/10 px-3 py-1 text-body-sm text-navy dark:bg-white/10 dark:text-white"
                            >
                              {scripture}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apostles Creed */}
      <section className="bg-navy dark:bg-navy-950 px-4 py-section">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Historic Faith
          </p>
          <h2 className="mb-4 font-display text-display-md text-white">The Apostles&apos; Creed</h2>
          <p className="mb-8 text-body-md italic text-white/40">
            We affirm the historic Christian faith as expressed in the Apostles&apos; Creed:
          </p>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-left">
            <p className="text-body-lg leading-relaxed text-white/70">
              I believe in God, the Father Almighty, Creator of heaven and earth.
            </p>
            <p className="mt-4 text-body-lg leading-relaxed text-white/70">
              I believe in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit,
              born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried;
              He descended to the dead. On the third day He rose again; He ascended into heaven,
              He is seated at the right hand of the Father, and He will come to judge the living and the dead.
            </p>
            <p className="mt-4 text-body-lg leading-relaxed text-white/70">
              I believe in the Holy Spirit, the holy catholic Church, the communion of saints,
              the forgiveness of sins, the resurrection of the body, and the life everlasting.
            </p>
            <p className="mt-4 font-display text-display-xs text-gold">Amen.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-navy-950 px-4 py-section-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />

        <div className="container relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Questions?
          </p>
          <h2 className="mb-6 font-display text-display-md md:text-display-lg text-white">
            Questions About Our Beliefs?
          </h2>
          <p className="mb-10 text-body-xl text-white/50">
            We&apos;d love to discuss faith with you. Join us for a service or reach out directly.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/visit">
              <Button variant="glow" size="xl">
                Plan Your Visit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="xl"
                className="border-2 border-gold/30 text-white hover:bg-gold/10"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
