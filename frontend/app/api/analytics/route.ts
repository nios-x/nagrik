import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      select: {
        category: true,
        createdAt: true,
        // @ts-ignore - Prisma client will include this after regeneration
        speechStressData: {
          select: {
            confidence: true,
            wordsPerSecond: true,
            repeatedWords: true,
            pauseCount: true,
            averagePauseDuration: true,
            stressIndicators: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // CATEGORY AGGREGATION
    const categoryMap: Record<string, number> = {};
    reports.forEach((r) => {
      categoryMap[r.category] = (categoryMap[r.category] || 0) + 1;
    });

    const categoryData = Object.entries(categoryMap).map(
      ([name, count]) => ({ name, count })
    );

    // TIME SERIES (per hour)
    const timeMap: Record<number, number> = {};
    reports.forEach((r) => {
      const hour = new Date(r.createdAt).getHours();
      timeMap[hour] = (timeMap[hour] || 0) + 1;
    });

    const timeSeriesData = Object.entries(timeMap)
      .map(([hour, count]) => ({
        hour: Number(hour),
        count,
        time: `${hour}:00`,
      }))
      .sort((a, b) => a.hour - b.hour);

    // SPEECH STRESS ANALYTICS
    const reportsWithStress = reports.filter((r:any) => r.speechStressData);
    const stressStats = {
      totalAnalyzed: reportsWithStress.length,
      averageConfidence: reportsWithStress.length > 0
        ? Math.round(reportsWithStress.reduce((sum, r:any) => sum + (r.speechStressData?.confidence || 0), 0) / reportsWithStress.length)
        : 0,
      averageWordsPerSecond: reportsWithStress.length > 0
        ? Math.round((reportsWithStress.reduce((sum, r:any) => sum + (r.speechStressData?.wordsPerSecond || 0), 0) / reportsWithStress.length) * 10) / 10
        : 0,
      highStressCount: reportsWithStress.filter((r:any) => (r.speechStressData?.confidence || 0) >= 60).length,
      confidenceDistribution: {
        low: reportsWithStress.filter((r:any) => (r.speechStressData?.confidence || 0) < 40).length,
        medium: reportsWithStress.filter((r:any) => (r.speechStressData?.confidence || 0) >= 40 && (r.speechStressData?.confidence || 0) < 60).length,
        high: reportsWithStress.filter((r:any) => (r.speechStressData?.confidence || 0) >= 60).length,
      },
      wordsPerSecondRanges: {
        slow: reportsWithStress.filter((r:any) => (r.speechStressData?.wordsPerSecond || 0) < 1.5).length,
        normal: reportsWithStress.filter((r:any) => (r.speechStressData?.wordsPerSecond || 0) >= 1.5 && (r.speechStressData?.wordsPerSecond || 0) < 3.0).length,
        fast: reportsWithStress.filter((r:any) => (r.speechStressData?.wordsPerSecond || 0) >= 3.0).length,
      },
    };

    return NextResponse.json({
      totalReports: reports.length,
      categoryData: categoryData.length > 0 ? categoryData : [],
      timeSeriesData: timeSeriesData.length > 0 ? timeSeriesData : [],
      lastReportAt:
        reports.length > 0
          ? reports[reports.length - 1].createdAt
          : null,
      speechStressStats: stressStats.totalAnalyzed > 0 ? stressStats : undefined,
    });
  } catch (err) {
    console.error("ANALYTICS API ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
