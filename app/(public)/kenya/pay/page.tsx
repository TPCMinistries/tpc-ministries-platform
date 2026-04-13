'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CreditCard,
  ArrowLeft,
  Calendar,
  MapPin,
  Loader2,
  DollarSign,
  Shield,
  AlertCircle,
} from 'lucide-react'

const TRIP_COST = 3500

const QUICK_AMOUNTS = [500, 1000, 1750, 2500, 3500]

export default function KenyaPayPage() {
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled')
  const prefillEmail = searchParams.get('email') || ''

  const [email, setEmail] = useState(prefillEmail)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString())
    setError('')
  }

  const handlePayment = async () => {
    if (!email) {
      setError('Please enter your email address.')
      return
    }
    if (!amount || Number(amount) < 10) {
      setError('Please enter an amount of at least $10.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const numAmount = Number(amount)
      const isFullPayment = numAmount >= TRIP_COST

      const res = await fetch('/api/kenya/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          paymentType: isFullPayment ? 'full' : 'custom',
          customAmount: isFullPayment ? undefined : numAmount,
        }),
      })

      const data = await res.json()

      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create payment session.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white">
        <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
          <Link
            href="/kenya"
            className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Kenya Trip Info
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Trip Payment</h1>
              <p className="text-stone-300 text-lg">Kenya Kingdom Impact Trip 2026</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6 text-sm">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>April 22 - May 7, 2026</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <MapPin className="h-4 w-4 text-amber-400" />
              <span>Nairobi, Kakamega &amp; Mombasa</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <DollarSign className="h-4 w-4 text-amber-400" />
              <span>${TRIP_COST.toLocaleString()} per person</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Canceled notice */}
        {canceled && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Payment was canceled</p>
              <p className="text-sm text-amber-700">No worries - you can try again when you&apos;re ready.</p>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-stone-200 mb-6">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Your Information</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-stone-700 font-medium">
                Email <span className="text-amber-600">*</span>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
              />
              <p className="text-xs text-stone-500">Use the same email from your application</p>
            </div>
            <div className="space-y-2">
              <Label className="text-stone-700 font-medium">First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-stone-700 font-medium">Last Name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-white text-stone-900 border-stone-300 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-stone-200 mb-6">
          <h3 className="text-lg font-semibold text-stone-900 mb-2">Payment Amount</h3>
          <p className="text-sm text-stone-500 mb-6">
            Enter any amount toward your trip balance. Your payment will be applied to your account.
          </p>

          {/* Quick amount buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
            {QUICK_AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleQuickAmount(value)}
                className={`py-3 px-2 rounded-xl border-2 font-bold text-sm transition-all ${
                  amount === value.toString()
                    ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-200'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300'
                }`}
              >
                ${value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : value}
              </button>
            ))}
          </div>

          {/* Custom amount input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-stone-400 font-medium">$</span>
            <Input
              type="number"
              min={10}
              max={TRIP_COST}
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError('') }}
              placeholder="Enter amount"
              className="text-2xl font-bold h-16 pl-10 bg-white text-stone-900 border-stone-300 focus:border-amber-500 rounded-xl"
            />
          </div>
          <p className="text-xs text-stone-500 mt-2">Minimum $10</p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Pay Button */}
        <Button
          onClick={handlePayment}
          disabled={loading || !amount || !email}
          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-lg h-14 rounded-xl disabled:opacity-50 mb-4"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Redirecting to Stripe...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              {amount ? `Pay $${Number(amount).toLocaleString()}` : 'Enter Amount to Pay'}
            </>
          )}
        </Button>

        {/* Security notice */}
        <div className="flex items-center justify-center gap-2 text-sm text-stone-500 mb-12">
          <Shield className="h-4 w-4" />
          <span>Secure payment powered by Stripe. TPC Ministries is a 501(c)(3) nonprofit.</span>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-stone-500 pb-12">
          <p>
            Questions? Contact us at{' '}
            <a href="mailto:info@tpcmin.org" className="text-amber-600 hover:underline font-medium">
              info@tpcmin.org
            </a>
          </p>
          <p className="mt-2">&copy; {new Date().getFullYear()} TPC Ministries. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
