export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* Logo/Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gold mb-2">TPC Ministries</h1>
            <p className="text-gray-300">Transforming Lives Through Christ</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
