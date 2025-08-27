"use client"

import { useEffect, useRef, useState } from "react"

const STREAM_URL = "https://stream.thevibe.tv:8000/live"
const COL_PINK = "#ec4899"
const COL_FUCHSIA = "#d946ef"
const COL_INDIGO = "#6366f1"

export default function PlayerMobile({ className = "" }: { className?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // WebAudio/RAF
  const rafRef = useRef<number | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const dataRef = useRef<Uint8Array | null>(null)

  const [playing, setPlaying] = useState(false)
  const [visualizerReady, setVisualizerReady] = useState(false) // 👈 ако не успеем -> fallback само аудио
  const [meta, setMeta] = useState<{ artist?: string; title?: string }>({})

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
    const t = setInterval(load, 10_000)
    return () => { stop = true; clearInterval(t) }
  }, [])

  const toggle = async () => {
    const el = audioRef.current
    if (!el) return
    try {
      if (!playing) {
        // 1) Опит за WebAudio/visualizer; ако падне → продължаваме само с аудио
        await tryEnsureAudioGraph()

        // 2) Опит за play() – винаги (дори при fail отгоре)
        await el.play()
        setPlaying(true)

        // 3) Ако имаме готов visualizer → стартирай рисуването
        if (visualizerReady) startVisualizer()
      } else {
        el.pause()
        setPlaying(false)
        stopVisualizer()
      }
    } catch (err) {
      // Ако play() падне (рядко, но при строги политики) – тихо игнорирай
      console.warn("Play failed (fallback to plain audio if possible):", err)
      try {
        // последен опит – без WebAudio, само <audio>
        analyserRef.current?.disconnect()
        sourceRef.current?.disconnect()
        await audioRef.current.play()
        setPlaying(true)
      } catch (e) {
        console.warn("Plain audio play failed:", e)
      }
    }
  }

  async function tryEnsureAudioGraph() {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 1

    if (ctxRef.current) {
      setVisualizerReady(Boolean(analyserRef.current))
      // вече имаме контекст; няма какво повече да правим
      return
    }

    try {
      const Ctx =
        (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext
      const ctx = new Ctx()
      try { await ctx.resume() } catch {}

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8

      // ⚠️ Тук често хвърча грешки при CORS → ловим и правим fallback
      const src = ctx.createMediaElementSource(audio)

      // Връзка: източник → анализатор → destination (иначе няма звук на мобилно)
      src.connect(analyser)
      analyser.connect(ctx.destination)

      ctxRef.current = ctx
      analyserRef.current = analyser
      sourceRef.current = src
      dataRef.current = new Uint8Array(analyser.frequencyBinCount)

      setVisualizerReady(true)
    } catch (e) {
      console.warn("WebAudio/Analyser not available, will use plain audio:", e)
      // Без visualizer, но ще си пуснем чисто аудио
      setVisualizerReady(false)
    }
  }

  function startVisualizer() {
    if (!visualizerReady) return
    const cvs = canvasRef.current
    if (!cvs) return

    const ctx2d = cvs.getContext("2d")
    if (!ctx2d) return

    const dpr = Math.max(1, window.devicePixelRatio || 1)
    const resize = () => {
      const rect = cvs.getBoundingClientRect()
      cvs.width = Math.floor(rect.width * dpr)
      cvs.height = Math.floor(rect.height * dpr)
    }
    resize()

    const draw = () => {
      const w = cvs.width, h = cvs.height
      ctx2d.clearRect(0, 0, w, h)

      const BARS = 36
      const gap = Math.max(2, Math.round(w / 500))
      const avail = w - gap * (BARS - 1)
      const bw = Math.max(2, avail / BARS)

      let values: number[] = []
      if (analyserRef.current && dataRef.current) {
        // ✅ TS-safe view към същия buffer (ArrayBuffer, не ArrayBufferLike)
        const view = new Uint8Array(
          dataRef.current.buffer as ArrayBuffer,
          dataRef.current.byteOffset,
          dataRef.current.byteLength
        )
        analyserRef.current.getByteFrequencyData(view)
        const arr = Array.from(dataRef.current.slice(2, 2 + BARS))
        values = arr.map(v => v / 255)
      }

      const grad = ctx2d.createLinearGradient(0, 0, w, 0)
      grad.addColorStop(0, COL_PINK)
      grad.addColorStop(0.55, COL_FUCHSIA)
      grad.addColorStop(1, COL_INDIGO)
      ctx2d.fillStyle = grad
      ctx2d.shadowColor = "rgba(217, 70, 239, 0.3)"
      ctx2d.shadowBlur = Math.max(6, Math.floor(w / 240))

      values.forEach((val, i) => {
        const x = i * (bw + gap)
        const barH = Math.max(3, val * h)
        const y = h - barH
        const r = Math.min(8, bw / 2, barH / 2)
        roundRect(ctx2d, x, y, bw, barH, r)
        ctx2d.fill()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    cancelAnimationFrame(rafRef.current || 0)
    rafRef.current = requestAnimationFrame(draw)

    const onResize = () => resize()
    window.addEventListener("resize", onResize, { passive: true })

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current || 0)
        rafRef.current = null
      } else if (playing && visualizerReady) {
        cancelAnimationFrame(rafRef.current || 0)
        rafRef.current = requestAnimationFrame(draw)
      }
    }
    document.addEventListener("visibilitychange", onVis)

    ;(startVisualizer as any)._cleanup = () => {
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVis)
    }
  }

  function stopVisualizer() {
    cancelAnimationFrame(rafRef.current || 0)
    rafRef.current = null
    const cvs = canvasRef.current
    if (cvs) {
      const ctx2d = cvs.getContext("2d")
      if (ctx2d) ctx2d.clearRect(0, 0, cvs.width, cvs.height)
    }
    const cleanup = (startVisualizer as any)._cleanup
    if (cleanup) cleanup()
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const radius = Math.min(r, w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + w, y, x + w, y + h, radius)
    ctx.arcTo(x + w, y + h, x, y + h, radius)
    ctx.arcTo(x, y + h, x, y, radius)
    ctx.arcTo(x, y, x + w, y, radius)
    ctx.closePath()
  }

  // cleanup
  useEffect(() => {
    return () => {
      stopVisualizer()
      try {
        analyserRef.current?.disconnect()
        sourceRef.current?.disconnect()
        ctxRef.current?.close()
      } catch {}
      analyserRef.current = null
      sourceRef.current = null
      ctxRef.current = null
    }
  }, [])

  return (
    <div className={`rounded-2xl border shadow-sm p-4 bg-white ${className}`}>
      <div
        className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-pink-200 to-indigo-200"
        onClick={toggle}
        role="button"
        aria-label={playing ? "Pause" : "Play"}
      >
        {/* показваме canvas само ако visualizer е готов */}
        {visualizerReady && (
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        )}

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
        // controls   // 👈 включи за тест, ако искаш
      />
      <style jsx>{`
        div[role="button"] { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  )
}
