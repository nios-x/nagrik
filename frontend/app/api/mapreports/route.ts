import { NextResponse } from "next/server"
import { prisma } from "@/utils/db"

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        keyword: true,
        category: true,
        description: true,
        latitude: true,
        longitude: true,
        severity: true,
        createdAt: true,
        // @ts-ignore
        speechStressData: {
          select: {
            wordsPerSecond: true,
            repeatedWords: true,
            pauseCount: true,
            averagePauseDuration: true,
            confidence: true,
            stressIndicators: true,
          },
        },
      },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error("REPORTS API ERROR:", error)
    return NextResponse.json(
      { error: "Failed to load reports" },
      { status: 500 }
    )
  }
}
