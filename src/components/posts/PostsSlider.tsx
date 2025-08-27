"use client"

import React from "react"
import Link from "next/link"

export type PostItem = {
  id: string
  slug: string
  title: string
  cover?: string | null
  excerpt?: string | null
  createdAt?: Date | string
}

export default function PostsSlider({ posts, className = "" }: { posts: PostItem[]; className?: string }) {
  // Тук можеш да закачиш реален slider (shadcn/ui, keen-slider и т.н.)
  return (
    <div className={`grid grid-flow-col auto-cols-[80%] gap-4 overflow-x-auto no-scrollbar ${className}`}>
      {posts.map(p => (
        <Link
          key={p.id}
          href={`/posts/${p.slug}`}
          className="rounded-xl border shadow-sm overflow-hidden bg-white hover:shadow-md transition"
        >
          {p.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.cover} alt={p.title} className="w-full h-36 object-cover" />
          ) : (
            <div className="w-full h-36 bg-gray-100" />
          )}
          <div className="p-3">
            <div className="font-semibold line-clamp-2">{p.title}</div>
            {p.excerpt ? <div className="text-sm text-gray-600 line-clamp-2 mt-1">{p.excerpt}</div> : null}
          </div>
        </Link>
      ))}
    </div>
  )
}
