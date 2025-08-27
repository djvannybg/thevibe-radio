export function apiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") || ""
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

export async function getJSON<T>(input: string, init?: RequestInit): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(apiUrl(input), { cache: "no-store", ...init })
    const data = await res.json()
    return { ok: res.ok, data, error: res.ok ? undefined : (data?.error || "Request failed") }
  } catch (e: any) {
    return { ok: false, error: e?.message || "Network error" }
  }
}
