// src/app/api/admin/posts/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
// ✅ правилно
import { authOptions } from "@/lib/authOptions"

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, email: true } } }
  })
  return NextResponse.json(posts)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { title, slug, content, seoTitle, seoDesc, image, status } = body

  // Мини валидация
  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
  }

  const authorId = (session.user as any).id as string

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      seoTitle,
      seoDesc,
      image,
      status,           // "DRAFT" | "PUBLISHED"
      authorId
    }
  })

  return NextResponse.json(post)
}
