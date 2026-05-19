import { Navigation } from '@/components/layout/navigation'
import { Footer } from '@/components/layout/footer'
import { AskProphetWidget } from '@/components/ai/ask-prophet-widget'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navigation />
      <main>{children}</main>
      <Footer />
      <AskProphetWidget />
    </>
  )
}
