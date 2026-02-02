"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { BookOpen, Share2, Heart, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VerseCardProps {
  verse: string
  reference: string
  onShare?: () => void
  onSave?: () => void
  onRefresh?: () => void
  variant?: "default" | "hero" | "minimal"
  className?: string
}

export function VerseCard({
  verse,
  reference,
  onShare,
  onSave,
  onRefresh,
  variant = "default",
  className,
}: VerseCardProps) {
  const [isSaved, setIsSaved] = React.useState(false)

  const handleSave = () => {
    setIsSaved(!isSaved)
    onSave?.()
  }

  if (variant === "hero") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden rounded-2xl bg-gradient-to-br from-tpc-navy via-tpc-navy/95 to-tpc-navy/90 text-white p-8",
          className
        )}
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-tpc-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-tpc-gold mb-4">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Today&apos;s Word</span>
          </div>
          
          <blockquote className="text-2xl lg:text-3xl font-serif italic leading-relaxed mb-4">
            &ldquo;{verse}&rdquo;
          </blockquote>
          
          <p className="text-tpc-gold font-medium mb-6">— {reference}</p>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={handleSave}
            >
              <Heart className={cn("h-4 w-4 mr-2", isSaved && "fill-current text-red-400")} />
              {isSaved ? "Saved" : "Save"}
            </Button>
            {onShare && (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={onShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            {onRefresh && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/70 hover:text-white hover:bg-white/10 ml-auto"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === "minimal") {
    return (
      <div className={cn("p-4", className)}>
        <blockquote className="text-lg font-serif italic text-foreground mb-2">
          &ldquo;{verse}&rdquo;
        </blockquote>
        <p className="text-sm text-muted-foreground font-medium">— {reference}</p>
      </div>
    )
  }

  // Default card variant
  return (
    <Card className={cn("border-l-4 border-l-tpc-gold overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-tpc-gold mb-3">
          <BookOpen className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Today&apos;s Word</span>
        </div>
        
        <blockquote className="text-lg lg:text-xl font-serif italic text-foreground mb-3 leading-relaxed">
          &ldquo;{verse}&rdquo;
        </blockquote>
        
        <p className="text-sm text-muted-foreground font-medium mb-4">— {reference}</p>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Heart className={cn("h-4 w-4 mr-1.5", isSaved && "fill-current text-red-500")} />
            {isSaved ? "Saved" : "Save"}
          </Button>
          {onShare && (
            <Button variant="ghost" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4 mr-1.5" />
              Share
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
