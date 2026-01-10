import { Skeleton } from '@/components/ui/skeleton'

export default function GalleryLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16">
        <div className="container mx-auto max-w-4xl text-center">
          <Skeleton className="h-12 w-56 mx-auto mb-4 bg-white/20" />
          <Skeleton className="h-6 w-72 mx-auto bg-white/20" />
        </div>
      </div>

      {/* Gallery grid skeleton */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
