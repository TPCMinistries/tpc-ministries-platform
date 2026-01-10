'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import {
  Zap,
  Plus,
  Play,
  Pause,
  Settings,
  Trash2,
  Clock,
  Calendar,
  UserPlus,
  Heart,
  DollarSign,
  MessageSquare,
  Bell,
  Mail,
  Smartphone,
  RefreshCw,
  Activity,
  ChevronRight,
} from 'lucide-react'

interface AutomationTrigger {
  id: string
  name: string
  description: string | null
  trigger_type: string
  trigger_event: string | null
  trigger_schedule: string | null
  trigger_conditions: any
  actions: any[]
  is_active: boolean
  execution_count: number
  last_executed_at: string | null
  created_at: string
}

const TRIGGER_EVENTS = [
  { value: 'member_joined', label: 'New Member Joined', icon: UserPlus },
  { value: 'lead_created', label: 'New Lead Created', icon: UserPlus },
  { value: 'donation_received', label: 'Donation Received', icon: DollarSign },
  { value: 'prayer_submitted', label: 'Prayer Request Submitted', icon: Heart },
  { value: 'streak_at_risk', label: 'Streak at Risk', icon: Activity },
  { value: 'birthday', label: 'Member Birthday', icon: Calendar },
  { value: 'first_time_guest', label: 'First Time Guest', icon: UserPlus },
  { value: 'event_registration', label: 'Event Registration', icon: Calendar },
]

