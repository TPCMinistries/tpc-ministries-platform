import { Navigation } from '@/components/layout/navigation'
import { Footer } from '@/components/layout/footer'
import { AskProphetWidgetLazy } from '@/components/ai/ask-prophet-widget-lazy'

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
      <AskProphetWidgetLazy />
    </>
  )
}
