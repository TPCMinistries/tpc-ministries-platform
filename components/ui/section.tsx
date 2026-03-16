import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  size?: "sm" | "default" | "lg"
  container?: boolean
  as?: "section" | "div"
}

export function Section({
  size = "default",
  container = true,
  as: Comp = "section",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Comp
      className={cn(
        size === "sm" && "py-section-sm",
        size === "default" && "py-section",
        size === "lg" && "py-section-lg",
        className
      )}
      {...props}
    >
      {container ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      ) : (
        children
      )}
    </Comp>
  )
}
