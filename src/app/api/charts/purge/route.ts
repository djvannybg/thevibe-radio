import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// ISO седмица (UTC, понеделник)
function getISOWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1))
  const from = new Date(date)
  const to = new Date(date); to.setUTCDate(to.getUTCDate() + 7)
  const oneJan = new Date(Date.UTC(from.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((from as any) - (oneJan as any)) / 86400000 + oneJan.getUTCDay() + 1) / 7)
  const year = from.getUTCFullYear()
  return { year, week }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const scope = url.searchParams.get("scope") // "current" | "all"
    if (scope === "all") {
      const r = await prisma.chartWeek.deleteMany({})
      // ChartEntry е с onDelete: Cascade -> пада автоматично
      return NextResponse.json({ deletedWeeks: r.count })
    }

    // по подразбиране -> трием текущата седмица
    const { year, week } = getISOWeek()
    await prisma.chartWeek.delete({
      where: { year_week: { year, week } }, // @@unique([year, week], name: "year_week")
    }).catch(() => null) // ако я няма – ок
    return NextResponse.json({ deleted: { year, week } })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 })
  }
}
