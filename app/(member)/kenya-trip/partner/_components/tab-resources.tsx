'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText, Download, HelpCircle, ChevronDown, ChevronRight, BookOpen, Camera, FolderOpen
} from 'lucide-react'
import { useState } from 'react'
import type { PartnerData } from './use-partner-data'

interface TabResourcesProps {
  data: PartnerData
}

export function TabResources({ data }: TabResourcesProps) {
  const { documents, faqs } = data
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  // Group documents by category
  const docsByCategory: Record<string, typeof documents> = {}
  for (const doc of documents) {
    const cat = doc.category || 'general'
    if (!docsByCategory[cat]) docsByCategory[cat] = []
    docsByCategory[cat].push(doc)
  }

  // Group faqs by category
  const faqsByCategory: Record<string, typeof faqs> = {}
  for (const faq of faqs) {
    const cat = faq.category || 'general'
    if (!faqsByCategory[cat]) faqsByCategory[cat] = []
    faqsByCategory[cat].push(faq)
  }

  return (
    <div className="space-y-6">
      {/* Documents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-navy">
            <FileText className="h-5 w-5" />
            Trip Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No documents available yet. Check back as the admin team uploads materials.
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(docsByCategory).map(([category, docs]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {category}
                  </p>
                  <div className="space-y-2">
                    {docs.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <FileText className="h-5 w-5 text-[#006B3F] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-navy group-hover:text-[#006B3F] transition-colors">
                            {doc.name}
                          </p>
                          {doc.description && (
                            <p className="text-xs text-gray-500 truncate">{doc.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {doc.is_required && (
                            <Badge className="bg-red-100 text-red-800 text-xs">Required</Badge>
                          )}
                          <Download className="h-4 w-4 text-gray-400 group-hover:text-[#006B3F]" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-navy">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {faqs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No FAQs available yet.
            </p>
          ) : (
            <div className="space-y-1">
              {Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
                <div key={category} className="mb-4">
                  {Object.keys(faqsByCategory).length > 1 && (
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{category}</p>
                  )}
                  {categoryFaqs.map((faq) => (
                    <div key={faq.id} className="border-b border-gray-100 last:border-0">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                        className="w-full flex items-center gap-3 py-3 text-left hover:bg-gray-50 transition-colors px-2 rounded"
                      >
                        {expandedFaq === faq.id ? (
                          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span className="font-medium text-sm text-navy">{faq.question}</span>
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="pl-9 pb-3 pr-2">
                          <p className="text-sm text-gray-600 whitespace-pre-line">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Guidelines */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-navy">
            <Camera className="h-5 w-5" />
            Media Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              Photos and videos are encouraged! Please keep the following guidelines in mind:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Always ask permission before photographing individuals, especially children</li>
              <li>Avoid taking photos during sensitive moments (medical consultations, counseling)</li>
              <li>Share photos with the media team for trip documentation</li>
              <li>Do not post location-tagged photos in real time for security reasons</li>
              <li>All media may be used by TPC Ministries for promotional purposes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Local Resources Placeholder */}
      <Card className="border-dashed border-gray-300">
        <CardContent className="p-6 text-center">
          <FolderOpen className="h-10 w-10 mx-auto mb-2 text-gray-300" />
          <p className="font-medium text-gray-500">Local Resources</p>
          <p className="text-sm text-gray-400 mt-1">
            Coming soon: Upload local maps, contact sheets, and venue details for the delegation.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
