import type { Metadata } from 'next'
import { getUnifiedSubscribers } from '@/lib/db/subscribers'

export const metadata: Metadata = { title: 'Unified Audience — Admin' }
export const dynamic = 'force-dynamic'

const SOURCE_LABEL: Record<string, string> = {
  member: 'Member',
  lead: 'Lead',
  newsletter: 'Newsletter',
}
const SOURCE_COLOR: Record<string, string> = {
  member: 'bg-emerald-100 text-emerald-800',
  lead: 'bg-amber-100 text-amber-800',
  newsletter: 'bg-blue-100 text-blue-800',
}

export default async function AdminAudiencePage() {
  const subscribers = await getUnifiedSubscribers().catch(() => [])

  const total = subscribers.length
  const sendEligible = subscribers.filter((s) => s.sendEligible).length
  const bySource = subscribers.reduce(
    (acc, s) => {
      acc[s.source] = (acc[s.source] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Most recent first; show the latest 200 for a quick scan.
  const recent = [...subscribers]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, 200)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-navy">Unified Audience</h1>
        <p className="mt-1 text-sm text-gray-600">
          One deduplicated list across members, leads, and newsletter subscribers — merged by email
          with source attribution. Read-only; no records are moved or changed.
        </p>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Unique people" value={total} accent="text-navy" />
        <StatCard label="Send-eligible" value={sendEligible} accent="text-emerald-700" />
        <StatCard label="Members" value={bySource.member ?? 0} accent="text-emerald-700" />
        <StatCard
          label="Leads + Newsletter"
          value={(bySource.lead ?? 0) + (bySource.newsletter ?? 0)}
          accent="text-amber-700"
        />
      </div>

      <p className="mt-3 text-xs text-gray-500">
        {total - sendEligible} opted out / not send-eligible. Send-eligibility respects each store&apos;s
        opt-out (members&apos; email_notifications, newsletter is_subscribed).
      </p>

      {/* Recent table */}
      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="font-semibold text-navy">Most recent {recent.length}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-2.5 font-medium">Email</th>
                <th className="px-5 py-2.5 font-medium">Name</th>
                <th className="px-5 py-2.5 font-medium">Source</th>
                <th className="px-5 py-2.5 font-medium">Sendable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recent.map((s) => (
                <tr key={s.email} className="hover:bg-gray-50">
                  <td className="px-5 py-2.5 font-medium text-navy">{s.email}</td>
                  <td className="px-5 py-2.5 text-gray-600">{s.name || '—'}</td>
                  <td className="px-5 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SOURCE_COLOR[s.source]}`}
                    >
                      {SOURCE_LABEL[s.source]}
                      {s.sourceDetail ? ` · ${s.sourceDetail}` : ''}
                    </span>
                  </td>
                  <td className="px-5 py-2.5">
                    {s.sendEligible ? (
                      <span className="text-emerald-700">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                    No subscribers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value.toLocaleString()}</p>
    </div>
  )
}
