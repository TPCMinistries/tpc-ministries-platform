import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Global Missions',
  description: 'Learn about TPC Ministries\' global missions — US-based digital ministry, on-the-ground work in Kenya, South Africa, Grenada, and a growing online community worldwide.',
  openGraph: {
    title: 'Global Missions - TPC Ministries',
    description: 'Transforming communities and making disciples worldwide.',
    type: 'website',
  },
}

export default function MissionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
