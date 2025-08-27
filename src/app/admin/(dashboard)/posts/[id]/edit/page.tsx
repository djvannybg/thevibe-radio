"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

type Category = { id: string; name: string; slug: string }

type Post = {
  id: string
  title: string
  slug: string
  content: string
  seoTitle?: string | null
  seoDesc?: string | null
  image?: string | null
  status: "DRAFT" | "PUBLISHED"
  createdAt: string
  updatedAt: string
  categoryId: string
}

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // поля
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDesc, setSeoDesc] = useState("")
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT")
  const [image, setImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // категории
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<string>("")
  const [catsLoading, setCatsLoading] = useState(true)

  // Зареждане на поста + категориите
  useEffect(() => {
    let cancel = false
    async function load() {
      try {
        // пост
        const res = await fetch(`/api/admin/posts/${id}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Неуспешно зареждане на публикация")
        const p: Post = await res.json()
        if (cancel) return

        setTitle(p.title || "")
        setSlug(p.slug || "")
        setContent(p.content || "")
        setSeoTitle(p.seoTitle || "")
        setSeoDesc(p.seoDesc || "")
        setStatus(p.status || "DRAFT")
        setImage(p.image || null)
        setCategoryId(p.categoryId || "")

        // категории
        const rc = await fetch(`/api/admin/categories`, { cache: "no-store" })
        if (!rc.ok) throw new Error("Неуспешно зареждане на категории")
        const cats: Category[] = await rc.json()
        if (cancel) return
        setCategories(cats)
      } catch (e: any) {
        setErr(e.message || "Грешка при зареждане")
      } finally {
        if (!cancel) {
          setCatsLoading(false)
          setLoading(false)
        }
      }
    }
    load()
    return () => { cancel = true }
  }, [id])

  const autoSlug = () => {
    if (!slug && title) {
      setSlug(
        title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9а-яёіїѝъ\s-]/gi, "")
          .replace(/\s+/g, "-")
      )
    }
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
    setUploading(false)
    if (!res.ok) { alert("Грешка при качване на файл"); return }
    const data = await res.json()
    setImage(data.url)
  }

  const removeImage = () => setImage(null)

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId) { alert("Избери категория"); return }
    setSaving(true)
    setErr(null)
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, slug, content, seoTitle, seoDesc, status, image, categoryId
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "Неуспешно запазване")
      }
      router.push("/admin/posts")
    } catch (e: any) {
      setErr(e.message || "Грешка при запазване")
    } finally {
      setSaving(false)
    }
  }

  const canSave = useMemo(
    () => title.trim().length > 0 && content.trim().length > 0 && !!categoryId,
    [title, content, categoryId]
  )

  if (loading) return <div className="p-6">Зареждане...</div>

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Редакция на пост</h1>
        <button onClick={() => router.back()} className="rounded border px-3 py-1.5">
          Назад
        </button>
      </div>

      {err && <div className="mb-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <form onSubmit={onSave} className="space-y-4">
        <input className="w-full border p-2 rounded" placeholder="Заглавие"
               value={title} onChange={(e) => setTitle(e.target.value)} onBlur={autoSlug} />
        <input className="w-full border p-2 rounded" placeholder="Slug"
               value={slug} onChange={(e) => setSlug(e.target.value)} />

        {/* Категория */}
        <div>
          <label className="block text-sm font-medium mb-1">Категория</label>
          {catsLoading ? (
            <div className="text-sm text-gray-500">Зареждане…</div>
          ) : categories.length ? (
            <select className="w-full border p-2 rounded"
                    value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              Няма категории. Създай поне една от „Admin → Categories“.
            </div>
          )}
        </div>

        {/* Корица */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Корица (изображение)</label>
          <input type="file" accept="image/*" onChange={onFileChange} />
          {uploading && <div className="text-sm text-gray-500">Качване...</div>}
          {image && (
            <div className="mt-2 flex items-start gap-3">
              <img src={image} alt="preview" className="h-40 rounded border object-cover" />
              <button type="button" onClick={removeImage} className="rounded border px-3 py-1.5">
                Премахни
              </button>
            </div>
          )}
        </div>

        <textarea className="w-full border p-2 min-h-[180px] rounded" placeholder="Съдържание"
                  value={content} onChange={(e) => setContent(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="SEO Заглавие"
               value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="SEO Описание"
               value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} />
        <select className="w-full border p-2 rounded" value={status}
                onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}>
          <option value="DRAFT">Чернова</option>
          <option value="PUBLISHED">Публикуван</option>
        </select>

        <div className="flex gap-3">
          <button disabled={!canSave || saving}
                  className="rounded bg-black px-4 py-2 text-white disabled:opacity-60" type="submit">
            {saving ? "Запазване..." : "Запази промените"}
          </button>
          <button type="button" className="rounded border px-4 py-2"
                  onClick={() => router.push("/admin/posts")}>
            Откажи
          </button>
        </div>
      </form>
    </div>
  )
}
