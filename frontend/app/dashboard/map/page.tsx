"use client"

import { useEffect, useState } from "react"
import { EmergencyMap } from "@/components/emergency-map"

interface Report {
  id: string
  keyword: string
  category: string
  description: string
  latitude: number
  longitude: number
  severity: "low" | "medium" | "high"
  createdAt: string
  speechStressData?: {
    wordsPerSecond: number
    repeatedWords: number
    pauseCount: number
    averagePauseDuration: number
    confidence: number
    stressIndicators: string
  } | null
}

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports");
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [])

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-indigo-400 to-cyan-200 bg-clip-text text-transparent mb-2">
          Geospatial Command View
        </h1>
        <p className="text-muted-foreground">
          Visualize and monitor emergency alerts by geographic location
        </p>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full flex gap-6">
          {/* Map */}
          <div className="flex-1 bg-black/30 border border-white/10 rounded-lg overflow-hidden">
            <EmergencyMap
              reports={reports}
              selectedReport={selectedReport}
            />
          </div>

          {/* Active Reports */}
          <div className="w-80 hidden lg:flex flex-col bg-black/30 border border-white/10 rounded-lg">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-cyan-300">
                Active Reports
              </h3>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-2">
              {loading && <p className="text-cyan-400">Loading…</p>}
              
              {!loading && reports.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No reports found
                </p>
              )}

              {!loading && reports.map((report) => {
                const isSelected = selectedReport?.id === report.id

                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      isSelected
                        ? "bg-cyan-500/20"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-cyan-400">
                        {report.id.slice(0, 8).toUpperCase()}
                      </span>
                      {report.speechStressData && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          (report.speechStressData.confidence || 0) >= 60
                            ? "bg-red-500/20 text-red-300"
                            : (report.speechStressData.confidence || 0) >= 40
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-green-500/20 text-green-300"
                        }`}>
                          {report.speechStressData.confidence || 0}%
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-white">
                      {report.keyword}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {report.description}
                    </p>
                    {report.speechStressData && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Speed: {typeof report.speechStressData.wordsPerSecond === 'number' ? report.speechStressData.wordsPerSecond.toFixed(1) : '0.0'} wps</span>
                          <span>•</span>
                          <span>Pauses: {report.speechStressData.pauseCount || 0}</span>
                        </div>
                        {(() => {
                          try {
                            const indicators = JSON.parse(report.speechStressData.stressIndicators) as string[]
                            if (indicators.length > 0) {
                              return (
                                <div className="mt-1">
                                  <span className="text-xs text-red-300 line-clamp-1">
                                    {indicators[0]}
                                  </span>
                                </div>
                              )
                            }
                          } catch (e) {
                            // Ignore parse errors
                          }
                          return null
                        })()}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
