"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconDashboard, IconTable, IconChartBar, IconMap } from "@tabler/icons-react"
import { ClearAdminDataButton } from "./clear-admin-data-button"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <IconDashboard className="w-5 h-5" />,
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    icon: <IconTable className="w-5 h-5" />,
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: <IconChartBar className="w-5 h-5" />,
  },
  {
    href: "/dashboard/map",
    label: "Map View",
    icon: <IconMap className="w-5 h-5" />,
  },
]

export function EmergencySidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-80 h-screen fixed left-0 top-0 bg-black backdrop-blur-md border-r noth border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">  
        <h1 className="text-4xl py-5  font-semibold bg-gradient-to-r from-indigo-600 to-cyan-300 bg-clip-text text-transparent flex items-center gap-2 noth">
          NAGRIK.AI
        </h1>
        <h1 className="text-lg -translate-y-6 font-semibold bg-gradient-to-r from-indigo-700 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2 noth">
          Admin Panel
        </h1>
      </div>
      
      <div
        className={`
      absolute 
      top-0 left-0
      h-20 w-60

      rotate-1/2
      rounded-full
      z-99
      blur-3xl
      animate-float
      bg-blue-800/50
    `}
      />

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href 
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-indigo-700/20 to-cyan-400/20 text-indigo-300 ring ring-indigo-200/80 shadow-lg shadow-indigo-500/20"
                  : "text-muted-foreground hover:text-indigo-300 hover:bg-white/5"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
         <div className="mt-auto pt-4 flex justify-center mb-3 border-t border-white/10">
        <ClearAdminDataButton />
      </div>
      <div className="p-4 border-t border-white/10 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span>Nagrik System Online</span>
        </div>
        <div className="text-[11px]">v1.0 • 2026</div>
      </div>
    </aside>
  )
}
