import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Gift,
  Compass,
  Eye,
  Heart,
  Crown,
  TreePine,
  Clock,
  Users,
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
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      duration: '15 minutes',
      badge: 'Most Popular',
      badgeColor: 'bg-gold text-white',
    },
    {
      id: '2',
      slug: 'seasonal',
      title: 'Seasonal Assessment',
      description: 'Understand your current spiritual season and receive tailored guidance for your journey',
      icon: Compass,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      duration: '10 minutes',
      badge: 'Start Here',
      badgeColor: 'bg-navy text-white',
    },
    {
      id: '3',
      slug: 'prophetic-expression',
      title: 'Prophetic Expression Assessment',
      description: 'Discover how God uniquely speaks through you and learn to steward your prophetic expression',
      icon: Eye,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      duration: '12 minutes',
    },
    {
      id: '4',
      slug: 'ministry-calling',
      title: 'Ministry Calling Assessment',
      description: 'Find your specific calling and get matched with ministry opportunities that fit your design',
      icon: Heart,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      duration: '15 minutes',
    },
    {
      id: '5',
      slug: 'redemptive-gifts',
      title: 'Redemptive Gifts Assessment',
      description: 'Discover how you process the world and relate to others based on Romans 12 framework',
      icon: Crown,
      iconColor: 'text-gold',
      bgColor: 'bg-gold/10',
      borderColor: 'border-gold/30',
      duration: '18 minutes',
      note: 'Based on Romans 12:6-8 framework',
    },
    {
      id: '6',
      slug: 'spiritual-maturity',
      title: 'Spiritual Maturity Assessment',
      description: 'Evaluate your spiritual growth and receive a personalized development plan for your next steps',
      icon: TreePine,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      duration: '12 minutes',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gold/20">
            <Sparkles className="h-10 w-10 text-gold" />
          </div>
          <h1 className="mb-4 font-serif text-5xl font-bold text-white md:text-6xl">
            Discover Your Spiritual Design
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            Take free, biblically-based assessments to understand how God uniquely created you for His purposes
          </p>
          <p className="text-lg text-gray-400 mb-8">
            Discover your calling, spiritual gifts, and divine design
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-white/90 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-gold" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-gold" />
              <span>Biblically Grounded</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-gold" />
              <span>Personalized Results</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-gold" />
              <span>No Account Required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Take Assessments */}
      <section className="px-4 py-12 bg-white border-y">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-navy text-center mb-12">
            Why Take These Assessments?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Gift className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-3">Know Your Design</h3>
              <p className="text-gray-600">
                God created you with unique gifts, abilities, and perspectives. Understanding these helps you walk confidently in your calling and serve effectively in His kingdom.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Compass className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-3">Find Your Path</h3>
              <p className="text-gray-600">
                Whether you're new in faith or seasoned in ministry, these assessments provide clarity on where you are and where God is leading you next in your spiritual journey.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
                <Heart className="h-8 w-8 text-gold" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-3">Serve with Purpose</h3>
              <p className="text-gray-600">
                Discover where and how you're called to serve. Get matched with ministry opportunities that align with your God-given design and see greater fruit in your labor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Grid */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">Choose Your Assessment</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Each assessment is designed to reveal different aspects of how God created you. Take one or take them all—they build on each other to give you a complete picture.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assessments.map((assessment) => {
              const Icon = assessment.icon
              return (
                <Card
                  key={assessment.id}
                  className={`relative overflow-hidden border-2 ${assessment.borderColor} hover:shadow-xl transition-all duration-300 group`}
                >
                  {assessment.badge && (
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${assessment.badgeColor}`}>
                      {assessment.badge}
                    </div>
                  )}

                  <CardHeader className={`${assessment.bgColor} pb-4`}>
                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${assessment.bgColor} border-2 ${assessment.borderColor}`}>
                      <Icon className={`h-8 w-8 ${assessment.iconColor}`} />
                    </div>
                    <CardTitle className="text-xl text-navy text-center">
                      {assessment.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-6 space-y-4">
                    <p className="text-gray-700 text-center min-h-[3rem]">
                      {assessment.description}
                    </p>

                    {assessment.note && (
                      <p className="text-sm text-gray-600 text-center italic">
                        {assessment.note}
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{assessment.duration}</span>
                    </div>

                    <Link href={`/assessments/${assessment.slug}`}>
                      <Button className="w-full bg-navy hover:bg-navy/90 group-hover:bg-gold group-hover:text-white transition-colors">
                        Start Assessment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center max-w-3xl mx-auto">
            <Card className="border-2 border-gold/20 bg-gold/5">
              <CardContent className="pt-6">
                <p className="text-lg text-gray-700 mb-4">
                  All assessments are <span className="font-semibold text-navy">completely free</span>.
                </p>
                <p className="text-gray-600 mb-6">
                  Create an account to save your results and get personalized recommendations tailored to your spiritual journey.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link href="/auth/signup">
                    <Button size="lg" className="bg-gold hover:bg-gold-dark text-white">
                      Create Free Account
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-navy text-center mb-12">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-navy mb-2">Choose an Assessment</h3>
              <p className="text-gray-600">
                Select the assessment that resonates with where you are in your journey
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-navy mb-2">Answer Honestly</h3>
              <p className="text-gray-600">
                Take your time with each question. There are no wrong answers—be authentic
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-navy mb-2">Get Your Results</h3>
              <p className="text-gray-600">
                Receive personalized insights, biblical foundation, and practical next steps
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why These Assessments Matter */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Biblical Foundation
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-center italic text-gold mb-6">
              "Now there are varieties of gifts, but the same Spirit; and there are varieties of service, but the same Lord" - 1 Corinthians 12:4-5
            </p>
            <p className="text-center">
              These assessments are designed to help you understand how God has uniquely created and called you. Whether you're just beginning your spiritual journey or have been walking with God for years, understanding your design helps you serve more effectively and walk more confidently in your calling.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
