import { prisma } from "@/utils/db"
import { Report } from "@prisma/client"

export async function checkRepeatedReports(report: Report) {
  const recentReports = await prisma.report.findMany({
    where: {
      id: { not: report.id }, // Exclude the current report
      category: report.category,
      isResolved: false,
      createdAt: {
        gte: new Date(Date.now() - 30 * 60 * 1000), // last 30 mins
      },
      latitude: {
        gte: report.latitude - 0.002,
        lte: report.latitude + 0.002,
      },
      longitude: {
        gte: report.longitude - 0.002,
        lte: report.longitude + 0.002,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  })

  return recentReports.length >= 3 ? recentReports : null
}
