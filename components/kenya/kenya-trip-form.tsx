'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-stone-900 mb-2">Application Received!</h3>
        <p className="text-stone-600 mb-6">
          Thank you for your interest in the Kenya Kingdom Impact Trip. We'll review your application and be in touch soon.
        </p>
        <p className="text-sm text-stone-500">
          Questions? Email us at{' '}
          <a href="mailto:info@tpcmin.org" className="text-amber-600 hover:underline font-medium">
            info@tpcmin.org
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-stone-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-stone-700 font-medium">
              First Name <span className="text-amber-600">*</span>
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              className="bg-white text-stone-900 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-stone-700 font-medium">
              Last Name <span className="text-amber-600">*</span>
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              className="bg-white text-stone-900 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-stone-700 font-medium">
              Email <span className="text-amber-600">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-white text-stone-900 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-stone-700 font-medium">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-white text-stone-900 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="cityState" className="text-stone-700 font-medium">
            City/State
          </Label>
          <Input
            id="cityState"
            value={formData.cityState}
            onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
            placeholder="e.g., Atlanta, GA"
            className="bg-white text-stone-900 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
          />
        </div>

        {/* Preferred Track */}
        <div className="space-y-2">
          <Label htmlFor="preferredTrack" className="text-stone-700 font-medium">
            Preferred Service Track <span className="text-amber-600">*</span>
          </Label>
          <Select
            value={formData.preferredTrack}
            onValueChange={(value) => setFormData({ ...formData, preferredTrack: value })}
            required
          >
            <SelectTrigger className="bg-white text-stone-900 border-stone-300 focus:border-amber-500 focus:ring-amber-500">
              <SelectValue placeholder="Select a track" />
            </SelectTrigger>
            <SelectContent className="bg-white text-stone-900 border-stone-200">
              <SelectItem value="ministry" className="focus:bg-amber-50">Ministry & Spiritual Care</SelectItem>
              <SelectItem value="education" className="focus:bg-amber-50">Education & Youth Development</SelectItem>
              <SelectItem value="medical" className="focus:bg-amber-50">Medical Missions</SelectItem>
              <SelectItem value="business" className="focus:bg-amber-50">Business & Economic Development</SelectItem>
              <SelectItem value="food-security" className="focus:bg-amber-50">Food Security & Social Enterprise</SelectItem>
              <SelectItem value="not-sure" className="focus:bg-amber-50">Not Sure Yet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Passport Status */}
        <div className="space-y-2">
          <Label htmlFor="passportStatus" className="text-stone-700 font-medium">
            Passport Status <span className="text-amber-600">*</span>
          </Label>
          <Select
            value={formData.passportStatus}
            onValueChange={(value) => setFormData({ ...formData, passportStatus: value })}
            required
          >
            <SelectTrigger className="bg-white text-stone-900 border-stone-300 focus:border-amber-500 focus:ring-amber-500">
              <SelectValue placeholder="Select your passport status" />
            </SelectTrigger>
            <SelectContent className="bg-white text-stone-900 border-stone-200">
              <SelectItem value="valid" className="focus:bg-amber-50">Have valid passport</SelectItem>
              <SelectItem value="renew" className="focus:bg-amber-50">Need to renew</SelectItem>
              <SelectItem value="apply" className="focus:bg-amber-50">Need to apply</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Scholarship */}
        <div className="space-y-2">
          <Label htmlFor="scholarshipNeeded" className="text-stone-700 font-medium">
            Scholarship Needed? <span className="text-amber-600">*</span>
          </Label>
          <Select
            value={formData.scholarshipNeeded}
            onValueChange={(value) => setFormData({ ...formData, scholarshipNeeded: value })}
            required
          >
            <SelectTrigger className="bg-white text-stone-900 border-stone-300 focus:border-amber-500 focus:ring-amber-500">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="bg-white text-stone-900 border-stone-200">
              <SelectItem value="yes" className="focus:bg-amber-50">Yes, I would like to apply</SelectItem>
              <SelectItem value="no" className="focus:bg-amber-50">No, I can cover full cost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-stone-700 font-medium">
            Notes / Skills / Background
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Tell us about relevant skills, experience, or anything else you'd like to share..."
            rows={4}
            className="bg-white text-stone-900 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
          />
        </div>

        {/* Consent */}
        <div className="flex items-start space-x-3 bg-stone-50 rounded-lg p-4 border border-stone-200">
          <Checkbox
            id="consent"
            checked={formData.consent}
            onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
            required
            className="mt-0.5 border-stone-400 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
          />
          <Label htmlFor="consent" className="text-sm text-stone-600 leading-relaxed cursor-pointer">
            I agree to be contacted by TPC Ministries regarding the Kenya Kingdom Impact Trip. <span className="text-amber-600">*</span>
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
          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-lg h-14 rounded-xl disabled:opacity-50"
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
    </div>
  )
}
