// src/lib/date.ts
export function formatDateBG(d: string | number | Date) {
  const dt = new Date(d)
  // фиксираме locale + parts, за да няма “г.” и разлики
  return new Intl.DateTimeFormat("bg-BG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/Sofia", // или "UTC" ако така ти е удобно
  }).format(dt)
}
