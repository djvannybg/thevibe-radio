import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { normalizeArtist, normalizeTitle } from "@/lib/normalize"

export async function GET() {
  try {
    const plays = await prisma.play.findMany({
      where: { type: "MUSIC", ignored: false },
      orderBy: { playedAt: "desc" },
      take: 2,
      include: { track: { select: { slug: true, artist: true, title: true, artistNorm: true, titleNorm: true } } },
    })
    const prev = plays.length >= 2 ? plays[1] : plays[0] || null
    if (!prev) return NextResponse.json({ previous: null })

    const t = prev.track
    const artist = t.artistNorm ?? normalizeArtist(t.artist)
    const title  = t.titleNorm  ?? normalizeTitle(t.title)

    return NextResponse.json({ previous: { playedAt: prev.playedAt, artist, title, slug: t.slug } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 })
  }
}
