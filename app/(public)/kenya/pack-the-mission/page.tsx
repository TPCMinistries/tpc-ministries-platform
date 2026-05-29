import type { Metadata } from 'next'
import { Suspense } from 'react'
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pack the Mission — Kenya 2026',
    description:
      'Help us fill the suitcases with supplies for Kenya. Pledge items or contribute funds.',
  },
}

async function getPledgeStats() {
  // Kenya 2026 pack-the-mission is archived and redirected in next.config.mjs.
  // The public aggregate view was intentionally dropped after the trip closed.
  return []
}

export default async function PackTheMissionPage() {
  const pledgeStats = await getPledgeStats()

  return (
    <Suspense>
      <PackTheMissionClient initialPledgeStats={pledgeStats} />
    </Suspense>
  )
}
