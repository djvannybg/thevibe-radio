"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const PlayerDesktop = dynamic(() => import("./player/PlayerDesktop"), { ssr: false })
const PlayerMobile  = dynamic(() => import("./player/PlayerMobile"),  { ssr: false })

type Props = { className?: string }

/** < 768px → Mobile, иначе Desktop */
export default function Player({ className = "" }: Props) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const check = () => setIsMobile(mq.matches)
    check()
    mq.addEventListener?.("change", check)
    window.addEventListener("resize", check)
    return () => {
      mq.removeEventListener?.("change", check)
      window.removeEventListener("resize", check)
    }
  }, [])

  return isMobile ? <PlayerMobile className={className} /> : <PlayerDesktop className={className} />
}
