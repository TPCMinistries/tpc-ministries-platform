'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  Brain,
  Flame,
  Thermometer,
  Snowflake,
  RefreshCw,
  Search,
  User,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react'

interface ScoredLead {
  id: string
  name: string
  email: string
  ai_score: number | null
  ai_priority: string | null
  ai_summary: string | null
  ai_scored_at: string | null
  status: string
}

interface PriorityCounts {
  hot: number
  warm: number
  cold: number
  unscored: number
}

export default function LeadScoringPage() {
  const [leads, setLeads] = useState<ScoredLead[]>([])
  const [counts, setCounts] = useState<PriorityCounts>({ hot: 0, warm: 0, cold: 0, unscored: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isScoring, setIsScoring] = useState(false)
  const [scoringLeadId, setScoringLeadId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/leads/score')
      if (!res.ok) throw new Error('Failed to fetch leads')
      const data = await res.json()
      setLeads(data.leads || [])
      setCounts(data.counts || { hot: 0, warm: 0, cold: 0, unscored: 0 })
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch lead scores',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const scoreAllLeads = async () => {
    try {
      setIsScoring(true)
      const res = await fetch('/api/admin/leads/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score_all: true }),
      })

      if (!res.ok) throw new Error('Failed to score leads')

      const data = await res.json()
      toast({
        title: 'AI Scoring Complete',
        description: `Successfully scored ${data.scored} leads`,
      })
      fetchLeads()
    } catch (error) {
      console.error('Error scoring leads:', error)
      toast({
        title: 'Error',
        description: 'Failed to score leads',
        variant: 'destructive',
      })
    } finally {
      setIsScoring(false)
    }
  }

  const scoreSingleLead = async (leadId: string) => {
    try {
      setScoringLeadId(leadId)
      const res = await fetch('/api/admin/leads/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId }),
      })

      if (!res.ok) throw new Error('Failed to score lead')

      toast({
        title: 'Lead Scored',
        description: 'AI analysis complete',
      })
      fetchLeads()
    } catch (error) {
      console.error('Error scoring lead:', error)
      toast({
        title: 'Error',
        description: 'Failed to score lead',
        variant: 'destructive',
      })
    } finally {
      setScoringLeadId(null)
    }
  }

  const getPriorityIcon = (priority: string | null) => {
    switch (priority) {
      case 'hot':
        return <Flame className="h-4 w-4 text-red-500" />
      case 'warm':
        return <Thermometer className="h-4 w-4 text-orange-500" />
      case 'cold':
        return <Snowflake className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-gray-400" />
    }
  }

  const getPriorityBadge = (priority: string | null) => {
    switch (priority) {
      case 'hot':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Hot</Badge>
      case 'warm':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Warm</Badge>
      case 'cold':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Cold</Badge>
      default:
        return <Badge variant="outline" className="text-gray-400">Unscored</Badge>
    }
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400'
    if (score >= 70) return 'text-green-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPriority = filterPriority === 'all' || lead.ai_priority === filterPriority

    return matchesSearch && matchesPriority
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="h-8 w-8 text-gold" />
            AI Lead Scoring
          </h1>
          <p className="text-gray-400 mt-1">
            Prioritize leads using AI-powered analysis
          </p>
        </div>
        <Button
          onClick={scoreAllLeads}
          disabled={isScoring}
          className="bg-gold hover:bg-gold/90 text-navy"
        >
          {isScoring ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Scoring...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Score All Leads
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`bg-gray-800/50 border-gray-700 cursor-pointer transition-all ${filterPriority === 'hot' ? 'ring-2 ring-red-500' : ''}`}
          onClick={() => setFilterPriority(filterPriority === 'hot' ? 'all' : 'hot')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Hot Leads</p>
                <p className="text-2xl font-bold text-red-400">{counts.hot}</p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-lg">
                <Flame className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gray-800/50 border-gray-700 cursor-pointer transition-all ${filterPriority === 'warm' ? 'ring-2 ring-orange-500' : ''}`}
          onClick={() => setFilterPriority(filterPriority === 'warm' ? 'all' : 'warm')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Warm Leads</p>
                <p className="text-2xl font-bold text-orange-400">{counts.warm}</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Thermometer className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gray-800/50 border-gray-700 cursor-pointer transition-all ${filterPriority === 'cold' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setFilterPriority(filterPriority === 'cold' ? 'all' : 'cold')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Cold Leads</p>
                <p className="text-2xl font-bold text-blue-400">{counts.cold}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Snowflake className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Unscored</p>
                <p className="text-2xl font-bold text-gray-400">{counts.unscored}</p>
              </div>
              <div className="p-3 bg-gray-500/20 rounded-lg">
                <User className="h-6 w-6 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>
        {filterPriority !== 'all' && (
          <Button
            variant="outline"
            onClick={() => setFilterPriority('all')}
            className="border-gray-700"
          >
            Clear Filter
          </Button>
        )}
      </div>

      {/* Leads List */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Scored Leads</CardTitle>
          <CardDescription>
            {filteredLeads.length} leads {filterPriority !== 'all' ? `(${filterPriority} only)` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gold" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No scored leads found</p>
              <p className="text-sm mt-1">Click "Score All Leads" to analyze new leads</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-700/50 rounded-full">
                      {getPriorityIcon(lead.ai_priority)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">
                          {lead.name}
                        </h3>
                        {getPriorityBadge(lead.ai_priority)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                        {lead.ai_scored_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Scored {new Date(lead.ai_scored_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {lead.ai_summary && (
                        <p className="text-sm text-gray-300 mt-2 max-w-xl">
                          {lead.ai_summary}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <span className={`text-2xl font-bold ${getScoreColor(lead.ai_score)}`}>
                          {lead.ai_score ?? '—'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scoreSingleLead(lead.id)}
                      disabled={scoringLeadId === lead.id}
                      className="border-gray-600"
                    >
                      {scoringLeadId === lead.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Rescore
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
