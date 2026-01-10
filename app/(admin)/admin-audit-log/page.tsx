'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  History,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  FileText,
  Settings,
  Trash2,
  Edit,
  Plus,
  Check,
  X,
  Eye,
  Loader2,
} from 'lucide-react'

interface AuditLogEntry {
  id: string
  admin_id: string
  admin_name: string
  action: string
  entity_type: string
  entity_id: string | null
  entity_name: string | null
  details: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

interface Filters {
  actions: string[]
  entityTypes: string[]
}

const actionIcons: Record<string, React.ReactNode> = {
  create: <Plus className="h-3.5 w-3.5 text-green-600" />,
  update: <Edit className="h-3.5 w-3.5 text-blue-600" />,
  delete: <Trash2 className="h-3.5 w-3.5 text-red-600" />,
  approve: <Check className="h-3.5 w-3.5 text-green-600" />,
  reject: <X className="h-3.5 w-3.5 text-red-600" />,
  view: <Eye className="h-3.5 w-3.5 text-gray-600" />,
  export: <Download className="h-3.5 w-3.5 text-purple-600" />,
  checkin: <Check className="h-3.5 w-3.5 text-green-600" />,
  complete: <Check className="h-3.5 w-3.5 text-green-600" />,
}

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  approve: 'bg-green-100 text-green-800',
  reject: 'bg-red-100 text-red-800',
  view: 'bg-gray-100 text-gray-800',
  export: 'bg-purple-100 text-purple-800',
  checkin: 'bg-green-100 text-green-800',
  complete: 'bg-green-100 text-green-800',
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<Filters>({ actions: [], entityTypes: [] })
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [selectedEntityType, setSelectedEntityType] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const limit = 25

  useEffect(() => {
    fetchLogs()
  }, [page, selectedAction, selectedEntityType])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (selectedAction) params.append('action', selectedAction)
      if (selectedEntityType) params.append('entity_type', selectedEntityType)

      const res = await fetch(`/api/admin/audit-log?${params}`)
      const data = await res.json()

      setLogs(data.logs || [])
      setTotal(data.total || 0)
      setFilters(data.filters || { actions: [], entityTypes: [] })
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return formatDate(dateString)
  }

  const totalPages = Math.ceil(total / limit)

  const filteredLogs = searchQuery
    ? logs.filter(
        log =>
          log.admin_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.entity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.action.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-navy flex items-center gap-3">
              <History className="h-8 w-8" />
              Audit Log
            </h1>
            <p className="text-gray-600 mt-1">Track all admin actions and changes</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-navy">{total.toLocaleString()}</div>
              <p className="text-sm text-gray-600">Total Actions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {logs.filter(l => l.action === 'create').length}
              </div>
              <p className="text-sm text-gray-600">Creates Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">
                {logs.filter(l => l.action === 'update').length}
              </div>
              <p className="text-sm text-gray-600">Updates Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">
                {logs.filter(l => l.action === 'delete').length}
              </div>
              <p className="text-sm text-gray-600">Deletes Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by admin, entity, or action..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  {filters.actions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Entity Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Entity Types</SelectItem>
                  {filters.entityTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(selectedAction || selectedEntityType) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedAction('')
                    setSelectedEntityType('')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Log Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Activity Log</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {total} entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-navy" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit log entries found</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Time</TableHead>
                      <TableHead className="w-[150px]">Admin</TableHead>
                      <TableHead className="w-[120px]">Action</TableHead>
                      <TableHead className="w-[140px]">Entity Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead className="w-[200px]">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          <div className="font-medium">{formatTimeAgo(log.created_at)}</div>
                          <div className="text-xs text-gray-500">{formatDate(log.created_at)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-navy text-white flex items-center justify-center text-xs font-medium">
                              {log.admin_name?.split(' ').map(n => n[0]).join('') || '?'}
                            </div>
                            <span className="text-sm font-medium">{log.admin_name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={actionColors[log.action] || 'bg-gray-100 text-gray-800'}>
                            <span className="flex items-center gap-1">
                              {actionIcons[log.action] || <FileText className="h-3.5 w-3.5" />}
                              {log.action}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">
                            {log.entity_type.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {log.entity_name || log.entity_id || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {log.details ? (
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded block max-w-[200px] truncate">
                              {JSON.stringify(log.details)}
                            </code>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
