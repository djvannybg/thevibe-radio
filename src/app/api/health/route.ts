import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // лека заявка към DB
    await prisma.$queryRaw`SELECT 1`
    const users = await prisma.user.count()
    return NextResponse.json({ ok: true, users }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 })
  }
}
