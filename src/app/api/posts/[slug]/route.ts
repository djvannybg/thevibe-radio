import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = { slug: string }

export async function GET(
  req: Request,
  context: { params: Promise<Params> }
) {
  try {
    const { slug } = await context.params // <-- await задължително

    const post = await prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        seoTitle: true,
        seoDesc: true,
        image: true,
        createdAt: true,
        author: { select: { id: true, email: true } }
      }
    })

    if (!post || !post.title) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
