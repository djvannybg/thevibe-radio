import { notFound } from "next/navigation"

type ApiResp = {
  items: {
    id: string
    title: string
    slug: string
    seoDesc: string | null
    image: string | null
    createdAt: string
    author: { email: string }
    category: { name: string; slug: string }
  }[]
  total: number
  page: number
  limit: number
}

async function getByCategory(slug: string, page: number): Promise<ApiResp> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const res = await fetch(
    `${base}/api/posts?category=${slug}&page=${page}&limit=9`,
    { cache: "no-store" }
  )
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export async function generateStaticParams() {
  // Ако искаш SSG за категории → върни slug-ове
  return []
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const [{ slug }, { page: pageParam }] = await Promise.all([params, searchParams])

  const page = Math.max(1, parseInt(pageParam ?? "1", 10))
  const data = await getByCategory(slug, page)

  if (!data.items.length) notFound()

  const name = data.items[0].category.name

  // динамичен импорт (не влиза в SSR bundle-а излишно)
  const { default: BlogGrid } = await import("../../BlogGrid")
  const { default: Pagination } = await import("../../Pagination")

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Категория: {name}</h1>
      <p className="text-gray-500 mb-8">Публикации в {name}</p>

      <BlogGrid posts={data.items} />
      <div className="mt-10">
        <Pagination
          page={page}
          total={data.total}
          limit={data.limit}
          basePath={`/blog/category/${slug}`}
        />
      </div>
    </div>
  )
}
