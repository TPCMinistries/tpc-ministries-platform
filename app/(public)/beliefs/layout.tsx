import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Beliefs',
  description: 'Explore the core beliefs and doctrinal foundations of TPC Ministries. Learn about our faith in Scripture, the Trinity, salvation, and the work of the Holy Spirit.',
  openGraph: {
    title: 'What We Believe - TPC Ministries',
    description: 'Explore the core beliefs and doctrinal foundations of TPC Ministries.',
    type: 'website',
  },
}

export default function BeliefsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
