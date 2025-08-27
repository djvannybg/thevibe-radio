import { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/authOptions"



export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  return (
    <div className="w-full min-h-svh md:grid md:grid-cols-[14rem_1fr]">
      {/* Sidebar (sticky) */}
      <aside className="border-r p-4 md:sticky md:top-0 md:h-svh bg-white">
        <div className="mb-6 font-bold">TheVibeTV</div>
        <nav className="space-y-2">
          <Link href="/admin" className="block rounded px-3 py-2 hover:bg-gray-50">
            Dashboard
          </Link>

          <div>
            <div className="px-3 py-2 font-medium">Posts</div>
            <div className="ml-3 mt-1 space-y-1 text-sm">
              <Link href="/admin/posts" className="block rounded px-3 py-1.5 hover:bg-gray-50">
                Всички постове
              </Link>
              <Link href="/admin/posts/new" className="block rounded px-3 py-1.5 hover:bg-gray-50">
                Нов пост
              </Link>
              <Link href="/admin/posts/categories" className="block rounded px-3 py-1.5 hover:bg-gray-50">
                Категории
              </Link>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main (от край до край в свободната колона) */}
      <main className="p-6 overflow-x-hidden">{children}</main>
    </div>
  )
}
