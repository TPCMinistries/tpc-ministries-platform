'use client'

import { useState, useRef } from 'react'
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
import { CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { showToast } from '@/lib/toast'

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
  const [shake, setShake] = useState(false)
  const formTopRef = useRef<HTMLDivElement>(null)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Client-side validation with clear feedback
    const missing: string[] = []
    if (!formData.firstName) missing.push('First Name')
    if (!formData.lastName) missing.push('Last Name')
    if (!formData.email) missing.push('Email')
    if (!formData.preferredTrack) missing.push('Service Track')
    if (!formData.passportStatus) missing.push('Passport Status')
    if (!formData.scholarshipNeeded) missing.push('Scholarship')
    if (!formData.consent) missing.push('Consent checkbox')

    if (missing.length > 0) {
      const msg = `Missing required fields: ${missing.join(', ')}`
      setError(msg)
      showToast.error('Please fix before submitting', msg)
      triggerShake()
      setLoading(false)
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    try {
      const res = await fetch('/api/public/kenya-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSubmitted(true)
        showToast.success('Application submitted!', 'We\'ll review and be in touch soon.')
      } else {
        const data = await res.json()
        const errMsg = data.error || 'Something went wrong. Please try again.'
        setError(errMsg)
        showToast.error('Submission failed', errMsg)
        triggerShake()
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } catch {
      const errMsg = 'Failed to submit. Please check your internet connection and try again.'
      setError(errMsg)
      showToast.error('Connection error', errMsg)
      triggerShake()
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
    <div ref={formTopRef} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-stone-200">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Please fix the following:</p>
            <p>{error}</p>
          </div>
        </div>
      )}
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
              <SelectItem value="health" className="focus:bg-amber-50">Health & Wellness</SelectItem>
              <SelectItem value="education" className="focus:bg-amber-50">Education & Youth Development</SelectItem>
              <SelectItem value="business" className="focus:bg-amber-50">Business & Economic Development</SelectItem>
              <SelectItem value="all" className="focus:bg-amber-50">All Ministries</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Passport Status */}
        <div className="space-y-3">
          <Label className="text-stone-700 font-medium">
            Passport Status <span className="text-amber-600">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'valid', label: 'I have a valid passport', icon: '✓' },
              { value: 'renew', label: 'Need to renew', icon: '↻' },
              { value: 'apply', label: 'Need to apply', icon: '+' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, passportStatus: option.value })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.passportStatus === option.value
                    ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                    : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${formData.passportStatus === option.value ? 'text-amber-600' : 'text-stone-400'}`}>
                    {option.icon}
                  </span>
                  <span className={`text-sm font-medium ${formData.passportStatus === option.value ? 'text-amber-700' : 'text-stone-700'}`}>
                    {option.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
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
          className={`w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-lg h-14 rounded-xl disabled:opacity-50 active:scale-[0.98] transition-transform ${shake ? 'animate-shake' : ''}`}
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
