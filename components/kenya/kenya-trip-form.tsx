'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'

export function KenyaTripForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cityState: '',
    preferredTrack: '',
    passportStatus: '',
    scholarshipNeeded: '',
    notes: '',
    consent: false,
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/public/kenya-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-8 text-center">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-navy mb-2">Application Received!</h3>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in the Kenya Kingdom Impact Trip. We'll review your application and be in touch soon.
          </p>
          <p className="text-sm text-gray-500">
            Questions? Email us at <a href="mailto:info@tpcmin.org" className="text-gold hover:underline">info@tpcmin.org</a>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="cityState">City/State</Label>
            <Input
              id="cityState"
              value={formData.cityState}
              onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
              placeholder="e.g., Atlanta, GA"
            />
          </div>

          {/* Preferred Track */}
          <div className="space-y-2">
            <Label htmlFor="preferredTrack">Preferred Service Track *</Label>
            <Select
              value={formData.preferredTrack}
              onValueChange={(value) => setFormData({ ...formData, preferredTrack: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a track" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ministry">Ministry & Spiritual Care</SelectItem>
                <SelectItem value="education">Education & Youth Development</SelectItem>
                <SelectItem value="medical">Medical Missions</SelectItem>
                <SelectItem value="business">Business & Economic Development</SelectItem>
                <SelectItem value="food-security">Food Security & Social Enterprise</SelectItem>
                <SelectItem value="not-sure">Not Sure Yet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Passport Status */}
          <div className="space-y-2">
            <Label htmlFor="passportStatus">Passport Status *</Label>
            <Select
              value={formData.passportStatus}
              onValueChange={(value) => setFormData({ ...formData, passportStatus: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your passport status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="valid">Have valid passport</SelectItem>
                <SelectItem value="renew">Need to renew</SelectItem>
                <SelectItem value="apply">Need to apply</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scholarship */}
          <div className="space-y-2">
            <Label htmlFor="scholarshipNeeded">Scholarship Needed? *</Label>
            <Select
              value={formData.scholarshipNeeded}
              onValueChange={(value) => setFormData({ ...formData, scholarshipNeeded: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Skills / Background</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Tell us about relevant skills, experience, or anything else you'd like to share..."
              rows={4}
            />
          </div>

          {/* Consent */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="consent"
              checked={formData.consent}
              onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
              required
            />
            <Label htmlFor="consent" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
              I agree to be contacted by TPC Ministries regarding the Kenya trip. *
            </Label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || !formData.consent}
            className="w-full bg-green-700 hover:bg-green-800 text-lg py-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
