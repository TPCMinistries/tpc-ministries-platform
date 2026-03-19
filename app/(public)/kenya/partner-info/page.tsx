'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
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
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react'

const ROLE_OPTIONS = [
  { value: 'host', label: 'Host' },
  { value: 'translator', label: 'Translator' },
  { value: 'driver', label: 'Driver' },
  { value: 'pastor', label: 'Pastor' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'medical', label: 'Medical' },
  { value: 'security', label: 'Security' },
  { value: 'other', label: 'Other' },
] as const

function PartnerInfoForm() {
  const searchParams = useSearchParams()
  const contactId = searchParams.get('id')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [organization, setOrganization] = useState('')
  const [role, setRole] = useState('')
  const [city, setCity] = useState('')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!contactId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="max-w-md text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-4 text-2xl font-bold text-stone-900">Invalid Link</h1>
          <p className="mt-2 text-stone-600">
            This link is missing a required partner ID. Please use the link provided in your email
            from TPC Ministries.
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-stone-50">
        {/* Green header */}
        <div className="bg-[#006600] py-8">
          <div className="mx-auto max-w-xl px-4 text-center">
            <h1 className="text-2xl font-bold text-white">TPC Ministries</h1>
            <p className="mt-1 text-sm text-green-200">Kenya Kingdom Impact Trip 2026</p>
          </div>
        </div>
        <div className="h-1 bg-[#d4af37]" />

        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-[#006600]" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-stone-900">Thank You!</h2>
            <p className="mt-3 text-stone-600 leading-relaxed">
              Your information has been received. The TPC Ministries team will be in touch.
            </p>
            <p className="mt-6 text-sm text-stone-500">
              TPC Ministries &mdash; Kenya Kingdom Impact Trip 2026
            </p>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/kenya/partner-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId,
          name,
          email,
          phone,
          whatsapp,
          organization,
          role,
          city,
          notes,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      {/* Green header */}
      <div className="bg-[#006600] px-4 py-10 md:py-14">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold text-white md:text-4xl">TPC Ministries</h1>
          <p className="mt-2 text-lg text-green-200">Kenya Kingdom Impact Trip 2026</p>
        </div>
      </div>

      {/* Gold accent bar */}
      <div className="h-1.5 bg-[#d4af37]" />

      {/* Form card */}
      <div className="mx-auto w-full max-w-xl px-4 py-10 md:py-14">
        <h2 className="mb-1 text-2xl font-bold text-stone-900">Partner Information Form</h2>
        <p className="mb-8 text-stone-600">
          Please fill out your contact details so our team can coordinate with you.
        </p>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="font-medium text-stone-700">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="border-stone-300 bg-white text-stone-900 focus:border-[#006600] focus:ring-[#006600]"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-medium text-stone-700">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="border-stone-300 bg-white text-stone-900 focus:border-[#006600] focus:ring-[#006600]"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="font-medium text-stone-700">
                Phone
              </Label>
              <Input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 700 000000"
                className="border-stone-300 bg-white text-stone-900 focus:border-[#006600] focus:ring-[#006600]"
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp" className="font-medium text-stone-700">
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+254 700 000000"
                className="border-stone-300 bg-white text-stone-900 focus:border-[#006600] focus:ring-[#006600]"
              />
            </div>

            {/* Organization */}
            <div className="space-y-1.5">
              <Label htmlFor="organization" className="font-medium text-stone-700">
                Organization
              </Label>
              <Input
                id="organization"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Church, ministry, or organization name"
                className="border-stone-300 bg-white text-stone-900 focus:border-[#006600] focus:ring-[#006600]"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label htmlFor="role" className="font-medium text-stone-700">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger
                  id="role"
                  className="border-stone-300 bg-white text-stone-900 focus:border-[#006600] focus:ring-[#006600]"
                >
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City / Region */}
            <div className="space-y-1.5">
              <Label htmlFor="city" className="font-medium text-stone-700">
                City / Region
              </Label>
              <Input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Nairobi, Kakamega, Mombasa"
                className="border-stone-300 bg-white text-stone-900 focus:border-[#006600] focus:ring-[#006600]"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="font-medium text-stone-700">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything we should know — availability, special skills, logistics notes, etc."
                rows={4}
                className="border-stone-300 bg-white text-stone-900 focus:border-[#006600] focus:ring-[#006600]"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !name || !email || !role}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#d4af37] px-6 py-3 text-[#1e3a5f] font-bold transition-colors hover:bg-[#c9a22e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Information'
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-stone-200 bg-stone-50 py-6 text-center text-sm text-stone-500">
        TPC Ministries &mdash; Kenya Kingdom Impact Trip 2026
      </div>
    </div>
  )
}

function PartnerInfoLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <Loader2 className="h-8 w-8 animate-spin text-[#006600]" />
    </div>
  )
}

export default function KenyaPartnerInfoPage() {
  return (
    <Suspense fallback={<PartnerInfoLoading />}>
      <PartnerInfoForm />
    </Suspense>
  )
}
