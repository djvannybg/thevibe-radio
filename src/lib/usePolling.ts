"use client"
import { useEffect, useRef, useState } from "react"

export function usePolling<T>(fn: () => Promise<T>, intervalMs = 10000) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<NodeJS.Timeout | null>(null)

  async function tick() {
    try {
      const d = await fn()
      setData(d)
      setError(null)
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    tick()
    timer.current = setInterval(tick, intervalMs)
    return () => { if (timer.current) clearInterval(timer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs])

  return { data, loading, error, refresh: tick }
}
