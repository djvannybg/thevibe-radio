export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-600 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>© {year} TheVibeRadio. All rights reserved.</div>
        <nav className="flex items-center gap-4">
          <a href="/privacy" className="hover:text-black">Privacy</a>
          <a href="/terms" className="hover:text-black">Terms</a>
          <a href="mailto:hello@thevibe.tv" className="hover:text-black">Contact</a>
        </nav>
      </div>
    </footer>
  )
}
