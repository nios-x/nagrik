import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

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
    });

    // Convert Prisma enums to UI-friendly lowercase
    const formatted = reports.map((r) => ({
      ...r,
      severity: r.severity.toLowerCase(),
      category: r.category,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("REPORTS API ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
