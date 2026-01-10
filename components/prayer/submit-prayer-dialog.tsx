'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Heart } from 'lucide-react'

export function SubmitPrayerDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    request_text: '',
    category: 'spiritual',
    is_public: true,
    is_anonymous: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/prayer/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit prayer request')
      }

      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setFormData({
          request_text: '',
          category: 'spiritual',
          is_public: true,
          is_anonymous: false,
        })
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const characterCount = formData.request_text.length
  const maxChars = 500

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-gold hover:bg-gold-dark text-white">
          <Heart className="mr-2 h-5 w-5" />
          Submit Prayer Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-navy">Submit Prayer Request</DialogTitle>
          <DialogDescription>
            Share your prayer need with our community. We&apos;re here to pray with you.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Heart className="h-8 w-8 text-green-600 fill-current" />
            </div>
            <h3 className="text-xl font-semibold text-navy mb-2">
              Thank you for sharing
            </h3>
            <p className="text-gray-600">
              Your request is pending approval. We&apos;re praying with you.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div role="alert" aria-live="polite">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
              </div>

              {/* Prayer Request Text */}
              <div className="space-y-2">
                <Label htmlFor="request_text">Your Prayer Request *</Label>
                <textarea
                  id="request_text"
                  className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                  placeholder="Share what you'd like us to pray for..."
                  value={formData.request_text}
                  onChange={(e) =>
                    setFormData({ ...formData, request_text: e.target.value })
                  }
                  maxLength={maxChars}
                  required
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Be specific but concise</span>
                  <span className={characterCount > maxChars - 50 ? 'text-orange-600 font-medium' : ''}>
                    {characterCount}/{maxChars}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="health">Health</option>
                  <option value="family">Family</option>
                  <option value="financial">Financial</option>
                  <option value="spiritual">Spiritual</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Privacy Toggle */}
              <div className="space-y-2">
                <Label>Privacy</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      checked={formData.is_public}
                      onChange={() => setFormData({ ...formData, is_public: true })}
                      className="text-navy focus:ring-navy"
                    />
                    <span className="text-sm">Public (visible to all)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      checked={!formData.is_public}
                      onChange={() => setFormData({ ...formData, is_public: false })}
                      className="text-navy focus:ring-navy"
                    />
                    <span className="text-sm">Private (admins only)</span>
                  </label>
                </div>
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.is_anonymous}
                  onChange={(e) =>
                    setFormData({ ...formData, is_anonymous: e.target.checked })
                  }
                  className="rounded text-navy focus:ring-navy"
                />
                <Label htmlFor="anonymous" className="cursor-pointer">
                  Post anonymously
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-navy hover:bg-navy/90 text-white"
                disabled={loading || !formData.request_text.trim()}
              >
                {loading ? 'Submitting...' : 'Submit Prayer Request'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
