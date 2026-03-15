'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare, Plus, Star, FileText
} from 'lucide-react'
import type { Announcement, Document as TripDocument, FAQ } from './types'

interface TabCommsProps {
  announcements: Announcement[]
  documents: TripDocument[]
  faqs: FAQ[]
  setShowAnnouncementModal: (show: boolean) => void
}

export function TabComms({
  announcements, documents, faqs, setShowAnnouncementModal,
}: TabCommsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Announcements</CardTitle>
          <Button size="sm" onClick={() => setShowAnnouncementModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Announcement
          </Button>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map(ann => (
                <div key={ann.id} className={`border rounded-lg p-4 ${ann.is_pinned ? 'border-gold bg-gold/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      ann.priority === 'urgent' ? 'bg-red-500' :
                      ann.priority === 'high' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-navy">{ann.title}</h4>
                        {ann.is_pinned && <Star className="h-4 w-4 text-gold" />}
                        <Badge variant="outline" className="text-xs">{ann.target_audience}</Badge>
                      </div>
                      <p className="text-gray-600">{ann.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(ann.publish_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-gray-500 text-sm">No documents uploaded</p>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-navy" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.category}</p>
                    </div>
                    {doc.is_required && (
                      <Badge className="bg-red-100 text-red-800 text-xs">Required</Badge>
                    )}
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            {faqs.length === 0 ? (
              <p className="text-gray-500 text-sm">No FAQs added</p>
            ) : (
              <div className="space-y-3">
                {faqs.slice(0, 5).map(faq => (
                  <div key={faq.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm text-navy">{faq.question}</p>
                    <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
