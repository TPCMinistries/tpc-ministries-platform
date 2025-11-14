'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Lock, Crown, Sparkles, ArrowUpCircle } from 'lucide-react'

interface TierGateProps {
  requiredTier: 'partner' | 'covenant'
  currentTier?: 'free' | 'partner' | 'covenant'
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function TierGate({ requiredTier, currentTier = 'free', children, fallback }: TierGateProps) {
  // Determine if user has access
  const tierHierarchy = { free: 0, partner: 1, covenant: 2 }
  const hasAccess = tierHierarchy[currentTier] >= tierHierarchy[requiredTier]

  if (hasAccess) {
    return <>{children}</>
  }

  // Default fallback UI
  if (fallback) {
    return <>{fallback}</>
  }

  const tierInfo = {
    partner: {
      name: 'Partner',
      price: '$50/month',
      icon: Sparkles,
      iconColor: 'text-gold',
      bgColor: 'bg-gold/10',
      borderColor: 'border-gold/20',
    },
    covenant: {
      name: 'Covenant Partner',
      price: '$150/month',
      icon: Crown,
      iconColor: 'text-navy',
      bgColor: 'bg-navy/10',
      borderColor: 'border-navy/20',
    },
  }

  const info = tierInfo[requiredTier]
  const TierIcon = info.icon

  return (
    <Card className={`border-2 ${info.borderColor} ${info.bgColor}`}>
      <CardContent className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
          <Lock className="h-8 w-8 text-gray-400" />
        </div>

        <h3 className="text-2xl font-bold text-navy mb-2">
          {info.name} Content
        </h3>

        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          This content is exclusively available to {info.name} members. Upgrade your membership to unlock this and other exclusive benefits.
        </p>

        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${info.bgColor} mb-6`}>
          <TierIcon className={`h-5 w-5 ${info.iconColor}`} />
          <span className="font-medium text-navy">{info.name} - {info.price}</span>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href={`/partner/upgrade?tier=${requiredTier}`}>
            <Button className={requiredTier === 'partner' ? 'bg-gold hover:bg-gold-dark' : 'bg-navy hover:bg-navy/90'}>
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Upgrade to {info.name}
            </Button>
          </Link>
          <Link href="/partner">
            <Button variant="outline">
              View All Tiers
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

interface TierBadgeProps {
  tier: 'partner' | 'covenant'
  size?: 'sm' | 'md' | 'lg'
}

export function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  if (tier === 'partner') {
    return (
      <span className={`inline-flex items-center gap-1 bg-gold/20 text-gold rounded-full font-medium ${sizeClasses[size]}`}>
        <Sparkles className={iconSizes[size]} />
        Partner Only
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 bg-navy/20 text-navy rounded-full font-medium ${sizeClasses[size]}`}>
      <Crown className={iconSizes[size]} />
      Covenant Only
    </span>
  )
}
