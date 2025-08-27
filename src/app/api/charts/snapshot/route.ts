// src/app/api/charts/snapshot/route.ts
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

function getISOWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1))
  const from = new Date(date)
  const to = new Date(date); to.setUTCDate(to.getUTCDate() + 7)
  const oneJan = new Date(Date.UTC(from.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((from as any) - (oneJan as any)) / 86400000 + oneJan.getUTCDay() + 1) / 7)
  const year = from.getUTCFullYear()
  return { from, to, year, week }
}

type Grouped = { trackId: string; _count: { trackId: number } }

export async function POST() {
  try {
    const { from, to, year, week } = getISOWeek()

    const grouped = await prisma.play.groupBy({
      by: ["trackId"],
      where: {
        playedAt: { gte: from, lt: to },
        type: "MUSIC",
        ignored: false,
      },
      _count: { trackId: true },
      orderBy: { _count: { trackId: "desc" } },
      take: 10,
    })

    if (grouped.length === 0) {
      return NextResponse.json({ error: "Няма излъчвания за тази седмица" }, { status: 400 })
    }

    const entries = (grouped as Grouped[]).map((g, i) => ({
      trackId: g.trackId,
      plays: g._count.trackId,
      rank: i + 1,
    }))

    const existing = await prisma.chartWeek.findUnique({
      where: { year_week: { year, week } }, // изисква @@unique([year, week], name: "year_week")
    })

    if (!existing) {
      const chart = await prisma.chartWeek.create({
        data: { year, week, from, to, entries: { create: entries } },
      })
      return NextResponse.json({ chartId: chart.id, created: true })
    }

    const [_, updated] = await prisma.$transaction([
      prisma.chartEntry.deleteMany({ where: { chartId: existing.id } }),
      prisma.chartWeek.update({
        where: { id: existing.id },
        data: { from, to, entries: { create: entries } },
      }),
    ])

    return NextResponse.json({ chartId: updated.id, created: false })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 })
  }
}
