'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle,
  Loader2,
  Upload,
  Plane,
  User,
  Briefcase,
  MapPin,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { showToast } from '@/lib/toast'

interface TravelFormData {
  // Identity
  displayFirstName: string
  displayLastName: string
  honorific: string
  // Ministry
  serviceTrack: string
  // Contact
  email: string
  phone: string
  mailingAddress: string
  organization: string
  orgTitle: string
  location: string
  // Travel
  travelAccommodationType: string
  travelAccommodationOther: string
  travelDateIn: string
  travelDateOut: string
  // Passport / ID
  legalFullName: string
  dateOfBirth: string
  // Airports
  departureAirport: string
  returnAirport: string
  // Accessibility
  specialAssistance: string
  specialAssistanceDetails: string
  tsaKnownTravelerNumber: string
  travelNotes: string
}

export function TravelForm() {
  const [formData, setFormData] = useState<TravelFormData>({
    displayFirstName: '',
    displayLastName: '',
    honorific: '',
    serviceTrack: '',
    email: '',
    phone: '',
    mailingAddress: '',
    organization: '',
    orgTitle: '',
    location: '',
    travelAccommodationType: '',
    travelAccommodationOther: '',
    travelDateIn: '',
    travelDateOut: '',
    legalFullName: '',
    dateOfBirth: '',
    departureAirport: '',
    returnAirport: '',
    specialAssistance: 'none',
    specialAssistanceDetails: '',
    tsaKnownTravelerNumber: '',
    travelNotes: '',
  })

  const [passportFile, setPassportFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formTopRef = useRef<HTMLDivElement>(null)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const legalNameRef = useRef<HTMLInputElement>(null)
  const serviceTrackRef = useRef<HTMLSelectElement>(null)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const update = (field: keyof TravelFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File must be under 10MB')
        return
      }
      setPassportFile(file)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate required fields and focus the first missing one
    const missing: string[] = []
    let firstMissingRef: React.RefObject<HTMLInputElement | HTMLSelectElement | null> | null = null

    if (!formData.displayFirstName) {
      missing.push('First Name')
      if (!firstMissingRef) firstMissingRef = firstNameRef
    }
    if (!formData.displayLastName) {
      missing.push('Last Name')
      if (!firstMissingRef) firstMissingRef = lastNameRef
    }
    if (!formData.email) {
      missing.push('Email')
      if (!firstMissingRef) firstMissingRef = emailRef
    }
    if (!formData.serviceTrack) {
      missing.push('Ministry Track')
      if (!firstMissingRef) firstMissingRef = serviceTrackRef
    }
    if (!formData.legalFullName) {
      missing.push('Legal Full Name')
      if (!firstMissingRef) firstMissingRef = legalNameRef
    }

    if (missing.length > 0) {
      const msg = `Missing required fields: ${missing.join(', ')}`
      setError(msg)
      showToast.error('Please fix before submitting', msg)
      triggerShake()
      setLoading(false)
      // Focus and scroll to the first missing field
      if (firstMissingRef?.current) {
        firstMissingRef.current.focus()
        firstMissingRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return
    }

    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      if (passportFile) {
        submitData.append('passportPhoto', passportFile)
      }

      const res = await fetch('/api/kenya/travel-form', {
        method: 'POST',
        body: submitData,
      })

      if (res.ok) {
        setSubmitted(true)
        showToast.success('Travel form submitted!', 'You\'ll receive a confirmation email shortly.')
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
        <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2">Travel Information Submitted!</h3>
        <p className="text-stone-600 mb-4 text-sm sm:text-base">
          Thank you for completing your travel details. Our team will use this information to coordinate your travel arrangements.
        </p>
        <p className="text-stone-600 mb-6 text-sm sm:text-base">
          You&apos;ll receive a confirmation email shortly with your next steps, including payment options.
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
    <div ref={formTopRef} className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-stone-200">
      {/* Error at top — always visible */}
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

        {/* ============ SECTION 1: Identity ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <User className="h-5 w-5 text-amber-600" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Personal Information</h3>
          </div>
          <p className="text-sm text-stone-500 mb-4">Enter your name as you would like it to appear on your Mission Trip ID badge.</p>

          <div className="space-y-4">
            {/* Honorific — native select on mobile for better UX */}
            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">Special Title (if applicable)</Label>
              <select
                value={formData.honorific}
                onChange={(e) => update('honorific', e.target.value)}
                className="flex h-12 w-full max-w-xs items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="">Select title (optional)</option>
                <option value="none">No title</option>
                <option value="Dr.">Dr.</option>
                <option value="Rev.">Reverend</option>
                <option value="Min.">Minister</option>
                <option value="Pastor">Pastor</option>
                <option value="Apostle">Apostle</option>
                <option value="Prophet">Prophet</option>
                <option value="Evangelist">Evangelist</option>
                <option value="Bishop">Bishop</option>
                <option value="Elder">Elder</option>
                <option value="Deacon">Deacon</option>
                <option value="Esq.">Esq.</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Display Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">
                  First Name <span className="text-amber-600">*</span>
                </Label>
                <Input
                  ref={firstNameRef}
                  value={formData.displayFirstName}
                  onChange={(e) => update('displayFirstName', e.target.value)}
                  required
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">
                  Last Name <span className="text-amber-600">*</span>
                </Label>
                <Input
                  ref={lastNameRef}
                  value={formData.displayLastName}
                  onChange={(e) => update('displayLastName', e.target.value)}
                  required
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============ SECTION 2: Ministry Interest ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <Briefcase className="h-5 w-5 text-amber-600" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Ministry of Interest</h3>
          </div>

          <div className="space-y-2">
            <Label className="text-stone-700 font-medium text-sm">
              Which ministry track would you like to serve in? <span className="text-amber-600">*</span>
            </Label>
            {/* Native select for reliable mobile behavior */}
            <select
              ref={serviceTrackRef}
              value={formData.serviceTrack}
              onChange={(e) => update('serviceTrack', e.target.value)}
              required
              className="flex h-12 w-full items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <option value="">Select a ministry track</option>
              <option value="ministry">Ministry &amp; Spiritual Care</option>
              <option value="health">Health &amp; Wellness</option>
              <option value="education">Education &amp; Youth Development</option>
              <option value="business">Business &amp; Economic Development</option>
              <option value="all">All Ministries</option>
            </select>
          </div>
        </div>

        {/* ============ SECTION 3: Contact Information ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <MapPin className="h-5 w-5 text-amber-600" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Contact Information</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">
                  Email <span className="text-amber-600">*</span>
                </Label>
                <Input
                  ref={emailRef}
                  type="email"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Cell Phone Number</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  autoComplete="tel"
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">Mailing Address</Label>
              <Textarea
                value={formData.mailingAddress}
                onChange={(e) => update('mailingAddress', e.target.value)}
                placeholder="Street address, City, State, ZIP"
                rows={2}
                className="bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Organization</Label>
                <Input
                  value={formData.organization}
                  onChange={(e) => update('organization', e.target.value)}
                  placeholder="Church, company, etc."
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Title</Label>
                <Input
                  value={formData.orgTitle}
                  onChange={(e) => update('orgTitle', e.target.value)}
                  placeholder="Your role/title"
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => update('location', e.target.value)}
                  placeholder="City, State"
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============ SECTION 4: Travel Accommodations ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <Plane className="h-5 w-5 text-amber-600" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Travel Accommodations</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-stone-700 font-medium text-sm">
                What type of travel arrangements do you need? <span className="text-amber-600">*</span>
              </Label>
              <div className="space-y-2">
                {[
                  { value: 'team_flight_and_hotel', label: 'Yes — Book my Flight + Hotel (Round-Trip)' },
                  { value: 'team_flight', label: 'Yes — Book my Flight only (Round-Trip)' },
                  { value: 'team_hotel', label: 'Yes — Book my Hotel only' },
                  { value: 'self_arrange', label: 'No — I\'ll arrange everything myself' },
                  { value: 'other', label: 'Other (describe below)' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => update('travelAccommodationType', option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all min-h-[52px] active:scale-[0.98] ${
                      formData.travelAccommodationType === option.value
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                        : 'border-stone-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    <span className={`text-sm font-medium leading-snug ${
                      formData.travelAccommodationType === option.value ? 'text-amber-700' : 'text-stone-700'
                    }`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {formData.travelAccommodationType === 'other' && (
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Please describe your travel needs</Label>
                <Textarea
                  value={formData.travelAccommodationOther}
                  onChange={(e) => update('travelAccommodationOther', e.target.value)}
                  rows={2}
                  className="bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Arriving in Kenya</Label>
                <Input
                  type="date"
                  value={formData.travelDateIn}
                  onChange={(e) => update('travelDateIn', e.target.value)}
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Departing Kenya</Label>
                <Input
                  type="date"
                  value={formData.travelDateOut}
                  onChange={(e) => update('travelDateOut', e.target.value)}
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============ SECTION 5: Passport / Legal ID ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <FileText className="h-5 w-5 text-amber-600" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Passport &amp; Identification</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">
                Full Legal Name (as on passport) <span className="text-amber-600">*</span>
              </Label>
              <Input
                ref={legalNameRef}
                value={formData.legalFullName}
                onChange={(e) => update('legalFullName', e.target.value)}
                required
                placeholder="Exactly as printed on your passport"
                className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">
                Date of Birth <span className="text-amber-600">*</span>
              </Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => update('dateOfBirth', e.target.value)}
                required
                className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl max-w-xs"
              />
            </div>

            {/* Passport Photo Upload */}
            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">Passport Photo Page</Label>
              <p className="text-xs sm:text-sm text-stone-500">
                Upload a clear photo or scan of your passport&apos;s picture page (booking purposes only).
              </p>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all active:scale-[0.98] ${
                  passportFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-stone-300 hover:border-amber-400 hover:bg-amber-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {passportFile ? (
                  <div className="flex items-center justify-center gap-2 text-green-700 flex-wrap">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium text-sm break-all">{passportFile.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPassportFile(null) }}
                      className="ml-2 text-sm text-stone-500 hover:text-red-600 underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-stone-500">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-stone-400" />
                    <p className="font-medium text-sm">Tap to upload or take a photo</p>
                    <p className="text-xs mt-1">JPG, PNG, or PDF — Max 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============ SECTION 6: Flight Details ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <Plane className="h-5 w-5 text-amber-600" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Flight Details</h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mb-4">
            Enter the full airport name (not just the city). If no air travel needed, enter &quot;N/A&quot;.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Departure Airport</Label>
                <Input
                  value={formData.departureAirport}
                  onChange={(e) => update('departureAirport', e.target.value)}
                  placeholder='e.g., "JFK" or "ATL" or "N/A"'
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Return Airport</Label>
                <Input
                  value={formData.returnAirport}
                  onChange={(e) => update('returnAirport', e.target.value)}
                  placeholder='e.g., "Same as departure"'
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
            </div>

            {/* Special Assistance */}
            <div className="space-y-3">
              <Label className="text-stone-700 font-medium text-sm">
                Do you need wheelchair or special assistance while traveling?
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { value: 'none', label: 'No Additional Needs' },
                  { value: 'wheelchair', label: 'Wheelchair Required' },
                  { value: 'seating', label: 'Seating Needs (describe below)' },
                  { value: 'other', label: 'Other (describe below)' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => update('specialAssistance', option.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all min-h-[52px] active:scale-[0.98] ${
                      formData.specialAssistance === option.value
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                        : 'border-stone-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    <span className={`text-sm font-medium ${
                      formData.specialAssistance === option.value ? 'text-amber-700' : 'text-stone-700'
                    }`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {(formData.specialAssistance === 'seating' || formData.specialAssistance === 'other') && (
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Please describe your needs</Label>
                <Textarea
                  value={formData.specialAssistanceDetails}
                  onChange={(e) => update('specialAssistanceDetails', e.target.value)}
                  rows={2}
                  className="bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">TSA or Known Traveler Number</Label>
              <Input
                value={formData.tsaKnownTravelerNumber}
                onChange={(e) => update('tsaKnownTravelerNumber', e.target.value)}
                placeholder='Enter number or "N/A"'
                className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl max-w-md"
              />
            </div>
          </div>
        </div>

        {/* ============ SECTION 7: Additional Notes ============ */}
        <div>
          <div className="space-y-2">
            <Label className="text-stone-700 font-medium text-sm">Additional Travel &amp; Booking Notes</Label>
            <p className="text-xs sm:text-sm text-stone-500">
              Anything that will help us book your travel (different departure/return cities, specific dates, room preferences, etc.).
            </p>
            <Textarea
              value={formData.travelNotes}
              onChange={(e) => update('travelNotes', e.target.value)}
              rows={4}
              className="bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
            />
          </div>
        </div>

        {/* ============ Ground Transportation Note ============ */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Note from Organizers</p>
              <p className="text-xs sm:text-sm text-amber-700 mt-1">
                Once you arrive in Kenya, you&apos;ll be included in all ground transportation between cities and ministry sites. No additional arrangements needed on your part.
              </p>
            </div>
          </div>
        </div>

        {/* Error at bottom too for visibility */}
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
          className={`w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-base sm:text-lg h-14 sm:h-16 rounded-xl disabled:opacity-50 active:scale-[0.98] transition-transform ${shake ? 'animate-shake' : ''}`}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Travel Information
              <Plane className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
