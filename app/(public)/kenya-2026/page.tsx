import type { Metadata } from 'next'
import { KenyaStoryHero } from './_components/hero'
import { KenyaStatsStrip } from './_components/stats-strip'
import { KenyaMasterReel } from './_components/master-reel'
import { KenyaDayJourney } from './_components/day-journey'
import { KenyaLocations } from './_components/locations'
import { KenyaVerticalReels } from './_components/vertical-reels'
import { KenyaCinemaFilm } from './_components/cinema-film'
import { KenyaWhatsNext } from './_components/whats-next'

export const metadata: Metadata = {
  title: 'Kenya 2026 — What God Did | TPC Ministries',
  description:
    'Footage from the Kenya 2026 mission. Fourteen days on the ground. Watch the journey and see what God did.',
  openGraph: {
    title: 'Kenya 2026 — What God Did | TPC Ministries',
    description: 'Fourteen days on the ground in Kenya. Watch the footage.',
    images: ['/videos/kenya/posters/highlight-video.jpg'],
  },
}

export default function KenyaStoryPage() {
  return (
    <div className="bg-navy-950 text-white">
      <KenyaStoryHero />
      <KenyaStatsStrip />
      <KenyaMasterReel />
      <KenyaDayJourney />
      <KenyaLocations />
      <KenyaVerticalReels />
      <KenyaCinemaFilm />
      <KenyaWhatsNext />
    </div>
  )
}
