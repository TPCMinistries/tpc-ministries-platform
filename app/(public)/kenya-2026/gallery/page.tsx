import type { Metadata } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import { GalleryClient, type DayPhotos } from './_components/gallery-client'

export const metadata: Metadata = {
  title: 'Kenya 2026 — Gallery | TPC Ministries',
  description: '50+ photos from the Kenya 2026 mission. Browse by day or scroll the whole story.',
  openGraph: {
    title: 'Kenya 2026 — Gallery | TPC Ministries',
    description: 'Photos from 14 days on the ground in Kenya.',
    images: ['/kenya-2026/photos/day-14/01.jpg'],
  },
}

// Server component: enumerate all day folders and their photos at build/request time.
async function getAllDays(): Promise<DayPhotos[]> {
  const root = path.join(process.cwd(), 'public', 'kenya-2026', 'photos')
  const days: DayPhotos[] = []

  for (let n = 1; n <= 14; n++) {
    const dayDir = `day-${String(n).padStart(2, '0')}`
    const abs = path.join(root, dayDir)
    try {
      const files = await fs.readdir(abs)
      const photos = files
        .filter((f) => f.toLowerCase().endsWith('.jpg'))
        .sort()
        .map((f) => `/kenya-2026/photos/${dayDir}/${f}`)
      if (photos.length > 0) {
        days.push({ day: n, photos })
      }
    } catch {
      // directory missing — skip
    }
  }
  return days
}

export default async function KenyaGalleryPage() {
  const days = await getAllDays()
  const total = days.reduce((acc, d) => acc + d.photos.length, 0)
  return <GalleryClient days={days} total={total} />
}