const ACTION_TYPES = [
  { value: 'send_sms', label: 'Send SMS', icon: Smartphone },
  { value: 'send_email', label: 'Send Email', icon: Mail },
  { value: 'create_notification', label: 'Create Notification', icon: Bell },
  { value: 'assign_task', label: 'Assign Task', icon: Settings },
  { value: 'update_member', label: 'Update Member', icon: UserPlus },
]

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<AutomationTrigger[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAutomation, setEditingAutomation] = useState<AutomationTrigger | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'event',
    trigger_event: '',
    trigger_schedule: '',
    actions: [] as any[],
  })

  useEffect(() => {
    fetchAutomations()
  }, [])

  const fetchAutomations = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('automation_triggers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAutomations(data || [])
    } catch (error) {
      console.error('Error fetching automations:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch automations',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.trigger_event) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        trigger_type: formData.trigger_type,
        trigger_event: formData.trigger_event,
        trigger_schedule: formData.trigger_schedule || null,
        actions: formData.actions.length > 0 ? formData.actions : [{ type: 'create_notification', config: {} }],
        is_active: true,
      }

      if (editingAutomation) {
        const { error } = await supabase
          .from('automation_triggers')
          .update(payload)
          .eq('id', editingAutomation.id)

        if (error) throw error
        toast({ title: 'Automation Updated' })
      } else {
        const { error } = await supabase
          .from('automation_triggers')
          .insert(payload)

        if (error) throw error
        toast({ title: 'Automation Created' })
      }

      setIsDialogOpen(false)
      resetForm()
      fetchAutomations()
    } catch (error) {
      console.error('Error saving automation:', error)
      toast({
        title: 'Error',
        description: 'Failed to save automation',
        variant: 'destructive',
      })
    }
  }

  const toggleAutomation = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_triggers')
        .update({ is_active: !isActive })
        .eq('id', id)

      if (error) throw error
      toast({
        title: isActive ? 'Automation Paused' : 'Automation Activated',
      })
      fetchAutomations()
    } catch (error) {
      console.error('Error toggling automation:', error)
      toast({
        title: 'Error',
        description: 'Failed to update automation',
        variant: 'destructive',
      })
    }
  }

  const deleteAutomation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return

    try {
      const { error } = await supabase
        .from('automation_triggers')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast({ title: 'Automation Deleted' })
      fetchAutomations()
    } catch (error) {
      console.error('Error deleting automation:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete automation',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      trigger_type: 'event',
      trigger_event: '',
      trigger_schedule: '',
      actions: [],
    })
    setEditingAutomation(null)
  }

  const openEditDialog = (automation: AutomationTrigger) => {
    setEditingAutomation(automation)
    setFormData({
      name: automation.name,
      description: automation.description || '',
      trigger_type: automation.trigger_type,
      trigger_event: automation.trigger_event || '',
      trigger_schedule: automation.trigger_schedule || '',
      actions: automation.actions || [],
    })
    setIsDialogOpen(true)
  }

  const addAction = (type: string) => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { type, config: {} }],
    }))
  }

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }))
  }

  const getTriggerEventInfo = (eventValue: string | null) => {
    return TRIGGER_EVENTS.find(e => e.value === eventValue) || null
  }

  const activeCount = automations.filter(a => a.is_active).length
  const totalExecutions = automations.reduce((sum, a) => sum + a.execution_count, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="h-8 w-8 text-gold" />
            Automations
          </h1>
          <p className="text-gray-400 mt-1">
            Create automated workflows triggered by events
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold/90 text-navy">
              <Plus className="h-4 w-4 mr-2" />
              New Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingAutomation ? 'Edit Automation' : 'Create Automation'}
              </DialogTitle>
              <DialogDescription>
                Set up automated actions triggered by events
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="e.g., Welcome New Members"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="What does this automation do?"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-800 border-gray-700"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Trigger Event *</Label>
                <Select
                  value={formData.trigger_event}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, trigger_event: value }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select a trigger event" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {TRIGGER_EVENTS.map((event) => (
                      <SelectItem key={event.value} value={event.value}>
                        <div className="flex items-center gap-2">
                          <event.icon className="h-4 w-4" />
                          {event.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Actions</Label>
                  <Select onValueChange={(value) => addAction(value)}>
                    <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Add action" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {ACTION_TYPES.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          <div className="flex items-center gap-2">
                            <action.icon className="h-4 w-4" />
                            {action.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.actions.length === 0 ? (
                  <p className="text-sm text-gray-500 py-2">
                    No actions added. Add an action to complete the automation.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.actions.map((action, index) => {
                      const actionInfo = ACTION_TYPES.find(a => a.value === action.type)
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                        >
                          <div className="flex items-center gap-2">
                            {actionInfo && <actionInfo.icon className="h-4 w-4 text-gold" />}
                            <span className="text-sm text-white">{actionInfo?.label || action.type}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAction(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-gold hover:bg-gold/90 text-navy"
                >
                  {editingAutomation ? 'Update' : 'Create'} Automation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Automations</p>
                <p className="text-2xl font-bold text-white">{automations.length}</p>
              </div>
              <div className="p-3 bg-gold/20 rounded-lg">
                <Zap className="h-6 w-6 text-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-400">{activeCount}</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Play className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Executions</p>
                <p className="text-2xl font-bold text-blue-400">{totalExecutions}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">All Automations</CardTitle>
          <CardDescription>Manage your automated workflows</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gold" />
            </div>
          ) : automations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No automations created yet</p>
              <p className="text-sm mt-1">Create your first automation to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {automations.map((automation) => {
                const eventInfo = getTriggerEventInfo(automation.trigger_event)
                const EventIcon = eventInfo?.icon || Zap

                return (
                  <div
                    key={automation.id}
                    className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${automation.is_active ? 'bg-gold/20' : 'bg-gray-700/50'}`}>
                        <EventIcon className={`h-5 w-5 ${automation.is_active ? 'text-gold' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{automation.name}</h3>
                          <Badge
                            className={automation.is_active
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }
                          >
                            {automation.is_active ? 'Active' : 'Paused'}
                          </Badge>
                        </div>
                        {automation.description && (
                          <p className="text-sm text-gray-400 mt-1">{automation.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <ChevronRight className="h-3 w-3" />
                            {eventInfo?.label || automation.trigger_event}
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {automation.execution_count} runs
                          </span>
                          {automation.last_executed_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last: {new Date(automation.last_executed_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={automation.is_active}
                        onCheckedChange={() => toggleAutomation(automation.id, automation.is_active)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(automation)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAutomation(automation.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
