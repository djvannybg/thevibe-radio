// app/api/admin/categories/[id]/route.ts
import prisma from "@/lib/prisma"; // ако в твоя lib е default export; ако е named, върни { prisma }
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }   // 👈 params е Promise
) {
  try {
    const { id } = await params;                     // 👈 await-вай params

    const withPosts = await prisma.post.count({ where: { categoryId: id } });
    if (withPosts > 0) {
      return NextResponse.json(
        { error: "Има публикации – първо ги премести/изтрий" },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
