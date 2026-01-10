import { Loader2 } from 'lucide-react'

export default function PublicLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-navy mx-auto mb-3" aria-hidden="true" />
        <p className="text-gray-600 sr-only">Loading...</p>
      </div>
    </div>
  )
}
