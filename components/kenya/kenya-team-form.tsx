'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle,
  Loader2,
  Users,
  User,
  Briefcase,
  MapPin,
  Phone,
  Globe,
  AlertCircle,
} from 'lucide-react'
import { showToast } from '@/lib/toast'

interface KenyaTeamFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  kenyaTeamRole: string
  organization: string
  orgTitle: string
  city: string
  serviceTrack: string
  languagesSpoken: string
  tShirtSize: string
  howHeard: string
  emergencyContactName: string
  emergencyContactPhone: string
  notes: string
}

export function KenyaTeamForm() {
  const [formData, setFormData] = useState<KenyaTeamFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    kenyaTeamRole: '',
    organization: '',
    orgTitle: '',
    city: '',
    serviceTrack: '',
    languagesSpoken: '',
    tShirtSize: '',
    howHeard: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const formTopRef = useRef<HTMLDivElement>(null)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLInputElement>(null)

  const update = (field: keyof KenyaTeamFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate required fields
    const missing: string[] = []
    let firstMissingRef: React.RefObject<HTMLInputElement | null> | null = null

    if (!formData.firstName) {
      missing.push('First Name')
      if (!firstMissingRef) firstMissingRef = firstNameRef
    }
    if (!formData.lastName) {
      missing.push('Last Name')
      if (!firstMissingRef) firstMissingRef = lastNameRef
    }
    if (!formData.email) {
      missing.push('Email')
      if (!firstMissingRef) firstMissingRef = emailRef
    }
    if (!formData.phone) {
      missing.push('Phone')
      if (!firstMissingRef) firstMissingRef = phoneRef
    }
    if (!formData.kenyaTeamRole) {
      missing.push('Role')
    }
    if (!formData.city) {
      missing.push('City')
      if (!firstMissingRef) firstMissingRef = cityRef
    }

    if (missing.length > 0) {
      const msg = `Missing required fields: ${missing.join(', ')}`
      setError(msg)
      showToast.error('Please fix before submitting', msg)
      triggerShake()
      setLoading(false)
      if (firstMissingRef?.current) {
        firstMissingRef.current.focus()
        firstMissingRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return
    }

    try {
      const res = await fetch('/api/kenya/kenya-team-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSubmitted(true)
        showToast.success('Registration submitted!', 'You\'ll receive a confirmation email shortly.')
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 sm:p-8 border border-green-200 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2">Asante Sana! Registration Received!</h3>
        <p className="text-stone-600 mb-4 text-sm sm:text-base">
          Thank you for joining the Kenya team for the Kingdom Impact Trip 2026. Our team will review your registration and be in touch soon.
        </p>
        <p className="text-stone-600 mb-6 text-sm sm:text-base">
          You&apos;ll receive a confirmation email shortly with next steps.
        </p>
        <p className="text-sm text-stone-500">
          Questions? Email us at{' '}
          <a href="mailto:info@tpcmin.org" className="text-green-700 hover:underline font-medium">
            info@tpcmin.org
          </a>
        </p>
      </div>
    )
  }

  return (
    <div ref={formTopRef} className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-stone-200">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Please fix the following:</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ============ SECTION 1: Personal Information ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <User className="h-5 w-5 text-green-700" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Personal Information</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">
                  First Name <span className="text-green-700">*</span>
                </Label>
                <Input
                  ref={firstNameRef}
                  value={formData.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  required
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-green-600 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">
                  Last Name <span className="text-green-700">*</span>
                </Label>
                <Input
                  ref={lastNameRef}
                  value={formData.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  required
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-green-600 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============ SECTION 2: Your Role ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <Users className="h-5 w-5 text-green-700" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Your Role</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">
                How will you be involved? <span className="text-green-700">*</span>
              </Label>
              <div className="space-y-2">
                {[
                  { value: 'admin', label: 'Kenya Administrator', description: 'Helping coordinate and manage on the ground' },
                  { value: 'partner', label: 'Partner Organization', description: 'Representing a church, school, hospital, or NGO' },
                  { value: 'attendee', label: 'Local Attendee', description: 'Attending conferences, events, or serving alongside the team' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => update('kenyaTeamRole', option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all min-h-[52px] active:scale-[0.98] ${
                      formData.kenyaTeamRole === option.value
                        ? 'border-green-600 bg-green-50 ring-2 ring-green-200'
                        : 'border-stone-200 bg-white hover:border-green-400'
                    }`}
                  >
                    <span className={`text-sm font-semibold block ${
                      formData.kenyaTeamRole === option.value ? 'text-green-800' : 'text-stone-800'
                    }`}>
                      {option.label}
                    </span>
                    <span className={`text-xs mt-0.5 block ${
                      formData.kenyaTeamRole === option.value ? 'text-green-600' : 'text-stone-500'
                    }`}>
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">
                Which ministry track interests you?
              </Label>
              <select
                value={formData.serviceTrack}
                onChange={(e) => update('serviceTrack', e.target.value)}
                className="flex h-12 w-full items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                <option value="">Select a ministry track (optional)</option>
                <option value="ministry">Ministry &amp; Spiritual Care</option>
                <option value="health">Health &amp; Wellness</option>
                <option value="education">Education &amp; Youth Development</option>
                <option value="business">Business &amp; Economic Development</option>
                <option value="all">All Ministries</option>
              </select>
            </div>
          </div>
        </div>

        {/* ============ SECTION 3: Contact Information ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <Phone className="h-5 w-5 text-green-700" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Contact Information</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">
                  Email <span className="text-green-700">*</span>
                </Label>
                <Input
                  ref={emailRef}
                  type="email"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-green-600 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">
                  Phone Number <span className="text-green-700">*</span>
                </Label>
                <Input
                  ref={phoneRef}
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  required
                  placeholder="+254..."
                  autoComplete="tel"
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-green-600 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">
                City / Location <span className="text-green-700">*</span>
              </Label>
              <Input
                ref={cityRef}
                value={formData.city}
                onChange={(e) => update('city', e.target.value)}
                required
                placeholder="e.g., Nairobi, Kakamega, Mombasa"
                className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-green-600 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* ============ SECTION 4: Organization ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <Briefcase className="h-5 w-5 text-green-700" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Organization</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Organization / Church</Label>
                <Input
                  value={formData.organization}
                  onChange={(e) => update('organization', e.target.value)}
                  placeholder="Church, hospital, school, NGO, etc."
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-green-600 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Your Title / Role</Label>
                <Input
                  value={formData.orgTitle}
                  onChange={(e) => update('orgTitle', e.target.value)}
                  placeholder="e.g., Pastor, Director, Nurse"
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-green-600 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============ SECTION 5: Additional Details ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <Globe className="h-5 w-5 text-green-700" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Additional Details</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Languages Spoken</Label>
                <Input
                  value={formData.languagesSpoken}
                  onChange={(e) => update('languagesSpoken', e.target.value)}
                  placeholder="e.g., English, Swahili, Luhya"
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-green-600 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">T-Shirt Size</Label>
                <select
                  value={formData.tShirtSize}
                  onChange={(e) => update('tShirtSize', e.target.value)}
                  className="flex h-12 w-full items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  <option value="">Select size (optional)</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="2XL">2XL</option>
                  <option value="3XL">3XL</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">How did you hear about this trip?</Label>
              <select
                value={formData.howHeard}
                onChange={(e) => update('howHeard', e.target.value)}
                className="flex h-12 w-full items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                <option value="">Select (optional)</option>
                <option value="pastor">Through my Pastor / Church</option>
                <option value="tpc_member">TPC Ministries member</option>
                <option value="social_media">Social media</option>
                <option value="friend_family">Friend or family member</option>
                <option value="partner_org">Partner organization</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* ============ SECTION 6: Emergency Contact ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <MapPin className="h-5 w-5 text-green-700" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Emergency Contact</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">Contact Name</Label>
              <Input
                value={formData.emergencyContactName}
                onChange={(e) => update('emergencyContactName', e.target.value)}
                placeholder="Full name"
                className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-green-600 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">Contact Phone</Label>
              <Input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => update('emergencyContactPhone', e.target.value)}
                placeholder="+254..."
                className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-green-600 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* ============ SECTION 7: Notes ============ */}
        <div>
          <div className="space-y-2">
            <Label className="text-stone-700 font-medium text-sm">Additional Notes</Label>
            <p className="text-xs sm:text-sm text-stone-500">
              Anything else you&apos;d like us to know — your background, skills, availability, or questions.
            </p>
            <Textarea
              value={formData.notes}
              onChange={(e) => update('notes', e.target.value)}
              rows={4}
              className="bg-white text-base text-stone-900 border-stone-300 focus:border-green-600 rounded-xl"
            />
          </div>
        </div>

        {/* Error at bottom too */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className={`w-full bg-green-700 hover:bg-green-800 text-white font-semibold text-base sm:text-lg h-14 sm:h-16 rounded-xl disabled:opacity-50 active:scale-[0.98] transition-transform ${shake ? 'animate-shake' : ''}`}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Registration
              <Users className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
