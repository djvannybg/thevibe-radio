import { Metadata } from "next"
import BlogGrid from "./BlogGrid"
import Pagination from "./Pagination"
import CategoryFilter from "./CategoryFilter"

export const metadata: Metadata = {
  title: "Блог | TheVibe Radio",
  description: "Последни новини и публикации от TheVibe Radio",
}

type ApiResp = { items: any[]; total: number; page: number; limit: number }

async function getPosts(page: number, category?: string): Promise<ApiResp> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const qs = new URLSearchParams({ page: String(page), limit: "9" })
  if (category) qs.set("category", category)
  const res = await fetch(`${base}/api/posts?${qs.toString()}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch posts")
  return res.json()
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>
}) {
  const { page: pageParam, category } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10))

  const { items, total, limit } = await getPosts(page, category)

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4 text-center">Блог</h1>
      <div className="max-w-5xl mx-auto">
        <CategoryFilter />
        <BlogGrid posts={items} />
        <div className="mt-10">
          <Pagination page={page} total={total} limit={limit} basePath="/blog" />
        </div>
      </div>
    </div>
  )
}
