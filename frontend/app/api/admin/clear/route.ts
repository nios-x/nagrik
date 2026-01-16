import { NextResponse } from "next/server"
import { prisma } from "@/utils/db"

export async function DELETE() {
  try {
    await prisma.$transaction([
      prisma.speechStressData.deleteMany({}),
      prisma.report.deleteMany({}),
    ])

    return NextResponse.json({
      success: true,
      message: "All reports cleared successfully",
    })
  } catch (error) {
    console.error("Clear admin data failed:", error)

    return NextResponse.json(
      { success: false, message: "Failed to clear data" },
      { status: 500 }
    )
  }
}
