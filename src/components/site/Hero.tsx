import Link from "next/link"
import Player from "@/components/Player"

export default function Hero() {
  return (
    <section
      className="
        relative overflow-hidden
        w-screen max-w-none left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]
      "
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pink-100 via-white to-indigo-100" />

      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 grid gap-10 md:grid-cols-2 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
            Balkan hits, <span className="text-pink-600">Live</span> 24/7
          </h1>
          <p className="mt-4 text-gray-600 md:text-lg">
            Слушай най-новите парчета и виж какво върви сега. Класации, новини и предавания – всичко на едно място.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="#live" className="px-5 py-2.5 rounded-xl bg-black text-white hover:opacity-90">
              Слушай сега
            </Link>
            <Link href="/blog" className="px-5 py-2.5 rounded-xl border hover:bg-gray-50">
              Последни новини
            </Link>
          </div>
        </div>

        {/* 👉 тук е плеърът като карта */}
        <Player className="w-full" />

      </div>
    </section>
  )
}
