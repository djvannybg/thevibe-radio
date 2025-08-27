import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
// ✅ правилно
import { authOptions } from "@/lib/authOptions"

// GET един пост с категория и автор
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }   // 👈 params е Promise
) {
  const { id } = await params                       // 👈 await

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  })

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(post)
}

// PUT — редакция
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }   // 👈
) {
  const { id } = await params                       // 👈

  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Ако искаш само админ:
  // if ((session.user as any).role !== "admin") {
  //   return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  // }

  const { title, slug, content, seoTitle, seoDesc, image, status, categoryId } =
    await req.json()

  if (!title || !content || !categoryId) {
    return NextResponse.json(
      { error: "Title, content and categoryId are required" },
      { status: 400 }
    )
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      title,
      slug,
      content,
      seoTitle,
      seoDesc,
      image,
      status,
      categoryId,
    },
    include: {
      category: true,
    },
  })

  return NextResponse.json(updated)
}

// DELETE
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }   // 👈
) {
  const { id } = await params                       // 👈

  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.post.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
