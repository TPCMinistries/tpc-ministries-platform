import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Give',
  description: 'Support the mission of TPC Ministries through your generous giving. Your contributions help us transform lives through Christ-centered teaching and global missions.',
  openGraph: {
    title: 'Give to TPC Ministries',
    description: 'Support our mission of transforming lives through Christ.',
    type: 'website',
  },
}

export default function GivingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
