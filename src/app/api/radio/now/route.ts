// src/app/api/radio/now/route.ts
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { fetchNowPlaying } from "@/lib/nowPlayingSource"
import { PlayType } from "@prisma/client"
import {
  normalizeArtist,
  normalizeTitle,
  detectPlayType,
  type PlayKind,          // ✅ нужен за PT_MAP
} from "@/lib/normalize"
import { slugify } from "@/lib/slugify"

const CACHE_ID = "singleton" // ако е Int -> 1
const DEDUP_MINUTES = Number(process.env.DEDUP_MINUTES ?? 10)

// map от нашия PlayKind към Prisma enum
const PT_MAP: Record<PlayKind, PlayType> = {
  MUSIC: "MUSIC",
  JINGLE: "JINGLE",
  AD: "AD",
  ID: "ID",
  OTHER: "OTHER",
}

function baseSlug(artistNorm: string, titleNorm: string) {
  return slugify(`${artistNorm}-${titleNorm}`)
}

async function generateUniqueSlug(base: string) {
  const exists = await prisma.track.findUnique({ where: { slug: base }, select: { id: true } })
  if (!exists) return base
  for (let i = 2; i <= 50; i++) {
    const candidate = `${base}-${i}`
    const taken = await prisma.track.findUnique({ where: { slug: candidate }, select: { id: true } })
    if (!taken) return candidate
  }
  throw new Error("Cannot generate unique slug for track")
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const dry = url.searchParams.get("dry") === "1"

    const parsed = await fetchNowPlaying()
    const artistRaw = (parsed.artist || "").trim()
    const titleRaw  = (parsed.title  || "").trim()
    if (!artistRaw || !titleRaw) {
      return NextResponse.json({ error: "No artist/title", raw: parsed.raw }, { status: 200 })
    }

    // вътрешно: нормализация за дедуп/идентификация
    const artistNorm = normalizeArtist(artistRaw)
    const titleNorm  = normalizeTitle(titleRaw)
    const type: PlayType = PT_MAP[detectPlayType(artistNorm, titleNorm)]

    // 1) намери по нормализирани или по сурови
    let track = await prisma.track.findFirst({
      where: {
        OR: [
          { artistNorm: artistNorm, titleNorm: titleNorm },
          { artist: artistRaw, title: titleRaw },
        ],
      },
      select: { id: true, artistNorm: true, titleNorm: true, slug: true },
    })

    // 2) ако няма – създай с уникален slug
    if (!track) {
      const uniqueSlug = await generateUniqueSlug(baseSlug(artistNorm, titleNorm))
      track = await prisma.track.create({
        data: { artist: artistRaw, title: titleRaw, artistNorm, titleNorm, slug: uniqueSlug },
        select: { id: true, artistNorm: true, titleNorm: true, slug: true },
      })
    } else if (!track.artistNorm || !track.titleNorm) {
      // backfill на norm полетата
      track = await prisma.track.update({
        where: { id: track.id },
        data: { artistNorm, titleNorm },
        select: { id: true, artistNorm: true, titleNorm: true, slug: true },
      })
    }

    // 3) дедуп прозорец X минути за същия trackId
    const since = new Date(Date.now() - DEDUP_MINUTES * 60_000)
    const lastSame = await prisma.play.findFirst({
      where: { trackId: track.id, playedAt: { gte: since } },
      orderBy: { playedAt: "desc" },
      select: { id: true },
    })
    const isDup = !!lastSame

    let stored = false
    let ignoreReason: string | null = null

    if (!dry) {
      const ignored = isDup || (type !== "MUSIC")
      if (isDup) ignoreReason = `dedup:${DEDUP_MINUTES}m`
      else if (type !== "MUSIC") ignoreReason = `type:${type}`

      await prisma.play.create({
        data: {
          trackId: track.id,
          playedAt: new Date(),
          source: "stream.thevibe.tv",
          type,
          ignored,
          ignoreReason,
        },
      })
      stored = !ignored

      await prisma.nowPlayingCache.upsert({
        where: { id: CACHE_ID },
        create: { id: CACHE_ID, trackId: track.id, startedAt: new Date() },
        update: { trackId: track.id, startedAt: new Date() },
      })
    }

    // показваме RAW, както поиска
    return NextResponse.json({
      station: "the_vibe_balkan",
      artist: artistRaw,
      title : titleRaw,
      artistNorm, titleNorm,
      displayArtist: artistRaw,
      displayTitle : titleRaw,
      type,
      stored,
      ignoreReason,
      dedupWindowMinutes: DEDUP_MINUTES,
      fetchedAt: new Date().toISOString(),
    }, { headers: { "Cache-Control": "s-maxage=5, stale-while-revalidate=30" } })
  } catch (e: any) {
    if (e?.code === "P2002" && e?.meta?.target?.includes("Track_slug_key")) {
      try {
        const parsed = await fetchNowPlaying()
        const a = normalizeArtist((parsed.artist || "").trim())
        const t = normalizeTitle((parsed.title  || "").trim())
        const uniqueSlug = await generateUniqueSlug(baseSlug(a, t))
        await prisma.track.create({
          data: { artist: (parsed.artist||"").trim(), title: (parsed.title||"").trim(), artistNorm: a, titleNorm: t, slug: uniqueSlug },
        })
        return NextResponse.json({ ok: true, note: "Recovered from slug collision" })
      } catch {}
    }
    return NextResponse.json({ error: e?.message ?? "Fetch/parsing failed" }, { status: 500 })
  }
}
