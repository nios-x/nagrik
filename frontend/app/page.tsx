"use client"

import { useEffect, useState } from "react"
import {
  IconAlertTriangle,
  IconMapPin,
  IconClock,
  IconMicrophone,
  IconTrash,
  IconCarCrash,
} from "@tabler/icons-react"

type UserReport = {
  id: string
  category: string
  severity: "LOW" | "MEDIUM" | "HIGH"
  description: string
  distance: number
  createdAt: string
  isResolved: boolean
  source?: "VOICE" | "MANUAL" | "AI"
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

  const stats = {
    total: reports.length,
    high: reports.filter((r) => r.severity === "HIGH").length,
    unresolved: reports.filter((r) => !r.isResolved).length,
    ai: reports.filter((r) => r.source === "AI").length,
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8 noth">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
          Smart City Safety Dashboard
        </h1>
        <p className="text-sm text-white/50">
          AI-powered alerts around your location
        </p>
      </div>

      {/* Feature Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: "Voice Recogniser",
            icon: IconMicrophone,
            desc: "Detect emergencies via voice",
          },
          {
            title: "Report Garbage",
            icon: IconTrash,
            desc: "Cleanliness & waste issues",
          },
          {
            title: "Threats Detected",
            icon: IconTrash,
            desc: "AI public safety alerts",
          },
          {
            title: "Accidents",
            icon: IconCarCrash,
            desc: "Real-time accident reports",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            <f.icon className="w-6 h-6 text-indigo-400 mb-2" />
            <p className="text-sm font-semibold">{f.title}</p>
            <p className="text-xs text-white/50 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Total Alerts", stats.total],
          ["High Severity", stats.high],
          ["Unresolved", stats.unresolved],
          ["AI Detected", stats.ai],
        ].map(([label, value]) => (
          <div
            key={label as string}
            className="p-4 rounded-lg bg-white/5 border border-white/10"
          >
            <p className="text-2xl font-bold text-indigo-300">{value}</p>
            <p className="text-xs text-white/50">{label}</p>
          </div>
        ))}
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
                : "border-white/10 text-white/40"
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
                <p className="text-sm font-semibold flex items-center gap-2">
                  {r.category}
                  {r.severity === "HIGH" && (
                    <IconAlertTriangle className="text-red-400 w-4 h-4" />
                  )}
                </p>
                <p className="text-xs text-white/50 mt-1">
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

            <div className="flex gap-4 mt-3 text-xs text-white/40">
              <span className="flex items-center gap-1">
                <IconMapPin className="w-3 h-3" />
                {r.distance.toFixed(1)} km
              </span>
              <span className="flex items-center gap-1">
                <IconClock className="w-3 h-3" />
                {new Date(r.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="text-center text-white/40 text-sm py-6">
            No alerts found
          </div>
        )}
      </div>
    </div>
  )
}
