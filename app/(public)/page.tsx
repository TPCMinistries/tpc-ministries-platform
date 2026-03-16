import { getRecentTeachings, getPublicEbooks } from '@/lib/db/queries'
import { HeroSection } from '@/components/home/hero-section'
import { MissionSection } from '@/components/home/mission-section'
import { MinistryCardsSection } from '@/components/home/ministry-cards-section'
import { VideoSection } from '@/components/home/video-section'
import { DevotionalSection } from '@/components/home/devotional-section'
import { EbooksSection } from '@/components/home/ebooks-section'
import { KenyaSection } from '@/components/home/kenya-section'
import { GivingCtaSection } from '@/components/home/giving-cta-section'
import { AssessmentsSection } from '@/components/home/assessments-section'
import { ConnectSection } from '@/components/home/connect-section'

export default async function HomePage() {
  const teachings = await getRecentTeachings(4).catch(() => [])
  const ebooks = await getPublicEbooks(4).catch(() => [])

  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
      <MissionSection />
      <MinistryCardsSection />
      <VideoSection />
      <DevotionalSection />
      <EbooksSection ebooks={ebooks as Array<{ id: string; title: string; thumbnail_url?: string | null; author?: string | null }>} />
      <KenyaSection />
      <GivingCtaSection />
      <AssessmentsSection />
      <ConnectSection />
    </div>
  )
}
