'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Sun,
  Moon,
  Sunrise,
  BookOpen,
  Heart,
  Wind,
  Sparkles,
  ExternalLink,
  Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DailyHub() {
  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { greeting: 'Good Morning', icon: Sunrise, period: 'morning' }
    if (hour < 17) return { greeting: 'Good Afternoon', icon: Sun, period: 'afternoon' }
    return { greeting: 'Good Evening', icon: Moon, period: 'evening' }
  }

  const { greeting, icon: TimeIcon, period } = getTimeOfDay()

  const features = [
    { icon: BookOpen, label: 'Daily Devotionals', color: 'text-amber-400' },
    { icon: Heart, label: 'Prayer Wall', color: 'text-pink-400' },
    { icon: Wind, label: 'Breath Prayer', color: 'text-blue-400' },
    { icon: Sparkles, label: 'Spiritual Garden', color: 'text-green-400' },
  ]

  return (
    <Card className="col-span-full lg:col-span-2 bg-gradient-to-br from-tpc-navy via-tpc-navy to-tpc-navy/95 text-white overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-tpc-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-tpc-gold/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <CardContent className="p-6 relative">
        {/* Greeting header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={cn(
            "p-3 rounded-full",
            period === 'morning' ? 'bg-amber-500/20' : period === 'afternoon' ? 'bg-yellow-500/20' : 'bg-indigo-500/20'
          )}>
            <TimeIcon className={cn(
              "h-6 w-6",
              period === 'morning' ? 'text-amber-400' : period === 'afternoon' ? 'text-yellow-400' : 'text-indigo-400'
            )} />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold">{greeting}!</h2>
            <p className="text-white/70">Start your day with intention</p>
          </div>
        </div>

        {/* Streams of Grace Promo */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-5 mb-5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-tpc-gold to-amber-500 rounded-xl shadow-lg">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">Streams of Grace</h3>
              <p className="text-white/70 text-sm mb-3">
                Your daily companion for spiritual growth. Devotionals, prayer practices, and more.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {features.map((feature) => (
                  <div key={feature.label} className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-xs">
                    <feature.icon className={cn("h-3 w-3", feature.color)} />
                    <span className="text-white/90">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a
              href="https://www.streamsofgrace.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full bg-tpc-gold text-tpc-navy hover:bg-tpc-gold/90 font-semibold">
                <BookOpen className="h-4 w-4 mr-2" />
                Open Streams of Grace
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </a>
            <a
              href="https://www.streamsofgrace.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30">
                <Smartphone className="h-4 w-4 mr-2" />
                Get the App
              </Button>
            </a>
          </div>
        </div>

        {/* Quick spiritual thought */}
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-white/60 text-xs uppercase tracking-wide mb-2">Daily Encouragement</p>
          <p className="text-white/90 font-serif italic">
            "Draw near to God and He will draw near to you."
          </p>
          <p className="text-tpc-gold text-sm mt-1">— James 4:8</p>
        </div>
      </CardContent>
    </Card>
  )
}
