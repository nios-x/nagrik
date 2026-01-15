import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

export async function GET() {
  try {
    const [
      totalReports,
      criticalAlerts,
      inProgress,
      recentReports,
      speechStressStats,
    ] = await Promise.all([
      prisma.report.count(),

      prisma.report.count({
        where: { severity: "HIGH" },
      }),

      prisma.report.count({
        where: { isResolved: false },
      }),

      prisma.report.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          keyword: true,
          description: true,
          createdAt: true,
          //@ts-ignore
          speechStressData: { 
            select: {
              confidence: true,
              wordsPerSecond: true,
              stressIndicators: true,
            },
          },
        },
      })
      ,

      // Get speech stress statistics
      (async () => {
        // @ts-ignore - Prisma client will include this after regeneration
        const allStressData = await prisma.speechStressData.findMany({
          select: {
            confidence: true,
            wordsPerSecond: true,
            repeatedWords: true,
            pauseCount: true,
            averagePauseDuration: true,
            stressIndicators: true,
          },
        });

        if (allStressData.length === 0) {
          return {
            averageConfidence: 0,
            highStressReports: 0,
            averageWordsPerSecond: 0,
            totalAnalyzed: 0,
            commonIndicators: [],
          };
        }

        const totalAnalyzed = allStressData.length;
        const averageConfidence = allStressData.reduce((sum: number, d: { confidence: number }) => sum + d.confidence, 0) / totalAnalyzed;
        const highStressReports = allStressData.filter((d: { confidence: number }) => d.confidence >= 60).length;
        const averageWordsPerSecond = allStressData.reduce((sum: number, d: { wordsPerSecond: number }) => sum + d.wordsPerSecond, 0) / totalAnalyzed;

        // Extract and count common stress indicators
        const indicatorCounts = new Map<string, number>();
        allStressData.forEach((data: { stressIndicators: string }) => {
          try {
            const indicators = JSON.parse(data.stressIndicators) as string[];
            indicators.forEach(indicator => {
              // Extract the main indicator type (e.g., "Rapid speech" from "Rapid speech (3.5 wps)")
              const mainType = indicator.split('(')[0].trim();
              indicatorCounts.set(mainType, (indicatorCounts.get(mainType) || 0) + 1);
            });
          } catch (e) {
            // Ignore parse errors
          }
        });

        const commonIndicators = Array.from(indicatorCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([indicator, count]) => ({ indicator, count }));

        return {
          averageConfidence: Math.round(averageConfidence),
          highStressReports,
          averageWordsPerSecond: Math.round(averageWordsPerSecond * 10) / 10,
          totalAnalyzed,
          commonIndicators,
        };
      })(),
    ]);

    return NextResponse.json({
      totalReports,
      criticalAlerts,
      inProgress,
      recentReports: recentReports || [],
      speechStressStats: speechStressStats || {
        averageConfidence: 0,
        highStressReports: 0,
        averageWordsPerSecond: 0,
        totalAnalyzed: 0,
        commonIndicators: [],
      },
    });
  } catch (err) {
    console.error("DASHBOARD API ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
