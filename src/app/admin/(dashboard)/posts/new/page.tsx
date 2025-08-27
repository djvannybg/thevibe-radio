"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

type Category = { id: string; name: string; slug: string }
type PostStatus = "DRAFT" | "PUBLISHED"

export default function NewPostPage() {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDesc, setSeoDesc] = useState("")
  const [status, setStatus] = useState<PostStatus>("DRAFT")
  const [image, setImage] = useState<string | null>(null)

  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState<string | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [catLoading, setCatLoading] = useState(true)
  const [categoryId, setCategoryId] = useState<string>("")

  const [saving, setSaving] = useState(false)
  const router = useRouter()

  // load categories
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/admin/categories", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load categories")
        const data: Category[] = await res.json()
        if (!mounted) return
        setCategories(data)
        if (data.length && !categoryId) setCategoryId(data[0].id)
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setCatLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [categoryId])

  // auto-generate slug на blur
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

  // upload handler – работи с /api/admin/upload (Vercel Blob в прод)
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadErr(null)
    setUploading(true)
    try {
      // базови ограничения (по желание)
      if (!file.type.startsWith("image/")) {
        throw new Error("Моля, избери изображение.")
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Файлът е твърде голям (макс. 5MB).")
      }

      const fd = new FormData()
      fd.append("file", file)

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok || !data?.url) {
        throw new Error(data?.error || "Грешка при качване на файл")
      }

      setImage(data.url) // абсолютен URL (Blob) или /uploads/... локално
    } catch (err: any) {
      setUploadErr(err?.message ?? "Upload error")
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return alert("Въведи заглавие")
    if (!slug.trim()) return alert("Въведи slug")
    if (!categoryId) return alert("Избери категория")

    setSaving(true)
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          content,
          seoTitle,
          seoDesc,
          status,
          image,
          categoryId,
        }),
      })
      if (res.ok) {
        router.push("/admin/posts")
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err?.error ?? "Грешка при създаване на публикацията")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Нов пост</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Заглавие</span>
          <input
            className="mt-1 w-full border rounded p-2"
            placeholder="Заглавие"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={autoSlug}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Slug</span>
          <input
            className="mt-1 w-full border rounded p-2"
            placeholder="slug-example"
            value={slug}
            onChange={e => setSlug(e.target.value)}
          />
        </label>

        {/* Категория */}
        <div>
          <label className="block text-sm font-medium mb-1">Категория</label>
          {catLoading ? (
            <div className="text-sm text-gray-500">Зареждане…</div>
          ) : categories.length ? (
            <select
              className="w-full border rounded p-2"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-red-600">
              Няма категории. Създай поне една от “Admin → Categories”.
            </div>
          )}
        </div>

        {/* Изображение */}
        <div>
          <label className="block text-sm font-medium mb-1">Изображение</label>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            disabled={uploading}
            className="block w-full"
          />
          {uploading && <div className="text-sm text-gray-500 mt-1">Качване…</div>}
          {uploadErr && <div className="text-sm text-red-600 mt-1">{uploadErr}</div>}

          {image && (
            <div className="mt-3">
              <div className="relative h-40 w-full">
                <Image
                  src={image}
                  alt="preview"
                  fill
                  sizes="(max-width:768px) 100vw, 640px"
                  className="rounded border object-cover"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1 break-all">{image}</div>
            </div>
          )}
        </div>

        <label className="block">
          <span className="text-sm font-medium">Съдържание</span>
          <textarea
            className="mt-1 w-full border rounded p-2 min-h-[150px]"
            placeholder="Съдържание"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">SEO Заглавие</span>
          <input
            className="mt-1 w-full border rounded p-2"
            placeholder="SEO Заглавие"
            value={seoTitle}
            onChange={e => setSeoTitle(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">SEO Описание</span>
          <input
            className="mt-1 w-full border rounded p-2"
            placeholder="SEO Описание"
            value={seoDesc}
            onChange={e => setSeoDesc(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Статус</span>
          <select
            className="mt-1 w-full border rounded p-2"
            value={status}
            onChange={e => setStatus(e.target.value as PostStatus)}
          >
            <option value="DRAFT">Чернова</option>
            <option value="PUBLISHED">Публикуван</option>
          </select>
        </label>

        <button
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
          type="submit"
          disabled={catLoading || !categories.length || uploading || saving}
        >
          {saving ? "Записване…" : "Запази"}
        </button>
      </form>
    </div>
  )
}
