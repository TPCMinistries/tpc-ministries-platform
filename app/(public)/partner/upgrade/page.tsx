'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Crown, Sparkles, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  MEMBERSHIP_TIERS,
  isMembershipTier,
  type BillingCycle,
  type MembershipTierSlug,
} from '@/lib/membership/tiers'

const TIER_BENEFITS: Record<MembershipTierSlug, string[]> = {
  partner: [
    'All Free Member benefits',
    'Monthly partner-only teaching/Q&A',
    'Bi-weekly teaching and equipping',
    'Monthly partner gatherings',
    'Partner community updates',
    'Early access to ministry events',
    'Missions and outreach updates',
  ],
  covenant: [
    'All Partner benefits',
    'Corporate prophetic ministry opportunities during designated gatherings',
    'Special AI and future-readiness trainings',
    'Quarterly books or e-books',
    'VIP and early access for in-person ministry events',
    'Early access opportunities for missions and international assignments',
  ],
}

function UpgradePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const tierSlug = searchParams.get('tier') || 'partner'
  const canceled = searchParams.get('canceled') === 'true'

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const validTier = isMembershipTier(tierSlug)
  const tier = validTier ? MEMBERSHIP_TIERS[tierSlug] : null
  const benefits = validTier ? TIER_BENEFITS[tierSlug] : []
  const Icon = tierSlug === 'covenant' ? Crown : Sparkles

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthed(!!user)
      setAuthChecked(true)
    }
    check()
  }, [])

  useEffect(() => {
    if (canceled) {
      toast({
        title: 'Checkout canceled',
        description: 'No charges were made. You can complete signup anytime.',
      })
    }
  }, [canceled, toast])

  const handleCheckout = async () => {
    if (!validTier) return

    if (!isAuthed) {
      const next = encodeURIComponent(`/partner/upgrade?tier=${tier!.slug}`)
      router.push(`/auth/signup?next=${next}`)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier_slug: tier!.slug, billing_cycle: billingCycle }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkout_url) {
        throw new Error(data.error || 'Could not start checkout')
      }
      window.location.href = data.checkout_url
    } catch (err: any) {
      console.error('Membership checkout error:', err)
      toast({
        title: 'Could not start checkout',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      })
      setSubmitting(false)
    }
  }

  if (!validTier) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <h1 className="font-display text-display-sm text-navy dark:text-white">
              Tier not found
            </h1>
            <p className="text-muted-foreground">
              Choose a partnership level from the partner page.
            </p>
            <Button asChild>
              <Link href="/partners">Back to Covenant Partners</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const price = tier!.price[billingCycle]
  const monthlyEquivalent = billingCycle === 'annual'
    ? (tier!.price.annual / 12).toFixed(0)
    : null

  return (
    <div className="min-h-[80vh] py-16 px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-display-md text-navy dark:text-white mb-3">
            Become a {tier!.name}
          </h1>
          <p className="text-muted-foreground">{tier!.description}</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-gold/10 p-3">
                <Icon className="h-8 w-8 text-navy dark:text-gold" />
              </div>
              <div>
                <p className="font-display text-display-xs text-navy dark:text-white">
                  {tier!.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cancel anytime from your account.
                </p>
              </div>
            </div>

            <div className="flex rounded-lg border p-1 bg-muted/40">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                  billingCycle === 'monthly'
                    ? 'bg-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly · ${tier!.price.monthly}/mo
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                  billingCycle === 'annual'
                    ? 'bg-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Annual · ${tier!.price.annual}/yr
                <span className="ml-1 text-xs text-gold">save 2 mo</span>
              </button>
            </div>

            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-2xl font-display text-navy dark:text-white">
                ${price}
                <span className="text-sm text-muted-foreground font-sans ml-1">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </p>
              {monthlyEquivalent && (
                <p className="text-xs text-muted-foreground">
                  ${monthlyEquivalent}/month billed annually
                </p>
              )}
            </div>

            <ul className="space-y-2">
              {benefits.map((b) => (
                <li key={b} className="flex gap-2 text-sm">
                  <Check className="h-5 w-5 text-gold shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="w-full"
              disabled={submitting || !authChecked}
              onClick={handleCheckout}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to checkout…
                </>
              ) : !authChecked ? (
                'Loading…'
              ) : isAuthed ? (
                `Continue to checkout · $${price}/${billingCycle === 'monthly' ? 'mo' : 'yr'}`
              ) : (
                'Sign up to continue'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure checkout via Stripe. No long-term commitment.
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/partners" className="underline">View Covenant Partner page</Link>
        </p>
      </div>
    </div>
  )
}

export default function PartnerUpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <UpgradePageInner />
    </Suspense>
  )
}
