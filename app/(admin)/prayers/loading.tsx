import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/skeletons'

export default function PrayersAdminLoading() {
  return (
    <div className="p-6 space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} columns={5} />
    </div>
  )
}
