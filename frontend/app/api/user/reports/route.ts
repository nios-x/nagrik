import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/utils/db"

// Haversine distance (km)
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

const severityWeight: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const lat = Number(searchParams.get("lat"))
  const lng = Number(searchParams.get("lng"))

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Latitude and longitude are required" },
      { status: 400 }
    )
  }

  // Fetch recent reports (limit for performance)
  const reports = await prisma.report.findMany({
    where: {
      isResolved: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  })

  // Compute distance + shape response
  const enriched = reports.map((r) => {
    const distance = getDistance(lat, lng, r.latitude, r.longitude)

    return {
      id: r.id,
      category: r.category,
      severity: r.severity,
      description: r.description,
      createdAt: r.createdAt,
      isResolved: r.isResolved,
      distance,
      severityScore: severityWeight[r.severity] || 0,
    }
  })

  // Sort: severity → distance → time
  enriched.sort((a, b) => {
    if (b.severityScore !== a.severityScore)
      return b.severityScore - a.severityScore

    if (a.distance !== b.distance) return a.distance - b.distance

    return (
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
    )
  })

  // Final clean response
  return NextResponse.json(
    enriched.map(({ severityScore, ...rest }) => rest)
  )
}
