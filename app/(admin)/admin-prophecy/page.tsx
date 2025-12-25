'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Upload,
  Sparkles,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Plus,
  CheckCircle,
  UserPlus,
  Users,
  Send,
  Clock,
  Eye,
  EyeOff,
  FileAudio,
  FileVideo,
  X,
  MoreHorizontal,
  Calendar,
  Filter,
  Download,
  Play,
  Pause,
  Volume2,
  Video,
  Globe,
  User,
  Mail,
  Bell,
  CheckCheck,
  AlertCircle,
  ArrowUpDown,
  ChevronDown,
  RefreshCw,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

// ============ INTERFACES ============
interface Prophecy {
  id: string
  title: string
  content: string
  prophecy_type: 'broadcast' | 'personal'
  delivery_scope: 'all' | 'partners' | 'members' | 'individual'
  prophecy_date: string
  scheduled_date?: string
  status: 'draft' | 'scheduled' | 'sent' | 'archived'
  themes?: string
  audio_url?: string
  video_url?: string
  recipient_id?: string
  recipient?: Member
  is_featured: boolean
  delivery_stats?: {
    total_recipients: number
    delivered: number
    viewed: number
  }
  created_at: string
  updated_at: string
}

interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  tier: string
  phone?: string
}

interface ProphecyDelivery {
  id: string
  prophecy_id: string
  member_id: string
  status: 'pending' | 'sent' | 'delivered' | 'viewed'
  sent_at?: string
  viewed_at?: string
  member?: Member
}

type SortField = 'title' | 'prophecy_date' | 'status' | 'prophecy_type'
type SortDirection = 'asc' | 'desc'

