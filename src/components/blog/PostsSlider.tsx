"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export type PostItem = {
  id: string
  slug: string
  title: string
  image: string | null
  createdAtISO: string
  createdAtText: string     // <-- ще рендерираме това
  excerpt: string
  category: { name: string; slug: string } | null
  author: { email: string } | null
}

export default function PostsSlider({ items }: { items: PostItem[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateShadow = () => {
    const el = ref.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setAtStart(scrollLeft <= 1)
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 1)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    updateShadow()
    const onScroll = () => updateShadow()
    const onResize = () => updateShadow()
    el.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize, { passive: true })
    return () => {
      el.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  const scrollBy = (dir: number) => {
    const el = ref.current
    if (!el) return
    const step = Math.round(el.clientWidth * 0.9)
    el.scrollBy({ left: dir * step, behavior: "smooth" })
  }

  return (
    <div className="relative group">
      {/* градиентни сенки по краищата */}
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 w-10 from-white to-transparent bg-gradient-to-r transition-opacity ${
          atStart ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 w-10 from-transparent to-white bg-gradient-to-r transition-opacity ${
          atEnd ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* бутони навигация */}
      <button
        aria-label="Предишни"
        onClick={() => scrollBy(-1)}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-9 w-9 items-center justify-center rounded-full border bg-white/90 shadow hover:bg-white transition ${
          atStart ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        ‹
      </button>
      <button
        aria-label="Следващи"
        onClick={() => scrollBy(1)}
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-9 w-9 items-center justify-center rounded-full border bg-white/90 shadow hover:bg-white transition ${
          atEnd ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        ›
      </button>

      {/* контейнерът на слайдовете */}
      <div
        ref={ref}
        className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pr-2"
      >
        {items.map((p) => (
          <article
            key={p.id}
            className="snap-start flex-none w-[86%] sm:w-[60%] lg:w-[42%] xl:w-[33%] rounded-2xl border bg-white shadow-sm overflow-hidden"
          >
            <Link href={`/blog/${p.slug}`} className="block relative aspect-[16/9] bg-gray-100">
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                  без изображение
                </div>
              )}
            </Link>

            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {p.category?.name && (
                  <Link
                    href={`/blog?cat=${p.category.slug}`}
                    className="rounded-full border px-2 py-0.5 hover:bg-gray-50"
                  >
                    {p.category.name}
                  </Link>
                )}
                {/* стабилен текст от сървъра → без hydration mismatch */}
                <span>{p.createdAtText}</span>
              </div>

              <Link href={`/blog/${p.slug}`} className="font-semibold line-clamp-2">
                {p.title}
              </Link>

              {p.excerpt && <p className="text-sm text-gray-600 line-clamp-3">{p.excerpt}</p>}

              <div className="mt-auto text-xs text-gray-500">{p.author?.email || ""}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
