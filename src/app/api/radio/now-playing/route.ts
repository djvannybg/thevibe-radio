import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { artist, title, startedAt, duration, source, meta } = body || {}
    if (!artist?.trim() || !title?.trim()) {
      return NextResponse.json({ error: "artist и title са задължителни" }, { status: 400 })
    }

    // upsert Track
    const track = await prisma.track.upsert({
      where: { artist_title_unique: { artist, title } },
      create: { artist, title, slug: `${artist}-${title}`.toLowerCase().replace(/\s+/g, '-') },
      update: {},
    })

    const playedAt = startedAt ? new Date(startedAt) : new Date()

    await prisma.play.create({
      data: { trackId: track.id, playedAt, source, meta },
    })

    // cache (String id)
    await prisma.nowPlayingCache.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', trackId: track.id, startedAt: playedAt },
      update: { trackId: track.id, startedAt: playedAt },
    })

    if (duration) {
      await prisma.track.update({ where: { id: track.id }, data: { duration } })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 })
  }
}
