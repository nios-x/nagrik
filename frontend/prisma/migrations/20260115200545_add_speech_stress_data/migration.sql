-- CreateTable
CREATE TABLE "SpeechStressData" (
    "id" TEXT NOT NULL,
    "wordsPerSecond" DOUBLE PRECISION NOT NULL,
    "repeatedWords" INTEGER NOT NULL,
    "pauseCount" INTEGER NOT NULL,
    "averagePauseDuration" DOUBLE PRECISION NOT NULL,
    "confidence" INTEGER NOT NULL,
    "stressIndicators" TEXT NOT NULL,
    "reportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeechStressData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpeechStressData_reportId_key" ON "SpeechStressData"("reportId");

-- CreateIndex
CREATE INDEX "SpeechStressData_reportId_idx" ON "SpeechStressData"("reportId");

-- CreateIndex
CREATE INDEX "SpeechStressData_confidence_idx" ON "SpeechStressData"("confidence");

-- CreateIndex
CREATE INDEX "SpeechStressData_createdAt_idx" ON "SpeechStressData"("createdAt");

-- AddForeignKey
ALTER TABLE "SpeechStressData" ADD CONSTRAINT "SpeechStressData_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
