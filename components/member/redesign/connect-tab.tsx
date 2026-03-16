"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { 
  Heart, Users, Calendar, MessageSquare,
  ChevronRight, Plus, Sparkles, PartyPopper
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PrayerButton } from "@/components/ui/prayer-button"
import { cn } from "@/lib/utils"

interface PrayerRequest {
  id: string
  title: string
  author: string
  authorInitials: string
  prayerCount: number
  isAnonymous?: boolean
  isAnswered?: boolean
  createdAt: string
}

interface Group {
  id: string
  name: string
  memberCount: number
  newPosts?: number
  thumbnail?: string
}

interface Event {
  id: string
  title: string
  date: string
  time: string
  type: "in-person" | "online" | "hybrid"
  isRegistered?: boolean
}

interface ConnectTabProps {
  prayerRequests?: PrayerRequest[]
  answeredPrayers?: PrayerRequest[]
  groups?: Group[]
  upcomingEvents?: Event[]
  onPray?: (id: string) => void
}

export function ConnectTab({
  prayerRequests = [],
  answeredPrayers = [],
  groups = [],
  upcomingEvents = [],
  onPray,
}: ConnectTabProps) {
  const shouldReduceMotion = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold">Your Community</h1>
            <p className="text-muted-foreground">Connect, pray, and grow together</p>
          </div>
        </div>
      </motion.div>

      {/* Answered Prayer Celebration */}
      {answeredPrayers.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                  <PartyPopper className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 dark:text-green-300">
                    Prayer Answered!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {answeredPrayers[0].author}&apos;s prayer was answered: &ldquo;{answeredPrayers[0].title}&rdquo;
                  </p>
                  <Button variant="link" className="p-0 h-auto text-green-700 dark:text-green-300" asChild>
                    <Link href={"/prayer/" + answeredPrayers[0].id}>Read testimony</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="prayer" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="prayer" className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              Prayer Wall
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prayer" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Prayer Requests</h3>
              <Button size="sm" asChild>
                <Link href="/prayer/new">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Request
                </Link>
              </Button>
            </div>

            {prayerRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto text-pink-400 mb-3" />
                <h3 className="font-medium mb-1">Stand Together in Prayer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your prayer needs with the community
                </p>
                <Button asChild>
                  <Link href="/prayer/new">Share a Prayer Request</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {prayerRequests.map((prayer) => (
                  <Card key={prayer.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0 text-sm font-medium text-pink-700 dark:text-pink-300">
                          {prayer.isAnonymous ? "?" : prayer.authorInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {prayer.isAnonymous ? "Anonymous" : prayer.author}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {prayer.createdAt}
                            </span>
                          </div>
                          <p className="text-sm text-foreground line-clamp-2 mb-3">
                            {prayer.title}
                          </p>
                          <PrayerButton
                            prayerCount={prayer.prayerCount}
                            onPray={() => onPray?.(prayer.id)}
                            size="sm"
                            variant="outline"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/prayer">View All Prayers</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="groups" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Your Groups</h3>
              <Button size="sm" variant="outline" asChild>
                <Link href="/groups">Find Groups</Link>
              </Button>
            </div>

            {groups.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-purple-400 mb-3" />
                <h3 className="font-medium mb-1">Find Your Community</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join groups to connect with like-minded believers
                </p>
                <Button asChild>
                  <Link href="/groups">Explore Groups</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <Link key={group.id} href={"/groups/" + group.id}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{group.name}</h4>
                            {group.newPosts && group.newPosts > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {group.newPosts} new
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {group.memberCount} members
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Upcoming Events</h3>
              <Button size="sm" variant="outline" asChild>
                <Link href="/events">View Calendar</Link>
              </Button>
            </div>

            {upcomingEvents.length === 0 ? (
              <Card className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-blue-400 mb-3" />
                <h3 className="font-medium mb-1">Stay Connected</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No upcoming events right now. Check back soon!
                </p>
                <Button variant="outline" asChild>
                  <Link href="/events">View Calendar</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Link key={event.id} href={"/events/" + event.id}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium line-clamp-1">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {event.date} at {event.time}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {event.type}
                          </Badge>
                        </div>
                        {event.isRegistered ? (
                          <Badge className="bg-green-100 text-green-700">Registered</Badge>
                        ) : (
                          <Button size="sm">RSVP</Button>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
