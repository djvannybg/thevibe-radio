// src/lib/normalize.ts

const FEATURE_RX = /\s+(feat\.|ft\.|featuring)\s+.+$/i
const PARENS_RX  = /\s*[\(\[](?:(?:radio|club|extended)\s+)?(?:mix|edit|version|remix|rmx|clean|dirty)[^\)\]]*[\)\]]/ig
const DASHES_RX  = /\s+[-–—]\s+/g
const REMIX_LIKE_IN_PARENS =
  /[\(\[][^\)\]]*(remix|rmx|mix|edit|version|bootleg|refix|rework|vip|dj\b)[^\)\]]*[\)\]]/i

  export function hasRemixLikeTag(rawTitle: string): boolean {
  if (!rawTitle) return false
  if (REMIX_LIKE_IN_PARENS.test(rawTitle)) return true
  // понякога е без скоби: "Song - Remix" или "Song Remix"
  return /\bremix\b/i.test(rawTitle)
}

export function normalizeArtist(input: string) {
  return input.trim().replace(DASHES_RX, " - ").replace(/\s+/g, " ")
}

export function normalizeTitle(input: string) {
  return input
    .replace(FEATURE_RX, "")
    .replace(PARENS_RX, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\-а-яёъь]+/gi, "")
    .replace(/-+/g, "-")
}

const JINGLE_KEYS = ["jingle", "sting", "sweeper", "id", "station id"]
const AD_KEYS     = [
  "advert", "ad break", "promo", "реклама",
  // 🔽 бранд ключове – всичко свързано с The Vibe не влиза в чартовете
  "the vibe", "the vibe radio", "the vibe tv", "the vibe balkan",
  "thevibe", "thevibe.tv"
]
const ID_KEYS     = ["id ", "station id", "ident"]

export type PlayKind = "MUSIC" | "JINGLE" | "AD" | "ID" | "OTHER"

export function detectPlayType(artist: string, title: string): PlayKind {
  const hay = `${artist} ${title}`.toLowerCase()
  if (JINGLE_KEYS.some(k => hay.includes(k))) return "JINGLE"
  if (AD_KEYS.some(k => hay.includes(k)))     return "AD"     // <- брандовете ще попаднат тук
  if (ID_KEYS.some(k => hay.includes(k)))     return "ID"
  return "MUSIC"
}
