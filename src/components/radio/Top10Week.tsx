import { apiUrl } from "@/lib/http"

type Item = { rank: number; plays: number; track: { artist: string; title: string; slug?: string; image?: string | null } }
type Payload = { from?: string; to?: string; items?: Item[]; error?: string }

export default async function Top10Week({ limit = 10, className = "" }: { limit?: number; className?: string }) {
  let data: Payload | null = null
  let ok = false
  try {
    const res = await fetch(apiUrl(`/api/charts/top?limit=${limit}`), { cache: "no-store" })
    ok = res.ok
    data = await res.json()
  } catch {
    ok = false
    data = { error: "Network error" }
  }

  const items = Array.isArray(data?.items) ? data!.items : []
  const from = data?.from ? new Date(data.from) : null
  const to   = data?.to   ? new Date(data.to)   : null

  return (
    <div className={`rounded-2xl border p-4 shadow-sm  ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-wide text-gray-500">Top 10 · This Week</div>
        {from && to && (
          <div className="text-xs text-gray-500">{from.toLocaleDateString()} – {to.toLocaleDateString()}</div>
        )}
      </div>

      {!ok && <div className="text-sm text-red-600 mb-2">{data?.error ?? "Грешка при зареждане."}</div>}

      {items.length === 0 ? (
        <div className="text-sm text-gray-500">Все още няма данни за тази седмица.</div>
      ) : (
        <ol className="space-y-1">
          {items.map((it) => (
              <li
                key={it.rank}
                className="flex items-center justify-between rounded border p-2"
              >
                <div className="min-w-0 flex-1">
                  <span className="w-6 inline-block text-right mr-2">{it.rank}.</span>
                  <span className="whitespace-normal break-words">
                    {it.track.artist} — <b>{it.track.title}</b>
                  </span>
                </div>
                <div className="text-xs text-gray-500 ml-2 shrink-0">
                  {it.plays} plays
                </div>
              </li>
            ))}
        </ol>
      )}
    </div>
  )
}
