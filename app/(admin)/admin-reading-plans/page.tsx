'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  Eye,
  Star,
  Search,
  Filter,
  ChevronDown,
  Save,
  X,
  BarChart3,
} from 'lucide-react'

interface ReadingPlan {
  id: string
  title: string
  description: string
  duration_days: number
  category: string
  difficulty: string
  cover_image_url: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  total_participants?: number
  completion_rate?: number
}

interface PlanDay {
  id?: string
  plan_id: string
  day_number: number
  title: string
  scripture_reference: string
  scripture_text: string
  reflection: string
}

export default function AdminReadingPlansPage() {
  const [plans, setPlans] = useState<ReadingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDaysModal, setShowDaysModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<ReadingPlan | null>(null)
  const [planDays, setPlanDays] = useState<PlanDay[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    totalParticipants: 0,
    avgCompletionRate: 0,
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_days: 7,
    category: 'general',
    difficulty: 'beginner',
    cover_image_url: '',
    is_featured: false,
    is_active: true,
  })

  const categories = ['general', 'gospel', 'epistles', 'psalms', 'proverbs', 'prophets', 'topical', 'seasonal']
  const difficulties = ['beginner', 'intermediate', 'advanced']

  useEffect(() => {
    fetchPlans()
    fetchStats()
  }, [])

  const fetchPlans = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reading_plans')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPlans(data)
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    const supabase = createClient()

    const { count: totalPlans } = await supabase
      .from('reading_plans')
      .select('*', { count: 'exact', head: true })

    const { count: activePlans } = await supabase
      .from('reading_plans')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const { count: totalParticipants } = await supabase
      .from('reading_plan_progress')
      .select('*', { count: 'exact', head: true })

    setStats({
      totalPlans: totalPlans || 0,
      activePlans: activePlans || 0,
      totalParticipants: totalParticipants || 0,
      avgCompletionRate: 0,
    })
  }

  const handleCreatePlan = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reading_plans')
      .insert([formData])
      .select()
      .single()

    if (!error && data) {
      setPlans([data, ...plans])
      setShowCreateModal(false)
      setSelectedPlan(data)
      setShowDaysModal(true)
      resetForm()
    }
  }

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return
    const supabase = createClient()
    const { error } = await supabase
      .from('reading_plans')
      .update(formData)
      .eq('id', selectedPlan.id)

    if (!error) {
      fetchPlans()
      setShowCreateModal(false)
      setSelectedPlan(null)
      resetForm()
    }
  }

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reading plan?')) return
    const supabase = createClient()
    await supabase.from('reading_plans').delete().eq('id', id)
    fetchPlans()
  }

  const handleToggleFeatured = async (plan: ReadingPlan) => {
    const supabase = createClient()
    await supabase
      .from('reading_plans')
      .update({ is_featured: !plan.is_featured })
      .eq('id', plan.id)
    fetchPlans()
  }

  const handleToggleActive = async (plan: ReadingPlan) => {
    const supabase = createClient()
    await supabase
      .from('reading_plans')
      .update({ is_active: !plan.is_active })
      .eq('id', plan.id)
    fetchPlans()
  }

  const fetchPlanDays = async (planId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('reading_plan_days')
      .select('*')
      .eq('plan_id', planId)
      .order('day_number')

    if (data) {
      setPlanDays(data)
    }
  }

  const handleSaveDays = async () => {
    if (!selectedPlan) return
    const supabase = createClient()

    // Delete existing days
    await supabase.from('reading_plan_days').delete().eq('plan_id', selectedPlan.id)

    // Insert new days
    const daysToInsert = planDays.map(day => ({
      plan_id: selectedPlan.id,
      day_number: day.day_number,
      title: day.title,
      scripture_reference: day.scripture_reference,
      scripture_text: day.scripture_text,
      reflection: day.reflection,
    }))

    await supabase.from('reading_plan_days').insert(daysToInsert)
    setShowDaysModal(false)
    setSelectedPlan(null)
    setPlanDays([])
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration_days: 7,
      category: 'general',
      difficulty: 'beginner',
      cover_image_url: '',
      is_featured: false,
      is_active: true,
    })
  }

  const openEditModal = (plan: ReadingPlan) => {
    setSelectedPlan(plan)
    setFormData({
      title: plan.title,
      description: plan.description,
      duration_days: plan.duration_days,
      category: plan.category,
      difficulty: plan.difficulty,
      cover_image_url: plan.cover_image_url || '',
      is_featured: plan.is_featured,
      is_active: plan.is_active,
    })
    setShowCreateModal(true)
  }

  const openDaysModal = (plan: ReadingPlan) => {
    setSelectedPlan(plan)
    fetchPlanDays(plan.id)

    // Initialize days if empty
    if (planDays.length === 0) {
      const newDays: PlanDay[] = Array.from({ length: plan.duration_days }, (_, i) => ({
        plan_id: plan.id,
        day_number: i + 1,
        title: `Day ${i + 1}`,
        scripture_reference: '',
        scripture_text: '',
        reflection: '',
      }))
      setPlanDays(newDays)
    }

    setShowDaysModal(true)
  }

  const updateDay = (index: number, field: keyof PlanDay, value: string | number) => {
    const updated = [...planDays]
    updated[index] = { ...updated[index], [field]: value }
    setPlanDays(updated)
  }

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || plan.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">Reading Plans</h1>
            <p className="text-gray-600">Create and manage Bible reading plans for members</p>
          </div>
          <Button onClick={() => { resetForm(); setSelectedPlan(null); setShowCreateModal(true) }} className="bg-navy hover:bg-navy/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Plans</p>
                  <p className="text-3xl font-bold text-navy">{stats.totalPlans}</p>
                </div>
                <BookOpen className="h-10 w-10 text-navy/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Plans</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activePlans}</p>
                </div>
                <Eye className="h-10 w-10 text-green-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Participants</p>
                  <p className="text-3xl font-bold text-gold">{stats.totalParticipants}</p>
                </div>
                <Users className="h-10 w-10 text-gold/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Completion</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.avgCompletionRate}%</p>
                </div>
                <BarChart3 className="h-10 w-10 text-purple-600/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reading plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Plans List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading plans...</div>
          ) : filteredPlans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reading plans found</p>
              </CardContent>
            </Card>
          ) : (
            filteredPlans.map((plan) => (
              <Card key={plan.id} className={!plan.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {plan.cover_image_url ? (
                      <img src={plan.cover_image_url} alt="" className="w-24 h-24 rounded-lg object-cover" />
                    ) : (
                      <div className="w-24 h-24 bg-navy/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-navy/40" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-navy">{plan.title}</h3>
                        {plan.is_featured && (
                          <span className="bg-gold/20 text-gold px-2 py-0.5 rounded text-xs font-medium">Featured</span>
                        )}
                        {!plan.is_active && (
                          <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">Inactive</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{plan.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {plan.duration_days} days
                        </span>
                        <span className="capitalize">{plan.category}</span>
                        <span className="capitalize">{plan.difficulty}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFeatured(plan)}
                        className={plan.is_featured ? 'text-gold' : 'text-gray-400'}
                      >
                        <Star className="h-4 w-4" fill={plan.is_featured ? 'currentColor' : 'none'} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDaysModal(plan)}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(plan)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(plan)}
                      >
                        <Eye className={`h-4 w-4 ${plan.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy">
                  {selectedPlan ? 'Edit Reading Plan' : 'Create Reading Plan'}
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., 21 Days of Prayer"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this reading plan..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Duration (Days)</Label>
                    <Input
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 7 })}
                      min={1}
                      max={365}
                    />
                  </div>

                  <div>
                    <Label>Category</Label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Difficulty</Label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Cover Image URL (optional)</Label>
                  <Input
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Featured Plan</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={selectedPlan ? handleUpdatePlan : handleCreatePlan}
                    className="flex-1 bg-navy hover:bg-navy/90"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {selectedPlan ? 'Update Plan' : 'Create & Add Days'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Days Editor Modal */}
        {showDaysModal && selectedPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-navy">Edit Plan Days</h2>
                  <p className="text-gray-600">{selectedPlan.title} - {selectedPlan.duration_days} days</p>
                </div>
                <button onClick={() => { setShowDaysModal(false); setPlanDays([]) }} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {Array.from({ length: selectedPlan.duration_days }, (_, i) => i).map((index) => {
                  const day = planDays[index] || {
                    plan_id: selectedPlan.id,
                    day_number: index + 1,
                    title: `Day ${index + 1}`,
                    scripture_reference: '',
                    scripture_text: '',
                    reflection: '',
                  }

                  return (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Day {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Title</Label>
                            <Input
                              value={day.title}
                              onChange={(e) => {
                                const updated = [...planDays]
                                if (!updated[index]) {
                                  updated[index] = { ...day }
                                }
                                updated[index].title = e.target.value
                                setPlanDays(updated)
                              }}
                              placeholder="Day title..."
                            />
                          </div>
                          <div>
                            <Label>Scripture Reference</Label>
                            <Input
                              value={day.scripture_reference}
                              onChange={(e) => {
                                const updated = [...planDays]
                                if (!updated[index]) {
                                  updated[index] = { ...day }
                                }
                                updated[index].scripture_reference = e.target.value
                                setPlanDays(updated)
                              }}
                              placeholder="e.g., John 3:16-21"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Scripture Text</Label>
                          <Textarea
                            value={day.scripture_text}
                            onChange={(e) => {
                              const updated = [...planDays]
                              if (!updated[index]) {
                                updated[index] = { ...day }
                              }
                              updated[index].scripture_text = e.target.value
                              setPlanDays(updated)
                            }}
                            placeholder="Enter the scripture passage..."
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Reflection / Devotional</Label>
                          <Textarea
                            value={day.reflection}
                            onChange={(e) => {
                              const updated = [...planDays]
                              if (!updated[index]) {
                                updated[index] = { ...day }
                              }
                              updated[index].reflection = e.target.value
                              setPlanDays(updated)
                            }}
                            placeholder="Add a reflection or devotional thought..."
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="flex gap-3 pt-6 sticky bottom-0 bg-white py-4 border-t mt-6">
                <Button onClick={handleSaveDays} className="flex-1 bg-navy hover:bg-navy/90">
                  <Save className="mr-2 h-4 w-4" />
                  Save All Days
                </Button>
                <Button variant="outline" onClick={() => { setShowDaysModal(false); setPlanDays([]) }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
