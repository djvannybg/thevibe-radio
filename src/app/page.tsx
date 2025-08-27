import Image from "next/image"
import Hero from "@/components/site/Hero"
import NowPlayingCard from "@/components/radio/NowPlayingCard"
import PreviousTrack from "@/components/radio/PreviousTrack"
import Top10Week from "@/components/radio/Top10Week"
import LatestPosts from "@/components/blog/LatestPosts"     // 👈 новото

export default function Home() {
  return (
    <>
      <Hero />

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-10">
        <section
          id="live"
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_520px] xl:grid-cols-[minmax(0,1fr)_620px] items-start"
        >
          <Card title="Informations" className="w-full">
            <div className="relative w-full overflow-hidden rounded-xl">
              <div className="relative aspect-[21/9]">
                <Image
                  src="/uploads/b8d1ecd4371340d8.png"
                  alt="Informations banner"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </Card>

          <aside className="flex flex-col gap-4 w-full">
            <NowPlayingCard />
            <PreviousTrack />
            <Top10Week />
          </aside>
        </section>

        {/* 👇 новата секция с постове */}
        <LatestPosts limit={6} />
      </main>
    </>
  )
}

/* Card helper */
function Card({
  title,
  children,
  className = "",
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl border shadow-sm bg-white ${className}`}>
      {title ? <h2 className="text-xl md:text-2xl font-semibold p-4 border-b">{title}</h2> : null}
      <div className="p-4">{children}</div>
    </section>
  )
}
