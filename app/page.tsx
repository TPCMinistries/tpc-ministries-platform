import { getRecentTeachings, getPublicEbooks } from '@/lib/db/queries'
import { ProphetHeroSection } from '@/components/home/prophet-hero-section'
import { ReelsSection } from '@/components/home/reels-section'
import { KenyaCinemaSection } from '@/components/home/kenya-cinema-section'
import { MissionSection } from '@/components/home/mission-section'
import { MinistryCardsSection } from '@/components/home/ministry-cards-section'
import { LiveSection } from '@/components/home/live-section'
import { VideoSection } from '@/components/home/video-section'
import { DevotionalSection } from '@/components/home/devotional-section'
import { EbooksSection } from '@/components/home/ebooks-section'
import { KenyaSection } from '@/components/home/kenya-section'
import { GivingCtaSection } from '@/components/home/giving-cta-section'
import { AssessmentsSection } from '@/components/home/assessments-section'
import { ConnectSection } from '@/components/home/connect-section'
import { AskProphetWidget } from '@/components/ai/ask-prophet-widget'

export default async function HomePage() {
  const teachings = await getRecentTeachings(4).catch(() => [])
  const ebooks = await getPublicEbooks(4).catch(() => [])

  // touch teachings so the unused import warning doesn't fire while we surface them in a future section
  void teachings

  return (
    <div className="flex min-h-screen flex-col">
      <ProphetHeroSection />
      <ReelsSection />
      <KenyaCinemaSection />
      <MissionSection />
      <MinistryCardsSection />
      <LiveSection />
      <VideoSection />
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
      <AskProphetWidget />
    </div>
  )
}
