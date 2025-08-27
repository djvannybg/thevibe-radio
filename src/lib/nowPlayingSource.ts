export const SOURCE = "https://stream.thevibe.tv/api/nowplaying_static/the_vibe_balkan.txt"

export type NowParsed = {
  artist?: string
  title?: string
  listeners?: number
  raw: string
}

export function parseNowPlayingText(txt: string): NowParsed {
  const res: any = { raw: txt.trim() }
  const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    const m = line.match(/^(\w+)\s*=\s*(.+)$/i)
    if (m) {
      const key = m[1].toLowerCase(), val = m[2].trim()
      if (key === "artist") res.artist = val
      if (key === "title") res.title = val
      if (key === "song" && !res.artist && !res.title) {
        const [a, t] = val.split(" - "); if (a && t) { res.artist = a.trim(); res.title = t.trim() }
      }
      if (key === "listeners") res.listeners = Number(val.replace(/\D+/g, ""))
    }
  }
  if (!res.artist && !res.title) {
    const candidate = lines.find(l => / - /.test(l)) || txt
    const [a, t] = candidate.split(" - "); if (a && t) { res.artist = a.trim(); res.title = t.trim() }
  }
  return res as NowParsed
}

export async function fetchNowPlaying() {
  const r = await fetch(SOURCE, { cache: "no-store" })
  if (!r.ok) throw new Error(`Upstream ${r.status}`)
  const txt = await r.text()
  return parseNowPlayingText(txt)
}
