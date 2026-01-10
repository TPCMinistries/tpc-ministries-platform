'use client'

import { useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import {
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Pledge {
  id: string
  amount: number
  frequency: string
  start_date: string
  end_date?: string
  notes?: string
  is_active: boolean
  created_at: string
  fund?: {
    id: string
    name: string
    description?: string
  }
  total_given: number
  expected_amount: number
  progress: number
}

interface Fund {
  id: string
  name: string
  description?: string
}

interface PledgeTrackerProps {
  pledges: Pledge[]
  funds?: Fund[]
  stats: {
    active_pledges: number
    total_pledged_monthly: number
    average_progress: number
  }
  onCreatePledge: (pledge: any) => Promise<void>
  onUpdatePledge: (pledge: any) => Promise<void>
  onDeletePledge: (id: string) => Promise<void>
}

export default function PledgeTracker({
  pledges,
  funds = [],
  stats,
  onCreatePledge,
  onUpdatePledge,
  onDeletePledge
}: PledgeTrackerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedPledge, setSelectedPledge] = useState<Pledge | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formFundId, setFormFundId] = useState<string>('')
  const [formAmount, setFormAmount] = useState('')
  const [formFrequency, setFormFrequency] = useState('monthly')
  const [formEndDate, setFormEndDate] = useState('')
  const [formNotes, setFormNotes] = useState('')

  const resetForm = () => {
    setFormFundId('')
    setFormAmount('')
    setFormFrequency('monthly')
    setFormEndDate('')
    setFormNotes('')
  }

  const handleCreate = async () => {
    if (!formAmount || Number(formAmount) <= 0) return

    setSaving(true)
    try {
      await onCreatePledge({
        fund_id: formFundId || null,
        amount: Number(formAmount),
        frequency: formFrequency,
        end_date: formEndDate || null,
        notes: formNotes || null
      })
      setShowCreateDialog(false)
      resetForm()
    } catch (error) {
      console.error('Error creating pledge:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (pledge: Pledge) => {
    setSelectedPledge(pledge)
    setFormFundId(pledge.fund?.id || '')
    setFormAmount(String(pledge.amount))
    setFormFrequency(pledge.frequency)
    setFormEndDate(pledge.end_date || '')
    setFormNotes(pledge.notes || '')
    setShowEditDialog(true)
  }

  const handleUpdate = async () => {
    if (!selectedPledge || !formAmount) return

    setSaving(true)
    try {
      await onUpdatePledge({
        id: selectedPledge.id,
        amount: Number(formAmount),
        frequency: formFrequency,
        end_date: formEndDate || null,
        notes: formNotes || null
      })
      setShowEditDialog(false)
      setSelectedPledge(null)
      resetForm()
    } catch (error) {
      console.error('Error updating pledge:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pledge?')) return

    try {
      await onDeletePledge(id)
    } catch (error) {
      console.error('Error deleting pledge:', error)
    }
  }

  const handleToggleActive = async (pledge: Pledge) => {
    try {
      await onUpdatePledge({
        id: pledge.id,
        is_active: !pledge.is_active
      })
    } catch (error) {
      console.error('Error toggling pledge:', error)
    }
  }

  const formatFrequency = (freq: string) => {
    const labels: Record<string, string> = {
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'yearly': 'Yearly',
      'one-time': 'One-time'
    }
    return labels[freq] || freq
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-navy/10 dark:bg-gold/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-navy dark:text-gold" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Pledges</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.active_pledges}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Target</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.total_pledged_monthly.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.average_progress}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pledges List */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">My Giving Pledges</CardTitle>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-navy hover:bg-navy/90 dark:bg-gold dark:text-navy"
          >
            <Target className="h-4 w-4 mr-2" />
            New Pledge
          </Button>
        </CardHeader>
        <CardContent>
          {pledges.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No pledges yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Set a giving goal to track your generosity journey.
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gold hover:bg-gold/90 text-navy"
              >
                Create Your First Pledge
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {pledges.map((pledge) => (
                <div
                  key={pledge.id}
                  className={`p-4 rounded-lg border ${
                    pledge.is_active
                      ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          ${pledge.amount.toLocaleString()}
                          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                            / {formatFrequency(pledge.frequency).toLowerCase()}
                          </span>
                        </h4>
                        {!pledge.is_active && (
                          <Badge variant="secondary" className="text-xs">Paused</Badge>
                        )}
                      </div>
                      {pledge.fund && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {pledge.fund.name}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(pledge)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(pledge)}>
                          {pledge.is_active ? (
                            <>
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resume
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(pledge.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        ${pledge.total_given.toLocaleString()} of ${pledge.expected_amount.toLocaleString()}
                      </span>
                      <span className={`font-medium ${
                        pledge.progress >= 100
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {pledge.progress}%
                      </span>
                    </div>
                    <Progress value={pledge.progress} className="h-2" />
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Started {format(new Date(pledge.start_date), 'MMM d, yyyy')}
                    </span>
                    {pledge.end_date && (
                      <span>
                        Ends {format(new Date(pledge.end_date), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>

                  {pledge.notes && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                      "{pledge.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Giving Pledge</DialogTitle>
            <DialogDescription>
              Set a giving goal to track your generosity
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="100.00"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formFrequency} onValueChange={setFormFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {funds.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="fund">Fund (Optional)</Label>
                <Select value={formFundId} onValueChange={setFormFundId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a fund" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General</SelectItem>
                    {funds.map((fund) => (
                      <SelectItem key={fund.id} value={fund.id}>
                        {fund.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="What inspired this pledge?"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving || !formAmount}
              className="bg-gold hover:bg-gold/90 text-navy"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Pledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pledge</DialogTitle>
            <DialogDescription>
              Update your giving pledge
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editAmount">Amount ($)</Label>
              <Input
                id="editAmount"
                type="number"
                min="1"
                step="0.01"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editFrequency">Frequency</Label>
              <Select value={formFrequency} onValueChange={setFormFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editEndDate">End Date</Label>
              <Input
                id="editEndDate"
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editNotes">Notes</Label>
              <Textarea
                id="editNotes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={saving || !formAmount}
              className="bg-navy hover:bg-navy/90"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
