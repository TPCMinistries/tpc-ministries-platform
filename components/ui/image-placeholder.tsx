import { ImageIcon } from 'lucide-react'

interface ImagePlaceholderProps {
  width?: number
  height?: number
  text?: string
  className?: string
}

export function ImagePlaceholder({
  width = 400,
  height = 300,
  text = 'Image Placeholder',
  className = '',
}: ImagePlaceholderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 ${className}`}
      style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : '100%' }}
    >
      <ImageIcon className="mb-2 h-12 w-12 text-slate-400" />
      <p className="text-sm font-medium text-slate-500">{text}</p>
      <p className="text-xs text-slate-400">Add image to public/images/</p>
    </div>
  )
}
