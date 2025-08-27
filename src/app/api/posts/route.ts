import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(24, Math.max(1, parseInt(searchParams.get("limit") || "9", 10)))
    const category = searchParams.get("category") // slug
    const skip = (page - 1) * limit

    const where = {
      status: "PUBLISHED" as const,
      ...(category
        ? { category: { slug: category } }
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true, title: true, slug: true, seoDesc: true, image: true, createdAt: true,
          author: { select: { id: true, email: true } },
          category: { select: { name: true, slug: true } },
        }
      }),
      prisma.post.count({ where })
    ])

    return NextResponse.json({ items, total, page, limit })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
