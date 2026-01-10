import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plan Your Visit',
  description: 'Plan your visit to TPC Ministries. Find service times, locations, parking information, and what to expect when you join us for worship.',
  openGraph: {
    title: 'Visit TPC Ministries',
    description: 'Plan your visit - find service times, locations, and what to expect.',
    type: 'website',
  },
}

export default function VisitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
