import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // ако искаш, замени ** с конкретни домейни за по-строг контрол
    remotePatterns: [{ protocol: "https", hostname: "**.vercel-storage.com" }],
  },
  // ако ти трябва прокси път към радио стрийма (по избор):
  // async rewrites() {
  //   return [{ source: "/radio", destination: "https://stream.thevibe.tv:8000/live" }]
  // },
}

export default nextConfig
