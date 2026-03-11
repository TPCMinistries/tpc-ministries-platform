'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Calendar, MapPin, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

const typeLabels: Record<string, string> = {
  full: 'full payment',
  deposit: 'deposit',
  installment_4: '4-month payment plan',
  installment_6: '6-month payment plan',
  custom: 'payment',
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const paymentType = searchParams.get('type') || 'payment'
  const label = typeLabels[paymentType] || 'payment'

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-stone-900 mb-3">Payment Confirmed!</h1>
        <p className="text-lg text-stone-600 mb-8">
          Your {label} for the Kenya Kingdom Impact Trip 2026 has been processed successfully.
        </p>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 text-left mb-8">
          <h3 className="font-semibold text-stone-900 mb-3">What&apos;s Next?</h3>
          <ul className="space-y-3 text-sm text-stone-700">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>You&apos;ll receive a payment confirmation email from Stripe</span>
            </li>
            {paymentType === 'deposit' && (
              <li className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Your remaining balance can be paid anytime before departure</span>
              </li>
            )}
            {(paymentType === 'installment_4' || paymentType === 'installment_6') && (
              <li className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Your card will be charged monthly until the plan is complete. You can manage your subscription from the Stripe customer portal.</span>
              </li>
            )}
            <li className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <span>If you haven&apos;t already, please complete your <Link href="/kenya/travel" className="text-amber-600 hover:underline font-medium">travel information form</Link></span>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>Our team will be in touch with orientation details and preparation materials</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/kenya">
            <Button variant="outline" className="w-full sm:w-auto">
              Back to Trip Info
            </Button>
          </Link>
          <Link href="/kenya/travel">
            <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              Complete Travel Form
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-stone-500">
          Questions? Email{' '}
          <a href="mailto:info@tpcmin.org" className="text-amber-600 hover:underline">info@tpcmin.org</a>
        </p>
      </div>
    </div>
  )
}
