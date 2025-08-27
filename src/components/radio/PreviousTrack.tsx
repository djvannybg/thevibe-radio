import { apiUrl } from "@/lib/http"

type PrevPayload = {
  previous: null | { playedAt: string; artist: string; title: string; slug?: string }
  error?: string
}

export default async function PreviousTrack({ className = "" }: { className?: string }) {
  const res = await fetch(apiUrl("/api/radio/previous"), { cache: "no-store" })
  const data = (await res.json()) as PrevPayload

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${className}`}>
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Previous</div>
      {data.previous ? (
        <div>
          <div className="font-medium">{data.previous.artist}</div>
          <div className="text-gray-700">{data.previous.title}</div>
          <div className="mt-2 text-xs text-gray-400">
            {new Date(data.previous.playedAt).toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Няма предишна песен.</div>
      )}
    </div>
  )
}
