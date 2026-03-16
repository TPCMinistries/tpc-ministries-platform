import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg"
  className?: string
  label?: string
}

export function LoadingSpinner({ size = "default", className, label = "Loading..." }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    default: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)} role="status">
      <div
        className={cn(
          "rounded-full border-gold-200 border-t-gold-500 animate-spin",
          sizeClasses[size]
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function PageLoader({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-gold-200 border-t-gold-500 animate-spin" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-b-navy/20 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
        )}
      </div>
    </div>
  )
}
