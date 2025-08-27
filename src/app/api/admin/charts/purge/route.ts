import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// ISO year/week (UTC, ISO-8601 – понеделник е 1-вия ден)
function getISOYearWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  // четвъртъкът определя ISO-годината
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const isoYear = date.getUTCFullYear()
  const yearStart = new Date(Date.UTC(isoYear, 0, 1))
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return { year: isoYear, week }
}

export const dynamic = "force-dynamic" // за да не се кешира в dev/prod

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const scope = url.searchParams.get("scope") ?? "current" // "current" | "all"

    if (scope === "all") {
      const r = await prisma.chartWeek.deleteMany({})
      // ChartEntry е с onDelete: Cascade, пада автоматично
      return NextResponse.json({ ok: true, deletedWeeks: r.count })
    }

    // по подразбиране: трием текущата ISO седмица
    const { year, week } = getISOYearWeek()
    const r = await prisma.chartWeek.deleteMany({ where: { year, week } })
    return NextResponse.json({ ok: true, deletedWeeks: r.count, target: { year, week } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Purge failed" }, { status: 500 })
  }
}
