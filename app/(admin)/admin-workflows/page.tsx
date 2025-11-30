'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Workflow,
  Zap,
  Mail,
  MessageSquare,
  Bell,
  Cake,
  UserPlus,
  Heart,
  Trophy,
  Clock,
  Calendar,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings,
  ChevronRight,
  Gift,
  Target,
  Users,
  RefreshCw
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AutomatedWorkflow {
  id: string
  name: string
  description: string
  trigger_type: 'birthday' | 'anniversary' | 'new_member' | 'inactive' | 'milestone' | 'prayer_answered' | 'schedule'
  action_type: 'email' | 'sms' | 'notification' | 'task'
  is_active: boolean
  trigger_config: {
    days_before?: number
    days_after?: number
    days_inactive?: number
    milestone_type?: string
    schedule_cron?: string
  }
  action_config: {
    subject?: string
    template?: string
    message?: string
  }
  last_run?: string
  total_sent: number
  created_at: string
}

interface WorkflowExecution {
  id: string
  workflow_id: string
  workflow_name: string
  member_name: string
  status: 'pending' | 'sent' | 'failed'
  action_type: string
  executed_at: string
  error_message?: string
}

const defaultWorkflows: Partial<AutomatedWorkflow>[] = [
  {
    name: 'Birthday Blessings',
    description: 'Send birthday wishes to members on their special day',
    trigger_type: 'birthday',
    action_type: 'email',
    trigger_config: { days_before: 0 },
    action_config: {
      subject: 'Happy Birthday from TPC Ministries! 🎂',
      template: 'birthday_blessing',
      message: 'Dear {first_name},\n\nOn behalf of Prophet Lorenzo and the entire TPC Ministries family, we want to wish you the happiest of birthdays!\n\nMay this new year of your life be filled with God\'s abundant blessings, divine favor, and supernatural breakthroughs. We are grateful that you are part of our spiritual family.\n\n"The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you." - Numbers 6:24-25\n\nWith love and blessings,\nTPC Ministries'
    }
  },
  {
    name: 'New Member Welcome',
    description: 'Welcome new members and introduce them to the platform',
    trigger_type: 'new_member',
    action_type: 'email',
    trigger_config: { days_after: 0 },
    action_config: {
      subject: 'Welcome to TPC Ministries, {first_name}! 🙏',
      template: 'new_member_welcome',
      message: 'Dear {first_name},\n\nWelcome to the TPC Ministries family! We are so excited to have you join us on this spiritual journey.\n\nHere are some things to explore:\n- Daily Devotionals to start your day with God\n- Ask Prophet Lorenzo - our AI spiritual guide\n- Prayer Wall - share and pray for others\n- Community Groups - connect with fellow believers\n\nWe\'re here to support your spiritual growth every step of the way.\n\nBlessings,\nProphet Lorenzo & TPC Ministries'
    }
  },
  {
    name: 'Re-engagement Campaign',
    description: 'Reach out to members who haven\'t been active in 30+ days',
    trigger_type: 'inactive',
    action_type: 'email',
    trigger_config: { days_inactive: 30 },
    action_config: {
      subject: 'We miss you, {first_name}! 💛',
      template: 're_engagement',
      message: 'Dear {first_name},\n\nWe\'ve noticed you haven\'t visited TPC Ministries in a while, and we wanted to reach out.\n\nWe miss seeing you! Your spiritual journey matters to us, and we\'re here whenever you\'re ready to reconnect.\n\nHere\'s what\'s new:\n- Fresh daily devotionals waiting for you\n- New teachings on breakthrough and purpose\n- Community members praying for one another\n\nWhenever you\'re ready, we\'re here.\n\nWith love,\nTPC Ministries'
    }
  },
  {
    name: 'Prayer Answered Celebration',
    description: 'Celebrate when a member marks a prayer as answered',
    trigger_type: 'prayer_answered',
    action_type: 'notification',
    trigger_config: {},
    action_config: {
      message: 'Praise God! Your prayer has been answered. Take a moment to share your testimony with the community.'
    }
  },
  {
    name: 'Membership Anniversary',
    description: 'Celebrate member anniversaries with the ministry',
    trigger_type: 'anniversary',
    action_type: 'email',
    trigger_config: { days_before: 0 },
    action_config: {
      subject: 'Happy Anniversary with TPC Ministries! 🎉',
      template: 'anniversary',
      message: 'Dear {first_name},\n\nToday marks {years} year(s) since you joined the TPC Ministries family!\n\nWe want to celebrate this milestone with you. Thank you for being part of our community and for allowing us to be part of your spiritual journey.\n\nMay God continue to bless you abundantly in the year ahead.\n\nWith gratitude,\nProphet Lorenzo & TPC Ministries'
    }
  },
  {
    name: 'Milestone Achievement',
    description: 'Congratulate members on reaching engagement milestones',
    trigger_type: 'milestone',
    action_type: 'notification',
    trigger_config: { milestone_type: 'devotional_streak' },
    action_config: {
      message: 'Congratulations! You\'ve reached a new milestone in your spiritual journey. Keep pressing forward!'
    }
  }
]

