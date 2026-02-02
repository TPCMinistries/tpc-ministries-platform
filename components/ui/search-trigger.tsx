"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchTriggerProps {
  onClick?: () => void
  variant?: "default" | "outline" | "ghost" | "expanded"
  className?: string
  placeholder?: string
}

export function SearchTrigger({
  onClick,
  variant = "default",
  className,
  placeholder = "Search...",
}: SearchTriggerProps) {
  const handleClick = () => {
    // Trigger command menu with Cmd/Ctrl+K
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
    onClick?.()
  }

  if (variant === "expanded") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-3 w-full px-4 py-2.5 rounded-lg",
          "bg-muted/50 hover:bg-muted transition-colors",
          "text-muted-foreground text-sm text-left",
          "border border-transparent hover:border-border",
          className
        )}
      >
        <Search className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{placeholder}</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    )
  }

  if (variant === "outline") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className={cn("gap-2", className)}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
    )
  }

  if (variant === "ghost") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={className}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>
    )
  }

  // Default - icon button
  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={handleClick}
      className={cn("rounded-full", className)}
    >
      <Search className="h-4 w-4" />
      <span className="sr-only">Search</span>
    </Button>
  )
}
