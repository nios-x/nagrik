import type React from "react"
import { EmergencySidebar } from "@/components/emergency-sidebar"
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <EmergencySidebar />
      <main className="ml-80 flex-1 overflow-auto">{children}</main>
    </div>
  )
}
