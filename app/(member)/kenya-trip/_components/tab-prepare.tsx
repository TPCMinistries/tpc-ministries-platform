'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle,
  Clock,
  File,
  Upload,
  Eye,
  Trash2,
  RefreshCw,
  CheckSquare,
  Square,
  AlertTriangle,
  ClipboardCheck,
  FileText,
  Shield,
} from 'lucide-react'
import { DOCUMENT_TYPES, DEADLINES } from './constants'
import type { DelegateData } from './use-delegate-data'
import type { Participant } from './types'

interface TabPrepareProps {
  data: DelegateData
}

export function TabPrepare({ data }: TabPrepareProps) {
  const { participant, packingItems, packingStatus, uploadingDoc } = data

  if (!participant) return null

  const packedCount = packingStatus.filter(s => s.is_packed).length
  const totalPacking = packingItems.length
  const packingPercent = totalPacking > 0 ? Math.round((packedCount / totalPacking) * 100) : 0

  // Readiness checklist items
  const readinessItems = [
    {
      label: 'Passport Valid',
      done: !!participant.passport_document_url || ['verified', 'valid'].some(s => (participant.passport_status || '').toLowerCase().includes(s)),
      urgent: true,
      deadline: DEADLINES.passport,
    },
    {
      label: 'Visa Ready',
      done: !!participant.visa_document_url || (participant.visa_status || '').toLowerCase().includes('approved'),
      urgent: true,
      deadline: DEADLINES.visa,
    },
    {
      label: 'Payment Complete',
      done: participant.payment_status === 'paid',
      urgent: true,
      deadline: DEADLINES.finalPayment,
    },
    {
      label: 'Travel Form',
      done: !!participant.travel_form_completed_at,
      urgent: false,
      deadline: DEADLINES.travelForm,
    },
    {
      label: 'Medical Form',
      done: !!participant.medical_form_completed_at,
      urgent: false,
      deadline: DEADLINES.healthForm,
    },
    {
      label: 'Liability Waiver',
      done: !!participant.waiver_signed_at,
      urgent: false,
      deadline: DEADLINES.waiverForm,
    },
    {
      label: 'Flight Booked',
      done: (participant.flight_status || '').includes('Booked'),
      urgent: true,
      deadline: undefined,
    },
  ]

  const readyCount = readinessItems.filter(i => i.done).length
  const readyPercent = Math.round((readyCount / readinessItems.length) * 100)

  return (
    <div className="grid gap-6">
      {/* Readiness Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-navy" />
            Readiness Checklist
          </CardTitle>
          <CardDescription>
            {readyCount} of {readinessItems.length} items complete ({readyPercent}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={readyPercent} className="h-2 mb-4" />
          <div className="space-y-2">
            {readinessItems.map(item => (
              <div
                key={item.label}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  item.done ? 'bg-green-50 border-green-200' :
                  item.urgent ? 'bg-red-50 border-red-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                {item.done ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : item.urgent ? (
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-medium text-sm ${item.done ? 'text-green-700 line-through' : item.urgent ? 'text-red-700' : 'text-gray-700'}`}>
                    {item.label}
                  </p>
                </div>
                {!item.done && item.deadline && (
                  <span className="text-xs text-gray-500">
                    Due {new Date(item.deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                {item.done && (
                  <Badge className="bg-green-100 text-green-800 text-xs">Complete</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Uploads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            My Documents
          </CardTitle>
          <CardDescription>
            Upload required documents for trip verification. All file formats accepted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {DOCUMENT_TYPES.map((docType) => {
              const docUrl = participant[`${docType.key}_document_url` as keyof Participant] as string | null
              const isVerified = participant[`${docType.key}_document_verified` as keyof Participant] as boolean | undefined
              const isUploading = uploadingDoc === docType.key

              return (
                <div
                  key={docType.key}
                  className={`p-4 rounded-lg border-2 ${
                    docUrl ? 'border-green-200 bg-green-50' : docType.required ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {docUrl ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <File className="h-4 w-4 text-gray-400" />
                        )}
                        {docType.label}
                        {docType.required && !docUrl && (
                          <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-300">Required</Badge>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{docType.description}</p>
                    </div>
                  </div>

                  {/* Verification badge */}
                  {docUrl && (
                    <div className="mb-2">
                      <Badge className={`text-xs ${isVerified ? 'bg-green-600 text-white' : 'bg-yellow-100 text-yellow-800'}`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {isVerified ? 'Verified' : 'Pending Verification'}
                      </Badge>
                    </div>
                  )}

                  {docUrl ? (
                    <div className="flex items-center gap-2 mt-3">
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Eye className="h-4 w-4" />
                          View Document
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => data.deleteDocument(docType.key)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) data.uploadDocument(file, docType.key)
                          }}
                          disabled={isUploading}
                        />
                        <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed transition-colors ${
                          isUploading
                            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                            : 'border-navy/30 hover:border-navy hover:bg-navy/5 cursor-pointer'
                        }`}>
                          {isUploading ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 text-navy" />
                              <span className="text-sm text-navy font-medium">Upload File</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Accepted formats: PDF, JPG, PNG, DOC, DOCX, and more. Max 10MB per file.
          </p>
        </CardContent>
      </Card>

      {/* Forms Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Forms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <FormStatusItem
              label="Interest Form"
              completed={!!participant.interest_form_completed_at}
              completedDate={participant.interest_form_completed_at}
            />
            <FormStatusItem
              label="Travel Form"
              completed={!!participant.travel_form_completed_at}
              completedDate={participant.travel_form_completed_at}
              link="/kenya-trip/travel-form"
              deadline={DEADLINES.travelForm}
            />
            <FormStatusItem
              label="Health Form"
              completed={!!participant.medical_form_completed_at}
              completedDate={participant.medical_form_completed_at}
              link="/kenya-trip/health-form"
              deadline={DEADLINES.healthForm}
            />
          </div>
        </CardContent>
      </Card>

      {/* Packing Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Packing Checklist</CardTitle>
          <CardDescription>
            Track your packing progress &mdash; {packedCount} of {totalPacking} items packed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={packingPercent} className="h-2 mb-6" />

          {packingItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Packing list coming soon</p>
          ) : (
            <div className="space-y-6">
              {Array.from(new Set(packingItems.map(i => i.category))).map(category => (
                <div key={category}>
                  <h3 className="font-semibold text-navy capitalize mb-3">{category}</h3>
                  <div className="space-y-2">
                    {packingItems.filter(i => i.category === category).map(item => {
                      const isPacked = packingStatus.find(s => s.packing_item_id === item.id)?.is_packed
                      return (
                        <button
                          key={item.id}
                          onClick={() => data.togglePackingItem(item.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                            isPacked ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                          }`}
                        >
                          {isPacked ? (
                            <CheckSquare className="h-5 w-5 text-green-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                          <div className="flex-1">
                            <p className={`font-medium ${isPacked ? 'line-through text-gray-500' : ''}`}>
                              {item.item_name}
                            </p>
                            {item.description && (
                              <p className="text-sm text-gray-500">{item.description}</p>
                            )}
                          </div>
                          {item.is_required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </button>
                      )
                    })}
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

function FormStatusItem({
  label,
  completed,
  completedDate,
  link,
  deadline,
}: {
  label: string
  completed: boolean
  completedDate?: string | null
  link?: string
  deadline?: string
}) {
  const isOverdue = !completed && deadline && new Date(deadline + 'T23:59:59') < new Date()

  return (
    <div className={`p-4 rounded-lg border ${
      completed ? 'border-green-200 bg-green-50' :
      isOverdue ? 'border-red-200 bg-red-50' :
      'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        {completed ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : isOverdue ? (
          <AlertTriangle className="h-5 w-5 text-red-600" />
        ) : (
          <Clock className="h-5 w-5 text-gray-400" />
        )}
        <p className="font-medium text-sm">{label}</p>
      </div>
      {completed && completedDate ? (
        <p className="text-xs text-green-600">
          Completed {new Date(completedDate).toLocaleDateString()}
        </p>
      ) : link ? (
        <a href={link}>
          <Button size="sm" variant="outline" className="w-full mt-2">
            Complete Form
          </Button>
        </a>
      ) : (
        <p className="text-xs text-gray-500">
          {deadline ? `Due ${new Date(deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Pending'}
        </p>
      )}
    </div>
  )
}
