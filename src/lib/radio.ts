import {prisma} from "@/lib/prisma"
import { slugify } from "@/lib/slugify"
import { DateTime } from "luxon"

export function getISOWeekRangeEuropeLondon(date = DateTime.now().setZone("Europe/London")) {
  // начало на ISO седмица (понеделник 00:00) в Лондон, с коректен DST
  const start = date.startOf("week").plus({ days: 1 }).startOf("day") // Luxon ISO week започва в неделя => +1 ден за понеделник
  const from = start.toJSDate()
  const to = start.plus({ days: 7 }).toJSDate()
  const year = start.weekYear
  const week = start.weekNumber
  return { from, to, year, week }
}

// създава/намира трак по artist+title
export async function upsertTrack(artist: string, title: string) {
  const slug = slugify(`${artist}-${title}`)
  return prisma.track.upsert({
    where: { artist_title_unique: { artist, title } },
    create: { artist, title, slug },
    update: { slug },
  })
}

// добавя Play, с проста дедупликация (ако последният е същият трак < 90s)
export async function addPlay(trackId: string, playedAt = new Date(), source?: string, meta?: any) {
  const last = await prisma.play.findFirst({
    orderBy: { playedAt: "desc" },
    select: { trackId: true, playedAt: true },
  })
  if (last && last.trackId === trackId && (playedAt.getTime() - new Date(last.playedAt).getTime()) < 90_000) {
    return last // избягваме дубли при шумен now-playing feed
  }
  return prisma.play.create({ data: { trackId, playedAt, source, meta } })
}

export function getISOWeekRange(date = new Date()) {
  // начало/край на ISO седмица (понеделник - неделя)
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  if (day !== 1) d.setUTCDate(d.getUTCDate() - (day - 1))
  const from = new Date(d)
  const to = new Date(d); to.setUTCDate(to.getUTCDate() + 7)
  // номер на седмица
  const oneJan = new Date(Date.UTC(from.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((from as any) - (oneJan as any)) / 86400000 + oneJan.getUTCDay() + 1) / 7)
  return { from, to, year: from.getUTCFullYear(), week }
}
