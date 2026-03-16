'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowDown,
  DollarSign,
  Loader2,
  Copy,
  MessageCircle,
  Mail,
  Check,
  CheckCircle,
  Clock,
  X,
  MapPin,
} from 'lucide-react'
import { categories, fundTiers, categoryColors, ITEM_DEADLINE, type ItemSourcing } from './category-data'
import { PledgeModal } from './pledge-modal'
import { SponsorshipSection } from './sponsorship-section'

interface PledgeStat {
  category_id: string
  item_name: string
  pledge_count: number
  total_quantity: number
}

interface PackTheMissionClientProps {
  initialPledgeStats: PledgeStat[]
}

export default function PackTheMissionClient({ initialPledgeStats }: PackTheMissionClientProps) {
  const searchParams = useSearchParams()
  const [pledgeStats, setPledgeStats] = useState<PledgeStat[]>(initialPledgeStats)
  const [selectedFundAmount, setSelectedFundAmount] = useState<number | null>(null)
  const [customFundAmount, setCustomFundAmount] = useState('')
  const [fundLoading, setFundLoading] = useState(false)
  const [fundError, setFundError] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

  // Pledge modal state
  const [pledgeModalOpen, setPledgeModalOpen] = useState(false)
  const [pledgeCategoryId, setPledgeCategoryId] = useState('')
  const [pledgeItemName, setPledgeItemName] = useState('')
  const [pledgeItemValue, setPledgeItemValue] = useState('')
  const [pledgeFundAmount, setPledgeFundAmount] = useState(0)
  const [pledgeSourcing, setPledgeSourcing] = useState<ItemSourcing>('us')

  // Handle success redirects from Stripe
  useEffect(() => {
    if (searchParams.get('funded') === 'true') {
      setSuccessBanner('Your contribution was received! Thank you for funding the mission.')
      window.history.replaceState({}, '', '/kenya/pack-the-mission')
    } else if (searchParams.get('sponsored') === 'true') {
      setSuccessBanner('Your sponsorship is active! Thank you for investing in lives.')
      window.history.replaceState({}, '', '/kenya/pack-the-mission')
    }
  }, [searchParams])

  // Stats helpers
  const getItemPledgeCount = (categoryId: string, itemName: string) => {
    const stat = pledgeStats.find(
      (s) => s.category_id === categoryId && s.item_name === itemName
    )
    return stat?.pledge_count || 0
  }

  const getCategoryProgress = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId)
    if (!cat) return 0
    const pledgedItems = cat.items.filter(
      (item) => getItemPledgeCount(categoryId, item.name) > 0
    ).length
    return Math.round((pledgedItems / cat.items.length) * 100)
  }

  const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0)
  const totalPledgedItems = categories.reduce((acc, cat) => {
    return acc + cat.items.filter((item) => getItemPledgeCount(cat.id, item.name) > 0).length
  }, 0)
  const overallProgress = Math.round((totalPledgedItems / totalItems) * 100)

  const getCategoryTotalValue = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId)
    if (!cat) return 0
    return cat.items.reduce((acc, item) => {
      const qty = parseInt(item.qty.replace(/[^0-9]/g, '')) || 1
      return acc + item.fundAmount * qty
    }, 0)
  }

  const openPledgeModal = (categoryId: string, itemName: string, itemValue: string, fundAmount: number, sourcing: ItemSourcing) => {
    setPledgeCategoryId(categoryId)
    setPledgeItemName(itemName)
    setPledgeItemValue(itemValue)
    setPledgeFundAmount(fundAmount)
    setPledgeSourcing(sourcing)
    setPledgeModalOpen(true)
  }

  const refreshPledgeStats = useCallback(async () => {
    try {
      const response = await fetch('/api/kenya/pack-the-mission/pledge?stats=true')
      if (response.ok) {
        const data = await response.json()
        if (data.stats) setPledgeStats(data.stats)
      }
    } catch { /* silent */ }
  }, [])

  const handleFundSelect = (amount: number) => {
    setSelectedFundAmount(amount)
    setCustomFundAmount('')
  }

  const getFundAmount = () => customFundAmount ? parseFloat(customFundAmount) : selectedFundAmount

  const handleFundSubmit = async () => {
    const amount = getFundAmount()
    if (!amount || amount < 1) {
      setFundError('Please select or enter an amount')
      return
    }

    setFundLoading(true)
    setFundError(null)

    try {
      const response = await fetch('/api/kenya/pack-the-mission/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          designation: 'Pack the Mission — Supply Fund',
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session')
      if (data.url) window.location.href = data.url
    } catch (err: unknown) {
      setFundError(err instanceof Error ? err.message : 'Something went wrong')
      setFundLoading(false)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch { /* silent */ }
  }

  const shareText = () => {
    const text = "Help us pack supplies for Kenya 2026! From laptops to toothbrushes — every item counts. See what's needed: " + window.location.href
    if (navigator.share) {
      navigator.share({ title: 'Pack the Mission — Kenya 2026', text })
    } else {
      window.open(`sms:?body=${encodeURIComponent(text)}`)
    }
  }

  const shareEmail = () => {
    const subject = 'Help Us Pack for Kenya 2026'
    const body = `Hey!\n\nOur delegation is heading to Kenya this April and we're collecting supplies — everything from laptops and cameras to toothbrushes and school supplies.\n\nYou can browse what's needed and pledge specific items or contribute funds here:\n${window.location.href}\n\nNo pressure, no minimum — every item helps.\n\n— The Kenya 2026 Team`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* ===== SUCCESS BANNER ===== */}
      {successBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white py-4 px-6 flex items-center justify-center gap-3 shadow-lg">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold text-sm">{successBanner}</span>
          <button onClick={() => setSuccessBanner(null)} className="ml-4 hover:bg-white/20 rounded-full p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ===== HERO — Compact + Urgent ===== */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-navy-dark via-navy to-navy-dark">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(212,175,55,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(212,175,55,0.1),transparent_50%)]" />
        </div>

        <div className="relative z-10 text-center max-w-3xl px-4 py-12">
          <Link
            href="/kenya"
            className="inline-flex items-center gap-2 text-gold-light/60 hover:text-gold mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Kenya Trip
          </Link>

          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="bg-gold text-navy text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full">
              Kenya 2026
            </span>
            <span className="bg-red-500/20 text-red-300 text-xs font-bold px-4 py-1.5 rounded-full border border-red-500/30 flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Items due by {ITEM_DEADLINE}
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
            Pack <em className="text-gold-light italic">the</em> Mission
          </h1>

          <p className="text-white/60 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            We&apos;re heading to Kenya with supplies for communities across 3 cities.
            You don&apos;t have to be on the plane — help us pack what matters.
          </p>

          {/* Stats row */}
          <div className="flex justify-center gap-6 md:gap-10 mb-8 flex-wrap">
            {[
              { num: '3', label: 'Cities' },
              { num: '14', label: 'Days' },
              { num: `${totalItems}`, label: 'Items Needed' },
              { num: `${totalPledgedItems}`, label: 'Pledged' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-serif text-3xl md:text-4xl font-bold text-gold">{stat.num}</div>
                <div className="text-white/40 text-xs tracking-widest uppercase mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Overall progress bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex items-center justify-between text-xs text-white/40 mb-2">
              <span>{totalPledgedItems} of {totalItems} items covered</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-1000"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gold hover:bg-gold-light text-navy font-bold text-sm tracking-wide px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/30 flex items-center gap-2"
            >
              <ArrowDown className="h-4 w-4" />
              Browse & Pledge Items
            </button>
            <button
              onClick={() => document.getElementById('fund')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-white/20 hover:border-gold text-white hover:text-gold font-semibold text-sm px-8 py-4 rounded-full transition-all flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Give Funds Instead
            </button>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS — Compact strip ===== */}
      <section className="px-4 py-12 bg-white border-b border-navy/5">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '1', title: 'Bring or Ship It', desc: 'Have the item? Drop it off or ship it to us before April 15.' },
              { num: '2', title: 'Fund It', desc: 'Pay for any item — we\'ll buy it here or source it in Kenya, whichever is smarter.' },
              { num: '3', title: 'Sponsor a Life', desc: 'Go deeper — sponsor a student, orphan, classroom, or school lunch program.' },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold text-navy font-serif text-lg font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-navy text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-navy/50 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SUPPLY CATEGORIES ===== */}
      <section id="categories" className="px-4 py-16 bg-cream">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-3">What We Need</h2>
            <p className="text-navy/60">
              Tap any item to pledge, ship, or fund it. Kenya-sourced items are flagged — we&apos;ll buy those on the ground.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((cat) => {
              const colors = categoryColors[cat.colorClass]
              const progress = getCategoryProgress(cat.id)
              const pledgedItemCount = cat.items.filter(
                (item) => getItemPledgeCount(cat.id, item.name) > 0
              ).length
              const totalValue = getCategoryTotalValue(cat.id)

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-navy/5"
                >
                  {/* Header */}
                  <div className="p-5 pb-3 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${colors?.icon || 'bg-gray-100'}`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-navy">{cat.name}</h3>
                        <span className="text-xs font-semibold text-navy/30">~${totalValue.toLocaleString()} total</span>
                      </div>
                      <p className="text-xs text-navy/50">{cat.desc}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="px-5 mb-1">
                    <div className="h-1.5 bg-cream rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${colors?.fill || 'bg-gray-400'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between px-5 mb-2">
                    <span className="text-[11px] text-navy/40 font-medium">
                      {pledgedItemCount}/{cat.items.length} items pledged
                    </span>
                    <span className="text-[11px] text-navy/40 font-medium">{progress}%</span>
                  </div>

                  {/* Items list */}
                  <div className="px-5 pb-2">
                    {cat.items.map((item) => {
                      const count = getItemPledgeCount(cat.id, item.name)
                      const isPledged = count > 0
                      const isKenya = item.sourcing === 'kenya'
                      return (
                        <div
                          key={item.name}
                          className="flex items-center py-2 border-b border-navy/5 last:border-b-0 gap-2"
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 text-[10px] ${
                              isPledged
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-navy/15'
                            }`}
                          >
                            {isPledged && <Check className="h-2.5 w-2.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-navy truncate">{item.name}</span>
                              {isKenya && (
                                <span title="Best sourced in Kenya"><MapPin className="h-3 w-3 text-gold-dark flex-shrink-0" /></span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-gold-dark font-medium">{item.value}</span>
                              <span className="text-[11px] text-navy/30">&middot; {item.qty}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => !isPledged && openPledgeModal(cat.id, item.name, item.value, item.fundAmount, item.sourcing)}
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all flex-shrink-0 whitespace-nowrap ${
                              isPledged
                                ? 'bg-green-500 border-green-500 text-white cursor-default'
                                : isKenya
                                  ? 'bg-gold/10 border-gold text-gold-dark hover:bg-gold hover:text-navy cursor-pointer'
                                  : 'border-gold text-gold-dark hover:bg-gold hover:text-navy cursor-pointer'
                            }`}
                          >
                            {isPledged
                              ? `Pledged${count > 1 ? ` (${count})` : ''}`
                              : isKenya
                                ? `Fund $${item.fundAmount}`
                                : 'I Got This'}
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Fund category button */}
                  <div className="px-5 pb-5">
                    <button
                      onClick={() => {
                        setSelectedFundAmount(100)
                        setCustomFundAmount('')
                        document.getElementById('fund')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="w-full py-2.5 bg-cream border-2 border-dashed border-gold/60 rounded-xl text-gold-dark font-semibold text-xs hover:bg-gold/10 hover:border-solid transition-all"
                    >
                      Fund this entire category
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== SPONSORSHIP SPOTLIGHT ===== */}
      <SponsorshipSection />

      {/* ===== FUND THE MISSION ===== */}
      <section id="fund" className="px-4 py-16 bg-navy-dark text-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold tracking-widest uppercase text-gold-light mb-3">Fund the Mission</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
              Let Us Do the Shopping
            </h2>
            <p className="text-white/50">
              Pick an amount — we&apos;ll buy supplies here or source them in Kenya, whichever stretches your dollar further.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {fundTiers.map((tier) => (
              <button
                key={tier.amount}
                onClick={() => handleFundSelect(tier.amount)}
                className={`rounded-2xl p-5 text-left transition-all border-2 ${
                  selectedFundAmount === tier.amount && !customFundAmount
                    ? 'border-gold bg-gold/10 scale-[1.02]'
                    : 'border-white/10 bg-white/5 hover:border-gold/50'
                }`}
              >
                <div className="font-serif text-2xl md:text-3xl font-bold text-gold mb-1">${tier.amount.toLocaleString()}</div>
                <div className="text-xs text-white/60 leading-snug mb-1">{tier.desc}</div>
                <div className="text-[11px] text-gold-light/50 font-medium">{tier.impact}</div>
              </button>
            ))}
          </div>

          {/* Custom amount + CTA */}
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-2 bg-white/10 rounded-full p-2 border-2 border-white/10 focus-within:border-gold transition-colors mb-4">
              <DollarSign className="h-5 w-5 text-gold ml-3" />
              <Input
                type="number"
                placeholder="Custom amount"
                value={customFundAmount}
                onChange={(e) => {
                  setCustomFundAmount(e.target.value)
                  setSelectedFundAmount(null)
                }}
                className="flex-1 bg-transparent border-none text-white text-lg font-semibold placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Big CTA — only shows when amount selected */}
            {(getFundAmount() ?? 0) > 0 && (
              <Button
                onClick={handleFundSubmit}
                disabled={fundLoading}
                size="lg"
                className="w-full bg-gold hover:bg-gold-light text-navy font-bold h-14 rounded-full text-lg shadow-lg shadow-gold/20 mb-3"
              >
                {fundLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</>
                ) : (
                  <>Give ${(getFundAmount() ?? 0).toLocaleString()} Now</>
                )}
              </Button>
            )}

            {fundError && (
              <p className="text-red-400 text-sm text-center mb-3">{fundError}</p>
            )}

            <p className="text-white/20 text-xs text-center">
              Tax-deductible &bull; 501(c)(3) &bull; TPC Ministries &bull; Secure via Stripe
            </p>
          </div>
        </div>
      </section>

      {/* ===== SHARE SECTION — Light bg to break dark monotony ===== */}
      <section className="px-4 py-16 bg-cream border-t border-navy/5">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-3">One Share = One More Suitcase Filled</h2>
          <p className="text-navy/50 mb-8 max-w-lg mx-auto">
            Send this to someone who might help. One text could be the thing that gets a laptop into a student&apos;s hands.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-navy/10 text-navy text-sm font-semibold hover:border-gold hover:bg-gold/5 transition-all"
            >
              {linkCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {linkCopied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={shareText}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-navy/10 text-navy text-sm font-semibold hover:border-gold hover:bg-gold/5 transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              Text a Friend
            </button>
            <button
              onClick={shareEmail}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-navy/10 text-navy text-sm font-semibold hover:border-gold hover:bg-gold/5 transition-all"
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-navy-dark px-4 py-8">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center gap-6 mb-4 flex-wrap text-xs text-white/30 tracking-widest uppercase">
            <span>TPC Ministries</span>
            <span>RISE</span>
            <span>IHA</span>
            <span>Uplift</span>
            <span>KDA</span>
          </div>
          <p className="text-white/20 text-sm">
            Kenya 2026 Global Impact Delegation &middot; April 23 – May 6 &middot;{' '}
            <Link href="/kenya" className="text-gold hover:text-gold-light transition-colors">
              tpcmin.org/kenya
            </Link>
          </p>
        </div>
      </footer>

      {/* Pledge Modal */}
      <PledgeModal
        open={pledgeModalOpen}
        onOpenChange={setPledgeModalOpen}
        categoryId={pledgeCategoryId}
        itemName={pledgeItemName}
        itemValue={pledgeItemValue}
        fundAmount={pledgeFundAmount}
        sourcing={pledgeSourcing}
        onPledgeSuccess={refreshPledgeStats}
      />
    </div>
  )
}
