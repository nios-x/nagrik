"use client";

import { useEffect, useState } from "react";
import { ReportsTable } from "@/components/reports-table";


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

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports");
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch reports", err);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);


  return (
    <div className="flex flex-col h-full noth bg-black">
      {/* Header */}
      <div className="p-6 lg:p-8 border-b border-white/10">
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-indigo-400 to-cyan-200 bg-clip-text text-transparent mb-2">
          Emergency Reports
        </h1>
        <p className="text-muted-foreground">
          View and manage all detected emergency voice alerts
        </p>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-auto p-6  space-y-6">
        {loading && (
          <div className="text-muted-foreground text-sm text-center py-8">
            Loading reports...
          </div>
        )}

        {!loading && reports.length === 0 && (
          <div className="text-muted-foreground text-sm text-center py-8">
            No reports found
          </div>
        )}
        <ReportsTable
          data={reports}
          onRowClick={setSelectedReport}
        />

        {/* Selected Report Details */}
        {selectedReport && (
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-6 ring ring-indigo-200/40 bg-gradient-to-r from-indigo-700/10 to-cyan-400/10">
            <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-cyan-200 bg-clip-text text-transparent mb-4">
              Report Details · {selectedReport.id}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
  <Detail label="Category" value={selectedReport.category} />
  <Detail
    label="Severity"
    value={selectedReport.severity.toUpperCase()}
    severity={selectedReport.severity}
  />
  <Detail label="Latitude" value={selectedReport.latitude} mono />
  <Detail label="Longitude" value={selectedReport.longitude} mono />
  {selectedReport.speechStressData ? (
    <Detail 
      label="Stress Confidence" 
      value={`${selectedReport.speechStressData.confidence}%`} 
      severity={selectedReport.speechStressData.confidence >= 60 ? "high" : selectedReport.speechStressData.confidence >= 40 ? "medium" : "low"}
    />
  ) : (
    <Detail label="Stress Confidence" value="N/A" />
  )}
  <Detail
    label="Time"
    value={new Date(selectedReport.createdAt).toLocaleString()}
  />
  <div className="col-span-2 md:col-span-3">
    <p className="text-muted-foreground mb-1">Description</p>
    <p className="text-white">{selectedReport.description}</p>
  </div>
  
  {/* Speech Stress Details */}
  {selectedReport.speechStressData && (
    <div className="col-span-2 md:col-span-3 mt-4 pt-4 border-t border-white/10">
      <h4 className="text-md font-bold text-cyan-300 mb-3">Speech Stress Analysis</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Detail label="Words/Second" value={typeof selectedReport.speechStressData.wordsPerSecond === 'number' ? selectedReport.speechStressData.wordsPerSecond.toFixed(1) : '0.0'} mono />
        <Detail label="Repeated Words" value={selectedReport.speechStressData.repeatedWords} />
        <Detail label="Pause Count" value={selectedReport.speechStressData.pauseCount} />
        <Detail label="Avg Pause (ms)" value={Math.round(selectedReport.speechStressData.averagePauseDuration)} mono />
      </div>
      {(() => {
        try {
          const indicators = JSON.parse(selectedReport.speechStressData.stressIndicators) as string[]
          if (indicators.length > 0) {
            return (
              <div className="mt-3">
                <p className="text-muted-foreground mb-2 text-xs">Stress Indicators:</p>
                <div className="flex flex-wrap gap-2">
                  {indicators.map((indicator, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300"
                    >
                      {indicator}
                    </span>
                  ))}
                </div>
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
</div>
          </div>
        )}
      </div>
    </div>
  )
}

function Detail({
  label,
  value,
  mono,
  severity,
}: {
  label: string
  value: any
  mono?: boolean
  severity?: "low" | "medium" | "high"
}) {
  const severityColor =
    severity === "high"
      ? "text-red-400"
      : severity === "medium"
        ? "text-yellow-400"
        : "text-lime-400"

  return (
    <div>
      <p className=" mb-1 text-white">{label}</p>
      <p
        className={`font-medium text-white ${mono ? "font-mono" : ""
          } ${severity ? severityColor : " text-white"}`}
      >
        {value}
      </p>
    </div>
  )
}
