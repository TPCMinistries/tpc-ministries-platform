'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, ExternalLink, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function DevotionalRedirectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-white dark:bg-gray-800 shadow-xl border-0">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-navy dark:text-white mb-3">
            Devotionals Have Moved!
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Daily devotionals are now part of <strong className="text-gold">Streams of Grace</strong>,
            your daily companion for spiritual growth.
          </p>

          <div className="bg-navy/5 dark:bg-navy/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-navy dark:text-gold mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">What you'll find:</span>
            </div>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Daily Scripture readings</li>
              <li>• Prophetic devotionals</li>
              <li>• Reflection prompts</li>
              <li>• Spiritual growth tracking</li>
            </ul>
          </div>

          <a
            href="https://www.streamsofgrace.app"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button size="lg" className="w-full bg-gold hover:bg-gold-dark text-white mb-3">
              Open Streams of Grace
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </a>

          <Link href="/dashboard">
            <Button variant="ghost" className="text-gray-500">
              Return to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
