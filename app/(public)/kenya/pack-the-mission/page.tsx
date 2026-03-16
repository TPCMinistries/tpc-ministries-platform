import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import PackTheMissionClient from './_components/pack-the-mission-client'

export const metadata: Metadata = {
  title: 'Pack the Mission — Kenya 2026 | TPC Ministries',
  description:
    'Help us fill the suitcases with supplies for Kenya 2026. Browse items, pledge what you can, or contribute funds. Every item counts.',
  keywords: [
    'Kenya mission trip supplies',
    'TPC Ministries',
    'Pack the Mission',
    'Kenya 2026',
    'mission trip donations',
    'supply drive',
  ],
  openGraph: {
    title: 'Pack the Mission — Kenya 2026',
    description:
      'We\'re heading to Kenya with supplies for 3 cities. Help us pack what matters — pledge items or contribute funds.',
    type: 'website',
    siteName: 'TPC Ministries',
    images: [
      {
        url: 'https://tpcmin.org/images/kenya/kenya-flier-2026.png',
        width: 1200,
        height: 630,
        alt: 'Pack the Mission — Kenya 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pack the Mission — Kenya 2026',
    description:
      'Help us fill the suitcases with supplies for Kenya. Pledge items or contribute funds.',
    images: ['https://tpcmin.org/images/kenya/kenya-flier-2026.png'],
  },
}

async function getPledgeStats() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('kenya_supply_pledge_stats')
      .select('*')

    if (error) {
      console.error('Error fetching pledge stats:', error)
      return []
    }

    return data || []
  } catch {
    return []
  }
}

export default async function PackTheMissionPage() {
  const pledgeStats = await getPledgeStats()

  return (
    <Suspense>
      <PackTheMissionClient initialPledgeStats={pledgeStats} />
    </Suspense>
  )
}
