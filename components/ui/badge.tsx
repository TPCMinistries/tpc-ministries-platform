import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        gold:
          "border-transparent bg-gold/20 text-gold-700 dark:text-gold-300 dark:bg-gold/10",
        navy:
          "border-transparent bg-navy/10 text-navy dark:text-navy-200 dark:bg-navy-200/10",
        prayer:
          "border-transparent bg-spiritual/15 text-purple-700 dark:text-purple-300 dark:bg-spiritual/10",
        prophecy:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
        giving:
          "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
        success:
          "border-transparent bg-success/15 text-emerald-700 dark:text-emerald-300",
        warning:
          "border-transparent bg-warning/15 text-amber-700 dark:text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
