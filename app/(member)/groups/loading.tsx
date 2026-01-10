import { CardGridSkeleton, PageHeaderSkeleton } from '@/components/ui/skeletons'

export default function GroupsLoading() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={6} />
    </div>
  )
}
