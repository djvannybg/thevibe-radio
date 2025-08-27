"use client"
import { useState } from "react"
import { apiUrl } from "@/lib/http"

export default function ChartActions({ className = "" }: { className?: string }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function call(method: "DELETE" | "POST") {
    setBusy(true); setMsg(null)
    try {
      const endpoint = method === "DELETE" ? "/api/admin/charts/purge" : "/api/charts/snapshot"
      const res = await fetch(apiUrl(endpoint), { method, cache: "no-store" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Operation failed")
      setMsg(method === "DELETE" ? "Класацията е изчистена." : "Класацията е генерирана.")
    } catch (e:any) {
      setMsg(e.message || "Грешка.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`rounded-2xl w-full  border p-4 shadow-sm ${className}`}>
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-3">Charts · Admin</div>
      <div className="flex gap-2">
        <button
          onClick={() => call("DELETE")}
          className="px-3 py-2 rounded border hover:bg-gray-50 disabled:opacity-50"
          disabled={busy}
        >
          Purge (текущата седмица)
        </button>
        <button
          onClick={() => call("POST")}
          className="px-3 py-2 rounded bg-black text-white hover:opacity-90 disabled:opacity-50"
          disabled={busy}
        >
          Snapshot (генерирай)
        </button>
      </div>
      {msg && <div className="mt-2 text-sm text-gray-600">{msg}</div>}
    </div>
  )
}
