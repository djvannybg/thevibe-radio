// src/app/blog/[slug]/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Post = {
  title: string
  content: string
  seoTitle: string | null
  seoDesc: string | null
  image: string | null
  createdAt: string
  author: { email: string }
}

async function getPost(slug: string): Promise<Post | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const res = await fetch(`${base}/api/posts/${slug}`, { cache: "no-store" })
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Failed to fetch post")
  return res.json()
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }   // ✅ Promise
): Promise<Metadata> {
  const { slug } = await params                        // ✅ await
  const post = await getPost(slug)
  if (!post) return { title: "Не е намерено | TheVibe Radio" }
  return {
    title: post.seoTitle || post.title,
    description: post.seoDesc || undefined,
  }
}

export default async function PostPage(
  {
    params,
    // ако ти трябва и query: добави Promise за searchParams
    // searchParams,
  }: {
    params: Promise<{ slug: string }>                  // ✅ Promise
    // searchParams?: Promise<Record<string, string | string[] | undefined>>
  }
) {
  const { slug } = await params                        // ✅ await
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-500 text-sm mb-6">
        Публикувано от {post.author.email} на{" "}
        {new Date(post.createdAt).toLocaleDateString("bg-BG")}
      </p>
      <div
        className="prose prose-lg"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  )
}
