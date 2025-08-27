"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

type Category = { id: string; name: string; slug: string }

export default function CategoryFilter() {
  const [cats, setCats] = useState<Category[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const current = searchParams.get("category") || ""

  useEffect(() => {
    fetch("/api/admin/categories").then(r => r.json()).then(setCats)
  }, [])

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const slug = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (slug) params.set("category", slug)
    else params.delete("category")
    params.delete("page") // при смяна на филтър – върни на страница 1
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-1">Категория</label>
      <select
        className="w-full sm:w-64 border rounded-lg p-2"
        onChange={onChange}
        value={current}
      >
        <option value="">Всички</option>
        {cats.map(c => (
          <option key={c.id} value={c.slug}>{c.name}</option>
        ))}
      </select>
    </div>
  )
}
