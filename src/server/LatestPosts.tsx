import prisma from "@/lib/prisma"
import Link from "next/link"
import PostsSlider, { PostItem } from "../components/blog/PostsSlider"

type Props = { limit?: number; className?: string }

function excerpt(s: string | null | undefined, n = 140) {
  if (!s) return ""
  const clean = s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
  return clean.length > n ? clean.slice(0, n).trimEnd() + "…" : clean
}

const fmtBG = new Intl.DateTimeFormat("bg-BG", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Europe/Sofia",
})

export default async function LatestPosts({ limit = 6, className = "" }: Props) {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { email: true } },
    },
  })

  const items: PostItem[] = posts.map((p) => {
    const iso = p.createdAt.toISOString()
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      image: p.image ?? null,
      createdAtISO: iso,
      createdAtText: fmtBG.format(new Date(iso)), // <-- стабилен текст за SSR + клиент
      excerpt: p.seoDesc ?? excerpt(p.content, 120),
      category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
      author: p.author ? { email: p.author.email } : null,
    }
  })

  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">Последни публикации</h2>
        <Link href="/blog" className="text-sm text-gray-600 hover:text-black">
          Виж всички
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-gray-500">Няма публикации.</div>
      ) : (
        <PostsSlider items={items} />
      )}
    </section>
  )
}
