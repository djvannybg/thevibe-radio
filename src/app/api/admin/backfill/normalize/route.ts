import  {prisma} from "@/lib/prisma"
import { NextResponse } from "next/server"
import { normalizeArtist, normalizeTitle } from "@/lib/normalize"

async function runBackfill() {
  const BATCH = 500
  let updated = 0

  for (;;) {
    const rows = await prisma.track.findMany({
      where: { OR: [{ artistNorm: null }, { titleNorm: null }] },
      select: { id: true, artist: true, title: true },
      take: BATCH,
    })
    if (rows.length === 0) break

    await Promise.all(rows.map(t =>
      prisma.track.update({
        where: { id: t.id },
        data: {
          artistNorm: normalizeArtist(t.artist),
          titleNorm:  normalizeTitle(t.title),
        },
      })
    ))
    updated += rows.length
  }
  return updated
}

export async function POST() {
  try {
    const updated = await runBackfill()
    return NextResponse.json({ updated })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? "Backfill failed" }, { status: 500 })
  }
}

// за удобство: позволи и GET
export async function GET() {
  return POST()
}
