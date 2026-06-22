'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUp, Sparkles, X, Loader2 } from 'lucide-react'
import { track } from '@/lib/analytics'

type ChatRole = 'user' | 'assistant'
type ChatMessage = { role: ChatRole; content: string }

const STARTER_PROMPTS = [
  'What is God saying to me in this season?',
  'I need a word of encouragement today.',
  'How do I hear God\'s voice for myself?',
  'Pray for me about my purpose.',
]

const STORAGE_KEY = 'tpc.ask-prophet.history.v1'
const MAX_STORED = 10

export function AskProphetWidget() {
  const shouldReduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [pulse, setPulse] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[]
        if (Array.isArray(parsed)) setMessages(parsed.slice(-MAX_STORED))
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (messages.length === 0) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)))
    } catch {
      // ignore
    }
  }, [messages])

  useEffect(() => {
    if (open) {
      setPulse(false)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || sending || limitReached) return

    const next: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    setSending(true)

    track('ai_chat_message', { turn: next.length })

    try {
      const res = await fetch('/api/ai/ask-prophet-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-8),
        }),
      })
      const data = await res.json()

      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])

      if (typeof data.remaining === 'number') setRemaining(data.remaining)
      if (data.limitReached) {
        setLimitReached(true)
        track('ai_chat_limit_reached', { turns: next.length })
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Forgive me, beloved — the line went quiet for a moment. Try again in a breath.',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    send(input)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  function resetChat() {
    setMessages([])
    setRemaining(null)
    setLimitReached(false)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  return (
    <>
      {/* Floating Trigger */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="trigger"
            initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.85, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              setOpen(true)
              track('ai_chat_open')
            }}
            className="group fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full border border-gold/40 bg-navy-950 px-4 py-3 text-white shadow-2xl shadow-navy-950/40 transition-all hover:border-gold hover:bg-navy-900 sm:bottom-6 sm:right-6 sm:px-5 sm:py-3.5"
          >
            <span
              className={`relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gold/40 bg-gold/10 sm:h-10 sm:w-10 ${
                pulse && !shouldReduceMotion ? 'animate-glow-pulse' : ''
              }`}
            >
              <Image
                src="/images/team/lorenzo-about.png"
                alt="Prophet Lorenzo"
                fill
                sizes="40px"
                className="object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-navy-950" />
              </span>
            </span>
            <span className="flex flex-col items-start text-left">
              <span className="text-body-xs font-medium text-gold-300/90">Ask Prophet Lorenzo</span>
              <span className="text-body-xs text-white/60">AI · powered by his teachings</span>
            </span>
            <Sparkles className="h-4 w-4 text-gold transition-transform group-hover:rotate-12" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24, scale: 0.96 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-x-3 bottom-3 z-50 flex max-h-[88svh] flex-col overflow-hidden rounded-2xl border border-gold/30 bg-navy-950 text-white shadow-2xl shadow-navy-950/50 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[400px]"
            role="dialog"
            aria-label="Ask Prophet Lorenzo"
          >
            {/* Header */}
            <div className="relative flex items-center gap-3 border-b border-white/10 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 px-4 py-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-full border border-gold/40 bg-gold/10">
                <Image
                  src="/images/team/lorenzo-about.png"
                  alt="Prophet Lorenzo"
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-body-sm font-bold text-white">Prophet Lorenzo</p>
                  <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                    AI
                  </span>
                </div>
                <p className="flex items-center gap-1.5 text-[11px] text-white/60">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online · trained on his teachings &amp; prophecy
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-navy-950 to-navy-900/80 px-3 py-4"
            >
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-4 py-3 text-body-sm leading-relaxed text-white/85">
                    Welcome, beloved. I&apos;m an AI trained on Prophet Lorenzo&apos;s teachings, prophetic
                    words, and devotionals — here to encourage you, pray with you, and help you
                    discern what God may be saying. What&apos;s on your heart?
                  </div>
                  <div className="space-y-1.5">
                    <p className="px-1 text-[11px] uppercase tracking-wider text-white/40">
                      Try asking
                    </p>
                    {STARTER_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        disabled={sending}
                        className="w-full rounded-xl border border-gold/20 bg-gold/5 px-3 py-2 text-left text-body-sm text-gold-200 transition-colors hover:border-gold/50 hover:bg-gold/10 disabled:opacity-50"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-body-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'rounded-tr-md bg-gold text-navy-950 shadow-md'
                        : 'rounded-tl-md border border-white/10 bg-white/[0.04] text-white/85'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-4 py-2.5 text-body-sm text-white/60">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                    Discerning…
                  </div>
                </div>
              )}

              {limitReached && (
                <div className="space-y-2 rounded-2xl border border-gold/30 bg-gold/10 p-4">
                  <p className="text-body-sm text-white">
                    Want to continue? Create a free account for personalized prophetic guidance,
                    daily devotionals, prayer support, and full conversation history.
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href="/auth/signup?next=%2Fask-prophet-lorenzo%3Fhandoff%3D1"
                      onClick={() => track('ai_chat_handoff_signup')}
                      className="flex-1 rounded-lg bg-gold px-3 py-2 text-center text-body-sm font-bold text-navy-950 transition-colors hover:bg-gold-300"
                    >
                      Create free account
                    </Link>
                    <button
                      onClick={resetChat}
                      className="rounded-lg border border-white/20 px-3 py-2 text-body-sm text-white/70 hover:bg-white/10"
                    >
                      Restart
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 bg-navy-950 px-3 py-2.5">
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={limitReached ? 'Create an account to keep chatting' : 'Type your message…'}
                  disabled={sending || limitReached}
                  className="flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-body-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:opacity-50"
                  style={{ maxHeight: '120px' }}
                />
                <button
                  type="submit"
                  disabled={sending || limitReached || !input.trim()}
                  aria-label="Send message"
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold text-navy-950 shadow-md transition-all hover:bg-gold-300 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                </button>
              </form>
              <div className="mt-1.5 flex items-center justify-between px-1">
                <p className="text-[10px] text-white/30">
                  AI may make mistakes. For pastoral care, contact info@tpcmin.org.
                </p>
                {remaining !== null && !limitReached && (
                  <p className="text-[10px] font-medium text-gold/70">
                    {remaining} {remaining === 1 ? 'message' : 'messages'} left
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
