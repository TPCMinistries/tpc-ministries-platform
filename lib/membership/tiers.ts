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
