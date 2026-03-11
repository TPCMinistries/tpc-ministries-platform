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
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    if (!formData.displayFirstName || !formData.displayLastName || !formData.email || !formData.legalFullName || !formData.serviceTrack) {
      setError('Please fill in all required fields.')
      setLoading(false)
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
        <h3 className="text-2xl font-bold text-stone-900 mb-2">Travel Information Submitted!</h3>
        <p className="text-stone-600 mb-4">
          Thank you for completing your travel details. Our team will use this information to coordinate your travel arrangements.
        </p>
        <p className="text-stone-600 mb-6">
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
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-stone-200">
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ============ SECTION 1: Identity ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <User className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-stone-900">Personal Information</h3>
          </div>
          <p className="text-sm text-stone-500 mb-4">Enter your name as you would like it to appear on your Mission Trip ID badge.</p>

          <div className="space-y-4">
            {/* Honorific */}
            <div className="space-y-2">
              <Label className="text-stone-700 font-medium">Special Title (if applicable)</Label>
              <Select value={formData.honorific} onValueChange={(v) => update('honorific', v)}>
                <SelectTrigger className="bg-white text-stone-900 border-stone-300 focus:border-amber-500 max-w-xs">
                  <SelectValue placeholder="Select title (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-white text-stone-900 border-stone-200">
                  <SelectItem value="none">No title</SelectItem>
                  <SelectItem value="Dr.">Dr.</SelectItem>
                  <SelectItem value="Rev.">Reverend</SelectItem>
                  <SelectItem value="Min.">Minister</SelectItem>
                  <SelectItem value="Pastor">Pastor</SelectItem>
                  <SelectItem value="Apostle">Apostle</SelectItem>
                  <SelectItem value="Prophet">Prophet</SelectItem>
                  <SelectItem value="Evangelist">Evangelist</SelectItem>
                  <SelectItem value="Bishop">Bishop</SelectItem>
                  <SelectItem value="Elder">Elder</SelectItem>
                  <SelectItem value="Deacon">Deacon</SelectItem>
                  <SelectItem value="Esq.">Esq.</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Display Name */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium">
                  First Name (for Mission Trip ID) <span className="text-amber-600">*</span>
                </Label>
                <Input
                  value={formData.displayFirstName}
                  onChange={(e) => update('displayFirstName', e.target.value)}
                  required
                  className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium">
                  Last Name (for Mission Trip ID) <span className="text-amber-600">*</span>
                </Label>
                <Input
                  value={formData.displayLastName}
                  onChange={(e) => update('displayLastName', e.target.value)}
                  required
                  className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============ SECTION 2: Ministry Interest ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <Briefcase className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-stone-900">Ministry of Interest</h3>
          </div>

          <div className="space-y-2">
            <Label className="text-stone-700 font-medium">
              Which ministry track would you like to serve in? <span className="text-amber-600">*</span>
            </Label>
            <Select value={formData.serviceTrack} onValueChange={(v) => update('serviceTrack', v)}>
              <SelectTrigger className="bg-white text-stone-900 border-stone-300 focus:border-amber-500">
                <SelectValue placeholder="Select a ministry track" />
              </SelectTrigger>
              <SelectContent className="bg-white text-stone-900 border-stone-200">
                <SelectItem value="ministry">Ministry & Spiritual Care</SelectItem>
                <SelectItem value="health">Health & Wellness</SelectItem>
                <SelectItem value="education">Education & Youth Development</SelectItem>
                <SelectItem value="business">Business & Economic Development</SelectItem>
                <SelectItem value="all">All Ministries</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ============ SECTION 3: Contact Information ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <MapPin className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-stone-900">Contact Information</h3>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium">
                  Email <span className="text-amber-600">*</span>
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                  className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium">Cell Phone Number</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-stone-700 font-medium">Mailing Address</Label>
              <Textarea
                value={formData.mailingAddress}
                onChange={(e) => update('mailingAddress', e.target.value)}
                placeholder="Street address, City, State, ZIP"
                rows={2}
                className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium">Organization</Label>
                <Input
                  value={formData.organization}
                  onChange={(e) => update('organization', e.target.value)}
                  placeholder="Church, company, etc."
                  className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium">Title</Label>
                <Input
                  value={formData.orgTitle}
                  onChange={(e) => update('orgTitle', e.target.value)}
                  placeholder="Your role/title"
                  className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium">Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => update('location', e.target.value)}
                  placeholder="City, State"
                  className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============ SECTION 4: Travel Accommodations ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <Plane className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-stone-900">Travel Accommodations</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-stone-700 font-medium">
                What type of travel arrangements do you need? <span className="text-amber-600">*</span>
              </Label>
              <div className="space-y-2">
                {[
                  { value: 'team_flight_and_hotel', label: 'Yes, I need Travel Flight + Accommodations booked by the team (Round-Trip)' },
                  { value: 'team_flight', label: 'Yes, I need Travel Flight booked by the team (Round-Trip only)' },
                  { value: 'team_hotel', label: 'Yes, I need Accommodations booked by the team only' },
                  { value: 'self_arrange', label: 'No, I will make my own arrangements for travel and accommodations' },
                  { value: 'other', label: 'Other (please describe below)' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => update('travelAccommodationType', option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      formData.travelAccommodationType === option.value
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                        : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    <span className={`text-sm font-medium ${
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
                <Label className="text-stone-700 font-medium">Please describe your travel needs</Label>
                <Textarea
                  value={formData.travelAccommodationOther}
                  onChange={(e) => update('travelAccommodationOther', e.target.value)}
                  rows={2}
                  className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium">Travel Date — Arriving In Kenya</Label>
                <Input
                  type="date"
                  value={formData.travelDateIn}
                  onChange={(e) => update('travelDateIn', e.target.value)}
                  className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium">Travel Date — Departing Kenya</Label>
                <Input
                  type="date"
                  value={formData.travelDateOut}
                  onChange={(e) => update('travelDateOut', e.target.value)}
                  className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============ SECTION 5: Passport / Legal ID ============ */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <FileText className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-stone-900">Passport &amp; Identification</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-stone-700 font-medium">
                Full Legal Name (as it appears on your passport) <span className="text-amber-600">*</span>
              </Label>
              <Input
                value={formData.legalFullName}
                onChange={(e) => update('legalFullName', e.target.value)}
                required
                placeholder="Exactly as printed on your passport"
                className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
              />
            </div>

            <div className="space-y-2 max-w-xs">
              <Label className="text-stone-700 font-medium">
                Date of Birth <span className="text-amber-600">*</span>
              </Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => update('dateOfBirth', e.target.value)}
                required
                className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
              />
            </div>

            {/* Passport Photo Upload */}
            <div className="space-y-2">
              <Label className="text-stone-700 font-medium">
                Passport Photo Page
              </Label>
              <p className="text-sm text-stone-500">
                Please upload a clear photo or scan of your passport&apos;s picture page. This is used for booking purposes only.
              </p>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  passportFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-stone-300 hover:border-amber-400 hover:bg-amber-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {passportFile ? (
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">{passportFile.name}</span>
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
                    <p className="font-medium">Click to upload passport photo page</p>
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
            <h3 className="text-lg font-semibold text-stone-900">Flight Details</h3>
          </div>
          <p className="text-sm text-stone-500 mb-4">
            If air travel is required, please enter the full airport name (not just the city). If no air travel is needed, enter &quot;N/A&quot;.
          </p>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium">Departure Airport</Label>
                <Input
                  value={formData.departureAirport}
                  onChange={(e) => update('departureAirport', e.target.value)}
                  placeholder='e.g., "Hartsfield-Jackson Atlanta International (ATL)" or "N/A"'
                  className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium">Return Airport</Label>
                <Input
                  value={formData.returnAirport}
                  onChange={(e) => update('returnAirport', e.target.value)}
                  placeholder='e.g., "Same as departure" or different airport'
                  className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Special Assistance */}
            <div className="space-y-3">
              <Label className="text-stone-700 font-medium">
                Do you require a wheelchair or any special assistance while traveling?
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.specialAssistance === option.value
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                        : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
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
                <Label className="text-stone-700 font-medium">Please describe your needs</Label>
                <Textarea
                  value={formData.specialAssistanceDetails}
                  onChange={(e) => update('specialAssistanceDetails', e.target.value)}
                  rows={2}
                  className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
                />
              </div>
            )}

            <div className="space-y-2 max-w-md">
              <Label className="text-stone-700 font-medium">TSA or Known Traveler Number</Label>
              <Input
                value={formData.tsaKnownTravelerNumber}
                onChange={(e) => update('tsaKnownTravelerNumber', e.target.value)}
                placeholder='Enter number or "N/A"'
                className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* ============ SECTION 7: Additional Notes ============ */}
        <div>
          <div className="space-y-2">
            <Label className="text-stone-700 font-medium">Additional Travel &amp; Booking Notes</Label>
            <p className="text-sm text-stone-500">
              Please share anything that will help us book appropriate travel and accommodations (e.g., departure and return cities are different, need to arrive or depart on specific dates/times, room preferences, etc.).
            </p>
            <Textarea
              value={formData.travelNotes}
              onChange={(e) => update('travelNotes', e.target.value)}
              rows={4}
              className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
            />
          </div>
        </div>

        {/* ============ Ground Transportation Note ============ */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Note from Organizers</p>
              <p className="text-sm text-amber-700 mt-1">
                Once you have arrived for the trip, you will be automatically included in all further ground transportation and transportation needs to our connecting cities for the various ministries and their work. No additional arrangements needed on your part for in-country travel.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-lg h-14 rounded-xl disabled:opacity-50"
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
