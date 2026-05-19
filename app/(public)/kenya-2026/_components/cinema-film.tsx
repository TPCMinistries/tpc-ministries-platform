'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Film } from 'lucide-react'
import { Section } from '@/components/ui/section'

export function KenyaCinemaFilm() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [started, setStarted] = useState(false)

  function play() {
    const v = videoRef.current
    if (!v) return
    v.muted = false
    setMuted(false)
    v.play()
      .then(() => {
        setPlaying(true)
        setStarted(true)
      })
      .catch(() => {
        v.muted = true
        setMuted(true)
        v.play().then(() => {
          setPlaying(true)
          setStarted(true)
        })
      })
  }

  function toggle() {
    const v = videoRef.current
    if (!v) return
    if (!started) return play()
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  return (
    <Section size="lg" className="bg-gradient-to-b from-navy-900 via-navy-950 to-black">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gold">
          <Film className="h-3 w-3" />
          The full piece
        </div>
        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          Sit with it — six minutes.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          The full Kenya 2026 cut. Best with headphones on.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="group relative mx-auto aspect-video w-full max-w-5xl overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 sm:rounded-3xl"
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src="/videos/kenya/cinema.mp4"
          poster="/videos/kenya/posters/cinema.jpg"
          playsInline
          preload="metadata"
          onClick={toggle}
          onEnded={() => setPlaying(false)}
        />

        {/* First-play overlay */}
        {!started && (
          <button
            onClick={play}
            aria-label="Play film"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-black/30 via-black/40 to-black/60 transition hover:from-black/40 hover:to-black/70"
          >
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gold text-navy-950 shadow-2xl ring-8 ring-gold/30 transition-transform group-hover:scale-105">
              <Play className="h-8 w-8 translate-x-0.5" />
            </div>
            <div className="font-medium text-white">Play the full film</div>
            <div className="text-xs uppercase tracking-[0.18em] text-white/60">5:47 · with sound</div>
          </button>
        )}

        {/* Controls */}
        {started && (
          <>
            <button
              onClick={toggle}
              aria-label={playing ? 'Pause' : 'Play'}
              className="absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/70 group-hover:opacity-100"
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
            </button>
            <button
              onClick={() => {
                const v = videoRef.current
                if (!v) return
                v.muted = !v.muted
                setMuted(v.muted)
              }}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/70 group-hover:opacity-100"
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </>
        )}
      </motion.div>
    </Section>
  )
}
