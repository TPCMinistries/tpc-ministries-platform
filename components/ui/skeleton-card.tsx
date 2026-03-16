import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  className?: string
  lines?: number
  showImage?: boolean
}

export function SkeletonCard({ className, lines = 3, showImage = false }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 space-y-4",
        className
      )}
    >
      {showImage && (
        <div className="skeleton-gold h-40 rounded-lg" />
      )}
      <div className="space-y-3">
        <div className="skeleton-gold h-5 w-3/4 rounded-md" />
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton-gold h-4 rounded-md"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("skeleton-gold rounded-md", className)} />
  )
}
