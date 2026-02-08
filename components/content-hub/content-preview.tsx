'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Monitor, Smartphone } from 'lucide-react'
import '@/components/editor/editor-styles.css'

interface ContentPreviewProps {
  open: boolean
  onClose: () => void
  title: string
  html: string
}

export default function ContentPreview({ open, onClose, title, html }: ContentPreviewProps) {
  const [width, setWidth] = useState<'desktop' | 'mobile'>('desktop')

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-navy">Preview</DialogTitle>
            <div className="flex border rounded-md">
              <Button
                variant={width === 'desktop' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setWidth('desktop')}
              >
                <Monitor className="h-4 w-4 mr-1" />
                Desktop
              </Button>
              <Button
                variant={width === 'mobile' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setWidth('mobile')}
              >
                <Smartphone className="h-4 w-4 mr-1" />
                Mobile
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto flex justify-center p-4 bg-gray-50 rounded-lg">
          <div
            className={`bg-white rounded-lg shadow-sm p-8 transition-all ${
              width === 'mobile' ? 'max-w-sm w-full' : 'max-w-3xl w-full'
            }`}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{title || 'Untitled'}</h1>
            {html ? (
              <div
                className="prose-content"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="text-gray-400 italic">No content yet</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
