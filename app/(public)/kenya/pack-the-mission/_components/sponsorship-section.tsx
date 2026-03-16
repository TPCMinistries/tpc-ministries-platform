'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Heart, GraduationCap } from 'lucide-react'
import { sponsorshipItems, type SponsorshipItem } from './category-data'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export function SponsorshipSection() {
  const [selectedItem, setSelectedItem] = useState<SponsorshipItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSponsor = (item: SponsorshipItem) => {
    setSelectedItem(item)
    setModalOpen(true)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required')
      return
    }
    if (!selectedItem) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/kenya/pack-the-mission/sponsorship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsorName: name.trim(),
          sponsorEmail: email.trim(),
          sponsorshipType: selectedItem.name,
          amount: selectedItem.amount,
          frequency: selectedItem.frequency,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process sponsorship')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setLoading(false)
    }
  }

  const resetModal = () => {
    setName('')
    setEmail('')
    setError(null)
    setLoading(false)
    setSelectedItem(null)
  }

  return (
    <>
      <section className="px-4 py-20 bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-gold/15 rounded-full px-4 py-2 mb-4">
              <Heart className="h-4 w-4 text-gold-dark" />
              <span className="text-gold-dark text-sm font-semibold">Sponsorship Spotlight</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy mb-4">
              Invest in a Life
            </h2>
            <p className="text-navy/60 text-lg">
              Go beyond supplies — sponsor a student, an orphan, or an entire school.
              Monthly or one-time, your investment changes trajectories.
            </p>
          </div>

          {/* Monthly Sponsorships */}
          <h3 className="text-sm font-bold tracking-widest uppercase text-navy/40 mb-4">Monthly Sponsorships</h3>
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {sponsorshipItems.filter(i => i.frequency === 'monthly').map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-gold/20 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-gold/15 text-gold-dark px-2.5 py-1 rounded-full">
                    Monthly
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy mb-1">{item.name}</h3>
                <p className="text-xs text-navy/60 mb-4 leading-relaxed">{item.description}</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-gold-dark">${item.amount}</span>
                  <span className="text-sm text-navy/40">/month</span>
                </div>
                <Button
                  onClick={() => handleSponsor(item)}
                  className="w-full bg-gold hover:bg-gold-light text-navy font-bold rounded-full"
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Sponsor Monthly
                </Button>
              </div>
            ))}
          </div>

          {/* One-Time Sponsorships */}
          <h3 className="text-sm font-bold tracking-widest uppercase text-navy/40 mb-4">One-Time Sponsorships</h3>
          <div className="grid md:grid-cols-3 gap-5">
            {sponsorshipItems.filter(i => i.frequency === 'one_time').map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-navy/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-navy/5 text-navy/50 px-2.5 py-1 rounded-full">
                    One-Time
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy mb-1">{item.name}</h3>
                <p className="text-xs text-navy/60 mb-4 leading-relaxed">{item.description}</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-navy">${item.amount.toLocaleString()}</span>
                </div>
                <Button
                  onClick={() => handleSponsor(item)}
                  variant="outline"
                  className="w-full border-2 border-navy/20 text-navy font-bold rounded-full hover:bg-navy hover:text-white"
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Sponsor Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsorship form modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) resetModal(); setModalOpen(open) }}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {selectedItem?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.frequency === 'monthly'
                ? `$${selectedItem?.amount}/month — enter your details to proceed to secure checkout.`
                : `$${selectedItem?.amount} one-time — enter your details to proceed to secure checkout.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="sponsor-name" className="text-xs font-semibold uppercase tracking-wide text-navy/60">
                Your Name
              </Label>
              <Input
                id="sponsor-name"
                placeholder="First & last name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 bg-cream border-navy/10 focus:border-gold focus:ring-gold rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="sponsor-email" className="text-xs font-semibold uppercase tracking-wide text-navy/60">
                Email
              </Label>
              <Input
                id="sponsor-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 bg-cream border-navy/10 focus:border-gold focus:ring-gold rounded-xl"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                {error}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-light text-navy font-bold h-12 rounded-full text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Proceed to Checkout</>
              )}
            </Button>

            <p className="text-center text-xs text-navy/40">
              Secure payment via Stripe. Tax-deductible. You&apos;ll receive a receipt.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
