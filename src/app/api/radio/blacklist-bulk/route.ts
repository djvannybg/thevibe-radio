import {prisma} from "@/lib/prisma"
import { NextResponse } from "next/server"

const BRAND = [
  "the vibe", "the vibe radio", "the vibe tv", "the vibe balkan",
  "thevibe", "thevibe.tv"
]

export async function POST() {
  try {
    // Намираме всички тракове, които съдържат бранда (raw или norm)
    const tracks = await prisma.track.findMany({
      where: {
        OR: BRAND.flatMap(k => ([
          { artist:    { contains: k, mode: "insensitive" } },
          { title:     { contains: k, mode: "insensitive" } },
          { artistNorm:{ contains: k, mode: "insensitive" } },
          { titleNorm: { contains: k, mode: "insensitive" } },
        ]))
      },
      select: { id: true }
    })
    const ids = tracks.map(t => t.id)
    if (ids.length === 0) return NextResponse.json({ updated: 0 })

    const r = await prisma.play.updateMany({
      where: { trackId: { in: ids } },
      data:  { type: "AD", ignored: true, ignoreReason: "blacklist:thevibe" }
    })

    return NextResponse.json({ updated: r.count })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Blacklist failed" }, { status: 500 })
  }
}
