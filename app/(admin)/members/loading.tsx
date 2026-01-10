import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/skeletons'

export default function MembersLoading() {
  return (
    <div className="p-6 space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={10} columns={6} />
    </div>
  )
}
