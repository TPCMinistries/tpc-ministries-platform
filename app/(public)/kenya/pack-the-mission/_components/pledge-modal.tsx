'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, Package, CreditCard, Truck, MapPin } from 'lucide-react'
import { ITEM_DEADLINE, type ItemSourcing } from './category-data'

type ModalMode = 'choose' | 'pledge' | 'ship' | 'fund'

interface PledgeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryId: string
  itemName: string
  itemValue: string
  fundAmount: number
  sourcing: ItemSourcing
  onPledgeSuccess: () => void
}

export function PledgeModal({
  open,
  onOpenChange,
  categoryId,
  itemName,
  itemValue,
  fundAmount,
  sourcing,
  onPledgeSuccess,
}: PledgeModalProps) {
  const [mode, setMode] = useState<ModalMode>('choose')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isKenyaSourced = sourcing === 'kenya'

  const resetForm = () => {
    setMode('choose')
    setName('')
    setEmail('')
    setPhone('')
    setNotes('')
    setError(null)
    setSuccess(false)
    setLoading(false)
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm()
    onOpenChange(isOpen)
  }

  const handlePledgeSubmit = async (pledgeType: 'bring' | 'ship') => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (!email.trim() && !phone.trim()) {
      setError('Please enter an email or phone number')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/kenya/pack-the-mission/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pledgerName: name.trim(),
          pledgerEmail: email.trim() || undefined,
          pledgerPhone: phone.trim() || undefined,
          categoryId,
          itemName,
          estimatedValue: itemValue,
          notes: `[${pledgeType === 'ship' ? 'SHIPPING TO TPC' : 'WILL DROP OFF'}] ${notes.trim() || ''}`.trim(),
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to submit pledge')

      setSuccess(true)
      onPledgeSuccess()
      setTimeout(() => handleClose(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleFundSubmit = async () => {
    if (!email.trim()) {
      setError('Email is required for payment receipt')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/kenya/pack-the-mission/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: fundAmount,
          designation: `${itemName} (${categoryId})`,
          donorName: name.trim() || undefined,
          donorEmail: email.trim(),
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session')
      if (data.url) window.location.href = data.url
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  // ── Choose screen ──
  const renderChoose = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-serif">{itemName}</DialogTitle>
        <DialogDescription>
          {itemValue} — How would you like to help?
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3 mt-3">
        {/* Option 1: I'll Bring This — only for US-sourced items */}
        {!isKenyaSourced && (
          <button
            onClick={() => setMode('pledge')}
            className="flex items-start gap-4 p-4 rounded-xl border-2 border-navy/10 hover:border-gold hover:bg-gold/5 transition-all text-left group"
          >
            <div className="w-11 h-11 rounded-xl bg-cream flex items-center justify-center flex-shrink-0 group-hover:bg-gold/15 transition-colors">
              <Package className="h-5 w-5 text-navy/50 group-hover:text-gold-dark" />
            </div>
            <div>
              <h4 className="font-bold text-navy text-sm">I&apos;ll Drop This Off</h4>
              <p className="text-xs text-navy/50 mt-0.5 leading-relaxed">
                You already have it or will buy it. Drop off at our collection point by <strong>{ITEM_DEADLINE}</strong>.
              </p>
            </div>
          </button>
        )}

        {/* Option 2: I'll Ship This — for US-sourced items */}
        {!isKenyaSourced && (
          <button
            onClick={() => setMode('ship')}
            className="flex items-start gap-4 p-4 rounded-xl border-2 border-navy/10 hover:border-gold hover:bg-gold/5 transition-all text-left group"
          >
            <div className="w-11 h-11 rounded-xl bg-cream flex items-center justify-center flex-shrink-0 group-hover:bg-gold/15 transition-colors">
              <Truck className="h-5 w-5 text-navy/50 group-hover:text-gold-dark" />
            </div>
            <div>
              <h4 className="font-bold text-navy text-sm">I&apos;ll Ship This to You</h4>
              <p className="text-xs text-navy/50 mt-0.5 leading-relaxed">
                You&apos;ll mail or ship it to us. Must arrive by <strong>{ITEM_DEADLINE}</strong> — we&apos;ll send you the address.
              </p>
            </div>
          </button>
        )}

        {/* Option 3: Fund This Item — always shown, primary for Kenya-sourced */}
        <button
          onClick={() => setMode('fund')}
          className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left group ${
            isKenyaSourced
              ? 'border-gold/30 bg-gold/5 hover:border-gold'
              : 'border-navy/10 hover:border-gold hover:bg-gold/5'
          }`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            isKenyaSourced ? 'bg-gold/15' : 'bg-cream group-hover:bg-gold/15'
          }`}>
            <CreditCard className={`h-5 w-5 ${isKenyaSourced ? 'text-gold-dark' : 'text-navy/50 group-hover:text-gold-dark'}`} />
          </div>
          <div>
            <h4 className="font-bold text-navy text-sm">
              Fund This Item — ${fundAmount}
            </h4>
            <p className="text-xs text-navy/50 mt-0.5 leading-relaxed">
              {isKenyaSourced
                ? <>We&apos;ll purchase this in Kenya — cheaper locally and supports the economy. Secure Stripe checkout.</>
                : <>Pay now and we&apos;ll purchase it. Secure checkout via Stripe. Tax-deductible.</>
              }
            </p>
            {isKenyaSourced && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-gold-dark bg-gold/10 px-2 py-0.5 rounded-full">
                <MapPin className="h-3 w-3" />
                Best sourced in Kenya
              </span>
            )}
          </div>
        </button>

        {/* For Kenya-sourced items, still allow physical pledge as secondary */}
        {isKenyaSourced && (
          <button
            onClick={() => setMode('pledge')}
            className="flex items-start gap-4 p-4 rounded-xl border-2 border-navy/10 hover:border-gold hover:bg-gold/5 transition-all text-left group"
          >
            <div className="w-11 h-11 rounded-xl bg-cream flex items-center justify-center flex-shrink-0 group-hover:bg-gold/15 transition-colors">
              <Package className="h-5 w-5 text-navy/50 group-hover:text-gold-dark" />
            </div>
            <div>
              <h4 className="font-bold text-navy text-sm">I Have This Item Already</h4>
              <p className="text-xs text-navy/50 mt-0.5 leading-relaxed">
                Drop off or ship to us by <strong>{ITEM_DEADLINE}</strong>. We&apos;ll coordinate.
              </p>
            </div>
          </button>
        )}
      </div>
    </>
  )

  // ── Pledge form (drop-off) ──
  const renderPledgeForm = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-serif">
          {isKenyaSourced ? 'Deliver' : 'Drop Off'}: {itemName}
        </DialogTitle>
        <DialogDescription>
          We&apos;ll coordinate pickup or delivery. Items must reach us by <strong>{ITEM_DEADLINE}</strong>.
        </DialogDescription>
      </DialogHeader>
      {renderContactForm('pledge')}
    </>
  )

  // ── Ship form ──
  const renderShipForm = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-serif">Ship: {itemName}</DialogTitle>
        <DialogDescription>
          We&apos;ll send you our shipping address. Package must arrive by <strong>{ITEM_DEADLINE}</strong>.
        </DialogDescription>
      </DialogHeader>
      {renderContactForm('ship')}
    </>
  )

  // ── Fund form ──
  const renderFundForm = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-serif">Fund: {itemName}</DialogTitle>
        <DialogDescription>
          ${fundAmount} —{' '}
          {isKenyaSourced
            ? 'We\'ll purchase this from local Kenyan suppliers.'
            : 'We\'ll purchase this item and bring it to Kenya.'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-2">
        <div>
          <Label htmlFor="fund-name" className="text-xs font-semibold uppercase tracking-wide text-navy/60">
            Your Name (optional)
          </Label>
          <Input
            id="fund-name"
            placeholder="First & last name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 bg-cream border-navy/10 focus:border-gold focus:ring-gold rounded-xl"
          />
        </div>
        <div>
          <Label htmlFor="fund-email" className="text-xs font-semibold uppercase tracking-wide text-navy/60">
            Email (for receipt)
          </Label>
          <Input
            id="fund-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 bg-cream border-navy/10 focus:border-gold focus:ring-gold rounded-xl"
          />
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">{error}</div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => { setMode('choose'); setError(null) }} className="rounded-full border-navy/10">
            Back
          </Button>
          <Button
            onClick={handleFundSubmit}
            disabled={loading}
            className="flex-1 bg-gold hover:bg-gold-light text-navy font-bold h-12 rounded-full text-base"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</>
            ) : (
              <><CreditCard className="mr-2 h-5 w-5" />Pay ${fundAmount} Now</>
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-navy/40">
          Secure payment via Stripe. Tax-deductible. You&apos;ll receive a receipt.
        </p>
      </div>
    </>
  )

  // ── Shared contact form for pledge + ship ──
  const renderContactForm = (type: 'pledge' | 'ship') => (
    <div className="space-y-4 mt-2">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        <strong>Deadline:</strong> {ITEM_DEADLINE} — {type === 'ship' ? 'must arrive' : 'must be delivered'} before we depart for Kenya.
      </div>

      <div>
        <Label htmlFor={`${type}-name`} className="text-xs font-semibold uppercase tracking-wide text-navy/60">
          Your Name
        </Label>
        <Input
          id={`${type}-name`}
          placeholder="First & last name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 bg-cream border-navy/10 focus:border-gold focus:ring-gold rounded-xl"
        />
      </div>
      <div>
        <Label htmlFor={`${type}-email`} className="text-xs font-semibold uppercase tracking-wide text-navy/60">
          Email
        </Label>
        <Input
          id={`${type}-email`}
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 bg-cream border-navy/10 focus:border-gold focus:ring-gold rounded-xl"
        />
      </div>
      <div>
        <Label htmlFor={`${type}-phone`} className="text-xs font-semibold uppercase tracking-wide text-navy/60">
          Phone (optional if email provided)
        </Label>
        <Input
          id={`${type}-phone`}
          type="tel"
          placeholder="(555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1.5 bg-cream border-navy/10 focus:border-gold focus:ring-gold rounded-xl"
        />
      </div>
      <div>
        <Label htmlFor={`${type}-notes`} className="text-xs font-semibold uppercase tracking-wide text-navy/60">
          Notes (optional)
        </Label>
        <textarea
          id={`${type}-notes`}
          placeholder={type === 'ship' ? 'When do you plan to ship?' : 'Anything we should know?'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1.5 w-full rounded-xl border border-navy/10 bg-cream px-3 py-2 text-sm focus:border-gold focus:ring-gold focus:outline-none resize-none"
        />
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">{error}</div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => { setMode('choose'); setError(null) }} className="rounded-full border-navy/10">
          Back
        </Button>
        <Button
          onClick={() => handlePledgeSubmit(type === 'ship' ? 'ship' : 'bring')}
          disabled={loading}
          className="flex-1 bg-gold hover:bg-gold-light text-navy font-bold h-12 rounded-full text-base"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Submitting...</>
          ) : type === 'ship' ? (
            <><Truck className="mr-2 h-5 w-5" />I&apos;ll Ship This</>
          ) : (
            <><Package className="mr-2 h-5 w-5" />I&apos;ll Bring This</>
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-navy/40">
        Soft commitment — no payment collected.{' '}
        {type === 'ship' ? "We'll email you the shipping address." : "Our team will follow up."}
      </p>
    </div>
  )

  // ── Success screen ──
  const renderSuccess = () => (
    <div className="text-center py-6">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-8 w-8 text-white" />
      </div>
      <DialogHeader>
        <DialogTitle className="text-2xl font-serif text-center">
          You&apos;re Part of the Team!
        </DialogTitle>
        <DialogDescription className="text-center text-base mt-2">
          Thank you for pledging <strong>{itemName}</strong>. We&apos;ll be in touch within 48 hours to coordinate. You&apos;re helping make Kenya 2026 happen.
        </DialogDescription>
      </DialogHeader>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl">
        {success
          ? renderSuccess()
          : mode === 'choose'
            ? renderChoose()
            : mode === 'pledge'
              ? renderPledgeForm()
              : mode === 'ship'
                ? renderShipForm()
                : renderFundForm()}
      </DialogContent>
    </Dialog>
  )
}
