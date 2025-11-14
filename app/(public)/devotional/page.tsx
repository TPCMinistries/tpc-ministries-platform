'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, BookOpen, Heart, Share2, ChevronLeft, ChevronRight, Bell } from 'lucide-react'
import Link from 'next/link'

export default function DevotionalPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [devotional, setDevotional] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch today's devotional from Streams of Grace
    fetchDevotional(currentDate)
  }, [currentDate])

  const fetchDevotional = async (date: Date) => {
    setLoading(true)
    // TODO: Replace with actual API call to fetch from Streams of Grace
    // For now, using placeholder data
    setTimeout(() => {
      setDevotional({
        id: '1',
        date: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        title: 'Flowing in God\'s Grace',
        scripture: 'John 7:38 - "Whoever believes in me, as Scripture has said, rivers of living water will flow from within them."',
        content: `Grace is not just a gift we receive; it's a river that flows through us to bless others. Like streams of water in a dry land, God's grace brings life, refreshment, and transformation wherever it flows.

Today, consider how God's grace has flowed into your life. Think about the ways He has been merciful, kind, and generous toward you. Now, ask yourself: how can I become a channel of that same grace to others?

When we allow God's grace to flow through us, we become springs of living water in a thirsty world. Our words bring life, our actions bring hope, and our presence brings peace. This is the beauty of living in the streams of grace - we are both receivers and givers of God's endless love.

Let the rivers of God's grace flow freely through you today. Don't hold back His goodness, but let it overflow to everyone you encounter.`,
        prayer: 'Heavenly Father, thank You for the streams of grace that flow into my life each day. Help me to be a channel of Your love and mercy to others. May Your grace overflow from my heart and touch everyone I meet today. In Jesus\' name, Amen.',
        reflection: [
          'How has God\'s grace impacted your life recently?',
          'Who in your life needs to experience God\'s grace through you today?',
          'What barriers prevent God\'s grace from flowing freely through you?'
        ]
      })
      setLoading(false)
    }, 500)
  }

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const goToNextDay = () => {
    const today = new Date()
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)

    // Don't go beyond today
    if (newDate <= today) {
      setCurrentDate(newDate)
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = currentDate.toDateString() === new Date().toDateString()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-4">
            <span className="inline-block bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-medium">
              Daily Devotional
            </span>
          </div>
          <h1 className="mb-6 font-serif text-5xl font-bold text-white md:text-6xl">
            Streams of Grace
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Daily refreshment for your soul - drink deeply from God's abundant grace
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Devotional */}
            <div className="lg:col-span-2 space-y-6">
              {/* Date Navigation */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousDay}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="text-center">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {currentDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      {!isToday && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={goToToday}
                          className="text-xs text-gold"
                        >
                          Go to Today
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextDay}
                      disabled={isToday}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {loading ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="animate-pulse space-y-4">
                      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : devotional ? (
                <>
                  {/* Devotional Content */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-3xl text-navy">{devotional.title}</CardTitle>
                      <CardDescription className="text-base">
                        <BookOpen className="h-4 w-4 inline mr-2" />
                        {devotional.scripture}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="prose max-w-none">
                        {devotional.content.split('\n\n').map((paragraph: string, index: number) => (
                          <p key={index} className="text-gray-700 leading-relaxed mb-4">
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      <div className="border-l-4 border-gold pl-6 bg-gold/5 py-4 rounded-r-lg">
                        <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                          <Heart className="h-5 w-5 text-gold" />
                          Prayer
                        </h3>
                        <p className="text-gray-700 italic">{devotional.prayer}</p>
                      </div>

                      <div className="bg-navy/5 p-6 rounded-lg">
                        <h3 className="font-semibold text-navy mb-4">Reflection Questions</h3>
                        <ul className="space-y-3">
                          {devotional.reflection.map((question: string, index: number) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-gold font-bold mt-1">•</span>
                              <span className="text-gray-700">{question}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-4 pt-4 border-t">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Heart className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600">No devotional available for this date.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Subscribe Card */}
              <Card className="border-2 border-gold/20">
                <CardHeader>
                  <CardTitle className="text-lg">Get Daily Devotionals</CardTitle>
                  <CardDescription>Never miss a day of encouragement</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/auth/signup">
                    <Button className="w-full bg-navy hover:bg-navy/90">
                      <Bell className="h-4 w-4 mr-2" />
                      Subscribe Free
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Delivered daily to your email and dashboard
                  </p>
                </CardContent>
              </Card>

              {/* About Streams of Grace */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About Streams of Grace</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Streams of Grace is a daily devotional series designed to refresh your spirit and deepen your walk with God. Each day brings fresh insights, practical application, and powerful prayer.
                  </p>
                  <Link href="/about">
                    <Button variant="outline" size="sm" className="w-full">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Devotionals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => {
                      const date = new Date()
                      date.setDate(date.getDate() - i)
                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentDate(date)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            date.toDateString() === currentDate.toDateString()
                              ? 'bg-navy text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <p className="text-sm font-medium">
                            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
