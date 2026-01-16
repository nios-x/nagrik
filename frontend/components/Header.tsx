"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { name: "Home", href: "/" },
  { name: "Voice Recogniser", href: "/voice" },
  { name: "Admin Panel", href: "/dashboard" },
]

export default function TopRightHeader() {
  const pathname = usePathname()

  return (
    <header className="absolute top-4 right-4 z-50 noth">
      <nav className="flex items-center gap-2 rounded-xl  relative bg-black/70 backdrop-blur px-4 py-2 shadow-lg">
        {links.map((link) => {
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium  transition-colors py-2 px-4 ${
                isActive
                  ? "text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
