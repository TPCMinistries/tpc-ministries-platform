'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    summary: 'We believe in one God, eternally existing in three persons: Father, Son, and Holy Spirit—equal in power and glory.',
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
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-6 font-serif text-5xl font-bold text-white md:text-6xl">
            Statement of Faith
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The foundational beliefs that guide our ministry and unite us as a community of faith.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="px-4 py-12 bg-gradient-to-br from-gold/10 to-amber-50">
        <div className="container mx-auto max-w-4xl text-center">
          <Shield className="h-12 w-12 text-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-navy mb-4">
            Grounded in Scripture, United in Christ
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            At TPC Ministries, we hold firmly to the historic Christian faith as revealed in the Holy Scriptures.
            These beliefs are not mere traditions but living truths that shape how we worship,
            serve, and engage with the world around us. We invite you to explore what we believe and why it matters.
          </p>
        </div>
      </section>

      {/* Beliefs Grid */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="space-y-6">
            {beliefs.map((belief) => (
              <Card
                key={belief.id}
                className={`cursor-pointer transition-all ${
                  expandedBelief === belief.id ? 'shadow-lg ring-2 ring-gold/30' : 'hover:shadow-md'
                }`}
                onClick={() => setExpandedBelief(expandedBelief === belief.id ? null : belief.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      expandedBelief === belief.id ? 'bg-gold text-navy' : 'bg-navy/10 text-navy'
                    } transition-colors`}>
                      {belief.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-navy mb-2">{belief.title}</h3>
                          <p className="text-gray-600">{belief.summary}</p>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
                          expandedBelief === belief.id ? 'rotate-180 text-gold' : ''
                        }`} />
                      </div>

                      {expandedBelief === belief.id && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="font-semibold text-navy mb-3">What We Believe:</h4>
                          <ul className="space-y-2 mb-6">
                            {belief.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-600">
                                <span className="text-gold mt-1">•</span>
                                {detail}
                              </li>
                            ))}
                          </ul>

                          <h4 className="font-semibold text-navy mb-3">Scripture References:</h4>
                          <div className="flex flex-wrap gap-2">
                            {belief.scriptures.map((scripture, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-navy/10 text-navy rounded-full text-sm"
                              >
                                {scripture}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Apostles Creed */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-navy mb-6">The Apostles' Creed</h2>
          <p className="text-gray-500 mb-6 italic">
            We affirm the historic Christian faith as expressed in the Apostles' Creed:
          </p>
          <Card className="text-left">
            <CardContent className="p-8">
              <p className="text-gray-700 leading-relaxed text-lg">
                I believe in God, the Father Almighty, Creator of heaven and earth.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg mt-4">
                I believe in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit,
                born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried;
                He descended to the dead. On the third day He rose again; He ascended into heaven,
                He is seated at the right hand of the Father, and He will come to judge the living and the dead.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg mt-4">
                I believe in the Holy Spirit, the holy catholic Church, the communion of saints,
                the forgiveness of sins, the resurrection of the body, and the life everlasting.
              </p>
              <p className="text-navy font-semibold text-lg mt-4">Amen.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-br from-navy to-navy-800">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Questions About Our Beliefs?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            We'd love to discuss faith with you. Join us for a service or reach out directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/visit">
              <Button size="lg" className="bg-gold text-navy hover:bg-gold/90">
                Plan Your Visit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
