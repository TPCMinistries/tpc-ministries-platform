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
  Stethoscope,
} from 'lucide-react'

interface TravelFormData {
  // Identity
  displayFirstName: string
  displayLastName: string
  honorific: string
  preferredName: string
  gender: string
  tShirtSize: string
  // Ministry
  serviceTrack: string
  languagesSpoken: string
  priorMissionExperience: string
  // Contact
  email: string
  phone: string
  mailingAddress: string
  organization: string
  orgTitle: string
  location: string
  // Emergency Contact
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  // Travel
  travelAccommodationType: string
  travelAccommodationOther: string
  travelDateIn: string
  travelDateOut: string
  roommatePreference: string
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
  // Health & Safety
  yellowFeverStatus: string
  yellowFeverDate: string
  malariaProphylaxis: string
  travelInsuranceStatus: string
  travelInsuranceProvider: string
  bloodType: string
  allergies: string
  medications: string
  medicalConditions: string
  dietaryRestrictions: string
}

export function TravelForm() {
  const [formData, setFormData] = useState<TravelFormData>({
    displayFirstName: '',
    displayLastName: '',
    honorific: '',
    preferredName: '',
    gender: '',
    tShirtSize: '',
    serviceTrack: '',
    languagesSpoken: '',
    priorMissionExperience: '',
    email: '',
    phone: '',
    mailingAddress: '',
    organization: '',
    orgTitle: '',
    location: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    travelAccommodationType: '',
    travelAccommodationOther: '',
    travelDateIn: '',
    travelDateOut: '',
    roommatePreference: '',
    legalFullName: '',
    dateOfBirth: '',
    departureAirport: '',
    returnAirport: '',
    specialAssistance: 'none',
    specialAssistanceDetails: '',
    tsaKnownTravelerNumber: '',
    travelNotes: '',
    yellowFeverStatus: '',
    yellowFeverDate: '',
    malariaProphylaxis: '',
    travelInsuranceStatus: '',
    travelInsuranceProvider: '',
    bloodType: '',
    allergies: '',
    medications: '',
    medicalConditions: '',
    dietaryRestrictions: '',
  })

  const [passportFile, setPassportFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formTopRef = useRef<HTMLDivElement>(null)

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

    // Validate required fields
    if (!formData.displayFirstName || !formData.displayLastName || !formData.email || !formData.legalFullName || !formData.serviceTrack || !formData.gender || !formData.tShirtSize || !formData.emergencyContactName || !formData.emergencyContactPhone || !formData.yellowFeverStatus || !formData.travelInsuranceStatus) {
      setError('Please fill in all required fields marked with *.')
      setLoading(false)
      // Scroll to top so user sees the error
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
        // Scroll to top to show success
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } catch {
      setError('Failed to submit. Please check your internet connection and try again.')
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
                  value={formData.displayLastName}
                  onChange={(e) => update('displayLastName', e.target.value)}
                  required
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Preferred Name / Nickname</Label>
                <Input
                  value={formData.preferredName}
                  onChange={(e) => update('preferredName', e.target.value)}
                  placeholder="For your ID badge"
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">
                  Gender <span className="text-amber-600">*</span>
                </Label>
                <select
                  value={formData.gender}
                  onChange={(e) => update('gender', e.target.value)}
                  required
                  className="flex h-12 w-full items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Prefer not to say</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">
                  T-Shirt Size <span className="text-amber-600">*</span>
                </Label>
                <select
                  value={formData.tShirtSize}
                  onChange={(e) => update('tShirtSize', e.target.value)}
                  required
                  className="flex h-12 w-full items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="">Select size</option>
                  <option value="XS">XS</option>
                  <option value="S">Small</option>
                  <option value="M">Medium</option>
                  <option value="L">Large</option>
                  <option value="XL">XL</option>
                  <option value="2XL">2XL</option>
                  <option value="3XL">3XL</option>
                </select>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">Languages Spoken</Label>
              <Input
                value={formData.languagesSpoken}
                onChange={(e) => update('languagesSpoken', e.target.value)}
                placeholder="e.g., English, Swahili, French"
                className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">Mission Trip Experience</Label>
              <select
                value={formData.priorMissionExperience}
                onChange={(e) => update('priorMissionExperience', e.target.value)}
                className="flex h-12 w-full items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="">Select experience level</option>
                <option value="first_time">First mission trip</option>
                <option value="1-2_trips">1-2 previous trips</option>
                <option value="3-5_trips">3-5 previous trips</option>
                <option value="veteran">6+ trips (veteran)</option>
              </select>
            </div>
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

        {/* ============ SECTION 4: Emergency Contact ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Emergency Contact</h3>
          </div>
          <p className="text-sm text-stone-500 mb-4">Someone we can reach in case of emergency while you&apos;re in Kenya.</p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">
                  Contact Name <span className="text-amber-600">*</span>
                </Label>
                <Input
                  value={formData.emergencyContactName}
                  onChange={(e) => update('emergencyContactName', e.target.value)}
                  required
                  placeholder="Full name"
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">
                  Contact Phone <span className="text-amber-600">*</span>
                </Label>
                <Input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => update('emergencyContactPhone', e.target.value)}
                  required
                  placeholder="Phone number"
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2 max-w-xs">
              <Label className="text-stone-700 font-medium text-sm">Relationship</Label>
              <select
                value={formData.emergencyContactRelationship}
                onChange={(e) => update('emergencyContactRelationship', e.target.value)}
                className="flex h-12 w-full items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="">Select</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Child">Child (Adult)</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* ============ SECTION 5: Travel Accommodations ============ */}
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
            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">Roommate Preference</Label>
              <Input
                value={formData.roommatePreference}
                onChange={(e) => update('roommatePreference', e.target.value)}
                placeholder="Name of someone you'd like to room with (optional)"
                className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* ============ SECTION 6: Passport / Legal ID ============ */}
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

        {/* ============ SECTION 8: Health & Safety ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <Stethoscope className="h-5 w-5 text-amber-600" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Health &amp; Safety</h3>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-red-800">Yellow Fever Vaccination — Strongly Recommended</p>
            <p className="text-xs text-red-700 mt-1">The CDC recommends yellow fever vaccination for travel to most areas of Kenya. It is <strong>REQUIRED</strong> if your flight connects through a yellow-fever-endemic country (e.g., Ethiopia via Ethiopian Airlines). Carry your Yellow Card (International Certificate of Vaccination). The vaccine takes 10 days to become effective — schedule NOW.</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-amber-800">Kenya eTA Required</p>
            <p className="text-xs text-amber-700 mt-1">All US travelers need a Kenya Electronic Travel Authorization (eTA). Apply at <a href="https://etakenya.go.ke" target="_blank" rel="noopener noreferrer" className="underline font-medium">etakenya.go.ke</a> ($30, allow 3+ business days). Your passport must be valid through at least <strong>October 2026</strong> with 2+ blank pages.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">
                  Yellow Fever Vaccination <span className="text-amber-600">*</span>
                </Label>
                <select
                  value={formData.yellowFeverStatus}
                  onChange={(e) => update('yellowFeverStatus', e.target.value)}
                  required
                  className="flex h-12 w-full items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="">Select status</option>
                  <option value="vaccinated">Vaccinated (have yellow card)</option>
                  <option value="scheduled">Appointment scheduled</option>
                  <option value="need_to_schedule">Need to schedule</option>
                  <option value="exempt">Medical exemption</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Vaccination Date</Label>
                <Input
                  type="date"
                  value={formData.yellowFeverDate}
                  onChange={(e) => update('yellowFeverDate', e.target.value)}
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">Malaria Prevention Medication</Label>
              <select
                value={formData.malariaProphylaxis}
                onChange={(e) => update('malariaProphylaxis', e.target.value)}
                className="flex h-12 w-full max-w-md items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="">Select (or discuss with your doctor)</option>
                <option value="malarone">Malarone (atovaquone/proguanil)</option>
                <option value="doxycycline">Doxycycline</option>
                <option value="mefloquine">Mefloquine (Lariam)</option>
                <option value="not_yet">Haven&apos;t decided yet</option>
                <option value="none">Choosing not to take</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">
                  Travel Insurance <span className="text-amber-600">*</span>
                </Label>
                <select
                  value={formData.travelInsuranceStatus}
                  onChange={(e) => update('travelInsuranceStatus', e.target.value)}
                  required
                  className="flex h-12 w-full items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="">Select status</option>
                  <option value="have_policy">I have a policy</option>
                  <option value="purchasing">Planning to purchase</option>
                  <option value="need_help">Need help finding one</option>
                  <option value="none">Not planning to get</option>
                </select>
              </div>
              {(formData.travelInsuranceStatus === 'have_policy') && (
                <div className="space-y-2">
                  <Label className="text-stone-700 font-medium text-sm">Insurance Provider &amp; Policy #</Label>
                  <Input
                    value={formData.travelInsuranceProvider}
                    onChange={(e) => update('travelInsuranceProvider', e.target.value)}
                    placeholder="e.g., Allianz #12345"
                    className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Blood Type</Label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => update('bloodType', e.target.value)}
                  className="flex h-12 w-full items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="">Select (if known)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="unknown">Don&apos;t know</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Allergies</Label>
                <Input
                  value={formData.allergies}
                  onChange={(e) => update('allergies', e.target.value)}
                  placeholder="Food, drug, or environmental allergies"
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Current Medications</Label>
                <Input
                  value={formData.medications}
                  onChange={(e) => update('medications', e.target.value)}
                  placeholder="List any daily medications"
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Dietary Restrictions</Label>
                <Input
                  value={formData.dietaryRestrictions}
                  onChange={(e) => update('dietaryRestrictions', e.target.value)}
                  placeholder="Vegetarian, halal, gluten-free, etc."
                  className="h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">Medical Conditions</Label>
              <Textarea
                value={formData.medicalConditions}
                onChange={(e) => update('medicalConditions', e.target.value)}
                placeholder="Any conditions our team should be aware of (e.g., diabetes, asthma, seizure disorder)"
                rows={2}
                className="bg-white text-base text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* ============ SECTION 9: Additional Notes ============ */}
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
          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-base sm:text-lg h-14 sm:h-16 rounded-xl disabled:opacity-50 active:scale-[0.98] transition-transform"
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
