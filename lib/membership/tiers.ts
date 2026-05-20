export type MembershipTierSlug = 'partner' | 'covenant'
export type BillingCycle = 'monthly' | 'annual'

export interface MembershipTier {
  slug: MembershipTierSlug
  name: string
  description: string
  price: { monthly: number; annual: number }
  role: 'partner' | 'covenant_partner'
}

export const MEMBERSHIP_TIERS: Record<MembershipTierSlug, MembershipTier> = {
  partner: {
    slug: 'partner',
    name: 'Partner',
    description: 'Support the Mission',
    price: { monthly: 50, annual: 500 },
    role: 'partner',
  },
  covenant: {
    slug: 'covenant',
    name: 'Covenant Partner',
    description: 'Deep Partnership',
    price: { monthly: 150, annual: 1500 },
    role: 'covenant_partner',
  },
}

export function isMembershipTier(slug: string): slug is MembershipTierSlug {
  return slug === 'partner' || slug === 'covenant'
}

// Optional Stripe Price IDs per env. When set, checkout uses the catalog price
// (better for Stripe analytics + Customer Portal). When unset, falls back to
// inline price_data using MEMBERSHIP_TIERS[*].price.
//
// Test-mode price IDs created 2026-05-19 in account acct_1PaRTgIwAPnWjXPH:
//   Partner monthly:  price_1TYz9fIwAPnWjXPH6EufQvMg
//   Partner annual:   price_1TYzASIwAPnWjXPHkD6yFbxP
//   Covenant monthly: price_1TYzBXIwAPnWjXPHhy3WSdC9
//   Covenant annual:  price_1TYzDbIwAPnWjXPH97untukM
//
// Set these in Vercel for each environment (test IDs in preview/dev, live IDs
// in production once they exist):
//   STRIPE_PRICE_TPC_PARTNER_MONTHLY
//   STRIPE_PRICE_TPC_PARTNER_ANNUAL
//   STRIPE_PRICE_TPC_COVENANT_MONTHLY
//   STRIPE_PRICE_TPC_COVENANT_ANNUAL
export function getStripePriceId(
  slug: MembershipTierSlug,
  cycle: BillingCycle,
): string | undefined {
  const key = slug === 'partner'
    ? (cycle === 'monthly'
        ? 'STRIPE_PRICE_TPC_PARTNER_MONTHLY'
        : 'STRIPE_PRICE_TPC_PARTNER_ANNUAL')
    : (cycle === 'monthly'
        ? 'STRIPE_PRICE_TPC_COVENANT_MONTHLY'
        : 'STRIPE_PRICE_TPC_COVENANT_ANNUAL')
  return process.env[key]
}
