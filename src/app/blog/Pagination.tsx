"use client"

import Link from "next/link"
import { useMemo } from "react"

export default function Pagination({
  page, total, limit, basePath
}: { page: number; total: number; limit: number; basePath: string }) {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const pages = useMemo(() => {
    const arr: number[] = []
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)
    for (let p = start; p <= end; p++) arr.push(p)
    return arr
  }, [page, totalPages])

  if (totalPages <= 1) return null

  const mk = (p: number) => `${basePath}?page=${p}`

  return (
    <nav className="flex items-center justify-center gap-2">
      <Link
        href={mk(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`px-3 py-2 rounded-lg border ${page === 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"}`}
      >
        ← Назад
      </Link>

      {pages[0] > 1 && (
        <>
          <Link href={mk(1)} className="px-3 py-2 rounded-lg border hover:bg-gray-50">1</Link>
          {pages[0] > 2 && <span className="px-2">…</span>}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={mk(p)}
          className={`px-3 py-2 rounded-lg border ${p === page ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-50"}`}
        >
          {p}
        </Link>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="px-2">…</span>}
          <Link href={mk(totalPages)} className="px-3 py-2 rounded-lg border hover:bg-gray-50">{totalPages}</Link>
        </>
      )}

      <Link
        href={mk(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`px-3 py-2 rounded-lg border ${page === totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50"}`}
      >
        Напред →
      </Link>
    </nav>
  )
}
