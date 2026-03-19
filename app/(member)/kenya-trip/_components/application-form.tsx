'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users,
  Heart,
  Phone,
  Stethoscope,
  Gift,
  Plane,
  RefreshCw,
  CheckCircle,
  Sparkles,
} from 'lucide-react'
import { SERVICE_TRACKS } from './constants'
import type { Trip, Member } from './types'
import type { ApplicationForm as ApplicationFormType } from './use-delegate-data'

interface ApplicationFormProps {
  trip: Trip
  member: Member | null
  onSubmit: (form: ApplicationFormType) => Promise<boolean>
}

// Intelligently recommend a service track based on occupation
function getRecommendedTrack(occupation: string | null | undefined): string {
  if (!occupation) return ''
  const occ = occupation.toLowerCase()

  if (occ.includes('doctor') || occ.includes('nurse') || occ.includes('medical') || occ.includes('health') || occ.includes('physician') || occ.includes('therapist')) {
    return 'medical_missions'
  }
  if (occ.includes('teacher') || occ.includes('professor') || occ.includes('education') || occ.includes('tutor') || occ.includes('school')) {
    return 'education_youth'
  }
  if (occ.includes('pastor') || occ.includes('minister') || occ.includes('missionary') || occ.includes('chaplain') || occ.includes('worship')) {
    return 'ministry_spiritual'
  }
  if (occ.includes('business') || occ.includes('entrepreneur') || occ.includes('finance') || occ.includes('accountant') || occ.includes('consultant')) {
    return 'business_development'
  }
  if (occ.includes('agriculture') || occ.includes('farm') || occ.includes('food') || occ.includes('nutrition')) {
    return 'food_security'
  }
  return ''
}

