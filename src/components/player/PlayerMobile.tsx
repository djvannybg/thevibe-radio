"use client"

import { useEffect, useRef, useState } from "react"

const CANDIDATE_STREAMS = [
  "https://stream.thevibe.tv:8000/live"
]

export default function PlayerMobile({ className = "" }: { className?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [trying, setTrying] = useState(false)
  const [srcIndex, setSrcIndex] = useState(0)
  const [meta, setMeta] = useState<{ artist?: string; title?: string }>({})
  const [lastError, setLastError] = useState<string | null>(null)

  // meta polling
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
    const t = setInterval(load, 10000)
    return () => { stop = true; clearInterval(t) }
  }, [])

  const tryPlay = async (index: number): Promise<boolean> => {
    const el = audioRef.current
    if (!el) return false

    setSrcIndex(index)
    setLastError(null)

    el.pause()
    el.src = CANDIDATE_STREAMS[index]
    el.preload = "none"
    el.crossOrigin = "anonymous"

    let ok = false
    try {
      await el.play()
      ok = true
    } catch (e) {
      setLastError((e as any)?.message || "play() rejected")
    }

    setPlaying(ok)
    return ok
  }

  const toggle = async () => {
    const el = audioRef.current
    if (!el) return

    if (playing) {
      el.pause()
      setPlaying(false)
      return
    }

    setTrying(true)
    for (let i = 0; i < CANDIDATE_STREAMS.length; i++) {
      const ok = await tryPlay(i)
      if (ok) {
        setTrying(false)
        return
      }
    }
    setTrying(false)
    setPlaying(false)
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
          {trying ? "…" : playing ? "Pause" : "Play"}
        </button>
      </div>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          Live stream {trying && "(connecting…)"}
        </div>
        <div className="mt-1 font-semibold leading-tight">{meta.artist || "The Vibe Radio"}</div>
        <div className="text-gray-600">{meta.title || "Live"}</div>
        {lastError && (
          <div className="mt-2 text-xs text-red-600 break-all">
            {lastError}
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        src={CANDIDATE_STREAMS[srcIndex]}
        preload="none"
        crossOrigin="anonymous"
        playsInline // ✔ само като JSX prop
        // controls // ← включи временно за дебъг
      />
    </div>
  )
}
