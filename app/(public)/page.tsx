import { getPublicEbooksCached } from '@/lib/db/queries'
import { ProphetHeroSection } from '@/components/home/prophet-hero-section'
import { ReelsSection } from '@/components/home/reels-section'
import { KenyaCinemaSection } from '@/components/home/kenya-cinema-section'
import { MissionSection } from '@/components/home/mission-section'
import { MinistryCardsSection } from '@/components/home/ministry-cards-section'
import { LiveSectionLazy } from '@/components/home/live-section-lazy'
import { VideoSectionLazy } from '@/components/home/video-section-lazy'
import { DevotionalSection } from '@/components/home/devotional-section'
import { EbooksSection } from '@/components/home/ebooks-section'
import { KenyaSection } from '@/components/home/kenya-section'
import { GivingCtaSection } from '@/components/home/giving-cta-section'
import { AssessmentsSection } from '@/components/home/assessments-section'
import { ConnectSection } from '@/components/home/connect-section'

// Public marketing homepage — ISR. Content is low-churn; regenerate every 5 min
// instead of rendering dynamically per request (cuts the ~900ms TTFB).
export const revalidate = 300

export default async function HomePage() {
  const ebooks = await getPublicEbooksCached(4).catch(() => [])

  return (
    <div className="flex min-h-screen flex-col">
      <ProphetHeroSection />
      <ReelsSection />
      <KenyaCinemaSection />
      <MissionSection />
      <MinistryCardsSection />
      <LiveSectionLazy />
      <VideoSectionLazy />
      <DevotionalSection />
      <EbooksSection
        ebooks={
          ebooks as Array<{
            id: string
            title: string
            thumbnail_url?: string | null
            author?: string | null
          }>
        }
      />
      <KenyaSection />
      <GivingCtaSection />
      <AssessmentsSection />
      <ConnectSection />
    </div>
  )
}
