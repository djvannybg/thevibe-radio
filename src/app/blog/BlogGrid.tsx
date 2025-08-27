"use client"

import Link from "next/link"
import { motion } from "framer-motion"

type Post = {
  id: string
  title: string
  slug: string
  seoDesc: string | null
  image: string | null
  createdAt: string
  author: { email: string }
  category?: { name: string; slug: string } // ⬅ добавено
}

export default function BlogGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <motion.div
          key={post.id}
          whileHover={{ scale: 1.03 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
        >
          {post.image && (
            <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
          )}
          <div className="p-5 flex flex-col flex-1">
            {post.category && (
              <Link
                href={`/blog/category/${post.category.slug}`}
                className="text-xs uppercase tracking-wide text-gray-500 mb-2 hover:underline"
              >
                {post.category.name}
              </Link>
            )}

            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 flex-1">{post.seoDesc || "Без описание"}</p>

            <Link
              href={`/blog/${post.slug}`}
              className="mt-4 inline-block text-blue-600 hover:underline font-medium"
            >
              Прочети още →
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
