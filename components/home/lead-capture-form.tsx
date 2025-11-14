'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Loader2, Check, Heart } from 'lucide-react'
import { createLead } from '@/lib/db/lead-queries'
import { useToast } from '@/hooks/use-toast'

const interestOptions = [
  { id: 'teachings', label: 'Teachings & Sermons' },
  { id: 'prayer', label: 'Prayer Support' },
  { id: 'giving', label: 'Giving & Supporting Missions' },
  { id: 'events', label: 'Live Events & Gatherings' },
  { id: 'prophecy', label: 'Personal Prophecy' },
  { id: 'missions', label: 'Mission Work (Kenya, South Africa, Grenada)' },
]

export default function LeadCaptureForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interests: [] as string[],
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const handleInterestToggle = (interestId: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((i) => i !== interestId)
        : [...prev.interests, interestId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: 'Required Fields',
        description: 'Please enter your name and email',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      // Create lead
      await createLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        interests: formData.interests,
        source: 'website',
      })

      // Send confirmation email (don't block on this)
      fetch('/api/email/send-lead-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          interests: formData.interests,
        }),
      }).catch((err) => console.error('Failed to send confirmation email:', err))

      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', interests: [] })

      toast({
        title: 'Welcome!',
        description: "Thanks! We'll be in touch soon. Check your email for a welcome message.",
      })

      // Reset success state after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (error: any) {
      console.error('Error creating lead:', error)
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-gradient-to-br from-navy to-navy-800 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-4">
                We've received your information and will be in touch soon.
              </p>
              <p className="text-sm text-gray-500">
                Check your email for a welcome message from TPC Ministries.
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-navy to-navy-800 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/20 mb-4">
            <Heart className="h-6 w-6 text-gold" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Join Our Community
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Get updates, teachings, and prophetic insights delivered to you
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-navy font-medium">
                Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={submitting}
                required
                className="mt-1"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-navy font-medium">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={submitting}
                required
                className="mt-1"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-navy font-medium">
                Phone <span className="text-gray-500 font-normal">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={submitting}
                className="mt-1"
              />
            </div>

            {/* Interests */}
            <div>
              <Label className="text-navy font-medium mb-3 block">
                I'm interested in:
              </Label>
              <div className="grid gap-3 md:grid-cols-2">
                {interestOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={formData.interests.includes(option.id)}
                      onCheckedChange={() => handleInterestToggle(option.id)}
                      disabled={submitting}
                    />
                    <Label
                      htmlFor={option.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold hover:bg-gold/90 text-navy font-semibold text-lg py-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Stay Connected'
              )}
            </Button>

            {/* Privacy Text */}
            <p className="text-xs text-center text-gray-500">
              We respect your privacy and will never spam you.
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}
