import { PageHeaderSkeleton, StatsSkeleton, CardGridSkeleton } from '@/components/ui/skeletons'

export default function MemberLoading() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <PageHeaderSkeleton />
      <StatsSkeleton count={3} />
      <CardGridSkeleton count={3} />
    </div>
  )
}
