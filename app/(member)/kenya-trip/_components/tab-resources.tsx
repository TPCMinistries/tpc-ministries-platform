'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, ExternalLink, ChevronDown, ChevronRight, Camera } from 'lucide-react'
import { CulturalGuide } from './cultural-guide'
import type { DelegateData } from './use-delegate-data'

interface TabResourcesProps {
  data: DelegateData
}

export function TabResources({ data }: TabResourcesProps) {
  const { documents, faqs } = data
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Cultural Guide */}
      <CulturalGuide />

      {/* Downloadable Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Important files and forms</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No documents available yet</p>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <a
                  key={doc.id}
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-navy" />
                  <div className="flex-1">
                    <p className="font-medium">{doc.name}</p>
                    {doc.description && (
                      <p className="text-sm text-gray-500">{doc.description}</p>
                    )}
                  </div>
                  {doc.is_required && (
                    <Badge className="bg-red-100 text-red-800">Required</Badge>
                  )}
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {faqs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No FAQs available yet</p>
          ) : (
            <div className="space-y-2">
              {faqs.map(faq => {
                const isOpen = openFaq === faq.id
                return (
                  <div key={faq.id} className="border rounded-lg">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="font-medium text-navy">{faq.question}</span>
                      {faq.category && (
                        <Badge variant="outline" className="ml-auto text-xs">{faq.category}</Badge>
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pl-11">
                        <p className="text-sm text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Guidelines */}
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-pink-600" />
            Media Guidelines
          </CardTitle>
          <p className="text-sm text-gray-600">
            Upload your photos, videos, and reels daily so the media team can curate and share.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 mb-6">
            <a
              href="https://drive.google.com/drive/folders/1L1-XFFcbx8OwD2aYaDusUYduuzAXs5jO?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors"
            >
              <span className="text-2xl">📁</span>
              <div>
                <p className="text-sm font-semibold text-pink-900">Google Drive Folder</p>
                <p className="text-xs text-pink-600">Upload photos & videos here</p>
              </div>
              <ExternalLink className="h-4 w-4 text-pink-400 ml-auto" />
            </a>
            <a
              href="https://chat.whatsapp.com/REPLACE_WITH_GROUP_LINK"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
            >
              <span className="text-2xl">💬</span>
              <div>
                <p className="text-sm font-semibold text-green-900">WhatsApp Media Group</p>
                <p className="text-xs text-green-600">Quick shares & coordination</p>
              </div>
              <ExternalLink className="h-4 w-4 text-green-400 ml-auto" />
            </a>
          </div>

          {/* Content Guidelines */}
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-base">📸</span>
              <p><strong>Photos:</strong> Capture moments of impact — ministry, medical camps, conferences, team life. Landscape orientation preferred for social media.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-base">🎥</span>
              <p><strong>Video:</strong> Short clips (15-60 sec) of key moments. Vertical for reels/stories, horizontal for YouTube.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-base">📝</span>
              <p><strong>Captions:</strong> Include who, what, where in the filename or a quick text message in WhatsApp.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-base">⏰</span>
              <p><strong>Timing:</strong> Upload daily before dinner so the media team can post while it&apos;s fresh.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-base">🙏</span>
              <p><strong>Consent:</strong> Get verbal permission before photographing locals, especially children. No medical patient photos without consent.</p>
            </div>
          </div>

          {/* Pack the Mission */}
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-4">
            <span className="text-2xl">📦</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">Pack the Mission — Supply Drive</p>
              <p className="text-xs text-amber-700">Pledge items, fund supplies, or sponsor categories for the team.</p>
            </div>
            <a
              href="/kenya/pack-the-mission"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
            >
              View Campaign
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
