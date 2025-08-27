"use client"

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function LoginClient() {
  const router = useRouter()
  const params = useSearchParams()

  const callbackUrl = (() => {
    const cb = params.get("callbackUrl")
    try {
      if (cb) new URL(cb, typeof window !== "undefined" ? window.location.origin : "http://localhost")
      return cb || "/admin"
    } catch {
      return "/admin"
    }
  })()

  const [email, setEmail] = useState("admin@thevibe.tv")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null); setLoading(true)

    const res = await signIn("credentials", {
      email, password, redirect: false, callbackUrl
    })

    setLoading(false)

    if (res?.ok) {
      router.push(res.url || callbackUrl || "/admin")
      return
    }
    setErr("Грешен email или парола.")
  }

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow">
        <h1 className="text-2xl font-semibold">Админ вход</h1>
        <input
          className="w-full rounded-md border px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-md border px-3 py-2"
          type="password"
          placeholder="Парола"
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button disabled={loading} className="w-full rounded-md bg-black text-white py-2">
          {loading ? "Влизане..." : "Влез"}
        </button>
      </form>
    </div>
  )
}
