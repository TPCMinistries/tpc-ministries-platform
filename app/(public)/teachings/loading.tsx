import { Skeleton } from '@/components/ui/skeleton'
import { CardGridSkeleton } from '@/components/ui/skeletons'

export default function TeachingsLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16">
        <div className="container mx-auto max-w-4xl text-center">
          <Skeleton className="h-12 w-48 mx-auto mb-4 bg-white/20" />
          <Skeleton className="h-6 w-80 mx-auto bg-white/20" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Filter tabs skeleton */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>

        <CardGridSkeleton count={6} />
      </div>
    </div>
  )
}
