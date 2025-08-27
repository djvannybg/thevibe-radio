import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import crypto from "crypto"

// по избор: ако искаш Node runtime (за fs локално)
export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 })
    }

    // уникално име
    const ext = (file.name?.split(".").pop() ?? "bin").toLowerCase()
    const id = crypto.randomBytes(8).toString("hex")
    const objectKey = `uploads/${id}.${ext}`

    // Ако сме на Vercel (read-only fs) → качваме във Vercel Blob
    if (process.env.VERCEL) {
      const blob = await put(objectKey, file, {
        access: "public", // ще върне публичен URL
        contentType: file.type || "application/octet-stream",
      })
      return NextResponse.json({ ok: true, url: blob.url }, { status: 200 })
    }

    // ---- ЛОКАЛЕН fallback (dev) – запис в ./public/uploads ----
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const fs = await import("fs/promises")
    const path = await import("path")
    const uploadsDir = path.join(process.cwd(), "public", "uploads")

    await fs.mkdir(uploadsDir, { recursive: true })
    const target = path.join(uploadsDir, `${id}.${ext}`)
    await fs.writeFile(target, buffer)

    // локален публичен път
    const url = `/uploads/${id}.${ext}`
    return NextResponse.json({ ok: true, url }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Upload failed" }, { status: 500 })
  }
}
