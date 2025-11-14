'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, FileText, Download, ExternalLink, CheckCircle, Heart, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Resource {
  id: string
  title: string
  description: string
  type: 'assessment' | 'guide' | 'document' | 'tool'
  category: string
  link: string
  downloadable: boolean
}

export default function ResourcesPage() {
  const assessments: Resource[] = [
    {
      id: '1',
      title: 'Daily Devotional',
      description: 'Get daily spiritual nourishment and guidance',
      type: 'tool',
      category: 'Spiritual Growth',
      link: '/devotional',
      downloadable: false,
    },
    {
      id: '2',
      title: 'Seasonal Assessment',
      description: 'Understand your current spiritual season',
      type: 'assessment',
      category: 'Self-Discovery',
      link: '/assessments/seasonal',
      downloadable: false,
    },
    {
      id: '3',
      title: 'Spiritual Gifts Assessment',
      description: 'Discover your God-given spiritual gifts',
      type: 'assessment',
      category: 'Self-Discovery',
      link: '/assessments/spiritual-gifts',
      downloadable: false,
    },
    {
      id: '4',
      title: 'Prophetic Expression Assessment',
      description: 'Identify how you uniquely express the prophetic',
      type: 'assessment',
      category: 'Self-Discovery',
      link: '/assessments/prophetic-expression',
      downloadable: false,
    },
    {
      id: '5',
      title: 'Ministry Calling Assessment',
      description: 'Clarify your specific ministry calling',
      type: 'assessment',
      category: 'Self-Discovery',
      link: '/assessments/ministry-calling',
      downloadable: false,
    },
    {
      id: '6',
      title: 'Redemptive Gifts Assessment',
      description: 'Understand your redemptive gift',
      type: 'assessment',
      category: 'Self-Discovery',
      link: '/assessments/redemptive-gifts',
      downloadable: false,
    },
  ]

  const guides: Resource[] = [
    {
      id: '7',
      title: 'Prayer Guide',
      description: 'A comprehensive guide to developing a powerful prayer life',
      type: 'guide',
      category: 'Prayer',
      link: '/resources/prayer-guide',
      downloadable: true,
    },
    {
      id: '8',
      title: 'Prophetic Protocol',
      description: 'Understanding how to steward and deliver prophetic words',
      type: 'guide',
      category: 'Prophetic',
      link: '/resources/prophetic-protocol',
      downloadable: true,
    },
    {
      id: '9',
      title: 'Bible Reading Plan',
      description: 'One-year Bible reading plan with daily reflections',
      type: 'guide',
      category: 'Biblical Study',
      link: '/resources/bible-reading-plan',
      downloadable: true,
    },
  ]

  const documents: Resource[] = [
    {
      id: '10',
      title: 'Ministry Vision & Values',
      description: 'Our core beliefs and ministry direction',
      type: 'document',
      category: 'About Us',
      link: '/resources/vision-values',
      downloadable: true,
    },
    {
      id: '11',
      title: 'Partnership Information',
      description: 'Learn about becoming a ministry partner',
      type: 'document',
      category: 'Partnership',
      link: '/partner',
      downloadable: false,
    },
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assessment':
        return CheckCircle
      case 'guide':
        return BookOpen
      case 'document':
        return FileText
      case 'tool':
        return Sparkles
      default:
        return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assessment':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'guide':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'document':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'tool':
        return 'bg-gold/20 text-gold border-gold/30'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const ResourceCard = ({ resource }: { resource: Resource }) => {
    const Icon = getTypeIcon(resource.type)
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-navy" />
              <CardTitle className="text-lg">{resource.title}</CardTitle>
            </div>
            {resource.downloadable && (
              <Download className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <CardDescription>{resource.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Badge variant="outline" className={getTypeColor(resource.type)}>
              {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
            </Badge>
            <Badge variant="outline">{resource.category}</Badge>
          </div>
          <Link href={resource.link}>
            <Button className="w-full bg-navy hover:bg-navy/90">
              {resource.type === 'assessment' || resource.type === 'tool' ? 'Access' : 'View'}
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy">Resources</h1>
        <p className="text-gray-600 mt-1">Tools, guides, and assessments for your spiritual journey</p>
      </div>

      {/* Assessments & Tools Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-navy/10 rounded-lg p-2">
            <CheckCircle className="h-6 w-6 text-navy" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy">Assessments & Tools</h2>
            <p className="text-sm text-gray-600">Discover your spiritual gifts and calling</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      {/* Guides Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 rounded-lg p-2">
            <BookOpen className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy">Guides & Study Materials</h2>
            <p className="text-sm text-gray-600">Deepen your understanding and practice</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      {/* Documents Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 rounded-lg p-2">
            <FileText className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy">Ministry Documents</h2>
            <p className="text-sm text-gray-600">Learn more about our ministry</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      {/* CTA Card */}
      <Card className="bg-gradient-to-br from-navy to-navy-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Need More Help?</CardTitle>
          <CardDescription className="text-gray-300">
            Our team is here to support your spiritual journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-200">
            If you have questions about any of these resources or need personalized guidance,
            don't hesitate to reach out to our ministry team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/member/my-prayers">
              <Button variant="secondary" className="w-full sm:w-auto">
                <Heart className="h-4 w-4 mr-2" />
                Submit Prayer Request
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                Contact Ministry Team
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
