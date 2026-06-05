"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { 
  Sun, Moon, CloudSun, PenLine, Heart, Gift, 
  Sparkles, Calendar, ChevronRight, Play, 
  Flame, BookOpen, Users
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface TodayDashboardProps {
  member: {
    first_name: string
    last_name?: string
    role?: string
    tier?: string
    avatar_url?: string
  }
  stats?: {
    journalStreak?: number
    prayerRequests?: number
    givingThisMonth?: number
    teachingsWatched?: number
  }
  verseOfDay?: {
    text: string
    reference: string
  }
  newProphecy?: {
    id: string
    title: string
    preview: string
  }
  upcomingEvent?: {
    id: string
    title: string
    date: string
    time: string
  }
  continueWatching?: {
    id: string
    title: string
    progress: number
    thumbnail?: string
  }
}

function getGreeting(): { text: string; icon: React.ElementType } {
  const hour = new Date().getHours()
  if (hour < 12) return { text: "Good Morning", icon: Sun }
  if (hour < 17) return { text: "Good Afternoon", icon: CloudSun }
  return { text: "Good Evening", icon: Moon }
}

function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

export function TodayDashboard({
  member,
  stats = {},
  verseOfDay,
  newProphecy,
  upcomingEvent,
  continueWatching,
}: TodayDashboardProps) {
  const greeting = getGreeting()
  const GreetingIcon = greeting.icon
  const dayOfYear = getDayOfYear()
  const shouldReduceMotion = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      className="space-y-6 pb-24 lg:pb-8"
      variants={shouldReduceMotion ? undefined : containerVariants}
      initial={shouldReduceMotion ? undefined : "hidden"}
      animate={shouldReduceMotion ? undefined : "visible"}
    >
      {/* Hero Greeting */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-tpc-navy to-tpc-navy/90 text-white p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-tpc-gold/80 mb-2">
            <GreetingIcon className="h-5 w-5" />
            <span className="text-sm font-medium">{greeting.text}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-serif font-bold mb-2">
            {member.first_name}
          </h1>
          <p className="text-white/70">
            Day {dayOfYear} of your spiritual journey
          </p>
        </div>
      </motion.div>

      {/* Verse of the Day */}
      {verseOfDay && (
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-tpc-gold bg-gradient-to-r from-tpc-beige/30 to-transparent">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-tpc-gold">
                <BookOpen className="h-4 w-4" />
                <CardDescription className="text-tpc-gold font-medium">
                  Today&apos;s Word
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <blockquote className="text-lg lg:text-xl font-serif italic text-tpc-navy dark:text-white mb-2">
                &ldquo;{verseOfDay.text}&rdquo;
              </blockquote>
              <p className="text-sm text-muted-foreground font-medium">
                — {verseOfDay.reference}
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">Reflect</Button>
                <Button variant="ghost" size="sm">Share</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Action Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-3 gap-3">
          <Link href="/journal">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-tpc-navy/10 dark:bg-tpc-gold/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <PenLine className="h-5 w-5 text-tpc-navy dark:text-tpc-gold" />
                </div>
                <p className="text-sm font-medium">Journal</p>
                {stats.journalStreak && stats.journalStreak > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-orange-500 font-bold">
                      {stats.journalStreak} days
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/prayer">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
                <p className="text-sm font-medium">Prayer</p>
                {stats.prayerRequests && stats.prayerRequests > 0 && (
                  <span className="text-xs text-muted-foreground">{stats.prayerRequests} active</span>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/give">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm font-medium">Give</p>
                {member.tier === "partner" && (
                  <Badge variant="outline" className="text-xs mt-1">Partner</Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* New Prophecy Alert */}
      {newProphecy && (
        <motion.div variants={itemVariants}>
          <Link href={"/my-prophecies/" + newProphecy.id}>
            <Card className="border-tpc-gold/50 bg-gradient-to-r from-tpc-gold/10 to-transparent hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-tpc-gold/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-tpc-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-tpc-gold text-tpc-navy text-xs">New</Badge>
                      <span className="text-sm font-medium">Prophetic Word Received</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{newProphecy.preview}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      )}

      {/* Continue Watching */}
      {continueWatching && (
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <Link href={"/library/" + continueWatching.id}>
              <div className="flex gap-4 p-4">
                <div className="relative w-32 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                  {continueWatching.thumbnail ? (
                    <Image
                      src={continueWatching.thumbnail}
                      alt={continueWatching.title}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Play className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Continue Watching</p>
                  <p className="font-medium line-clamp-2 mb-2">{continueWatching.title}</p>
                  <Progress value={continueWatching.progress} className="h-1" />
                  <p className="text-xs text-muted-foreground mt-1">{continueWatching.progress}% complete</p>
                </div>
              </div>
            </Link>
          </Card>
        </motion.div>
      )}

      {/* Upcoming Event */}
      {upcomingEvent && (
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Upcoming</p>
                  <p className="font-medium line-clamp-1">{upcomingEvent.title}</p>
                  <p className="text-sm text-muted-foreground">{upcomingEvent.date} at {upcomingEvent.time}</p>
                </div>
                <Button size="sm" variant="outline">RSVP</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Community Stats */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Your Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-tpc-navy dark:text-tpc-gold">{stats.teachingsWatched || 0}</p>
                <p className="text-xs text-muted-foreground">Teachings Watched</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-tpc-navy dark:text-tpc-gold">{stats.journalStreak || 0}</p>
                <p className="text-xs text-muted-foreground">Journal Streak</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-tpc-navy dark:text-tpc-gold">{stats.prayerRequests || 0}</p>
                <p className="text-xs text-muted-foreground">Prayers Lifted</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-tpc-navy dark:text-tpc-gold">{stats.givingThisMonth || 0}</p>
                <p className="text-xs text-muted-foreground">Given This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