export default function AdminWorkflowsPage() {
  const [workflows, setWorkflows] = useState<AutomatedWorkflow[]>([])
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<AutomatedWorkflow | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'birthday' as AutomatedWorkflow['trigger_type'],
    action_type: 'email' as AutomatedWorkflow['action_type'],
    is_active: true,
    days_before: 0,
    days_after: 0,
    days_inactive: 30,
    subject: '',
    message: ''
  })

  useEffect(() => {
    fetchWorkflows()
    fetchExecutions()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const fetchWorkflows = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('automated_workflows')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWorkflows(data || [])
    } catch (error) {
      console.error('Error fetching workflows:', error)
      // If table doesn't exist yet, show empty state
      setWorkflows([])
    } finally {
      setLoading(false)
    }
  }

  const fetchExecutions = async () => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setExecutions(data || [])
    } catch (error) {
      console.error('Error fetching executions:', error)
      setExecutions([])
    }
  }

  const handleCreateWorkflow = () => {
    setEditingWorkflow(null)
    setFormData({
      name: '',
      description: '',
      trigger_type: 'birthday',
      action_type: 'email',
      is_active: true,
      days_before: 0,
      days_after: 0,
      days_inactive: 30,
      subject: '',
      message: ''
    })
    setDialogOpen(true)
  }

  const handleEditWorkflow = (workflow: AutomatedWorkflow) => {
    setEditingWorkflow(workflow)
    setFormData({
      name: workflow.name,
      description: workflow.description,
      trigger_type: workflow.trigger_type,
      action_type: workflow.action_type,
      is_active: workflow.is_active,
      days_before: workflow.trigger_config?.days_before || 0,
      days_after: workflow.trigger_config?.days_after || 0,
      days_inactive: workflow.trigger_config?.days_inactive || 30,
      subject: workflow.action_config?.subject || '',
      message: workflow.action_config?.message || ''
    })
    setDialogOpen(true)
  }

  const handleSaveWorkflow = async () => {
    const supabase = createClient()
    setSaving(true)

    try {
      const workflowData = {
        name: formData.name,
        description: formData.description,
        trigger_type: formData.trigger_type,
        action_type: formData.action_type,
        is_active: formData.is_active,
        trigger_config: {
          days_before: formData.days_before,
          days_after: formData.days_after,
          days_inactive: formData.days_inactive
        },
        action_config: {
          subject: formData.subject,
          message: formData.message
        }
      }

      if (editingWorkflow) {
        const { error } = await supabase
          .from('automated_workflows')
          .update(workflowData)
          .eq('id', editingWorkflow.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('automated_workflows')
          .insert({ ...workflowData, total_sent: 0 })
        if (error) throw error
      }

      setDialogOpen(false)
      setNotification({ type: 'success', message: 'Workflow saved successfully!' })
      fetchWorkflows()
    } catch (error) {
      console.error('Error saving workflow:', error)
      setNotification({ type: 'error', message: 'Failed to save workflow' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleWorkflow = async (workflow: AutomatedWorkflow) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('automated_workflows')
        .update({ is_active: !workflow.is_active })
        .eq('id', workflow.id)

      if (error) throw error
      setNotification({
        type: 'success',
        message: `Workflow ${!workflow.is_active ? 'activated' : 'paused'}`
      })
      fetchWorkflows()
    } catch (error) {
      console.error('Error toggling workflow:', error)
    }
  }

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('automated_workflows')
        .delete()
        .eq('id', id)

      if (error) throw error
      setNotification({ type: 'success', message: 'Workflow deleted' })
      fetchWorkflows()
    } catch (error) {
      console.error('Error deleting workflow:', error)
    }
  }

  const handleSetupDefaultWorkflows = async () => {
    const supabase = createClient()
    setSaving(true)

    try {
      for (const workflow of defaultWorkflows) {
        const { error } = await supabase
          .from('automated_workflows')
          .insert({
            ...workflow,
            is_active: false,
            total_sent: 0
          })
        if (error) console.error('Error creating workflow:', error)
      }

      setNotification({ type: 'success', message: 'Default workflows created! Review and activate them.' })
      fetchWorkflows()
    } catch (error) {
      console.error('Error setting up defaults:', error)
      setNotification({ type: 'error', message: 'Failed to create default workflows' })
    } finally {
      setSaving(false)
    }
  }

  const handleRunWorkflow = async (workflow: AutomatedWorkflow) => {
    setNotification({ type: 'success', message: `Running "${workflow.name}" workflow...` })

    try {
      const response = await fetch('/api/admin/workflows/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: workflow.id })
      })

      if (response.ok) {
        const result = await response.json()
        setNotification({ type: 'success', message: `Workflow executed: ${result.sent} messages sent` })
        fetchWorkflows()
        fetchExecutions()
      } else {
        throw new Error('Failed to run workflow')
      }
    } catch (error) {
      console.error('Error running workflow:', error)
      setNotification({ type: 'error', message: 'Failed to run workflow' })
    }
  }

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'birthday': return <Cake className="h-5 w-5 text-pink-500" />
      case 'anniversary': return <Gift className="h-5 w-5 text-purple-500" />
      case 'new_member': return <UserPlus className="h-5 w-5 text-blue-500" />
      case 'inactive': return <Clock className="h-5 w-5 text-orange-500" />
      case 'milestone': return <Trophy className="h-5 w-5 text-gold" />
      case 'prayer_answered': return <Heart className="h-5 w-5 text-red-500" />
      case 'schedule': return <Calendar className="h-5 w-5 text-gray-500" />
      default: return <Zap className="h-5 w-5 text-gray-500" />
    }
  }

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case 'birthday': return 'Birthday'
      case 'anniversary': return 'Anniversary'
      case 'new_member': return 'New Member'
      case 'inactive': return 'Inactive Member'
      case 'milestone': return 'Milestone Achieved'
      case 'prayer_answered': return 'Prayer Answered'
      case 'schedule': return 'Scheduled'
      default: return type
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      case 'notification': return <Bell className="h-4 w-4" />
      case 'task': return <Target className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  // Stats
  const activeWorkflows = workflows.filter(w => w.is_active).length
  const totalSent = workflows.reduce((sum, w) => sum + (w.total_sent || 0), 0)
  const recentExecutions = executions.filter(e =>
    new Date(e.executed_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length

  return (
    <div className="p-8 space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
              <Workflow className="h-7 w-7 text-white" />
            </div>
            Automated Workflows
          </h1>
          <p className="text-gray-600 mt-1">Set up automated messages and actions for your ministry</p>
        </div>
        <Button onClick={handleCreateWorkflow} className="gap-2 bg-navy">
          <Plus className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-navy" />
              <span className="text-sm text-muted-foreground">Total Workflows</span>
            </div>
            <div className="text-3xl font-bold mt-2">{workflows.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mt-2">{activeWorkflows}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">Total Sent</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{totalSent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gold" />
              <span className="text-sm text-muted-foreground">Last 24h</span>
            </div>
            <div className="text-3xl font-bold text-gold mt-2">{recentExecutions}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows">
        <TabsList>
          <TabsTrigger value="workflows" className="gap-2">
            <Workflow className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            Execution History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : workflows.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Workflow className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-navy mb-2">No Workflows Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Automate your ministry communications with workflows for birthdays, new member welcomes, re-engagement, and more.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleSetupDefaultWorkflows} disabled={saving} className="gap-2">
                    <Zap className="h-4 w-4" />
                    {saving ? 'Setting up...' : 'Setup Default Workflows'}
                  </Button>
                  <Button variant="outline" onClick={handleCreateWorkflow} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Custom
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className={!workflow.is_active ? 'opacity-60' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-100 rounded-xl">
                          {getTriggerIcon(workflow.trigger_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-navy">{workflow.name}</h3>
                            <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                              {workflow.is_active ? 'Active' : 'Paused'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              {getTriggerIcon(workflow.trigger_type)}
                              <span>{getTriggerLabel(workflow.trigger_type)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              {getActionIcon(workflow.action_type)}
                              <span className="capitalize">{workflow.action_type}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {workflow.total_sent || 0} sent
                            </div>
                            {workflow.last_run && (
                              <div className="text-sm text-gray-500">
                                Last run: {new Date(workflow.last_run).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRunWorkflow(workflow)}
                          disabled={!workflow.is_active}
                          className="gap-1"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Run Now
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleWorkflow(workflow)}
                        >
                          {workflow.is_active ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditWorkflow(workflow)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <CardDescription>Recent workflow executions</CardDescription>
            </CardHeader>
            <CardContent>
              {executions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No executions yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Workflow</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions.map((execution) => (
                      <TableRow key={execution.id}>
                        <TableCell className="font-medium">{execution.workflow_name}</TableCell>
                        <TableCell>{execution.member_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getActionIcon(execution.action_type)}
                            <span className="capitalize">{execution.action_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              execution.status === 'sent' ? 'default' :
                              execution.status === 'failed' ? 'destructive' : 'secondary'
                            }
                          >
                            {execution.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {new Date(execution.executed_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}</DialogTitle>
            <DialogDescription>
              Set up an automated action triggered by member events
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Workflow Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Birthday Blessings"
                />
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <span className="text-sm text-gray-600">
                    {formData.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Send birthday wishes to members on their special day"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Trigger</Label>
                <Select
                  value={formData.trigger_type}
                  onValueChange={(v: any) => setFormData({ ...formData, trigger_type: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="anniversary">Membership Anniversary</SelectItem>
                    <SelectItem value="new_member">New Member Signup</SelectItem>
                    <SelectItem value="inactive">Inactive Member</SelectItem>
                    <SelectItem value="milestone">Milestone Achieved</SelectItem>
                    <SelectItem value="prayer_answered">Prayer Answered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Action</Label>
                <Select
                  value={formData.action_type}
                  onValueChange={(v: any) => setFormData({ ...formData, action_type: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Send Email</SelectItem>
                    <SelectItem value="sms">Send SMS</SelectItem>
                    <SelectItem value="notification">Push Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.trigger_type === 'inactive' && (
              <div>
                <Label>Days Inactive</Label>
                <Input
                  type="number"
                  value={formData.days_inactive}
                  onChange={(e) => setFormData({ ...formData, days_inactive: parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Trigger when member hasn't been active for this many days
                </p>
              </div>
            )}

            {(formData.trigger_type === 'birthday' || formData.trigger_type === 'anniversary') && (
              <div>
                <Label>Days Before Event</Label>
                <Input
                  type="number"
                  value={formData.days_before}
                  onChange={(e) => setFormData({ ...formData, days_before: parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  0 = on the day, 1 = day before, etc.
                </p>
              </div>
            )}

            {formData.action_type === 'email' && (
              <div>
                <Label>Email Subject</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Happy Birthday from TPC Ministries!"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{first_name}'} to personalize
                </p>
              </div>
            )}

            <div>
              <Label>Message Content</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter your message..."
                rows={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {'{first_name}'}, {'{last_name}'}, {'{email}'}, {'{years}'} (for anniversaries)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWorkflow} disabled={saving}>
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                'Save Workflow'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
