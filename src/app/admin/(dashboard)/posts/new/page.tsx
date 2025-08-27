"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"


type Category = { id: string; name: string; slug: string }

export default function NewPostPage() {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDesc, setSeoDesc] = useState("")
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT")
  const [image, setImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [catLoading, setCatLoading] = useState(true)
  const [categoryId, setCategoryId] = useState<string>("")

  const router = useRouter()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // ако имаш публичен ендпойнт /api/categories — смени пътя долу
        const res = await fetch("/api/admin/categories", { cache: "no-store" })

        if (!res.ok) throw new Error("Failed categories")
        const data: Category[] = await res.json()
        if (mounted) {
          setCategories(data)
          // по подразбиране – първата категория
          if (data.length && !categoryId) setCategoryId(data[0].id)
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setCatLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [categoryId])

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
    setImage(data.url) // напр. /uploads/xxxx.jpg
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId) {
      alert("Избери категория")
      return
    }
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, slug, content, seoTitle, seoDesc, status, image, categoryId
      })
    })
    if (res.ok) router.push("/admin/posts")
    else {
      const err = await res.json().catch(() => ({}))
      alert(err?.error ?? "Грешка при създаване на публикацията")
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Нов пост</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border p-2" placeholder="Заглавие"
               value={title} onChange={e => setTitle(e.target.value)} onBlur={autoSlug}/>
        <input className="w-full border p-2" placeholder="Slug"
               value={slug} onChange={e => setSlug(e.target.value)} />

        {/* Категория */}
        <div>
          <label className="block text-sm font-medium mb-1">Категория</label>
          {catLoading ? (
            <div className="text-sm text-gray-500">Зареждане…</div>
          ) : categories.length ? (
            <select
              className="w-full border p-2"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-red-600">
              Няма категории. Създай поне една от „Admin → Categories“.
            </div>
          )}
        </div>

        {/* Изображение */}

          {image && (
            <div className="mt-2">
              <div className="relative h-40 w-full">
                <Image
                  src={image}
                  alt="preview"
                  fill
                  className="rounded border object-cover"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">{image}</div>
            </div>
          )}


        <textarea className="w-full border p-2 min-h-[150px]" placeholder="Съдържание"
                  value={content} onChange={e => setContent(e.target.value)} />
        <input className="w-full border p-2" placeholder="SEO Заглавие"
               value={seoTitle} onChange={e => setSeoTitle(e.target.value)} />
        <input className="w-full border p-2" placeholder="SEO Описание"
               value={seoDesc} onChange={e => setSeoDesc(e.target.value)} />
        <select className="w-full border p-2" value={status} onChange={e => setStatus(e.target.value as any)}>
          <option value="DRAFT">Чернова</option>
          <option value="PUBLISHED">Публикуван</option>
        </select>

        <button className="bg-black text-white px-4 py-2 rounded" type="submit" disabled={catLoading || !categories.length}>
          Запази
        </button>
      </form>
    </div>
  )
}
