import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ArrowRight,
  Play,
  Globe,
  Heart,
  Users,
  BookOpen,
  Video,
  Laptop,
  Send,
  Mail,
  TrendingUp,
  Sparkles,
  ClipboardList
} from 'lucide-react'
import { getRecentTeachings, getPublicEbooks } from '@/lib/db/queries'

export default async function HomePage() {
  const teachings = await getRecentTeachings(4).catch(() => [])
  const ebooks = await getPublicEbooks(4).catch(() => [])
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-tpc-navy via-tpc-navy/95 to-tpc-navy/90 px-4 py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container relative mx-auto">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 font-serif text-5xl font-bold tracking-tight text-white md:text-7xl">
              Welcome to TPC Ministries
            </h1>
            <p className="mb-8 font-serif text-2xl text-tpc-gold md:text-3xl">
              Awakening Purpose. Igniting Vision.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/giving">
                <Button size="lg" className="w-full bg-tpc-gold-accent text-lg text-white hover:bg-tpc-gold-accent/90 sm:w-auto">
                  Give Now
                  <Heart className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-2 border-tpc-gold bg-transparent text-lg text-white hover:bg-tpc-gold/10 sm:w-auto"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="bg-white px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
            {/* TPC Logo */}
            <div className="flex justify-center">
              <div className="flex h-64 w-64 items-center justify-center rounded-full bg-tpc-navy shadow-2xl md:h-80 md:w-80">
                <div className="text-center">
                  <div className="mb-4 text-6xl font-bold text-tpc-gold md:text-7xl">✝</div>
                  <div className="font-serif text-3xl font-bold text-tpc-gold md:text-4xl">TPC</div>
                  <div className="font-serif text-xl text-tpc-gold">Ministries</div>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div>
              <h2 className="mb-6 font-serif text-4xl font-bold text-tpc-navy md:text-5xl">
                Our Mission
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-slate-700">
                To awaken purpose and ignite vision in every believer through transformative
                discipleship, biblical teaching, and global ministry. We are committed to
                empowering individuals to discover their divine calling and walk in the fullness
                of God's plan for their lives.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div className="text-center">
                  <div className="mb-2 font-serif text-4xl font-bold text-tpc-gold-accent">🇰🇪</div>
                  <div className="text-sm text-slate-600">Kenya Missions</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 font-serif text-4xl font-bold text-tpc-gold-accent">🇿🇦</div>
                  <div className="text-sm text-slate-600">South Africa Missions</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 font-serif text-4xl font-bold text-tpc-gold-accent">🇬🇩</div>
                  <div className="text-sm text-slate-600">Grenada Missions</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 font-serif text-4xl font-bold text-tpc-gold-accent">🙏</div>
                  <div className="text-sm text-slate-600">In-Person Gatherings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Ministry Section */}
      <section className="bg-tpc-beige px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-4xl font-bold text-tpc-navy md:text-5xl">
              Reaching the World for Christ
            </h2>
            <p className="text-xl text-slate-700">Through Digital Ministry</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Virtual Discipleship */}
            <Link href="/teachings">
              <Card className="group h-full cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-tpc-navy">
                    <BookOpen className="h-8 w-8 text-tpc-gold" />
                  </div>
                  <CardTitle className="font-serif text-2xl text-tpc-navy">
                    Virtual Discipleship
                  </CardTitle>
                  <CardDescription className="text-base">
                    Access comprehensive biblical teachings, interactive courses, and mentorship
                    programs designed to deepen your faith journey from anywhere in the world.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-tpc-gold-accent group-hover:translate-x-2 transition-transform">
                    <span className="font-medium">Explore Teachings</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Online Engagement */}
            <Link href="/auth/signup">
              <Card className="group h-full cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-tpc-navy">
                    <Video className="h-8 w-8 text-tpc-gold" />
                  </div>
                  <CardTitle className="font-serif text-2xl text-tpc-navy">
                    Online Engagement
                  </CardTitle>
                  <CardDescription className="text-base">
                    Join live worship services, prayer meetings, and community gatherings.
                    Connect with believers globally and build meaningful relationships.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-tpc-gold-accent group-hover:translate-x-2 transition-transform">
                    <span className="font-medium">Join Community</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Digital Empowerment */}
            <Link href="/auth/signup">
              <Card className="group h-full cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-tpc-navy">
                    <Laptop className="h-8 w-8 text-tpc-gold" />
                  </div>
                  <CardTitle className="font-serif text-2xl text-tpc-navy">
                    Digital Empowerment
                  </CardTitle>
                  <CardDescription className="text-base">
                    Access tools, resources, and training to grow spiritually, develop leadership
                    skills, and fulfill your divine calling in the digital age.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-tpc-gold-accent group-hover:translate-x-2 transition-transform">
                    <span className="font-medium">Get Empowered</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Daily Devotional Section */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-tpc-gold/20 rounded-full px-4 py-2 mb-6">
                  <Sparkles className="h-4 w-4 text-tpc-gold-accent" />
                  <span className="text-tpc-gold-accent text-sm font-medium">Daily Devotional</span>
                </div>
                <h2 className="mb-4 font-serif text-4xl font-bold text-tpc-navy md:text-5xl">
                  Start Your Day With A Word In Season
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  Begin each morning with fresh biblical insights, prophetic encouragement,
                  and practical wisdom through our daily devotional platform.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="flex-shrink-0 w-6 h-6 bg-tpc-gold/20 rounded-full flex items-center justify-center">
                      <BookOpen className="h-3 w-3 text-tpc-gold-accent" />
                    </div>
                    <span>Fresh daily devotionals & prophetic words</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="flex-shrink-0 w-6 h-6 bg-tpc-gold/20 rounded-full flex items-center justify-center">
                      <Heart className="h-3 w-3 text-tpc-gold-accent" />
                    </div>
                    <span>Scripture-based encouragement for your journey</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="flex-shrink-0 w-6 h-6 bg-tpc-gold/20 rounded-full flex items-center justify-center">
                      <Users className="h-3 w-3 text-tpc-gold-accent" />
                    </div>
                    <span>Join a growing community of believers</span>
                  </div>
                </div>
                <a href="https://www.streamsofgrace.app" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-tpc-gold-accent hover:bg-tpc-gold-accent/90 text-white font-bold">
                    Visit Streams of Grace
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>

              {/* Visual */}
              <div className="relative">
                <div className="bg-gradient-to-br from-tpc-navy to-tpc-navy/80 rounded-2xl p-8 shadow-2xl">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-tpc-gold/20 rounded-full mb-6">
                      <BookOpen className="h-10 w-10 text-tpc-gold" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white mb-2">
                      Streams of Grace
                    </h3>
                    <p className="text-tpc-gold mb-6">Daily Devotional App</p>
                    <div className="bg-white/10 rounded-xl p-4 text-left">
                      <p className="text-white/60 text-xs uppercase tracking-wider mb-2">Today's Word</p>
                      <p className="text-white italic">
                        "For I know the plans I have for you, declares the Lord,
                        plans to prosper you and not to harm you, plans to give you
                        hope and a future."
                      </p>
                      <p className="text-tpc-gold text-sm mt-2">— Jeremiah 29:11</p>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-tpc-gold/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-200/50 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Written Works Section */}
      <section className="bg-gradient-to-br from-tpc-navy to-tpc-navy/90 px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-4xl font-bold text-white md:text-5xl">
              Written Works
            </h2>
            <p className="text-lg text-tpc-gold">
              Ebooks and resources for your spiritual growth
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ebooks.length > 0 ? (
              ebooks.map((ebook) => (
                <Link href={`/ebooks/${ebook.id}`} key={ebook.id}>
                  <Card className="overflow-hidden bg-white/10 backdrop-blur border-tpc-gold/30 hover:border-tpc-gold transition-all cursor-pointer">
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-tpc-gold to-tpc-gold-accent">
                      {ebook.thumbnail_url ? (
                        <img
                          src={ebook.thumbnail_url}
                          alt={ebook.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-20 w-20 text-white/50" />
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="font-serif text-white line-clamp-2">
                        {ebook.title}
                      </CardTitle>
                      {ebook.author && (
                        <CardDescription className="text-tpc-gold/80">
                          {ebook.author}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full border-tpc-gold text-tpc-gold hover:bg-tpc-gold hover:text-tpc-navy">
                        Read Now
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-4 text-center text-tpc-gold/60 py-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Ebooks coming soon! Check back for new resources.</p>
              </div>
            )}
          </div>

          {ebooks.length > 0 && (
            <div className="mt-12 text-center">
              <Link href="/ebooks">
                <Button size="lg" variant="outline" className="border-2 border-tpc-gold text-tpc-gold hover:bg-tpc-gold hover:text-tpc-navy">
                  View All Ebooks
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Kenya Mission Trip Section */}
      <section className="bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 px-4 py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Globe className="h-4 w-4 text-amber-300" />
                <span className="text-amber-200 text-sm font-medium">Global Impact 2026</span>
              </div>

              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                Answer the Call to
                <span className="block text-amber-300">Kenya</span>
              </h2>

              <p className="text-xl text-amber-100/90 mb-6 leading-relaxed">
                Join TPC Ministries on a life-changing 17-day Kingdom Impact Trip
                to Kenya. Serve in ministry, education, medical missions, and business
                development across three cities.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">April 22</div>
                  <div className="text-amber-200/70 text-sm">May 8, 2026</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">3 Cities</div>
                  <div className="text-amber-200/70 text-sm">Nairobi • Mombasa • Kakamega</div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-amber-100">
                  <Heart className="h-5 w-5 text-amber-400" />
                  <span>6 Service Tracks to match your gifts</span>
                </div>
                <div className="flex items-center gap-3 text-amber-100">
                  <Users className="h-5 w-5 text-amber-400" />
                  <span>All-inclusive experience with safari</span>
                </div>
                <div className="flex items-center gap-3 text-amber-100">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  <span>Scholarships available</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/kenya">
                  <Button size="lg" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold">
                    Learn More & Apply
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/kenya/give">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10">
                    <Heart className="mr-2 h-5 w-5" />
                    Support the Mission
                  </Button>
                </Link>
              </div>
            </div>

            {/* Trip Flier */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-transparent rounded-3xl blur-2xl"></div>
                <Link href="/kenya" className="block relative">
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:border-amber-400/50 transition-colors">
                    <img
                      src="/images/kenya/kenya-flier.png"
                      alt="Kenya Kingdom Impact Trip 2026"
                      className="rounded-xl shadow-2xl w-full"
                    />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Giving Section */}
      <section className="bg-gradient-to-r from-tpc-gold-accent to-amber-600 px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 font-serif text-4xl font-bold text-white md:text-5xl">
              Be the Change - Your Kindness Makes a Difference
            </h2>
            <p className="mb-8 text-lg text-white/90 md:text-xl">
              Your generous support enables us to transform lives, spread the Gospel, and make an eternal impact across Kenya, South Africa, and Grenada.
            </p>

            <Link href="/giving">
              <Button
                size="lg"
                className="bg-tpc-navy text-lg text-white hover:bg-tpc-navy/90"
              >
                Donate Now
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Assessments Section */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="mb-4 font-serif text-4xl font-bold text-tpc-navy md:text-5xl">
              Discover Your God-Given Design
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Take our free assessments to uncover your spiritual gifts, calling, and purpose
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="border-2 border-purple-200 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-4">
                  <ClipboardList className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-tpc-navy">Spiritual Gifts</CardTitle>
                <CardDescription>
                  Discover the unique abilities God has given you to serve His kingdom
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/assessments/spiritual-gifts">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Take Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-tpc-navy">Seasonal Assessment</CardTitle>
                <CardDescription>
                  Understand your current spiritual season and get tailored guidance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/assessments/seasonal">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Take Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-gold/30 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 mb-4">
                  <Sparkles className="h-6 w-6 text-gold" />
                </div>
                <CardTitle className="text-tpc-navy">Ministry Calling</CardTitle>
                <CardDescription>
                  Find your specific calling and get matched with ministry opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/assessments/ministry-calling">
                  <Button className="w-full bg-tpc-gold-accent hover:bg-tpc-gold-accent/90">
                    Take Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/assessments">
              <Button variant="outline" size="lg" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50">
                View All 6 Assessments
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact/Connection Section */}
      <section className="bg-white px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-6 font-serif text-4xl font-bold text-tpc-navy md:text-5xl">
              Let's Stay Connected
            </h2>
            <p className="mb-8 text-lg text-slate-700">
              We'd love to hear from you. Share your prayer requests, testimonies, or questions with us.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/contact">
                <Button size="lg" className="w-full bg-tpc-navy text-white hover:bg-tpc-navy/90 sm:w-auto">
                  Contact Us
                  <Send className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-2 border-tpc-navy text-tpc-navy hover:bg-tpc-navy/10 sm:w-auto"
                >
                  Join Our Community
                  <Users className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
