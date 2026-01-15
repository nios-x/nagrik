import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import { checkRepeatedReports } from "@/utils/checker";
import { generateIncidentSummary } from "@/utils/aireports";
import { sendAlertEmail } from "@/utils/emergencymailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      keyword,
      description,
      category = "OTHER",
      severity = "LOW",
      latitude,
      longitude,
      source = "VOICE",
      speechStressData, // Optional speech stress data
    } = body;

    if (!keyword || !description || !latitude || !longitude) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    console.log("speechStressData", speechStressData)
    const report = await prisma.report.create({
      data: {
        keyword,
        description,
        category,
        severity,
        latitude,
        longitude,
        source,
        // @ts-ignore
        speechStressData: speechStressData ? {
          create: {
            wordsPerSecond: speechStressData.wordsPerSecond || 0,
            repeatedWords: speechStressData.repeatedWords || 0,
            pauseCount: speechStressData.pauseCount || 0,
            averagePauseDuration: speechStressData.averagePauseDuration || 0,
            confidence: speechStressData.confidence || 0,
            stressIndicators: JSON.stringify(speechStressData.stressIndicators || []),
          },
        } : undefined,
      },
      
      include: {
        speechStressData: true,
      },
    });
    const repeatedReports = await checkRepeatedReports(report)

    if (repeatedReports) {
      try {
        // Include current report in the cluster for email and summary
        const allReportsInCluster = [report, ...repeatedReports]
        const summary = await generateIncidentSummary(allReportsInCluster)
        await sendAlertEmail({ summary: summary || "", reports: allReportsInCluster })
        
        // Mark all reports in the cluster as resolved (including the current one)
        const reportIds = [report.id, ...repeatedReports.map(r => r.id)]
        await prisma.report.updateMany({
          where: {
            id: { in: reportIds }
          },
          data: {
            isResolved: true
          }
        })
        console.log(`Marked ${reportIds.length} reports as resolved`)
      } catch (emailError) {
        // Log but don't fail the request if email/AI summary fails
        console.error("Failed to process alert notification:", emailError)
      }
    }

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (err) {
    console.error("REPORT API ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
