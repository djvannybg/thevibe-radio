"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/posts")
      .then(res => res.json())
      .then(data => { setPosts(data); setLoading(false) })
  }, [])

  const deletePost = async (id: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете този пост?")) return
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" })
    setPosts(posts.filter(p => p.id !== id))
  }

  if (loading) return <p className="p-6">Зареждане...</p>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Постове</h1>
        <Link href="/admin/posts/new" className="bg-black text-white px-4 py-2 rounded">
          Нов пост
        </Link>
      </div>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Заглавие</th>
            <th className="p-2 text-left">Статус</th>
            <th className="p-2 text-left">Дата</th>
            <th className="p-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.id} className="border-t">
              <td className="p-2">{post.title}</td>
              <td className="p-2">{post.status}</td>
              <td className="p-2">{new Date(post.createdAt).toLocaleDateString()}</td>
              <td className="p-2 flex gap-2">
                <Link href={`/admin/posts/${post.id}/edit`} className="text-blue-600">Редакция</Link>
                <button onClick={() => deletePost(post.id)} className="text-red-600">Изтрий</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
