import { ImageIcon, Globe } from 'lucide-react'

interface ImagePlaceholderProps {
  width?: number
  height?: number
  text?: string
  className?: string
  aspectRatio?: string
  showIcon?: boolean
}

export function ImagePlaceholder({
  width,
  height,
  text,
  className = '',
  aspectRatio,
  showIcon = false,
}: ImagePlaceholderProps) {
  const style: React.CSSProperties = {}

  if (width) style.width = `${width}px`
  if (height) style.height = `${height}px`
  if (aspectRatio) style.aspectRatio = aspectRatio

  return (
    <div
      className={`flex flex-col items-center justify-center bg-gradient-to-br from-navy/10 via-gold/5 to-navy/10 w-full h-full ${className}`}
      style={style}
    >
      {showIcon && (
        <Globe className="h-16 w-16 text-navy/20" />
      )}
      {text && (
        <p className="text-sm font-medium text-navy/40 mt-2">{text}</p>
      )}
    </div>
  )
}
