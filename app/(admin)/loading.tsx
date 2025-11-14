import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-navy mx-auto mb-4" />
        <p className="text-gray-600">Loading admin panel...</p>
      </div>
    </div>
  )
}
