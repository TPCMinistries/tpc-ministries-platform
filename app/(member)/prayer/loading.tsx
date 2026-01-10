import { ListWithAvatarsSkeleton, PageHeaderSkeleton } from '@/components/ui/skeletons'

export default function PrayerLoading() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <PageHeaderSkeleton />
      <ListWithAvatarsSkeleton count={5} />
    </div>
  )
}
