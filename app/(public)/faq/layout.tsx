import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Find answers to frequently asked questions about TPC Ministries - including membership, giving, visiting, beliefs, and more.',
  openGraph: {
    title: 'Frequently Asked Questions - TPC Ministries',
    description: 'Find answers to common questions about our ministry.',
    type: 'website',
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