export default function AdminProphecyPage() {
  // ============ STATE ============
  const [prophecies, setProphecies] = useState<Prophecy[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'broadcast' | 'personal'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'sent' | 'archived'>('all')
  const [sortField, setSortField] = useState<SortField>('prophecy_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)

  // Selected items
  const [editingProphecy, setEditingProphecy] = useState<Prophecy | null>(null)
  const [previewProphecy, setPreviewProphecy] = useState<Prophecy | null>(null)
  const [selectedProphecies, setSelectedProphecies] = useState<string[]>([])

  // Form state
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // File upload
  const [dragActive, setDragActive] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>('')
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('')

  // Recipient selection
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([])

  const { toast } = useToast()

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    prophecy_type: 'broadcast' as 'broadcast' | 'personal',
    delivery_scope: 'all' as 'all' | 'partners' | 'members' | 'individual',
    themes: '',
    audio_url: '',
    video_url: '',
    is_featured: false,
    scheduled_date: '',
    scheduled_time: '',
    send_notification: true,
  })

  // ============ EFFECTS ============
  useEffect(() => {
    fetchProphecies()
    fetchMembers()
  }, [])

  // ============ DATA FETCHING ============
  const fetchProphecies = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('prophecies')
        .select(`
          *,
          recipient:members!prophecies_recipient_id_fkey(id, first_name, last_name, email, tier)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching prophecies:', error)
        toast({
          title: 'Error',
          description: 'Failed to load prophecies',
          variant: 'destructive',
        })
      } else {
        setProphecies(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, tier, phone')
        .order('first_name', { ascending: true })

      if (!error && data) {
        setMembers(data)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  // ============ FILE UPLOAD ============
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    handleFiles(files)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFiles(files)
    }
  }

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('audio/')) {
        setAudioFile(file)
        setAudioPreviewUrl(URL.createObjectURL(file))
      } else if (file.type.startsWith('video/')) {
        setVideoFile(file)
        setVideoPreviewUrl(URL.createObjectURL(file))
      }
    })
  }

  const uploadFile = async (file: File, type: 'audio' | 'video'): Promise<string | null> => {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${type}-${Date.now()}.${fileExt}`
    const filePath = `prophecies/${fileName}`

    setUploading(true)
    setUploadProgress(0)

    try {
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.error('Upload error:', error)
        toast({
          title: 'Upload Failed',
          description: `Failed to upload ${type} file`,
          variant: 'destructive',
        })
        return null
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      setUploadProgress(100)
      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading:', error)
      return null
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (type: 'audio' | 'video') => {
    if (type === 'audio') {
      setAudioFile(null)
      setAudioPreviewUrl('')
      setFormData(prev => ({ ...prev, audio_url: '' }))
    } else {
      setVideoFile(null)
      setVideoPreviewUrl('')
      setFormData(prev => ({ ...prev, video_url: '' }))
    }
  }

  // ============ FORM HANDLERS ============
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      prophecy_type: 'broadcast',
      delivery_scope: 'all',
      themes: '',
      audio_url: '',
      video_url: '',
      is_featured: false,
      scheduled_date: '',
      scheduled_time: '',
      send_notification: true,
    })
    setAudioFile(null)
    setVideoFile(null)
    setAudioPreviewUrl('')
    setVideoPreviewUrl('')
    setSelectedRecipientIds([])
    setMemberSearchQuery('')
  }

  const handleCreate = async (saveAsDraft: boolean = false) => {
    setSubmitting(true)
    const supabase = createClient()

    try {
      // Upload files if present
      let audioUrl = formData.audio_url
      let videoUrl = formData.video_url

      if (audioFile) {
        const url = await uploadFile(audioFile, 'audio')
        if (url) audioUrl = url
      }

      if (videoFile) {
        const url = await uploadFile(videoFile, 'video')
        if (url) videoUrl = url
      }

      // Determine status
      let status: 'draft' | 'scheduled' | 'sent' = 'draft'
      let scheduledDate = null

      if (!saveAsDraft) {
        if (formData.scheduled_date && formData.scheduled_time) {
          status = 'scheduled'
          scheduledDate = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`).toISOString()
        } else {
          status = 'sent'
        }
      }

      // Create prophecy
      const prophecyData: any = {
        title: formData.title,
        content: formData.content,
        prophecy_type: formData.prophecy_type,
        delivery_scope: formData.delivery_scope,
        themes: formData.themes || null,
        audio_url: audioUrl || null,
        video_url: videoUrl || null,
        is_featured: formData.is_featured,
        prophecy_date: new Date().toISOString(),
        scheduled_date: scheduledDate,
        status,
      }

      // Add recipient for personal prophecies
      if (formData.prophecy_type === 'personal' && selectedRecipientIds.length > 0) {
        prophecyData.recipient_id = selectedRecipientIds[0]
      }

      const { data, error } = await supabase
        .from('prophecies')
        .insert(prophecyData)
        .select()
        .single()

      if (error) {
        console.error('Error creating prophecy:', error)
        toast({
          title: 'Error',
          description: 'Failed to create prophecy',
          variant: 'destructive',
        })
        return
      }

      // If sending immediately, create delivery records and send notifications
      if (status === 'sent' && formData.send_notification) {
        await sendProphecyNotifications(data.id, formData.prophecy_type, formData.delivery_scope, selectedRecipientIds)
      }

      toast({
        title: 'Success',
        description: saveAsDraft
          ? 'Prophecy saved as draft'
          : status === 'scheduled'
            ? 'Prophecy scheduled for delivery'
            : 'Prophecy created and sent',
      })

      setIsCreateDialogOpen(false)
      resetForm()
      fetchProphecies()
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!editingProphecy) return
    setSubmitting(true)
    const supabase = createClient()

    try {
      // Upload new files if present
      let audioUrl = formData.audio_url
      let videoUrl = formData.video_url

      if (audioFile) {
        const url = await uploadFile(audioFile, 'audio')
        if (url) audioUrl = url
      }

      if (videoFile) {
        const url = await uploadFile(videoFile, 'video')
        if (url) videoUrl = url
      }

      const updateData: any = {
        title: formData.title,
        content: formData.content,
        prophecy_type: formData.prophecy_type,
        delivery_scope: formData.delivery_scope,
        themes: formData.themes || null,
        audio_url: audioUrl || null,
        video_url: videoUrl || null,
        is_featured: formData.is_featured,
        updated_at: new Date().toISOString(),
      }

      if (formData.prophecy_type === 'personal' && selectedRecipientIds.length > 0) {
        updateData.recipient_id = selectedRecipientIds[0]
      }

      const { error } = await supabase
        .from('prophecies')
        .update(updateData)
        .eq('id', editingProphecy.id)

      if (error) {
        console.error('Error updating prophecy:', error)
        toast({
          title: 'Error',
          description: 'Failed to update prophecy',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Prophecy updated successfully',
      })

      setIsEditDialogOpen(false)
      setEditingProphecy(null)
      resetForm()
      fetchProphecies()
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const sendProphecyNotifications = async (
    prophecyId: string,
    type: 'broadcast' | 'personal',
    scope: string,
    recipientIds: string[]
  ) => {
    const supabase = createClient()

    try {
      let targetMembers: Member[] = []

      if (type === 'personal') {
        targetMembers = members.filter(m => recipientIds.includes(m.id))
      } else {
        // Broadcast based on scope
        switch (scope) {
          case 'partners':
            targetMembers = members.filter(m => m.tier === 'partner')
            break
          case 'members':
            targetMembers = members.filter(m => ['member', 'partner'].includes(m.tier))
            break
          default:
            targetMembers = members
        }
      }

      // Create delivery records
      const deliveryRecords = targetMembers.map(member => ({
        prophecy_id: prophecyId,
        member_id: member.id,
        status: 'sent',
        sent_at: new Date().toISOString(),
      }))

      if (deliveryRecords.length > 0) {
        await supabase
          .from('prophecy_deliveries')
          .insert(deliveryRecords)
      }

      // TODO: Send actual notifications (email, push, etc.)
      console.log(`Sending prophecy to ${targetMembers.length} members`)
    } catch (error) {
      console.error('Error sending notifications:', error)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('prophecies')
        .delete()
        .eq('id', id)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete prophecy',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Prophecy deleted successfully',
      })
      fetchProphecies()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProphecies.length === 0) return
    if (!confirm(`Delete ${selectedProphecies.length} prophecies?`)) return

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('prophecies')
        .delete()
        .in('id', selectedProphecies)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete prophecies',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: `${selectedProphecies.length} prophecies deleted`,
      })
      setSelectedProphecies([])
      fetchProphecies()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const sendNow = async (prophecy: Prophecy) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('prophecies')
        .update({
          status: 'sent',
          updated_at: new Date().toISOString()
        })
        .eq('id', prophecy.id)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to send prophecy',
          variant: 'destructive',
        })
        return
      }

      // Send notifications
      await sendProphecyNotifications(
        prophecy.id,
        prophecy.prophecy_type,
        prophecy.delivery_scope,
        prophecy.recipient_id ? [prophecy.recipient_id] : []
      )

      toast({
        title: 'Success',
        description: 'Prophecy sent successfully',
      })
      fetchProphecies()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const openEditDialog = (prophecy: Prophecy) => {
    setEditingProphecy(prophecy)
    setFormData({
      title: prophecy.title,
      content: prophecy.content,
      prophecy_type: prophecy.prophecy_type,
      delivery_scope: prophecy.delivery_scope || 'all',
      themes: prophecy.themes || '',
      audio_url: prophecy.audio_url || '',
      video_url: prophecy.video_url || '',
      is_featured: prophecy.is_featured,
      scheduled_date: prophecy.scheduled_date ? prophecy.scheduled_date.split('T')[0] : '',
      scheduled_time: prophecy.scheduled_date ? prophecy.scheduled_date.split('T')[1]?.slice(0, 5) : '',
      send_notification: true,
    })
    if (prophecy.audio_url) setAudioPreviewUrl(prophecy.audio_url)
    if (prophecy.video_url) setVideoPreviewUrl(prophecy.video_url)
    if (prophecy.recipient_id) setSelectedRecipientIds([prophecy.recipient_id])
    setIsEditDialogOpen(true)
  }

  // ============ FILTERING & SORTING ============
  const filteredProphecies = prophecies
    .filter((prophecy) => {
      const matchesSearch =
        prophecy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prophecy.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || prophecy.prophecy_type === filterType
      const matchesStatus = filterStatus === 'all' || prophecy.status === filterStatus
      const matchesTab = activeTab === 'all' || prophecy.status === activeTab
      return matchesSearch && matchesType && matchesStatus && matchesTab
    })
    .sort((a, b) => {
      let aVal: any, bVal: any
      switch (sortField) {
        case 'title':
          aVal = a.title.toLowerCase()
          bVal = b.title.toLowerCase()
          break
        case 'prophecy_date':
          aVal = new Date(a.prophecy_date).getTime()
          bVal = new Date(b.prophecy_date).getTime()
          break
        case 'status':
          aVal = a.status
          bVal = b.status
          break
        case 'prophecy_type':
          aVal = a.prophecy_type
          bVal = b.prophecy_type
          break
        default:
          aVal = a.prophecy_date
          bVal = b.prophecy_date
      }
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      }
      return aVal < bVal ? 1 : -1
    })

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const toggleSelectAll = () => {
    if (selectedProphecies.length === filteredProphecies.length) {
      setSelectedProphecies([])
    } else {
      setSelectedProphecies(filteredProphecies.map(p => p.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedProphecies(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  // ============ STATS ============
  const stats = {
    total: prophecies.length,
    draft: prophecies.filter((p) => p.status === 'draft').length,
    scheduled: prophecies.filter((p) => p.status === 'scheduled').length,
    sent: prophecies.filter((p) => p.status === 'sent').length,
    broadcast: prophecies.filter((p) => p.prophecy_type === 'broadcast').length,
    personal: prophecies.filter((p) => p.prophecy_type === 'personal').length,
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'scheduled': return 'bg-blue-100 text-blue-700'
      case 'sent': return 'bg-green-100 text-green-700'
      case 'archived': return 'bg-gray-100 text-gray-500'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'broadcast': return 'bg-purple-100 text-purple-700'
      case 'personal': return 'bg-gold/20 text-gold'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Filter members for recipient selection
  const filteredMembers = members.filter(m =>
    m.first_name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    m.last_name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  // ============ RENDER ============
  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-8 w-8 text-gold" />
              <h1 className="text-4xl font-bold text-navy">Prophetic Words</h1>
            </div>
            <p className="text-gray-600">
              Create, schedule, and deliver prophetic words to your congregation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchProphecies}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              className="bg-navy hover:bg-navy/90"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Prophecy
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('all')}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-navy">{stats.total}</div>
              <p className="text-sm text-gray-600">Total</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('draft')}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
              <p className="text-sm text-gray-600">Drafts</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('scheduled')}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
              <p className="text-sm text-gray-600">Scheduled</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('sent')}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
              <p className="text-sm text-gray-600">Sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{stats.broadcast}</div>
              <p className="text-sm text-gray-600">Broadcast</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gold">{stats.personal}</div>
              <p className="text-sm text-gray-600">Personal</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search prophecies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="broadcast">Broadcast</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedProphecies.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{selectedProphecies.length} selected</span>
                  <Button variant="outline" size="sm" onClick={() => setSelectedProphecies([])}>
                    Clear
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prophecies Table */}
        <Card>
          <CardContent className="p-0">
            {filteredProphecies.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No prophecies found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  Create your first prophecy
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="py-3 px-4 text-left">
                        <Checkbox
                          checked={selectedProphecies.length === filteredProphecies.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th
                        className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:text-navy"
                        onClick={() => toggleSort('title')}
                      >
                        <div className="flex items-center gap-1">
                          Title
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th
                        className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:text-navy"
                        onClick={() => toggleSort('prophecy_type')}
                      >
                        <div className="flex items-center gap-1">
                          Type
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Recipient</th>
                      <th
                        className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:text-navy"
                        onClick={() => toggleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          Status
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Media</th>
                      <th
                        className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:text-navy"
                        onClick={() => toggleSort('prophecy_date')}
                      >
                        <div className="flex items-center gap-1">
                          Date
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProphecies.map((prophecy) => (
                      <tr key={prophecy.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Checkbox
                            checked={selectedProphecies.includes(prophecy.id)}
                            onCheckedChange={() => toggleSelect(prophecy.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-navy max-w-xs truncate">{prophecy.title}</div>
                          {prophecy.is_featured && (
                            <div className="flex items-center gap-1 mt-1">
                              <Sparkles className="h-3 w-3 text-gold" />
                              <span className="text-xs text-gold">Featured</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getTypeColor(prophecy.prophecy_type)}>
                            {prophecy.prophecy_type === 'broadcast' ? (
                              <><Globe className="h-3 w-3 mr-1" /> Broadcast</>
                            ) : (
                              <><User className="h-3 w-3 mr-1" /> Personal</>
                            )}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {prophecy.prophecy_type === 'personal' && prophecy.recipient ? (
                            <div className="text-sm">
                              <div className="font-medium">{prophecy.recipient.first_name} {prophecy.recipient.last_name}</div>
                              <div className="text-gray-500 text-xs">{prophecy.recipient.email}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 capitalize">
                              {prophecy.delivery_scope === 'all' ? 'All Members' : prophecy.delivery_scope}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(prophecy.status)}>
                            {prophecy.status === 'draft' && <Edit2 className="h-3 w-3 mr-1" />}
                            {prophecy.status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
                            {prophecy.status === 'sent' && <CheckCheck className="h-3 w-3 mr-1" />}
                            {prophecy.status.charAt(0).toUpperCase() + prophecy.status.slice(1)}
                          </Badge>
                          {prophecy.scheduled_date && prophecy.status === 'scheduled' && (
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDateTime(prophecy.scheduled_date)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {prophecy.audio_url && (
                              <Badge variant="outline" className="text-xs">
                                <FileAudio className="h-3 w-3 mr-1" />
                                Audio
                              </Badge>
                            )}
                            {prophecy.video_url && (
                              <Badge variant="outline" className="text-xs">
                                <FileVideo className="h-3 w-3 mr-1" />
                                Video
                              </Badge>
                            )}
                            {!prophecy.audio_url && !prophecy.video_url && (
                              <span className="text-xs text-gray-400">Text only</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(prophecy.prophecy_date)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            {prophecy.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sendNow(prophecy)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPreviewProphecy(prophecy)
                                setIsPreviewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(prophecy)}>
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {prophecy.status === 'draft' && (
                                  <DropdownMenuItem onClick={() => sendNow(prophecy)}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Now
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(prophecy.id, prophecy.title)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setIsEditDialogOpen(false)
            setEditingProphecy(null)
            resetForm()
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy">
                {editingProphecy ? 'Edit Prophecy' : 'Create New Prophecy'}
              </DialogTitle>
              <DialogDescription>
                {editingProphecy ? 'Update prophecy details' : 'Create and deliver a new prophetic word'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter prophecy title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Delivery Type *</Label>
                  <Select
                    value={formData.prophecy_type}
                    onValueChange={(value: 'broadcast' | 'personal') =>
                      setFormData({ ...formData, prophecy_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="broadcast">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Broadcast to Many
                        </div>
                      </SelectItem>
                      <SelectItem value="personal">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Personal (Individual)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Recipient Selection */}
              {formData.prophecy_type === 'broadcast' ? (
                <div className="space-y-2">
                  <Label>Audience *</Label>
                  <Select
                    value={formData.delivery_scope}
                    onValueChange={(value: any) => setFormData({ ...formData, delivery_scope: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members ({members.length})</SelectItem>
                      <SelectItem value="partners">Partners Only ({members.filter(m => m.tier === 'partner').length})</SelectItem>
                      <SelectItem value="members">Members & Partners ({members.filter(m => ['member', 'partner'].includes(m.tier)).length})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Select Recipient *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search members by name or email..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto border rounded-lg">
                    {filteredMembers.slice(0, 50).map((member) => (
                      <div
                        key={member.id}
                        className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                          selectedRecipientIds.includes(member.id)
                            ? 'bg-navy/10 border-navy'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedRecipientIds([member.id])}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{member.first_name} {member.last_name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                          <Badge variant="outline" className="capitalize">{member.tier}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedRecipientIds.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          Selected: {members.find(m => m.id === selectedRecipientIds[0])?.first_name}{' '}
                          {members.find(m => m.id === selectedRecipientIds[0])?.last_name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Prophetic Word *</Label>
                <textarea
                  id="content"
                  className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the prophetic word..."
                  required
                />
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <Label>Media Attachments</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-navy bg-navy/5' : 'border-gray-300 hover:border-navy/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop audio or video files here
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Supports MP3, WAV, MP4, MOV, WEBM
                  </p>
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </label>
                </div>

                {/* File Previews */}
                <div className="grid gap-4 md:grid-cols-2">
                  {(audioFile || audioPreviewUrl) && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileAudio className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Audio</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile('audio')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {audioFile && (
                        <p className="text-sm text-gray-500 truncate">{audioFile.name}</p>
                      )}
                      {audioPreviewUrl && (
                        <audio controls className="w-full mt-2">
                          <source src={audioPreviewUrl} />
                        </audio>
                      )}
                    </div>
                  )}

                  {(videoFile || videoPreviewUrl) && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileVideo className="h-5 w-5 text-purple-600" />
                          <span className="font-medium">Video</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile('video')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {videoFile && (
                        <p className="text-sm text-gray-500 truncate">{videoFile.name}</p>
                      )}
                      {videoPreviewUrl && (
                        <video controls className="w-full mt-2 rounded max-h-48">
                          <source src={videoPreviewUrl} />
                        </video>
                      )}
                    </div>
                  )}
                </div>

                {/* Manual URL inputs as fallback */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="audio_url">Or enter Audio URL</Label>
                    <Input
                      id="audio_url"
                      type="url"
                      placeholder="https://..."
                      value={formData.audio_url}
                      onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                      disabled={!!audioFile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="video_url">Or enter Video URL</Label>
                    <Input
                      id="video_url"
                      type="url"
                      placeholder="https://..."
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      disabled={!!videoFile}
                    />
                  </div>
                </div>
              </div>

              {/* Themes */}
              <div className="space-y-2">
                <Label htmlFor="themes">Themes (comma-separated)</Label>
                <Input
                  id="themes"
                  placeholder="e.g. Breakthrough, Healing, Purpose, New Season"
                  value={formData.themes}
                  onChange={(e) => setFormData({ ...formData, themes: e.target.value })}
                />
              </div>

              {/* Scheduling */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <Label className="text-base font-semibold">Delivery Options</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_date">Schedule Date (optional)</Label>
                    <Input
                      id="scheduled_date"
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_time">Schedule Time</Label>
                    <Input
                      id="scheduled_time"
                      type="time"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                      disabled={!formData.scheduled_date}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="send_notification"
                    checked={formData.send_notification}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, send_notification: checked as boolean })
                    }
                  />
                  <Label htmlFor="send_notification" className="cursor-pointer">
                    Send notification to recipients
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_featured: checked as boolean })
                    }
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Feature this prophecy
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  setIsEditDialogOpen(false)
                  setEditingProphecy(null)
                  resetForm()
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              {!editingProphecy && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCreate(true)}
                  disabled={submitting || !formData.title || !formData.content}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Save as Draft
                </Button>
              )}
              <Button
                type="button"
                className="bg-navy hover:bg-navy/90"
                onClick={() => editingProphecy ? handleEdit() : handleCreate(false)}
                disabled={submitting || !formData.title || !formData.content || (formData.prophecy_type === 'personal' && selectedRecipientIds.length === 0)}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploading ? 'Uploading...' : 'Saving...'}
                  </>
                ) : editingProphecy ? (
                  'Update Prophecy'
                ) : formData.scheduled_date ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Schedule
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Now
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-gold" />
                {previewProphecy?.title}
              </DialogTitle>
              <DialogDescription>
                {previewProphecy?.prophecy_type === 'broadcast' ? 'Broadcast Word' : 'Personal Prophecy'}
                {' • '}
                {previewProphecy?.prophecy_date && formatDate(previewProphecy.prophecy_date)}
              </DialogDescription>
            </DialogHeader>

            {previewProphecy && (
              <div className="space-y-4 py-4">
                {/* Themes */}
                {previewProphecy.themes && (
                  <div className="flex flex-wrap gap-2">
                    {previewProphecy.themes.split(',').map((theme, i) => (
                      <Badge key={i} variant="outline">{theme.trim()}</Badge>
                    ))}
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-navy max-w-none">
                  <p className="whitespace-pre-wrap">{previewProphecy.content}</p>
                </div>

                {/* Media */}
                {previewProphecy.audio_url && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileAudio className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Audio Recording</span>
                    </div>
                    <audio controls className="w-full">
                      <source src={previewProphecy.audio_url} />
                    </audio>
                  </div>
                )}

                {previewProphecy.video_url && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileVideo className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Video Recording</span>
                    </div>
                    <video controls className="w-full rounded">
                      <source src={previewProphecy.video_url} />
                    </video>
                  </div>
                )}

                {/* Recipient Info */}
                {previewProphecy.prophecy_type === 'personal' && previewProphecy.recipient && (
                  <div className="p-4 bg-gold/10 border border-gold/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gold" />
                      <span className="font-medium">Personal word for:</span>
                    </div>
                    <div className="mt-2">
                      <div className="font-semibold">{previewProphecy.recipient.first_name} {previewProphecy.recipient.last_name}</div>
                      <div className="text-sm text-gray-600">{previewProphecy.recipient.email}</div>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Badge className={getStatusColor(previewProphecy.status)}>
                    {previewProphecy.status.charAt(0).toUpperCase() + previewProphecy.status.slice(1)}
                  </Badge>
                  {previewProphecy.is_featured && (
                    <Badge className="bg-gold/20 text-gold">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                Close
              </Button>
              {previewProphecy?.status === 'draft' && (
                <Button
                  className="bg-navy hover:bg-navy/90"
                  onClick={() => {
                    if (previewProphecy) sendNow(previewProphecy)
                    setIsPreviewDialogOpen(false)
                  }}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Now
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
