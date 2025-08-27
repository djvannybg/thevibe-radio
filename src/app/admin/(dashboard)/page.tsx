import React from 'react'
import Top10Week from "@/components/radio/Top10Week"
import PreviousTrack from "@/components/radio/PreviousTrack"

export default function AdminHome() {
  return (
    <div>

      {/* Първи ред – център */}
      <div className="flex justify-center">
        <div className="flex gap-10">
          <div className="col-auto border-2 w-[500px] text-center shadow-2xl">
            <p className="border-b-1 p-2 bg-[#f6339a] text-black font-extrabold  uppercase">
              Top Songs
            </p>
             <PreviousTrack className="p-2 border-0 border-r-0" />
          </div>
          <div className="col-auto border-2 w-[700px] text-center shadow-2xl p-1">
            <p className="border-b-1 p-2 bg-[#f6339a] text-black font-extrabold uppercase">
              Charts
            </p>
            <Top10Week className="p-2 border-0 border-r-0" />
            <div className="flex mt-10 w-full p-1">
             
            </div>
          </div>
        </div>
      </div>

      {/* Втори ред – вдясно */}

    </div>
  )
}
