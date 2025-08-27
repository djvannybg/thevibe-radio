// src/components/site/Header.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Logo from "./Logo"

const NAV = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
]

export default function Header() {
  const pathname = usePathname() ?? "/" // защитa: може да върне null при SSR hydration
  const [open, setOpen] = useState(false)

  // затваряне на мобилното меню при смяна на пътя
  useEffect(() => { setOpen(false) }, [pathname])

  // ESC за затваряне
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-[1540px] px-4 h-14 flex items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((i) => {
            const active = pathname === i.href || (i.href !== "/" && pathname.startsWith(i.href))
            return (
              <Link
                key={i.href}
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm transition-colors ${active ? "text-black font-medium" : "text-gray-600 hover:text-black"}`}
              >
                {i.label}
              </Link>
            )
          })}
        </nav>

        {/* Mobile burger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border hover:bg-gray-50"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          <span className="sr-only">Menu</span>
          <div className={`i ${open ? "open" : ""}`} />
          <style jsx>{`
            .i {
              width: 18px; height: 2px; background: #111; position: relative; display: block; transition: transform .2s ease;
            }
            .i::before, .i::after {
              content: ""; position: absolute; left: 0; right: 0; height: 2px; background: #111; transition: transform .2s ease, top .2s ease, opacity .2s ease;
            }
            .i::before { top: -6px; }
            .i::after  { top:  6px; }
            .i.open { background: transparent; }
            .i.open::before { top: 0; transform: rotate(45deg); }
            .i.open::after  { top: 0; transform: rotate(-45deg); }
          `}</style>
        </button>
      </div>

      {/* Mobile drawer + backdrop */}
      <div className={`md:hidden ${open ? "block" : "hidden"}`}>
        {/* backdrop */}
        <button
          className="fixed inset-0 bg-black/20"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
        <div
          id="mobile-nav"
          className="relative border-t bg-white"
        >
          <div className="mx-auto max-w-[1540px] px-4 py-3 flex flex-col gap-1">
            {NAV.map((i) => {
              const active = pathname === i.href || (i.href !== "/" && pathname.startsWith(i.href))
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  className={`py-2 text-sm ${active ? "text-black font-medium" : "text-gray-700 hover:text-black"}`}
                >
                  {i.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
