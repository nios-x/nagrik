"use client"

import { useEffect, useState } from "react"
import {
  IconAlertTriangle,
  IconMapPin,
  IconClock,
  IconFilter,
} from "@tabler/icons-react"

type UserReport = {
  id: string
  category: string
  severity: "LOW" | "MEDIUM" | "HIGH"
  description: string
  distance: number
  createdAt: string
  isResolved: boolean
}

export default function UserDashboard() {
  const [reports, setReports] = useState<UserReport[]>([])
  const [filter, setFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL")

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await fetch(
        `/api/user/reports?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`
      )
      const data = await res.json()
      setReports(data)
    })
  }, [])

  const filteredReports =
    filter === "ALL"
      ? reports
      : reports.filter((r) => r.severity === filter)

  return (
    <div className="min-h-screen bg-black noth text-white p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
          Nearby Alerts
        </h1>
        <p className="text-sm text-muted-foreground">
          Issues reported around your location
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["ALL", "HIGH", "MEDIUM", "LOW"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1 rounded text-xs border ${
              filter === f
                ? "bg-indigo-500/20 border-indigo-400 text-indigo-300"
                : "border-white/10 text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {filteredReports.map((r) => (
          <div
            key={r.id}
            className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold">
                  {r.category}
                  {r.severity === "HIGH" && (
                    <IconAlertTriangle className="inline ml-2 text-red-400 w-4 h-4" />
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {r.description}
                </p>
              </div>

              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  r.isResolved
                    ? "bg-green-500/20 text-green-300"
                    : "bg-yellow-500/20 text-yellow-300"
                }`}
              >
                {r.isResolved ? "Resolved" : "In Progress"}
              </span>
            </div>

            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <IconMapPin className="w-3 h-3" />
                {r.distance.toFixed(1)} km away
              </span>
              <span className="flex items-center gap-1">
                <IconClock className="w-3 h-3" />
                {new Date(r.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-6">
            No alerts found
          </div>
        )}
      </div>
    </div>
  )
}