// Check scholarship eligibility
function getScholarshipEligibility(member: Member): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = []
  const memberAge = member.date_of_birth
    ? Math.floor((Date.now() - new Date(member.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  if (memberAge && memberAge >= 18 && memberAge <= 30) {
    reasons.push('Young adult with calling')
  }

  const occ = member.occupation?.toLowerCase() || ''
  if (occ.includes('doctor') || occ.includes('nurse') || occ.includes('medical') || occ.includes('health')) {
    reasons.push('Medical professional')
  }
  if (occ.includes('teacher') || occ.includes('education') || occ.includes('professor')) {
    reasons.push('Education professional')
  }

  const memberSince = new Date(member.created_at)
  const monthsAsMember = (Date.now() - memberSince.getTime()) / (30 * 24 * 60 * 60 * 1000)
  if (monthsAsMember < 24) {
    reasons.push('Potential first-time missionary')
  }

  return { eligible: reasons.length > 0, reasons }
}

// Generate personalized message
function getPersonalizedMessage(member: Member): string {
  const occ = member.occupation?.toLowerCase() || ''
  const firstName = member.first_name

  if (occ.includes('doctor') || occ.includes('nurse') || occ.includes('medical') || occ.includes('health')) {
    return `${firstName}, your medical expertise could transform lives in Kenya. Our Medical Missions track is looking for healthcare professionals just like you to provide care in underserved communities.`
  }
  if (occ.includes('teacher') || occ.includes('education') || occ.includes('professor')) {
    return `${firstName}, your passion for education could impact hundreds of young Kenyans. The Education & Youth track needs dedicated educators to inspire the next generation.`
  }
  if (occ.includes('pastor') || occ.includes('minister') || occ.includes('missionary')) {
    return `${firstName}, your ministry experience makes you an ideal candidate for our Ministry & Spiritual Care track. Help lead worship and provide pastoral care across three cities.`
  }
  if (occ.includes('business') || occ.includes('entrepreneur') || occ.includes('finance')) {
    return `${firstName}, your business acumen could help Kenyan entrepreneurs build sustainable businesses. Join our Business Development track to create lasting economic impact.`
  }

  return `${firstName}, this trip is more than travel\u2014it's a Kingdom assignment. Your unique gifts and experiences can transform lives in Kenya while transforming yours.`
}

export function ApplicationForm({ trip, member, onSubmit }: ApplicationFormProps) {
  const [applying, setApplying] = useState(false)
  const [form, setForm] = useState<ApplicationFormType>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    service_track: '',
    why_interested: '',
    previous_missions: '',
    special_skills: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    allergies: '',
    medications: '',
    medical_conditions: '',
    dietary_restrictions: '',
    needs_scholarship: false,
    scholarship_reason: '',
  })

  // Pre-fill with member data
  useEffect(() => {
    if (member) {
      setForm(prev => ({
        ...prev,
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: member.email || '',
        phone: member.phone || '',
        service_track: getRecommendedTrack(member.occupation),
      }))
    }
  }, [member])

  const handleApply = async () => {
    setApplying(true)
    await onSubmit(form)
    setApplying(false)
  }

  const scholarshipInfo = member ? getScholarshipEligibility(member) : { eligible: false, reasons: [] }

  return (
    <div className="space-y-6">
      {/* Personalized Message */}
      {member && (
        <Card className="border-gold bg-gradient-to-br from-gold/10 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-navy text-lg mb-2">Why This Trip Is For You</h3>
                <p className="text-gray-700">{getPersonalizedMessage(member)}</p>
                {scholarshipInfo.eligible && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
                    <Gift className="h-4 w-4" />
                    <span>You may qualify for a partial scholarship!</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pre-filled notice */}
      {member && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <p className="text-blue-800">
              We&apos;ve pre-filled your information from your profile. Please review and complete the remaining fields.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Apply for Kenya 2026</CardTitle>
          <CardDescription>Complete the form below to apply for the mission trip</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="mt-1"
                    disabled={!!member}
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="mt-1"
                    disabled={!!member}
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1"
                    disabled={!!member}
                  />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Ministry Interest */}
            <div>
              <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Ministry Interest
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Preferred Service Track *</Label>
                  <Select
                    value={form.service_track}
                    onValueChange={(value) => setForm({ ...form, service_track: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a track..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TRACKS.map(track => {
                        const isRecommended = member && getRecommendedTrack(member.occupation) === track.value
                        return (
                          <SelectItem key={track.value} value={track.value}>
                            {track.label} {isRecommended ? '(Recommended)' : ''}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {form.service_track && (
                    <p className="text-sm text-gray-500 mt-2">
                      {SERVICE_TRACKS.find(t => t.value === form.service_track)?.description}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Why are you interested in this trip? *</Label>
                  <Textarea
                    value={form.why_interested}
                    onChange={(e) => setForm({ ...form, why_interested: e.target.value })}
                    placeholder="Share what draws you to this mission and how you hope to serve..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Previous mission trip experience</Label>
                  <Textarea
                    value={form.previous_missions}
                    onChange={(e) => setForm({ ...form, previous_missions: e.target.value })}
                    placeholder="List any previous mission trips or international service experiences (or write 'None' if this is your first)"
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Special skills or qualifications</Label>
                  <Textarea
                    value={form.special_skills}
                    onChange={(e) => setForm({ ...form, special_skills: e.target.value })}
                    placeholder="Languages spoken, certifications, professional skills relevant to your chosen track..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Scholarship */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                <Gift className="h-4 w-4 text-amber-600" />
                Scholarship Information
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Limited partial scholarships are available. Priority is given to students/young adults, medical/education professionals, and first-time missionaries.
              </p>
              {scholarshipInfo.eligible && (
                <div className="bg-white p-3 rounded-lg border border-amber-300 mb-4">
                  <p className="text-sm font-medium text-amber-800 mb-2">Based on your profile, you may qualify:</p>
                  <ul className="text-sm text-amber-700 list-disc list-inside">
                    {scholarshipInfo.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                  id="needs_scholarship"
                  checked={form.needs_scholarship}
                  onCheckedChange={(checked) => setForm({ ...form, needs_scholarship: !!checked })}
                />
                <Label htmlFor="needs_scholarship" className="cursor-pointer">
                  I would like to be considered for a partial scholarship
                </Label>
              </div>
              {form.needs_scholarship && (
                <div>
                  <Label>Please share your story and financial need</Label>
                  <Textarea
                    value={form.scholarship_reason}
                    onChange={(e) => setForm({ ...form, scholarship_reason: e.target.value })}
                    placeholder="Share your calling to this trip and why financial assistance would help you participate..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Emergency Contact
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Contact Name *</Label>
                  <Input
                    value={form.emergency_contact_name}
                    onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Contact Phone *</Label>
                  <Input
                    value={form.emergency_contact_phone}
                    onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Relationship *</Label>
                  <Input
                    value={form.emergency_contact_relationship}
                    onChange={(e) => setForm({ ...form, emergency_contact_relationship: e.target.value })}
                    placeholder="e.g., Spouse, Parent"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Medical */}
            <div>
              <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Medical Information
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Allergies</Label>
                    <Textarea
                      value={form.allergies}
                      onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                      placeholder="Food, medication, environmental..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Dietary Restrictions</Label>
                    <Textarea
                      value={form.dietary_restrictions}
                      onChange={(e) => setForm({ ...form, dietary_restrictions: e.target.value })}
                      placeholder="Vegetarian, vegan, gluten-free..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Current Medications</Label>
                  <Textarea
                    value={form.medications}
                    onChange={(e) => setForm({ ...form, medications: e.target.value })}
                    placeholder="List any medications you take regularly"
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Medical Conditions</Label>
                  <Textarea
                    value={form.medical_conditions}
                    onChange={(e) => setForm({ ...form, medical_conditions: e.target.value })}
                    placeholder="Any conditions we should be aware of (asthma, diabetes, heart conditions, etc.)"
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                className="w-full bg-gold hover:bg-gold-dark text-white py-6 text-lg"
                onClick={handleApply}
                disabled={applying || !form.first_name || !form.last_name || !form.email || !form.service_track || !form.why_interested}
              >
                {applying ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Plane className="h-5 w-5 mr-2" />
                    Submit My Application
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 text-center mt-3">
                Our team will contact you within 48 hours of submission
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
