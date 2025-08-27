import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { normalizeArtist, normalizeTitle, hasRemixLikeTag } from "@/lib/normalize"

function getISOWeekRange(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1))
  const from = new Date(date)
  const to = new Date(date); to.setUTCDate(to.getUTCDate() + 7)
  return { from, to }
}

const BRAND = [
  "the vibe", "the vibe radio", "the vibe tv", "the vibe balkan",
  "thevibe", "thevibe.tv",
]

type Grouped = { trackId: string; _count: { trackId: number } }

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 50)
    const { from, to } = getISOWeekRange()

    // 1) извади всички тракове от blacklist (без mode:)
    const blacklistTracks = await prisma.track.findMany({
      where: {
        OR: BRAND.flatMap(k => ([
          { artist:     { contains: k } },
          { title:      { contains: k } },
          { artistNorm: { contains: k } },
          { titleNorm:  { contains: k } },
        ])),
      },
      select: { id: true },
    })
    const blacklistIds = blacklistTracks.map(t => t.id)

    // 2) групирай play-овете, изключвайки blacklist по trackId
    const grouped = await prisma.play.groupBy({
      by: ["trackId"],
      where: {
        playedAt: { gte: from, lt: to },
        type: "MUSIC",
        ignored: false,
        ...(blacklistIds.length ? { NOT: { trackId: { in: blacklistIds } } } : {}),
      },
      _count: { trackId: true },
      orderBy: { _count: { trackId: "desc" } },
      take: limit,
    })

    // 3) вземи данните за траковете и оформи отговора
    const ids = grouped.map(g => g.trackId)
    const tracks = await prisma.track.findMany({
      where: { id: { in: ids } },
      select: {
        id: true, slug: true, image: true,
        artist: true, title: true,
        artistNorm: true, titleNorm: true,
      },
    })
    const map = new Map(tracks.map(t => [t.id, t]))

    const items = (grouped as Grouped[]).map((g, i) => {
      const t = map.get(g.trackId)!
      const artist = t.artistNorm ?? normalizeArtist(t.artist)
      const baseTitle = t.titleNorm ?? normalizeTitle(t.title)
      const title = `${baseTitle}${hasRemixLikeTag(t.title) ? " (Remix)" : ""}`
      return {
        rank: i + 1,
        plays: g._count.trackId,
        track: { slug: t.slug, image: t.image, artist, title },
      }
    })

    return NextResponse.json({ from, to, items })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 })
  }
}
