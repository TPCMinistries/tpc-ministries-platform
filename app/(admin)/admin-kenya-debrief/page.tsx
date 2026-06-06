import { createAdminClient } from '@/lib/supabase/admin'
import { KENYA_DEBRIEF } from '@/lib/kenya-debrief'
import { CheckCircle2, Circle, Users, MailCheck, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Registration {
  id: string
  full_name: string
  email: string
  phone: string | null
  preferred_time: string | null
  how_heard: string | null
  created_at: string
  confirmation_sent_at: string | null
  reminder_t7_sent_at: string | null
  reminder_t1_sent_at: string | null
  reminder_day_of_sent_at: string | null
  unsubscribed_at: string | null
}

function Dot({ on }: { on: boolean }) {
  return on ? (
    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
  ) : (
    <Circle className="h-4 w-4 text-muted-foreground/40" />
  )
}

export default async function AdminKenyaDebriefPage() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('kenya_debrief_registrations')
    .select('*')
    .order('created_at', { ascending: false })

  const regs = (data || []) as Registration[]
  const total = regs.length
  const confirmed = regs.filter((r) => r.confirmation_sent_at).length
  const t7 = regs.filter((r) => r.reminder_t7_sent_at).length
  const t1 = regs.filter((r) => r.reminder_t1_sent_at).length
  const dayOf = regs.filter((r) => r.reminder_day_of_sent_at).length
  const unsub = regs.filter((r) => r.unsubscribed_at).length

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

  const stats = [
    { label: 'Registered', value: total, icon: Users },
    { label: 'Confirmation sent', value: confirmed, icon: MailCheck },
    { label: '1-week reminder', value: t7, icon: Clock },
    { label: 'Day-before reminder', value: t1, icon: Clock },
    { label: 'Day-of reminder', value: dayOf, icon: Clock },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-2 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Kenya Report &amp; Debrief</h1>
        <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
          {KENYA_DEBRIEF.dateLabel}
        </span>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Live virtual event registrations + automated email-sequence status.
        {unsub > 0 ? ` ${unsub} unsubscribed from reminders.` : ''}
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load registrations: {error.message}
        </div>
      )}

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <Icon className="h-5 w-5 text-gold" />
              <p className="mt-2 text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Registered</th>
              <th className="px-4 py-3 text-center font-semibold">Conf.</th>
              <th className="px-4 py-3 text-center font-semibold">T-7</th>
              <th className="px-4 py-3 text-center font-semibold">T-1</th>
              <th className="px-4 py-3 text-center font-semibold">Day-of</th>
              <th className="px-4 py-3 font-semibold">How heard</th>
            </tr>
          </thead>
          <tbody>
            {regs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  No registrations yet.
                </td>
              </tr>
            ) : (
              regs.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {r.full_name}
                    {r.unsubscribed_at && (
                      <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        unsubscribed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(r.created_at)}</td>
                  <td className="px-4 py-3"><div className="flex justify-center"><Dot on={!!r.confirmation_sent_at} /></div></td>
                  <td className="px-4 py-3"><div className="flex justify-center"><Dot on={!!r.reminder_t7_sent_at} /></div></td>
                  <td className="px-4 py-3"><div className="flex justify-center"><Dot on={!!r.reminder_t1_sent_at} /></div></td>
                  <td className="px-4 py-3"><div className="flex justify-center"><Dot on={!!r.reminder_day_of_sent_at} /></div></td>
                  <td className="px-4 py-3 text-muted-foreground">{r.how_heard || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
