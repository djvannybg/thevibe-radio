"use client"
import { usePolling } from "@/lib/usePolling"
import { apiUrl } from "@/lib/http"

type NowPayload = {
  station: string
  artist: string
  title: string
  displayArtist?: string
  displayTitle?: string
  fetchedAt: string
  type?: "MUSIC"|"JINGLE"|"AD"|"ID"|"OTHER"
}

export default function NowPlayingCard({ className = "" }: { className?: string }) {
  const { data, loading, error } = usePolling<NowPayload>(async () => {
    const res = await fetch(apiUrl("/api/radio/now"), { cache: "no-store" })
    if (!res.ok) throw new Error("Failed now")
    return res.json()
  }, 10000)

  const artist = data?.displayArtist || data?.artist
  const title  = data?.displayTitle  || data?.title

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${className}`}>
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Now Playing</div>

      {loading ? (
        <div className="animate-pulse">
          <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-56 bg-gray-100 rounded" />
        </div>
      ) : error ? (
        <div className="text-sm text-red-600">Грешка: {error}</div>
      ) : (
        <div>
          <div className="text-lg font-medium">{artist}</div>
          <div className="text-base text-gray-700">{title}</div>
          <div className="mt-2 text-xs text-gray-400">обновено: {new Date(data!.fetchedAt).toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  )
}
