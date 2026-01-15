"use client"

import { useEffect, useRef } from "react"
import type L from "leaflet"

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

export function EmergencyMap({
  reports,
  selectedReport,
}: {
  reports: Report[]
  selectedReport?: Report | null
}) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    let mounted = true

    import("leaflet").then((L) => {
      if (!mounted || mapRef.current) return

      // CSS once
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link")
        link.id = "leaflet-css"
        link.rel = "stylesheet"
        link.href =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        document.head.appendChild(link)
      }

      mapRef.current = L.map(containerRef.current!).setView(
        [20.5937, 78.9629], // India
        5
      )

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current)

      markersRef.current = L.layerGroup().addTo(mapRef.current)
    })

    return () => {
      mounted = false
    }
  }, [])

  // MARKERS UPDATE
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return

    markersRef.current.clearLayers()

    import("leaflet").then((L) => {
      reports.forEach((r) => {
        const color =
          r.severity === "high"
            ? "#ef4444"
            : r.severity === "medium"
              ? "#eab308"
              : "#22c55e"

        const icon = L.divIcon({
          className: "emergency-marker",
          html: `
    <div class="marker-wrapper marker-${r.severity}">
      <span class="marker-pulse"></span>
      <span class="marker-core"></span>
    </div>
  `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        let popupContent = `
          <div style="min-width: 200px;">
            <b>${r.keyword}</b><br/>
            ${r.description}<br/>
            <small>${new Date(r.createdAt).toLocaleString()}</small>
        `
        
        if (r.speechStressData) {
          let stressIndicators: string[] = []
          try {
            stressIndicators = JSON.parse(r.speechStressData.stressIndicators)
          } catch (e) {
            // Ignore parse errors
          }
          
          const confidenceColor = r.speechStressData.confidence >= 60 ? '#ef4444' : r.speechStressData.confidence >= 40 ? '#eab308' : '#22c55e'
          
          popupContent += `
            <hr style="margin: 8px 0; border-color: rgba(255,255,255,0.2);"/>
            <div style="font-size: 12px;">
              <strong>Speech Analysis:</strong><br/>
              <span style="color: ${confidenceColor};">Confidence: ${r.speechStressData.confidence}%</span><br/>
              Speed: ${r.speechStressData.wordsPerSecond.toFixed(1)} wps<br/>
              Pauses: ${r.speechStressData.pauseCount}<br/>
          `
          
          if (stressIndicators.length > 0) {
            popupContent += `<small style="color: #f87171;">${stressIndicators.slice(0, 2).join(', ')}</small>`
          }
          
          popupContent += `</div>`
        }
        
        popupContent += `</div>`
        
        const marker = L.marker([r.latitude, r.longitude], { icon })
          .bindPopup(popupContent)

        marker.addTo(markersRef.current!)
      })
    })
  }, [reports])

  // FOCUS SELECTED
  useEffect(() => {
    if (!mapRef.current || !selectedReport) return
    mapRef.current.setView(
      [selectedReport.latitude, selectedReport.longitude],
      15
    )
  }, [selectedReport])

  return <div ref={containerRef} className="w-full h-full" />
}
