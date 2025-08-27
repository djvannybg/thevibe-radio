import { prisma }  from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
    })
    return NextResponse.json(categories)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, slug } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Името е задължително' }, { status: 400 })
    const safeSlug = (slug || name).trim().toLowerCase()
      .replace(/\s+/g, '-').replace(/[^a-z0-9\-а-яёъь]+/gi, '').replace(/-+/g, '-')

    const exists = await prisma.category.findFirst({ where: { slug: safeSlug } })
    if (exists) return NextResponse.json({ error: 'Такъв slug вече съществува' }, { status: 409 })

    const cat = await prisma.category.create({
      data: { name: name.trim(), slug: safeSlug },
      select: { id: true, name: true, slug: true, createdAt: true,
        _count: { select: { posts: true } } },
    })
    return NextResponse.json(cat, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 })
  }
}
