"use client"

import { AnalyticsCharts } from "@/components/analytics-charts"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full noth bg-black">
      {/* Header */}
      <div className="p-6 lg:p-8 border-b border-white/10">
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-indigo-400 to-cyan-200 bg-clip-text text-transparent mb-2">
          Analytics Control Center
        </h1>
        <p className="text-muted-foreground">
          Real-time insights into emergency detection patterns and response metrics
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <AnalyticsCharts />
      </div>
    </div>
  )
}
