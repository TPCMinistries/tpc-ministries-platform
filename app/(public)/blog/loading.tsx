import { Skeleton } from '@/components/ui/skeleton'
import { CardGridSkeleton } from '@/components/ui/skeletons'

export default function BlogLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16">
        <div className="container mx-auto max-w-4xl text-center">
          <Skeleton className="h-12 w-64 mx-auto mb-4 bg-white/20" />
          <Skeleton className="h-6 w-96 mx-auto bg-white/20" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Search/filter skeleton */}
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-10 flex-1 max-w-md" />
          <Skeleton className="h-10 w-32" />
        </div>

        <CardGridSkeleton count={6} />
      </div>
    </div>
  )
}
