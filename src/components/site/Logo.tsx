import Link from "next/link"

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`font-extrabold tracking-tight text-xl md:text-3xl ${className}`}>
      <span className="text-pink-500">The</span>Vibe<span className="text-pink-500">Radio</span>
    </Link>
  )
}
