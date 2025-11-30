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
import { getRecentTeachings } from '@/lib/db/queries'
import { NewsletterSignupForms } from '@/components/newsletter-signup-forms'

export default async function HomePage() {
  const teachings = await getRecentTeachings(4).catch(() => [])
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
      <section className="bg-white px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-4xl font-bold text-tpc-navy md:text-5xl">
              Start Your Day With A Word In Season
            </h2>
            <p className="text-lg text-slate-600">
              Receive daily inspiration and biblical insights directly to your inbox
            </p>
          </div>

          <NewsletterSignupForms />
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
              Transformative teachings available for your spiritual growth
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teachings.length > 0 ? (
              teachings.map((teaching) => (
                <Link href={`/teachings/${teaching.id}`} key={teaching.id}>
                  <Card className="overflow-hidden bg-white/10 backdrop-blur border-tpc-gold/30 hover:border-tpc-gold transition-all cursor-pointer">
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-tpc-gold to-tpc-gold-accent">
                      {teaching.thumbnail_url ? (
                        <img
                          src={teaching.thumbnail_url}
                          alt={teaching.title}
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
                        {teaching.title}
                      </CardTitle>
                      <CardDescription className="text-tpc-gold/80">
                        {teaching.speaker}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full border-tpc-gold text-tpc-gold hover:bg-tpc-gold hover:text-tpc-navy">
                        Watch Now
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-4 text-center text-tpc-gold/60 py-12">
                <p>No teachings available yet. Check back soon!</p>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <Link href="/teachings">
              <Button size="lg" variant="outline" className="border-2 border-tpc-gold text-tpc-gold hover:bg-tpc-gold hover:text-tpc-navy">
                View Full Library
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Global Impact / Missions Section */}
      <section className="bg-tpc-beige px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-4xl font-bold text-tpc-navy md:text-5xl">
              Global Impact
            </h2>
            <p className="text-lg text-slate-700">
              Transforming communities across the nations
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Kenya */}
            <Link href="/missions/kenya">
              <Card className="group h-full cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="bg-gradient-to-br from-green-700 to-green-900 p-8 text-center">
                  <div className="mb-4 text-7xl">🇰🇪</div>
                  <h3 className="font-serif text-3xl font-bold text-white">Kenya</h3>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-tpc-navy">
                    Empowering Communities
                  </CardTitle>
                  <CardDescription className="text-base">
                    Through education, faith-based programs, and community development,
                    we're transforming lives across Kenya.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full text-tpc-navy group-hover:bg-tpc-navy/10">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* South Africa */}
            <Link href="/missions/south-africa">
              <Card className="group h-full cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-8 text-center">
                  <div className="mb-4 text-7xl">🇿🇦</div>
                  <h3 className="font-serif text-3xl font-bold text-white">South Africa</h3>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-tpc-navy">
                    Building Churches
                  </CardTitle>
                  <CardDescription className="text-base">
                    Planting churches, training leaders, and establishing strong faith
                    communities throughout South Africa.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full text-tpc-navy group-hover:bg-tpc-navy/10">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Grenada */}
            <Link href="/missions/grenada">
              <Card className="group h-full cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="bg-gradient-to-br from-red-600 to-red-800 p-8 text-center">
                  <div className="mb-4 text-7xl">🇬🇩</div>
                  <h3 className="font-serif text-3xl font-bold text-white">Grenada</h3>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-tpc-navy">
                    Serving Families
                  </CardTitle>
                  <CardDescription className="text-base">
                    Strengthening families, providing support, and building a strong
                    foundation of faith in Grenada.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full text-tpc-navy group-hover:bg-tpc-navy/10">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
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
              <Link href="/my-prayers">
                <Button size="lg" className="w-full bg-tpc-navy text-white hover:bg-tpc-navy/90 sm:w-auto">
                  Submit Prayer Request
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
