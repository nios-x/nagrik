import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/db";

/**
 * Early Warning API
 * 
 * Receives stress indicators from speech analysis and creates
 * early warning reports before explicit threats are stated.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      confidence,
      stressIndicators,
      wordsPerSecond,
      repeatedWords,
      pauseCount,
      latitude,
      longitude,
      description = "Early warning: Distress detected through speech patterns",
    } = body;

    if (!latitude || !longitude || confidence === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: latitude, longitude, confidence" },
        { status: 400 }
      );
    }

    // Determine severity based on confidence score
    let severity: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (confidence >= 80) {
      severity = "HIGH";
    } else if (confidence >= 60) {
      severity = "MEDIUM";
    }

    // Create detailed description with stress indicators
    const detailedDescription = `
Early Warning Alert - Distress Detected

Confidence Score: ${confidence}%

Stress Indicators:
${stressIndicators.map((indicator: string) => `• ${indicator}`).join("\n")}

Speech Metrics:
• Speaking Speed: ${wordsPerSecond.toFixed(2)} words/second
• Repeated Words: ${repeatedWords}
• Pause Count: ${pauseCount}

This alert was triggered based on speech pattern analysis before any explicit threat keywords were detected.
    `.trim();

    const report = await prisma.report.create({
      data: {
        keyword: "EARLY_WARNING",
        description: detailedDescription,
        category: "OTHER",
        severity,
        latitude,
        longitude,
        source: "AI", // Mark as AI-generated early warning
      },
    });

    return NextResponse.json(
      {
        success: true,
        report,
        message: "Early warning alert created",
        confidence,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("EARLY WARNING API ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
