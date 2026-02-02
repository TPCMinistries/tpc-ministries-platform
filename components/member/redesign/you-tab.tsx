"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  User, Settings, CreditCard, Heart, BookOpen, 
  Sparkles, Gift, LogOut, ChevronRight, Award,
  Download, Bell, Shield, HelpCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StreakDisplay } from "@/components/ui/streak-display"
import { cn } from "@/lib/utils"

interface MemberStats {
  teachingsWatched: number
  prayersAnswered: number
  propheciesReceived: number
  totalGiven: number
  journalStreak: number
  memberSince: string
}

interface YouTabProps {
  member: {
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
    role?: string
    tier?: string
  }
  stats?: MemberStats
  onLogout?: () => void
}

const getRoleBadge = (role?: string, tier?: string) => {
  const r = role || tier || "free"
  switch (r) {
    case "admin":
      return { label: "Admin", color: "bg-tpc-gold/20 text-tpc-gold border-tpc-gold/30" }
    case "staff":
      return { label: "Staff", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" }
    case "covenant":
      return { label: "Covenant", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" }
    case "partner":
      return { label: "Partner", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" }
    default:
      return { label: "Member", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" }
  }
}

export function YouTab({
  member,
  stats = {
    teachingsWatched: 0,
    prayersAnswered: 0,
    propheciesReceived: 0,
    totalGiven: 0,
    journalStreak: 0,
    memberSince: "2024",
  },
  onLogout,
}: YouTabProps) {
  const roleBadge = getRoleBadge(member.role, member.tier)
  const initials = (member.first_name?.[0] || "") + (member.last_name?.[0] || "")
  const formattedGiven = stats.totalGiven.toLocaleString()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const menuItems = [
    { label: "My Prophecies", href: "/my-prophecies", icon: Sparkles, iconColor: "text-tpc-gold" },
    { label: "Giving History", href: "/my-giving", icon: Gift, iconColor: "text-green-600" },
    { label: "My Journey", href: "/my-journey", icon: Award, iconColor: "text-purple-600" },
    { label: "Downloaded Resources", href: "/downloads", icon: Download, iconColor: "text-blue-600" },
  ]

  const settingsItems = [
    { label: "Edit Profile", href: "/account", icon: User },
    { label: "Notifications", href: "/account/notifications", icon: Bell },
    { label: "Membership", href: "/account/membership", icon: Shield },
    { label: "Help & Support", href: "/help", icon: HelpCircle },
  ]

  return (
    <motion.div
      className="space-y-6 pb-24 lg:pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Profile Header */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-tpc-navy to-tpc-navy/80" />
          <CardContent className="pt-0 pb-6 px-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
              <Avatar className="w-20 h-20 border-4 border-background">
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback className="text-xl bg-tpc-gold text-tpc-navy">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold">
                    {member.first_name} {member.last_name}
                  </h1>
                  <Badge className={cn("border", roleBadge.color)}>
                    {roleBadge.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{member.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Member since {stats.memberSince}
                </p>
              </div>
              {stats.journalStreak > 0 && (
                <StreakDisplay count={stats.journalStreak} variant="badge" />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Journey Stats */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Your Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <BookOpen className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{stats.teachingsWatched}</p>
                <p className="text-xs text-muted-foreground">Teachings Watched</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Heart className="h-5 w-5 mx-auto mb-2 text-pink-600" />
                <p className="text-2xl font-bold">{stats.prayersAnswered}</p>
                <p className="text-xs text-muted-foreground">Prayers Answered</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Sparkles className="h-5 w-5 mx-auto mb-2 text-tpc-gold" />
                <p className="text-2xl font-bold">{stats.propheciesReceived}</p>
                <p className="text-xs text-muted-foreground">Prophecies Received</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Gift className="h-5 w-5 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">${formattedGiven}</p>
                <p className="text-xs text-muted-foreground">Total Given</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <item.icon className={cn("h-5 w-5", item.iconColor)} />
                  <span className="flex-1 font-medium">{item.label}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {settingsItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upgrade CTA */}
      {member.tier !== "partner" && member.tier !== "covenant" && member.role !== "admin" && member.role !== "staff" && (
        <motion.div variants={itemVariants}>
          <Card className="border-tpc-gold/50 bg-gradient-to-r from-tpc-gold/10 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tpc-gold/20 flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-tpc-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Become a Partner</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock exclusive content and deeper community access
                  </p>
                </div>
                <Button asChild className="bg-tpc-gold text-tpc-navy hover:bg-tpc-gold-dark">
                  <Link href="/partner">Upgrade</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Logout */}
      <motion.div variants={itemVariants}>
        <Button 
          variant="outline" 
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </motion.div>
    </motion.div>
  )
}
