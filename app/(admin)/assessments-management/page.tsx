'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  BarChart3,
  Download,
  Eye,
  Trash2,
  Search
} from 'lucide-react'

export default function AdminAssessmentsPage() {
  const [selectedAssessment, setSelectedAssessment] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Mock data - TODO: Fetch from API
  const stats = {
    totalAssessments: 6,
    totalCompletions: 8423,
    thisWeekCompletions: 147,
    conversionRate: '34%', // Anonymous to member conversion
  }

  const assessments = [
    {
      id: '1',
      name: 'Spiritual Gifts Assessment',
      slug: 'spiritual-gifts',
      isActive: true,
      totalCompletions: 2847,
      anonymousCompletions: 1920,
      memberCompletions: 927,
      conversionRate: '32%',
      avgCompletionTime: '14 min',
      questionCount: 20,
      category: 'Gifts & Calling',
    },
    {
      id: '2',
      name: 'Seasonal Assessment',
      slug: 'seasonal',
      isActive: true,
      totalCompletions: 1923,
      anonymousCompletions: 1245,
      memberCompletions: 678,
      conversionRate: '35%',
      avgCompletionTime: '9 min',
      questionCount: 15,
      category: 'Journey & Growth',
    },
    {
      id: '3',
      name: 'Prophetic Expression Assessment',
      slug: 'prophetic-expression',
      isActive: true,
      totalCompletions: 891,
      anonymousCompletions: 623,
      memberCompletions: 268,
      conversionRate: '30%',
      avgCompletionTime: '11 min',
      questionCount: 16,
      category: 'Gifts & Calling',
    },
    {
      id: '4',
      name: 'Ministry Calling Assessment',
      slug: 'ministry-calling',
      isActive: true,
      totalCompletions: 1456,
      anonymousCompletions: 982,
      memberCompletions: 474,
      conversionRate: '33%',
      avgCompletionTime: '13 min',
      questionCount: 18,
      category: 'Gifts & Calling',
    },
    {
      id: '5',
      name: 'Redemptive Gifts Assessment',
      slug: 'redemptive-gifts',
      isActive: true,
      totalCompletions: 672,
      anonymousCompletions: 401,
      memberCompletions: 271,
      conversionRate: '40%',
      avgCompletionTime: '16 min',
      questionCount: 25,
      category: 'Identity & Design',
    },
    {
      id: '6',
      name: 'Spiritual Maturity Assessment',
      slug: 'spiritual-maturity',
      isActive: true,
      totalCompletions: 1234,
      anonymousCompletions: 834,
      memberCompletions: 400,
      conversionRate: '32%',
      avgCompletionTime: '11 min',
      questionCount: 15,
      category: 'Journey & Growth',
    },
  ]

  const recentCompletions = [
    {
      id: '1',
      assessment: 'Spiritual Gifts',
      memberName: 'Sarah Johnson',
      memberEmail: 'sarah@example.com',
      completedAt: '2024-01-15 14:30',
      topResult: 'Teaching, Exhortation, Mercy',
      memberStatus: 'Partner',
    },
    {
      id: '2',
      assessment: 'Seasonal',
      memberName: 'Anonymous User',
      memberEmail: 'anonymous@temp.com',
      completedAt: '2024-01-15 13:45',
      topResult: 'Growth Season',
      memberStatus: 'Anonymous',
    },
    {
      id: '3',
      assessment: 'Spiritual Gifts',
      memberName: 'Michael Chen',
      memberEmail: 'michael@example.com',
      completedAt: '2024-01-15 12:20',
      topResult: 'Leadership, Administration, Faith',
      memberStatus: 'Free',
    },
    {
      id: '4',
      assessment: 'Prophetic Expression',
      memberName: 'Jennifer Lopez',
      memberEmail: 'jenn@example.com',
      completedAt: '2024-01-15 11:15',
      topResult: 'Seer, Intercessor',
      memberStatus: 'Covenant',
    },
  ]

  const conversionFunnel = [
    { stage: 'Started Assessment', count: 1250, percentage: 100 },
    { stage: 'Reached Email Gate (Q5)', count: 980, percentage: 78 },
    { stage: 'Provided Email', count: 720, percentage: 73 },
    { stage: 'Completed Assessment', count: 650, percentage: 90 },
    { stage: 'Created Account', count: 220, percentage: 34 },
    { stage: 'Became Partner', count: 28, percentage: 13 },
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Assessment Management</h1>
          <p className="text-gray-600 mt-1">Manage assessments and analyze results</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark">
              <Plus className="mr-2 h-4 w-4" />
              Create Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Assessment</DialogTitle>
              <DialogDescription>
                Build a new assessment to help members discover their spiritual design
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Assessment Name</Label>
                  <Input id="name" placeholder="e.g., Love Language Assessment" />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input id="slug" placeholder="e.g., love-language" />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="What will people discover?" rows={3} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gifts">Gifts & Calling</SelectItem>
                      <SelectItem value="journey">Journey & Growth</SelectItem>
                      <SelectItem value="identity">Identity & Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="questions">Question Count</Label>
                  <Input id="questions" type="number" placeholder="20" />
                </div>
                <div>
                  <Label htmlFor="minutes">Est. Minutes</Label>
                  <Input id="minutes" type="number" placeholder="15" />
                </div>
              </div>
              <div>
                <Label htmlFor="biblical">Biblical Foundation</Label>
                <Textarea id="biblical" placeholder="Scripture references and foundation" rows={2} />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-navy hover:bg-navy/90">
                  Create & Add Questions
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Assessments</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy">{stats.totalAssessments}</div>
            <p className="text-xs text-gray-600 mt-1">All active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Completions</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy">{stats.totalCompletions.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">+{stats.thisWeekCompletions} this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy">{stats.thisWeekCompletions}</div>
            <p className="text-xs text-gray-600 mt-1">23% increase from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy">{stats.conversionRate}</div>
            <p className="text-xs text-gray-600 mt-1">Anonymous → Member</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="completions">Recent Completions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="questions">Question Management</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Assessments</CardTitle>
              <CardDescription>Manage your assessment library</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-navy">{assessment.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {assessment.category}
                        </Badge>
                        {assessment.isActive ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {assessment.totalCompletions.toLocaleString()} completions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {assessment.avgCompletionTime} avg
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {assessment.conversionRate} conversion
                        </span>
                        <span>{assessment.questionCount} questions</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Completions Tab */}
        <TabsContent value="completions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Completions</CardTitle>
                  <CardDescription>Latest assessment submissions</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assessments</SelectItem>
                      <SelectItem value="spiritual-gifts">Spiritual Gifts</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                      <SelectItem value="prophetic">Prophetic Expression</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search members..." className="pl-10 w-[250px]" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCompletions.map((completion) => (
                  <div
                    key={completion.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-navy">{completion.memberName}</span>
                        <Badge
                          variant="outline"
                          className={
                            completion.memberStatus === 'Covenant'
                              ? 'border-purple-500 text-purple-700'
                              : completion.memberStatus === 'Partner'
                              ? 'border-gold text-gold'
                              : completion.memberStatus === 'Free'
                              ? 'border-blue-500 text-blue-700'
                              : 'border-gray-300 text-gray-600'
                          }
                        >
                          {completion.memberStatus}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">{completion.memberEmail}</div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-medium text-navy">{completion.assessment}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">{completion.completedAt}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">Top: {completion.topResult}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel (Last 30 Days)</CardTitle>
                <CardDescription>Track user journey through assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionFunnel.map((stage, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-700">{stage.stage}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-navy">{stage.count.toLocaleString()}</span>
                          {index > 0 && (
                            <span className="text-gray-500 text-xs">({stage.percentage}%)</span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gold h-2 rounded-full transition-all"
                          style={{ width: `${stage.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Assessments */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Performance</CardTitle>
                <CardDescription>Ranked by completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...assessments]
                    .sort((a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate))
                    .slice(0, 5)
                    .map((assessment, index) => (
                      <div key={assessment.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy/10 text-sm font-semibold text-navy">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-navy">{assessment.name}</div>
                            <div className="text-sm text-gray-600">
                              {assessment.totalCompletions.toLocaleString()} completions
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{assessment.conversionRate}</div>
                          <div className="text-xs text-gray-500">conversion</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Member vs Anonymous Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Completion Breakdown</CardTitle>
                <CardDescription>Member vs Anonymous users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessments.slice(0, 4).map((assessment) => (
                    <div key={assessment.id}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-navy">{assessment.name}</span>
                        <span className="text-gray-600">{assessment.totalCompletions} total</span>
                      </div>
                      <div className="flex gap-1 h-6 rounded overflow-hidden">
                        <div
                          className="bg-blue-500 flex items-center justify-center text-xs text-white"
                          style={{
                            width: `${(assessment.memberCompletions / assessment.totalCompletions) * 100}%`,
                          }}
                          title={`${assessment.memberCompletions} members`}
                        >
                          {assessment.memberCompletions}
                        </div>
                        <div
                          className="bg-gray-400 flex items-center justify-center text-xs text-white"
                          style={{
                            width: `${(assessment.anonymousCompletions / assessment.totalCompletions) * 100}%`,
                          }}
                          title={`${assessment.anonymousCompletions} anonymous`}
                        >
                          {assessment.anonymousCompletions}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          Members
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-gray-400 rounded"></div>
                          Anonymous
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Email Capture Effectiveness */}
            <Card>
              <CardHeader>
                <CardTitle>Email Capture Effectiveness</CardTitle>
                <CardDescription>Performance at question 5 gate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="text-4xl font-bold text-navy mb-2">73%</div>
                    <p className="text-gray-600">Provide email when prompted</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Continued without email</span>
                      <span className="font-semibold text-navy">27%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Later created account</span>
                      <span className="font-semibold text-green-600">34%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Abandoned at gate</span>
                      <span className="font-semibold text-red-600">22%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Question Management Tab */}
        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Question Bank</CardTitle>
                  <CardDescription>Manage assessment questions</CardDescription>
                </div>
                <Select defaultValue="spiritual-gifts">
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select assessment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spiritual-gifts">Spiritual Gifts</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="prophetic">Prophetic Expression</SelectItem>
                    <SelectItem value="ministry">Ministry Calling</SelectItem>
                    <SelectItem value="redemptive">Redemptive Gifts</SelectItem>
                    <SelectItem value="maturity">Spiritual Maturity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    num: 1,
                    text: 'I enjoy organizing people, tasks, and events to accomplish a goal.',
                    type: 'Likert Scale (1-5)',
                    category: 'Administration',
                  },
                  {
                    num: 2,
                    text: 'I feel deeply moved when I see people in physical or emotional need.',
                    type: 'Likert Scale (1-5)',
                    category: 'Mercy',
                  },
                  {
                    num: 3,
                    text: 'I love studying Scripture and uncovering deeper biblical truths.',
                    type: 'Likert Scale (1-5)',
                    category: 'Teaching',
                  },
                ].map((question) => (
                  <div
                    key={question.num}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex gap-4 flex-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy/10 text-sm font-semibold text-navy flex-shrink-0">
                        {question.num}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 mb-2">{question.text}</p>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge variant="outline">{question.type}</Badge>
                          <Badge variant="outline" className="bg-gold/10 border-gold/30 text-gold">
                            {question.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add New Question
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
