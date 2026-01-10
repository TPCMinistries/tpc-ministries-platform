import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with TPC Ministries. We\'d love to hear from you - whether you have questions, prayer requests, or want to learn more about our ministry.',
  openGraph: {
    title: 'Contact TPC Ministries',
    description: 'Get in touch with TPC Ministries. We\'d love to hear from you.',
    type: 'website',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
