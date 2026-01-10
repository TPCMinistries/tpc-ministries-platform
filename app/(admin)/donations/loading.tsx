import { PageHeaderSkeleton, StatsSkeleton, TableSkeleton } from '@/components/ui/skeletons'

export default function DonationsLoading() {
  return (
    <div className="p-6 space-y-6">
      <PageHeaderSkeleton />
      <StatsSkeleton count={4} />
      <TableSkeleton rows={8} columns={5} />
    </div>
  )
}
