"use client"

import { useEffect, useRef, useState } from "react"

const STREAM_URL = "https://radio.thevibe.tv/stream" // ← сложи тук твоят работещ HTTPS линк на 443

export default function PlayerMobile({ className = "" }: { className?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [meta, setMeta] = useState<{ artist?: string; title?: string }>({})
  const [errMsg, setErrMsg] = useState<string | null>(null)

  // само мета (не влияе на аудиото)
  useEffect(() => {
    let stop = false
    const tick = async () => {
      try {
        const r = await fetch("/api/radio/now", { cache: "no-store" })
        if (!r.ok) return
        const j = await r.json()
        if (!stop) setMeta({ artist: j.artist, title: j.title })
      } catch {}
    }
    tick()
    const t = setInterval(tick, 10000)
    return () => { stop = true; clearInterval(t) }
  }, [])

  const toggle = async () => {
    const el = audioRef.current
    if (!el) return

    if (playing) {
      el.pause()
      setPlaying(false)
      return
    }

    setConnecting(true)
    setErrMsg(null)

    // чист старт
    try { el.load() } catch {}

    try {
      await el.play() // play след тап (user gesture)
      setPlaying(true)
    } catch (e: any) {
      setErrMsg(e?.message || "Cannot start playback")
      setPlaying(false)
    } finally {
      setConnecting(false)
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
        >
          {connecting ? "…" : playing ? "Pause" : "Play"}
        </button>
      </div>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          Live stream {connecting && "(connecting…)"}
        </div>
        <div className="mt-1 font-semibold leading-tight">{meta.artist || "The Vibe Radio"}</div>
        <div className="text-gray-600">{meta.title || "Live"}</div>
        {errMsg && <div className="mt-2 text-xs text-red-600 break-all">{errMsg}</div>}
      </div>

      <audio
        ref={audioRef}
        src={STREAM_URL}
        preload="none"
        // ако стриймът е на същия домейн/поддомейн и не ползваш CORS — може да махнеш следния ред
        crossOrigin="anonymous"
        playsInline
        // controls // ← включи за бърз тест, после го махни
      />
    </div>
  )
}
