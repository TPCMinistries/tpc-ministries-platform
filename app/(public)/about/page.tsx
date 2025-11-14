import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Heart, Globe, Users, Award, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-6 font-serif text-5xl font-bold text-white md:text-6xl">
            About TPC Ministries
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transforming lives through Christ-centered teaching, discipleship, and global missions
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-4">Our Mission</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                TPC Ministries exists to empower believers to discover their God-given purpose and
                walk in their calling through transformative biblical teaching, authentic community,
                in-person gatherings, and practical discipleship.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                We believe that every person has a unique role in advancing God's kingdom, and we're
                committed to providing the resources, online tools, in-person community, and guidance needed to fulfill that calling.
              </p>
            </div>
            <div className="bg-gradient-to-br from-navy/5 to-gold/5 rounded-xl p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-navy rounded-full p-3">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Faith-Centered</h3>
                    <p className="text-gray-600">Rooted in biblical truth and powered by the Holy Spirit</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-gold rounded-full p-3">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Global Impact</h3>
                    <p className="text-gray-600">Reaching nations through missions and partnerships</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-navy rounded-full p-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Community Driven</h3>
                    <p className="text-gray-600">Building authentic relationships and accountability</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-navy mb-12 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="bg-navy/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-navy" />
                </div>
                <h3 className="text-xl font-semibold text-navy mb-3">Excellence</h3>
                <p className="text-gray-600">
                  We pursue excellence in all we do, honoring God through quality teaching,
                  thoughtful content, and impactful ministry.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="bg-gold/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-xl font-semibold text-navy mb-3">Community</h3>
                <p className="text-gray-600">
                  We believe in the power of authentic community—both online and in-person—where believers can grow
                  together, support one another, and multiply impact.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="bg-navy/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-navy" />
                </div>
                <h3 className="text-xl font-semibold text-navy mb-3">Global Vision</h3>
                <p className="text-gray-600">
                  We're committed to reaching nations and making disciples across cultures,
                  breaking barriers through the love of Christ.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-navy mb-12 text-center">Our Leadership</h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-32 h-32 bg-navy/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-navy">LD</span>
                </div>
                <h3 className="text-xl font-semibold text-navy mb-1">Prophet Lorenzo Daughtry-Chambers</h3>
                <p className="text-gold font-medium mb-3">Founder & Lead Pastor</p>
                <p className="text-gray-600 text-sm">
                  Passionate about equipping believers to discover and walk in their God-given purpose through prophetic insight and transformative teaching.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-32 h-32 bg-gold/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gold">SD</span>
                </div>
                <h3 className="text-xl font-semibold text-navy mb-1">Prophetess Sarah Daughtry-Chambers</h3>
                <p className="text-gold font-medium mb-3">Co-Founder & Minister</p>
                <p className="text-gray-600 text-sm">
                  Leading spiritual formation and discipleship initiatives with prophetic wisdom and pastoral care across our community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-br from-navy to-navy-800">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Us on This Journey
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Be part of a community that's transforming lives and impacting nations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-navy hover:bg-gray-100">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/partner">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Become a Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
