'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle, Loader2, AlertCircle, Heart,
  Shield, Users, Shirt, Globe, Stethoscope,
} from 'lucide-react'

interface HealthSafetyFormData {
  email: string
  gender: string
  preferredName: string
  tShirtSize: string
  roommatePreference: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
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
  languagesSpoken: string
  priorMissionExperience: string
}

export function HealthSafetyForm() {
  const [formData, setFormData] = useState<HealthSafetyFormData>({
    email: '',
    gender: '',
    preferredName: '',
    tShirtSize: '',
    roommatePreference: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
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
    languagesSpoken: '',
    priorMissionExperience: '',
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const formTopRef = useRef<HTMLDivElement>(null)

  const update = (field: keyof HealthSafetyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.email || !formData.gender || !formData.tShirtSize || !formData.emergencyContactName || !formData.emergencyContactPhone || !formData.yellowFeverStatus || !formData.travelInsuranceStatus) {
      setError('Please fill in all required fields marked with *.')
      setLoading(false)
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    try {
      const res = await fetch('/api/kenya/health-safety-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSubmitted(true)
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
        <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-2">Health & Safety Info Submitted!</h3>
        <p className="text-stone-600 mb-4 text-sm sm:text-base">
          Thank you for completing this important step. Our team now has your emergency contact, medical, and vaccination details on file.
        </p>
        <p className="text-stone-600 mb-6 text-sm sm:text-base">
          You&apos;ll receive a confirmation email with your next steps, including applying for your Kenya eTA.
        </p>
        <p className="text-sm text-stone-500">
          Questions? Email us at{' '}
          <a href="mailto:info@tpcmin.org" className="text-green-600 hover:underline font-medium">
            info@tpcmin.org
          </a>
        </p>
      </div>
    )
  }

  const selectClasses = "flex h-12 w-full items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
  const inputClasses = "h-12 bg-white text-base text-stone-900 border-stone-300 focus:border-green-500 rounded-xl"

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

        {/* Email Verification */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <Shield className="h-5 w-5 text-green-600" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Verify Your Identity</h3>
          </div>
          <p className="text-sm text-stone-500 mb-4">Enter the same email you used on the Travel Form so we can link your records.</p>
          <div className="space-y-2 max-w-md">
            <Label className="text-stone-700 font-medium text-sm">
              Email <span className="text-green-600">*</span>
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => update('email', e.target.value)}
              required
              placeholder="Same email as your Travel Form"
              autoComplete="email"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Personal Details */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <Users className="h-5 w-5 text-green-600" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Personal Details</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">
                  Gender <span className="text-green-600">*</span>
                </Label>
                <select value={formData.gender} onChange={(e) => update('gender', e.target.value)} required className={selectClasses}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Prefer not to say</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Preferred Name / Nickname</Label>
                <Input value={formData.preferredName} onChange={(e) => update('preferredName', e.target.value)} placeholder="For your ID badge" className={inputClasses} />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">
                  T-Shirt Size <span className="text-green-600">*</span>
                </Label>
                <select value={formData.tShirtSize} onChange={(e) => update('tShirtSize', e.target.value)} required className={selectClasses}>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Languages Spoken</Label>
                <Input value={formData.languagesSpoken} onChange={(e) => update('languagesSpoken', e.target.value)} placeholder="e.g., English, Swahili, French" className={inputClasses} />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Mission Trip Experience</Label>
                <select value={formData.priorMissionExperience} onChange={(e) => update('priorMissionExperience', e.target.value)} className={selectClasses}>
                  <option value="">Select</option>
                  <option value="first_time">First mission trip</option>
                  <option value="1-2_trips">1-2 previous trips</option>
                  <option value="3-5_trips">3-5 previous trips</option>
                  <option value="veteran">6+ trips (veteran)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">Roommate Preference</Label>
              <Input value={formData.roommatePreference} onChange={(e) => update('roommatePreference', e.target.value)} placeholder="Name of someone you'd like to room with (optional)" className={inputClasses} />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <AlertCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Emergency Contact</h3>
          </div>
          <p className="text-sm text-stone-500 mb-4">Someone we can reach in case of emergency while you&apos;re in Kenya.</p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Contact Name <span className="text-green-600">*</span></Label>
                <Input value={formData.emergencyContactName} onChange={(e) => update('emergencyContactName', e.target.value)} required placeholder="Full name" className={inputClasses} />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Contact Phone <span className="text-green-600">*</span></Label>
                <Input type="tel" value={formData.emergencyContactPhone} onChange={(e) => update('emergencyContactPhone', e.target.value)} required placeholder="Phone number" className={inputClasses} />
              </div>
            </div>
            <div className="space-y-2 max-w-xs">
              <Label className="text-stone-700 font-medium text-sm">Relationship</Label>
              <select value={formData.emergencyContactRelationship} onChange={(e) => update('emergencyContactRelationship', e.target.value)} className={selectClasses}>
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

        {/* Vaccinations & Travel Safety */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <Heart className="h-5 w-5 text-green-600" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Vaccinations & Travel Safety</h3>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-red-800">Yellow Fever Vaccination — Strongly Recommended</p>
            <p className="text-xs text-red-700 mt-1">The CDC recommends yellow fever vaccination for travel to most areas of Kenya. It is <strong>REQUIRED</strong> if your flight connects through a yellow-fever-endemic country (e.g., Ethiopia via Ethiopian Airlines). Carry your Yellow Card. The vaccine takes 10 days to become effective — schedule NOW if you haven&apos;t already.</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-amber-800">Kenya eTA Required ($30)</p>
            <p className="text-xs text-amber-700 mt-1">All US travelers must apply at <a href="https://etakenya.go.ke" target="_blank" rel="noopener noreferrer" className="underline font-medium">etakenya.go.ke</a> (allow 3+ business days). Your passport must be valid through <strong>October 2026</strong> with 2+ blank pages.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Yellow Fever Vaccination <span className="text-green-600">*</span></Label>
                <select value={formData.yellowFeverStatus} onChange={(e) => update('yellowFeverStatus', e.target.value)} required className={selectClasses}>
                  <option value="">Select status</option>
                  <option value="vaccinated">Vaccinated (have yellow card)</option>
                  <option value="scheduled">Appointment scheduled</option>
                  <option value="need_to_schedule">Need to schedule</option>
                  <option value="exempt">Medical exemption</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Vaccination Date</Label>
                <Input type="date" value={formData.yellowFeverDate} onChange={(e) => update('yellowFeverDate', e.target.value)} className={inputClasses} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">Malaria Prevention Medication</Label>
              <select value={formData.malariaProphylaxis} onChange={(e) => update('malariaProphylaxis', e.target.value)} className={`${selectClasses} max-w-md`}>
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
                <Label className="text-stone-700 font-medium text-sm">Travel Insurance <span className="text-green-600">*</span></Label>
                <select value={formData.travelInsuranceStatus} onChange={(e) => update('travelInsuranceStatus', e.target.value)} required className={selectClasses}>
                  <option value="">Select status</option>
                  <option value="have_policy">I have a policy</option>
                  <option value="purchasing">Planning to purchase</option>
                  <option value="need_help">Need help finding one</option>
                  <option value="none">Not planning to get</option>
                </select>
              </div>
              {formData.travelInsuranceStatus === 'have_policy' && (
                <div className="space-y-2">
                  <Label className="text-stone-700 font-medium text-sm">Insurance Provider & Policy #</Label>
                  <Input value={formData.travelInsuranceProvider} onChange={(e) => update('travelInsuranceProvider', e.target.value)} placeholder="e.g., Allianz #12345" className={inputClasses} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <Stethoscope className="h-5 w-5 text-green-600" />
            <h3 className="text-base sm:text-lg font-semibold text-stone-900">Medical Information</h3>
          </div>
          <p className="text-sm text-stone-500 mb-4">This information is kept confidential and used only for your safety during the trip.</p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Blood Type</Label>
                <select value={formData.bloodType} onChange={(e) => update('bloodType', e.target.value)} className={selectClasses}>
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
                <Input value={formData.allergies} onChange={(e) => update('allergies', e.target.value)} placeholder="Food, drug, or environmental" className={inputClasses} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Current Medications</Label>
                <Input value={formData.medications} onChange={(e) => update('medications', e.target.value)} placeholder="List any daily medications" className={inputClasses} />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-700 font-medium text-sm">Dietary Restrictions</Label>
                <Input value={formData.dietaryRestrictions} onChange={(e) => update('dietaryRestrictions', e.target.value)} placeholder="Vegetarian, halal, gluten-free, etc." className={inputClasses} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-stone-700 font-medium text-sm">Medical Conditions</Label>
              <Textarea
                value={formData.medicalConditions}
                onChange={(e) => update('medicalConditions', e.target.value)}
                placeholder="Any conditions our team should be aware of (e.g., diabetes, asthma, seizure disorder)"
                rows={2}
                className="bg-white text-base text-stone-900 border-stone-300 focus:border-green-500 rounded-xl"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-base sm:text-lg h-14 sm:h-16 rounded-xl disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Submitting...</>
          ) : (
            <><Heart className="mr-2 h-5 w-5" />Submit Health & Safety Information</>
          )}
        </Button>
      </form>
    </div>
  )
}
