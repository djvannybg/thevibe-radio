"use client"

import { useEffect, useRef, useState } from "react"

const STREAM_URL = "https://stream.thevibe.tv:8000/live"

export default function PlayerMobile({ className = "" }: { className?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [meta, setMeta] = useState<{ artist?: string; title?: string }>({})

  // meta polling (без да пречи на аудиото)
  useEffect(() => {
    let stop = false
    const load = async () => {
      try {
        const r = await fetch("/api/radio/now", { cache: "no-store" })
        if (!r.ok) return
        const j = await r.json()
        if (!stop) setMeta({ artist: j.artist, title: j.title })
      } catch {}
    }
    load()
    const t = setInterval(load, 10_000)
    return () => { stop = true; clearInterval(t) }
  }, [])

  const toggle = async () => {
    const el = audioRef.current
    if (!el) return
    try {
      if (!playing) {
        // директен play след тап — най-сигурно за мобилно
        await el.play()
        setPlaying(true)
      } else {
        el.pause()
        setPlaying(false)
      }
    } catch (err) {
      console.warn("Play failed:", err)
    }
  }

  return (
    <div className={`rounded-2xl border shadow-sm p-4 bg-white ${className}`}>
      <div
        className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-pink-200 to-indigo-200"
        onClick={toggle}
        role="button"
        aria-label={playing ? "Pause" : "Play"}
      >
        <button
          onClick={toggle}
          className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-black/80 text-white flex items-center justify-center backdrop-blur-sm hover:opacity-90 z-20 pointer-events-auto"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-wide text-gray-500">Live stream</div>
        <div className="mt-1 font-semibold leading-tight">{meta.artist || "The Vibe Radio"}</div>
        <div className="text-gray-600">{meta.title || "Live"}</div>
      </div>

      <audio
        ref={audioRef}
        src={STREAM_URL}
        preload="none"
        crossOrigin="anonymous"
        playsInline
        // controls  // ← включи за бърз дебъг, ако искаш
      />
      <style jsx>{`
        div[role="button"] { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  )
}
