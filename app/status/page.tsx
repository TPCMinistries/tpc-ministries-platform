export default function StatusPage() {
  const routes = [
    { path: '/', name: 'Homepage' },
    { path: '/auth/login', name: 'Login' },
    { path: '/auth/signup', name: 'Signup' },
    { path: '/member/dashboard', name: 'Member Dashboard' },
    { path: '/admin-dashboard', name: 'Admin Dashboard' },
    { path: '/admin/communications', name: 'Communications (Original)' },
    { path: '/admin/communications-enhanced', name: 'Communications (Enhanced)' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-navy mb-8">🔍 TPC Ministries - Route Status</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Deployment Info</h2>
          <p className="text-gray-600 mb-2">
            <strong>Build Time:</strong> {new Date().toLocaleString()}
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Status:</strong> <span className="text-green-600 font-bold">✅ LIVE</span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Available Routes</h2>
          <div className="space-y-3">
            {routes.map((route) => (
              <div key={route.path} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-navy">{route.name}</div>
                  <div className="text-sm text-gray-600">{route.path}</div>
                </div>
                <a
                  href={route.path}
                  className="bg-navy text-white px-4 py-2 rounded hover:bg-navy/90 text-sm"
                >
                  Visit →
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>ℹ️ Note:</strong> If you're seeing a 404 error, try hard-refreshing your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows) to clear the old cache.
          </p>
        </div>
      </div>
    </div>
  )
}
