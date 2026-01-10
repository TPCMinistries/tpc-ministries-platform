import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Global Missions',
  description: 'Learn about TPC Ministries\' global missions work in Kenya, South Africa, and Grenada. See how we\'re transforming communities and making disciples worldwide.',
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
