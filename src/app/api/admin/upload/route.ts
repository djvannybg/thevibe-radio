import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
// ✅ правилно
import { authOptions } from "@/lib/authOptions"
import fs from "fs/promises"
import path from "path"
import crypto from "crypto"

const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

async function ensureUploadsDir() {
  const dir = path.join(process.cwd(), "public", "uploads")
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch {}
  return dir
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const dir = await ensureUploadsDir()

  // запазваме разширение (ако го има) или по mimetype
  const orig = file.name || "upload"
  const extFromName = path.extname(orig).toLowerCase()
  const extFromType =
    file.type === "image/jpeg" ? ".jpg" :
    file.type === "image/png"  ? ".png" :
    file.type === "image/webp" ? ".webp" :
    file.type === "image/gif"  ? ".gif" : ""

  const ext = extFromName || extFromType || ""
  const name = crypto.randomBytes(8).toString("hex") + ext
  const filepath = path.join(dir, name)

  await fs.writeFile(filepath, bytes)

  // public/ е web root → връщаме web URL:
  const url = `/uploads/${name}`
  return NextResponse.json({ url })
}
