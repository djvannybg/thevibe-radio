"use client"

import { useEffect, useMemo, useState } from "react"
import { slugify } from "@/lib/slugify"

type Cat = {
  id: string
  name: string
  slug: string
  createdAt: string
  _count: { posts: number }
}

export default function CategoriesPage() {
  const [cats, setCats] = useState<Cat[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [saving, setSaving] = useState(false)

  const canCreate = useMemo(() => name.trim().length > 0, [name])

  const load = async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Грешка при зареждане")
      setCats(data)
    } catch (e: any) {
      setErr(e.message || "Грешка")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCreate || saving) return
    setSaving(true)
    setErr(null)
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Неуспешно създаване")
      setName("")
      setSlug("")
      await load()
    } catch (e: any) {
      setErr(e.message || "Грешка")
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm("Сигурен ли си, че искаш да изтриеш тази категория?")) return
    setErr(null)
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Неуспешно изтриване")
      await load()
    } catch (e: any) {
      setErr(e.message || "Грешка")
    }
  }

  const autoSlug = () => {
    if (!slug.trim() && name.trim()) setSlug(slugify(name))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Категории</h1>

      {err && <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <form onSubmit={onCreate} className="mb-8 grid gap-3 md:grid-cols-3">
        <input
          className="border p-2 rounded"
          placeholder="Име (напр. Новини)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={autoSlug}
        />
        <input
          className="border p-2 rounded"
          placeholder="Slug (по избор)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <button
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-60"
          disabled={!canCreate || saving}
          type="submit"
        >
          {saving ? "Добавяне..." : "Добави категория"}
        </button>
      </form>

      {loading ? (
        <div>Зареждане...</div>
      ) : cats.length === 0 ? (
        <div className="text-gray-600">Няма категории.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Име</th>
                <th className="px-3 py-2 text-left">Slug</th>
                <th className="px-3 py-2 text-left">Постове</th>
                <th className="px-3 py-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {cats.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="px-3 py-2">{c.name}</td>
                  <td className="px-3 py-2 text-gray-600">{c.slug}</td>
                  <td className="px-3 py-2">{c._count.posts}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className="rounded border px-3 py-1.5 disabled:opacity-50"
                      onClick={() => onDelete(c.id)}
                      disabled={c._count.posts > 0}
                      title={c._count.posts > 0 ? "Има публикации – първо ги премести/изтрий" : "Изтрий"}
                    >
                      Изтрий
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
