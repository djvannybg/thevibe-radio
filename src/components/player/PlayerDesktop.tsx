"use client"

import { useEffect, useRef, useState } from "react"

const STREAM_URL = "https://stream.thevibe.tv:8000/live"
const COL_PINK = "#ec4899"
const COL_FUCHSIA = "#d946ef"
const COL_INDIGO = "#6366f1"

export default function PlayerDesktop({ className = "" }: { className?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // RAF + WebAudio refs
  const rafRef = useRef<number | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const dataRef = useRef<Float32Array<ArrayBuffer> | null>(null)

  const [playing, setPlaying] = useState(false)
  const [meta, setMeta] = useState<{ artist?: string; title?: string }>({})
  const [volume, setVolume] = useState(0.8) // 0..1

  // --- metadata polling ---
  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/radio/now", { cache: "no-store" })
        const j = await r.json()
        setMeta({ artist: j.artist, title: j.title })
      } catch {}
    }
    load()
    const t = setInterval(load, 10_000)
    return () => clearInterval(t)
  }, [])

  // --- volume: init + persist (gain node, не element.volume) ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vibe_volume")
      if (saved) {
        const v = Math.max(0, Math.min(1, parseFloat(saved)))
        if (isFinite(v)) setVolume(v)
      }
    } catch {}
  }, [])
  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume
    try { localStorage.setItem("vibe_volume", volume.toFixed(3)) } catch {}
  }, [volume])

  // --- toggle playback ---
  const toggle = async () => {
    const el = audioRef.current
    if (!el) return
    try {
      if (!playing) {
        await ensureAudioGraph()   // iOS/Safari: user gesture present
        el.currentTime = el.currentTime || 0
        await el.play()
        setPlaying(true)
        startVisualizer()
      } else {
        el.pause()
        setPlaying(false)
        stopVisualizer()
      }
    } catch (err) {
      console.warn("Play failed:", err)
    }
  }

  // --- build (or reuse) audio graph ---
  async function ensureAudioGraph() {
    const audio = audioRef.current
    if (!audio) return
    // Контролираме сила чрез GainNode, не чрез element.volume
    audio.volume = 1

    if (!ctxRef.current) {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext
      const ctx = new Ctx()
      try { await ctx.resume() } catch {}

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.85
      analyser.minDecibels = -90
      analyser.maxDecibels = -10

      const gain = ctx.createGain()
      gain.gain.value = volume

      const src = ctx.createMediaElementSource(audio)

      // src -> gain -> analyser -> destination
      src.connect(gain)
      gain.connect(analyser)
      analyser.connect(ctx.destination)

      ctxRef.current = ctx
      analyserRef.current = analyser
      sourceRef.current = src
      gainRef.current = gain
      const buf = new ArrayBuffer(analyser.frequencyBinCount * 4)    // 4 байта за float32
       dataRef.current = new Float32Array(buf)                        // => Float32Array<ArrayBuffer>

      // ⚠️ НЯМА visibilitychange listener → звукът не спира при скрит таб
    }
  }

  // --- visualizer (canvas) ---
  function startVisualizer() {
    const cvs = canvasRef.current
    if (!cvs) return
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    const resize = () => {
      const rect = cvs.getBoundingClientRect()
      cvs.width = Math.floor(rect.width * dpr)
      cvs.height = Math.floor(rect.height * dpr)
    }
    resize()

    const draw = () => {
      const ctx2d = cvs.getContext("2d")
      if (!ctx2d) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }
      const w = cvs.width, h = cvs.height
      ctx2d.clearRect(0, 0, w, h)

      const BARS = 48
      const gap = Math.max(2, Math.round(w / 600))
      const avail = w - gap * (BARS - 1)
      const bw = Math.max(2, avail / BARS)

      let values: number[] = []
      if (analyserRef.current && dataRef.current) {
        // ✅ Float32 данни (dB) → нормализация 0..1
        analyserRef.current.getFloatFrequencyData(dataRef.current)
        const arr = Array.from(dataRef.current.slice(2, 2 + BARS))
        const min = analyserRef.current.minDecibels
        const max = analyserRef.current.maxDecibels
        const span = max - min
        values = arr.map((db) => {
          const clamped = Math.max(min, Math.min(max, db))
          return (clamped - min) / span
        })
      } else {
        // fallback
        const t = performance.now() / 900
        values = Array.from({ length: BARS }, (_, i) => {
          const base = 0.35 + 0.65 * Math.abs(Math.sin(t + i * 0.35))
          const jitter = 0.08 * Math.random()
          return Math.min(1, base - i * 0.006 + jitter)
        })
      }

      const grad = ctx2d.createLinearGradient(0, 0, w, 0)
      grad.addColorStop(0, COL_PINK)
      grad.addColorStop(0.55, COL_FUCHSIA)
      grad.addColorStop(1, COL_INDIGO)
      ctx2d.fillStyle = grad
      ctx2d.shadowColor = "rgba(217, 70, 239, 0.35)"
      ctx2d.shadowBlur = Math.max(8, Math.floor(w / 200))
      ctx2d.shadowOffsetX = 0
      ctx2d.shadowOffsetY = 0

      values.forEach((val, i) => {
        const x = i * (bw + gap)
        const barH = Math.max(4, val * h)
        const y = h - barH
        const r = Math.min(10, bw / 2, barH / 2)
        roundRect(ctx2d, x, y, bw, barH, r)
        ctx2d.fill()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    cancelAnimationFrame(rafRef.current || 0)
    rafRef.current = requestAnimationFrame(draw)
    const onResize = () => resize()
    window.addEventListener("resize", onResize, { passive: true })
    ;(startVisualizer as any)._onResize = onResize
  }

  function stopVisualizer() {
    cancelAnimationFrame(rafRef.current || 0)
    rafRef.current = null
    const cvs = canvasRef.current
    if (cvs) {
      const ctx2d = cvs.getContext("2d")
      if (ctx2d) ctx2d.clearRect(0, 0, cvs.width, cvs.height)
    }
    const onResize = (startVisualizer as any)._onResize
    if (onResize) window.removeEventListener("resize", onResize)
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
        gainRef.current?.disconnect()
        sourceRef.current?.disconnect()
        ctxRef.current?.close()
      } catch {}
      analyserRef.current = null
      sourceRef.current = null
      gainRef.current = null
      ctxRef.current = null
    }
  }, [])

  return (
    <div className={`rounded-2xl border shadow-sm p-4 bg-white ${className}`}>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-pink-200 to-indigo-200">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <button
          onClick={toggle}
          className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-black/80 text-white flex items-center justify-center backdrop-blur-sm hover:opacity-90 z-10"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-wide text-gray-500">Live stream</div>
        <div className="mt-1 font-semibold leading-tight">{meta.artist || "The Vibe Radio"}</div>
        <div className="text-gray-600">{meta.title || "Live"}</div>

        {/* Volume – desktop only (една лента, без „втора линия“) */}
        <div className="mt-3">
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="vibe-volume w-full"
            style={{ ['--val' as any]: `${Math.round(volume * 100)}%` }}
            aria-label="Volume"
          />
          <style jsx>{`
            .vibe-volume {
              -webkit-appearance: none;
              appearance: none;
              height: 8px;
              border-radius: 9999px;
              background:
                linear-gradient(90deg, ${COL_PINK}, ${COL_FUCHSIA}, ${COL_INDIGO}) no-repeat,
                #e5e7eb;
              background-size: var(--val) 100%;
              outline: none;
            }
            .vibe-volume:focus { box-shadow: 0 0 0 3px rgba(99,102,241,.25); }

            /* WebKit (Chrome/Safari/Edge) */
            .vibe-volume::-webkit-slider-thumb {
              -webkit-appearance: none;
              height: 18px;
              width: 18px;
              border-radius: 9999px;
              background: #000;
              border: 2px solid #fff;
              box-shadow: 0 1px 2px rgba(0,0,0,.25);
              margin-top: -5px; /* центрира върху 8px трак */
              cursor: pointer;
            }
            .vibe-volume::-webkit-slider-runnable-track {
              -webkit-appearance: none;
              background: transparent;
              height: 8px;
              border-radius: 9999px;
            }

            /* Firefox */
            .vibe-volume::-moz-range-thumb {
              height: 18px;
              width: 18px;
              border-radius: 9999px;
              background: #000;
              border: 2px solid #fff;
              box-shadow: 0 1px 2px rgba(0,0,0,.25);
              cursor: pointer;
            }
            .vibe-volume::-moz-range-track {
              height: 8px;
              border-radius: 9999px;
              background: #e5e7eb;
            }
            .vibe-volume::-moz-range-progress {
              height: 8px;
              border-radius: 9999px;
              background: linear-gradient(90deg, ${COL_PINK}, ${COL_FUCHSIA}, ${COL_INDIGO});
            }
          `}</style>
        </div>
      </div>

      <audio ref={audioRef} src={STREAM_URL} preload="none" crossOrigin="anonymous" playsInline />
    </div>
  )
}
