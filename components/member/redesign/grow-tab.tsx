"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  BookOpen, Play, Sparkles, ClipboardList, 
  ChevronRight, Clock, CheckCircle, Award
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface Teaching {
  id: string
  title: string
  speaker: string
  duration: string
  thumbnail?: string
  progress?: number
  type: "video" | "audio"
}

interface Course {
  id: string
  title: string
  lessonsTotal: number
  lessonsCompleted: number
  thumbnail?: string
}

interface Prophecy {
  id: string
  title: string
  date: string
  isNew?: boolean
}

interface Assessment {
  id: string
  title: string
  estimatedMinutes: number
  completed?: boolean
}

interface GrowTabProps {
  recentTeachings?: Teaching[]
  courses?: Course[]
  prophecies?: Prophecy[]
  assessments?: Assessment[]
  continueWatching?: Teaching
  overallProgress?: number
}

export function GrowTab({
  recentTeachings = [],
  courses = [],
  prophecies = [],
  assessments = [],
  continueWatching,
  overallProgress = 0,
}: GrowTabProps) {
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Progress Header */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-tpc-navy to-tpc-navy/90 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">Your Growth Journey</h2>
                <p className="text-white/70 text-sm">Keep learning, keep growing</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-tpc-gold">{overallProgress}%</p>
                <p className="text-xs text-white/60">to next milestone</p>
              </div>
            </div>
            <Progress value={overallProgress} className="h-2 bg-white/20" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Continue Watching */}
      {continueWatching && (
        <motion.div variants={itemVariants}>
          <Link href={"/library/" + continueWatching.id}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
              <div className="flex">
                <div className="relative w-40 h-24 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                  {continueWatching.thumbnail ? (
                    <img 
                      src={continueWatching.thumbnail} 
                      alt={continueWatching.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Play className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                      <Play className="h-6 w-6 text-tpc-navy ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                    <div 
                      className="h-full bg-tpc-gold"
                      style={{ width: (continueWatching.progress || 0) + "%" }}
                    />
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <Badge variant="outline" className="mb-2 text-xs">Continue Watching</Badge>
                  <h3 className="font-medium line-clamp-2">{continueWatching.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {continueWatching.progress}% complete
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="teachings" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="teachings" className="flex items-center gap-1.5">
              <Play className="h-4 w-4" />
              Teachings
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="prophecies" className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Prophecies
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4" />
              Assessments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teachings" className="mt-4 space-y-3">
            {recentTeachings.length === 0 ? (
              <Card className="p-8 text-center">
                <Play className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium mb-1">Start Your Learning</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore teachings from Prophet Lorenzo
                </p>
                <Button asChild>
                  <Link href="/library">Browse Library</Link>
                </Button>
              </Card>
            ) : (
              recentTeachings.map((teaching) => (
                <Link key={teaching.id} href={"/library/" + teaching.id}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {teaching.thumbnail ? (
                          <img src={teaching.thumbnail} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Play className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium line-clamp-1">{teaching.title}</h4>
                        <p className="text-sm text-muted-foreground">{teaching.speaker}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {teaching.duration}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/library">View All Teachings</Link>
            </Button>
          </TabsContent>

          <TabsContent value="courses" className="mt-4 space-y-3">
            {courses.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium mb-1">Structured Learning</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Take courses to deepen your understanding
                </p>
                <Button asChild>
                  <Link href="/learning">Explore Courses</Link>
                </Button>
              </Card>
            ) : (
              courses.map((course) => (
                <Link key={course.id} href={"/learning/" + course.id}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{course.title}</h4>
                        {course.lessonsCompleted === course.lessonsTotal && (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>{course.lessonsCompleted}/{course.lessonsTotal} lessons</span>
                      </div>
                      <Progress 
                        value={(course.lessonsCompleted / course.lessonsTotal) * 100} 
                        className="h-1.5"
                      />
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/learning">View All Courses</Link>
            </Button>
          </TabsContent>

          <TabsContent value="prophecies" className="mt-4 space-y-3">
            {prophecies.length === 0 ? (
              <Card className="p-8 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-tpc-gold mb-3" />
                <h3 className="font-medium mb-1">Your Prophetic Vault</h3>
                <p className="text-sm text-muted-foreground">
                  Personal words from Prophet Lorenzo will appear here
                </p>
              </Card>
            ) : (
              prophecies.map((prophecy) => (
                <Link key={prophecy.id} href={"/my-prophecies/" + prophecy.id}>
                  <Card className={cn(
                    "hover:shadow-md transition-shadow cursor-pointer",
                    prophecy.isNew && "border-tpc-gold/50 bg-tpc-gold/5"
                  )}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-tpc-gold/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-5 w-5 text-tpc-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium line-clamp-1">{prophecy.title}</h4>
                          {prophecy.isNew && (
                            <Badge className="bg-tpc-gold text-tpc-navy text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{prophecy.date}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/my-prophecies">View All Prophecies</Link>
            </Button>
          </TabsContent>

          <TabsContent value="assessments" className="mt-4 space-y-3">
            {assessments.length === 0 ? (
              <Card className="p-8 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium mb-1">Discover Yourself</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Take assessments to understand your gifts and calling
                </p>
                <Button asChild>
                  <Link href="/assessments">Start an Assessment</Link>
                </Button>
              </Card>
            ) : (
              assessments.map((assessment) => (
                <Link key={assessment.id} href={"/assessments/" + assessment.id}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        assessment.completed 
                          ? "bg-green-100 dark:bg-green-900/30" 
                          : "bg-muted"
                      )}>
                        {assessment.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <ClipboardList className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{assessment.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {assessment.completed ? "Completed" : assessment.estimatedMinutes + " minutes"}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/assessments">View All Assessments</Link>
            </Button>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
